/* ============================================================
   data/bankrupt.js —— 破产结局
   桥洞场景
   ============================================================ */

const BANKRUPT_SCRIPT = {
  id: 'bankrupt',
  lines: [
    {
      bg: 'assets/bg/bridge.png',
      sprites: [
        { id: 'leye',     x: 20, y: 70 },
        { id: 'kokono',   x: 35, y: 72 },
        { id: 'housaki',  x: 50, y: 70 },
        { id: 'chisato',  x: 65, y: 72 },
        { id: 'ningetsu', x: 80, y: 70 },
      ],
      portrait: null,
      text: '【桥洞下 · 深夜】',
    },
    {
      text: '五个人坐在桥洞底下，围成一圈。',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '……所以，我们好像是没钱了。',
    },
    {
      text: '沉默。',
    },
    {
      portrait: 'chisato',
      portraitSide: 'center',
      who: '千樱梨',
      say: '不可以！怎么可能会失败！',
    },
    {
      portrait: 'ningetsu',
      portraitSide: 'center',
      who: '宁月',
      say: '店居然可以不赚钱吗，原来如此，世界如此广阔……',
    },
    {
      portrait: 'housaki',
      portraitSide: 'center',
      who: '蓬咲',
      say: '……我的贷款……还不上了……呜呜呜都是因为是这样的底层弱弱的人类，拖了所有人的后腿，所以才变成这样子的吧……',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      text: '心玖没说话，端起桌子上凉掉的茶水，喝了一口。',
    },
    {
      text: '实话说，只是因为真的不知道改说什么话了，只能在那里坐着很无语地微笑。',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '振作……振作起来嘛！只要有 family 在身边，什么样的事情都可以解决……',
    },
    {
      text: '这种时候了还在那里什么 family 不 family 的。人在无语的时候只能笑了。',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '明天开始，只好去当线上客服还债了。',
    },
    {
      text: '头好疼……因为没吃什么像样的东西，眼前逐渐黑了下来。',
    },
  ],
};