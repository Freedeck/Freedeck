export default {
	id: "8499f778-de42-4d8c-b07b-9e5ed06d3d90",
	name: "Overlay Layout",
	modules: [
		{
			beta: {
				uuid: "01",
				type: "beta",
				renderType: "dash-module",
				data: {
					position: {
						x: "100",
						y: "1000",
						width: "defined",
						height: "defined",
					},
				},
			},
		},
		{
			"Currently Playing Song": {
				uuid: "fd.some-uuid",
				plugin: "Spotify",
				type: "spotify/playback",
				renderType: "dash-module",
				data: {
					position: {
						x: "700",
						y: "1441",
						width: "defined",
						height: "defined",
					},
				},
			},
		},
	],
};
