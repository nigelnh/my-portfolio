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
  | "arcade"
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
  game: {
    label: string;
    kicker: string;
    title: string;
    rules: string;
    /** Explains why the coffee rains as hard as it does. */
    warn: string;
    start: string;
    stop: string;
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
          "Engineered a real-time terminal tracking 30 stocks and 300+ covered warrants for KB Financial Group traders, modelling 54 pricing, risk and P&L metrics from Black-Scholes outputs, Greeks and inventory exposure. Cut WebSocket payloads 84% by sending differential patches instead of whole snapshots, and upstream requests 98% by batching 50 symbols per call; historical series moved into Redis in front of indexed Postgres queries over 100,000+ records. Shipped the CW Portal on a two-VM split — Next.js behind Nginx, containerised FastAPI, Kafka and Postgres — with 16 REST endpoints under pytest, and n8n pipelines handling deduplication, normalisation and adjusted-price snapshots.",
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "Co-built a financial analytics platform on LangChain and pgvector, indexing a 500+ document corpus for vector search and LLM context assembly. Halved production end-to-end latency by moving request flows onto asynchronous I/O, compressing prompts before dispatch and caching retrieval results so a repeated question never reaches the model twice. Containerised the backend with Docker and wired GitHub Actions to run the test suite on every push, standardising development and QA environments.",
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "Built a multi-model content pipeline on Vue and FastAPI that parses a brief into keywords, tone, intent and metadata, then routes each platform's output to whichever model handles it best — extraction on DeepSeek V3, drafting on GPT-4. Added an exemplar-driven loop that scores every draft against external SEO signals and re-prompts until it clears the threshold, which produced 100+ published articles. Centralised shared dashboard state so navigation and edits stay in sync across views.",
      },
      {
        role: "Frontend Engineer Intern",
        blurb:
          "Front-end engineering on enterprise systems for banking clients, building interface work against internal service APIs.",
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
  game: {
    label: "ARCADE",
    kicker: "MINI CHALLENGE",
    title: "Feed the hungry blob",
    rules:
      "Click anywhere in the top half of the arena to drop a snack. The blob hops around on its own — land the food on it.",
    warn:
      "Bitter coffee falls as often as the treats, and hammering the arena only makes it worse. Aim, don't flood.",
    start: "START",
    stop: "STOP",
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
    namePh: "Your name",
    emailPh: "you@mail.com",
    msgPh: "Say something...",
    btn: "SEND",
    sent: "SENT ✓ THANK YOU!",
    note: "Wired to an n8n automation workflow with a mailto fallback.",
    errAll: "All fields are required.",
    errEmail: "That email doesn't look right.",
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
      "Cựu Thực tập sinh FE @FPTIS",
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
          "Xây terminal thời gian thực theo dõi 30 mã cổ phiếu và hơn 300 chứng quyền cho trader KB Financial Group, mô hình hoá 54 chỉ số định giá, rủi ro và P&L từ Black-Scholes, các Greeks và trạng thái tồn kho. Giảm 84% dung lượng WebSocket nhờ gửi bản vá sai khác thay vì toàn bộ snapshot, và 98% số request upstream nhờ gộp 50 mã mỗi lần gọi; dữ liệu lịch sử đưa vào Redis đặt trước các truy vấn Postgres có index trên hơn 100.000 bản ghi. Đưa CW Portal lên kiến trúc hai máy ảo — Next.js sau Nginx, FastAPI, Kafka và Postgres chạy container — với 16 REST endpoint có pytest, cùng pipeline n8n lo khử trùng lặp, chuẩn hoá và snapshot giá điều chỉnh.",
      },
      {
        role: "Thực tập sinh Kỹ thuật phần mềm",
        blurb:
          "Đồng phát triển nền tảng phân tích tài chính trên LangChain và pgvector, lập chỉ mục kho hơn 500 tài liệu cho tìm kiếm vector và dựng ngữ cảnh cho LLM. Giảm một nửa độ trễ end-to-end nhờ chuyển luồng request sang I/O bất đồng bộ, nén prompt trước khi gửi và cache kết quả truy hồi để câu hỏi lặp lại không phải gọi mô hình lần nữa. Đóng gói backend bằng Docker và cấu hình GitHub Actions chạy bộ test mỗi lần push, chuẩn hoá môi trường phát triển và QA.",
      },
      {
        role: "Thực tập sinh Kỹ thuật phần mềm",
        blurb:
          "Xây pipeline nội dung đa mô hình trên Vue và FastAPI, bóc tách đề bài thành từ khoá, giọng văn, ý định và metadata, rồi định tuyến đầu ra của từng nền tảng tới mô hình phù hợp nhất — DeepSeek V3 để trích xuất, GPT-4 để viết. Thêm vòng lặp theo mẫu chấm điểm từng bản nháp bằng tín hiệu SEO bên ngoài và prompt lại đến khi đạt ngưỡng, tạo ra hơn 100 bài đã xuất bản. Gom trạng thái dùng chung của dashboard để điều hướng và chỉnh sửa luôn đồng bộ giữa các màn hình.",
      },
      {
        role: "Thực tập sinh Kỹ thuật Front-end",
        blurb:
          "Kỹ thuật front-end cho các hệ thống doanh nghiệp phục vụ khách hàng ngân hàng, dựng giao diện làm việc với các API dịch vụ nội bộ.",
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
  game: {
    label: "GAME",
    kicker: "THỬ THÁCH NHỎ",
    title: "Cho blob đói ăn",
    rules:
      "Bấm vào nửa trên của sân chơi để thả đồ ăn xuống. Blob tự nhảy qua lại — canh sao cho đồ ăn rơi trúng nó.",
    warn:
      "Cà phê đắng rơi nhiều ngang đồ ngọt, bấm càng dồn dập thì càng nhiều. Canh chuẩn, đừng spam.",
    start: "BẮT ĐẦU",
    stop: "DỪNG",
    again: "CHƠI LẠI",
    score: "ĐIỂM",
    time: "THỜI GIAN",
    goal: "MỤC TIÊU",
    pts: "ĐIỂM",
    dropHint: "BẤM NỬA TRÊN ĐỂ THẢ ĐỒ ĂN",
    tooLow: "Thấp quá! Thả từ nửa trên nhé.",
    greeting: "Đói quá, thả trà sữa cho tớ đi!",
    food: {
      boba: "TRÀ SỮA",
      donut: "DONUT",
      coffee: "CÀ PHÊ ĐẮNG",
    },
    introTitle: "CHO BLOB ĐÓI ĂN",
    introText:
      "Thả đồ ăn từ nửa trên xuống miệng blob. Cà phê đắng rơi cũng thường xuyên không kém, nên canh chứ đừng spam.",
    wonTitle: "NO NÊ RỒI!",
    wonLine: "Ngon quá! Cảm ơn trà sữa nha.",
    lostTitle: "BLOB XỈU RỒI",
    lostLine: "Ăn thì ít, mà cà phê đắng thì nhiều.",
    finalScore: "ĐIỂM CUỐI",
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
          "为 KB 金融集团交易员搭建实时终端，跟踪 30 只股票与 300+ 备兑权证，基于 Black-Scholes 输出、希腊字母与库存敞口建模 54 项定价、风险与损益指标。改为发送差分补丁而非完整快照，WebSocket 负载降低 84%；每次请求批量 50 个标的，上游请求减少 98%；历史序列放入 Redis，前置于 100,000+ 条记录的带索引 Postgres 查询。在双虚拟机架构上交付 CW Portal——Nginx 后的 Next.js，容器化的 FastAPI、Kafka 与 Postgres——16 个 REST 接口配有 pytest，并用 n8n 管道处理去重、归一化与复权快照。",
      },
      {
        role: "软件工程实习生",
        blurb:
          "基于 LangChain 与 pgvector 共同搭建金融分析平台，为 500+ 份文档语料建立索引，用于向量检索与 LLM 上下文组装。将请求流程改为异步 I/O、发送前压缩提示词、缓存检索结果，使重复问题不再二次调用模型，生产端到端延迟降低约一半。用 Docker 容器化后端，并配置 GitHub Actions 在每次推送时运行测试，统一开发与 QA 环境。",
      },
      {
        role: "软件工程实习生",
        blurb:
          "在 Vue 与 FastAPI 上搭建多模型内容流水线，把需求解析为关键词、语气、意图与元数据，再将各平台的输出路由到最合适的模型——DeepSeek V3 负责抽取，GPT-4 负责撰写。加入范例驱动的循环，用外部 SEO 信号为每份草稿评分并反复重写直至达标，产出 100+ 篇已发布文章。集中管理仪表盘共享状态，使导航与编辑在各视图间保持同步。",
      },
      {
        role: "前端工程实习生",
        blurb:
          "为银行客户的企业系统做前端开发，围绕内部服务 API 构建界面。",
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
  game: {
    label: "游戏",
    kicker: "小挑战",
    title: "喂饱小蓝团",
    rules:
      "点击场地上半部分投下食物。小蓝团会自己跳来跳去，瞄准它再投。",
    warn:
      "苦咖啡出现的概率和点心一样高，连点得越快苦咖啡越多。瞄准投，别乱点。",
    start: "开始",
    stop: "停止",
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
    namePh: "你的名字",
    emailPh: "you@mail.com",
    msgPh: "说点什么…",
    btn: "发送",
    sent: "已发送 ✓ 谢谢！",
    note: "接入 n8n 自动化工作流，并保留 mailto 兜底。",
    errAll: "请填写所有字段。",
    errEmail: "这个邮箱格式不太对。",
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
    place: "Ho Chi Minh City",
    icon: "logo-fpt",
    term: "May – Jul 2024",
    stack: ["REACT", "TYPESCRIPT", "REST APIS", "GIT"],
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
