/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
currentAudio = "zone4";
audio.pause();
if (video != null) video.pause();
audio.src = "feest.mp3";
audio.play();
//countdown seconds
var birth = new Date(2019, 96, 2, 2, 0, 0, 0);
function countSecondsSinceBirth() {
  var now = new Date();
  var diff = Math.ceil((now - birth) / 1000);
  $("#secondsSinceBirth").text(diff);
  setTimeout(countSecondsSinceBirth, 1000);
}

$(document).ready(function () {
  setTimeout(countSecondsSinceBirth, 1000);
});
