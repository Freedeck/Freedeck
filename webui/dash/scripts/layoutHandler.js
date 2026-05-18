const defaultDefinition = {
  id: "8499f778-de42-4d8c-b07b-9e5ed06d3d90",
  name: "Default Overlay Layout",
  modules: [
    {
      beta: {
        uuid: "01",
        type: "freedeck/beta",
        renderType: "dash-module",
        data: {
          position: {
            x: "0",
            y: "0",
            width: "defined",
            height: "defined",
          },
        },
      },
    },
    {
      logo: {
        uuid: "02",
        type: "freedeck/logo",
        renderType: "dash-module",
        data: {
          position: {
            x: "0",
            y: "250",
            width: "defined",
            height: "defined",
          },
        },
      },
    },
  ],
};

let layoutDefinition;

function loadFromLS() {
  if (!localStorage.getItem("freedeck:overlay")) {
    layoutDefinition = defaultDefinition;
    localStorage.setItem("freedeck:overlay", JSON.stringify(layoutDefinition));
  } else {
    layoutDefinition = JSON.parse(localStorage.getItem("freedeck:overlay"));
  }
}
layoutDefinition = loadFromLS();

function saveToLS() {
	localStorage.setItem("freedeck:overlay", JSON.stringify(layoutDefinition));
}

function get() {
  loadFromLS()
  return layoutDefinition || loadFromLS();
}


export {
  loadFromLS,
  saveToLS,
  get
}