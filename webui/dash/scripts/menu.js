const setupMenu = () => {
  const logoMnu = document.querySelector(".logo-menu");
  logoMnu.style.display = 'block'
  const overBtn = document.querySelector("#overlay-btn");
  const overMnu = document.querySelector("#menu")

  overBtn.onclick = () => {
    const dsp = overMnu.style.display;
    if (dsp == 'flex') {
      overBtn.style.filter = 'opacity(0)';
      overMnu.style.animationName = 'close-menu'
      overMnu.style.filter = 'opacity(0.5)'
      setTimeout(() => {
        overMnu.style.display = 'none'
      },498);
    } else {
      overMnu.style.display = 'flex'
      overMnu.style.animationName = 'open-menu'
      overMnu.style.filter = 'opacity(1)'
      overBtn.style.filter = 'opacity(1)';
    }
  }
  
	if (navigator.userAgent.includes("FDMobile")) {
		document.querySelector(".iosappsettings").style.display = "block";
	} else {
		document.querySelector(".iosappsettings").style.display = "none";
	}
}

export {
  setupMenu
}