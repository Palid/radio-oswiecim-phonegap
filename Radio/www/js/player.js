(function(window, document, $, moment) {
  "use strict";

  function onDeviceReady() {

    var AUDIO_URL = "http://radia2.inten.pl:8054/";
    var LISTENING_STATUS = "http://lpu24.pl/radio/rds.json";

    // Audio player
    var media = {
      loading: false,
      playing: false,
      player: undefined,
      timer: 0,
      timerInterval: null,
      currentlyPlaying: {
        author: "",
        title: "",
        total: ""
      },
      background: {
        album: "",
        image: ""
      }
    };

    var ui = {
      controller: $(".audio--controller"),
      date: $(".navbar--date"),
      dateListening: $(".date--listening"),
      currentlyListening: $(".currently-listening"),
      background: $(".audio--background"),
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
        var now = resp.teraz;
        if (media.currentlyPlaying.author !== now.wykonawca || media.currentlyPlaying.title !== now.tytul) {
          media.currentlyPlaying.author = now.wykonawca;
          media.currentlyPlaying.title = now.tytul;
          media.currentlyPlaying.total = media.currentlyPlaying.author + " - " + media.currentlyPlaying.title;
          ui.currentlyListening.text(media.currentlyPlaying.total);
        }
        if (media.background.album !== now.album || media.background.image !== now.okladka) {
          media.background.album = now.album;
          media.background.image = now.okladka;
          ui.background.attr("src", media.background.image).attr("alt", media.background.album);
        }

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
    function onError( /*error*/ ) {
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
            $("#internet-modal").modal();
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
        createAudio();
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
