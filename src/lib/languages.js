// Singapore's four official languages first, then Changi's largest transit market.
export const LANGUAGES = [
  { code: "en", name: "English",    native: "English" },
  { code: "zh", name: "Mandarin",   native: "简体中文" },
  { code: "ms", name: "Malay",      native: "Bahasa Melayu" },
  { code: "ta", name: "Tamil",      native: "தமிழ்" },
  { code: "ja", name: "Japanese",   native: "日本語" },
  { code: "ko", name: "Korean",     native: "한국어" },
  { code: "th", name: "Thai",       native: "ไทย" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "hi", name: "Hindi",      native: "हिन्दी" },
  { code: "ar", name: "Arabic",     native: "العربية" },
  { code: "fr", name: "French",     native: "Français" },
  { code: "de", name: "German",     native: "Deutsch" },
  { code: "es", name: "Spanish",    native: "Español" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ru", name: "Russian",    native: "Русский" },
];

export const RTL_CODES = ["ar", "he", "fa", "ur"];

export function detectLanguage(navigatorLanguage) {
  if (!navigatorLanguage) return LANGUAGES[0];
  const base = String(navigatorLanguage).split("-")[0].toLowerCase();
  return LANGUAGES.find((l) => l.code === base) ?? LANGUAGES[0];
}

export function byCode(code) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
