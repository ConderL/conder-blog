import { defineStore } from "pinia";
import defaultSettings from "../../settings";
import { SettingState } from "../interface";
const { tagView, fixedHeader, sidebarLogo } = defaultSettings;

export const useSettingStore = defineStore("useSettingStore", {
  state: (): SettingState => ({
    theme: "light",
    size: "default",
    language: "zh-CN",
    showSettings: true,
    showTagsView: true,
    showSidebarLogo: true,
    fixedHeader: true,
    showNotify: true,
    showThemeSwitch: true,
    showScreenfull: true,
    showGreyMode: false,
    showColorWeakness: false,
    tagView: true,
    sidebarLogo: true,
  }),
  actions: {
    async changeSetting(data: { key: string; value: any }) {
      const { key, value } = data;
      switch (key) {
        case "theme":
          this.theme = value;
          break;
        case "showSettings":
          this.showSettings = value;
          break;
        case "showTagsView":
          this.showTagsView = value;
          break;
        case "showSidebarLogo":
          this.showSidebarLogo = value;
          break;
        case "fixedHeader":
          this.fixedHeader = value;
          break;
        case "showNotify":
          this.showNotify = value;
          break;
        case "showThemeSwitch":
          this.showThemeSwitch = value;
          break;
        case "showScreenfull":
          this.showScreenfull = value;
          break;
        case "showGreyMode":
          this.showGreyMode = value;
          break;
        case "showColorWeakness":
          this.showColorWeakness = value;
          break;
        case "tagView":
          this.tagView = value;
          break;
        case "sidebarLogo":
          this.sidebarLogo = value;
          break;
        case "size":
          this.size = value;
          break;
        case "language":
          this.language = value;
          break;
        default:
          break;
      }
    },
    setTheme(theme: string) {
      this.theme = theme;
    },
    setSize(size: string) {
      this.size = size;
    },
    setLanguage(language: string) {
      this.language = language;
    },
  },
  getters: {
    getTheme: (state) => state.theme,
    getSize: (state) => state.size,
    getLanguage: (state) => state.language,
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "setting-store",
        storage: localStorage,
        paths: [
          "theme",
          "size",
          "language",
          "showSettings",
          "showTagsView",
          "showSidebarLogo",
          "fixedHeader",
        ],
      },
    ],
  },
});
