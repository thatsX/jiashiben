/* ============================================================
   data/mafia.js —— 极道支线数据
   ============================================================ */

const MAFIA_QUESTS = [
  {
    id: 0,
    title: '找上门去',
    desc: '去「极道酒吧/娱乐城」打工 2 次，探探底细。',
    type: 'work_count',
    target: 2,
    current: 0,
    deadlineAdd: 3
  },
  {
    id: 1,
    title: '黑市门路',
    desc: '在「地下拳场」参与押注 3 次，获取地下资金流线索。',
    type: 'bet_count',
    target: 3,
    current: 0,
    deadlineAdd: 4
  },
  {
    id: 2,
    title: '极道晚宴',
    desc: '极道声望达到 200，并举办一次「地下 Live」引蛇出洞。',
    type: 'live_hold',
    target: 200,        // 声望门槛
    current: 0,         // 记录声望
    liveDone: false,    // ★ 专门记录 Live 是否办过
    deadlineAdd: 6
  },
  {
    id: 3,
    title: '最终清算',
    desc: '赚取 200,000 现金作为决战雇佣安保的资金。',
    type: 'cash',
    target: 200000,
    current: 0,
    deadlineAdd: 4
  }
];

const MAFIA_QUESTS_SCRIPTS = [
  // 任务 0 完成：打工
  [
    { bg: 'assets/bg/home.png', text: '千樱梨显然对这种新生活很兴奋……也不知道怎么做到的，真让这家伙找到小弟了。' },
    { portrait: 'chisato', who: '千樱梨', say: '哼哼！蕾叶，我现在可是真的有千樱梨联盟了哦？你要不要考虑加入？' },
    { portrait: 'leye', who: '蕾叶', say: '哇塞~所以我们的钱拿回来了吗？' },
    { portrait: 'chisato', who: '千樱梨', say: '……' },
    { portrait: 'leye', who: '蕾叶', say: '没有。我猜对了吧？' },
    { portrait: 'chisato', who: '千樱梨', say: '可恶……不过我可是带回来一个超级牛的消息哦？' },
    { portrait: 'leye', who: '蕾叶', say: '那是什么事？' },
    { portrait: 'chisato', who: '千樱梨', say: '地下拳场的位置！很多大佬都在那里下注，店里的那点损失赢三次就能拿回来！' },
  ],
  // 任务 1 完成：押注
  [
    { bg: 'assets/bg/ring.png', text: '地下拳场充斥着兴奋的人群和令人不适的味道。下了三把……实话说，有没有赢回来钱不知道，但是人已经不太舒服了。' },
    { portrait: 'kokono', who: '心玖', say: '所以？你的解决方案就是来这种地方？' },
    { portrait: 'leye', who: '蕾叶', say: '呜……没办法啊……那么多钱要怎么弄回来嘛……' },
    { portrait: 'kokono', who: '心玖', say: '乖乖做生意总有法子的，这走歪门邪道真的不太好……' },
    { portrait: 'kokono', who: '心玖', say: '等一下。刚刚那个人好眼熟啊……' },
    { portrait: 'leye', who: '蕾叶', say: '嗯？那个……' },
    { portrait: 'kokono', who: '心玖', say: '之前在娱乐公司的时候，我好像见过他。还是个领导……' },
    { portrait: 'leye', who: '蕾叶', say: '他是来玩的吗？还是说……' },
    { portrait: 'kokono', who: '心玖', say: '我总感觉他也认出我来了。对了，蕾叶，我听说他们好像还办什么地下live。' },
    { portrait: 'leye', who: '蕾叶', say: '有live可以玩……但我总觉得不能把family带到那种危险的地方去吧！' },
    { portrait: 'kokono', who: '心玖', say: '我想要是我们不去做点什么，我们也没法平安脱身……况且我总觉得那家娱乐公司很奇怪。' },
    { portrait: 'leye', who: '蕾叶', say: '非要说的话，我也不知道我爸每天都在干什么……' },
    { portrait: 'kokono', who: '心玖', say: '去开地下live吧，蕾叶。也就当是那么久都没开过live了——而且要是不让我们进，那不就实锤了那个公司和这些极道有关系？' },
  ],
  // 任务 2 完成：Live
  [
    { bg: 'assets/bg/bkstage.png', text: '地下 Live 大获成功。在台下一片欢呼声和应援中，台上的五人谢幕退场。' },
    { text: '在后台走廊上，突然有一个眼神阴狠的老头出现在五人面前。蕾叶完全作好了战斗准备，但是那老头突然跪下来——' },
    { portrait: 'leye', who: '蕾叶', say: '诶诶诶？老爷爷你干嘛！' },
    { text: '老头就这么痛哭流涕：“须贺大小姐！我们开始还没认出来，但是现在知道了！你父亲前段时间和二把手斗，现在简直是疯了一样到处清洗！但是那群长老又说，不姓须贺的他们不认啊！”' },
    { portrait: 'kokono', who: '心玖', say: '（？这又是怎么一回事？）' },
    { portrait: 'kokono', who: '心玖', say: '老爷爷，您先站起来，我们有事慢慢谈，但是超过能力范围的事情还是不能答应。' },
    { portrait: 'leye', who: '蕾叶', say: '诶呃……什么情况？' },
    { text: '老头摇了摇头：“实不相瞒。最近须贺组的二把手想要单干，因此爆发了一场很大的冲突。现在社长为了保他白道上的生意，决定把我们当成替罪羊丢出去。我们需要一个新的旗帜，但是这也是机会，大小姐。”' },
    { portrait: 'leye', who: '蕾叶', say: '我不会丢下我的family自己去沽名钓誉的……' },
    { portrait: 'kokono', who: '心玖', say: '蕾叶，我不觉得他们已经找到我们的情况下还能善罢甘休。' },
    { portrait: 'leye', who: '蕾叶', say: '……但是如果是为了保护family，那么我什么都愿意去做。' },
  ],
  // 任务 3 完成：资金备齐
  [
    { bg: 'assets/bg/nest.png', text: '决战资金已经备齐，千樱梨带人包围了NEST……今天须贺社长一定会来这里准备开始NEST的改造工程。无论是为了NEST还是为了family，这一战都无可避免。' },
    { text: '“决战的时候到了。”' }
  ]
];

const GODFATHER_ENDING_SCRIPT = {
  id: 'ending-godfather',
  lines: [
    // ============================================
    // 第一幕：决战的尾声，老爹认输
    // ============================================
    { bg: 'assets/bg/nest.png', text: 'NEST 门口。' },
    { text: '须贺社长这辈子都想不到还会有这种事情，自己那个自己没搞懂过的女儿带着几个不知道哪里找来的family，带了一群人，把自己的安保和自己都揍了一顿。' },
    { text: '这简直比那天现场抢走他公司里的偶像练习生还让人难以接受。' },
    { portrait: 'leye', portraitSide: 'center', who: '蕾叶', say: '老爹，你一直说理解不了我……我也理解不了你。什么公司，什么营收，什么业绩……我都不是很懂。' },
    { text: '亲爹黑着脸，死死盯着蕾叶，以及她身后那几个他有印象又没印象的人。那个偶像练习生他还稍微记得一点脸，其他那几个他只是笃定绝对是那几个“family”。' },
    { portrait: 'leye', portraitSide: 'center', who: '蕾叶', say: '但是我只知道一件事，就是我不会丢下我的Family。' },
    { text: '亲爹惨笑了一声，低下头。' },
    { text: '“我从来都……理解不了你这孩子啊。”' },
    { text: '画面暗下。' },

    // ============================================
    // 第二幕：几周后，黑帮总部的日常
    // ============================================
    { bg: 'assets/bg/nest.png', portrait: null, text: '【几个月后 · FAMILY总部（原NEST）】' },
    { text: '虽然这地方的位置也就那样，但是教父坚持要留在这里，于是也就顺理成章地成为了总部。' },

    { who: '极道小弟A', say: '哎……须贺老大天天在组里发扬什么“Family理论”，说要把整个帮派都当成一个不可分割的family，大家要像家人一样……听得我耳朵都起茧子了。我们真的是黑帮吗？' },
    { who: '极道小弟B', say: '你小声点！千万不要让马桥老大听到了！不然把你关进“忏悔室”……我实话说吧，虽然说须贺老大才是真正的社长，但我总觉得马桥老大整她跟整狗一样的。你说马桥老大说往东须贺老大敢往西不。' },
    { who: '极道小弟A', say: '嘘！这话可不能说！就算不是这两个人，还有千樱梨组长，现在帮派大大小小的事情全在她手上。你千万别当面反驳她那什么“千樱梨联盟”，乖乖承认自己是手下成员就行了，这种时候不说自己是须贺组的也不会有人追究。倒是上次反对的那个堂口，现在全被排挤去洗盘子了。' },
    { who: '极道小弟B', say: '说到这个……据说老大的教子、预订的继承人四宫小姐，是真正的大家族出身。平时不怎么露面，我都感觉没怎么见过。而且……好像这家伙有个幽灵在侍奉一样，偶尔有人看到过一个影子在走廊里跟着她飘，怪渗人的……那到底是谁呢？' },

    // ============================================
    // 第三幕：被心玖打断
    // ============================================
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '你们两个……还要嚼舌根到什么时候？' },
    { text: '两个小弟一回头，吓得瞬间土下座，额头贴地。' },
    { who: '极道小弟A & B', say: '马桥老大对不起！我们罪该万死！' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '少说不该说的话。你们走吧。' },
    { text: '两人连滚带爬地逃跑了。' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '……事情怎么会变成这样。' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '我记得我还是高中生吧？多久没去划小船上课了？' },
    { portrait: 'leye', portraitSide: 'left', who: '蕾叶', say: '心玖——你说今天晚上要写新曲子的吧？上次那个我已经让整个帮派都强制学会了！' },
    { portrait: 'kokono', portraitSide: 'right', who: '心玖', say: '整个……帮派？哈？' },
    { portrait: 'leye', portraitSide: 'left', who: '蕾叶', say: '心玖的曲子写得又好听，还饱含着对family的爱！我们FAMILY的每一个成员都应该学会感受这种爱！' },
    { bg: '', text: '马桥心玖只觉得眼前一黑……' },
    { text: '一阵急促的闹钟声“叮铃铃铃——！”' },

    // ============================================
    // 第四幕：梦醒，回到原点
    // ============================================
    { bg: 'assets/bg/bedroom.png', portrait: null, text: '心玖猛地从床上坐起来，满头大汗，大喘气。' },
    { text: '门被猛地推开。' },
    { portrait: 'leye', portraitSide: 'center', who: '蕾叶', say: '心玖——！来开会！Family在身边，什么样的困难都可以克服！我想到了，我们要传播family的文化！Family最重要的就是填饱肚子，所以让我们从做饭开始吧！就叫“家是本”！' },
    { text: '心玖看着穿着睡衣的蕾叶，回想起梦里那不堪回首的黑道帝国，表情逐渐扭曲。' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '………（黑脸）' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '出去。' },
    { portrait: 'leye', portraitSide: 'center', who: '蕾叶', say: '不要嘛！心玖出来开会！' },
    { portrait: 'kokono', portraitSide: 'center', who: '心玖', say: '那你倒是先出去让我换衣服啊。' }
  ]
};

const MAFIA_SHOPS = [
  { id: 'bar',    name: '极道酒吧',   x: 25, y: 18, baseWage: 5000, energyCost: 35, recipes: [], unlockAt: [1], workCount: 0, affinity: 0 },
  { id: 'casino', name: '地下娱乐城', x: 75, y: 18, baseWage: 7000, energyCost: 45, recipes: [], unlockAt: [1], workCount: 0, affinity: 0 },
];