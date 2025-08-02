const eventNames = {
	/* These shouldn't be changed */
	client_greet: 0x00,
	information: "I",
	/* These shouldn't be changed */ 

	keypress: "k",
	user_mobile_conn: "U",
	login: {
		login_data: "lD",
		login: "lL",
		login_data_ack: "lDA",
		session_validation_failure: "daMF",
		unauthorized: "daCF",
	},

	default: {		
		notif: "dN",

		reload: "dR",
		reload_sounds: "dRS",
		recompile: "dC",

		disable_plugin: "dBP",
		reload_single_plugin: "dRSP",
		enable_plugin: "dEP",
		update_plugins: "dUP",
		serverStyleFlagUpdated: "dCC",
		update_tile: "sU",
	},

	companion: {
		tile_update: "cTu",
		new_tile: "ckN",
		del_tile: "ckD",
		edit_tile: "ckE",
		set_tile_icon: "ckI",
		move_tile: "ckM",
		set_profile: "cpS",
		add_profile: "cpA",
		dup_profile: "cpD",
		set_theme: "ctS",
		plugin_set: "dPS",
		plugin_set_all: "dPSA",
		import_profile: "cpI",
		native_keypress: "nkP",
	},

	rpc: {
		authorize: "RPC.Authorize",
		reply: "RPC.Reply",
		set: "RPC.Set"
	},

	fdws: {
		sendRequest: "n-r",
		reply: "n-R",
	},

	relay: {
		identify: "RelayIdentify",
		error: "Error",
		opened: "RelayOpened",
		request: "RelayRequest",
		file: "RelayFile",
	}
};

if ("exports" in module) module.exports = eventNames;