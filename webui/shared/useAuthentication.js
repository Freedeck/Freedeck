const universal = window.universal;

if (!HTMLElement.prototype.setHTML) {
	HTMLElement.prototype.setHTML = function (html) {
		this.innerHTML = html;
	};
}

const loginDialog = document.querySelector("#login-dialog")
const loginDiv = document.querySelector("#login-div")
const loginMsg = document.querySelector("#login-msg")
const passwd = document.querySelector("#password")

universal.listenFor("authpage", () => {
	universal.on(universal.events.login.login, (dat) => {
		if (dat === true) {
			if (passwd && passwd.value !== "") {
				universal.save("password", passwd.value);
			}
			universal.save("logintime", Date.now());
			loginDiv.style.opacity = "0";
			loginDialog.style.opacity = "0";
			setTimeout(() => {
				loginDialog.remove();
			}, 250);
			universal.send(universal.events.client_greet, universal._user)
		} else {
			loginMsg.setHTML("Password incorrect.");
			loginDialog.style.display = "flex";
			loginDiv.style.opacity = "1";
			loginDialog.style.opacity = "1";
		}
	});
	
	if (universal.load("password")) {
		universal.login(universal.load("password"));
	} else {
		loginDialog.style.display = "flex";
		loginDialog.style.opacity = "1";
		loginDiv.style.opacity = "1";
	}
});
