const FDPlugin = require('../src/api/FDPlugin');

class examplePlugin extends FDPlugin {
  constructor () {
    super('Example Mod', 'Freedeck Api Example!', 'Freedeck.Plugins.Example');
  }

  onInitialize () {
    console.log('Initizliaing');
  }

  onEvent (data) {
    console.log('I GOT AN EVENT YIPPEE!!!!! DATA', data);
  }
}

module.exports = examplePlugin;