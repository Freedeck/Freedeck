const fetchReleaseNotes = async (version) => {
	try {
		const tag = version.startsWith("v") ? version : `v${version}`;

		let res = await fetch(
			`https://api.github.com/repos/freedeck/freedeck/releases/tags/${tag}`,
			{
				headers: { "User-Agent": "Freedeck" },
			}
		);

		if (!res.ok) {
			res = await fetch(
				"https://api.github.com/repos/freedeck/freedeck/releases/latest",
				{
					headers: { "User-Agent": "Freedeck" },
				}
			);
		}

		if (!res.ok) return null;
		const data = await res.json();
		return data.body;
	} catch (e) {
		console.error("Failed to fetch release notes from GitHub:", e);
		return null;
	}
};

const renderMarkdown = (markdown) => {
	if (!markdown) return "";

	return markdown
		.replace(/^### (.*$)/gim, "<h3 style='margin: 8px 0 4px 0;'>$1</h3>")
		.replace(/^## (.*$)/gim, "<h2 style='margin: 10px 0 4px 0;'>$1</h2>")
		.replace(/^# (.*$)/gim, "<h1 style='margin: 12px 0 4px 0;'>$1</h1>")
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.*?)\*/g, "<em>$1</em>")
		.replace(/^\s*[\-\*]\s+(.*$)/gim, "<li>$1</li>")
		.replace(/(<li>.*<\/li>)/gs, "<ul style='padding-left: 20px; margin: 4px 0;'>$1</ul>")
		.replace(/\n(\n)?/g, (match, doubleNewline) => doubleNewline ? "<br/>" : "<br>");
};

const makeThanks = async (force = false) => {
	if (!force) {
		if (
			universal.getServerFlags()["app.freedeck.last_changelog_viewed"] ===
			universal._information.version.raw
		)
			return;
		if (universal.load("has_setup") === "false") return;
	}

	const changelogMarkdown = await fetchReleaseNotes(
		universal._information.version.raw
	);

	const container = universal.UI.makeGenericModal(
		"Thank you for using Freedeck!",
		"A lot has changed since the previous update, so here are the changes.",
		[]
	);
	container.modal.id = "thanks";

	const content = container.content;

	const close = document.createElement("button");
	close.onclick = () => {
		universal.send(
			universal.events.default.server_flag_updated,
			setToLocalCfg(
				"app.freedeck.last_changelog_viewed",
				universal._information.version.raw
			)
		);
		container.close("welcome");
	};
	close.innerText = "OK";

	const changelogBody = document.createElement("div");
	changelogBody.className = "changelog-body";

	if (changelogMarkdown) {
		changelogBody.innerHTML = renderMarkdown(changelogMarkdown);
	} else {
		changelogBody.innerText = "Could not load release notes from GitHub.";
	}

	content.appendChild(changelogBody);

	const linebrak1 = document.createElement("p");
	linebrak1.innerHTML = 'As adapted from <a target="_blank" href="https://github.com/Freedeck/Freedeck/releases">the GitHub release.</a>'
	content.appendChild(linebrak1);

	const discord = document.createElement("a");
	discord.href = "https://discord.gg/7gWrgyt7Aa";
	discord.target = "_blank";
	discord.innerText = "Join our Discord!";

	content.appendChild(discord);

	const version = document.createElement("p");
	version.innerText = `Welcome to ${universal._information.version.human}.`;
	content.appendChild(version);

	const bb = document.createElement("br");
	content.appendChild(bb);

	content.appendChild(close);
	document.body.appendChild(container.modal);
	document.querySelector(".modal-title").style.textAlign = "center";
	document.querySelector(".modal-title").style.width = "100%";
	document.querySelector(".modal-description").style.textAlign = "center";
};

const setToLocalCfg = (key, value) => {
	const cfg = universal.getServerFlags();
	cfg[key] = value;
	return cfg;
};

export { makeThanks };
window._makeThanks = makeThanks;