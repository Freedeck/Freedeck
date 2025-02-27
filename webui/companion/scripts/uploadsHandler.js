import { UI } from "../../client/scripts/ui";

export const UploadsType = {
	ICON: 0,
	SOUND: 1,
};

const onlySetIfExists = (sel, key, val) => {
	if (document.querySelector(sel)) {
		document.querySelector(sel)[key] = val;
	}
};

const getInteractionData = () => {
	if (!document.querySelector("#editor-btn[data-interaction]"))
		return { data: {} };
	return JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
};

universal._Uploads_New = (uploadsType = UploadsType.ICON) => {
	if (uploadsType === UploadsType.SOUND) {
		upload("audio/*,video/*", (data) => {
			UI.reloadProfile();
			const previousInteractionData = getInteractionData();
			previousInteractionData.data.file = data.newName;
			onlySetIfExists(
				"#editor-btn[data-interaction]",
				"dataset.interaction",
				JSON.stringify(previousInteractionData),
			);
			onlySetIfExists("#file.editor-data", "innerText", data.newName);
			onlySetIfExists("#path.editor-data", "innerText", "/sounds/");
			onlySetIfExists("#audio-file", "innerText", data.newName);
			// onlySetIfExists("#audio-path", "innerText", "/sounds/");
			universal.loadEditorData(previousInteractionData.data);
			universal.ctx.destructiveView("library");
			universal.sendToast(`Successfully uploaded ${data.newName}`, "Library");
		});
	} else if (uploadsType === UploadsType.ICON) {
		upload(
			"image/*",
			(data) => {
				UI.reloadProfile();
				const previousInteractionData = getInteractionData();
				previousInteractionData.data.icon = `/icons/${data.newName}`;
				onlySetIfExists(
					"#editor-btn[data-interaction]",
					"dataset.interaction",
					JSON.stringify(previousInteractionData),
				);
				onlySetIfExists(
					"#editor-btn",
					"style.backgroundImage",
					`url("${`/icons/${data.newName}`}")`,
				);
				universal.loadEditorData(previousInteractionData.data);
				universal.ctx.destructiveView("library");
				universal.sendToast(`Successfully uploaded ${data.newName}`, "Library");
			},
			"icon",
		);
	}
};

const upload = (accept, callback, type = "sound") => {
	// <iframe name="dummyFrame" id="dummyFrame" style="display: none;"></iframe>
	const dummyFrame = document.createElement("iframe");
	dummyFrame.style.display = "none";
	dummyFrame.id = "dummyFrame";
	dummyFrame.name = "dummyFrame";
	const form = document.createElement("form");
	form.method = "post";
	form.enctype = "multipart/form-data";
	form.action = `/api/upload/${type}`;
	form.target = "dummyFrame";
	form.style.display = "none";
	const fileUpload = document.createElement("input");
	fileUpload.type = "file";
	fileUpload.name = "file";
	fileUpload.accept = accept;
	fileUpload.style.display = "none";
	form.appendChild(fileUpload);
	fileUpload.click();
	fileUpload.onchange = () => {
		form.submit();
		dummyFrame.onload = () => {
			const content = dummyFrame.contentDocument;
			const data = JSON.parse(content.querySelector("pre").innerText);
			callback(data);
			form.remove();
			fileUpload.remove();
			setTimeout(() => {
				// Let data process
				dummyFrame.remove();
			}, 500);
		};
	};
	document.body.append(form);
	document.body.appendChild(dummyFrame);
};
