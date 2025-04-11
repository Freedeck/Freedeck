import { SidebarSection, SidebarSvgButton } from "../SidebarSection";
import { translationKey } from "../../../../shared/localization";

const style = new SidebarSection("Folders", "Profiles");

const newBtn = new SidebarSvgButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"New Folder",
		"Enter a name for the new folder",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the folder";
				return false;
			}
			universal.config.profiles[value] = [
				{
					"Back to Home": {
						type: "fd.profile",
						pos: 0,
						uuid: "fdc.0.0",
						data: { profile: "Default" },
					},
				},
			];
			universal.page = 0;
			universal.save("page", universal.page);
			universal.send(universal.events.companion.add_profile, value);
			universal.send(universal.events.companion.set_profile, value);
			const option = document.createElement("option");
			option.innerText = value;
			option.setAttribute("value", value);
			profileSelect.appendChild(option);
			return true;
		},
	);
}, "pf-add", "fnew.svg")

const dupBtn = new SidebarSvgButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"Duplicate Folder",
		"Enter a name for the new folder",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the folder";
				return false;
			}
			universal.send(universal.events.companion.dup_profile, value);
			return true;
		},
	);
}, "pf-dupe", "fdupe.svg")

const importBtn = new SidebarSvgButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"Import Folder",
		"Enter the folder data to import",
		(modal, pfData, feedback, title, button, input, content) => {
			try {
				const data = JSON.parse(pfData);
				window.UniversalUI.show.showEditModal(
					"Import Folder",
					"Enter a name for the new folder",
					(modal, value, feedback, title, button, input, content) => {
						if (value.length < 1) {
							feedback.innerText = "Please enter a name for the folder";
							return false;
						}
						universal.send(universal.events.companion.import_profile, {
							name: value,
							data,
						});
					},
				);
				return true;
			} catch (e) {
				feedback.innerText = "Invalid JSON data";
				return false;
			}
		},
	);
}, "pf-imp", "fimport.svg");

const exportBtn = new SidebarSvgButton("", ()=>{
  const profile = universal.config.profiles[universal.config.profile];
	const data = JSON.stringify(profile);
	const blob = new Blob([data], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${universal.config.profile}.json`;
	a.click();
	URL.revokeObjectURL(url);
}, "pf-exp", "fexport.svg")

const profileTxt = document.createElement("span");

const profileSelect = document.createElement("select");

let beingEdited = false;
function fix() {
	beingEdited = true;
	profileSelect.innerHTML = "";
	for (const profile of Object.keys(universal.config.profiles)) {
		const option = document.createElement("option");
		option.innerText = profile;
		option.setAttribute("value", profile);
		profileSelect.appendChild(option);
	}
	profileTxt.innerHTML = `Current Folder:&nbsp<i>${universal.cleanHTML(universal.config.profile)}</i>`;
	profileSelect.value = universal.config.profile;
	profileSelect.onkeydown = (e) => {
		return false;
	}
	profileSelect.onchange = () => {
		if(beingEdited) return;
		universal.page = 0;
		universal.save("page", universal.page);
		universal.send(universal.events.companion.set_profile, profileSelect.value);
	};
	beingEdited = false;
}
fix();
universal.listenFor("page_change", fix)
universal.listenFor("data_ready", fix)

universal.listenFor("profile", (data) => {
	profileTxt.innerHTML = `Current Folder:&nbsp<i>${universal.cleanHTML(data)}</i>`;
	profileSelect.value = data;
});

style.children.push({build:()=>profileTxt});

style.children.push({
  build: () => {
    const div = document.createElement("br");
    return div;
  }
});

style.children.push({
  build: () => {
    const div = document.createElement("div");
    div.classList.add("flex-wrap-r");
    div.appendChild(newBtn.build());
    div.appendChild(dupBtn.build());
    div.appendChild(importBtn.build());
    div.appendChild(exportBtn.build());
    return div;
  }
});

style.children.push({build:()=>profileSelect});

document.querySelector(".sidebar").appendChild(style.build());
