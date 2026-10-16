/* ============================================================
   story/affinity.js —— 好感度剧情

   ★ 加新剧情：往下面加一条就行 ★

   格式：
   {
     at: 20,           // 好感阈值
     lines: [          // 逐句播放，点继续翻页
       { text: '旁白' },
       { who: '角色名', say: '台词' },
     ],
     reward: { ... },  // 剧情结束后应用
     rewardText: '显示文本',
   }

   奖励类型：
   { type: 'energyMax',     value: 10    }  精力上限 +10
   { type: 'recovery',      value: 5     }  每周恢复 +5
   { type: 'positionBonus', task: 'kitchen', value: 0.10 }  岗位加成 +0.10
   { type: 'workMultiplier', value: 0.2  }  打工倍率 +0.2
   { type: 'unlockMusic',   id: 'xxx'    }  解锁音乐 xxx
   { type: 'houseworkCost', value: -3    }  家务消耗变化（-3 = 从5降到2）

   ============================================================ */

const AFFINITY_STORIES = {

  // ============================================================
  //  须贺蕾叶 —— 自言自语（玩家本人）
  // ============================================================
  leye: [
    {
      at: 20,
      lines: [
        { text: '夜深了。店里的灯还亮着。' },
        { who: '蕾叶', say: '（最近大家都挺努力的……）' },
        { who: '蕾叶', say: '（我也得再加把劲！为了Family的每个人的幸福！）' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '蕾叶 · 精力上限 +10',
    },
    {
      at: 40,
      lines: [
        { text: '店铺打烊了。店已经慢慢开到了今天，蕾叶反复欣赏自己设计的特别满意的招牌。' },
        { who: '蕾叶', say: '（这下更多的人也了解了我的family了。蓬咲尽了自己的全力，千樱梨每天从早到晚风风火火，宁月会做的事情也越来越多了。）' },
        { who: '蕾叶', say: '（心玖……没有她的话，家里也运转不起来。）' },
        { who: '蕾叶', say: '（或者说，家里缺了任何一个人都是不完整的！不能再发生之前那样的事情，必须让每个成员都感受到我满满的LOVE！）' },
        { who: '蕾叶', say: '（……好，那就从做更美味的饭菜开始吧！）' },
      ],
      reward: { type: 'positionBonus', task: 'kitchen', value: 0.05 },
      rewardText: '蕾叶 · 后厨加成 +0.05',
    },
    {
      at: 60,
      lines: [
        { who: '蕾叶', say: '（心玖又在教千樱梨怎么采购了。）' },
        { who: '蕾叶', say: '（哼哼，可惜怎么教她也不会PK过我的~）' },
        { who: '蕾叶', say: '（等着千樱梨那家伙来自信满满地向我提出比试采购咯~）' },
      ],
      reward: { type: 'positionBonus', task: 'buy', value: -0.05 },
      rewardText: '蕾叶 · 采购上涨 -5%',
    },
    {
      at: 80,
      lines: [
        { who: '蕾叶', say: '（等赚够钱，Live House就能拿回来了。）' },
        { who: '蕾叶', say: '（到时候，我们一家就能再次天天一起上台唱歌了。）' },
        { who: '蕾叶', say: '（心玖写的每一首歌，都想和family一起天天唱，一天也不能少！）' },
      ],
      reward: { type: 'positionBonus', task: 'front', value: 0.10 },
      rewardText: '蕾叶 · 前台加成 +0.10',
    },
    {
      at: 100,
      lines: [
        { who: '蕾叶', say: '（无论是NEST，是这家餐馆，还是我们的家——）' },
        { who: '蕾叶', say: '（都只是我们family的载体。最不能失去的，还是家里的每一个成员。）' },
        { who: '蕾叶', say: '（只要和family在一起，我就什么都不害怕了！）' },
      ],
      reward: [
        { type: 'energyMax', value: 10 },
        { type: 'workMultiplier', value: 0.2 },
      ],
      rewardText: '蕾叶 · 精力上限 +10，打工倍率 +0.2',
    },
  ],

  // ============================================================
  //  马桥心玖 —— 额外给歌
  // ============================================================
  kokono: [
    {
      at: 20,
      lines: [
        { who: '心玖', say: '看你对那个音响一直很有兴趣的样子。' },
        { who: '心玖', say: '音响和舞台还是差得挺远的吧？' },
        { who: '心玖', say: '闲着没事改的。你拿去弹吧。' },
        { who: '蕾叶', say: '心玖——最爱你了——' },
        { who: '心玖', say: '我说了是闲着没事的时候的消遣啦……勒死我了！' },
      ],
      reward: [
        { type: 'energyMax', value: 5 },
        { type: 'unlockMusic', id: 'kokono_lullaby' },
      ],
      rewardText: '心玖 · 精力上限 +5，解锁音乐《革命道中》',
    },
    {
      at: 40,
      lines: [
        { who: '蕾叶', say: '心玖——今天晚上吃我做的饭吧？' },
        { who: '心玖', say: '欸？不用了，今天餐馆里还有剩下的吧？明天又不能再卖了，今天吃完能节约一点。' },
        { who: '蕾叶', say: '上次心玖说要我学着做味增汤什么的，我已经学会了！来尝尝吧，包含着我对心玖的LOVE的味增汤！' },
        { who: '心玖', say: '……你这家伙！不行，果然还是我来吧！' },
      ],
      reward: { type: 'positionBonus', task: 'kitchen', value: 0.10 },
      rewardText: '心玖 · 后厨加成 +0.10',
    },
    {
      at: 60,
      lines: [
        { who: '心玖', say: '蕾叶，宁月买了个光碟说要我交给你。' },
        { who: '蕾叶', say: '咦？宁月也会买光碟吗？' },
        { who: '心玖', say: '至少证明她越来越懂事了。幸好没跟你学。' },
        { who: '蕾叶', say: '我又做错啥了吗，心玖？告诉我好不好嘛——' },
        { who: '心玖', say: '没什么。光碟你拿去欣赏吧~' },
        { who: '心玖', say: '（也不知道把音响声音调小一点，要给我听神经衰弱了。这碟是我精挑细选的，你拿去听吧，一听一个不吱声。）' },
      ],
      reward: [
        { type: 'recovery', value: 5 },
        { type: 'unlockMusic', id: 'kokono_housaki' },
      ],
      rewardText: '心玖 · 每周恢复 +5，解锁音乐《神秘光碟》',
    },
    {
      at: 80,
      lines: [
        { who: '蕾叶', say: '这么晚了还要忙吗，心玖？早点休息吧……' },
        { who: '心玖', say: '我还要看账本，再说，你不也没睡，干什么呢？' },
        { who: '蕾叶', say: '我要确保family里的每个人都睡了再睡。' },
        { who: '心玖', say: '我猜你是想偷吃零食了。' },
        { who: '蕾叶', say: '没有这回事！' },
        { who: '心玖', say: '好吧，那我假装不知道——' },
      ],
      reward: { type: 'houseworkCost', value: -3 },
      rewardText: '心玖 · 家务消耗从 5 降到 2',
    },
    {
      at: 100,
      lines: [
        { who: '心玖', say: '……谢谢你，蕾叶。' },
        { who: '心玖', say: '被你们抢回来，真好。' },
        { who: '蕾叶', say: '作为family，那是必须的义务，不会放弃任何一个成员！' },
        { who: '心玖', say: '……' },
        { who: '蕾叶', say: '……' },
        { who: '心玖', say: '别那样看着我了。没有特殊cg。' },
        { who: '蕾叶', say: '……' },
        { who: '蕾叶', say: '欸嘿，心玖在摸耳朵哦~' },
      ],
      reward: [
        { type: 'energyMax', value: 5 },
        { type: 'unlockMusic', id: 'kokono_home' },
      ],
      rewardText: '心玖 · 精力上限 +5，解锁音乐《绑家里》',
    },
  ],

  // ============================================================
  //  矢仓蓬咲
  // ============================================================
  housaki: [
    {
      at: 20,
      lines: [
        { text: '蓬咲从柜子里探出头。' },
        { who: '蓬咲', say: '……那个。' },
        { who: '蓬咲', say: '碗我洗好了。' },
        { who: '蓬咲', say: '……以后也交给我吧。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'positionBonus', task: 'wash', value: 0.15 },
      rewardText: '蓬咲 · 洗碗加成 +0.15',
    },
    {
      at: 40,
      lines: [
        { who: '蓬咲', say: '……我今天。' },
        { who: '蓬咲', say: '在宿舍里练了一会儿贝斯。' },
        { who: '蓬咲', say: '（小声）……希望有一天，能再上台。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '蓬咲 · 精力上限 +10',
    },
    {
      at: 60,
      lines: [
        { who: '蓬咲', say: '蕾叶姐。' },
        { who: '蓬咲', say: '那个……会计的活。' },
        { who: '蓬咲', say: '我可以做。你别担心。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'positionBonus', task: 'wash', value: 0.20 },
      rewardText: '蓬咲 · 洗碗加成 +0.20',
    },
    {
      at: 80,
      lines: [
        { who: '蓬咲', say: '（从柜子里）……匿名账号。' },
        { who: '蓬咲', say: '有 5000 个人关注我了。' },
        { who: '蓬咲', say: '……他们不知道我是谁。' },
        { who: '蓬咲', say: '……挺好的。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'recovery', value: 10 },
      rewardText: '蓬咲 · 每周恢复 +10',
    },
    {
      at: 100,
      lines: [
        { who: '蓬咲', say: '蕾叶姐。' },
        { who: '蓬咲', say: '……谢谢。' },
        { who: '蓬咲', say: '谢谢你们没把我推出去。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '蓬咲 · 精力上限 +10',
    },
  ],

  // ============================================================
  //  梅里千樱梨
  // ============================================================
  chisato: [
    {
      at: 20,
      lines: [
        { who: '千樱梨', say: '爸爸！今天打工又赚了好多！' },
        { who: '千樱梨', say: '千樱梨联盟，迟早收编所有人！' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'workMultiplier', value: 0.2 },
      rewardText: '千樱梨 · 打工倍率 +0.2',
    },
    {
      at: 40,
      lines: [
        { who: '千樱梨', say: '……其实。' },
        { who: '千樱梨', say: '收编什么的，是开玩笑的。' },
        { who: '千樱梨', say: '我只是……想让大家多看看我。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'positionBonus', task: 'front', value: 0.15 },
      rewardText: '千樱梨 · 前台加成 +0.15',
    },
    {
      at: 60,
      lines: [
        { who: '千樱梨', say: '我今天嗓门是不是太大了？' },
        { who: '千樱梨', say: '隔壁店老板又投诉了。' },
        { who: '千樱梨', say: '……但客人都被喊过来了嘛！' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'workMultiplier', value: 0.3 },
      rewardText: '千樱梨 · 打工倍率 +0.3',
    },
    {
      at: 80,
      lines: [
        { who: '千樱梨', say: '蓬咲姐今天又在柜子里。' },
        { who: '千樱梨', say: '我给她留了一块布丁。' },
        { who: '千樱梨', say: '……她肯定不好意思吃。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'recovery', value: 5 },
      rewardText: '千樱梨 · 每周恢复 +5',
    },
    {
      at: 100,
      lines: [
        { who: '千樱梨', say: '爸爸！我们以后——' },
        { who: '千樱梨', say: '——永远都是一家人吧？' },
        { who: '蕾叶', say: '当然。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '千樱梨 · 精力上限 +10',
    },
  ],

  // ============================================================
  //  四宫宁月
  // ============================================================
  ningetsu: [
    {
      at: 20,
      lines: [
        { who: '宁月', say: '……蕾叶。' },
        { who: '宁月', say: '我发现了一件事。' },
        { who: '宁月', say: '……买菜的袋子，要自己拿。' },
        { who: '宁月', say: '……以前都是别人拿的。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'positionBonus', task: 'buy', value: -0.05 },
      rewardText: '宁月 · 采购上涨 -5%',
    },
    {
      at: 40,
      lines: [
        { who: '宁月', say: '我今天学会了煮饭要放水。' },
        { who: '宁月', say: '……以前不知道。' },
        { who: '宁月', say: '……现在知道了。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '宁月 · 精力上限 +10',
    },
    {
      at: 60,
      lines: [
        { who: '宁月', say: '蕾叶。' },
        { who: '宁月', say: '我发现，客人喜欢的不是高级的盘子。' },
        { who: '宁月', say: '……而是热乎乎的饭。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'positionBonus', task: 'front', value: 0.10 },
      rewardText: '宁月 · 前台加成 +0.10',
    },
    {
      at: 80,
      lines: [
        { who: '宁月', say: '蕾叶。' },
        { who: '宁月', say: '我可以弹钢琴给你们听吗？' },
        { who: '宁月', say: '……不是大小姐的那种。' },
        { who: '宁月', say: '……是家本的那种。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'recovery', value: 5 },
      rewardText: '宁月 · 每周恢复 +5',
    },
    {
      at: 100,
      lines: [
        { who: '宁月', say: '蕾叶。' },
        { who: '宁月', say: '……我以前的家里。' },
        { who: '宁月', say: '没有人会问我今天学了什么。' },
        { who: '宁月', say: '……在这里，你们会问。' },
        { who: '宁月', say: '……谢谢。' },
        { text: '这段剧情是AI自动填充的，我还没写呢，假装没看到吧' },
      ],
      reward: { type: 'energyMax', value: 10 },
      rewardText: '宁月 · 精力上限 +10',
    },
  ],
};