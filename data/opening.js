/* ============================================================
   data/opening.js —— 开场动画
   拆成两段：客厅 + 卧室
   破产结局复用卧室段
   ============================================================ */

// ---------- 客厅段 ----------
const OPENING_LIVING_SCRIPT = {
  id: 'opening-living',
  lines: [
    {
      bg: 'assets/bg/home.png',
      sprites: [],
      portrait: null,
      text: '千樱梨和蕾叶在家里一如既往地……反正不安生。',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '是千樱梨联盟啦！本大人的鼓声肯定会狠狠盖过你的，就像上次…',
    },
    {
      text: '两人好像突然想到什么一样的，突然沮丧了起来。',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '…现在好像没有 live house 能演奏了呢。',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: '…总有办法能把 live house 拿回来的！',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '那可要不少钱…打工的话得一天打一百份的样子…',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: '我们来开餐饮店吧！食物是 family 的灵魂所在，我们就用包含着 family 的 LOVE 的食物来感染人们！等大家都了解了我们的 family，他们肯定也会回来 live house 看我们的演出，到时候再也不怕有人把 NEST 抢走了！',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: '我们就开一家"家是本"文化餐厅！',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '……',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '为什么是家是本！应该是千樱梨联盟总部才对，吃了千樱梨大人的饭，就得加入千樱梨联盟！',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: '还是家是本好！只有用大大的 love 才能征服食客！',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '千樱梨联盟！',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: 'family！',
    },
    {
      text: '千樱梨，蕾叶：……',
    },
    {
      portrait: 'chisato',
      portraitSide: 'right',
      who: '千樱梨',
      say: '开会！开会讨论一下这件事！我去把蓬咲和宁月叫起来！你去把心玖拉过来！',
    },
    {
      portrait: 'leye',
      portraitSide: 'left',
      who: '蕾叶',
      say: '好啊，那就开会！',
    },

    // ---------- 黑屏过渡 ----------
    {
      bg: '',
      sprites: [],
      portrait: null,
      text: '“咚咚咚……嘭！”',
    },
  ],
};

// ---------- 卧室段（破产结局也复用这段）----------
const OPENING_BEDROOM_SCRIPT = {
  id: 'opening-bedroom',
  lines: [
    {
      bg: 'assets/bg/bedroom.png',
      sprites: [],
      portrait: null,
      text: '心玖的卧室。',
    },
    {
      sprites: [
        { id: 'kokono', x: 75, y: 60, anim: 'sleep' },
      ],
      decos: [
        { x: 75, y: 60, w: 105, h: 90, text: '盖小被', color: '#fff' },
      ],
      portrait: null,
      text: '某人还躺在床上没起来。',
    },
    {
      sprites: [
        { id: 'leye',   x: 75, y: 60, anim: 'dash-in' },
        { id: 'kokono', x: 75, y: 60, anim: 'knock-out' },
      ],
      text: '心玖——来开会！',
      auto: 900,
    },
    {
      sprites: [],
      decos: [],
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '哈？',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: 'Family 在身边，什么样的困难都可以克服！心玖，我想到了，我们要传播 family 的文化！Family 最重要的就是填饱肚子，所以让我们从做饭开始吧！就叫"家是本"！',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '………（黑脸）',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '出去。',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '不要嘛！心玖出来开会！',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '那你倒是先出去让我换衣服啊。',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '唔…（心虚地想退出去）',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '生活费都成问题，哪里来的钱去开什么餐饮店…',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '（小声）不是有什么创业扶持政策嘛，我们去申请一笔援助资金就好了…',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '那个要满 18 才能申请吧…',
    },
    {
      portrait: 'leye',
      portraitSide: 'center',
      who: '蕾叶',
      say: '…哦对了！蓬咲不是可以帮忙吗！这样，开会的时候我们也问问她的意见吧！谢谢你心玖！我刚刚还没想到这个问题呢！',
    },
    {
      portrait: 'kokono',
      portraitSide: 'center',
      who: '心玖',
      say: '（捧读）……哇。',
    },

    // ---------- 收尾 ----------
    {
      bg: '',
      sprites: [],
      portrait: null,
      text: '就这样，在心玖的提醒和 family 的支持下，我们 family 的"家是本"餐饮店开始营业啦！',
    },
    {
      text: '多亏了大家的支持，我们拿回 NEST 的征程就从这里开始！',
    },
    {
      text: '只要还清三十万贷款并赚够一百万，就能成功！',
    },
  ],
};