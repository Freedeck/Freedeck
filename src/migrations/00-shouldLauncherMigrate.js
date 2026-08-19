const { existsSync, cpSync, writeFileSync } = require("fs");
const net = require("net");
const path = require("path");

const pipePath = '\\\\.\\pipe\\fd_app_handoff';

try {
  const client = net.createConnection({ path: pipePath }, () => {
    if (!process.cwd().includes("FreedeckApp") && existsSync(path.resolve(process.env.LOCALAPPDATA, 'FreedeckApp', 'freedeck'))) {
      const oldPath = path.resolve(process.env.LOCALAPPDATA, 'FreedeckApp', 'freedeck')
      if (existsSync(path.resolve(oldPath, "freedeck.migrated"))) return;
      const baseMainCfg = path.resolve('src/configs')
      const basePluginPath = path.resolve('plugins')

      cpSync(path.resolve(oldPath, baseMainCfg), path.resolve(baseMainCfg), { recursive: true })
      console.log(">> Copied over baseMainCfg")
      cpSync(path.resolve(oldPath, basePluginPath), path.resolve(basePluginPath), { recursive: true })
      console.log(">> Copied over basePlugin")
      writeFileSync(path.resolve(oldPath, "freedeck.migrated"), 0)
    }
  });
client.on('error', (err) => {console.log('Error',err) })
  setTimeout(() => {
    if (client) client.destroy()
  }, 20);
} catch (ignored) { }