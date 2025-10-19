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

universal._Uploads_New = (
	uploadsType = UploadsType.ICON,
	closeAfter = false,
) => {
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
			universal.sendToast(`Successfully uploaded ${data.newName}`, "Library");

			if (!closeAfter) universal.ctx.destructiveView("library");
			else universal.vopen("index.html");
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

const upload = async (accept, callback, type = "sound") => {
	// Create an iframe for handling the upload
	const createDummyFrame = () => {
		const dummyFrame = document.createElement("iframe");
		dummyFrame.style.display = "none";
		dummyFrame.id = "dummyFrame";
		dummyFrame.name = "dummyFrame";
		document.body.appendChild(dummyFrame);
		return dummyFrame;
	};

	// Create a form for file upload
	const createForm = (accept, type) => {
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
		document.body.appendChild(form);

		return { form, fileUpload };
	};

	// Main upload logic
	try {
		const dummyFrame = createDummyFrame();
		const { form, fileUpload } = createForm(accept, type);

		fileUpload.click();

		fileUpload.onchange = () => {
			form.submit();

			dummyFrame.onload = () => {
				try {
					const content = dummyFrame.contentDocument;
					const preElement = content.querySelector("pre");
					if (!preElement) throw new Error("Invalid response format");

					const data = JSON.parse(preElement.innerText);
					callback(data);
				} catch (error) {
					console.error("Error processing upload response:", error);
					callback({ error: "Failed to process upload response" });
				} finally {
					// Cleanup
					form.remove();
					fileUpload.remove();
					setTimeout(() => dummyFrame.remove(), 500);
				}
			};
		};
	} catch (error) {
		console.error("Error during file upload:", error);
		callback({ error: "File upload failed" });
	}
};
