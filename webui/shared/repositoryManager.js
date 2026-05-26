const repom = {
	official: [
		{
			title: "freedeck.app",
			url: "https://releases.freedeck.app/index.json",
			channel: "main",
		},
	],
	unofficial: [],
	getRepository,
};

async function getRepository(repoData) {
	const plugins = [];
	const res = await fetch(`${repoData.url}?time=${Date.now()}`).catch((err) => {
		return err;
	});
	const data = await res.json();
	if (!data.channels[repoData.channel])
		return { err: true, msg: `Channel ${repoData.channel} not found.` };
	const channel = data.channels[repoData.channel];
	let catalog = channel.catalog;

	if (channel.type === "repository_external") {
		const res = await fetch(channel.catalog).catch((err) => {
			return err;
		});
		catalog = await res.json();
	}

	for (const id in catalog) {
		const meta = catalog[id];
		meta.id = id;
		plugins.push(meta);
	}

	return { ...channel, plugins };
}

export default repom;
