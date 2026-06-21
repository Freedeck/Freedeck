const rawPacketData = {};
const crypto = require('node:crypto');

class DSPChannel {
  uuid;
  name;
  updateSelf = false;
  outgoing = [];
  incoming = [];

  constructor(uuid, name, updateSelf) {
    this.uuid = uuid;
    this.name = name;
    this.updateSelf = updateSelf;
  }

  addOutgoing(out) {
    this.outgoing.push(out);
  }

  addIncoming(_in) {
    this.incoming.push(_in);
  }

  update() {
    const snapshot = {
      uuid: this.uuid,
      name: this.name,
      outgoing: [...this.outgoing],
      incoming: [...this.incoming]
    };

    this.outgoing = [];
    this.incoming = [];

    return snapshot; 
  }
}

const DSP = {
  _data: rawPacketData,
  _lastUpdate: -1,
  updaters: [],
  updated: [],
  update() { 
    const nonce = crypto.randomUUID();
    this._lastUpdate = performance.now();
    
    this.updated = []; 

    for(const channel of this.updaters) {
      this.updated.push(channel.update());
    }

    return {
      nonce,
      updated: this._lastUpdate,
      channels: this.updated
    };
  },

  registerChannel(channel) {
    if (channel.updateSelf) {
      this.updaters.push(channel);
    }
  }
};

DSP._channel_fd0 = new DSPChannel(0, "low_speed", true);
DSP.registerChannel(DSP._channel_fd0);

DSP._channel_fd1 = new DSPChannel(1, "high_speed", true);
DSP.registerChannel(DSP._channel_fd1);

module.exports = DSP;