const repom = {
  official: [
    {
      type: "v3",
      title: "freedeck.app",
      url: "https://releases.freedeck.app/index.json",
      channel: "main",
    },
  ],
  unofficial: [],
  getLegacyRepository,
  getV3Repository,
};

async function getV3Repository(repoData) {
  const plugins = [];
  const res = await fetch(`${repoData.url}?time=${Date.now()}` ).catch((err) => {
    return err;
  });
  const data = await res.json();
  if (!data.channels[repoData.channel])
    return { err: true, msg: `Channel ${repoData.channel} not found.` };
  const channel = data.channels[repoData.channel];
  let catalog = channel.catalog;

  if(channel.type === "repository_external") {
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

async function getLegacyRepository(url) {
  return new Promise((_resolve, reject) => {
    const _plugins = [];
    const res = fetch(url)
      .catch((err) => {
        reject(err);
      })
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        if (!data.includes(",!"))
          reject({ err: true, msg: "No plugin metadata found." });
        let lines = data.split("\n");
        lines.shift();
        lines = lines.filter((line) => line.length > 0);
        for (const line of lines) {
          const comma = line.split(",!");
          const meta = {
            file: comma[0],
            githubRepo: `https://github.com/${comma[1]}`,
            name: comma[2],
            author: comma[3],
            version: comma[4],
            description: comma[5],
            id: comma[6],
          };
          _plugins.push(meta);
        }
        _resolve(_plugins);
      });

  });
}

export default repom;
