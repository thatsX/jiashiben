/* ============================================================
   data/events.js —— 每周季节事件
   ============================================================ */

const SEASONAL_EVENTS = [
  { id: 'veggie',  name: '蔬菜丰收',  desc: '食材成本 -15%',  type: 'cost',    value: -0.15 },
  { id: 'meatUp',  name: '肉价上涨',  desc: '食材成本 +20%',  type: 'cost',    value: 0.20 },
  { id: 'holiday', name: '节日临近',  desc: '客流 +25%',      type: 'traffic', value: 0.25 },
  { id: 'rain',    name: '连日阴雨',  desc: '客流 -15%',      type: 'traffic', value: -0.15 },
  { id: 'promo',   name: '口碑传播',  desc: '客流 +10%',      type: 'traffic', value: 0.10 },
  { id: 'gasUp',   name: '煤气涨价',  desc: '固定成本 +30%',  type: 'fixed',   value: 0.30 },
  { id: 'quiet',   name: '平淡无奇',  desc: '没有特别的事',    type: 'none',    value: 0 },
];

function rollSeasonalEvent() {
  const ev = SEASONAL_EVENTS[Math.floor(Math.random() * SEASONAL_EVENTS.length)];
  return { ...ev };
}