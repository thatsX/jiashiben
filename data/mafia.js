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
    id: 'A', title: '幽灵军师', desc: '派蓬咲完成 5 次洗碗/采购类夜间委托。',
    type: 'commission_assignee', assignee: 'housaki',
    filterAttr: ['wash', 'buy'], target: 5, current: 0, deadlineAdd: 6
  },
  // ★ 新增任务 B
  {
    id: 'B', title: '联盟分盟', desc: '派千樱梨完成 4 次前台/后厨类夜间委托。',
    type: 'commission_assignee', assignee: 'chisato',
    filterAttr: ['front', 'kitchen'], target: 4, current: 0, deadlineAdd: 6
  },
  // ★ 新增任务 C
  {
    id: 'C', title: '教母的账本', desc: '累计获得 30,000 黑道收入。',
    type: 'mafia_income', target: 30000, current: 0, deadlineAdd: 6
  },
  // ★ 新增任务 D
  {
    id: 'D', title: '大小姐驾到', desc: '老爹派警察来查。宁月出面解决。',
    type: 'event_auto', target: 1, current: 0, deadlineAdd: 3
  },
  {
    id: 'E', title: '教父的家训', desc: '有人似乎有话要对蕾叶说……',
    type: 'event_random', target: 1, current: 0, deadlineAdd: 4
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

const MAFIA_QUESTS_SCRIPTS = {
  // 任务 0 完成：打工
  0:[
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
  1:[
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
  2:[
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
    // 任务 A 完成：幽灵军师
  A:[
    { bg: 'assets/bg/home.png', text: '凌晨三点。客厅里只开了一盏台灯。' },
    { text: '蓬咲鬼鬼祟祟地挪到客厅里来……' },
    { portrait: 'housaki', who: '蓬咲', say: '……面我吃一口。' },
    { portrait: 'leye', who: '蕾叶', say: '饿了就出来吃嘛！' },
    { portrait: 'housaki', who: '蓬咲', say: '这段时间鼓起勇气……虽然知道没什么用，但是勉强完成了一些委托……有些在意的事情……' },
    { portrait: 'chisato', who: '千樱梨', say: '地图上这些歪歪扭扭的涂鸦是什么啊？看久了还挺艺术的！' },
    { portrait: 'kokono', who: '心玖', say: '这几个委托都在NEST附近，有的是清理证据，有的是打扫现场……都集中在和娱乐公司有关的地方。' },
    { portrait: 'leye', who: '蕾叶', say: '做娱乐公司很容易惹上事？那我们就不做娱乐公司……' },
    { portrait: 'kokono', who: '心玖', say: '哇~好精准的解读呢。' },
    { portrait: 'housaki', who: '蓬咲', say: '这些地方的委托特别多……只是改成偶像录音室应该不会这样吧……呜呜这都是我这个弱弱人类瞎猜的东西，困扰了你们真的很对不起！但是《鬼时雨》第十五卷里面，轰堂君的兄弟正是通过附近发生骚乱的位置定位到了对手在哪里活动……' },
    { portrait: 'leye', who: '蕾叶', say: '帮大忙了！蓬咲就是我们FAMILY最强的军师！' },
    { portrait: 'housaki', who: '蓬咲', say: '请、请不要用这么羞耻的称呼叫我……' },
  ],
    // 任务 B 完成：联盟分盟
  B:[
    { bg: 'assets/bg/nest.png', text: '几天后，NEST门外。' },
    { text: '千樱梨大摇大摆地走在前面，身后居然跟着几个穿黑西装、满脸写着“不好惹”的壮汉。' },
    { portrait: 'chisato', who: '千樱梨', say: '哼哼！看清楚了吗，蕾叶！这就是本大人的“千樱梨联盟东街分盟”和“西街分盟”！' },
    { portrait: 'leye', who: '蕾叶', say: '哇塞——！千樱梨的联盟居然这么强大了！' },
    { portrait: 'chisato', who: '千樱梨', say: '哼哼，该把招牌改成千樱梨联盟了吧？' },
    { text: '一个壮汉小声嘀咕：“不是说好了是须贺组的吗？”' },
    { text: '另一个壮汉打断了他：“还嫌刚刚被这个怪力鼓手教训的不够？”' },
    { portrait: 'chisato', who: '千樱梨', say: '嗯？我好像听到了什么？' },
    { text: '壮汉们集体立正：“千樱梨联盟万岁！”' },
    { portrait: 'kokono', who: '心玖', say: '千樱梨，不要随便带奇怪的人到家里来好吗？' },
    { portrait: 'chisato', who: '千樱梨', say: '千樱梨联盟的成员才不是什么奇怪的人！' },
    { portrait: 'kokono', who: '心玖', say: '唉。既然来了须贺组，就要守须贺组的规矩。' },
    { portrait: 'leye', who: '蕾叶', say: '第一，我们都是一个大的FAMILY——' },
    { portrait: 'kokono', who: '心玖', say: '蕾叶……' },
    { text: '组长小妹立正了。”' },
    { portrait: 'kokono', who: '心玖', say: '不过突然来投靠这件事，背后应该是有什么隐情吧？' },
    { portrait: 'chisato', who: '千樱梨', say: '那当然是被千樱梨联盟的头号人物折服——' },
    { portrait: 'kokono', who: '心玖', say: '你不用说我也知道你揍了他们两个……' },
    { portrait: 'chisato', who: '千樱梨', say: '最近东街和西街一群人到处收什么物业费，制造骚乱挑起争斗，总之最后是我平息了争斗！' },
    { portrait: 'kokono', who: '心玖', say: '（只是全部揍了一遍吧……）' },
    { portrait: 'leye', who: '蕾叶', say: '哇塞，千樱梨好厉害！' },
    { portrait: 'chisato', who: '千樱梨', say: '反正后来他们两边一对，就发现找麻烦的不是对家的人。不过奇怪了，谁还会专门来这里闹事呢？' },
    { portrait: 'housaki', who: '蓬咲', say: '感觉……感觉有可能是为了清场……《鬼时雨》第十七卷里面有提到……' },
    { portrait: 'kokono', who: '心玖', say: '看来这些事说到头来都是一件事啊。' },
  ],
    // 任务 C 完成：教母的账本
  C:[
    { bg: 'assets/bg/home.png', text: '心玖把一摞厚厚的账本放在桌上，然后把手里的大麦茶放在了旁边。' },
    { portrait: 'kokono', who: '心玖', say: '蕾叶。过来，有个事情跟你说。' },
    { portrait: 'leye', who: '蕾叶', say: '私下找我有什么事啊，心玖~趁着她们都睡了说？' },
    { portrait: 'kokono', who: '心玖', say: '（这人脑子里能不能装点除了惹我生气之外的东西呢……）' },
    { text: '没说什么别的，心玖翻开了账本，上面密密麻麻记录着各种最近发生的资金流动情况。' },
    { portrait: 'kokono', who: '心玖', say: '委托本身也是有分量的。除了挣钱，这些零零散散的线索汇聚在一起……东街的说他们一直有洗钱的任务。' },
    { portrait: 'leye', who: '蕾叶', say: '商店街的老奶奶也总跟我说最近总有鬼鬼祟祟的人出没在附近。' },
    { portrait: 'kokono', who: '心玖', say: '娱乐公司打着偶像录音室的名号往这里汇了一大笔款，其中有一些还是须贺社长很重用的高管亲自负责的。' },
    { portrait: 'leye', who: '蕾叶', say: '怎么又是我爹……' },
    { portrait: 'kokono', who: '心玖', say: '总之，按照现在的线索，NEST估计要被改造成地下赌场了。' },
    { portrait: 'leye', who: '蕾叶', say: '怎么能这样……' },
    { portrait: 'kokono', who: '心玖', say: '这么大的事情，须贺社长肯定会亲自来看。无论如何，我也会把NEST夺回来的。' },
    { portrait: 'leye', who: '蕾叶', say: '心玖……' },
    { portrait: 'kokono', who: '心玖', say: '当然，我不是想陪你们搞什么黑道过家家，只是夺回NEST是我答应了的事情，找个办法办到而已~' },
    { text: '难怪拿个茶杯过来了。一只手端着茶杯，另一只手端着托盘，根本没有手去摸耳朵。' },
    { portrait: 'leye', who: '蕾叶', say: '心玖果然还是在意FAMILY的！呐，心玖，我们就作为FAMILY，一起把NEST夺回来吧！' },
  ],
    // 任务 D 完成：大小姐驾到
  D:[
    { bg: 'assets/bg/nest.png', text: '夜间。一辆警车闪烁着红蓝光停在店门口。' },
    { text: '几个凶神恶煞的警察推门而入，带头的警长拍着桌子。' },
    { text: '“有人举报这里容留未成年饮酒，还涉嫌非法集会！全部带走！”' },
    { portrait: 'leye', who: '蕾叶', say: '你们说清楚什么事？不允许你们随便诬陷伤害我的FAMILY！' },
    { portrait: 'chisato', who: '千樱梨', say: '谁报的警？' },
    { portrait: 'kokono', who: '心玖', say: '（我就知道会有这样一天！让我想想，账本、电话簿……应该都藏好了。但是我觉得就算没有证据……）' },
    { text: '就在这时，听到动静的宁月从后厨走了出来。警长在看到她的一瞬间就愣住了。' },
    { text: '“谁报的假警……四宫家的小姐都敢动吗？”' },
    { text: '正在这时，警长的电话也突然响了起来。挂断电话的时候。这家伙的脸色已经完全变了个样。' },
    { text: '“嗯……好像我们搞错了点什么……”这么说着，几个警察又坐着车离开了。' },
    { portrait: 'leye', who: '蕾叶', say: '……怎么突然走了？认错人了？' },
    { portrait: 'kokono', who: '心玖', say: '（肯定是管家婆婆……）' },
    { portrait: 'ningetsu', who: '宁月', say: '那个叔叔，以前来我家里做客过。' },
    { portrait: 'leye', who: '蕾叶', say: '宁月还能把警察吓跑啊！' },
    { portrait: 'chisato', who: '千樱梨', say: '既然这么厉害，就允许宁月当千樱梨联盟的二号人物！' },
    { portrait: 'kokono', who: '心玖', say: '（这两个傻子……）' },
  ],
    // 任务 E 完成：教父的家训 (这段在弹幕小游戏结束后播放)
  E:[
    { bg: 'assets/bg/home.png', text: '心玖红着脸，实在分不清是被气的还是因为别的什么。' },
    { portrait: 'kokono', who: '心玖', say: '……你这家伙，真是能折腾人。' },
    { portrait: 'leye', who: '蕾叶', say: '嘿嘿，因为心玖也是为了FAMILY好嘛！' },
    { portrait: 'kokono', who: '心玖', say: '我说，把NEST拿回来之后，这些乱七八糟的黑道胡闹也该结束了吧？我们还要上学呢……' },
    { portrait: 'leye', who: '蕾叶', say: '唔…可是我已经说了我们是一个大FAMILY了啊？FAMILY是不能随便结束的！' },
    { portrait: 'kokono', who: '心玖', say: '（到底为什么要把这一套理论带进黑道来啊……）' },
    { portrait: 'kokono', who: '心玖', say: '他们也是FAMILY，我们也是FAMILY……' },
    { portrait: 'leye', who: '蕾叶', say: '不对。心玖、千樱梨、蓬咲和宁月都是family，不止是FAMILY。' },
    { portrait: 'kokono', who: '心玖', say: '（为什么能分辨大小写啊喂，我们不是在对话吗？）' },
    { portrait: 'leye', who: '蕾叶', say: 'family是一辈子的，住在同一个屋檐下，无论如何都不会分开的。大概就像远房亲戚和家庭的区别吧？' },
    { portrait: 'leye', who: '蕾叶', say: '心玖是我的family。不管发生什么，去到哪里，我都会跟着一起，给心玖最大的LOVE！' },
    { text: '心玖沉默了一会儿，目光下意识飘到了别的地方去。' },
    { portrait: 'kokono', who: '心玖', say: '（净说这种让人误解的话……）' },
    { portrait: 'leye', who: '蕾叶', say: '……想给心玖蒸一辈子的饭，也想让心玖给我煮一辈子味增汤！' },
    { portrait: 'kokono', who: '心玖', say: '什……什么东西？！' },
    { text: '后面发生了什么，小弟们不得而知。不过据说第二天须贺组长还是给各种路人介绍“这是我的family，心玖”……' },
    { text: '划小船还在流传着“似乎有人得罪了黑道，门口一到放学总是有黑西装的人在街道的另一头”这样的留言，不过高二的马桥心玖同学表示不知道。' },
  ],
  // 任务 3 完成：资金备齐
  3:[
    { bg: 'assets/bg/nest.png', text: '决战资金已经备齐，千樱梨带人包围了NEST……今天须贺社长一定会来这里准备开始NEST的改造工程。无论是为了NEST还是为了family，这一战都无可避免。' },
    { text: '“决战的时候到了。”' }
  ]
};

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
    { who: '极道小弟A', say: '嘘！这话可不能说！就算不是这两个人，还有千樱梨组长，现在帮派大大小小的事情全在她手上。你千万别当面反驳她那什么“千樱梨联盟”，乖乖承认自己是手下成员就行了，上次反对的那个堂口，现在全被排挤去洗盘子了。' },
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
  { id: 'bar',    name: '极道酒吧',   x: 25, y: 18, baseWage: 5000, energyCost: 25, recipes: [], unlockAt: [1], workCount: 0, affinity: 0 },
  { id: 'casino', name: '地下娱乐城', x: 75, y: 18, baseWage: 7000, energyCost: 35, recipes: [], unlockAt: [1], workCount: 0, affinity: 0 },
];