/* ============================================================
   data/scenes.js —— 场景位置配置
   ============================================================ */

// ---------- 任务分区 ----------
const TASK_ZONE = {
  kitchen: 'restaurant',
  wash:    'restaurant',
  front:   'restaurant',
  buy:     'outside',
  work:    'outside',
  rest:    'home',
};

// ---------- 餐馆工作位 ----------
const RESTAURANT_SPOTS = {
  kitchen: [
    { x: 80, y: 27 },
    { x: 65, y: 26 },
  ],
  wash: [
    { x: 45, y: 14 },
    { x: 55, y: 14 },
  ],
  front: [
    { x: 20, y: 40 },
    { x: 42, y: 45 },
  ],
};

// ---------- 岗位台 ----------

const STATION_SPOTS = {
  kitchen: {
    x: 83, y: 30,
    label: '灶台',
    img: 'assets/ui/stove.png',
    imgW: 150, imgH: 80,   // 图片尺寸 = 点击区域
  },
  wash: {
    x: 45, y: 15,
    label: '洗碗槽',
    img: 'assets/ui/sink.png',
    imgW: 200, imgH: 80,
  },
  front: {
    x: 20, y: 46,
    label: '收银台',
    img: 'assets/ui/counter.png',
    imgW: 150, imgH: 80,
  },
};

// ---------- 桌椅 ----------
const TABLES = [
  { id: 't1', x: 30, y: 60 },
  { id: 't2', x: 70, y: 60 },
  { id: 't3', x: 30, y: 84 },
  { id: 't4', x: 70, y: 84 },
];

const CHAIRS = [
  { id: 'c1', x: 18, y: 60 },
  { id: 'c2', x: 42, y: 60 },
  { id: 'c3', x: 58, y: 60 },
  { id: 'c4', x: 82, y: 60 },
  { id: 'c5', x: 18, y: 84 },
  { id: 'c6', x: 42, y: 84 },
  { id: 'c7', x: 58, y: 84 },
  { id: 'c8', x: 82, y: 84 },
];

// ---------- 客人出入口 ----------
const CUSTOMER_ENTRY = { x: 50, y: 106 };
const CUSTOMER_EXIT  = { x: 50, y: 106 };

// ---------- 家庭活动范围（★ 别删）----------
const HOME_BOUNDS = {
  xMin: 12, xMax: 88,
  yMin: 55, yMax: 88,
};

// ============================================================
//   岗位承载力（单人基础值）
// ============================================================
const STATION_CAPACITY = {
  kitchen: 280,
  wash: 350,
  front: 400,
};

// ============================================================
//   设备升级（商店街"设备交易所"购买）
// ============================================================
const STATION_UPGRADES = [
  { id: 'stove',      station: 'kitchen', name: '灶台升级',  price: 30000, maxLv: 3, desc: '后厨承载力 +30%' },
  { id: 'dishwasher', station: 'wash',    name: '洗碗机',    price: 20000, maxLv: 3, desc: '洗碗承载力 +30%' },
  { id: 'pos',        station: 'front',   name: '收银系统',  price: 25000, maxLv: 3, desc: '前台承载力 +30%' },
];
// 设备交易所位置（商店街中下方）
const EQUIP_EXCHANGE_POS = { x: 65, y: 23 };