const editorDataContainer = document.querySelector("#editor-data");

/**
 * Load data into editor
 * @param {*} itm List of data objects (like {a:2,b:2})
 */
function loadData(itm) {
	editorDataContainer.innerHTML = "";
	for (const key of Object.keys(itm)) {
		const elem = document.createElement("input");
		elem.type = "text";
		elem.placeholder = key;
		elem.value = itm[key];
		elem.className = "editor-data";
		elem.id = key;
		const label = document.createElement("label");
		label.class = "editordata-removable";
		label.innerText = key;
		label.appendChild(elem);
		editorDataContainer.appendChild(label);
	}
}

function setTileData(key, value, int) {
	if (document.querySelector(`.editor-data#${key}`)) {
		document.querySelector(`.editor-data#${key}`).value = value;
	} else {
		const elem = document.createElement("input");
		elem.type = "text";
		elem.placeholder = key;
		elem.value = value;
		elem.className = "editor-data";
		elem.id = key;
		const label = document.createElement("label");
		label.class = "editordata-removable";
		label.innerText = key;
		label.appendChild(elem);
		document.querySelector("#editor-data").appendChild(label);
	}
	int.data[key] = value;
}

function getAllTileData() {
	const data = {};
	for (const elem of document.querySelectorAll(".editor-data")) {
		data[elem.id] = elem.value;
	}
	return data;
}

universal.loadEditorData = loadData;
universal.setTileData = setTileData;

export { loadData, setTileData, getAllTileData };
