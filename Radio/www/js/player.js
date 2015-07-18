(function(window, document, $, moment) {
  "use strict";

  function onDeviceReady() {

    var AUDIO_URL = "http://sluchaj.radiooswiecim.pl:8000/live";

    // Audio player
    var media = {
      loading: false,
      playing: false,
      player: undefined,
      timer: 0,
      timerInterval: null
    };

    var ui = {
      controller: $('.audio--controller'),
      date: $('.navbar--date'),
      dateListening: $('.date--listening')
    };

    function updateDate() {
      ui.date.text(moment().format('dddd[, ]HH:mm'));
    }

    // Set audio position
    function setAudioPosition(position) {
      var time = Math.floor(position);
      var newTime = moment.duration(time, 'seconds');
      newTime.locale('pl');
      media.timer = time;
      ui.dateListening.text(newTime.humanize());
    }

    function updateController() {
      var isPlaying = media.playing;
      ui.controller.toggleClass('glyphicon-pause', isPlaying);
      ui.controller.toggleClass('glyphicon-play', !isPlaying);
    };

    ui.controller.on('click', function(e) {
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


    // Play audio
    //
    function playAudio(src) {
      // Create Media object from src
      media.loading = true;
      media.player = new window.Media(src, onSuccess, onError);

      // Play audio
      media.player.play();
      media.playing = true;
      media.loading = false;
      updateController();

      // Update my_media position every second
      if (!media.timerInterval) {
        media.timerInterval = window.setInterval(function() {
          updateDate();
          media.player.getCurrentPosition(
            // success callback
            function(position) {
              if (position > -1) {
                setAudioPosition(position);
              }
            },
            $.noop
          );
        }, 1000);
      }
    }

    // onSuccess Callback
    function onSuccess() {
      media.loading = false;
      media.playing = true;
    }

    // onError Callback
    function onError(error) {
      media.loading = false;
      media.playing = false;
      window.clearInterval(media.timerInterval);
      media.timerInterval = null;
    }

    moment.locale('pl');
    updateDate();
    playAudio(AUDIO_URL);
    StatusBar.show();
  }
  // $(document).ready(function() {
  //   onDeviceReady();

  // });
  document.addEventListener("deviceready", onDeviceReady, false);


})(window, document, jQuery, moment);
