class SettingBuilder {
  id;
  name;
  description;
  placeholder;
  allowed = [];
  value;
  default;
  constructor() {
    this.allowed = [];
    return this;
  }
  setId(id) {this.id = id; return this;}
  setName(id) {this.name = id; return this;}
  setAllowedValues(...val) {this.allowed = [...val]; return this;}
  setDescription(id) {this.description = id; return this;}
  setPlaceholder(id) {this.placeholder = id; return this;}
  setDefaultValue(id) {this.default = id; this.value = id; return this;}
}

module.exports = {SettingBuilder}