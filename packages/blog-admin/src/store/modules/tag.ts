import { defineStore } from "pinia";
import { TagViewState, TagView } from "../interface";

export const useTagViewStore = defineStore("useTagViewStore", {
  state: (): TagViewState => ({
    visitedViews: [],
    cachedViews: [],
  }),
  actions: {
    addVisitedView(view: TagView) {
      if (this.visitedViews.some((v) => v.path === view.path)) return;
      if (view.meta && view.meta.affix) {
        this.visitedViews.unshift(
          Object.assign({}, view, {
            title: view.meta?.title || "no-name",
          })
        );
      } else {
        this.visitedViews.push(
          Object.assign({}, view, {
            title: view.meta?.title || "no-name",
          })
        );
      }
    },
    addCachedView(view: TagView) {
      if (this.cachedViews.includes(view.name as string)) return;
      if (view.meta?.keepAlive) {
        this.cachedViews.push(view.name as string);
      }
    },
    delVisitedView(view: TagView) {
        for (const [i, v] of this.visitedViews.entries()) {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1);
            break;
          }
        }
    },
    delCachedView(view: TagView) {
      const index = this.cachedViews.indexOf(view.name as string);
      index > -1 && this.cachedViews.splice(index, 1);
    },
    delOtherVisitedViews(view: TagView) {
        this.visitedViews = this.visitedViews.filter((v) => {
          return v.meta?.affix || v.path === view.path;
      });
    },
    delOtherCachedViews(view: TagView) {
      const index = this.cachedViews.indexOf(view.name as string);
      if (index > -1) {
        this.cachedViews = this.cachedViews.slice(index, index + 1);
      } else {
        this.cachedViews = [];
      }
    },
    delAllVisitedViews() {
      const affixTags = this.visitedViews.filter((tag) => tag.meta?.affix);
      this.visitedViews = affixTags;
    },
    delAllCachedViews() {
      this.cachedViews = [];
    },
    updateVisitedView(view: TagView) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view);
          break;
        }
      }
    },
    delLeftViews(view: TagView) {
      return new Promise((resolve) => {
        const currIndex = this.visitedViews.findIndex(
          (v) => v.path === view.path
        );
        if (currIndex === -1) {
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, index) => {
          // affix:true 固定tag，例如"首页"
          if (index >= currIndex || (item.meta && item.meta.affix)) {
            return true;
          }
          return false;
        });
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    delRightViews(view: TagView) {
      return new Promise((resolve) => {
        const currIndex = this.visitedViews.findIndex(
          (v) => v.path === view.path
        );
        if (currIndex === -1) {
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, index) => {
          // affix:true 固定tag，例如"首页"
          if (index <= currIndex || (item.meta && item.meta.affix)) {
            return true;
          }
          return false;
        });
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    addView(view: TagView) {
      this.addVisitedView(view);
    },
    delView(view: TagView) {
      return new Promise((resolve) => {
        this.delVisitedView(view);
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    delOtherViews(view: TagView) {
      return new Promise((resolve) => {
        this.delOtherVisitedViews(view);
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
    delAllViews() {
      return new Promise((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta?.affix);
        this.visitedViews = affixTags;
        resolve({
          visitedViews: [...this.visitedViews],
        });
      });
    },
  },
  getters: {},
});
