/**
 * Adapted from https://phrase.com/blog/posts/step-step-guide-javascript-localization/
 */

const defaultLocale = localStorage.getItem("freedeck:locale") || "en";
if (!localStorage.getItem("freedeck:locale")) {
  localStorage.setItem("freedeck:locale", defaultLocale);
}
//TODO: Add more locales here
const locales = {
  en: "English",
  es: "Español",
};
// The active locale
let locale;
// Gets filled with active locale translations
let translations = { 
  "locale.display": "English",
  "sidebar.Tiles": "Tiles",
  "sidebar.Library": "Library",
  "sidebar.Marketplace": "Marketplace",
  "sidebar.Settings": "Settings",
  "sidebar.Connect": "Connect",
  "sidebar.Recompile": "Recompile",
  "sidebar.Setup": "Setup",
  "sidebar.Pair Device": "Pair Device",
  "sidebar.Themer": "Themer",
  
  "lside.mobd": "Mobile Device",
  "lside.mobd.pair": "Pair Mobile Device",

  "lside.pages.page": "Page: ",
  "lside.pages.try": "Try Tiles",
  "lside.pages.previous": "Previous Page",
  "lside.pages.next": "Next Page",

  "lside.footer.thanks": "Thank you for using Freedeck!",
  "lside.footer.github_pre": "Freedeck is open-source and can be found on",
  "lside.footer.need_help": "Need help?",
  "lside.footer.need_help.wiki": "Check the Wiki!",

  "editor.sections.no_action": "No Action!",

  "settings.title": "Settings",

  "settings.sections.style": "Style",
  "settings.sections.style.compact": "Compact Mode",
  "settings.sections.style.scroll": "Scroll Long Text",
  "settings.sections.style.fill": "Fill Tiles",
  "settings.sections.style.themes": "Themes",

  "settings.sections.language": "Language",

  "settings.sections.plugins": "Plugins",
  "settings.sections.plugins.reload_all": "Reload All Plugins",
  "settings.sections.plugins.single.disable": "Disable",
  "settings.sections.plugins.single.reload": "Reload",
  "settings.sections.plugins.disabled.title": "Disabled Plugins",
  "settings.sections.plugins.disabled.enable": "Enable",
  "settings.sections.plugins.tile_previews": "Tile Previews",

  "settings.sections.audio_devices": "Audio Devices",
  "settings.sections.audio_devices.monitor": "Monitor Devices",
  "settings.sections.audio_devices.vb": "VB-Cable Devices",

  "settings.sections.general": "General",
  "settings.sections.general.dont_ask": "Don't ask to delete Tiles",
  "settings.sections.general.fdc_tab": "Show FDConnect as a tab",
  "settings.sections.general.ui_sounds": "UI Sounds",
  "settings.sections.general.center_mode": "Center Mode",

  "settings.sections.experiments": "Experiments",

  "settings.sections.uis": "UI Sounds",
  "settings.sections.uis.soundpacks": "Soundpacks",
  "settings.sections.uis.soundpacks.current": "Current Soundpack",

  "settings.sections.bug": "Bug Report",
  "settings.sections.bug.request_generate": "Click \"Generate Report\"",
  "settings.sections.bug.generate": "Generate Report",
  "settings.sections.bug.report_reader": "Report Reader",
  "settings.sections.bug.report_reader.read": "Read Report",

  "settings.footer.by": "is a project by"
}

function doLocalization() {
  // setLocale(defaultLocale);
}

// Load translations for the given locale and translate
// the page to this locale
async function setLocale(newLocale) {
  // if (newLocale === locale) return;
  // localStorage.setItem("freedeck:locale", newLocale);
  // const newTranslations = await fetchTranslationsFor(newLocale);
  // locale = newLocale;
  // translations = newTranslations;
  // translatePage();
}
// Retrieve translations JSON object for the given
// locale over the network
async function fetchTranslationsFor(newLocale) {
  const response = await fetch(`/app/shared/lang/${newLocale}.json`);
  return await response.json();
}
// Replace the inner text of each element that has a
// data-i18n-key attribute with the translation corresponding
// to its data-i18n-key
function translatePage(specific = document) {
  console.log("translating page", specific);
  // specific.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}
// Replace the inner text of the given HTML element
// with the translation in the active locale,
// corresponding to the element's data-i18n-key
function translateElement(element) {
  // const key = element.getAttribute("data-i18n-key");
  // const translation = translations[key];
  // console.log("Localizing:", key, translation);
  // element.innerText = translation;
}

function translationKey(key, defaultValue="{{key}} not found in locale.") {
  if(translations[key] === undefined) {
    console.warn(`Translation key ${key} not found in locale.`);
    if(Object.keys(translations).length === 0) {
      console.warn("No translations loaded.");
      setLocale(defaultLocale);
    }
  }
  const defaultValueTwo = defaultValue.replace("{{key}}", key);
  return translations[key] || defaultValueTwo;
}

export {
  locales,
  doLocalization,
  setLocale,
  fetchTranslationsFor,
  translatePage,
  translationKey,
  translateElement,
};
