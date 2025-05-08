<template>
  <div class="tag-cloud" ref="tagCloud">
    <a v-for="(item, index) in data" :key="index" :style="item.style">{{
      item.name
    }}</a>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from "vue";

interface TagItem {
  name: string;
  value: number;
  style?: {
    color?: string;
    fontSize?: string;
  };
  cz?: {
    x: number;
    y: number;
    z: number;
  };
}

interface Config {
  radius: number;
  dtr: number;
  d: number;
  mcList: TagItem[];
  active: boolean;
  lasta: number;
  lastb: number;
  distr: boolean;
  tspeed: number;
  size: number;
  mouseX: number;
  mouseY: number;
  howElliptical: number;
  aA: HTMLAnchorElement[];
  oDiv: HTMLElement | null;
  sa: number;
  ca: number;
  sb: number;
  cb: number;
  sc: number;
  cc: number;
}

const props = defineProps<{
  data: TagItem[];
}>();

const config = reactive<Config>({
  radius: 120,
  dtr: Math.PI / 180,
  d: 300,
  mcList: [],
  active: false,
  lasta: 1,
  lastb: 1,
  distr: true,
  tspeed: 11,
  size: 250,
  mouseX: 0,
  mouseY: 0,
  howElliptical: 1,
  aA: [],
  oDiv: null,
  sa: 0,
  ca: 0,
  sb: 0,
  cb: 0,
  sc: 0,
  cc: 0,
});

const tagCloud = ref<HTMLElement | null>(null);

onMounted(() => {
  init();
});

function init() {
  if (!tagCloud.value) return;

  config.oDiv = tagCloud.value;
  config.aA = Array.from(config.oDiv.getElementsByTagName("a"));

  config.mcList = [];
  for (let i = 0; i < config.aA.length; i++) {
    const item = props.data[i];
    if (!item) continue;

    config.mcList.push({
      ...item,
      cz: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
  }

  sineCosine(0, 0, 0);
  positionAll();

  if (config.oDiv) {
    config.oDiv.onmouseover = () => {
      config.active = true;
    };

    config.oDiv.onmouseout = () => {
      config.active = false;
    };

    config.oDiv.onmousemove = (ev: MouseEvent) => {
      const oEvent = ev || window.event;
      if (config.oDiv) {
        config.mouseX =
          oEvent.clientX -
          (config.oDiv.offsetLeft + config.oDiv.offsetWidth / 2);
        config.mouseY =
          oEvent.clientY -
          (config.oDiv.offsetTop + config.oDiv.offsetHeight / 2);
        config.mouseX /= 5;
        config.mouseY /= 5;
      }
    };
  }

  update();
}

function update() {
  const a =
    (-Math.min(Math.max(-config.mouseY, -config.size), config.size) /
      config.radius) *
    config.tspeed;
  const b =
    (Math.min(Math.max(-config.mouseX, -config.size), config.size) /
      config.radius) *
    config.tspeed;

  if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) return;

  config.lasta = a;
  config.lastb = b;

  sineCosine(a, b, 0);
  for (let i = 0; i < config.mcList.length; i++) {
    const item = config.mcList[i];
    if (item.cz) {
      const rx1 = item.cz.x;
      const ry1 = item.cz.y * config.lastb + item.cz.x * config.lasta;
      const rz1 = item.cz.y * -config.lasta + item.cz.x * config.lastb;

      const rx2 = rx1 * config.lastb + rz1 * config.lasta;
      const ry2 = ry1;
      const rz2 = rx1 * -config.lasta + rz1 * config.lastb;

      const rx3 = rx2 * Math.cos(config.mouseX) + rz2 * Math.sin(config.mouseX);
      const ry3 = ry2;
      const rz3 =
        rx2 * -Math.sin(config.mouseX) + rz2 * Math.cos(config.mouseX);

      item.cz.x = rx3;
      item.cz.y = ry3;
      item.cz.z = rz3;

      const per = (2 * config.d) / (2 * config.d + rz3);

      item.style = {
        fontSize: per * 2 + "px",
        color: `rgb(${getRandomNum()},${getRandomNum()},${getRandomNum()})`,
      };
    }
  }

  doPosition();
  depthSort();

  if (config.active) {
    requestAnimationFrame(update);
  }
}

function depthSort() {
  const aTmp = [...config.mcList];

  aTmp.sort((vItem1, vItem2) => {
    if (vItem1.cz && vItem2.cz) {
      return vItem2.cz.z - vItem1.cz.z;
    }
    return 0;
  });

  for (let i = 0; i < aTmp.length; i++) {
    const item = aTmp[i];
    if (item.style && config.aA[i]) {
      config.aA[i].style.cssText =
        `color:${item.style.color};font-size:${item.style.fontSize};`;
    }
  }
}

function positionAll() {
  const phi = 0;
  const theta = 0;
  const aTmp = [...config.mcList];

  aTmp.sort(() => (Math.random() < 0.5 ? 1 : -1));

  for (let i = 0; i < aTmp.length; i++) {
    const item = aTmp[i];
    if (item.cz) {
      item.cz.x = config.radius * Math.cos(theta) * Math.sin(phi);
      item.cz.y = config.radius * Math.sin(theta) * Math.sin(phi);
      item.cz.z = config.radius * Math.cos(phi);
    }
  }
}

function doPosition() {
  if (!config.oDiv) return;

  const l = config.oDiv.offsetWidth / 2;
  const t = config.oDiv.offsetHeight / 2;
  for (let i = 0; i < config.mcList.length; i++) {
    const item = config.mcList[i];
    if (item.cz && config.aA[i]) {
      const aAs = config.aA[i].style;
      if (item.cz.z <= -config.radius) {
        aAs.display = "none";
      } else {
        aAs.display = "";
        aAs.left = item.cz.x + l - config.aA[i].offsetWidth / 2 + "px";
        aAs.top = item.cz.y + t - config.aA[i].offsetHeight / 2 + "px";
        aAs.zIndex = Math.ceil(
          ((config.radius + item.cz.z) / config.d) * 10
        ).toString();
      }
    }
  }
}

function getRandomNum() {
  return Math.floor(Math.random() * 255);
}

function sineCosine(a: number, b: number, c: number) {
  config.sa = Math.sin(a * config.dtr);
  config.ca = Math.cos(a * config.dtr);
  config.sb = Math.sin(b * config.dtr);
  config.cb = Math.cos(b * config.dtr);
  config.sc = Math.sin(c * config.dtr);
  config.cc = Math.cos(c * config.dtr);
}
</script>

<style scoped>
.tag-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
.tag-cloud a {
  position: absolute;
  top: 0;
  left: 0;
  text-decoration: none;
  padding: 3px 6px;
  color: #000;
  font-size: 16px;
  font-family: "Microsoft YaHei";
  font-weight: bold;
}
.tag-cloud a:hover {
  border: 1px solid #eee;
  background: #fff;
  border-radius: 4px;
}
</style>
