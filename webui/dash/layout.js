export default {
  "id": "8499f778-de42-4d8c-b07b-9e5ed06d3d90",
  "name": "Dash Layout",
  "modules": [
    {
      "Currently Playing Song": {
        "uuid": "fd.some-uuid",
        "plugin": "Spotify",
        "type": "spotify/playback",
        "renderType": "dash-module",
        "data": {
          "position": {
            "x": "322.01",
            "y": "745.10",
            "width": "defined",
            "height": "defined"
          } 
        }
      }
    },
    {
      "Clock": {
        "uuid": "fda..",
        "plugin": "Clock",
        "type": "clock",
        "renderType": "dash-module",
        "data": {
          "position": {
            "x": "252.01",
            "y": "751.10",
            "width": "200"
          } 
        }
      }
    },
    {
      "Next": {
        "uuid": "fda..2",
        "plugin": "Spotify",
        "type": "sp.next",
        "renderType": "dash-button",
        "data": {
          "position": {
            "x": "594.01",
            "y": "1546.10",
            "width": "200"
          } 
        }
      }
    },
    {
      "Play": {
        "uuid": "fda..2",
        "plugin": "Spotify",
        "type": "sp.playpause",
        "renderType": "dash-button",
        "data": {
          "position": {
            "x": "605.01",
            "y": "1220",
            "width": "200"
          } 
        }
      }
    }
  ]
}