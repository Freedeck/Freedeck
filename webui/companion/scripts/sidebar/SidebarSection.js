import { UI } from "../../../client/scripts/ui";

export class SidebarSection {
  name;
  id;
  children = [];
  classes = [];
  constructor(name, id = "", classes = []) {
    this.name = name;
    this.id = id;
    this.classes = classes;
  }

  build() {
    const section = document.createElement("div");
    section.classList.add("sidebar-item");
    section.id = this.id;
    for (const cls of this.classes) {
      section.classList.add(cls);
    }

    if (this.name !== "") {
      const title = document.createElement("h1");
      title.classList.add("sidebar-section-title");
      title.innerHTML = this.name;

      section.appendChild(title);
    }

    for (const child of this.children) {
      section.appendChild(child.build());
    }

    return section;
  }
}

export class SidebarButton {
  name;
  onClick;
  id;
  constructor(name, onClick, id = "") {
    this.name = name;
    this.onClick = onClick;
    this.id = id;
  }

  build() {
    const button = document.createElement("button");
    button.classList.add("sidebar-button");
    button.innerText = this.name;
    button.id = this.id;
    button.onclick = this.onClick;

    return button;
  }
}

export class SidebarSelect {
  name;
  label;
  onSelected;
  default;
  id;
  async setupValues() {}
  async setupLabels() {}
  constructor(label, name, onSelected, Vdefault = "", id = "") {
    this.name = name;
    this.label = label;
    this.onSelected = onSelected;
    this.default = Vdefault;
    this.id = id;
  }

  build() {
    const container = document.createElement("div");
    container.className = "es-setting";

    const select = document.createElement("select");
    select.id = this.name;

    const lbl = document.createElement("label");
    lbl.innerText = this.label;
    lbl.htmlFor = this.name;
    container.appendChild(lbl);
    container.appendChild(select);
    // Assuming optionsPromise is a Promise that resolves to an array of options
    (async () => {
      const options = await this.setupValues();
      const labels = await this.setupLabels();
      for (const option of options) {
        const opt = document.createElement("option");
        opt.value = option;
        opt.innerText = labels[options.indexOf(option)];
        if (option === this.default) opt.selected = true;
        select.appendChild(opt);
      }
    })();
    // select the first option if none are selected
    if (select.selectedIndex === -1) select.selectedIndex = 0;
    select.onchange = (ev) => {
      universal.uiSounds.playSound("select_option");
      this.onSelected(ev);
    };
    return container;
  }
}

export class SidebarSvgButton {
  name;
  onClick;
  id;
  icon;
  constructor(name, onClick, id = "", icon = "") {
    this.name = name;
    this.onClick = onClick;
    this.id = id;
    this.icon = icon;
  }

  build() {
    const button = document.createElement("button");
    // button.classList.add("sidebar-button");
    button.innerText = this.name;
    button.id = this.id;
    button.onclick = this.onClick;

    const obj = document.createElement("object");
    obj.data = `/common/icons/${this.icon}`;
    obj.classList.add("ico");
    button.appendChild(obj);

    return button;
  }
}

export class SidebarCheck {
  name;
  id;
  onClick;
  defaultValue = false;
  constructor(name, id, onClick, defaultValue=false) {
    this.name = name;
    this.id = id;
    this.onClick = onClick;
    this.defaultValue = defaultValue;
  }

  build() {
    const container = document.createElement("div");
    container.classList.add("flex-wrap-r");
    const inlineContainer = document.createElement("div");
    inlineContainer.classList.add("flex-wrap-r");
    inlineContainer.classList.add("alc");
    container.appendChild(inlineContainer);
    const label = document.createElement("label");
    label.htmlFor = this.id;
    const realLabel = document.createElement("h2");
    realLabel.innerText = this.name;
    label.appendChild(realLabel);
    const button = document.createElement("input");
    button.classList.add("fdc-checkbox");
    button.id = this.id;
    button.type = "checkbox";
    button.onchange = this.onClick;
    button.checked = this.defaultValue;

    inlineContainer.appendChild(label);
    inlineContainer.appendChild(button);
    return container;
  }
}

export class SidebarSlider {
  name;
  id;
  onClick;
  postfix;
  min;
  max;
  defaultV;
  step;
  constructor(
    name,
    id,
    postfix,
    min,
    max,
    defaultV,
    onClick,
    onReset,
    step = 1
  ) {
    this.name = name;
    this.id = id;
    this.onClick = onClick;
    this.postfix = postfix;
    this.min = min;
    this.max = max;
    this.defaultV = defaultV;
    this.onReset = onReset;
    this.step = step;
  }

  build() {
    const container = document.createElement("div");
    container.classList.add("flex-wrap-r");
    container.classList.add("alc");
    const inlineContainer = document.createElement("div");
    // inlineContainer.classList.add("flex-wrap-r")
    inlineContainer.classList.add("alc");
    container.appendChild(inlineContainer);

    const label = document.createElement("label");
    label.htmlFor = this.id;
    const realLabel = document.createElement("h2");
    realLabel.innerText = this.name;
    label.appendChild(realLabel);
    const button = document.createElement("input");
    button.classList.add("fdc-slider");
    button.id = this.id;
    button.type = "range";
    button.setAttribute("postfix", this.postfix);
    button.min = this.min;
    button.max = this.max;
    button.value = this.defaultV;
    button.step = this.step;
    button.oninput = this.onClick;

    const resetButton = document.createElement("button");
    resetButton.classList.add("reset-button");
    resetButton.innerHTML = `<img src="/common/icons/reset.svg" alt="Reset" width="25" height="25" loading="lazy">`;
    resetButton.id = `${this.id}-reset`;
    resetButton.onclick = (e) => {
      this.onReset(e);
      UI.reloadSounds();
    };
    container.appendChild(resetButton);

    const postfix = this.postfix || "";
    const min = document.createElement("div");
    min.innerText = this.min;
    min.className = "fdc-slider-min";
    const max = document.createElement("div");
    max.innerText = this.max;
    max.className = "fdc-slider-max";
    const value = document.createElement("div");
    value.innerText = this.defaultV + postfix;
    value.className = "fdc-slider-value";

    button.style.width = "7rem";
    button.addEventListener("input", (e) => {
      value.innerText = e.target.value + this.postfix;
    });
    button.addEventListener("change", (e) => {
      value.innerText = e.target.value + this.postfix;
    });

    inlineContainer.appendChild(label);
    inlineContainer.appendChild(button);
    inlineContainer.appendChild(min);
    inlineContainer.appendChild(max);
    inlineContainer.appendChild(value);
    return container;
  }
}
