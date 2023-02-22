let touchstartX = 0
let touchendX = 2500

function checkDirection() {
    if (touchendX < touchstartX) {
        // go page up
        if (Pages[currentPage + 1]) {
            loadPage(currentPage + 1)
        } else {
        }
    }
    if (touchendX > touchstartX) {
        // go page down
        if (Pages[currentPage - 1]) {
            loadPage(currentPage - 1)
        } else {
        }
    }
}

document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX
})

document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX
    checkDirection()
})