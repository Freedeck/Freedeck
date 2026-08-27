const setupMenu = () => {
  const logoMnu = document.querySelector(".logo-menu");
  logoMnu.style.display = 'block'
  const overBtn = document.querySelector("#overlay-btn");
  const overMnu = document.querySelector("#menu")

  overBtn.onclick = () => {
    const dsp = overMnu.style.display;
    if (dsp == 'flex') {
      overMnu.style.display = 'none'
    } else {
      overMnu.style.display = 'flex'
      overMnu.style.animationName = 'open-menu'
    }
  }
}

export {
  setupMenu
}