const eventNames = {
  client_greet: 'G',
  information: 'I',
  keypress: 'K',
  login: {
    login_data: 'lD',
    login: 'lL',
    login_data_ack: 'lDA',
  },
  default: {
    no_init_info: 'dNI',

    not_trusted: 'dtF',
    not_auth: 'daCF',
    not_match: 'daMF',
    set_theme: 'dT',

    notif: 'dN',

    log: 'dL',

    plugin_info: 'dP',

    channel_send: 'dcO',
    channel_listening: 'dcI',
    reload: 'dR',
    recompile: 'dC',
  },

  companion: {
    conn_fail: 'cF',
    new_key: 'ckN',
    del_key: 'ckD',
    edit_key: 'ckE',
    move_key: 'ckM',
    set_profile: 'cpS',
    add_profile: 'cpA',
    dup_profile: 'cpD',
  },

};

if ('exports' in module) module.exports = eventNames;
