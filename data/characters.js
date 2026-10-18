const CHARACTERS = [
  {
    id: 'leye', name: '须贺蕾叶',
    traits: { energyMax: 100, recovery: 40, canWork: true, canExpose: true, needEscort: false, workMultiplier: 1.0 },
    skills: ['rice', 'congyou'],
    positionBonus: { kitchen: 1.20, wash: 1.00, front: 1.15, buy: 0.10 },
    defaultState: { task: 'rest', visual: 'idle' },
  },
  {
    id: 'kokono', name: '马桥心玖',
    traits: { energyMax: 100, recovery: 50, canWork: true, canExpose: true, needEscort: false, workMultiplier: 0.8 },
    skills: ['miso', 'rice'],
    positionBonus: { kitchen: 1.30, wash: 1.10, front: 1.05, buy: 0.00 },
    defaultState: { task: 'rest', visual: 'idle' },
  },
  {
    id: 'housaki', name: '矢仓蓬咲',
    traits: { energyMax: 90, recovery: 40, canWork: false, canExpose: false, needEscort: false, workMultiplier: 0 },
    skills: [],
    positionBonus: { kitchen: 1.10, wash: 1.50, front: 0.00, buy: 0.00 },
    defaultState: { task: 'rest', visual: 'idle' },
  },
  {
    id: 'chisato', name: '梅里千樱梨',
    traits: { energyMax: 100, recovery: 40, canWork: true, canExpose: true, needEscort: false, workMultiplier: 1.3 },
    skills: [],
    positionBonus: { kitchen: 1.00, wash: 0.90, front: 1.30, buy: 0.15 },
    defaultState: { task: 'rest', visual: 'idle' },
  },
  {
    id: 'ningetsu', name: '四宫宁月',
    traits: { energyMax: 90, recovery: 50, canWork: true, canExpose: true, needEscort: true, workMultiplier: 0.5 },
    skills: [],
    positionBonus: { kitchen: 0.90, wash: 0.80, front: 1.00, buy: 0.25 },
    defaultState: { task: 'rest', visual: 'idle' },
  },
];

const TALENT = {
  leye:     '采购、前台',
  kokono:   '后厨、采购、家务',
  housaki:  '洗碗、家里蹲',
  chisato:  '打工、采购',
  ningetsu: '成长学习、意外收获',
};