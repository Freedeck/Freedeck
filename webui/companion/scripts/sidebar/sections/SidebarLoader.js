const modules = [
	"MobileDevice",
	"CurrentPage",
	"Soundboard",
	"Style",
	"Profiles",
	"Footer",
];

function loadModule(module) {
	return new Promise((resolve) => {
		const sidebar = document.querySelector(".sidebar");
		if (!sidebar) {
			console.error("Sidebar element not found");
			resolve();
			return;
		}

		const observer = new MutationObserver((mutations, obs) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (node.id === module) {
						universal.CLU("Boot / Sidebar", `Loaded sidebar module ${node.id}`);
						obs.disconnect();
						resolve();
						break;
					}
				}
			}
		});

		observer.observe(sidebar, { childList: true, subtree: true });

		import(`./${module}.js`).then((module) => {
			if (typeof module.default === "function") {
				module.default();
			}
		});
	});
}

async function loadModulesSequentially(modules) {
	for (const module of modules) {
		await loadModule(module);
	}
}

export default async function () {
	await loadModulesSequentially(modules);
}
