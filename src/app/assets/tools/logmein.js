// eslint-disable-next-line no-undef
const socket = io()

addToHTMLlog('Waiting for server to respond to login request continuation')
socket.on('server_connected', function () {
  addToHTMLlog('Connected! Requesting login as ' + localStorage.getItem('_sdsid') + '!')
  // eslint-disable-next-line no-undef
  loaded = true
  socket.emit('c2sr_login_cont', localStorage.getItem('_sdsid'))
  // document.getElementById('loading').style.display = "none"
})
socket.on('hiuser', function (s) {
  addToHTMLlog('Loading login form..')
  setTimeout(() => {
    document.getElementById('loading').style.display = 'none'
    document.getElementById('sdl').innerText = localStorage.getItem('_sdl')
    document.getElementById('yn').innerText = localStorage.getItem('_sdyn')
    document.getElementById('login').style.display = 'block'
  }, 500)
})
socket.on('s2cs_login', (sessionID, g) => {
  // This session ID is actually kinda important
  localStorage.setItem('_sdsession', sessionID)
  window.location.href = g
})

function addToHTMLlog (text) {
  document.getElementById('console').innerText += text + '\n'
}

// eslint-disable-next-line no-unused-vars
function submit () {
  socket.emit('c2sd_login', document.getElementById('password').value)
}
