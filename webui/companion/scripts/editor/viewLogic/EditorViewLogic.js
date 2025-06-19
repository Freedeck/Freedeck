class EditorViewLogic {
  types;
  view;
  onRun;
  onFirstSetup;
  constructor(view, ...types) {
    this.types = types;
    this.view = view;
    this.onRun = () => {};
    this.onFirstSetup = () => {};
  }
  setOnRun(onRun) {
    this.onRun = onRun;
  }
  setOnFirstSetup(onFirstSetup) {
    this.onFirstSetup = onFirstSetup;
  }
  forwardRunningEvent(currentType, prerun, ...args) {
    let isRunning = false;
    if (this.types.includes(currentType) || (this.types.includes("#*") && !currentType.startsWith("fd."))) {
      isRunning = true;
      prerun();
      this.run(...args);
    }
    return isRunning;
  }
  run(...args) {
    this.onRun(...args);
  }
  firstSetup() {
    this.onFirstSetup();
  }
}

export default EditorViewLogic;