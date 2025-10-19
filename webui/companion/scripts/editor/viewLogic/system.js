import EditorViewLogic from "./EditorViewLogic.js";
import { setTileData } from "../data.js";

const editorButton = document.querySelector("#editor-btn");
const systemSelect = document.querySelector("#system-select");
const type = document.querySelector("#type");

class System extends EditorViewLogic {
	constructor() {
		super("system", "fd.sys.volume", "fd.sys.volume.sys");

		this.setOnRun(({ interactionData }) => {
			universal.fdws.send("get_apps", "");
			universal.fdws.once("apps", (rawData) => {
				const data = rawData;
				const int = JSON.parse(editorButton.getAttribute("data-interaction"));
				systemSelect.innerHTML = "";

				for (const app of data) {
					const option = document.createElement("option");
					let friendly =
						app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
					if (app.name === "_fd.System") friendly = "System Volume";
					option.innerText = friendly;
					option.value = app.name;
					if (int.data?.app && int.data.app === app.name)
						option.selected = true;
					systemSelect.appendChild(option);
				}

				systemSelect.onchange = (e) => {
					const dt =
						e.srcElement.value !== "_fd.System"
							? "fd.sys.volume"
							: "fd.sys.volume.sys";
					type.value = dt;
					int.type = dt;
					int.renderType = "slider";
					setTileData("app", e.srcElement.value, int);
					setTileData("min", 0, int);
					setTileData("max", 100, int);
					setTileData("value", 50, int);
					setTileData("format", "%", int);
					setTileData("direction", "vertical", int);
					editorButton.setAttribute("data-interaction", JSON.stringify(int));
				};

				if (interactionData.type.startsWith("fd.sys.volume")) {
					systemSelect.value = interactionData.data.app;
				}
			});
		});

		this.setOnFirstSetup(() => {
			universal.fdws.send("get_apps", "");
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));

			int.type = "fd.sys.volume.sys";
			int.renderType = "slider";
			int.data.app = "_fd.System";
			int.data.min = 0;
			int.data.max = 100;
			int.data.value = 50;
			int.data.format = "%";
			int.data.direction = "vertical";
			editorButton.setAttribute("data-interaction", JSON.stringify(int));
			type.value = "fd.sys.volume.sys";
		});
	}
}

universal.listenFor("launch", () => {
	universal.fdws.on("apps", (rawData) => {
		const data = rawData;
		const int = JSON.parse(editorButton.getAttribute("data-interaction"));
		const select = document.querySelector("#system-select");
		select.innerHTML = "";

		for (const app of data) {
			const option = document.createElement("option");
			let friendly =
				app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
			if (app.name === "_fd.System") friendly = "System Volume";
			option.innerText = friendly;
			option.value = app.name;
			if (int?.data?.app && int.data.app === app.name) option.selected = true;
			select.appendChild(option);
		}

		select.onchange = (e) => {
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));
			const dt =
				e.srcElement.value !== "_fd.System"
					? "fd.sys.volume"
					: "fd.sys.volume.sys";
			document.querySelector("#type").value = dt;
			int.type = dt;
			int.renderType = "slider";
			setTileData("app", e.srcElement.value, int);
			setTileData("min", 0, int);
			setTileData("max", 100, int);
			setTileData("value", 50, int);
			setTileData("format", "%", int);
			setTileData("direction", "vertical", int);
			editorButton.setAttribute("data-interaction", JSON.stringify(int));
		};
	});
});

export default System;
