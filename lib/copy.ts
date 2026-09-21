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
          "Two products off one market-data spine: a live terminal for the covered-warrant desk, and KBSV's public CW portal. The maths was never the hard part \u2014 keeping a firehose of quotes correct and current enough that a trader trusts the number on screen was.",
        bullets: [
          "Pushes differential patches over the socket instead of whole snapshots: the client carries the reconciliation logic in exchange for a fraction of the bandwidth.",
          "Desk terminal and public portal sit on separate VMs \u2014 Next.js behind Nginx on one, containerised FastAPI, Kafka and Postgres on the other \u2014 so public traffic and the trading feed never share a box.",
          "The data layer is its own pipeline rather than app code, so deduplication, normalisation and adjusted prices are solved once and both products read the same history.",
        ],
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "A financial analytics platform that answers questions against a document corpus. Almost all of the wall-clock cost turned out to be waiting on I/O rather than on the model, which changed what was worth optimising.",
        bullets: [
          "Latency came down through async request flows and cached retrieval, not by reaching for a larger model.",
          "Compressed prompts before dispatch, then checked the answers held up \u2014 cheaper and faster only counts if the output survives it.",
          "Containerised the backend and ran the suite on every push, so \u201cworks on my machine\u201d stopped being a category of bug.",
        ],
      },
      {
        role: "Software Engineer Intern",
        blurb:
          "A content platform where one brief fans out into drafts for several platforms. Handing the whole job to a single model gave bland output, so the pipeline was broken into stages that could each be judged on its own.",
        bullets: [
          "Routes by task rather than standardising on one model: a cheap model for extraction, a strong one for drafting.",
          "Makes quality a loop instead of a prompt \u2014 score each draft against external SEO signals, re-prompt until it clears the bar.",
          "Centralised the shared dashboard state so an edit in one view never leaves another view stale.",
        ],
      },
      {
        role: "Frontend Engineer Intern",
        blurb:
          "My first internship: a B2B procurement system for Rang Dong, built for procurement staff rather than engineers. The expensive failure there is not a crash \u2014 it is a typo that quietly propagates into a budget.",
        bullets: [
          "Put validation inside plan creation and editing, because catching a wrong figure at entry is worth more than any amount of reporting downstream.",
          "With 200,000+ plans in the system, navigation was the feature \u2014 finding the right plan mattered more than drawing it.",
          "Ran the weekly budget analysis across 16 IT categories myself, which is how I learned what the interface actually had to surface.",
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
        thumb: "ITCH FEED HANDLER\nc++20 \u00b7 l2 reconstruction",
        blurb:
          "A C++20 Nasdaq TotalView-ITCH 5.0 feed handler that rebuilds aggregated L2 order books straight from the raw event stream, measured against a full 11.25 GB exchange session.",
        bullets: [
          "368M messages replayed into 8,695 per-symbol books, checked by 24 correctness scenarios and UBSan",
          "Profiling, not guesswork, drove a symbol-interning layout change worth 12.3% on replay",
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
        role: "Th\u1ef1c t\u1eadp sinh K\u1ef9 s\u01b0 Ph\u1ea7n m\u1ec1m",
        blurb:
          "Hai s\u1ea3n ph\u1ea9m d\u1ef1a tr\u00ean c\u00f9ng m\u1ed9t l\u1ed5i d\u1eef li\u1ec7u th\u1ecb tr\u01b0\u1eddng: terminal th\u1eddi gian th\u1ef1c cho b\u00e0n ch\u1ee9ng quy\u1ec1n, v\u00e0 CW Portal c\u00f4ng khai c\u1ee7a KBSV. Ph\u1ea7n kh\u00f3 kh\u00f4ng n\u1eb1m \u1edf c\u00f4ng th\u1ee9c, m\u00e0 \u1edf vi\u1ec7c gi\u1eef d\u00f2ng gi\u00e1 lu\u00f4n \u0111\u00fang v\u00e0 \u0111\u1ee7 m\u1edbi \u0111\u1ec3 trader tin con s\u1ed1 tr\u00ean m\u00e0n h\u00ecnh.",
        bullets: [
          "G\u1eedi b\u1ea3n v\u00e1 sai kh\u00e1c qua socket thay v\u00ec nguy\u00ean snapshot: client ph\u1ea3i t\u1ef1 gh\u00e9p l\u1ea1i tr\u1ea1ng th\u00e1i, \u0111\u1ed5i l\u1ea1i b\u0103ng th\u00f4ng ch\u1ec9 c\u00f2n m\u1ed9t ph\u1ea7n nh\u1ecf.",
          "Terminal c\u1ee7a b\u00e0n giao d\u1ecbch v\u00e0 portal c\u00f4ng khai n\u1eb1m tr\u00ean hai VM ri\u00eang \u2014 Next.js sau Nginx m\u1ed9t b\u00ean, FastAPI/Kafka/Postgres \u0111\u00f3ng container b\u00ean c\u00f2n l\u1ea1i \u2014 n\u00ean traffic c\u00f4ng khai kh\u00f4ng bao gi\u1edd d\u00f9ng chung m\u00e1y v\u1edbi lu\u1ed3ng giao d\u1ecbch.",
          "T\u1ea7ng d\u1eef li\u1ec7u l\u00e0 pipeline ri\u00eang ch\u1ee9 kh\u00f4ng n\u1eb1m trong code \u1ee9ng d\u1ee5ng, n\u00ean kh\u1eed tr\u00f9ng, chu\u1ea9n ho\u00e1 v\u00e0 gi\u00e1 \u0111i\u1ec1u ch\u1ec9nh ch\u1ec9 x\u1eed l\u00fd m\u1ed9t l\u1ea7n, c\u1ea3 hai s\u1ea3n ph\u1ea9m \u0111\u1ecdc c\u00f9ng m\u1ed9t l\u1ecbch s\u1eed.",
        ],
      },
      {
        role: "Th\u1ef1c t\u1eadp sinh K\u1ef9 s\u01b0 Ph\u1ea7n m\u1ec1m",
        blurb:
          "N\u1ec1n t\u1ea3ng ph\u00e2n t\u00edch t\u00e0i ch\u00ednh tr\u1ea3 l\u1eddi c\u00e2u h\u1ecfi d\u1ef1a tr\u00ean kho t\u00e0i li\u1ec7u. H\u1ea7u h\u1ebft th\u1eddi gian ch\u1edd h\u00f3a ra l\u00e0 I/O ch\u1ee9 kh\u00f4ng ph\u1ea3i m\u00f4 h\u00ecnh, v\u00e0 \u0111i\u1ec1u \u0111\u00f3 thay \u0111\u1ed5i vi\u1ec7c g\u00ec \u0111\u00e1ng t\u1ed1i \u01b0u.",
        bullets: [
          "\u0110\u1ed9 tr\u1ec5 gi\u1ea3m nh\u1edd lu\u1ed3ng b\u1ea5t \u0111\u1ed3ng b\u1ed9 v\u00e0 cache truy h\u1ed3i, kh\u00f4ng ph\u1ea3i nh\u1edd \u0111\u1ed5i sang m\u00f4 h\u00ecnh l\u1edbn h\u01a1n.",
          "N\u00e9n prompt tr\u01b0\u1edbc khi g\u1eedi, r\u1ed3i ki\u1ec3m l\u1ea1i ch\u1ea5t l\u01b0\u1ee3ng c\u00e2u tr\u1ea3 l\u1eddi \u2014 r\u1ebb v\u00e0 nhanh ch\u1ec9 c\u00f3 ngh\u0129a n\u1ebfu \u0111\u1ea7u ra kh\u00f4ng t\u1ec7 \u0111i.",
          "\u0110\u00f3ng container backend v\u00e0 ch\u1ea1y test m\u1ed7i l\u1ea7n push, \u0111\u1ec3 \u201cm\u00e1y t\u00f4i ch\u1ea1y \u0111\u01b0\u1ee3c\u201d kh\u00f4ng c\u00f2n l\u00e0 m\u1ed9t lo\u1ea1i bug.",
        ],
      },
      {
        role: "Th\u1ef1c t\u1eadp sinh K\u1ef9 s\u01b0 Ph\u1ea7n m\u1ec1m",
        blurb:
          "N\u1ec1n t\u1ea3ng n\u1ed9i dung bi\u1ebfn m\u1ed9t \u0111\u1ec1 b\u00e0i th\u00e0nh nhi\u1ec1u b\u1ea3n nh\u00e1p cho t\u1eebng k\u00eanh. Giao tr\u1ecdn cho m\u1ed9t m\u00f4 h\u00ecnh th\u00ec \u0111\u1ea7u ra nh\u1ea1t, n\u00ean pipeline \u0111\u01b0\u1ee3c ch\u1ebb th\u00e0nh c\u00e1c ch\u1eb7ng c\u00f3 th\u1ec3 ch\u1ea5m \u0111i\u1ec3m ri\u00eang.",
        bullets: [
          "\u0110\u1ecbnh tuy\u1ebfn theo lo\u1ea1i vi\u1ec7c thay v\u00ec d\u00f9ng chung m\u1ed9t m\u00f4 h\u00ecnh: m\u00f4 h\u00ecnh r\u1ebb \u0111\u1ec3 tr\u00edch xu\u1ea5t, m\u00f4 h\u00ecnh m\u1ea1nh \u0111\u1ec3 vi\u1ebft.",
          "Bi\u1ebfn ch\u1ea5t l\u01b0\u1ee3ng th\u00e0nh v\u00f2ng l\u1eb7p ch\u1ee9 kh\u00f4ng ph\u1ea3i m\u1ed9t c\u00e2u prompt \u2014 ch\u1ea5m t\u1eebng b\u1ea3n nh\u00e1p theo t\u00edn hi\u1ec7u SEO b\u00ean ngo\u00e0i r\u1ed3i prompt l\u1ea1i \u0111\u1ebfn khi \u0111\u1ea1t ng\u01b0\u1ee1ng.",
          "Gom tr\u1ea1ng th\u00e1i dashboard v\u1ec1 m\u1ed9t ch\u1ed7 \u0111\u1ec3 s\u1eeda \u1edf m\u00e0n n\u00e0y kh\u00f4ng l\u00e0m m\u00e0n kia l\u1ec7ch d\u1eef li\u1ec7u.",
        ],
      },
      {
        role: "Th\u1ef1c t\u1eadp sinh K\u1ef9 s\u01b0 Frontend",
        blurb:
          "K\u1ef3 th\u1ef1c t\u1eadp \u0111\u1ea7u ti\u00ean: h\u1ec7 th\u1ed1ng mua s\u1eafm B2B cho R\u1ea1ng \u0110\u00f4ng, ng\u01b0\u1eddi d\u00f9ng l\u00e0 nh\u00e2n vi\u00ean mua h\u00e0ng ch\u1ee9 kh\u00f4ng ph\u1ea3i k\u1ef9 s\u01b0. L\u1ed7i \u0111\u1eaft nh\u1ea5t \u1edf \u0111\u00f3 kh\u00f4ng ph\u1ea3i crash, m\u00e0 l\u00e0 m\u1ed9t con s\u1ed1 g\u00f5 sai l\u1eb7ng l\u1ebd ch\u1ea1y v\u00e0o ng\u00e2n s\u00e1ch.",
        bullets: [
          "\u0110\u01b0a ki\u1ec3m tra h\u1ee3p l\u1ec7 v\u00e0o ngay b\u01b0\u1edbc t\u1ea1o v\u00e0 s\u1eeda k\u1ebf ho\u1ea1ch, v\u00ec b\u1eaft \u0111\u01b0\u1ee3c con s\u1ed1 sai l\u00fac nh\u1eadp \u0111\u00e1ng gi\u00e1 h\u01a1n m\u1ecdi b\u00e1o c\u00e1o v\u1ec1 sau.",
          "V\u1edbi h\u01a1n 200.000 k\u1ebf ho\u1ea1ch trong h\u1ec7 th\u1ed1ng, \u0111i\u1ec1u h\u01b0\u1edbng ch\u00ednh l\u00e0 t\u00ednh n\u0103ng \u2014 t\u00ecm \u0111\u00fang k\u1ebf ho\u1ea1ch quan tr\u1ecdng h\u01a1n v\u1ebd n\u00f3 ra.",
          "T\u1ef1 l\u00e0m ph\u00e2n t\u00edch ng\u00e2n s\u00e1ch h\u00e0ng tu\u1ea7n cho 16 h\u1ea1ng m\u1ee5c CNTT, nh\u1edd v\u1eady m\u1edbi hi\u1ec3u giao di\u1ec7n th\u1ef1c s\u1ef1 c\u1ea7n hi\u1ec3n th\u1ecb g\u00ec.",
        ],
      },
    ],
  },
  projects: {
    label: "DỰ ÁN",
    visit: "MỞ",
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
      {
        kicker: "D\u1ef0 \u00c1N 03",
        title: "ITCH Feed Handler",
        thumb: "ITCH FEED HANDLER\nc++20 \u00b7 d\u1ef1ng l\u1ea1i s\u1ed5 l\u1ec7nh l2",
        blurb:
          "Feed handler Nasdaq TotalView-ITCH 5.0 vi\u1ebft b\u1eb1ng C++20, d\u1ef1ng l\u1ea1i s\u1ed5 l\u1ec7nh L2 t\u1ed5ng h\u1ee3p tr\u1ef1c ti\u1ebfp t\u1eeb lu\u1ed3ng s\u1ef1 ki\u1ec7n th\u00f4, \u0111o tr\u00ean tr\u1ecdn phi\u00ean giao d\u1ecbch 11,25 GB.",
        bullets: [
          "368 tri\u1ec7u b\u1ea3n tin d\u1ef1ng th\u00e0nh 8.695 s\u1ed5 l\u1ec7nh theo m\u00e3, ki\u1ec3m b\u1eb1ng 24 k\u1ecbch b\u1ea3n \u0111\u00fang-sai v\u00e0 UBSan",
          "D\u1ef1a tr\u00ean profiling ch\u1ee9 kh\u00f4ng ph\u1ea3i ph\u1ecfng \u0111o\u00e1n \u0111\u1ec3 \u0111\u1ed5i layout intern symbol, nhanh th\u00eam 12,3%",
          "Nh\u1eadt k\u00fd k\u1ef9 thu\u1eadt gi\u1eef l\u1ea1i c\u1ea3 nh\u1eefng t\u1ed1i \u01b0u th\u1ea5t b\u1ea1i k\u00e8m s\u1ed1 li\u1ec7u",
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
    kicker: "THỬ THÁCH NHỎ",
    title: "Cho blob đói ăn",
    rules:
      "Bấm vào nửa trên của sân chơi để thả đồ ăn xuống. Blob tự nhảy qua lại — canh sao cho đồ ăn rơi trúng nó.",
    warn:
      "Cà phê đắng rơi nhiều ngang đồ ngọt, bấm càng dồn dập thì càng nhiều. Canh chuẩn, đừng spam.",
    start: "BẮT ĐẦU",
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
    namePh: "ví dụ: Nhan Nguyen",
    emailPh: "ví dụ: xuannhan.nguyen@gmail.com",
    msgPh:
      "Chào Nhân, mình muốn hẹn một buổi trao đổi... (con blob đang ăn mừng rồi)",
    btn: "GỬI",
    sent: "ĐÃ GỬI ✓ CẢM ƠN!",
    note: "Hoặc gửi thẳng email cho mình:",
    resume: "HỒ SƠ",
    errAll: "Vui lòng điền hết các ô.",
    errEmail: "Email này chưa đúng định dạng.",
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
        role: "\u8f6f\u4ef6\u5de5\u7a0b\u5b9e\u4e60\u751f",
        blurb:
          "\u540c\u4e00\u6761\u884c\u60c5\u6570\u636e\u4e3b\u5e72\u4e0a\u7684\u4e24\u4e2a\u4ea7\u54c1\uff1a\u7ed9\u6743\u8bc1\u4ea4\u6613\u53f0\u7684\u5b9e\u65f6\u7ec8\u7aef\uff0c\u4ee5\u53ca KBSV \u5bf9\u5916\u7684 CW \u95e8\u6237\u3002\u96be\u70b9\u4e0d\u5728\u516c\u5f0f\uff0c\u800c\u5728\u4e8e\u8ba9\u6d77\u91cf\u884c\u60c5\u65e2\u51c6\u786e\u53c8\u8db3\u591f\u65b0\uff0c\u4ea4\u6613\u5458\u624d\u4f1a\u4fe1\u4efb\u5c4f\u4e0a\u7684\u6570\u5b57\u3002",
        bullets: [
          "\u901a\u8fc7 socket \u53d1\u9001\u5dee\u5f02\u8865\u4e01\u800c\u975e\u5b8c\u6574\u5feb\u7167\uff1a\u5ba2\u6237\u7aef\u627f\u62c5\u72b6\u6001\u5408\u5e76\u903b\u8f91\uff0c\u6362\u6765\u5e26\u5bbd\u53ea\u5269\u4e00\u5c0f\u90e8\u5206\u3002",
          "\u4ea4\u6613\u53f0\u7ec8\u7aef\u548c\u5bf9\u5916\u95e8\u6237\u5206\u5728\u4e24\u53f0 VM \u4e0a \u2014\u2014 \u4e00\u53f0\u662f Nginx \u540e\u7684 Next.js\uff0c\u53e6\u4e00\u53f0\u662f\u5bb9\u5668\u5316\u7684 FastAPI\u3001Kafka \u548c Postgres \u2014\u2014 \u5bf9\u5916\u6d41\u91cf\u6c38\u8fdc\u4e0d\u4f1a\u548c\u4ea4\u6613\u6570\u636e\u6d41\u5171\u7528\u4e00\u53f0\u673a\u5668\u3002",
          "\u6570\u636e\u5c42\u662f\u72ec\u7acb\u7ba1\u9053\u800c\u975e\u5e94\u7528\u4ee3\u7801\uff0c\u53bb\u91cd\u3001\u5f52\u4e00\u5316\u548c\u590d\u6743\u4ef7\u683c\u53ea\u5904\u7406\u4e00\u6b21\uff0c\u4e24\u4e2a\u4ea7\u54c1\u8bfb\u5230\u540c\u4e00\u4efd\u5386\u53f2\u3002",
        ],
      },
      {
        role: "\u8f6f\u4ef6\u5de5\u7a0b\u5b9e\u4e60\u751f",
        blurb:
          "\u4e00\u4e2a\u57fa\u4e8e\u6587\u6863\u8bed\u6599\u56de\u7b54\u95ee\u9898\u7684\u91d1\u878d\u5206\u6790\u5e73\u53f0\u3002\u7edd\u5927\u90e8\u5206\u8017\u65f6\u5176\u5b9e\u82b1\u5728\u7b49 I/O \u800c\u4e0d\u662f\u6a21\u578b\u63a8\u7406\uff0c\u8fd9\u6539\u53d8\u4e86\u4ec0\u4e48\u503c\u5f97\u4f18\u5316\u3002",
        bullets: [
          "\u5ef6\u8fdf\u7684\u4e0b\u964d\u6765\u81ea\u5f02\u6b65\u8bf7\u6c42\u6d41\u548c\u68c0\u7d22\u7f13\u5b58\uff0c\u800c\u4e0d\u662f\u6362\u4e00\u4e2a\u66f4\u5927\u7684\u6a21\u578b\u3002",
          "\u53d1\u9001\u524d\u538b\u7f29\u63d0\u793a\u8bcd\uff0c\u518d\u56de\u5934\u9a8c\u8bc1\u7b54\u6848\u8d28\u91cf \u2014\u2014 \u66f4\u4fbf\u5b9c\u66f4\u5feb\uff0c\u524d\u63d0\u662f\u8f93\u51fa\u6ca1\u53d8\u5dee\u3002",
          "\u540e\u7aef\u5bb9\u5668\u5316\u5e76\u5728\u6bcf\u6b21\u63a8\u9001\u65f6\u8dd1\u6d4b\u8bd5\uff0c\u8ba9\u201c\u6211\u673a\u5668\u4e0a\u6ca1\u95ee\u9898\u201d\u4e0d\u518d\u662f\u4e00\u7c7b bug\u3002",
        ],
      },
      {
        role: "\u8f6f\u4ef6\u5de5\u7a0b\u5b9e\u4e60\u751f",
        blurb:
          "\u4e00\u4e2a\u628a\u5355\u4e00\u9700\u6c42\u5c55\u5f00\u6210\u591a\u5e73\u53f0\u8349\u7a3f\u7684\u5185\u5bb9\u5e73\u53f0\u3002\u6574\u4ef6\u4e8b\u4ea4\u7ed9\u4e00\u4e2a\u6a21\u578b\u4f1a\u5f97\u5230\u5e73\u5ead\u7684\u8f93\u51fa\uff0c\u6240\u4ee5\u7ba1\u9053\u88ab\u62c6\u6210\u53ef\u4ee5\u5355\u72ec\u8bc4\u5206\u7684\u51e0\u6bb5\u3002",
        bullets: [
          "\u6309\u4efb\u52a1\u8def\u7531\u800c\u4e0d\u662f\u7edf\u4e00\u7528\u4e00\u4e2a\u6a21\u578b\uff1a\u4fbf\u5b9c\u6a21\u578b\u505a\u62bd\u53d6\uff0c\u5f3a\u6a21\u578b\u505a\u6539\u5199\u3002",
          "\u628a\u8d28\u91cf\u505a\u6210\u5faa\u73af\u800c\u4e0d\u662f\u4e00\u53e5\u63d0\u793a\u8bcd \u2014\u2014 \u7528\u5916\u90e8 SEO \u4fe1\u53f7\u7ed9\u6bcf\u7248\u8349\u7a3f\u6253\u5206\uff0c\u4e0d\u8fbe\u6807\u5c31\u91cd\u65b0\u751f\u6210\u3002",
          "\u5c06\u5171\u4eab\u7684\u4eea\u8868\u76d8\u72b6\u6001\u96c6\u4e2d\u7ba1\u7406\uff0c\u4e00\u4e2a\u89c6\u56fe\u7684\u7f16\u8f91\u4e0d\u4f1a\u8ba9\u53e6\u4e00\u4e2a\u89c6\u56fe\u7684\u6570\u636e\u8fc7\u671f\u3002",
        ],
      },
      {
        role: "\u524d\u7aef\u5de5\u7a0b\u5b9e\u4e60\u751f",
        blurb:
          "\u6211\u7684\u7b2c\u4e00\u4efd\u5b9e\u4e60\uff1a\u4e3a Rang Dong \u505a\u7684 B2B \u91c7\u8d2d\u7ba1\u7406\u7cfb\u7edf\uff0c\u7528\u6237\u662f\u91c7\u8d2d\u4eba\u5458\u800c\u4e0d\u662f\u5de5\u7a0b\u5e08\u3002\u90a3\u91cc\u6700\u6602\u8d35\u7684\u6545\u969c\u4e0d\u662f\u5d29\u6e83\uff0c\u800c\u662f\u4e00\u4e2a\u6572\u9519\u7684\u6570\u5b57\u60c4\u65e0\u58f0\u606f\u5730\u8fdb\u4e86\u9884\u7b97\u3002",
        bullets: [
          "\u628a\u6821\u9a8c\u653e\u8fdb\u8ba1\u5212\u7684\u521b\u5efa\u548c\u7f16\u8f91\u73af\u8282\uff0c\u56e0\u4e3a\u5f55\u5165\u65f6\u62e6\u4e0b\u9519\u8bef\u6570\u5b57\uff0c\u6bd4\u4e8b\u540e\u4efb\u4f55\u62a5\u8868\u90fd\u503c\u94b1\u3002",
          "\u7cfb\u7edf\u91cc\u6709\u8d85\u8fc7 20 \u4e07\u4efd\u8ba1\u5212\uff0c\u5bfc\u822a\u672c\u8eab\u5c31\u662f\u529f\u80fd \u2014\u2014 \u627e\u5230\u5bf9\u7684\u90a3\u4efd\u6bd4\u628a\u5b83\u753b\u51fa\u6765\u66f4\u91cd\u8981\u3002",
          "\u6bcf\u5468 16 \u4e2a IT \u9884\u7b97\u7c7b\u76ee\u7684\u5206\u6790\u662f\u6211\u81ea\u5df1\u505a\u7684\uff0c\u90a3\u624d\u77e5\u9053\u754c\u9762\u771f\u6b63\u8981\u5448\u73b0\u4ec0\u4e48\u3002",
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
        kicker: "\u9879\u76ee 03",
        title: "ITCH Feed Handler",
        thumb: "ITCH FEED HANDLER\nc++20 \u00b7 l2 \u8ba2\u5355\u7c3f\u91cd\u5efa",
        blurb:
          "\u7528 C++20 \u5b9e\u73b0\u7684 Nasdaq TotalView-ITCH 5.0 \u884c\u60c5\u89e3\u6790\u5668\uff0c\u76f4\u63a5\u4ece\u539f\u59cb\u4e8b\u4ef6\u6d41\u91cd\u5efa\u805a\u5408 L2 \u8ba2\u5355\u7c3f\uff0c\u5728\u5b8c\u6574\u7684 11.25 GB \u4ea4\u6613\u65e5\u4e0a\u5b9e\u6d4b\u3002",
        bullets: [
          "3.68 \u4ebf\u6761\u6d88\u606f\u91cd\u5efa\u51fa 8,695 \u4e2a\u4e2a\u80a1\u8ba2\u5355\u7c3f\uff0c\u7531 24 \u4e2a\u6b63\u786e\u6027\u573a\u666f\u548c UBSan \u6821\u9a8c",
          "\u9760 profiling \u800c\u975e\u731c\u6d4b\u9a71\u52a8\u7684 symbol interning \u5e03\u5c40\u6539\u9020\uff0c\u56de\u653e\u63d0\u901f 12.3%",
          "\u5de5\u7a0b\u65e5\u5fd7\u4fdd\u7559\u4e86\u90a3\u4e9b\u6ca1\u6709\u594f\u6548\u7684\u4f18\u5316\u53ca\u5176\u6570\u636e",
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
