<template>
  <div class="cloud_wrap">
    <div class="tagcloud-all">
      <a
        class="tag"
        v-for="(item, index) in tagList"
        :key="index"
        rel="external nofollow"
        :style="'color:' + item.color + ';top: 0;left: 0;filter:none;'"
        >{{ item.tagName }}</a
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive } from "vue";

// 定义类型
interface TagItem {
  tagName: string;
  id?: number;
  color?: string;
  [key: string]: any;
}

interface TagCloudItem {
  offsetWidth: number;
  offsetHeight: number;
  cx?: number;
  cy?: number;
  cz?: number;
  x?: number;
  y?: number;
  scale?: number;
  alpha?: number;
  [key: string]: any;
}

const props = defineProps({
  tagList: {
    type: Array as () => TagItem[],
    default: () => [],
  },
});

const config = reactive({
  radius: 120,
  dtr: Math.PI / 180,
  d: 300,
  mcList: [] as TagCloudItem[],
  active: false,
  lasta: 1,
  lastb: 1,
  distr: true,
  tspeed: 5, // 控制旋转速度
  size: 250,
  mouseX: 0,
  mouseY: 0,
  howElliptical: 1,
  oList: null as HTMLElement | null,
  oA: null as HTMLCollectionOf<HTMLAnchorElement> | null,
  sa: 0,
  ca: 0,
  sb: 0,
  cb: 0,
  sc: 0,
  cc: 0,
});

// 生成随机数
function getRandomNum() {
  return Math.floor(Math.random() * (255 + 1));
}
// 三角函数角度计算
function sineCosine(a: number, b: number, c: number) {
  config.sa = Math.sin(a * config.dtr);
  config.ca = Math.cos(a * config.dtr);
  config.sb = Math.sin(b * config.dtr);
  config.cb = Math.cos(b * config.dtr);
  config.sc = Math.sin(c * config.dtr);
  config.cc = Math.cos(c * config.dtr);
}
// 设置初始定位
function positionAll() {
  nextTick(() => {
    if (!config.oA || !config.oList) return;

    let phi = 0;
    let theta = 0;
    let max = config.mcList.length;
    let aTmp: HTMLAnchorElement[] = [];
    let oFragment = document.createDocumentFragment();

    // 随机排序
    for (let i = 0; i < props.tagList.length; i++) {
      if (config.oA[i]) {
        aTmp.push(config.oA[i]);
      }
    }

    aTmp.sort(() => {
      return Math.random() < 0.5 ? 1 : -1;
    });

    for (let i = 0; i < aTmp.length; i++) {
      oFragment.appendChild(aTmp[i]);
    }

    config.oList.appendChild(oFragment);

    for (let i = 1; i < max + 1; i++) {
      const item = config.mcList[i - 1];
      if (!item || !config.oA[i - 1]) continue;

      if (config.distr) {
        phi = Math.acos(-1 + (2 * i - 1) / max);
        theta = Math.sqrt(max * Math.PI) * phi;
      } else {
        phi = Math.random() * Math.PI;
        theta = Math.random() * (2 * Math.PI);
      }

      // 坐标变换
      item.cx = config.radius * Math.cos(theta) * Math.sin(phi);
      item.cy = config.radius * Math.sin(theta) * Math.sin(phi);
      item.cz = config.radius * Math.cos(phi);

      config.oA[i - 1].style.left =
        (item.cx || 0) +
        config.oList.offsetWidth / 2 -
        item.offsetWidth / 2 +
        "px";
      config.oA[i - 1].style.top =
        (item.cy || 0) +
        config.oList.offsetHeight / 2 -
        item.offsetHeight / 2 +
        "px";
    }
  });
}
// 坐标更新 让标签动起来
function update() {
  nextTick(() => {
    let a;
    let b;
    if (config.active) {
      a =
        (-Math.min(Math.max(-config.mouseY, -config.size), config.size) /
          config.radius) *
        config.tspeed;
      b =
        (Math.min(Math.max(-config.mouseX, -config.size), config.size) /
          config.radius) *
        config.tspeed;
    } else {
      a = config.lasta * 0.98;
      b = config.lastb * 0.98;
    }
    config.lasta = a;
    config.lastb = b;
    if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) {
      return;
    }
    let c = 0;
    sineCosine(a, b, c);
    for (let j = 0; j < config.mcList.length; j++) {
      const item = config.mcList[j];
      if (!item) continue;

      let rx1 = item.cx || 0;
      let ry1 = (item.cy || 0) * config.ca + (item.cz || 0) * -config.sa;
      let rz1 = (item.cy || 0) * config.sa + (item.cz || 0) * config.ca;

      let rx2 = rx1 * config.cb + rz1 * config.sb;
      let ry2 = ry1;
      let rz2 = rx1 * -config.sb + rz1 * config.cb;

      let rx3 = rx2 * config.cc + ry2 * -config.sc;
      let ry3 = rx2 * config.sc + ry2 * config.cc;
      let rz3 = rz2;

      item.cx = rx3;
      item.cy = ry3;
      item.cz = rz3;

      let per = config.d / (config.d + rz3);

      item.x = config.howElliptical * rx3 * per - config.howElliptical * 2;
      item.y = ry3 * per;
      item.scale = per;
      item.alpha = per;
      item.alpha = (item.alpha - 0.6) * (10 / 6);
    }
    doPosition();
    depthSort();
  });
}
function doPosition() {
  nextTick(() => {
    if (!config.oList || !config.oA) return;

    let l = config.oList.offsetWidth / 2;
    let t = config.oList.offsetHeight / 2;
    for (let i = 0; i < config.mcList.length; i++) {
      const item = config.mcList[i];
      if (!item || !config.oA[i]) continue;

      const aAs = config.oA[i].style;

      // 计算位置
      let left = (item.cx || 0) + l - item.offsetWidth / 2;
      let top = (item.cy || 0) + t - item.offsetHeight / 2;

      // 边界检查，确保标签不会完全离开视口
      const padding = 10; // 边缘安全距离
      left = Math.max(
        padding,
        Math.min(config.oList.offsetWidth - item.offsetWidth - padding, left)
      );
      top = Math.max(
        padding,
        Math.min(config.oList.offsetHeight - item.offsetHeight - padding, top)
      );

      aAs.left = left + "px";
      aAs.top = top + "px";
      aAs.fontSize = Math.ceil((12 * (item.scale || 0)) / 2) + 8 + "px";
      aAs.opacity = String(item.alpha || 0);
    }
  });
}
function depthSort() {
  nextTick(() => {
    if (!config.oA) return;

    const aTmp: HTMLAnchorElement[] = [];
    for (let i = 0; i < config.oA.length; i++) {
      aTmp.push(config.oA[i]);
    }

    // 添加自定义属性以便排序
    aTmp.forEach((el, i) => {
      (el as any).cz = config.mcList[i]?.cz || 0;
    });

    aTmp.sort(function (vItem1, vItem2) {
      const cz1 = (vItem1 as any).cz || 0;
      const cz2 = (vItem2 as any).cz || 0;

      if (cz1 > cz2) {
        return -1;
      } else if (cz1 < cz2) {
        return 1;
      } else {
        return 0;
      }
    });

    for (let i = 0; i < aTmp.length; i++) {
      aTmp[i].style.zIndex = String(i);
    }
  });
}
// 生成随机颜色
function query() {
  if (!Array.isArray(props.tagList)) {
    return;
  }
  // 给tagList添加随机颜色
  props.tagList.forEach((item: TagItem) => {
    item.color =
      "rgb(" +
      getRandomNum() +
      "," +
      getRandomNum() +
      "," +
      getRandomNum() +
      ")";
  });
  onReady();
}
// 生成标签云
function onReady() {
  nextTick(() => {
    const cloudEl = document.querySelector(".tagcloud-all");
    if (!cloudEl) return;

    config.oList = cloudEl as HTMLElement;
    config.oA = config.oList.getElementsByTagName("a");

    config.mcList = [];
    for (var i = 0; i < config.oA.length; i++) {
      const oTag: TagCloudItem = {
        offsetWidth: config.oA[i].offsetWidth,
        offsetHeight: config.oA[i].offsetHeight,
      };
      config.mcList.push(oTag);
    }

    sineCosine(0, 0, 0);
    positionAll();

    if (config.oList) {
      config.oList.onmouseover = () => {
        config.active = true;
      };

      config.oList.onmouseout = () => {
        config.active = false;
      };

      config.oList.onmousemove = (event: MouseEvent) => {
        if (!config.oList) return;

        const oEvent = event || window.event;
        config.mouseX =
          oEvent.clientX -
          (config.oList.offsetLeft + config.oList.offsetWidth / 2);
        config.mouseY =
          oEvent.clientY -
          (config.oList.offsetTop + config.oList.offsetHeight / 2);
        // 增加除数，减小鼠标移动影响，使移动更平滑
        config.mouseX /= 8;
        config.mouseY /= 8;
      };
    }

    setInterval(() => {
      update();
    }, 30);
  });
}

onMounted(() => {
  nextTick(() => {
    query();
  });
});
</script>

<style lang="scss" scoped>
.cloud_wrap {
  width: 100%;
  height: 350px;

  // 标签云
  .tagcloud-all {
    height: 100%;
    position: relative;

    .tag {
      position: absolute;
      top: 0px;
      left: 0px;
      color: #fff;
      font-weight: bold;
      text-decoration: none;
      padding: 3px 6px;
      border: 1px solid transparent; /* 添加透明边框，防止悬停时位置偏移 */

      &:hover {
        color: #ff0000;
        letter-spacing: 2px;
        border: 1px solid rgba(255, 255, 255, 0.3); /* 悬停时显示边框 */
      }
    }
  }
}
</style>
