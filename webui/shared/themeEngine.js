const listing = [];
const listingData = {};
let currentTheme = ()=>{};

function getPathFor(id) {
	if(id.endsWith("#")) {
		return `/user-data/themes/${id.split("#")[0]}`;
	}
	return `/app/shared/theming/${id}`;
}

async function fetchAndParse(id) {
	const fetchable = await fetch(getPathFor(id));
	if (fetchable.status !== 200) {
		console.error(`Failed to fetch theme ${id}`);
		return universal.sendToast(`Failed to fetch theme ${id}`, "Freedeck");
	}
	const rawData = await fetchable.text();
	const meta = rawData.match(/:theme-meta {([\s\S]*?)}/);
	if (!meta) {
		universal.sendToast(`Failed to parse theme ${id}`, "Freedeck");
		return console.error(`Failed to parse theme ${id}`);
	}
	return await parseFor(id, meta[1]);
}

async function parseFor(id, string) {
	const theme = {};
	const metaLines = string.split("\n");
	for (const line of metaLines) {
		if (!line.trim()) continue;
		const [key, value] = line.trim().split(": ");
		theme[key.split("--")[1]] = value.split('";')[0].split('"')[1];
	}
	theme.raw = string;
	listingData[id] = theme;
	return theme;
}

async function initialize() {
  for(const t of universal._information.themes) {
    listing.push(t)
    universal.CLU("Boot / Theme Engine", `Added theme ${t}`);
  }
}

function setTheme(name, global = true) {
	const fu = listing.includes(name) ? name : "default.css";

	fetch(getPathFor(fu))
		.then((res) => res.text())
		.then(async (css) => {
			if(css.includes("Cannot GET")) {
				throw new Error(`Failed to get theme ${getPathFor(fu)}`);
			}
			const meta = css.match(/:theme-meta {([\s\S]*?)}/);
			const res = await parseFor(name, meta[1]);

			if (document.getElementById("theme")) {
				document.getElementById("theme").remove();
			}
			const stylea = document.createElement("style");
			stylea.id = "theme";
			stylea.innerText += css;
		
			document.body.appendChild(stylea);
			
			currentTheme = () => res;
			if (global) universal.send(universal.events.companion.set_theme, name);
			universal.save("theme", name);
		})
		.catch((e) => {
			console.error("Failed to load theme.",name,global,fu,e);
			universal.sendToast("Failed to load theme.", "Freedeck");
		});
}

export default {
	listing,
  listingData,
  initialize,
	fetchAndParse,
	setTheme,
  currentTheme
};
