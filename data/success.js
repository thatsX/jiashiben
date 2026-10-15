/* ============================================================
   data/success.js —— 胜利结局
   NEST 门口，大家走进去
   ============================================================ */

const SUCCESS_SCRIPT = {
  id: 'success',
  lines: [
    {
      bg: 'assets/bg/nest.png',
      sprites: [
        { id: 'leye',     x: 15, y: 80 },
        { id: 'kokono',   x: 32, y: 80 },
        { id: 'housaki',  x: 50, y: 80 },
        { id: 'chisato',  x: 68, y: 80 },
        { id: 'ningetsu', x: 85, y: 80 },
      ],
      portrait: null,
      text: '【NEST 门口 · 天气晴朗】',
    },
    {
      text: '蕾叶把钥匙插进锁孔，转了一圈。门开了。',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '我们的——！',
    },
    {
      sprites: [
        { id: 'leye',     x: 15, y: 80 },
        { id: 'kokono',   x: 32, y: 80 },
        { id: 'housaki',  x: 50, y: 80 },
        { id: 'chisato',  x: 68, y: 80 },
      ],
      portrait: 'ningetsu',
      portraitSide: 'center',
      text: '宁月走进去，摸了摸钢琴，没说话。',
    },
    {
      sprites: [
        { id: 'leye',    x: 20, y: 80 },
        { id: 'kokono',  x: 38, y: 80 },
        { id: 'chisato', x: 68, y: 80 },
      ],
      portrait: 'housaki',
      portraitSide: 'center',
      text: '蓬咲站在门口，犹豫了一下，然后迈了进去。',
    },
    {
      sprites: [
        { id: 'leye',    x: 25, y: 80 },
        { id: 'chisato', x: 70, y: 80 },
      ],
      portrait: 'kokono',
      portraitSide: 'center',
      text: '心玖最后一个进去，感觉五味杂陈。实话说，她从来没想过这三个怪兽脑袋一拍想到的事情还能成功。',
    },
    {
      sprites: [
        { id: 'leye', x: 50, y: 80 },
      ],
      portrait: null,
      text: '蕾叶站在门口，抬头看了一眼招牌。',
    },
    {
      text: 'NEST。还是那几个字母。',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '奶奶……我带着我的 family 回来了！',
    },
    {
      bg: '',
      sprites: [],
      portrait: null,
      text: '——结局：成功夺回 Live House',
    },
  ],
};