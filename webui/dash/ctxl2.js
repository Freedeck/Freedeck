/**
 * [contextual.js]{@link https://github.com/ia74/contextual}
 * @author ia74
 * @version 2.0.0
 */
const ctxl = {
	view_container: "#ctxl-view-cont",
	as: "html",
	version: "2.0.0",
	loadingHTML: "Loading a view...",
	views: [],
	addView: (view) => {
		if (!ctxl.views.includes(view)) ctxl.views.push(view);
	},
	generateView: (view) => {
		if (!ctxl.views.includes(view)) {
			console.log(`View ${view} not found.`);
			const ele = document.createElement("p");
			ele.innerText = `View ${view} not found.`;
			return ele;
		}
		if (document.querySelectorAll(`script[ctxl-id="${view}"]`).length > 0) {
			for (const script of document.querySelectorAll(
				`script[ctxl-id="${view}"]`,
			)) {
				script.remove();
			}
		}
		const view_html = document.createElement(ctxl.as);
		view_html.setAttribute("ctxl-id", view);
		view_html.innerHTML = ctxl.loadingHTML;
		fetch(`${view}.${ctxl.as}`)
			.then((response) => response.text())
			.then((data) => {
				view_html.innerHTML = data;
			})
			.then(async () => {
				await ctxl.processViewScripts(view_html, view);
			});
		return view_html;
	},
	processViewScripts: async (view_html, view) => {
		const scripts = view_html.getElementsByTagName("script");

		for (let i = 0; i < scripts.length; i++) {
			const original = scripts[i];
			const handleAsCjs = original.hasAttribute("ctxl-cjs");
			const handleAsExternalImport = original.hasAttribute("ctxl-import");
			const block = original.hasAttribute("ctxl-block");

			const script = document.createElement("script");
			script.type = handleAsCjs ? "" : "module";
			script.classList.add("ctxl-view-script");
			script.setAttribute("ctxl-id", view);

			if (handleAsExternalImport) {
				script.src = original.src;
			} else {
				script.text = original.text;
			}

			if (block) {
				await new Promise((resolve, reject) => {
					script.onload = resolve;
					script.onerror = reject;
					document.body.appendChild(script);
				});
			} else {
				document.body.appendChild(script);
			}
		}
	},
	opened: [],
	createViewContainer: () => {
		const view_container = document.createElement("div");
		view_container.id = ctxl.view_container.split("#")[1];
		return view_container;
	},
	nonDestructiveView: (view) => {
		ctxl.forceViewContainer();
		const lookupExistingView = document.querySelector(
			`${ctxl.as}[ctxl-id="${view}`,
		);
		const nView = ctxl.generateView(view);
		if (lookupExistingView)
			ctxl.viewContainer().replaceChild(lookupExistingView, nView);
		else ctxl.viewContainer().appendChild(nView);
		ctxl.opened.push(view);
		return nView;
	},
	destructiveView: (view) => {
		ctxl.forceViewContainer();
		ctxl.viewContainer().innerHTML = "";
		ctxl.viewContainer().appendChild(ctxl.generateView(view));
		ctxl.opened = [view];
	},
	forceViewContainer: () => {
		if (!document.querySelector(ctxl.view_container))
			document.body.appendChild(ctxl.createViewContainer());
	},
	viewContainer: () => document.querySelector(ctxl.view_container),
	reloadView: (view) => {
		ctxl.forceViewContainer();
		if (ctxl.onclose[view]) ctxl.onclose[view]();
		if (ctxl.onclose[view]) delete ctxl.onclose[view];
		const scripts = document.querySelectorAll(`script[ctxl-id="${view}"]`);
		for (let i = 0; i < scripts.length; i++) {
			scripts[i].remove();
		}
		ctxl
			.viewContainer()
			.replaceChild(
				ctxl.generateView(view),
				document.querySelector(`${ctxl.as}[ctxl-id="${view}"]`),
			);
	},
	waitForClose: async (view) =>
		new Promise((resolve, reject) => {
			const interval = setInterval(() => {
				if (
					!document.querySelector(`${ctxl.as}[ctxl-id="${view}"]`) &&
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
		document.querySelector(`${ctxl.as}[ctxl-id="${view}"]`).remove();
		ctxl.opened = ctxl.opened.filter((v) => v !== view);
	},
};

export default ctxl;
