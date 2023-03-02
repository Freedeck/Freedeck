// eslint-disable-next-line no-undef
const socket = io()
const keys = document.getElementById('keys')
let keyList = []
let loaded = false
let userAlive = true
let screensaverStatus = false
let currentPage = 0

addToHTMLlog('Waiting for host...')

socket.on('server_connected', function () {
  // _sdsession is session id
  addToHTMLlog('Connected! Checking for login status..')
  if (localStorage.getItem('_sdsession')) {
    socket.emit('Authenticated', localStorage.getItem('_sdsession'))
    addToHTMLlog('Success! You\'re logged in.')
    loaded = true
  } else {
    addToHTMLlog('Not logged in, requesting login')
    loaded = true
    localStorage.setItem('_sdsid', Math.random().toString().substring(2, 5))
    socket.emit('c2sr_login', localStorage.getItem('_sdsid'))
  }
})

socket.on('s2ca_login', function (s, c, n) {
  addToHTMLlog('Request received by server, let\'s log in.')
  localStorage.setItem('_sdl', c)
  localStorage.setItem('_sdyn', n)
  window.location.href = s
})

socket.on('greenlight', function () {
  document.getElementById('loading').style.display = 'none'
  loadPage(0)
})

socket.on('banish', function () {
  localStorage.setItem('_sdsession', '')
  document.getElementById('keys').remove()
  document.getElementById('loading').style.display = 'block'
  document.getElementById('loading').innerHTML = `<h1>Susdeck</h1>
  <p>Your session expired, please login again.</p>
  <button onclick="localStorage.setItem('_sdsession',''); window.location.replace(window.location.href)">Login</button>`
})

setInterval(function () {
  // Auto refresh, you shouldn't be waiting to connect for longer than 500ms.
  if (loaded) return
  addToHTMLlog('Connection attempt timed out. Retrying...')
  window.location.reload()
}, 500)

document.addEventListener('click', () => {
  if (userAlive === false) keys.style.opacity = '1'; screensaverStatus = false
  userAlive = true
})

// eslint-disable-next-line no-undef
setInterval(function () { userAlive = false }, ScreenSaverActivationTime * 1000)

setInterval(function () {
  if (!userAlive && !screensaverStatus) {
    keys.style.opacity = '0.125'
  }
// eslint-disable-next-line no-undef
}, ScreenSaverActivationTime * 1000 + 600)

setInterval(function () {
  if (!userAlive) {
    keys.style.opacity = '0'
    screensaverStatus = true
  }
// eslint-disable-next-line no-undef
}, ScreenSaverActivationTime * 1000 + 2 * 1000)

function addToHTMLlog (text) {
  document.getElementById('console').innerText += text + '\n'
}
function loadPage (pageNumber) {
  currentPage = pageNumber
  localStorage.setItem('_sdpage', currentPage)
  keyList = []
  const myNode = document.getElementById('keys')
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild)
  }
  // eslint-disable-next-line no-undef
  Pages[pageNumber].forEach(sound => {
    keyList.push(sound)
    const btn = document.createElement('button')
    btn.className = 'keypress btxt'
    if (sound.key) {
      btn.setAttribute('data-key', sound.key)
    } else {
      let txt = ''
      sound.keys.forEach(key => {
        txt += `{${key}}`
      })
      btn.setAttribute('data-key', txt)
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('assets/icons/" + sound.icon + "')"
    }
    btn.innerText = sound.name
    keys.appendChild(btn)
  })

  const stopall = document.createElement('button')
  stopall.onclick = () => { window.location.reload() }
  stopall.className = 'keypress btxt'
  stopall.innerText = 'Stop All'
  stopall.setAttribute('data-key', 'f19')
  const reloadbtn = document.createElement('button')
  reloadbtn.onclick = () => { window.location.reload() }
  reloadbtn.className = 'btxt'
  reloadbtn.innerText = 'Reload'
  const susdeck = document.createElement('a')
  susdeck.className = 'button'
  susdeck.style.backgroundImage = "url('assets/icons/susdeck.png')"
  keys.appendChild(stopall)
  keys.appendChild(reloadbtn)
  keys.appendChild(susdeck)
  const allKeypress = document.getElementsByClassName('keypress')
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onclick = (ev) => {
      // eslint-disable-next-line no-undef
      if (SoundOnPress) new Audio('assets/sounds/press.mp3').play()
      socket.emit('keypress', allKeypress[i].getAttribute('data-key'))
    }
  }
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('assets/scripts/service-worker.js')
  }
})

socket.on('c-change', () => { window.location.replace(window.location.href) })