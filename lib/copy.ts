import type { FoodType } from "@/components/game/sprites";
import type { IconName } from "@/components/icons";

/**
 * Site content, mirrored from the Claude Design source (`copy.js`).
 *
 * Language-independent data (employers, project stacks, tag lists, links) lives
 * in `meta` so translations only ever carry prose.
 */

export const LANGS = [
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
] as const;

export type LangId = (typeof LANGS)[number]["id"];

export type SectionId =
  | "about"
  | "journey"
  | "experience"
  | "projects"
  | "skills"
  | "contact";

export interface Milestone {
  year: string;
  text: string;
}

export interface School {
  /** Matches a key in `SCHOOL_PHOTOS`; the frame falls back to a placeholder. */
  id: string;
  /** Short label for the selector button. */
  tab: string;
  title: string;
  name: string;
  blurb: string;
  photo: string;
}

export interface JobCopy {
  role: string;
  /** One or two sentences: what the system was, and what made it hard. */
  blurb: string;
  /** Exactly three. A decision, a trade-off, a thing learned — not metrics
   *  restated from the resume, and a fixed count so every card is one size. */
  bullets: string[];
}

export interface ProjectCopy {
  kicker: string;
  title: string;
  thumb: string;
  blurb: string;
  bullets: string[];
}

export interface Strings {
  nav: Record<"about" | "journey" | "work" | "projects" | "contact", string>;
  hero: {
    hi: string;
    name: string;
    pron: string;
    roles: string[];
    ctaA: string;
    ctaB: string;
    mac: string;
    blob: {
      label: string;
      sound: string;
      /** One line per blob state, plus the boba request and its answers. */
      idle: string;
      code: string;
      boba: string;
      sleep: string;
      angry: string;
      wave: string;
      ask: string;
      yes: string;
      no: string;
      accepted: string;
      refused: string;
      poked: string;
      woken: string;
      caught: string;
      freed: string;
      home: string;
      pet: string;
    };
  };
  journey: {
    label: string;
    milestones: string;
    schools: School[];
    ms: Milestone[];
  };
  work: { label: string; jobs: JobCopy[] };
  projects: { label: string; visit: string; items: ProjectCopy[] };
  mac: {
    powerOn: string;
    booting: string;
    shutdown: string;
    screenLabel: string;
    /** Shown under the running preview. */
    openHint: string;
    hintBoot: string;
    hintTerminal: string;
    notDeployed: string;
    unknown: string;
    selected: string;
    noSelection: string;
    blocked: string;
    blockedHint: string;
    loading: string;
  };
  skills: {
    label: string;
    languages: string;
    infra: string;
    quant: string;
    setup: string;
    setupText: string;
  };
  game: {
    kicker: string;
    title: string;
    rules: string;
    /** Explains why the coffee rains as hard as it does. */
    warn: string;
    start: string;
    again: string;
    score: string;
    time: string;
    goal: string;
    pts: string;
    dropHint: string;
    tooLow: string;
    greeting: string;
    food: Record<FoodType, string>;
    introTitle: string;
    introText: string;
    wonTitle: string;
    wonLine: string;
    lostTitle: string;
    lostLine: string;
    finalScore: string;
  };
  contact: {
    label: string;
    title: string;
    sub: string;
    name: string;
    email: string;
    msg: string;
    namePh: string;
    emailPh: string;
    msgPh: string;
    btn: string;
    sent: string;
    note: string;
    errAll: string;
    errEmail: string;
    resume: string;
  };
}

const en: Strings = {
  nav: {
    about: "ABOUT",
    journey: "JOURNEY",
    work: "WORK",
    projects: "PROJECTS",
    contact: "CONTACT",
  },
  hero: {
    hi: "Helo",
    name: "I'm Nhan Nguyen",
    pron: "Pronunciation: [Nyan N-wen]",
    roles: [
      "Senior at Gettysburg College",
      "Prev. SWE Intern @KBSecuritiesVietnam",
      "Prev. SWE Intern @FinbudAI",
      "Prev. SWE Intern @eSmartSolutionsAgency",
      "Prev. FE Intern @FPTIS",
    ],
    ctaA: "VIEW PROJECTS",
    ctaB: "SAY HELLO",
    mac: "2021 14-inch MacBook Pro\nwith M1 Pro",
    blob: {
      label: "Nhan's blob mascot",
      sound: "SOUND",
      pet: "PET",
      idle: "Hi! I'm the blob. Poke me.",
      code: "Building the Black-Scholes pricer on the M1.",
      boba: "Slurp. Tapioca pearls incoming.",
      sleep: "Zzz... recharging for tomorrow's quant work.",
      angry: "Hmph! Stop poking me!",
      wave: "Say hi over email or LinkedIn below!",
      ask: "Could I have a bubble tea?",
      yes: "YES",
      no: "NO",
      accepted: "Yesss! Extra pearls, please.",
      refused: "Hmph. I'll remember this.",
      poked: "Boing! That tickles.",
      woken: "Hey! I was dreaming about a giant boba!",
      caught: "Caught your cursor!",
      freed: "Whoa, the whole screen is mine!",
      home: "Back to my desk.",
    },
  },
  journey: {
    label: "JOURNEY",
    milestones: "MILESTONES",
    schools: [
      {
        id: "hcmc",
        tab: "HIGH SCHOOL",
        title: "High school years",
        name: "HCMC HIGHSCHOOL FOR THE GIFTED · 2019–2022",
        blurb:
          "The specialised high school in Ho Chi Minh City, and the last three years at home before the move to the US.",
        photo: "CLASSROOM PHOTO",
      },
      {
        id: "gettysburg",
        tab: "UNIVERSITY",
        title: "University years",
        name: "GETTYSBURG COLLEGE · 2022–2027",
        blurb:
          "B.S. Computer Science with a Business minor. A liberal arts foundation that keeps the writing and the modeling in the same head.",
        photo: "CAMPUS PHOTO",
      },
    ],
    ms: [
      { year: "2022", text: "Arrived from Ho Chi Minh City. First CS course, first snow." },
      { year: "2024", text: "First engineering internship. Learned pipelines break at 3am." },
      { year: "2025", text: "Covered warrants SWE Intern at KB Securities." },
      { year: "2026 →", text: "Open to summer 2027 roles." },
    ],
  },
  work: {
    label: "EXPERIENCE",
    jobs: [

      {
        role: "Software Engineer Intern",
        blurb:
          "Two products off one market-data spine: a live terminal for the covered-warrant desk, and KBSV's public CW portal. The hard part was never the pricing maths — it was keeping the quote firehose correct enough that a trader trusts the screen.",
        bullets: [
          "Sends differential patches over the socket rather than whole snapshots. The client has to reconcile state, which is the price paid for a fraction of the bandwidth.",
          "Desk terminal and public portal sit on separate VMs, so a spike in public traffic and the traders' live feed never contend for the same box.",
          "The data layer is its own pipeline instead of app code, so deduplication, normalisation and adjusted prices are solved once and both products read one history.",
        ],
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "A financial analytics platform that answers questions against a document corpus. Almost all of the wall-clock cost turned out to be waiting on I/O rather than on the model, which changed what was worth optimising — the fix was in the plumbing, not the prompt.",
        bullets: [
          "Latency came down through async request flows and cached retrieval rather than a larger model — the time was going on waiting for I/O, not on inference.",
          "Compressed prompts before dispatch, then checked that answer quality held: cheaper and faster is only a win if the output survives the squeeze.",
          "Containerised the backend and ran the test suite on every push, so the gap between my laptop and QA stopped being somewhere bugs could hide.",
        ],
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "A content platform where one brief fans out into drafts for several platforms. Handing the whole job to a single model gave bland, samey output, so the pipeline was split into stages that could each be judged, and fixed, on their own.",
        bullets: [
          "Routes by task rather than standardising on one model: a cheap model for extraction and classification, a strong one for the actual drafting.",
          "Makes quality a loop instead of a prompt — every draft is scored against external SEO signals and re-prompted until it clears the bar.",
          "Centralised the shared dashboard state so an edit made in one view never leaves another showing something stale, which was the bug class users actually reported.",
        ],
      },
      {
        role: "Frontend Engineer Intern",
        blurb:
          "My first internship: a B2B procurement system for Rang Dong, built for procurement staff rather than engineers. The expensive failure there is not a crash — it is a typo that quietly propagates into a budget and surfaces months later.",
        bullets: [
          "Put validation inside plan creation and editing, because catching a wrong figure at entry is worth more than any amount of reporting downstream.",
          "With 200,000+ plans in the system, navigation was the feature — getting to the right plan mattered more than how fast it drew once you had.",
          "Ran the weekly budget analysis across 16 IT categories myself, which is how I learned which numbers the interface actually had to put in front of people.",
        ],
      },
    ],
  },
  projects: {
    label: "PROJECTS",
    visit: "OPEN",
    items: [
      {
        kicker: "PROJECT 01",
        title: "CW Research Terminal",
        thumb: "RESEARCH TERMINAL\nquotes → greeks → llm",
        blurb:
          "A research terminal for 100+ Vietnamese covered warrants, streaming FiinQuant market data over FastAPI and WebSockets.",
        bullets: [
          "Black-Scholes-Merton pricing, implied and historical volatility, Greeks",
          "Tool-calling LLM assistant grounded in live quotes and price history",
          "Visible tool traces and non-advisory guardrails",
        ],
      },
      {
        kicker: "PROJECT 02",
        title: "KB Securities CW Portal",
        thumb: "cw.kbsec.com.vn\nnext.js · fastapi · kafka",
        blurb:
          "The covered warrants portal I built and launched at KB Securities, live for traders and retail investors.",
        bullets: [
          "Two-VM architecture splitting Next.js/Nginx from containerised services",
          "16 REST endpoints covered by pytest unit and integration tests",
          "Kafka and PostgreSQL behind a Redis-cached market data layer",
        ],
      },
      {
        kicker: "PROJECT 03",
        title: "ITCH Feed Handler",
        thumb: "ITCH FEED HANDLER\nc++20 · l2 reconstruction",
        blurb:
          "A C++20 Nasdaq TotalView-ITCH 5.0 feed handler that rebuilds aggregated L2 order books straight from the raw event stream, measured against a full 11.25 GB exchange session.",
        bullets: [
          "368M messages replayed into 8,695 per-symbol books, checked by 24 correctness scenarios and UBSan",
          "Profiling drove a symbol-interning layout change: 12.3% on the synthetic replay, with no real-session gain claimed",
          "The engineering log keeps the optimisations that did not work, with their numbers",
        ],
      },
    ],
  },
  mac: {
    powerOn: "PRESS TO POWER ON",
    booting: "BOOTING MACOS M1 PRO",
    shutdown: "Shutting down.",
    screenLabel: "MacBook Pro screen",
    openHint: "Click the screen to open it",
    hintBoot: "Type help to see what this shell can do.",
    hintTerminal: "cd into a project, then run it.",
    notDeployed: "not deployed yet",
    unknown: "command not found",
    selected: "selected",
    noSelection: "no project selected - try: cd cw",
    blocked: "This deployment refuses to be embedded.",
    blockedHint: "Open it in a new tab instead",
    loading: "connecting...",
  },
  skills: {
    label: "STACK",
    languages: "LANGUAGES",
    infra: "DATA & INFRA",
    quant: "QUANT",
    setup: "SETUP",
    setupText:
      "14-inch MacBook Pro (M1 Pro), Sofle v2.1 split mechanical keyboard, Neovim and a lot of tmux.",
  },
  game: {
    kicker: "MINI CHALLENGE",
    title: "Feed the hungry blob",
    rules:
      "Click anywhere in the top half of the arena to drop a snack. The blob hops around on its own — land the food on it.",
    warn:
      "Bitter coffee falls as often as the treats, and hammering the arena only makes it worse. Aim, don't flood.",
    start: "START",
    again: "PLAY AGAIN",
    score: "SCORE",
    time: "TIME",
    goal: "TARGET",
    pts: "PTS",
    dropHint: "CLICK THE TOP HALF TO DROP A SNACK",
    tooLow: "Too low! Drop it from the top half.",
    greeting: "I'm starving — drop me some boba!",
    food: { boba: "BOBA", donut: "DONUT", coffee: "BITTER COFFEE" },
    introTitle: "FEED THE HUNGRY BLOB",
    introText:
      "Drop snacks from the top half into the blob's mouth. Bitter coffee is just as likely to fall, so aim instead of spamming.",
    wonTitle: "WELL FED!",
    wonLine: "Yum! Thanks for the boba.",
    lostTitle: "THE BLOB FAINTED",
    lostLine: "Too little food, too much bitter coffee.",
    finalScore: "FINAL SCORE",
  },
  contact: {
    label: "CONTACT",
    title: "Send me an email",
    sub: "I read everything that arrives.",
    name: "NAME",
    email: "EMAIL",
    msg: "MESSAGE",
    namePh: "eg: Nhan Nguyen",
    emailPh: "eg: xuannhan.nguyen@gmail.com",
    msgPh:
      "Hi Nhan, I'd like to schedule a meeting... (the blob is already celebrating)",
    btn: "SEND",
    sent: "SENT ✓ THANK YOU!",
    note: "Or write to me directly:",
    resume: "RESUME",
    errAll: "All fields are required.",
    errEmail: "That email doesn't look right.",
  },
};

const zh: Strings = {
  nav: {
    about: "关于我",
    journey: "求学历程",
    work: "工作经历",
    projects: "项目",
    contact: "联系",
  },
  hero: {
    hi: "你好！",
    name: "我叫阮春仁",
    pron: "发音：ruăn chūn rén",
    roles: [
      "葛底斯堡学院大四在读",
      "前软件工程实习生 @KBSecuritiesVietnam",
      "前软件工程实习生 @FinbudAI",
      "前软件工程实习生 @eSmartSolutionsAgency",
      "前前端实习生 @FPTIS",
    ],
    ctaA: "查看项目",
    ctaB: "写信给我",
    mac: "2021 款 14 英寸 MacBook Pro\nM1 Pro 芯片",
    blob: {
      label: "阮的小水滴",
      sound: "声音",
      pet: "放养",
      idle: "你好！我是小水滴，戳戳我吧。",
      code: "正在 M1 上写 Black-Scholes 定价模型。",
      boba: "咻——珍珠上来了。",
      sleep: "呼呼……充电中，明天继续写量化模型。",
      angry: "哼！别老戳我啦！",
      wave: "在下面用邮件或 LinkedIn 联系阮吧！",
      ask: "可以请我喝一杯奶茶吗？",
      yes: "好",
      no: "不行",
      accepted: "耶！珍珠多加一点！",
      refused: "哼。我记住了。",
      poked: "哎呀！好痒啊。",
      woken: "喂！我正梦到超大杯珍珠奶茶呢！",
      caught: "抓到你的光标啦！",
      freed: "哇！整个屏幕都是我的了！",
      home: "回我的桌子上啦。",
    },
  },
  journey: {
    label: "求学历程",
    milestones: "时间线",
    schools: [
      {
        id: "hcmc",
        tab: "高中",
        title: "高中时期",
        name: "胡志明市英才高中 · 2019–2022",
        blurb: "胡志明市的重点高中，也是去美国之前在家的最后三年。",
        photo: "教室照片",
      },
      {
        id: "gettysburg",
        tab: "大学",
        title: "大学四年",
        name: "葛底斯堡学院 · 2022–2027",
        blurb:
          "计算机科学学士，辅修商科。文理学院的训练让写作和建模留在同一个脑子里。",
        photo: "校园照片",
      },
    ],
    ms: [
      { year: "2022", text: "从胡志明市来到美国。第一门计算机课，第一场雪。" },
      { year: "2024", text: "第一份工程实习。明白了数据管道总在凌晨三点崩。" },
      { year: "2025", text: "在 KB 证券担任备兑权证软件工程实习生。" },
      { year: "2026 →", text: "正在寻找 2027 年暑期机会。" },
    ],
  },
  work: {
    label: "技术经历",
    jobs: [

      {
        role: "软件工程实习生",
        blurb:
          "同一条行情数据主干上的两个产品：给权证交易台的实时终端，以及 KBSV 对外的 CW 门户。难点不在公式，而在于让海量行情既准确又足够新，交易员才会信任屏上的数字。",
        bullets: [
          "通过 socket 发送差异补丁而非完整快照：客户端承担状态合并逻辑，换来带宽只剩一小部分。",
          "交易台终端和对外门户分在两台 VM 上，对外流量突增永远不会和交易数据流争抢同一台机器。",
          "数据层是独立管道而非应用代码，去重、归一化和复权价格只处理一次，两个产品读到同一份历史。",
        ],
      },
      {
        role: "软件工程实习生",
        blurb:
          "一个基于文档语料回答问题的金融分析平台。绝大部分耗时其实花在等 I/O 而不是模型推理，这改变了什么值得优化。",
        bullets: [
          "延迟的下降来自异步请求流和检索缓存，而不是换一个更大的模型 —— 时间花在等 I/O，不是花在推理上。",
          "发送前压缩提示词，再回头验证答案质量 —— 更便宜更快，前提是输出没变差。",
          "后端容器化并在每次推送时跑全部测试，让本机与 QA 之间的差异不再是 bug 的藏身之处。",
        ],
      },
      {
        role: "软件工程实习生",
        blurb:
          "一个把单一需求展开成多平台草稿的内容平台。整件事交给一个模型会得到平庭的输出，所以管道被拆成可以单独评分的几段。",
        bullets: [
          "按任务路由而不是统一用一个模型：便宜模型负责抽取和分类，强模型负责真正的改写。",
          "把质量做成循环而不是一句提示词 —— 用外部 SEO 信号给每版草稿打分，不达标就重新生成。",
          "将共享的仪表盘状态集中管理，一个视图的编辑不会让另一个视图显示陈旧数据 —— 那正是用户报得最多的一类问题。",
        ],
      },
      {
        role: "前端工程实习生",
        blurb:
          "我的第一份实习：为 Rang Dong 做的 B2B 采购管理系统，用户是采购人员而不是工程师。那里最昂贵的故障不是崩溃，而是一个敲错的数字惄无声息地进了预算。",
        bullets: [
          "把校验放进计划的创建和编辑环节，因为录入时拦下错误数字，比事后任何报表都值钱。",
          "系统里有超过 20 万份计划，导航本身就是功能 —— 能不能找到对的那份，比找到后画得多快更重要。",
          "每周 16 个 IT 预算类目的分析是我自己做的，那才知道界面到底要把哪些数字放到用户眼前。",
        ],
      },
    ],
  },
  projects: {
    label: "项目",
    visit: "打开",
    items: [
      {
        kicker: "项目 01",
        title: "CW Research Terminal",
        thumb: "RESEARCH TERMINAL\nquotes → greeks → llm",
        blurb:
          "面向 100+ 越南备兑权证的研究终端，通过 FastAPI 与 WebSockets 推送 FiinQuant 行情数据。",
        bullets: [
          "Black-Scholes-Merton 定价、隐含与历史波动率、希腊字母",
          "可调用工具的 LLM 助手，基于实时报价与历史价格",
          "工具调用过程可见，并设有非投资建议护栏",
        ],
      },
      {
        kicker: "项目 02",
        title: "KB 证券备兑权证门户",
        thumb: "cw.kbsec.com.vn\nnext.js · fastapi · kafka",
        blurb:
          "我在 KB 证券搭建并上线的备兑权证门户，正服务于交易员与散户投资者。",
        bullets: [
          "双虚拟机架构，将 Next.js/Nginx 与容器化服务分离",
          "16 个 REST 接口，配有 pytest 单元与集成测试",
          "Kafka 与 PostgreSQL 位于 Redis 缓存的行情数据层之后",
        ],
      },
      {
        kicker: "项目 03",
        title: "ITCH Feed Handler",
        thumb: "ITCH FEED HANDLER\nc++20 · l2 订单簿重建",
        blurb:
          "用 C++20 实现的 Nasdaq TotalView-ITCH 5.0 行情解析器，直接从原始事件流重建聚合 L2 订单簿，在完整的 11.25 GB 交易日上实测。",
        bullets: [
          "3.68 亿条消息重建出 8,695 个个股订单簿，由 24 个正确性场景和 UBSan 校验",
          "profiling 驱动的 symbol interning 布局改造：合成数据上提速 12.3%，真实交易日上未作任何声明",
          "工程日志保留了那些没有奏效的优化及其数据",
        ],
      },
    ],
  },
  mac: {
    powerOn: "按下开机",
    booting: "正在启动 MACOS M1 PRO",
    shutdown: "正在关机。",
    screenLabel: "MacBook Pro 屏幕",
    openHint: "点击屏幕打开该项目",
    hintBoot: "输入 help 看看这个 shell 能做什么。",
    hintTerminal: "先 cd 进一个项目，再 run。",
    notDeployed: "尚未部署",
    unknown: "找不到命令",
    selected: "已选择",
    noSelection: "尚未选择项目 - 试试: cd cw",
    blocked: "该部署不允许被嵌入。",
    blockedHint: "在新标签页中打开",
    loading: "连接中...",
  },
  skills: {
    label: "技术栈",
    languages: "编程语言",
    infra: "数据与基础设施",
    quant: "量化",
    setup: "设备",
    setupText:
      "14 英寸 MacBook Pro（M1 Pro）、Sofle v2.1 分体机械键盘、Neovim 和大量 tmux。",
  },
  game: {
    kicker: "小挑战",
    title: "喂饱小蓝团",
    rules:
      "点击场地上半部分投下食物。小蓝团会自己跳来跳去，瞄准它再投。",
    warn:
      "苦咖啡出现的概率和点心一样高，连点得越快苦咖啡越多。瞄准投，别乱点。",
    start: "开始",
    again: "再来一局",
    score: "得分",
    time: "时间",
    goal: "目标",
    pts: "分",
    dropHint: "点击上半部分投下食物",
    tooLow: "太低了！请从上半部分投下。",
    greeting: "我好饿，快投奶茶给我！",
    food: {
      boba: "珍珠奶茶",
      donut: "甜甜圈",
      coffee: "苦咖啡",
    },
    introTitle: "喂饱饥饿的小蓝团",
    introText:
      "从上半部分投下食物喂给小蓝团。苦咖啡同样常见，所以要瞄准，别狂点。",
    wonTitle: "吃饱啦！",
    wonLine: "真好吃！谢谢你的奶茶。",
    lostTitle: "小蓝团晕倒了",
    lostLine: "吃得太少，苦咖啡又太多。",
    finalScore: "最终得分",
  },
  contact: {
    label: "联系",
    title: "写信给我",
    sub: "每一封我都会读。",
    name: "姓名",
    email: "邮箱",
    msg: "内容",
    namePh: "例：Nhan Nguyen",
    emailPh: "例：xuannhan.nguyen@gmail.com",
    msgPh:
      "你好阮，我想约个时间聊聊……（小蓝团已经开始庆祝了）",
    btn: "发送",
    sent: "已发送 ✓ 谢谢！",
    note: "也可以直接写信给我：",
    resume: "简历",
    errAll: "请填写所有字段。",
    errEmail: "这个邮箱格式不太对。",
  },
};

export const STRINGS: Record<LangId, Strings> = { en, zh };

/** Language-independent data. */
export const jobsMeta = [
  {
    id: "kb",
    name: "KB Securities",
    place: "Ho Chi Minh City, Vietnam",
    icon: "logo-kb",
    term: "Nov 2025 – Aug 2026",
    stack: ["TYPESCRIPT", "NEXT.JS", "FASTAPI", "WEBSOCKETS", "KAFKA", "REDIS", "POSTGRES", "DOCKER"],
  },
  {
    id: "finbud",
    name: "Finbud AI",
    place: "Chicago, IL",
    icon: "logo-finbud",
    term: "Apr – Jul 2025",
    stack: ["PYTHON", "LANGCHAIN", "PGVECTOR", "POSTGRES", "ASYNCIO", "DOCKER", "GITHUB ACTIONS"],
  },
  {
    id: "esmart",
    name: "eSmart Solutions Agency",
    place: "Saint Paul, MN",
    icon: "logo-esmart",
    term: "Feb – Apr 2025",
    stack: ["VUE 3", "TYPESCRIPT", "NODE.JS", "FASTAPI", "GPT-4", "DEEPSEEK V3", "REST"],
  },
  {
    id: "fptis",
    name: "FPT IS",
    place: "Ha Noi, Vietnam",
    icon: "logo-fpt",
    term: "May – Jul 2024",
    stack: ["REACT", "JAVASCRIPT", "TAILWIND CSS", "REST APIS", "GIT"],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  place: string;
  icon: IconName;
  term: string;
  stack: readonly string[];
}[];

export type JobId = (typeof jobsMeta)[number]["id"];

/**
 * `url` is the live deployment the MacBook terminal loads with `run`.
 * Projects without one report "not deployed" instead.
 */
export const projectsMeta = [
  {
    id: "cw",
    shot: "/projects/cw-research-terminal.webp",
    /** The thumb is squarer than the 16:9 shot, so each picks its own crop. */
    shotPos: "left top",
    stack: ["REACT", "TYPESCRIPT", "FASTAPI", "POSTGRES", "REDIS", "OPENROUTER"],
    url: "https://cw-research-terminal.vercel.app/",
  },
  {
    id: "portal",
    shot: "/projects/cw-portal.webp",
    shotPos: "center top",
    stack: ["NEXT.JS", "NGINX", "FASTAPI", "KAFKA", "POSTGRES", "PYTEST"],
    url: "https://cw.kbsec.com.vn/",
  },
  {
    id: "itch",
    shot: "/projects/itch-feed-handler.webp",
    shotPos: "left top",
    stack: ["C++20", "ITCH 5.0", "CMAKE", "CTEST", "UBSAN", "MMAP"],
    url: "https://github.com/nigelnh/itch-feed-handler",
  },
] as const;

export type ProjectId = (typeof projectsMeta)[number]["id"];

export const skillTags = {
  languages: ["PYTHON", "TYPESCRIPT", "JAVA", "SQL", "C"],
  infra: ["KAFKA", "REDIS", "POSTGRES", "DOCKER", "FASTAPI"],
  quant: ["BLACK-SCHOLES", "GREEKS", "HEDGING", "TIME SERIES"],
} as const;

/** Off-site profiles. Rendered in the Contact panel's title bar. */
export const links = [
  { label: "GITHUB", href: "https://github.com/nigelnh" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/nhan-nguyen-374543248/" },
] as const;

/** Served straight from `public/`, so it opens in the browser's PDF viewer. */
export const RESUME_HREF = "/Nhan_Nguyen_Resume.pdf";

/** Public contact address. `NEXT_PUBLIC_CONTACT_EMAIL` overrides it. */
export const CONTACT_EMAIL = "xuannhan.nguyen2001@gmail.com";

/** Section order drives both nav rails and scroll-spy. */
export const SECTIONS: {
  id: SectionId;
  navKey: keyof Strings["nav"];
  icon: IconName;
}[] = [
  { id: "about", navKey: "about", icon: "graduation-cap" },
  { id: "journey", navKey: "journey", icon: "school-building" },
  { id: "experience", navKey: "work", icon: "split-keyboard" },
  { id: "projects", navKey: "projects", icon: "retro-monitor" },
  { id: "contact", navKey: "contact", icon: "pixel-envelope" },
];
