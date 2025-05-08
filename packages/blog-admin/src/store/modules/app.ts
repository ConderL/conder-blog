import { defineStore } from "pinia";
import { AppState } from "../interface";

export const useAppStore = defineStore("useAppStore", {
  state: (): AppState => ({
    isCollapse: false,
    device: "desktop",
    size: "default",
    sidebar: {
      opened: true,
      withoutAnimation: false,
    },
  }),
  actions: {
    toggle() {
      this.isCollapse = !this.isCollapse;
    },
    changeCollapse(isCollapse: boolean) {
      this.isCollapse = isCollapse;
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    setSize(size: string) {
      this.size = size;
    },
    toggleSideBar() {
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
    },
    closeSideBar({ withoutAnimation }: { withoutAnimation: boolean }) {
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
    },
  },
  getters: {
    getIsCollapse: (state) => state.isCollapse,
    getDevice: (state) => state.device,
    getSize: (state) => state.size,
    getSidebar: (state) => state.sidebar,
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "app-store",
        storage: localStorage,
        paths: ["isCollapse", "device", "size", "sidebar"],
      },
    ],
  },
});
