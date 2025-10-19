import changes from "./changes.json";

const makeThanks = (force = false) => {
	if (!force) {
		if (
			universal.getServerStyleFlags()["app.freedeck.last_changelog_viewed"] ===
			universal._information.version.raw
		)
			return;
		if (universal.load("has_setup") === "false") return;
	}
	const { major, other, known } = changes;

	const container = universal.UI.makeGenericModal(
		"Thank you for using Freedeck!",
		"A lot has changed since the previous update, so here are the changes.",
		[],
	);
	container.modal.id = "thanks";

	const content = container.content;

	const close = document.createElement("button");
	close.onclick = () => {
		universal.send(
			universal.events.default.serverStyleFlagUpdated,
			setToLocalCfg(
				"app.freedeck.last_changelog_viewed",
				universal._information.version.raw,
			),
		);
		container.close("welcome");
	};
	close.innerText = "OK";

	const majorDetails = document.createElement("details");
	const summaryMajor = document.createElement("summary");
	summaryMajor.innerText = "Major Changes";
	majorDetails.appendChild(summaryMajor);
	const majorList = document.createElement("ul");
	for (const m of major) {
		if (Array.isArray(m)) {
			makeNested(m, majorList);
		} else {
			const item = document.createElement("li");
			item.innerHTML = formatting(m);
			majorList.appendChild(item);
		}
	}
	majorDetails.appendChild(majorList);
	content.appendChild(majorDetails);

	const otherDetails = document.createElement("details");
	const summaryOther = document.createElement("summary");
	summaryOther.innerText = "Other Changes";
	otherDetails.appendChild(summaryOther);
	const otherList = document.createElement("ul");
	for (const o of other) {
		const item = document.createElement("li");
		item.innerHTML = formatting(o);
		otherList.appendChild(item);
	}
	otherDetails.appendChild(otherList);

	content.appendChild(otherDetails);

	const knownDetails = document.createElement("details");
	const summaryKnown = document.createElement("summary");
	summaryKnown.innerText = "Known Issues";
	knownDetails.appendChild(summaryKnown);
	const knownList = document.createElement("ul");
	for (const k of known) {
		const item = document.createElement("li");
		item.innerHTML = formatting(k);
		knownList.appendChild(item);
	}
	knownDetails.appendChild(knownList);

	content.appendChild(knownDetails);

	const linebrak1 = document.createElement("br");
	content.appendChild(linebrak1);

	const discord = document.createElement("a");
	discord.href = "https://discord.gg/7gWrgyt7Aa";
	discord.target = "_blank";
	discord.innerText = "Join our Discord!";

	content.appendChild(discord);

	const linebrak2 = document.createElement("br");
	content.appendChild(linebrak2);

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

const formatting = (data) => {
	const strong = /\*\*(.*?)\*\*/g;
	const em = /\*(.*?)\*/g;

	return data.replace(strong, "<strong>$1</strong>").replace(em, "<em>$1</em>");
};

const makeNested = (data, parent) => {
	for (const key in data) {
		const ul = document.createElement("ul");
		if (typeof data[key] === "object") {
			const details = document.createElement("details");
			const summary = document.createElement("summary");
			summary.innerText = key;
			details.appendChild(summary);
			const list = document.createElement("ul");
			makeNested(data[key], list);
			details.appendChild(list);
			ul.appendChild(details);
		} else {
			const item = document.createElement("li");
			item.innerHTML = formatting(data[key]);
			ul.appendChild(item);
		}
		parent.appendChild(ul);
	}
};

const setToLocalCfg = (key, value) => {
	const cfg = universal.getServerStyleFlags();
	cfg[key] = value;
	return cfg;
};

export { makeThanks };
window._makeThanks = makeThanks;
