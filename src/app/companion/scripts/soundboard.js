/* eslint-disable no-unused-vars, no-undef */
const keys = document.querySelector('#keys');
const Pages = {};
const q = [];
const countOnEachPage = 8;

universal.socket.on('server_connected', () => {
  universal.socket.emit('c-connected');
  document.querySelector('#console').style.display = 'none';
  if (universal.isInDebug === true) {
    Sounds.forEach(function (s) {
      document.querySelector('#keys').innerHTML += `<div><h3>${s.name}</h3><h4>${soundDir + s.path}</h4></div>`;
    });
  }
});

function volChanged () {
  const volumeSlider = document.querySelector('#out-vol');
  Susaudio._player.volume = volumeSlider.value;
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.volume = volumeSlider.value;
    audio.volume = Susaudio._player.volume;
  });
}

function pbrChanged () {
  const volumeSlider = document.querySelector('#out-pbr');
  Susaudio._player.pitch = volumeSlider.value;
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.pitch = volumeSlider.value;
    audio.playbackRate = Susaudio._player.pitch;
  });
}
