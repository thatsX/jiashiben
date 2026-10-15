/* ============================================================
   data/customers.js —— 客人数据

   ★ 加新特殊客人：复制下面的「模板」，改改就行 ★
   ============================================================ */

const CUSTOMERS = [
  // ============================================================
  //  普通客人（随机出现，点击一句话）
  // ============================================================
  { id: 'worker',  name: '上班族', type: 'normal' },
  { id: 'student', name: '学生',   type: 'normal' },
  { id: 'granny',  name: '老奶奶', type: 'normal' },
  { id: 'kid',     name: '小孩',   type: 'normal' },

  // ============================================================
  //  特殊客人：脚本式（完整剧本，无选项）
  //  适合一次性剧情客人
  // ============================================================
  { id: 'critic',    name: '美食评论家', type: 'special', minWeek: 4, once: true },
  { id: 'zhulaoban', name: '两江总督',     type: 'special', minWeek: 8, once: true, chance: 0.1 },

  // ============================================================
  //  特殊客人：互动式（有对话选项）
  //  适合反复出现的趣味客人
  // ============================================================

  // ---- 例子：普通的蓝毛贝斯手 ----
  {
    id: 'bassist',
    name: '普通的蓝毛贝斯手',
    type: 'special',
    minWeek: 2,
    once: false,
    chance: 0.4,
    dialogue: {
      opening: '早就听说过这里美味又实惠……不行，点得太多了会长胖！',
      choices: [
        {
          text: '少吃点',
          leyeReply: '这次吃不了下次还可以再来。',
          effect: { type: 'reputation', value: 3 },
          effectText: '“有道理……” 声誉 +3',
        },
        {
          text: '吃吧！',
          leyeReply: '就要吃得多才能壮实健康！',
          effect: { type: 'unitPriceBonus', value: 0.15 },
          effectText: '“那就放纵这一回吧！” 本周客单价 +15%',
        },
      ],
    },
  },

  // ---- 例子：一次性的赠菜谱客人 ----
  {
    id: 'master',
    name: '神秘料理人',
    type: 'special',
    minWeek: 10,
    once: true,
    chance: 0.5,
    dialogue: {
      opening: '年轻人，你这家店……有点意思。要不要学一手？',
      choices: [
        {
          text: '请务必教我！',
          leyeReply: '家是本最缺的就是菜谱了！',
          effect: { type: 'recipe' },
          effectText: '随机获得一道新菜谱',
        },
        {
          text: '客人先坐下吃饭吧',
          leyeReply: '客人比菜谱重要。',
          effect: { type: 'reputation', value: 10 },
          effectText: '声誉 +10',
        },
      ],
    },
  },

  // ---- 例子：多效果叠加 ----
  {
    id: 'youtuber',
    name: '“大”UP主',
    type: 'special',
    minWeek: 5,
    once: false,
    chance: 0.25,
    dialogue: {
      opening: '扣你几喵姆喵姆！今天喵姆亲可是特意坐车来到了这家最近超级火的“家是本”餐厅哦？',
      choices: [
        {
          text: '随便拍！',
          leyeReply: '欢迎大家来到家是本品尝我的family制作的，充满超大的爱的饭菜！',
          effect: [
            { type: 'trafficBonus',   value: 0.10 },
            { type: 'unitPriceBonus', value: -0.05 },
          ],
          effectText: '客流 +10%，但客单价 -5%',
        },
        {
          text: '不去凑热闹',
          leyeReply: '有主播来也不知道是好是坏呢……',
          effect: { type: 'tip', value: 500 },
          effectText: '小费 +500',
        },
      ],
    },
  },
    // ============================================================
  //  新特殊客人
  // ============================================================

  // ---- 箱子 ----
  {
    id: 'box',
    name: '箱子',
    type: 'special',
    minWeek: 2,
    once: false,
    chance: 0.35,
    dialogue: {
      opening: '……（看了半天菜单，最后只点了一碗白米饭）',
      choices: [
        {
          text: '这顿我请了！',
          leyeReply: '商店街的奶奶们说了，再怎么样不能让人饿着！',
          effect: [
            { type: 'tip', value: -25 },
            { type: 'reputation', value: 3 },
          ],
          effectText: '“有妈妈的味道……” 现金 -25，声誉 +3',
        },
        {
          text: '假装没看见',
          leyeReply: '（默默走开）',
          effect: null,
          effectText: '什么也没发生',
        },
      ],
    },
  },

  // ---- 大金毛 ----
  {
    id: 'golden',
    name: '大金毛',
    type: 'special',
    minWeek: 2,
    once: false,
    chance: 0.3,
    dialogue: {
      opening: '小祥喜欢吃什么呢……这个？那个？啊啊啊不知道了！全都来一份！',
      choices: [
        {
          text: '好嘞！全上！',
          leyeReply: '全都点一份带回去吧？让你的家人也感受到BIG LOVE吧！',
          effect: { type: 'menuRevenue' },
          effectText: function () {
            const total = state.menu.reduce(function (sum, id) {
              const r = RECIPES.find(function (x) { return x.id === id; });
              return sum + (r ? r.price : 0);
            }, 0);
            return '今日营收 +' + total + '（全菜单总价）';
          },
        },
      ],
    },
  },

    // ---- 神秘紫发女 ----
  {
    id: 'purple',
    name: '神秘紫发女',
    type: 'special',
    minWeek: 4,
    once: true,
    chance: 0.4,
    dialogue: {
      opening: '那个黄发小女孩去哪里了……',
      choices: [
        {
          text: '电！',
          leyeReply: '电——！',
          effect: null,
          effectText: '（疼肚子老师灰溜溜地离开了……）',
        },
      ],
    },
    // 如果没跟她对话（无视），结算时触发
    onSurvive: {
      effect: { type: 'energy', charId: 'ningetsu', value: -40 },
      effectText: '紫发女一直坐在那里盯着看……宁月被吓到了，精力 -40',
    },
  },

    // ---- 东京阿农（探店主播的第二天来）----
  {
    id: 'anon',
    name: '东京阿农',
    type: 'special',
    minWeek: 3,
    once: false,
    chance: 0.5,
    condition: function () {
      return state.lastWeekSpecials &&
             state.lastWeekSpecials.indexOf('youtuber') >= 0;
    },
    dialogue: {
      opening: '我看到喵姆亲推荐这儿了！',
      choices: [
        {
          text: '给她推荐菜品',
          leyeReply: '那就来尝尝我们的family饱含着love的菜品吧！',
          effect: [
            { type: 'reputation', value: 2 },
            { type: 'tip', value: 50 },
          ],
          effectText: '声誉 +2，现金 +50',
        },
      ],
    },
  },

  // ---- 野猫（菜单上有芭菲才来）----
  {
    id: 'cat',
    name: '野猫',
    type: 'special',
    minWeek: 2,
    once: false,
    chance: 0.6,
    condition: function () {
      return state.menu.indexOf('parfait') >= 0;
    },
    dialogue: {
      opening: '（盯着菜单看，目光停在芭菲上）',
      choices: [
        {
          text: '请她吃芭菲',
          leyeReply: '（默默端上一份抹茶芭菲）',
          effect: { type: 'changeVisual', value: 'happy' },
          effectText: '（欢快地吃）',
          noLeave: true,
        },
      ],
    },
  },
  // ============================================================
  //  ★★★ 特殊客人模板 ★★★
  //  复制下面这整段，改改就能加新客人
  // ============================================================
  /*
  {
    id: 'xxx',                    // 唯一 id，贴图放 assets/customers/xxx.png
    name: '客人名字',              // 界面显示的名字
    type: 'special',
    minWeek: 2,                   // 最早在第几周出现
    once: false,                  // true = 只出现一次，false = 可重复
    chance: 0.4,                  // 出现概率（声誉加成：50 = 1x，100 = 2x）
    dialogue: {
      opening: '客人开口说的一句话',
      choices: [
        {
          text: '选项A',
          leyeReply: '蕾叶的回答A',
          effect: { type: 'reputation', value: 5 },
          effectText: '声誉 +5',
        },
        {
          text: '选项B',
          leyeReply: '蕾叶的回答B',
          effect: [
            { type: 'trafficBonus', value: 0.10 },
            { type: 'tip', value: 300 },
          ],
          effectText: '本周客流 +10%，小费 +300',
        },
      ],
    },
  },
  */

  // ============================================================
  //  效果类型速查（effect.type）
  // ============================================================
  //
  //  { type: 'reputation',     value: 5    }   声誉 +5（可负）
  //  { type: 'trafficBonus',   value: 0.10 }   本周客流 +10%
  //  { type: 'unitPriceBonus', value: 0.15 }   本周客单价 +15%
  //  { type: 'tip',            value: 300  }   直接加 300 现金（小费）
  //  { type: 'recipe' }                        随机获得一道未解锁菜谱
  //  { type: 'recipe',         id: 'ramen' }   获得指定 id 的菜谱
  //
  //  effect 可以是单个对象，也可以是数组（一次触发多个效果）。
  //
  // ============================================================
];