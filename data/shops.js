const SHOPS = [
  {
    id: 'ramen', name: '拉面店',
    x: 22, y: 25,
    baseWage: 1000, energyCost: 25,
    recipes: ['ramen', 'chashu', 'tonkotsu'],
    unlockAt: [1, 3, 6],
    workCount: 0, affinity: 0,
  },
  {
    id: 'curry', name: '咖喱店',
    x: 75, y: 25,
    baseWage: 1100, energyCost: 28,
    recipes: ['curry', 'friedCkn', 'currySet'],
    unlockAt: [1, 3, 6],
    workCount: 0, affinity: 0,
  },
  {
    id: 'sweet', name: '甜品店',
    x: 22, y: 68,
    baseWage: 900, energyCost: 18,
    recipes: ['pudding', 'cake', 'parfait'],
    unlockAt: [1, 3, 6],
    workCount: 0, affinity: 0,
  },
  {
    id: 'veg', name: '菜店',
    x: 75, y: 68,
    baseWage: 800, energyCost: 15,
    recipes: ['egg', 'salad', 'vegPlatter'],
    unlockAt: [1, 3, 6],
    workCount: 0, affinity: 0,
  },
];