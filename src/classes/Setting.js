class SettingBuilder {
  id;
  name;
  description;
  placeholder;
  value;
  default;
  constructor() {
    return this;
  }
  setId(id) {this.id = id; return this;}
  setName(id) {this.name = id; return this;}
  setDescription(id) {this.description = id; return this;}
  setPlaceholder(id) {this.placeholder = id; return this;}
  setDefaultValue(id) {this.default = id; this.value = id; return this;}
}

export {SettingBuilder}