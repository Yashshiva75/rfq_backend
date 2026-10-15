import { I18n } from "i18n";
import path from "path";

const i18n = new I18n({
  locales: ["en"],
  defaultLocale: "en",
  directory: path.join(__dirname, "../resources/locales"),
  objectNotation: true,
  autoReload: true,
  updateFiles: false,
  syncFiles: false,
});

export default i18n;
