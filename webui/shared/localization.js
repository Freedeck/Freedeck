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

let locale;
let translations = {}

function doLocalization() {
  setLocale(defaultLocale);
}

async function setLocale(newLocale) {
  if (newLocale === locale) return;
  localStorage.setItem("freedeck:locale", newLocale);
  const newTranslations = await fetchTranslationsFor(newLocale);
  locale = newLocale;
  translations = newTranslations;
  translatePage();
}

async function fetchTranslationsFor(newLocale) {
  const response = await fetch(`/app/shared/lang/${newLocale}.json`);
  return await response.json();
}

function translatePage(specific = document) {
  console.log("translating page", specific);
  specific.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}

function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  let translation = translations[key];
  if(translation === undefined) translation = key;
  element.innerText = translation;
}

function translationKey(key, defaultValue="{{key}}") {
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
