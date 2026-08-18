const picocolors = require('$/picocolors');

module.exports = (package) => {
  const { main, name, description, author, version, freedeck } = package;
  let success = true;
  if (!freedeck) {
    console.error(
      `${picocolors.blue("Plugins / Metadata Verify")} >> ${picocolors.red(`Error: ${filePath} does not contain a Freedeck package definition.`)}`,
    );
    success = false;
  }
  if (freedeck.disabled && freedeck.disabled === "true") {
    console.log(
      `${picocolors.blue("Plugins / Metadata Verify")} >> ${picocolors.gray(`Plugin ${freedeck.title} is disabled. Skipping.`)}`,
    );
    success = false;
  }
  if (freedeck.package !== "plugin" && freedeck.package !== "theme") {
    console.error(
      `${picocolors.blue("Plugins / Metadata Verify")} >> ${picocolors.red(`Error: ${freedeck.title} does not contain a valid Freedeck package type.`)}`,
    );
    success = false;
  }
  return success;
}