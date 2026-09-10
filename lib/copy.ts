import type { IconName } from "@/components/icons";

/**
 * Site content, mirrored from the Claude Design source (`copy.js`).
 *
 * Language-independent data (employers, project stacks, tag lists, links) lives
 * in `meta` so translations only ever carry prose.
 */

export const LANGS = [
  { id: "en", label: "EN" },
  { id: "vi", label: "VI" },
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
  blurb: string;
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
  projects: { label: string; items: ProjectCopy[] };
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
    elsewhere: string;
    resume: string;
    reply: string;
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
          "Built a real-time terminal tracking 30 stocks and 300+ covered warrants for KB Financial Group traders, modelling 54 pricing, risk and P&L metrics. Launched the CW Portal across a two-VM architecture and cut WebSocket payloads by 84% and upstream requests by 98%.",
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "Co-built a financial analytics platform on LangChain and pgvector over a 500+ document corpus. Cut end-to-end latency roughly in half with async I/O, prompt compression and retrieval caching, and containerised the backend behind GitHub Actions.",
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "Built a multi-model LLM content platform on Vue and FastAPI that parses intent and tone into platform-specific output, and an exemplar-based workflow that produced 100+ SEO-scored articles.",
      },
      {
        role: "Backend Intern",
        blurb:
          "Worked on enterprise integration services for banking clients. Wrote the test harness that caught schema drift between two internal APIs before release.",
      },
    ],
  },
  projects: {
    label: "PROJECTS",
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
  contact: {
    label: "CONTACT",
    title: "Send me an email",
    sub: "I read everything that arrives.",
    name: "NAME",
    email: "EMAIL",
    msg: "MESSAGE",
    namePh: "Your name",
    emailPh: "you@mail.com",
    msgPh: "Say something...",
    btn: "SEND",
    sent: "SENT ✓ THANK YOU!",
    note: "Wired to an n8n automation workflow with a mailto fallback.",
    errAll: "All fields are required.",
    errEmail: "That email doesn't look right.",
    elsewhere: "ELSEWHERE",
    resume: "Résumé (PDF)",
    reply: "I usually reply within a day.",
  },
};

const vi: Strings = {
  nav: {
    about: "GIỚI THIỆU",
    journey: "HÀNH TRÌNH",
    work: "KINH NGHIỆM",
    projects: "DỰ ÁN",
    contact: "LIÊN HỆ",
  },
  hero: {
    hi: "Xin chào!",
    name: "Mình là Nhan Nguyen",
    pron: "Phát âm: [Nyan N-wen]",
    roles: [
      "Sinh viên năm cuối tại Gettysburg College",
      "Cựu Thực tập sinh SWE @KBSecuritiesVietnam",
      "Cựu Thực tập sinh SWE @FinbudAI",
      "Cựu Thực tập sinh SWE @eSmartSolutionsAgency",
    ],
    ctaA: "XEM DỰ ÁN",
    ctaB: "GỬI EMAIL",
    mac: "MacBook Pro 14-inch 2021\nchip M1 Pro",
    blob: {
      label: "Blob của Nhan",
      sound: "ÂM THANH",
      pet: "THẢ RÔNG",
      idle: "Xin chào! Mình là Blob, chọc mình đi.",
      code: "Đang build mô hình Black-Scholes trên MacBook M1.",
      boba: "Hút trân châu cái rột!",
      sleep: "Khò khò... Đang sạc pin để mai code tiếp...",
      angry: "Hứ! Chọc mình hoài à?!",
      wave: "Gửi email hoặc kết nối LinkedIn với Nhan ở dưới nhé!",
      ask: "Cho mình xin một ly trà sữa được không?",
      yes: "ĐƯỢC",
      no: "KHÔNG",
      accepted: "Yeahhh! Cho mình thêm trân châu nha!",
      refused: "Hứ. Mình nhớ đó nha.",
      poked: "Úi! Nhột tớ quá nè!",
      woken: "Oái! Đang mơ thấy ly boba khổng lồ mà phá đám à!",
      caught: "Bắt được con trỏ của bạn rồi nè!",
      freed: "Woa! Mình được nhảy khắp màn hình rồi!",
      home: "Về lại bàn làm việc thôi.",
    },
  },
  journey: {
    label: "HÀNH TRÌNH",
    milestones: "CỘT MỐC",
    schools: [
      {
        id: "hcmc",
        tab: "PHỔ THÔNG",
        title: "Thời phổ thông",
        name: "TRƯỜNG PHỔ THÔNG NĂNG KHIẾU TP.HCM · 2019–2022",
        blurb:
          "Ngôi trường chuyên ở TP.HCM, ba năm cuối ở nhà trước khi sang Mỹ.",
        photo: "ẢNH LỚP HỌC",
      },
      {
        id: "gettysburg",
        tab: "ĐẠI HỌC",
        title: "Hành trình đại học",
        name: "GETTYSBURG COLLEGE · 2022–2027",
        blurb:
          "Cử nhân Khoa học Máy tính, phụ chuyên ngành Kinh doanh. Nền giáo dục khai phóng giúp mình vừa viết vừa mô hình hóa được.",
        photo: "ẢNH CAMPUS",
      },
    ],
    ms: [
      { year: "2022", text: "Từ Sài Gòn sang. Môn CS đầu tiên, mùa tuyết đầu tiên." },
      {
        year: "2024",
        text: "Kỳ thực tập kỹ thuật đầu tiên. Học được rằng pipeline hay sập lúc 3 giờ sáng.",
      },
      { year: "2025", text: "Thực tập sinh SWE mảng chứng quyền tại KB Securities." },
      { year: "2026 →", text: "Đang tìm vị trí hè 2027." },
    ],
  },
  work: {
    label: "TRẢI NGHIỆM KỸ THUẬT",
    jobs: [
      {
        role: "Thực tập sinh Kỹ thuật phần mềm",
        blurb:
          "Xây terminal thời gian thực theo dõi 30 mã cổ phiếu và hơn 300 chứng quyền cho trader của KB Financial Group, mô hình hoá 54 chỉ số định giá, rủi ro và P&L. Ra mắt CW Portal trên kiến trúc hai máy ảo, giảm 84% dung lượng WebSocket và 98% số request upstream.",
      },
      {
        role: "Thực tập sinh Kỹ thuật phần mềm",
        blurb:
          "Đồng phát triển nền tảng phân tích tài chính trên LangChain và pgvector với kho hơn 500 tài liệu. Giảm khoảng một nửa độ trễ end-to-end nhờ async I/O, nén prompt và cache truy hồi; đóng gói backend bằng Docker và GitHub Actions.",
      },
      {
        role: "Thực tập sinh Kỹ thuật phần mềm",
        blurb:
          "Xây nền tảng nội dung dùng nhiều mô hình LLM trên Vue và FastAPI, bóc tách ý định và giọng văn thành đầu ra riêng cho từng nền tảng; quy trình theo mẫu tạo ra hơn 100 bài đạt ngưỡng SEO.",
      },
      {
        role: "Thực tập sinh Backend",
        blurb:
          "Làm dịch vụ tích hợp doanh nghiệp cho khách hàng ngân hàng. Viết bộ kiểm thử phát hiện lệch schema giữa hai API nội bộ trước khi phát hành.",
      },
    ],
  },
  projects: {
    label: "DỰ ÁN",
    items: [
      {
        kicker: "DỰ ÁN 01",
        title: "CW Research Terminal",
        thumb: "RESEARCH TERMINAL\nquotes → greeks → llm",
        blurb:
          "Terminal nghiên cứu cho hơn 100 chứng quyền Việt Nam, truyền dữ liệu thị trường FiinQuant qua FastAPI và WebSockets.",
        bullets: [
          "Định giá Black-Scholes-Merton, biến động ngụ ý và lịch sử, các Greeks",
          "Trợ lý LLM gọi công cụ, bám theo giá trực tiếp và lịch sử giá",
          "Hiển thị dấu vết công cụ và rào chắn không tư vấn đầu tư",
        ],
      },
      {
        kicker: "DỰ ÁN 02",
        title: "Cổng chứng quyền KB Securities",
        thumb: "cw.kbsec.com.vn\nnext.js · fastapi · kafka",
        blurb:
          "Cổng chứng quyền mình xây và đưa lên production tại KB Securities, đang phục vụ trader và nhà đầu tư cá nhân.",
        bullets: [
          "Kiến trúc hai máy ảo, tách Next.js/Nginx khỏi các dịch vụ container hoá",
          "16 REST endpoint kèm unit test và integration test bằng pytest",
          "Kafka và PostgreSQL sau tầng dữ liệu thị trường cache bằng Redis",
        ],
      },
    ],
  },
  mac: {
    powerOn: "NHẤN ĐỂ BẬT NGUỒN",
    booting: "ĐANG KHỞI ĐỘNG MACOS M1 PRO",
    shutdown: "Đang tắt máy.",
    screenLabel: "Màn hình MacBook Pro",
    openHint: "Nhấn vào màn hình để mở trang",
    hintBoot: "Gõ help để xem shell này làm được gì.",
    hintTerminal: "cd vào một dự án rồi run.",
    notDeployed: "chưa được deploy",
    unknown: "không tìm thấy lệnh",
    selected: "đã chọn",
    noSelection: "chưa chọn dự án - thử: cd cw",
    blocked: "Bản deploy này không cho nhúng vào trang khác.",
    blockedHint: "Mở trong tab mới",
    loading: "đang kết nối...",
  },
  skills: {
    label: "CÔNG NGHỆ",
    languages: "NGÔN NGỮ",
    infra: "DỮ LIỆU & HẠ TẦNG",
    quant: "ĐỊNH LƯỢNG",
    setup: "THIẾT BỊ",
    setupText:
      "MacBook Pro 14-inch (M1 Pro), bàn phím cơ chia đôi Sofle v2.1, Neovim và rất nhiều tmux.",
  },
  contact: {
    label: "LIÊN HỆ",
    title: "Gửi email cho mình",
    sub: "Mình đọc hết mọi tin nhắn.",
    name: "TÊN",
    email: "EMAIL",
    msg: "NỘI DUNG",
    namePh: "Tên bạn",
    emailPh: "you@mail.com",
    msgPh: "Nói gì đó...",
    btn: "GỬI",
    sent: "ĐÃ GỬI ✓ CẢM ƠN!",
    note: "Kết nối với quy trình tự động n8n và có dự phòng mailto.",
    errAll: "Vui lòng điền hết các ô.",
    errEmail: "Email này chưa đúng định dạng.",
    elsewhere: "KÊNH KHÁC",
    resume: "Hồ sơ (PDF)",
    reply: "Mình thường trả lời trong vòng 24 giờ.",
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
          "为 KB 金融集团交易员搭建实时终端，跟踪 30 只股票与 300+ 备兑权证，建模 54 项定价、风险与损益指标。在双虚拟机架构上上线 CW Portal，WebSocket 负载减少 84%，上游请求减少 98%。",
      },
      {
        role: "软件工程实习生",
        blurb:
          "基于 LangChain 与 pgvector 共同搭建金融分析平台，覆盖 500+ 份文档语料。通过异步 I/O、提示压缩与检索缓存，将端到端延迟降低约一半，并用 Docker 与 GitHub Actions 容器化后端。",
      },
      {
        role: "软件工程实习生",
        blurb:
          "在 Vue 与 FastAPI 上搭建多模型 LLM 内容平台，将意图与语气解析为各平台专属输出；范例驱动的流程产出 100+ 篇达标 SEO 文章。",
      },
      {
        role: "后端实习生",
        blurb:
          "为银行客户开发企业集成服务。编写的测试框架在发布前发现了两个内部 API 之间的结构漂移。",
      },
    ],
  },
  projects: {
    label: "项目",
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
  contact: {
    label: "联系",
    title: "写信给我",
    sub: "每一封我都会读。",
    name: "姓名",
    email: "邮箱",
    msg: "内容",
    namePh: "你的名字",
    emailPh: "you@mail.com",
    msgPh: "说点什么…",
    btn: "发送",
    sent: "已发送 ✓ 谢谢！",
    note: "接入 n8n 自动化工作流，并保留 mailto 兜底。",
    errAll: "请填写所有字段。",
    errEmail: "这个邮箱格式不太对。",
    elsewhere: "其他平台",
    resume: "简历（PDF）",
    reply: "我通常一天内回复。",
  },
};

export const STRINGS: Record<LangId, Strings> = { en, vi, zh };

/** Language-independent data. */
export const jobsMeta = [
  {
    id: "kb",
    name: "KB Securities",
    place: "Ho Chi Minh City, Vietnam",
    icon: "logo-kb",
    term: "Nov 2025 – Aug 2026",
    stack: ["TYPESCRIPT", "NODE.JS", "FASTAPI", "KAFKA", "REDIS", "POSTGRES"],
  },
  {
    id: "finbud",
    name: "Finbud AI",
    place: "Chicago, IL",
    icon: "logo-finbud",
    term: "Apr – Jul 2025",
    stack: ["PYTHON", "LANGCHAIN", "PGVECTOR", "DOCKER", "GITHUB ACTIONS"],
  },
  {
    id: "esmart",
    name: "eSmart Solutions Agency",
    place: "Saint Paul, MN",
    icon: "logo-esmart",
    term: "Feb – Apr 2025",
    stack: ["VUE.JS", "NODE.JS", "FASTAPI", "GPT-4", "PINIA"],
  },
  {
    id: "fptis",
    name: "FPT IS",
    place: "Ho Chi Minh City",
    icon: "logo-fpt",
    term: "May – Jul 2024",
    stack: ["JAVA", "SPRING", "ORACLE", "DOCKER"],
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
    stack: ["REACT", "TYPESCRIPT", "FASTAPI", "POSTGRES", "REDIS", "OPENROUTER"],
    url: "https://cw-research-terminal.vercel.app/",
  },
  {
    id: "portal",
    stack: ["NEXT.JS", "NGINX", "FASTAPI", "KAFKA", "POSTGRES", "PYTEST"],
    url: "https://cw.kbsec.com.vn/",
  },
] as const;

export type ProjectId = (typeof projectsMeta)[number]["id"];

export const skillTags = {
  languages: ["PYTHON", "TYPESCRIPT", "JAVA", "SQL", "C"],
  infra: ["KAFKA", "REDIS", "POSTGRES", "DOCKER", "FASTAPI"],
  quant: ["BLACK-SCHOLES", "GREEKS", "HEDGING", "TIME SERIES"],
} as const;

export const links = [
  { label: "GitHub — /nhannguyen", href: "#contact" },
  { label: "LinkedIn — /in/nhannguyen", href: "#contact" },
];

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
