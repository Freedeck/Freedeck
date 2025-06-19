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
            "x": "133",
            "y": "92",
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
            "x": "0",
            "y": "892",
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
            "x": "245",
            "y": "1557",
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
            "x": "247",
            "y": "1186",
            "width": "200"
          } 
        }
      }
    },
    {
      "Logo": {
        "uuid": "fda..3",
        "plugin": "Freedeck",
        "type": "freedeck/logo",
        "renderType": "dash-module",
        "data": {
          "position": {
            "x": "0",
            "y": "0",
            "width": "450"
          } 
        }
      }
    },
    {
      "Demo": {
        "uuid": "fda..4",
        "plugin": "Freedeck",
        "type": "freedeck/demo",
        "renderType": "dash-module",
        "data": {
          "position": {
            "x": "480",
            "y": "0",
            "width": "450"
          } 
        }
      }
    }
  ]
}