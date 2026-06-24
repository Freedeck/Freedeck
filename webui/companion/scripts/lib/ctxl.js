/**
 * [contextual.js]{@link https://github.com/ia74/contextual}
 * @author ia74
 * @version 1.1.p0
 */
const ctxl = {
	view_container: "#ctxl-view-cont",
	as: "html",
	version: "1.0.0",
	loadingHTML:
		"<div class='center-container'><div class='alc'><h1>Freedeck</h1><p>is loading a view...</p></div></div>",
	views: [],
	addView: (view) => {
		if (!ctxl.views.includes(view)) ctxl.views.push(view);
	},
	generateView: (view) => {
		if (!ctxl.views.includes(view)) {
			console.log(`View ${view} not found.`);
			return `<p>View ${view} not found.</p>`;
		}
		if (document.querySelectorAll(`.ctxv-${view}`).length > 0) {
			for (const script of document.querySelectorAll(`.ctxv-${view}`)) {
				script.remove();
			}
		}
		const view_html = document.createElement(ctxl.as);
		view_html.id = view;
		view_html.innerHTML = ctxl.loadingHTML;
		fetch(`./views/${view}.${ctxl.as}`)
			.then((response) => response.text())
			.then((data) => {
				view_html.innerHTML = data;
				universal.translatePage(view_html);
			})
			.then(() => {
				const scripts = view_html.getElementsByTagName("script");
				for (let i = 0; i < scripts.length; i++) {
					const script = document.createElement("script");
					script.type = "module";
					script.id = `${view}-script-${i}`;
					script.classList.add("ctxv_script");
					script.classList.add(`ctxv-${view}`);
					script.text = scripts[i].text;
					document.body.appendChild(script);
				}
			});
		return view_html;
	},
	opened: [],
	createViewContainer: () => {
		const view_container = document.createElement("div");
		view_container.id = ctxl.view_container.split("#")[1];
		return view_container;
	},
	nonDestructiveView: (view) => {
		if (!document.querySelector(ctxl.view_container))
			document.body.appendChild(ctxl.createViewContainer());
		if (document.querySelector(`#${view}`))
			document
				.querySelector(ctxl.view_container)
				.replaceChild(
					document.querySelector(`#${view}`),
					ctxl.generateView(view),
				);
		else
			document
				.querySelector(ctxl.view_container)
				.appendChild(ctxl.generateView(view));
		ctxl.opened.push(view);
	},
	reloadView: (view) => {
		if (!document.querySelector(ctxl.view_container))
			document.body.appendChild(ctxl.createViewContainer());
		if (ctxl.onclose[view]) ctxl.onclose[view]();
		if (ctxl.onclose[view]) delete ctxl.onclose[view];
		const scripts = document.querySelectorAll(`.ctxv-${view}`);
		for (let i = 0; i < scripts.length; i++) {
			scripts[i].remove();
		}
		document
			.querySelector(ctxl.view_container)
			.replaceChild(
				ctxl.generateView(view),
				document.querySelector(`#${view}`),
			);
	},
	destructiveView: (view) => {
		if (!document.querySelector(ctxl.view_container))
			document.body.appendChild(ctxl.createViewContainer());
		document.querySelector(ctxl.view_container).innerHTML = "";
		document
			.querySelector(ctxl.view_container)
			.appendChild(ctxl.generateView(view));
		ctxl.opened = [view];
	},
	waitForClose: async (view) =>
		new Promise((resolve, reject) => {
			const interval = setInterval(() => {
				if (
					!document.querySelector(`#${view}`) &&
					!ctxl.opened.includes(view)
				) {
					clearInterval(interval);
					resolve();
				}
			}, 100);
		}),
	onclose: {},
	closeView: (view) => {
		if (ctxl.onclose[view]) ctxl.onclose[view]();
		document.querySelector(`#${view}`).remove();
		ctxl.opened = ctxl.opened.filter((v) => v !== view);
	},
};

export default ctxl;
