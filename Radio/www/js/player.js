(function(window, document, $, moment) {
  "use strict";


  function onDeviceReady() {

    var AUDIO_URL = "http://sluchaj.radiooswiecim.pl:8000/live";
    var LISTENING_STATUS = "http://radiooswiecim.pl/GetStatus.php";

    // Audio player
    var media = {
      loading: false,
      playing: false,
      player: undefined,
      timer: 0,
      timerInterval: null
    };

    var ui = {
      controller: $(".audio--controller"),
      date: $(".navbar--date"),
      dateListening: $(".date--listening"),
      currentlyListening: $(".currently-listening"),
      connectionModal: $("#internet-modal")
    };

    function isOnline() {
      var networkState = window.navigator.connection.type;

      return networkState !== window.Connection.NONE;
    }

    function updateDate() {
      ui.date.text(moment().format("dddd[, ]HH:mm"));
    }

    // Set audio position
    function setAudioPosition(position) {
      var time = Math.floor(position);
      var newTime = moment.duration(time, "seconds");
      newTime.locale("pl");
      media.timer = time;
      ui.dateListening.text(newTime.humanize());
    }

    function updateController() {
      var isPlaying = media.playing;
      ui.controller.toggleClass("glyphicon-pause", isPlaying);
      ui.controller.toggleClass("glyphicon-play", !isPlaying);
    }

    function updateCurrentlyListening() {
      $.get(LISTENING_STATUS).done(function(resp) {
        ui.currentlyListening.text(resp);
      });
    }

    ui.controller.on("click", function(e) {
      e.preventDefault();
      if (!media.loading) {
        if (media.playing) {
          media.player.pause();
          media.playing = false;
          updateController();
        } else {
          media.player.play();
          media.playing = true;
          updateController();
        }
      }
    });

    // onSuccess Callback
    function onSuccess() {
      media.loading = false;
      media.playing = true;
    }

    // onError Callback
    function onError( /* error */ ) {
      media.loading = false;
      media.playing = false;
      window.clearInterval(media.timerInterval);
      media.timerInterval = null;
    }

    function createAudio() {
      // Create Media object from src
      media.loading = true;
      media.player = new window.Media(AUDIO_URL, onSuccess, onError);

      // Play audio
      media.player.play();
      media.playing = true;
      media.loading = false;
      updateController();
    }

    // Play audio
    function playAudio() {
      createAudio();
      updateController();

      window.setTimeout(function() {
        if (!isOnline()) {
          ui.connectionModal.modal();
        }
      }, 1000);

      // Update my_media position every second
      if (!media.timerInterval) {
        media.timerInterval = window.setInterval(function() {
          updateDate();
          media.player.getCurrentPosition(
            // success callback
            function(position) {
              if (position > -1) {
                if (isOnline()) {
                  setAudioPosition(position);
                }
                updateCurrentlyListening();
              }
            },
            $.noop
          );
          if (!isOnline()) {
            media.playing = false;
            ui.connectionModal.modal();
          }
        }, 10000);
      }
    }

    ui.connectionModal.on("hide.bs.modal", function() {
      if (!isOnline()) {
        window.setTimeout(function() {
          ui.connectionModal.modal();
        }, 1000);
      } else {
        // Play audio
        media.player.pause();
        createAudio(AUDIO_URL);
        updateController();
      }
    });

    moment.locale("pl");
    updateDate();
    playAudio();
    updateCurrentlyListening();
  }
  document.addEventListener("deviceready", onDeviceReady, false);


})(window, document, jQuery, moment);
