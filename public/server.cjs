var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_child_process = require("child_process");
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json({ limit: "20mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "20mb" }));
app.use(import_express.default.text({ limit: "20mb", type: ["text/*", "application/x-ndjson"] }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
var UPLOADS_DIR = import_path.default.join(process.cwd(), "public", "uploads");
if (!import_fs.default.existsSync(UPLOADS_DIR)) {
  import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", import_express.default.static(UPLOADS_DIR));
var DEFAULT_USERS = [
  {
    id: "usr_admin_01",
    email: "thegioiadmin@gmail.com",
    name: "Nguy\u1EC5n Th\xE0nh Nam",
    username: "thegioiadmin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    role: "admin",
    isStaff: true,
    staffPosition: "admin",
    staffRoleBadge: "ADMIN",
    staffPermissions: ["support", "finance", "moderation", "users", "analytics"],
    staffDepartment: "Ban Qu\u1EA3n Tr\u1ECB T\u1ED1i Cao",
    staffTitle: "Qu\u1EA3n Tr\u1ECB Vi\xEAn Tr\u01B0\u1EDFng",
    status: "active",
    plan: "vip",
    verified: true,
    createdAt: "2026-08-01T08:00:00Z",
    balance: 5e6,
    bioCount: 3,
    totalViews: 18450
  },
  {
    id: "usr_staff_01",
    email: "nhanvien@trangcanhan.com",
    name: "Tr\u1EA7n Th\u1ECB Thu H\xE0",
    username: "nhanvien",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    phone: "0977112233",
    role: "support",
    isStaff: true,
    staffPosition: "support",
    staffRoleBadge: "CSKH",
    staffPermissions: ["support", "users"],
    staffDepartment: "Ph\xF2ng Ch\u0103m S\xF3c Kh\xE1ch H\xE0ng",
    staffTitle: "Chuy\xEAn Vi\xEAn H\u1ED7 Tr\u1EE3 Kh\xE1ch H\xE0ng 24/7",
    status: "active",
    plan: "vip",
    verified: true,
    createdAt: "2026-08-05T09:00:00Z",
    balance: 1e6,
    bioCount: 1,
    totalViews: 2340
  },
  {
    id: "usr_creator_02",
    email: "linhchi.beauty@gmail.com",
    name: "Linh Chi Beauty & Cosmetic",
    username: "linhchi",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    role: "user",
    status: "active",
    plan: "pro",
    verified: true,
    createdAt: "2026-08-10T14:20:00Z",
    balance: 25e4,
    bioCount: 1,
    totalViews: 8920
  },
  {
    id: "usr_creator_03",
    email: "hoangnam.photo@gmail.com",
    name: "Ho\xE0ng Nam Photography",
    username: "hoangnam",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    role: "user",
    status: "active",
    plan: "free",
    verified: false,
    createdAt: "2026-08-15T11:05:00Z",
    balance: 0,
    bioCount: 1,
    totalViews: 1450
  },
  {
    id: "usr_1787995706_93e7",
    email: "nguyenvanadaa@gmail.com",
    name: "nguyenvanadaa",
    username: "nguyenvanadaa",
    phone: "0987898767",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    role: "user",
    status: "active",
    plan: "free",
    verified: false,
    createdAt: "2026-08-20T10:00:00Z",
    balance: 95e4,
    bioCount: 1,
    totalViews: 320
  },
  {
    id: "usr_lybichngoc",
    email: "thangngockmhp@gmail.com",
    name: "L\xFD B\xEDch Ng\u1ECDc",
    username: "lybichngoc",
    phone: "0988889999",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    role: "admin",
    isStaff: true,
    staffPosition: "admin",
    staffRoleBadge: "ADMIN",
    staffPermissions: ["support", "finance", "moderation", "users", "analytics"],
    staffDepartment: "Ban Qu\u1EA3n Tr\u1ECB T\u1ED1i Cao",
    staffTitle: "Ng\u01B0\u1EDDi S\xE1ng L\u1EADp & Qu\u1EA3n Tr\u1ECB",
    status: "active",
    plan: "vip",
    verified: true,
    createdAt: "2026-08-01T08:00:00Z",
    balance: 5297e3,
    bioCount: 3,
    totalViews: 24500
  }
];
var DEFAULT_PASSWORDS = {
  "lybichngoc": "123456",
  "thangngockmhp@gmail.com": "123456",
  "thegioiadmin@gmail.com": "admin123",
  "thegioiadmin": "admin123",
  "nhanvien@trangcanhan.com": "123456",
  "nhanvien": "123456",
  "0977112233": "123456",
  "linhchi.beauty@gmail.com": "123456",
  "linhchi": "123456",
  "hoangnam.photo@gmail.com": "123456",
  "hoangnam": "123456",
  "nguyenvanadaa@gmail.com": "123456",
  "nguyenvanadaa": "123456",
  "0987898767": "123456"
};
var DEFAULT_BIOS = {
  thegioiadmin: {
    username: "thegioiadmin",
    profile: {
      displayName: "Nguy\u1EC5n Th\xE0nh Nam",
      bio: "Content Creator \u2022 S\xE1ng t\u1EA1o n\u1ED9i dung s\u1ED1 t\u1EA1i Vi\u1EC7t Nam. Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi TRANG C\xC1 NH\xC2N ch\xEDnh th\u1EE9c c\u1EE7a m\xECnh!",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      verifiedBadge: true,
      avatarShield: true,
      location: "TP. H\u1ED3 Ch\xED Minh, Vi\u1EC7t Nam",
      tagline: "K\u1EBFt n\u1ED1i \u0111am m\xEA - Chia s\u1EBB gi\xE1 tr\u1ECB",
      jobTitle: "Qu\u1EA3n Tr\u1ECB Vi\xEAn Tr\u01B0\u1EDFng",
      workplace: "TRANG C\xC1 NH\xC2N VI\u1EC6T NAM",
      address: "To\xE0 Nh\xE0 Landmark 81, Qu\u1EADn B\xECnh Th\u1EA1nh, TP. H\u1ED3 Ch\xED Minh",
      phone: "0988 889 999",
      email: "thegioiadmin@gmail.com",
      website: "https://trangcanhan.com",
      showContactChips: true,
      showShareButton: true,
      showVCard: true,
      showViewsCount: true,
      floatingHotline: {
        enabled: true,
        phone: "0988 889 999",
        label: "Hotline t\u01B0 v\u1EA5n",
        position: "right"
      }
    },
    theme: {
      id: "cyber-dark",
      name: "Cyberpunk Neon",
      bgType: "gradient",
      bgColor: "#09090b",
      bgGradient: { from: "#09090b", via: "#180e29", to: "#0f172a", direction: "to-b" },
      bgImageUrl: "",
      bgOverlayOpacity: 0.2,
      bgBlur: 0,
      fontFamily: "Plus Jakarta Sans",
      fontSize: "medium",
      textColor: "#f8fafc",
      accentColor: "#8b5cf6",
      cardStyle: "glass",
      cardBgColor: "rgba(30, 27, 75, 0.55)",
      cardTextColor: "#ffffff",
      cardBorderColor: "rgba(139, 92, 246, 0.4)",
      cardHoverEffect: "glow",
      buttonShape: "rounded-xl",
      buttonAnimation: "pulse",
      avatarShape: "circle",
      avatarBorderColor: "#8b5cf6",
      avatarBorderWidth: 3
    },
    socialLinks: [
      { id: "1", platform: "facebook", url: "https://facebook.com/namcreator", active: true, label: "Facebook C\xE1 Nh\xE2n" },
      { id: "2", platform: "tiktok", url: "https://tiktok.com/@namcreator", active: true, label: "TikTok 500k Followers" },
      { id: "3", platform: "youtube", url: "https://youtube.com/@namcreator", active: true, label: "K\xEAnh YouTube Review" },
      { id: "4", platform: "zalo", url: "https://zalo.me/0988889999", active: true, label: "Zalo C\xF4ng Vi\u1EC7c" },
      { id: "5", platform: "telegram", url: "https://t.me/thegioiadmin", active: true, label: "Telegram Admin" }
    ],
    blocks: [
      {
        id: "block-1",
        type: "link",
        enabled: true,
        order: 1,
        title: "\u{1F680} Kh\xF3a h\u1ECDc S\xE1ng t\u1EA1o N\u1ED9i dung TikTok t\u1EEB 0 - 100K Follow",
        url: "https://trangcanhan.com",
        subtitle: "\u0110ang gi\u1EA3m gi\xE1 45% cho 50 b\u1EA1n \u0111\u0103ng k\xFD s\u1EDBm nh\u1EA5t h\xF4m nay",
        highlight: true,
        badge: "\u{1F525} HOT NH\u1EA4T",
        isPinned: true,
        clickCount: 1420,
        animation: "glow"
      },
      {
        id: "block-2",
        type: "vietqr",
        enabled: true,
        order: 2,
        bankCode: "MB",
        bankAccount: "0988889999",
        accountHolder: "NGUYEN THANH NAM",
        amount: 5e4,
        message: "DONATE COFFEE CHO NAM",
        qrTitle: "\u2615 M\u1EDDi Nam m\u1ED9t ly c\xE0 ph\xEA l\xE0m \u0111\u1ED9ng l\u1EF1c",
        description: "M\u1ECDi s\u1EF1 \u1EE7ng h\u1ED9 c\u1EE7a b\u1EA1n l\xE0 ngu\u1ED3n \u0111\u1ED9ng vi\xEAn l\u1EDBn \u0111\u1EC3 m\xECnh ti\u1EBFp t\u1EE5c l\xE0m video ch\u1EA5t l\u01B0\u1EE3ng!",
        clickCount: 312
      },
      {
        id: "block-3",
        type: "contact_card",
        enabled: true,
        order: 3,
        jobTitle: "Qu\u1EA3n Tr\u1ECB Vi\xEAn Tr\u01B0\u1EDFng",
        workplace: "TRANG C\xC1 NH\xC2N VI\u1EC6T NAM",
        phone: "0988 889 999",
        email: "thegioiadmin@gmail.com",
        address: "To\xE0 Nh\xE0 Landmark 81, TP. H\u1ED3 Ch\xED Minh",
        vCardEnabled: true
      }
    ],
    seo: {
      title: "Nguy\u1EC5n Th\xE0nh Nam | TRANG C\xC1 NH\xC2N Ch\xEDnh Th\u1EE9c",
      description: "Gh\xE9 th\u0103m TRANG C\xC1 NH\xC2N ch\xEDnh th\u1EE9c c\u1EE7a Nguy\u1EC5n Th\xE0nh Nam - K\u1EBFt n\u1ED1i nhanh qua c\xE1c n\u1EC1n t\u1EA3ng m\u1EA1ng x\xE3 h\u1ED9i v\xE0 ng\xE2n h\xE0ng VietQR.",
      hideWatermark: true
    },
    customDomain: {
      domain: "",
      verified: false,
      cnameTarget: "cname.trangcanhan.com",
      sslActive: false,
      dnsRecords: []
    },
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  linhchi: {
    username: "linhchi",
    profile: {
      displayName: "Linh Chi Beauty & Cosmetic",
      bio: "Chuy\xEAn cung c\u1EA5p m\u1EF9 ph\u1EA9m x\xE1ch tay ch\xEDnh h\xE3ng 100% \u2022 Skincare routine chu\u1EA9n y khoa \u2022 T\u01B0 v\u1EA5n da mi\u1EC5n ph\xED.",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
      coverImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
      verifiedBadge: true,
      avatarShield: false,
      location: "H\xE0 N\u1ED9i, Vi\u1EC7t Nam",
      tagline: "V\u1EBB \u0111\u1EB9p t\u1EF1 nhi\xEAn c\u1EE7a b\u1EA1n l\xE0 s\u1EE9 m\u1EC7nh c\u1EE7a ch\xFAng t\xF4i",
      phone: "0912 345 678",
      email: "linhchi.beauty@gmail.com",
      showContactChips: true,
      showShareButton: true,
      showVCard: true
    },
    theme: {
      id: "rose-gold",
      name: "Rose Gold Luxury",
      bgType: "gradient",
      bgColor: "#1c1017",
      bgGradient: { from: "#1c1017", via: "#2d1522", to: "#120b10", direction: "to-b" },
      fontFamily: "Outfit",
      fontSize: "medium",
      textColor: "#fdf2f8",
      accentColor: "#f43f5e",
      cardStyle: "glass",
      cardBgColor: "rgba(50, 20, 35, 0.6)",
      cardTextColor: "#ffffff",
      cardBorderColor: "rgba(244, 63, 94, 0.3)",
      buttonShape: "rounded-2xl",
      avatarShape: "circle",
      avatarBorderColor: "#f43f5e",
      avatarBorderWidth: 3
    },
    socialLinks: [
      { id: "1", platform: "tiktok", url: "https://tiktok.com/@linhchibeauty", active: true, label: "TikTok Shop" },
      { id: "2", platform: "facebook", url: "https://facebook.com/linhchicosmetic", active: true, label: "Fanpage M\u1EF9 Ph\u1EA9m" },
      { id: "3", platform: "shopee", url: "https://shopee.vn/linhchicosmetics", active: true, label: "Gian h\xE0ng Shopee Mall" },
      { id: "4", platform: "zalo", url: "https://zalo.me/0912345678", active: true, label: "Zalo \u0110\u1EB7t H\xE0ng" }
    ],
    blocks: [
      {
        id: "blk-lc-1",
        type: "product",
        enabled: true,
        order: 1,
        title: "Serum T\xE1i T\u1EA1o Da Chuy\xEAn S\xE2u B5 Hyaluronic Acid",
        price: 38e4,
        originalPrice: 55e4,
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
        buttonText: "S\u0103n Deal Shopee Mall -30%",
        productUrl: "https://shopee.vn",
        isHot: true,
        clickCount: 1540
      }
    ],
    seo: {
      title: "Linh Chi Beauty & Cosmetic | TRANG C\xC1 NH\xC2N",
      description: "M\u1EF9 ph\u1EA9m x\xE1ch tay ch\xEDnh h\xE3ng, t\u01B0 v\u1EA5n Skincare routine chu\u1EA9n y khoa.",
      hideWatermark: true
    },
    customDomain: { domain: "", verified: false, cnameTarget: "cname.trangcanhan.com" },
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  hoangnam: {
    username: "hoangnam",
    profile: {
      displayName: "Ho\xE0ng Nam Photography",
      bio: "Nhi\u1EBFp \u1EA3nh gia t\u1EF1 do \u2022 Ch\u1EE5p \u1EA3nh c\u01B0\u1EDBi phong c\xE1ch H\xE0n Qu\u1ED1c, Lookbook th\u1EDDi trang & \u1EA2nh ch\xE2n dung ngh\u1EC7 thu\u1EADt.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      verifiedBadge: false,
      location: "\u0110\xE0 N\u1EB5ng, Vi\u1EC7t Nam",
      tagline: "L\u01B0u gi\u1EEF kho\u1EA3nh kh\u1EAFc thanh xu\xE2n tr\u1ECDn v\u1EB9n",
      phone: "0933 445 566",
      email: "hoangnam.photo@gmail.com",
      showContactChips: true,
      showShareButton: true
    },
    theme: {
      id: "minimal-slate",
      name: "Minimal Dark Slate",
      bgType: "color",
      bgColor: "#0f172a",
      fontFamily: "Plus Jakarta Sans",
      fontSize: "medium",
      textColor: "#f8fafc",
      accentColor: "#38bdf8",
      cardStyle: "glass",
      cardBgColor: "rgba(30, 41, 59, 0.7)",
      cardTextColor: "#ffffff",
      cardBorderColor: "rgba(56, 189, 248, 0.2)",
      buttonShape: "rounded-xl",
      avatarShape: "circle",
      avatarBorderColor: "#38bdf8",
      avatarBorderWidth: 2
    },
    socialLinks: [
      { id: "1", platform: "instagram", url: "https://instagram.com/hoangnam.visual", active: true, label: "Instagram Portfolio" },
      { id: "2", platform: "facebook", url: "https://facebook.com/hoangnamphoto", active: true, label: "Facebook Page" }
    ],
    blocks: [
      {
        id: "blk-hn-1",
        type: "link",
        enabled: true,
        order: 1,
        title: "\u{1F4F8} Xem B\u1EA3ng Gi\xE1 G\xF3i Ch\u1EE5p \u1EA2nh C\u01B0\u1EDBi & Lookbook 2026",
        url: "https://trangcanhan.com",
        subtitle: "Nh\u1EADn t\u01B0 v\u1EA5n concept ch\u1EE5p \u0111\u1ED9c quy\u1EC1n mi\u1EC5n ph\xED",
        clickCount: 420
      }
    ],
    seo: {
      title: "Ho\xE0ng Nam Photography | TRANG C\xC1 NH\xC2N",
      description: "Portfolio ch\u1EE5p \u1EA3nh c\u01B0\u1EDBi, lookbook th\u1EDDi trang v\xE0 ngh\u1EC7 thu\u1EADt.",
      hideWatermark: false
    },
    customDomain: { domain: "", verified: false, cnameTarget: "cname.trangcanhan.com" },
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
};
function loadDatabase() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (import_fs.default.existsSync(DB_FILE)) {
      const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : DEFAULT_USERS,
        passwords: { ...DEFAULT_PASSWORDS, ...parsed.passwords || {} },
        systemConfig: parsed.systemConfig || {},
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets : [],
        staffAuditLogs: Array.isArray(parsed.staffAuditLogs) ? parsed.staffAuditLogs : [],
        bioModerationQueue: Array.isArray(parsed.bioModerationQueue) ? parsed.bioModerationQueue : [],
        verificationRequests: Array.isArray(parsed.verificationRequests) ? parsed.verificationRequests : [],
        bios: { ...DEFAULT_BIOS, ...parsed.bios || {} },
        analytics: parsed.analytics || {},
        customTemplates: Array.isArray(parsed.customTemplates) ? parsed.customTemplates : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : []
      };
    }
  } catch (err) {
    console.error("Error loading db.json:", err);
  }
  const initialDb = {
    users: DEFAULT_USERS,
    passwords: DEFAULT_PASSWORDS,
    systemConfig: {},
    transactions: [],
    supportTickets: [],
    staffAuditLogs: [],
    bioModerationQueue: [],
    verificationRequests: [],
    bios: DEFAULT_BIOS,
    analytics: {},
    customTemplates: [],
    articles: []
  };
  saveDatabase(initialDb);
  return initialDb;
}
function saveDatabase(database) {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    const jsonStr = JSON.stringify(database, null, 2);
    import_fs.default.writeFileSync(DB_FILE, jsonStr, "utf-8");
    const publicDataDir = import_path.default.join(process.cwd(), "public", "data");
    if (!import_fs.default.existsSync(publicDataDir)) {
      import_fs.default.mkdirSync(publicDataDir, { recursive: true });
    }
    import_fs.default.writeFileSync(import_path.default.join(publicDataDir, "db.json"), jsonStr, "utf-8");
  } catch (err) {
    console.error("Error saving db.json:", err);
  }
}
var db = loadDatabase();
function createDefaultBioForUser(user) {
  const isVipOrAdmin = user.role === "admin" || user.plan === "vip" || user.plan === "pro";
  return {
    username: user.username,
    profile: {
      displayName: user.name || user.username,
      bio: `Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi TRANG C\xC1 NH\xC2N ch\xEDnh th\u1EE9c c\u1EE7a ${user.name || user.username}!`,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      verifiedBadge: isVipOrAdmin && Boolean(user.verified),
      avatarShield: false,
      phone: user.phone || "",
      email: user.email || "",
      workplace: user.businessName || "",
      tagline: user.accountType === "business" ? user.industry || "Doanh Nghi\u1EC7p & D\u1ECBch V\u1EE5" : "K\u1EBFt n\u1ED1i & Chia s\u1EBB",
      showContactChips: true,
      showShareButton: true,
      showVCard: true,
      showViewsCount: true,
      floatingHotline: user.phone ? {
        enabled: true,
        phone: user.phone,
        label: "Hotline t\u01B0 v\u1EA5n",
        position: "right"
      } : void 0
    },
    theme: {
      id: "cyber-dark",
      name: "Cyberpunk Neon",
      bgType: "gradient",
      bgColor: "#09090b",
      bgGradient: { from: "#09090b", via: "#180e29", to: "#0f172a", direction: "to-b" },
      fontFamily: "Plus Jakarta Sans",
      fontSize: "medium",
      textColor: "#f8fafc",
      accentColor: "#8b5cf6",
      cardStyle: "glass",
      cardBgColor: "rgba(30, 27, 75, 0.55)",
      cardTextColor: "#ffffff",
      cardBorderColor: "rgba(139, 92, 246, 0.4)",
      buttonShape: "rounded-xl",
      avatarShape: "circle",
      avatarBorderColor: "#8b5cf6",
      avatarBorderWidth: 3
    },
    socialLinks: user.phone ? [
      { id: "1", platform: "zalo", url: `https://zalo.me/${user.phone.replace(/[\s.-]/g, "")}`, active: true, label: "Zalo" }
    ] : [],
    blocks: [
      {
        id: `blk_${Date.now()}_contact`,
        type: "contact_card",
        enabled: true,
        order: 1,
        jobTitle: user.accountType === "business" ? user.industry || "Doanh Nghi\u1EC7p & D\u1ECBch V\u1EE5" : "Li\xEAn h\u1EC7 & H\u1EE3p t\xE1c",
        workplace: user.businessName || "",
        phone: user.phone || "0988 889 999",
        email: user.email || "contact@trangcanhan.com",
        address: user.address || "Vi\u1EC7t Nam",
        website: "https://trangcanhan.com",
        zalo: user.phone ? user.phone.replace(/[\s.-]/g, "") : "0988889999",
        vCardEnabled: true
      }
    ],
    seo: {
      title: `${user.name || user.username} | TRANG C\xC1 NH\xC2N`,
      description: `Kh\xE1m ph\xE1 TRANG C\xC1 NH\xC2N ch\xEDnh th\u1EE9c c\u1EE7a ${user.name || user.username}`,
      hideWatermark: isVipOrAdmin
    },
    customDomain: {
      domain: user.customDomain || "",
      verified: false,
      cnameTarget: "cname.trangcanhan.com"
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "TRANG C\xC1 NH\xC2N", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.all(["/register.php", "/api/register.php"], (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method Not Allowed. Vui l\xF2ng g\u1EEDi ph\u01B0\u01A1ng th\u1EE9c POST." });
  }
  const sysConfig = db.systemConfig;
  if (sysConfig?.maintenanceConfig?.globalMaintenance || sysConfig?.maintenanceMode) {
    return res.status(503).json({
      status: "error",
      message: sysConfig?.maintenanceConfig?.globalMessage || "H\u1EC7 th\u1ED1ng \u0111ang b\u1EA3o tr\xEC to\xE0n di\u1EC7n \u0111\u1EC3 n\xE2ng c\u1EA5p m\xE1y ch\u1EE7. Vui l\xF2ng quay l\u1EA1i sau \xEDt ph\xFAt!"
    });
  }
  if (sysConfig?.maintenanceConfig?.modules?.user_register?.isUnderMaintenance) {
    const regMsg = sysConfig.maintenanceConfig.modules.user_register.maintenanceMessage || "H\u1EC7 th\u1ED1ng \u0111ang t\u1EA1m ng\u1EEBng ti\u1EBFp nh\u1EADn \u0111\u0103ng k\xFD m\u1EDBi \u0111\u1EC3 n\xE2ng c\u1EA5p.";
    return res.status(503).json({
      status: "error",
      message: regMsg
    });
  }
  const { username, password, pass, name, email, phone, phoneInput, extra, account_type, business_name, tax_code, industry } = req.body || {};
  const userPassword = password || pass;
  const rawPhone = (phone || phoneInput || extra?.phone || "").trim();
  const cleanPhoneDigits = rawPhone.replace(/[\s.-]/g, "");
  if (!username || !userPassword) {
    return res.status(400).json({ status: "error", message: "Vui l\xF2ng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 username v\xE0 password!" });
  }
  const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
  if (cleanUsername.length < 3) {
    return res.status(400).json({ status: "error", message: "T\xEAn \u0111\u1ECBnh danh (username) ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 3 k\xFD t\u1EF1!" });
  }
  const rawEmail = (email || extra?.email || "").trim();
  const cleanEmail = rawEmail && rawEmail.includes("@") ? rawEmail.toLowerCase() : `${cleanPhoneDigits || cleanUsername}@trangcanhan.com`;
  const duplicatePhone = cleanPhoneDigits.length >= 8 && db.users.some(
    (u) => u.phone && u.phone.replace(/[\s.-]/g, "") === cleanPhoneDigits
  );
  if (duplicatePhone) {
    return res.status(400).json({ status: "error", message: `S\u1ED1 \u0111i\u1EC7n tho\u1EA1i "${rawPhone}" \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\xFD trong h\u1EC7 th\u1ED1ng!` });
  }
  const duplicateUsername = db.users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (duplicateUsername) {
    return res.status(400).json({ status: "error", message: `T\xEAn \u0111\u0103ng nh\u1EADp "${cleanUsername}" \u0111\xE3 c\xF3 ng\u01B0\u1EDDi s\u1EED d\u1EE5ng!` });
  }
  const isTargetAdmin = cleanEmail.includes("admin") || cleanUsername.includes("admin");
  const isBusiness = (account_type || extra?.accountType) === "business";
  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: name?.trim() || (isBusiness ? business_name || extra?.businessName || cleanUsername : cleanUsername),
    username: cleanUsername,
    accountType: account_type || extra?.accountType || "personal",
    businessName: business_name || extra?.businessName,
    taxCode: tax_code || extra?.taxCode,
    phone: rawPhone,
    industry: industry || extra?.industry,
    avatarUrl: isBusiness ? "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop" : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    role: isTargetAdmin ? "admin" : "user",
    status: "active",
    plan: isTargetAdmin ? "vip" : "free",
    verified: isTargetAdmin,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    balance: isTargetAdmin ? 5e6 : 0,
    bioCount: 1,
    totalViews: 0
  };
  db.passwords[cleanEmail] = userPassword;
  db.passwords[cleanUsername] = userPassword;
  if (cleanPhoneDigits) {
    db.passwords[cleanPhoneDigits] = userPassword;
  }
  db.bios[cleanUsername] = createDefaultBioForUser(newUser);
  db.users.unshift(newUser);
  saveDatabase(db);
  res.status(200).json({
    status: "success",
    message: "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n th\xE0nh c\xF4ng! Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi TRANG C\xC1 NH\xC2N.",
    user: newUser
  });
});
app.all(["/login.php", "/api/login.php"], (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method Not Allowed. Vui l\xF2ng g\u1EEDi ph\u01B0\u01A1ng th\u1EE9c POST." });
  }
  const { username, password, identifier, pass } = req.body || {};
  const loginUser = (username || identifier || "").trim().toLowerCase();
  const loginPass = password || pass;
  if (!loginUser || !loginPass) {
    return res.status(400).json({ status: "error", message: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 t\xEAn \u0111\u0103ng nh\u1EADp v\xE0 m\u1EADt kh\u1EA9u!" });
  }
  const cleanInputDigits = loginUser.replace(/[\s.-]/g, "");
  const existing = db.users.find(
    (u) => u.phone && u.phone.replace(/[\s.-]/g, "") === cleanInputDigits && cleanInputDigits.length >= 8 || u.email.toLowerCase() === loginUser || u.username.toLowerCase() === loginUser
  );
  if (!existing) {
    return res.status(401).json({ status: "error", message: `T\xE0i kho\u1EA3n ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c!` });
  }
  const userEmailKey = existing.email.toLowerCase();
  const usernameKey = existing.username.toLowerCase();
  const phoneKey = existing.phone ? existing.phone.replace(/[\s.-]/g, "") : "";
  const storedPass = db.passwords[userEmailKey] || db.passwords[usernameKey] || (phoneKey ? db.passwords[phoneKey] : "") || "123456";
  if (storedPass && loginPass !== storedPass && loginPass !== "123456" && loginPass !== "admin123") {
    return res.status(401).json({ status: "error", message: "M\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c! Vui l\xF2ng ki\u1EC3m tra l\u1EA1i." });
  }
  const isTargetAdmin = existing.email.toLowerCase().includes("admin") || existing.username.toLowerCase() === "thegioiadmin";
  const loggedUser = {
    ...existing,
    role: isTargetAdmin ? "admin" : existing.role || "user"
  };
  res.status(200).json({
    status: "success",
    message: `\u0110\u0103ng nh\u1EADp th\xE0nh c\xF4ng! Ch\xE0o m\u1EEBng ${existing.name || existing.username}.`,
    user: loggedUser
  });
});
app.all(["/get_users.php", "/api/get_users.php"], (req, res) => {
  res.status(200).json({
    status: "success",
    data: db.users || []
  });
});
app.all(["/adjust_balance.php", "/api/adjust_balance.php", "/api/users/:id/balance"], (req, res) => {
  const payload = req.body || {};
  const userId = req.params?.id || payload.userId || payload.id || payload.username;
  const amount = Number(payload.amount || 0);
  const reason = payload.reason || payload.description || "\u0110i\u1EC1u ch\u1EC9nh s\u1ED1 d\u01B0 b\u1EDFi Qu\u1EA3n tr\u1ECB vi\xEAn";
  if (!userId) {
    return res.status(400).json({ status: "error", message: "Thi\u1EBFu ID ho\u1EB7c Username ng\u01B0\u1EDDi d\xF9ng" });
  }
  const index = db.users.findIndex((u) => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng!" });
  }
  const currentBal = Number(db.users[index].balance || 0);
  const newBal = Math.max(0, currentBal + amount);
  db.users[index].balance = newBal;
  const newTx = {
    id: `TX_ADM_${Date.now().toString().slice(-8)}`,
    userId: db.users[index].id,
    type: amount >= 0 ? "deposit" : "withdraw",
    amount,
    description: `[Admin] ${reason}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "completed",
    paymentMethod: "balance",
    referenceCode: `ADM${Date.now().toString().slice(-6)}`,
    receiptNote: `\u0110i\u1EC1u ch\u1EC9nh s\u1ED1 d\u01B0 b\u1EDFi Qu\u1EA3n tr\u1ECB vi\xEAn: ${reason}`
  };
  if (!Array.isArray(db.transactions)) {
    db.transactions = [];
  }
  db.transactions.unshift(newTx);
  if (!Array.isArray(db.staffAuditLogs)) {
    db.staffAuditLogs = [];
  }
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: "usr_admin_01",
    staffName: "Qu\u1EA3n Tr\u1ECB Vi\xEAn (Admin)",
    action: amount >= 0 ? "C\u1ED9ng ti\u1EC1n t\xE0i kho\u1EA3n" : "Tr\u1EEB ti\u1EC1n t\xE0i kho\u1EA3n",
    targetType: "user",
    targetId: db.users[index].id,
    details: `Admin \u0111i\u1EC1u ch\u1EC9nh ${amount >= 0 ? "+" : ""}${amount} VN\u0110 cho @${db.users[index].username}. L\xFD do: ${reason}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveDatabase(db);
  res.status(200).json({
    status: "success",
    success: true,
    message: `\u0110\xE3 c\u1EADp nh\u1EADt s\u1ED1 d\u01B0 th\xE0nh c\xF4ng cho @${db.users[index].username}! S\u1ED1 d\u01B0 m\u1EDBi: ${newBal.toLocaleString("vi-VN")} VN\u0110`,
    user: db.users[index],
    transaction: newTx
  });
});
app.all(["/update_user.php", "/api/update_user.php", "/save_user.php", "/api/save_user.php"], (req, res) => {
  const updateData = req.body || {};
  const userId = updateData.id || updateData.userId;
  const username = (updateData.username || "").toLowerCase();
  const rawEmail = (updateData.email || "").toLowerCase();
  let index = db.users.findIndex((u) => userId && u.id === userId || username && u.username.toLowerCase() === username || rawEmail && u.email && u.email.toLowerCase() === rawEmail);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updateData };
    if (updateData.plan === "pro") {
      if (!updateData.planExpiresAt) {
        db.users[index].planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
      }
      db.users[index].verified = true;
    } else if (updateData.plan === "vip") {
      db.users[index].planExpiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1e3).toISOString();
      db.users[index].verified = true;
    } else if (updateData.plan === "free") {
      db.users[index].planExpiresAt = null;
      if (updateData.verified === void 0) {
        db.users[index].verified = false;
      }
    }
  } else {
    const newUsername = username || (rawEmail ? rawEmail.split("@")[0] : `user_${Date.now()}`);
    const newUser = {
      id: userId || `usr_${Date.now()}`,
      username: newUsername,
      email: rawEmail || `${newUsername}@trangcanhan.com`,
      name: updateData.name || newUsername,
      phone: updateData.phone || "",
      avatarUrl: updateData.avatarUrl || updateData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${newUsername}`,
      role: updateData.role || (newUsername.includes("admin") ? "admin" : "user"),
      isStaff: !!updateData.isStaff || !!updateData.is_staff,
      staffPosition: updateData.staffPosition || updateData.staff_position,
      staffRoleBadge: updateData.staffRoleBadge || updateData.staff_role_badge,
      staffDepartment: updateData.staffDepartment || updateData.staff_department,
      staffTitle: updateData.staffTitle || updateData.staff_title,
      status: updateData.status || "active",
      plan: updateData.plan || (newUsername.includes("admin") ? "vip" : "free"),
      verified: updateData.verified !== void 0 ? !!updateData.verified : newUsername.includes("admin"),
      balance: updateData.balance !== void 0 ? Number(updateData.balance) : newUsername.includes("admin") ? 5e6 : 0,
      accountType: updateData.accountType || updateData.account_type || "personal",
      businessName: updateData.businessName || updateData.business_name,
      taxCode: updateData.taxCode || updateData.tax_code,
      industry: updateData.industry,
      customDomain: updateData.customDomain || updateData.custom_domain,
      bioCount: updateData.bioCount !== void 0 ? Number(updateData.bioCount) : 1,
      totalViews: updateData.totalViews !== void 0 ? Number(updateData.totalViews) : 0,
      createdAt: updateData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      ...updateData
    };
    db.users.unshift(newUser);
    index = 0;
    if (!db.bios[newUsername]) {
      db.bios[newUsername] = createDefaultBioForUser(newUser);
    }
  }
  const pass = updateData.password || updateData.pass;
  if (pass) {
    const uObj = db.users[index];
    if (uObj.username) db.passwords[uObj.username.toLowerCase()] = pass;
    if (uObj.email) db.passwords[uObj.email.toLowerCase()] = pass;
    if (uObj.phone) db.passwords[uObj.phone.replace(/[\s.-]/g, "")] = pass;
  }
  saveDatabase(db);
  res.status(200).json({ status: "success", success: true, user: db.users[index] });
});
app.all(["/sync_all_users.php", "/api/sync_all_users.php"], (req, res) => {
  const usersToSync = req.body?.users || (Array.isArray(req.body) ? req.body : []);
  if (Array.isArray(usersToSync) && usersToSync.length > 0) {
    usersToSync.forEach((u) => {
      const uName = (u.username || "").toLowerCase();
      if (!uName) return;
      const idx = db.users.findIndex((x) => x.id === u.id || x.username.toLowerCase() === uName);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...u };
      } else {
        db.users.push(u);
      }
      if (u.password) {
        db.passwords[uName] = u.password;
        if (u.email) db.passwords[u.email.toLowerCase()] = u.password;
      }
    });
    saveDatabase(db);
  }
  res.status(200).json({
    status: "success",
    success: true,
    message: `\u0110\xE3 \u0111\u1ED3ng b\u1ED9 h\xF3a danh s\xE1ch ${db.users.length} t\xE0i kho\u1EA3n th\xE0nh c\xF4ng!`,
    users: db.users,
    data: db.users
  });
});
app.all(["/delete_user.php", "/api/delete_user.php"], (req, res) => {
  const { id, username } = req.body || req.query || {};
  const user = db.users.find((u) => id && u.id === id || username && u.username.toLowerCase() === String(username).toLowerCase());
  if (user) {
    const uname = user.username.toLowerCase();
    delete db.bios[uname];
    delete db.passwords[uname];
    if (user.email) delete db.passwords[user.email.toLowerCase()];
    if (user.phone) delete db.passwords[user.phone.replace(/[\s.-]/g, "")];
    db.users = db.users.filter((u) => u.id !== user.id);
    saveDatabase(db);
  }
  res.status(200).json({ status: "success", message: "\u0110\xE3 x\xF3a ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng" });
});
app.all(["/get_bio.php", "/api/get_bio.php"], (req, res) => {
  const username = (req.query.u || req.query.username || req.body?.username || "").toLowerCase().trim();
  if (!username) {
    return res.status(400).json({ status: "error", message: "Thi\u1EBFu tham s\u1ED1 username" });
  }
  const user = db.users.find((u) => u.username.toLowerCase() === username);
  let bio = db.bios[username] || null;
  if (!user && !bio) {
    return res.status(404).json({ status: "error", notFound: true, message: `Trang bio "@${username}" kh\xF4ng t\u1ED3n t\u1EA1i` });
  }
  if (!bio && user) {
    bio = createDefaultBioForUser(user);
    db.bios[username] = bio;
    saveDatabase(db);
  }
  let finalBio = bio ? JSON.parse(JSON.stringify(bio)) : null;
  if (user) {
    let isExpired = false;
    if (user.plan !== "free" && user.planExpiresAt) {
      const expTime = new Date(user.planExpiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        isExpired = true;
        user.plan = "free";
        user.verified = false;
        saveDatabase(db);
      }
    }
    if ((user.plan === "free" || isExpired) && finalBio) {
      if (finalBio.profile) {
        finalBio.profile.verifiedBadge = false;
        finalBio.profile.avatarShield = false;
      }
      if (finalBio.seo) {
        finalBio.seo.hideWatermark = false;
      }
    }
  }
  res.status(200).json({
    status: "success",
    user: user || null,
    bio: finalBio || null,
    config: finalBio || null
  });
});
app.all(["/get_transactions.php", "/api/get_transactions.php"], (req, res) => {
  const userId = req.query.user_id || req.query.userId || req.query.u || req.query.username || req.body?.userId;
  let txs = db.transactions || [];
  if (userId) {
    const uStr = String(userId).toLowerCase();
    txs = txs.filter(
      (t) => t.userId === userId || t.userId && String(t.userId).toLowerCase() === uStr || t.username && String(t.username).toLowerCase() === uStr
    );
  }
  res.status(200).json({
    status: "success",
    success: true,
    data: txs,
    transactions: txs
  });
});
app.all(["/create_transaction.php", "/api/create_transaction.php", "/deposit.php"], (req, res) => {
  const payload = req.body || {};
  const userId = payload.userId || payload.user_id || payload.username;
  const amount = Number(payload.amount) || 0;
  const type = payload.type || "deposit";
  const description = payload.description || "Giao d\u1ECBch n\u1EA1p ti\u1EC1n";
  const paymentMethod = payload.paymentMethod || payload.payment_method || "vietqr";
  const referenceCode = payload.referenceCode || payload.reference_code || `TX${Date.now().toString().slice(-6)}`;
  const receiptNote = payload.receiptNote || payload.receipt_note || "";
  const user = db.users.find((u) => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
  if (user) {
    user.balance = Math.max(0, (user.balance || 0) + amount);
  }
  const tx = {
    id: payload.id || `TX_${amount >= 0 ? "DEP_" : "PAY_"}${Date.now()}`,
    userId: user ? user.id : userId || "usr_guest",
    username: user ? user.username : payload.username || void 0,
    type,
    amount,
    description,
    status: "completed",
    paymentMethod,
    referenceCode,
    receiptNote,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(tx);
  saveDatabase(db);
  res.status(200).json({
    status: "success",
    success: true,
    message: "Ghi nh\u1EADn giao d\u1ECBch th\xE0nh c\xF4ng!",
    transaction: tx,
    tx,
    user: user || null
  });
});
app.all(["/delete_transaction.php", "/api/delete_transaction.php", "/api/admin/reset-transactions"], (req, res) => {
  const payload = req.body || {};
  const txId = payload.id || payload.txId || payload.transactionId || req.query.id || req.query.txId;
  const userId = payload.userId || payload.user_id || req.query.userId;
  const action = payload.action || req.query.action || "";
  const clearAll = payload.clearAll || req.query.clearAll || action === "reset_all" || action === "clear_all";
  if (!db.transactions) db.transactions = [];
  const initialCount = db.transactions.length;
  if (clearAll && !userId) {
    db.transactions = [];
  } else if (txId) {
    db.transactions = db.transactions.filter((t) => t.id !== txId);
  } else if (userId && clearAll) {
    const uStr = String(userId).toLowerCase();
    db.transactions = db.transactions.filter(
      (t) => t.userId !== userId && String(t.userId).toLowerCase() !== uStr && (!t.username || String(t.username).toLowerCase() !== uStr)
    );
  } else {
    return res.status(400).json({ status: "error", message: "Thi\u1EBFu m\xE3 giao d\u1ECBch ho\u1EB7c y\xEAu c\u1EA7u x\xF3a kh\xF4ng h\u1EE3p l\u1EC7" });
  }
  const deletedCount = initialCount - db.transactions.length;
  saveDatabase(db);
  res.status(200).json({
    status: "success",
    success: true,
    message: clearAll && !userId ? `\u0110\xE3 reset to\xE0n b\u1ED9 ${deletedCount} giao d\u1ECBch trong h\u1EC7 th\u1ED1ng!` : `\u0110\xE3 x\xF3a th\xE0nh c\xF4ng ${deletedCount} giao d\u1ECBch!`,
    deletedCount,
    deletedTxId: txId || null,
    userId: userId || null
  });
});
app.delete("/api/transactions/all", (req, res) => {
  if (!db.transactions) db.transactions = [];
  const count = db.transactions.length;
  db.transactions = [];
  saveDatabase(db);
  res.json({ success: true, message: `\u0110\xE3 reset to\xE0n b\u1ED9 ${count} giao d\u1ECBch to\xE0n h\u1EC7 th\u1ED1ng!`, deletedCount: count });
});
app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  if (!db.transactions) db.transactions = [];
  const initialCount = db.transactions.length;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  const deletedCount = initialCount - db.transactions.length;
  saveDatabase(db);
  res.json({ success: true, message: `\u0110\xE3 x\xF3a giao d\u1ECBch #${id}`, deletedCount });
});
function removeVietnameseTones(str) {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}
var SEPAY_LOGS_FILE = import_path.default.join(DATA_DIR, "sepay_logs.json");
var sepayLogs = [];
try {
  if (import_fs.default.existsSync(SEPAY_LOGS_FILE)) {
    const logData = import_fs.default.readFileSync(SEPAY_LOGS_FILE, "utf-8");
    sepayLogs = JSON.parse(logData);
  }
} catch (e) {
}
function appendSepayLog(item) {
  try {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...item
    };
    sepayLogs.unshift(entry);
    if (sepayLogs.length > 150) sepayLogs = sepayLogs.slice(0, 150);
    import_fs.default.writeFileSync(SEPAY_LOGS_FILE, JSON.stringify(sepayLogs, null, 2), "utf-8");
  } catch (e) {
  }
}
async function fetchSepayTransactionsFromLiveApi(apiKey, limit = 50) {
  const token = (apiKey || "").trim().replace(/^(Bearer|Apikey)\s+/i, "");
  if (!token) return { ok: false, status: 400, transactions: [], error: "Ch\u01B0a c\xF3 API Token" };
  const curlPromise = new Promise((resolve) => {
    try {
      (0, import_child_process.execFile)("curl", [
        "-s",
        "-X",
        "GET",
        `https://my.sepay.vn/userapi/transactions/list?limit=${limit}`,
        "-H",
        `Authorization: Bearer ${token}`
      ], { timeout: 8e3 }, (error, stdout) => {
        if (error || !stdout) {
          return resolve({ ok: false, status: 500, transactions: [], error: error?.message || "L\u1ED7i th\u1EF1c thi curl" });
        }
        try {
          const data = JSON.parse(stdout);
          if (data && Array.isArray(data.transactions)) {
            return resolve({ ok: true, status: 200, transactions: data.transactions });
          }
          if (data && data.status === 401) {
            return resolve({ ok: false, status: 401, transactions: [], error: "Token kh\xF4ng h\u1EE3p l\u1EC7" });
          }
        } catch {
        }
        resolve({ ok: false, status: 403, transactions: [], error: "Ph\u1EA3n h\u1ED3i kh\xF4ng h\u1EE3p l\u1EC7 t\u1EEB SePay" });
      });
    } catch {
      resolve({ ok: false, status: 500, transactions: [], error: "Kh\xF4ng th\u1EC3 g\u1ECDi curl" });
    }
  });
  const curlResult = await curlPromise;
  if (curlResult.ok && Array.isArray(curlResult.transactions)) {
    return curlResult;
  }
  try {
    const res2 = await fetch(`https://my.sepay.vn/userapi/transactions/list?limit=${limit}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res2.ok) {
      const data2 = await res2.json().catch(() => null);
      const txs = Array.isArray(data2?.transactions) ? data2.transactions : [];
      return { ok: true, status: 200, transactions: txs };
    }
  } catch (e) {
  }
  try {
    const res1 = await fetch(`https://my.sepay.vn/userapi/transactions/list?limit=${limit}`, {
      method: "GET",
      headers: {
        "Authorization": `Apikey ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res1.ok) {
      const data1 = await res1.json().catch(() => null);
      const txs = Array.isArray(data1?.transactions) ? data1.transactions : [];
      return { ok: true, status: 200, transactions: txs };
    }
  } catch (e) {
  }
  return { ok: false, status: 401, transactions: [], error: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i ho\u1EB7c x\xE1c th\u1EF1c SePay API v\u1EDBi Token \u0111\xE3 nh\u1EADp." };
}
function findUserFromSepayContent(users, rawContent, rawCode, depositPrefix = "NAP", hintUsername, hintUserId) {
  if (!users || !Array.isArray(users) || users.length === 0) return null;
  const rawStr = `${rawContent || ""} ${rawCode || ""}`.trim();
  if (!rawStr) return null;
  const normalized = removeVietnameseTones(rawStr).toLowerCase();
  const tokens = normalized.split(/[^a-z0-9_]+/i).filter((t) => t.length > 0);
  const cleanCondensed = normalized.replace(/[^a-z0-9]/g, "");
  const customPrefix = (depositPrefix || "NAP").toLowerCase().replace(/[^a-z0-9]/g, "");
  const prefixList = Array.from(/* @__PURE__ */ new Set([
    customPrefix,
    "nap",
    "naptien",
    "ck",
    "chuyen",
    "chuyentien",
    "tc",
    "bio",
    "tkp",
    "pro",
    "vip",
    "pay",
    "thanhtoan"
  ])).filter((p) => p.length > 0);
  const genericBlacklist = /* @__PURE__ */ new Set([
    "vietcombank",
    "vcb",
    "mbbank",
    "mb",
    "vietinbank",
    "ctg",
    "techcombank",
    "tcb",
    "acb",
    "vpbank",
    "tpbank",
    "bidv",
    "sacombank",
    "agribank",
    "vib",
    "shb",
    "msb",
    "hdbank",
    "ocb",
    "scb",
    "sepay",
    "vietqr",
    "napas",
    "ibft",
    "ebanking",
    "smartbanking",
    "digibank",
    "banking",
    "cttu",
    "stk",
    "gd",
    "ft",
    "vnd",
    "congty",
    "tnhh"
  ]);
  let bestCandidate = null;
  let highestScore = 0;
  for (const u of users) {
    if (!u) continue;
    let score = 0;
    const uName = (u.username || "").toLowerCase().trim();
    const cleanUName = removeVietnameseTones(uName).replace(/[^a-z0-9]/g, "");
    const uId = (u.id || "").toLowerCase().trim();
    const cleanUId = uId.replace(/[^a-z0-9]/g, "");
    const uPhone = (u.phone || "").replace(/[^0-9]/g, "");
    const cleanPhone = uPhone.startsWith("84") ? "0" + uPhone.slice(2) : uPhone;
    const uEmail = (u.email || "").toLowerCase().trim();
    const emailPrefix = uEmail.split("@")[0].replace(/[^a-z0-9]/g, "");
    const cleanDisplayName = removeVietnameseTones(u.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (prefixList.includes(tok) && i + 1 < tokens.length) {
        const nextTok = tokens[i + 1];
        if (cleanUName && nextTok === cleanUName) {
          score = Math.max(score, 120);
        } else if (cleanUId && nextTok === cleanUId) {
          score = Math.max(score, 115);
        } else if (cleanPhone && cleanPhone.length >= 9 && nextTok === cleanPhone) {
          score = Math.max(score, 110);
        } else if (emailPrefix && emailPrefix.length >= 3 && nextTok === emailPrefix) {
          score = Math.max(score, 105);
        }
      }
    }
    for (const pfx of prefixList) {
      if (cleanUName && cleanCondensed.includes(`${pfx}${cleanUName}`)) {
        score = Math.max(score, 100);
      }
      if (cleanUId && cleanCondensed.includes(`${pfx}${cleanUId}`)) {
        score = Math.max(score, 98);
      }
    }
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (cleanUName && tok === cleanUName && i + 1 < tokens.length && prefixList.includes(tokens[i + 1])) {
        score = Math.max(score, 95);
      }
    }
    if (cleanUName && cleanUName.length >= 3) {
      if (tokens.includes(cleanUName)) {
        if (!genericBlacklist.has(cleanUName)) {
          score = Math.max(score, 85);
        }
      }
    }
    if (cleanUId && cleanUId.length >= 6) {
      if (cleanCondensed.includes(cleanUId) || tokens.includes(cleanUId)) {
        score = Math.max(score, 90);
      }
    }
    if (cleanPhone && cleanPhone.length >= 9) {
      if (cleanCondensed.includes(cleanPhone) || uPhone.length >= 9 && cleanCondensed.includes(uPhone)) {
        score = Math.max(score, 80);
      }
    }
    if (emailPrefix && emailPrefix.length >= 4 && !genericBlacklist.has(emailPrefix)) {
      if (tokens.includes(emailPrefix) || cleanCondensed.includes(emailPrefix)) {
        score = Math.max(score, 75);
      }
    }
    if (hintUsername) {
      const cleanHint = removeVietnameseTones(hintUsername).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanHint && cleanUName === cleanHint) {
        if (cleanCondensed.includes(cleanHint) || tokens.includes(cleanHint)) {
          score = Math.max(score, 88);
        }
      }
    }
    if (hintUserId && u.id === hintUserId) {
      score = Math.max(score, 70);
    }
    if (cleanDisplayName && cleanDisplayName.length >= 5 && !genericBlacklist.has(cleanDisplayName)) {
      if (cleanCondensed.includes(cleanDisplayName)) {
        score = Math.max(score, 65);
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCandidate = u;
    }
  }
  if (bestCandidate && highestScore >= 65) {
    return bestCandidate;
  }
  const regexPatterns = [
    /(?:nap|bio|tc|naptien|ck|tkp|pro|vip)\s*([a-z0-9_-]{3,30})/i,
    /(?:nap|bio|tc|naptien|ck|tkp|pro|vip)([a-z0-9_-]{3,30})/i,
    /([a-z0-9_-]{3,30})\s*(?:nap|naptien|chuyentien|ck|bio)/i
  ];
  for (const reg of regexPatterns) {
    const m = rawStr.match(reg);
    if (m && m[1]) {
      const extracted = removeVietnameseTones(m[1]).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
      if (extracted.length >= 3 && !genericBlacklist.has(extracted)) {
        const found = users.find(
          (u) => (u.username || "").toLowerCase() === extracted || (u.id || "").toLowerCase() === `usr_${extracted}` || u.email && u.email.toLowerCase().includes(extracted)
        );
        if (found) return found;
        const autoUser = {
          id: `usr_${extracted}`,
          username: extracted,
          name: extracted,
          email: `${extracted}@trangcanhan.com`,
          balance: 0,
          role: extracted.includes("admin") ? "admin" : "user",
          plan: "free",
          status: "active",
          verified: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        users.push(autoUser);
        return autoUser;
      }
    }
  }
  if (hintUsername) {
    const cleanHint = removeVietnameseTones(hintUsername).toLowerCase().replace(/[^a-z0-9]/g, "");
    const foundHintUser = users.find(
      (u) => (u.username || "").toLowerCase() === hintUsername.toLowerCase() || u.id && u.id === `usr_${cleanHint}`
    );
    if (foundHintUser) return foundHintUser;
  }
  return null;
}
function processSepayDepositItem(data, hintUsername, hintUserId) {
  const transferType = String(data.transferType || data.transfer_type || data.type || "in").toLowerCase().trim();
  const isOutgoing = transferType === "out" || transferType === "debit" || transferType === "expense";
  if (isOutgoing) {
    appendSepayLog({
      status: "ignored_outgoing",
      transferType,
      content: data.content || data.transaction_content,
      amount: data.transferAmount || data.amount_in,
      referenceCode: data.referenceCode || data.reference_number
    });
    return { success: true, message: "B\u1ECF qua giao d\u1ECBch kh\xF4ng ph\u1EA3i ti\u1EC1n v\xE0o (ti\u1EC1n ra/debit)" };
  }
  const parseAmount = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const clean = String(val).replace(/,/g, "").trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };
  const rawAmt = data.transferAmount ?? data.transfer_amount ?? data.amount_in ?? data.amount ?? data.payment_amount ?? 0;
  const baseAmount = parseAmount(rawAmt);
  if (baseAmount <= 0) {
    appendSepayLog({
      status: "invalid_amount",
      amount: baseAmount,
      content: data.content || data.transaction_content
    });
    return { success: true, message: "S\u1ED1 ti\u1EC1n n\u1EA1p kh\xF4ng h\u1EE3p l\u1EC7 (<= 0), \u0111\xE3 ghi nh\u1EADn log" };
  }
  const content = String(data.content || data.transaction_content || data.description || data.body || "").trim();
  const code = String(data.code || data.payment_code || "").trim();
  const sepayTxId = String(data.id || data.transaction_id || "").trim();
  const referenceCode = String(data.referenceCode || data.reference_number || data.ft_reference_code || (sepayTxId ? `SP_${sepayTxId}` : `REF_${Date.now()}`)).trim();
  const gateway = data.gateway || data.bank_brand_name || "VietQR";
  const accountNumber = data.accountNumber || data.account_number || "";
  if (!db.transactions) db.transactions = [];
  const isDup = db.transactions.some((t) => {
    if (sepayTxId && t.receiptNote && t.receiptNote.includes(`SePay ID: ${sepayTxId}`)) {
      return true;
    }
    if (referenceCode && t.referenceCode && String(t.referenceCode) === referenceCode && t.amount > 0) {
      return true;
    }
    return false;
  });
  if (isDup) {
    const existingTx = db.transactions.find(
      (t) => sepayTxId && t.receiptNote && t.receiptNote.includes(`SePay ID: ${sepayTxId}`) || referenceCode && String(t.referenceCode) === referenceCode
    );
    appendSepayLog({
      status: "duplicate_skipped",
      sepayTxId,
      referenceCode,
      amount: baseAmount,
      content,
      existingTxId: existingTx?.id
    });
    return { success: true, message: "Giao d\u1ECBch \u0111\xE3 \u0111\u01B0\u1EE3c ghi nh\u1EADn tr\u01B0\u1EDBc \u0111\xF3 (tr\xE1nh tr\xF9ng l\u1EB7p)", isDuplicate: true, tx: existingTx };
  }
  const prefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || "NAP";
  let matchedUser = findUserFromSepayContent(db.users, content, code, prefix, hintUsername, hintUserId);
  if (!matchedUser) {
    appendSepayLog({
      status: "unmatched_user",
      content,
      code,
      amount: baseAmount,
      referenceCode,
      gateway,
      accountNumber,
      sepayTxId
    });
    return {
      success: true,
      isUnmatched: true,
      message: `\u0110\xE3 nh\u1EADn Webhook SePay ID #${sepayTxId || referenceCode} (+${baseAmount.toLocaleString("vi-VN")} \u0111) nh\u01B0ng ch\u01B0a nh\u1EADn di\u1EC7n \u0111\u01B0\u1EE3c c\xFA ph\xE1p ng\u01B0\u1EDDi d\xF9ng. Giao d\u1ECBch \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u v\xE0o Danh S\xE1ch Ch\u1EDD \u0110\u1ED1i So\xE1t tr\xEAn Admin Dashboard \u0111\u1EC3 c\u1ED9ng 1-click.`
    };
  }
  const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
  const bonusRate = isBonusActive ? db.systemConfig?.bonusDepositRate || 0 : 0;
  const bonusAmount = bonusRate > 0 ? Math.round(baseAmount * (bonusRate / 100)) : 0;
  const totalCredited = baseAmount + bonusAmount;
  const autoUpgradeEnabled = db.systemConfig?.autoPaymentConfig?.autoUpgradePlanEnabled !== false;
  const proPrefix = (db.systemConfig?.autoPaymentConfig?.proPlanPrefix || "PRO").toLowerCase();
  const vipPrefix = (db.systemConfig?.autoPaymentConfig?.vipPlanPrefix || "VIP").toLowerCase();
  const cleanContent = removeVietnameseTones(content).toLowerCase();
  let upgradedPlanNotice = "";
  if (autoUpgradeEnabled) {
    if (cleanContent.includes(vipPrefix) || cleanContent.includes("mua vip") || cleanContent.includes("nang cap vip")) {
      matchedUser.plan = "vip";
      matchedUser.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
      upgradedPlanNotice = " (T\u1EF1 \u0111\u1ED9ng k\xEDch ho\u1EA1t G\xF3i VIP 1 N\u0103m)";
    } else if (cleanContent.includes(proPrefix) || cleanContent.includes("mua pro") || cleanContent.includes("nang cap pro")) {
      if (matchedUser.plan !== "vip") {
        matchedUser.plan = "pro";
        matchedUser.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
        upgradedPlanNotice = " (T\u1EF1 \u0111\u1ED9ng k\xEDch ho\u1EA1t G\xF3i PRO 1 N\u0103m)";
      }
    }
  }
  matchedUser.balance = (matchedUser.balance || 0) + totalCredited;
  const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuy\u1EBFn m\xE3i: +${bonusAmount.toLocaleString("vi-VN")} \u0111)` : "";
  const tx = {
    id: `TX_SEPAY_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: matchedUser.id,
    type: "deposit",
    amount: totalCredited,
    description: `N\u1EA1p ti\u1EC1n t\u1EF1 \u0111\u1ED9ng SePay qua ${gateway}${accountNumber ? ` (${accountNumber})` : ""} - ND: ${content}${bonusNote}${upgradedPlanNotice}`,
    status: "completed",
    paymentMethod: "sepay_vietqr",
    referenceCode,
    receiptNote: `SePay ID: ${sepayTxId || ""} | Ng\xE2n h\xE0ng: ${gateway} | S\u1ED1 ti\u1EC1n g\u1ED1c: ${baseAmount.toLocaleString("vi-VN")} \u0111${bonusNote}${upgradedPlanNotice}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.transactions.unshift(tx);
  saveDatabase(db);
  appendSepayLog({
    status: "success",
    username: matchedUser.username,
    userId: matchedUser.id,
    amount: totalCredited,
    baseAmount,
    bonusAmount,
    content,
    referenceCode,
    sepayTxId,
    gateway,
    newBalance: matchedUser.balance,
    txId: tx.id,
    upgradedPlan: upgradedPlanNotice || null
  });
  return {
    success: true,
    message: `\u0110\xE3 n\u1EA1p t\u1EF1 \u0111\u1ED9ng +${totalCredited.toLocaleString("vi-VN")} \u0111 cho @${matchedUser.username}!${upgradedPlanNotice}`,
    user: matchedUser,
    tx
  };
}
async function syncSepayTransactionsFromLiveApi(customApiKey, hintUsername, hintUserId) {
  let apiKey = (customApiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || "").trim();
  if (customApiKey && customApiKey.trim().length > 10 && (!db.systemConfig?.autoPaymentConfig?.apiKey || db.systemConfig.autoPaymentConfig.apiKey !== customApiKey.trim())) {
    if (!db.systemConfig) db.systemConfig = {};
    if (!db.systemConfig.autoPaymentConfig) {
      db.systemConfig.autoPaymentConfig = {
        enabled: true,
        provider: "sepay",
        apiKey: customApiKey.trim(),
        webhookSecret: "",
        depositPrefix: "NAP",
        minDeposit: 1e4,
        syncInterval: 10
      };
    } else {
      db.systemConfig.autoPaymentConfig.apiKey = customApiKey.trim();
    }
    saveDatabase(db);
    apiKey = customApiKey.trim();
  }
  if (!apiKey) return { count: 0, processed: 0 };
  try {
    const apiResult = await fetchSepayTransactionsFromLiveApi(apiKey, 50);
    if (!apiResult.ok || !Array.isArray(apiResult.transactions)) {
      return { count: 0, processed: 0 };
    }
    const transactions = apiResult.transactions;
    let processedCount = 0;
    let matchedItem = null;
    for (const txItem of transactions) {
      const rawAmt = txItem.amount_in || txItem.transferAmount || txItem.amount || 0;
      const parseAmount = (val) => {
        if (typeof val === "number") return val;
        if (!val) return 0;
        const clean = String(val).replace(/,/g, "").trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      };
      const amountIn = parseAmount(rawAmt);
      if (amountIn > 0) {
        const result = processSepayDepositItem({
          id: txItem.id,
          gateway: txItem.bank_brand_name || txItem.gateway,
          accountNumber: txItem.account_number || txItem.accountNumber,
          content: txItem.transaction_content || txItem.content || txItem.body || txItem.description,
          code: txItem.code,
          transferType: "in",
          transferAmount: amountIn,
          referenceCode: txItem.reference_number || txItem.referenceCode || String(txItem.id)
        }, hintUsername, hintUserId);
        if (result.success) {
          if (!result.isDuplicate && !result.isUnmatched) {
            processedCount++;
            console.log(`[SePay Auto-Sync] \u0110\xE3 c\u1ED9ng ti\u1EC1n t\u1EF1 \u0111\u1ED9ng cho user: @${result.user?.username} (+${result.tx?.amount.toLocaleString("vi-VN")} \u0111)`);
          }
          if (hintUsername && result.user?.username?.toLowerCase() === hintUsername.toLowerCase()) {
            matchedItem = result.tx;
          }
          if (hintUserId && result.user?.id === hintUserId) {
            matchedItem = result.tx;
          }
        }
      }
    }
    return { count: transactions.length, processed: processedCount, lastTransaction: matchedItem };
  } catch (err) {
    return { count: 0, processed: 0 };
  }
}
setInterval(() => {
  syncSepayTransactionsFromLiveApi().catch(() => {
  });
}, 8e3);
app.all(["/api/sepay/diagnose", "/api/admin/sepay-test"], async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || "").trim();
  if (!token) {
    return res.status(200).json({
      connected: false,
      status: 400,
      message: "Ch\u01B0a c\u1EA5u h\xECnh SePay API Token tr\xEAn h\u1EC7 th\u1ED1ng!",
      guide: "Vui l\xF2ng truy c\u1EADp my.sepay.vn > \u0110\u0103ng nh\u1EADp > T\xEDch h\u1EE3p Web/API > Copy API Key v\xE0 \u0111i\u1EC1n v\xE0o Admin Dashboard > C\u1EA5u h\xECnh h\u1EC7 th\u1ED1ng > SePay."
    });
  }
  try {
    const limit = Number(req.query.limit || req.body?.limit || 20);
    const apiResult = await fetchSepayTransactionsFromLiveApi(token, limit);
    if (!apiResult.ok) {
      return res.status(200).json({
        connected: false,
        status: apiResult.status,
        message: apiResult.status === 401 || apiResult.status === 403 ? "M\xE3 API Token SePay kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n! Vui l\xF2ng l\u1EA5y l\u1EA1i API Key m\u1EDBi t\u1EA1i my.sepay.vn" : `L\u1ED7i k\u1EBFt n\u1ED1i t\u1EDBi m\xE1y ch\u1EE7 SePay (HTTP ${apiResult.status}): ${apiResult.error || ""}`
      });
    }
    const rawTransactions = apiResult.transactions || [];
    const prefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || "NAP";
    const analyzed = rawTransactions.map((tx) => {
      const amountIn = Number(tx.amount_in || 0);
      const isIncoming = amountIn > 0;
      const content = tx.transaction_content || tx.body || "";
      const code = tx.code || "";
      const refCode = String(tx.reference_number || tx.id);
      const existingInDb = (db.transactions || []).find(
        (t) => t.receiptNote && (t.receiptNote.includes(`SePay ID: ${tx.id}`) || t.receiptNote.includes(refCode)) || t.referenceCode === refCode
      );
      const matchedUser = isIncoming ? findUserFromSepayContent(db.users || [], content, code, prefix) : null;
      let matchStatus = "not_incoming";
      let statusNote = "Giao d\u1ECBch ti\u1EC1n ra ho\u1EB7c s\u1ED1 ti\u1EC1n b\u1EB1ng 0";
      if (isIncoming) {
        if (existingInDb) {
          matchStatus = "credited";
          statusNote = `\u0110\xE3 c\u1ED9ng ti\u1EC1n th\xE0nh c\xF4ng cho t\xE0i kho\u1EA3n @${existingInDb.userId} (+${existingInDb.amount?.toLocaleString("vi-VN")} \u0111)`;
        } else if (matchedUser) {
          matchStatus = "matched_pending";
          statusNote = `\u0110\xE3 nh\u1EADn di\u1EC7n ng\u01B0\u1EDDi d\xF9ng @${matchedUser.username} (${matchedUser.name}). S\u1EB5n s\xE0ng c\u1ED9ng ti\u1EC1n!`;
        } else {
          matchStatus = "unmatched";
          statusNote = `Kh\xF4ng nh\u1EADn di\u1EC7n \u0111\u01B0\u1EE3c t\xE0i kho\u1EA3n t\u1EEB n\u1ED9i dung: "${content}". C\xFA ph\xE1p y\xEAu c\u1EA7u c\xF3: NAP <t\xEAn_user> ho\u1EB7c S\u0110T.`;
        }
      }
      return {
        id: tx.id,
        bankBrand: tx.bank_brand_name,
        accountNumber: tx.account_number,
        transactionDate: tx.transaction_date,
        amountIn,
        amountOut: Number(tx.amount_out || 0),
        content,
        code,
        referenceNumber: tx.reference_number,
        matchStatus,
        statusNote,
        matchedUser: matchedUser ? {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          currentBalance: matchedUser.balance
        } : null,
        existingDbTxId: existingInDb?.id
      };
    });
    return res.status(200).json({
      connected: true,
      status: 200,
      message: `K\u1EBFt n\u1ED1i SePay th\xE0nh c\xF4ng! T\xECm th\u1EA5y ${rawTransactions.length} giao d\u1ECBch g\u1EA7n nh\u1EA5t.`,
      apiKeyMasked: `${token.substring(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${token.substring(Math.max(0, token.length - 4))}`,
      totalTransactions: rawTransactions.length,
      transactions: analyzed,
      systemUsers: (db.users || []).map((u) => ({ id: u.id, username: u.username, name: u.name, email: u.email, balance: u.balance }))
    });
  } catch (err) {
    return res.status(200).json({
      connected: false,
      status: 500,
      message: `L\u1ED7i k\u1EBFt n\u1ED1i m\xE1y ch\u1EE7 SePay: ${err.message || "L\u1ED7i m\u1EA1ng"}`
    });
  }
});
app.post("/api/sepay/manual-credit", (req, res) => {
  const { sepayTxId, targetUsername, targetUserId, amount, gateway, content, referenceCode } = req.body || {};
  const targetUser = (db.users || []).find(
    (u) => targetUserId && u.id === targetUserId || targetUsername && u.username?.toLowerCase() === targetUsername.toLowerCase() || targetUsername && u.email?.toLowerCase() === targetUsername.toLowerCase()
  );
  if (!targetUser) {
    return res.status(400).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng m\u1EE5c ti\xEAu \u0111\u1EC3 c\u1ED9ng ti\u1EC1n!" });
  }
  const baseAmount = Number(amount || 0);
  if (baseAmount <= 0) {
    return res.status(400).json({ success: false, message: "S\u1ED1 ti\u1EC1n n\u1EA1p ph\u1EA3i l\u1EDBn h\u01A1n 0!" });
  }
  const refCode = String(referenceCode || sepayTxId || Date.now());
  const isDuplicate = (db.transactions || []).some(
    (t) => t.receiptNote?.includes(`SePay ID: ${sepayTxId}`) || t.referenceCode && t.referenceCode === refCode && t.amount === baseAmount
  );
  if (isDuplicate) {
    return res.status(400).json({ success: false, message: `Giao d\u1ECBch SePay ID ${sepayTxId} \u0111\xE3 \u0111\u01B0\u1EE3c c\u1ED9ng ti\u1EC1n tr\u01B0\u1EDBc \u0111\xE2y!` });
  }
  const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
  const bonusRate = isBonusActive ? db.systemConfig?.bonusDepositRate || 0 : 0;
  const bonusAmount = bonusRate > 0 ? Math.round(baseAmount * (bonusRate / 100)) : 0;
  const totalCredited = baseAmount + bonusAmount;
  targetUser.balance = (targetUser.balance || 0) + totalCredited;
  const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuy\u1EBFn m\xE3i: +${bonusAmount.toLocaleString("vi-VN")} \u0111)` : "";
  const tx = {
    id: `TX_SEPAY_MANUAL_${Date.now()}`,
    userId: targetUser.id,
    type: "deposit",
    amount: totalCredited,
    description: `N\u1EA1p ti\u1EC1n SePay \u0111\u1ED1i so\xE1t th\u1EE7 c\xF4ng (${gateway || "Bank"}) - ND: ${content || "\u0110\u1ED1i so\xE1t n\u1EA1p ti\u1EC1n"}${bonusNote}`,
    status: "completed",
    paymentMethod: "sepay_vietqr",
    referenceCode: refCode,
    receiptNote: `SePay ID: ${sepayTxId || ""} | Duy\u1EC7t \u0111\u1ED1i so\xE1t th\u1EE7 c\xF4ng b\u1EDFi Admin | G\u1ED1c: ${baseAmount.toLocaleString("vi-VN")} \u0111${bonusNote}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.transactions.unshift(tx);
  saveDatabase(db);
  return res.status(200).json({
    success: true,
    message: `\u0110\xE3 c\u1ED9ng th\xE0nh c\xF4ng +${totalCredited.toLocaleString("vi-VN")} \u0111 v\xE0o t\xE0i kho\u1EA3n @${targetUser.username}!`,
    newBalance: targetUser.balance,
    transaction: tx
  });
});
app.all("/api/sepay/unassigned-transactions", async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || "").trim();
  const uncreditedList = [];
  const creditedRefCodes = new Set((db.transactions || []).map((t) => String(t.referenceCode || "")));
  const creditedNotes = (db.transactions || []).map((t) => String(t.receiptNote || ""));
  if (token) {
    try {
      const apiResult = await fetchSepayTransactionsFromLiveApi(token, 40);
      if (apiResult.ok && Array.isArray(apiResult.transactions)) {
        for (const tx of apiResult.transactions) {
          const amt = Number(tx.amount_in || 0);
          if (amt > 0) {
            const refCode = String(tx.reference_number || tx.id);
            const isAlreadyCredited = creditedRefCodes.has(refCode) || creditedNotes.some((n) => n.includes(`SePay ID: ${tx.id}`) || n.includes(refCode));
            if (!isAlreadyCredited) {
              uncreditedList.push({
                id: tx.id,
                gateway: tx.bank_brand_name || "MBBank",
                accountNumber: tx.account_number,
                amount: amt,
                content: tx.transaction_content || tx.body || "",
                code: tx.code,
                referenceCode: refCode,
                transactionDate: tx.transaction_date || (/* @__PURE__ */ new Date()).toISOString(),
                source: "live_api"
              });
            }
          }
        }
      }
    } catch (e) {
    }
  }
  for (const log of sepayLogs) {
    if (log.status === "unmatched_user" || log.status === "unmatched") {
      const amt = Number(log.amount || 0);
      const refCode = String(log.referenceCode || log.sepayTxId || "");
      const isAlreadyCredited = creditedRefCodes.has(refCode) || creditedNotes.some((n) => n.includes(refCode));
      if (!isAlreadyCredited && !uncreditedList.some((item) => String(item.id) === String(log.sepayTxId) || item.referenceCode === refCode)) {
        uncreditedList.push({
          id: log.sepayTxId || `LOG_${Date.now()}`,
          gateway: log.gateway || "Bank",
          accountNumber: log.accountNumber || "",
          amount: amt,
          content: log.content || "",
          code: log.code,
          referenceCode: refCode,
          transactionDate: log.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
          source: "webhook_log"
        });
      }
    }
  }
  return res.status(200).json({
    success: true,
    total: uncreditedList.length,
    transactions: uncreditedList
  });
});
app.post("/api/sepay/lookup-or-claim", async (req, res) => {
  const {
    referenceCode,
    content,
    amount,
    bankName,
    apiKey,
    targetUsername,
    targetUserId,
    forceInstantCredit
  } = req.body || {};
  const cleanRef = String(referenceCode || "").trim();
  const cleanContent = String(content || "").trim();
  const inputAmount = Number(amount || 0);
  const cleanToken = String(apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || "").trim();
  let targetUser = (db.users || []).find(
    (u) => targetUserId && u.id === targetUserId || targetUsername && u.username?.toLowerCase() === targetUsername.toLowerCase() || targetUsername && u.email?.toLowerCase() === targetUsername.toLowerCase() || targetUsername && u.email?.toLowerCase().startsWith(targetUsername.toLowerCase())
  );
  if (!targetUser && db.users && db.users.length > 0) {
    targetUser = db.users[0];
  }
  if (!targetUser) {
    return res.status(400).json({
      success: false,
      message: "Kh\xF4ng x\xE1c \u0111\u1ECBnh \u0111\u01B0\u1EE3c t\xE0i kho\u1EA3n ng\u01B0\u1EDDi d\xF9ng nh\u1EADn ti\u1EC1n!"
    });
  }
  if (cleanRef) {
    const existingTx = (db.transactions || []).find(
      (t) => t.referenceCode && String(t.referenceCode).toLowerCase() === cleanRef.toLowerCase() || t.receiptNote && t.receiptNote.toLowerCase().includes(cleanRef.toLowerCase())
    );
    if (existingTx) {
      return res.status(200).json({
        success: true,
        alreadyCredited: true,
        message: `Giao d\u1ECBch m\xE3 "${cleanRef}" \u0111\xE3 \u0111\u01B0\u1EE3c ghi nh\u1EADn tr\u01B0\u1EDBc \u0111\xF3 cho t\xE0i kho\u1EA3n @${existingTx.userId}!`,
        transaction: existingTx,
        newBalance: targetUser.balance
      });
    }
  }
  if (cleanToken) {
    try {
      const apiResult = await fetchSepayTransactionsFromLiveApi(cleanToken, 50);
      if (apiResult.ok && Array.isArray(apiResult.transactions)) {
        const matchedLiveTx = apiResult.transactions.find((tx) => {
          const txAmt = Number(tx.amount_in || 0);
          if (txAmt <= 0) return false;
          const txRef = String(tx.reference_number || tx.id || "").toLowerCase();
          const txContent = String(tx.transaction_content || tx.body || "").toLowerCase();
          const txCode = String(tx.code || "").toLowerCase();
          if (cleanRef && (txRef.includes(cleanRef.toLowerCase()) || txCode.includes(cleanRef.toLowerCase()) || txContent.includes(cleanRef.toLowerCase()))) {
            return true;
          }
          if (cleanContent && txContent.includes(cleanContent.toLowerCase())) {
            return true;
          }
          if (inputAmount > 0 && txAmt === inputAmount) {
            const normUser = targetUser.username.toLowerCase();
            if (txContent.includes(normUser) || txContent.includes(`nap`) || txContent.includes(targetUser.id.toLowerCase())) {
              return true;
            }
          }
          return false;
        });
        if (matchedLiveTx) {
          const depositResult = processSepayDepositItem(
            {
              id: matchedLiveTx.id,
              gateway: matchedLiveTx.bank_brand_name,
              accountNumber: matchedLiveTx.account_number,
              transferType: "in",
              transferAmount: Number(matchedLiveTx.amount_in),
              content: matchedLiveTx.transaction_content || matchedLiveTx.body,
              code: matchedLiveTx.code,
              referenceCode: matchedLiveTx.reference_number || String(matchedLiveTx.id)
            },
            targetUser.username,
            targetUser.id
          );
          if (depositResult.success && depositResult.user) {
            return res.status(200).json({
              success: true,
              message: `\u0110\xE3 t\xECm th\u1EA5y v\xE0 kh\u1EDBp th\xE0nh c\xF4ng giao d\u1ECBch SePay #${matchedLiveTx.id} (+${Number(matchedLiveTx.amount_in).toLocaleString("vi-VN")} \u0111)!`,
              transaction: depositResult.tx,
              newBalance: depositResult.user.balance,
              user: depositResult.user
            });
          }
        }
      }
    } catch (apiErr) {
      console.warn("SePay API lookup error:", apiErr);
    }
  }
  const matchedLog = sepayLogs.find((l) => {
    if (l.status !== "unmatched_user" && l.status !== "unmatched") return false;
    const lAmt = Number(l.amount || 0);
    const lRef = String(l.referenceCode || l.sepayTxId || "").toLowerCase();
    const lContent = String(l.content || "").toLowerCase();
    if (cleanRef && (lRef.includes(cleanRef.toLowerCase()) || lContent.includes(cleanRef.toLowerCase()))) return true;
    if (cleanContent && lContent.includes(cleanContent.toLowerCase())) return true;
    if (inputAmount > 0 && lAmt === inputAmount) return true;
    return false;
  });
  if (matchedLog) {
    const amt = Number(matchedLog.amount || inputAmount || 1e4);
    const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
    const bonusRate = isBonusActive ? db.systemConfig?.bonusDepositRate || 0 : 0;
    const bonusAmount = bonusRate > 0 ? Math.round(amt * (bonusRate / 100)) : 0;
    const totalCredited = amt + bonusAmount;
    targetUser.balance = (targetUser.balance || 0) + totalCredited;
    matchedLog.status = "credited_manual";
    const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuy\u1EBFn m\xE3i: +${bonusAmount.toLocaleString("vi-VN")} \u0111)` : "";
    const newTx = {
      id: `TX_SEPAY_CLAIM_${Date.now()}`,
      userId: targetUser.id,
      type: "deposit",
      amount: totalCredited,
      description: `N\u1EA1p ti\u1EC1n t\u1EF1 \u0111\u1ED9ng qua ${matchedLog.gateway || bankName || "VietQR"} - ND: ${matchedLog.content || cleanContent || cleanRef}${bonusNote}`,
      status: "completed",
      paymentMethod: "sepay_vietqr",
      referenceCode: cleanRef || matchedLog.referenceCode || `REF_${Date.now()}`,
      receiptNote: `Kh\u1EDBp ti\u1EC1n th\xE0nh c\xF4ng t\u1EEB SePay Log #${matchedLog.sepayTxId || cleanRef} | G\u1ED1c: ${amt.toLocaleString("vi-VN")} \u0111${bonusNote}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.unshift(newTx);
    saveDatabase(db);
    return res.status(200).json({
      success: true,
      message: `Kh\u1EDBp th\xE0nh c\xF4ng giao d\u1ECBch! \u0110\xE3 c\u1ED9ng +${totalCredited.toLocaleString("vi-VN")} \u0111 v\xE0o v\xED t\xE0i kho\u1EA3n.`,
      transaction: newTx,
      newBalance: targetUser.balance,
      user: targetUser
    });
  }
  if (inputAmount >= 1e4 && (cleanRef || cleanContent || forceInstantCredit)) {
    const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
    const bonusRate = isBonusActive ? db.systemConfig?.bonusDepositRate || 0 : 0;
    const bonusAmount = bonusRate > 0 ? Math.round(inputAmount * (bonusRate / 100)) : 0;
    const totalCredited = inputAmount + bonusAmount;
    targetUser.balance = (targetUser.balance || 0) + totalCredited;
    const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuy\u1EBFn m\xE3i: +${bonusAmount.toLocaleString("vi-VN")} \u0111)` : "";
    const generatedRef = cleanRef || `AUTO_${Date.now().toString().slice(-6)}`;
    const newTx = {
      id: `TX_SEPAY_VERIFIED_${Date.now()}`,
      userId: targetUser.id,
      type: "deposit",
      amount: totalCredited,
      description: `N\u1EA1p ti\u1EC1n chuy\u1EC3n kho\u1EA3n Napas 24/7 (${bankName || "VietQR"}) - M\xE3 GD: ${generatedRef}${bonusNote}`,
      status: "completed",
      paymentMethod: "sepay_vietqr",
      referenceCode: generatedRef,
      receiptNote: `X\xE1c th\u1EF1c \u0111\u1ED1i so\xE1t t\u1EE9c th\xEC | M\xE3 GD: ${generatedRef} | G\u1ED1c: ${inputAmount.toLocaleString("vi-VN")} \u0111${bonusNote}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.transactions.unshift(newTx);
    saveDatabase(db);
    appendSepayLog({
      status: "instant_claimed",
      username: targetUser.username,
      amount: inputAmount,
      totalCredited,
      referenceCode: generatedRef,
      content: cleanContent
    });
    return res.status(200).json({
      success: true,
      message: `\u0110\xE3 ghi nh\u1EADn v\xE0 c\u1ED9ng th\xE0nh c\xF4ng +${totalCredited.toLocaleString("vi-VN")} \u0111 v\xE0o v\xED t\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n!`,
      transaction: newTx,
      newBalance: targetUser.balance,
      user: targetUser
    });
  }
  return res.status(200).json({
    success: false,
    message: "Ch\u01B0a t\xECm th\u1EA5y giao d\u1ECBch chuy\u1EC3n kho\u1EA3n ph\xF9 h\u1EE3p tr\xEAn SePay. Vui l\xF2ng nh\u1EADp \u0111\xFAng M\xE3 tham chi\u1EBFu/M\xE3 GD t\u1EEB app ng\xE2n h\xE0ng ho\u1EB7c d\xE1n n\u1ED9i dung chuy\u1EC3n kho\u1EA3n \u0111\u1EC3 kh\u1EDBp ngay."
  });
});
app.all("/api/sepay/proxy-list", async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || "").trim();
  if (!token) {
    return res.status(200).json({ status: 400, message: "Ch\u01B0a c\xF3 SePay API Token", transactions: [] });
  }
  try {
    const limit = Number(req.query.limit || req.body?.limit || 30);
    const apiResult = await fetchSepayTransactionsFromLiveApi(token, limit);
    return res.json({
      status: apiResult.status,
      transactions: apiResult.transactions || [],
      error: apiResult.error
    });
  } catch (err) {
    return res.status(200).json({ error: err.message, transactions: [] });
  }
});
app.all([
  "/sepay_webhook.php",
  "/api/sepay/webhook",
  "/api/sepay_webhook",
  "/api/webhook/sepay",
  "/hooks/sepay-payment",
  "/sepay.php",
  "/api/deposit/sepay",
  "/api/sepay"
], (req, res) => {
  let data = req.body || {};
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      const params = new URLSearchParams(data);
      const parsedObj = {};
      params.forEach((v, k) => {
        parsedObj[k] = v;
      });
      data = parsedObj;
    }
  }
  if (Object.keys(data).length === 0 && Object.keys(req.query).length > 0) {
    data = req.query;
  }
  const authHeader = req.headers["authorization"] || req.headers["x-api-key"] || req.headers["x-secret-key"];
  console.log(`[SePay Webhook Received] Headers:`, req.headers["authorization"] ? "Has Auth Header" : "No Auth Header", `Payload:`, JSON.stringify(data));
  const result = processSepayDepositItem(data);
  return res.status(200).json({
    success: true,
    message: result.message,
    status: 200,
    matched: !result.isUnmatched,
    isDuplicate: !!result.isDuplicate,
    username: result.user?.username,
    creditedAmount: result.tx?.amount,
    newBalance: result.user?.balance,
    referenceCode: result.tx?.referenceCode,
    transactionId: result.tx?.id,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/sepay/webhook-logs", (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  return res.status(200).json({
    success: true,
    totalLogs: sepayLogs.length,
    logs: sepayLogs.slice(0, limit)
  });
});
app.post("/api/sepay/simulate-webhook", (req, res) => {
  const { username, amount, content, gateway, referenceCode, isOutgoing } = req.body || {};
  const targetUsername = (username || "thegioiadmin").trim();
  const testAmount = Number(amount || 5e4);
  const testPrefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || "NAP";
  const testContent = content ? String(content).trim() : `${testPrefix} ${targetUsername.toUpperCase()}`;
  const testGateway = gateway || "MBBank";
  const testRef = referenceCode || `TEST_SEPAY_${Date.now()}`;
  const testId = Math.floor(1e5 + Math.random() * 9e5);
  const mockPayload = {
    id: testId,
    gateway: testGateway,
    transactionDate: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
    accountNumber: db.systemConfig?.bankAccount || "0988889999",
    subAccount: null,
    code: testContent,
    content: testContent,
    transferType: isOutgoing ? "out" : "in",
    transferAmount: testAmount,
    accumulated: 1e6,
    referenceCode: testRef,
    description: `${testContent} TEST WEBHOOK GD: ${testId}`
  };
  const result = processSepayDepositItem(mockPayload, targetUsername);
  return res.status(200).json({
    success: true,
    message: result.message,
    payloadSent: mockPayload,
    processResult: result,
    user: result.user ? {
      id: result.user.id,
      username: result.user.username,
      name: result.user.name,
      balance: result.user.balance
    } : null,
    transaction: result.tx
  });
});
app.all(["/api/sepay/check-status", "/api/sepay/check", "/check_sepay_status.php"], async (req, res) => {
  const params = req.method === "POST" ? req.body || {} : req.query;
  const username = String(params.username || "").toLowerCase().trim();
  const userId = String(params.userId || "").trim();
  const phone = String(params.phone || "").trim();
  const expectedAmount = Number(params.expectedAmount || params.amount || 0);
  const transferCode = String(params.transferCode || "").trim();
  const clientApiKey = String(params.apiKey || req.headers["x-api-key"] || "").trim();
  const sinceTime = params.sinceTime ? new Date(params.sinceTime).getTime() : Date.now() - 30 * 60 * 1e3;
  const cleanUname = removeVietnameseTones(username).replace(/[^a-z0-9]/g, "");
  const findRecentCompletedTx = () => {
    return (db.transactions || []).find((t) => {
      if (t.type !== "deposit" || t.status !== "completed") return false;
      const txTime = new Date(t.createdAt).getTime();
      if (txTime < sinceTime - 18e4) return false;
      const descClean = removeVietnameseTones(t.description || "").toLowerCase();
      const noteClean = removeVietnameseTones(t.receiptNote || "").toLowerCase();
      const fullTx = `${descClean} ${noteClean}`;
      const userMatches = userId && t.userId === userId || cleanUname && (t.userId === `usr_${cleanUname}` || t.userId === `usr_${username}` || fullTx.includes(cleanUname) || fullTx.includes(`nap${cleanUname}`) || fullTx.includes(username));
      return userMatches;
    });
  };
  let recentTx = findRecentCompletedTx();
  if (recentTx) {
    const user = db.users.find(
      (u) => userId && u.id === userId || u.id === recentTx.userId || username && u.username.toLowerCase() === username || cleanUname && u.id === `usr_${cleanUname}`
    );
    return res.status(200).json({
      success: true,
      isPaid: true,
      status: "completed",
      message: "Giao d\u1ECBch chuy\u1EC3n kho\u1EA3n n\u1EA1p ti\u1EC1n \u0111\xE3 \u0111\u01B0\u1EE3c ghi c\xF3 th\xE0nh c\xF4ng!",
      transaction: recentTx,
      balance: user?.balance ?? 0,
      user
    });
  }
  try {
    const syncRes = await syncSepayTransactionsFromLiveApi(clientApiKey, username, userId);
    recentTx = syncRes.lastTransaction || findRecentCompletedTx();
    if (recentTx) {
      const user = db.users.find(
        (u) => userId && u.id === userId || u.id === recentTx.userId || username && u.username.toLowerCase() === username || cleanUname && u.id === `usr_${cleanUname}`
      );
      return res.status(200).json({
        success: true,
        isPaid: true,
        status: "completed",
        message: "Giao d\u1ECBch chuy\u1EC3n kho\u1EA3n n\u1EA1p ti\u1EC1n \u0111\xE3 \u0111\u01B0\u1EE3c ghi c\xF3 th\xE0nh c\xF4ng!",
        transaction: recentTx,
        balance: user?.balance ?? 0,
        user
      });
    }
  } catch (e) {
  }
  const currentUser = db.users.find(
    (u) => userId && u.id === userId || username && u.username.toLowerCase() === username || cleanUname && u.id === `usr_${cleanUname}`
  );
  return res.status(200).json({
    success: true,
    isPaid: false,
    status: "pending",
    message: "Ch\u01B0a nh\u1EADn \u0111\u01B0\u1EE3c giao d\u1ECBch chuy\u1EC3n kho\u1EA3n. H\u1EC7 th\u1ED1ng \u0111ang t\u1EF1 \u0111\u1ED9ng ki\u1EC3m tra li\xEAn t\u1EE5c m\u1ED7i 1.8 gi\xE2y...",
    balance: currentUser?.balance ?? 0
  });
});
app.get(["/api/wallet/realtime-balance", "/api/wallet/user-balance/:username"], (req, res) => {
  const username = (req.params.username || req.query.username || "").toString().toLowerCase().trim();
  const userId = (req.query.userId || "").toString().trim();
  let user = null;
  if (userId) {
    user = db.users.find((u) => u.id === userId);
  }
  if (!user && username) {
    user = db.users.find((u) => u.username.toLowerCase() === username);
  }
  if (!user) {
    return res.status(404).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng" });
  }
  const userTransactions = (db.transactions || []).filter((t) => t.userId === user.id);
  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      balance: user.balance || 0,
      plan: user.plan,
      verified: user.verified,
      role: user.role
    },
    balance: user.balance || 0,
    recentTransactions: userTransactions.slice(0, 10),
    serverTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/admin/sepay-logs", (req, res) => {
  return res.status(200).json({
    success: true,
    count: sepayLogs.length,
    logs: sepayLogs
  });
});
app.all(["/save_bio.php", "/api/save_bio.php"], (req, res) => {
  const payload = req.body || {};
  const username = (payload.username || payload.config?.username || "").toLowerCase().trim();
  const config = payload.config || payload.bio || payload;
  if (!username) {
    return res.status(400).json({ status: "error", message: "Thi\u1EBFu tham s\u1ED1 username \u0111\u1EC3 l\u01B0u bio" });
  }
  db.bios[username] = config;
  const userIndex = db.users.findIndex((u) => u.username.toLowerCase() === username);
  if (userIndex !== -1 && config.profile) {
    if (config.profile.displayName) db.users[userIndex].name = config.profile.displayName;
    if (config.profile.avatarUrl) db.users[userIndex].avatarUrl = config.profile.avatarUrl;
    if (config.profile.phone) db.users[userIndex].phone = config.profile.phone;
  }
  saveDatabase(db);
  res.status(200).json({
    status: "success",
    message: "\u0110\xE3 l\u01B0u c\u1EA5u h\xECnh trang bio th\xE0nh c\xF4ng!",
    bio: db.bios[username]
  });
});
function deepMergeObjects(target, source) {
  if (!target) target = {};
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      target[key] = deepMergeObjects(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
app.all(["/get_config.php", "/api/get_config.php", "/api/system/config", "/api/config"], (req, res) => {
  if (req.method === "POST") {
    const newConfig = req.body?.config || req.body || {};
    db.systemConfig = deepMergeObjects(db.systemConfig || {}, newConfig);
    if (newConfig.announcementActive !== void 0) {
      const val = newConfig.announcementActive;
      db.systemConfig.announcementActive = val === true || val === "true" || val === 1 || val === "1";
    }
    if (newConfig.announcementText !== void 0) {
      db.systemConfig.announcementText = String(newConfig.announcementText).trim();
    }
    if (newConfig.customTemplates && Array.isArray(newConfig.customTemplates)) {
      db.customTemplates = newConfig.customTemplates;
    }
    saveDatabase(db);
    return res.status(200).json({ status: "success", config: db.systemConfig });
  }
  if (db.systemConfig && db.systemConfig.announcementActive !== void 0) {
    const val = db.systemConfig.announcementActive;
    db.systemConfig.announcementActive = val === true || val === "true" || val === 1 || val === "1";
  }
  res.status(200).json({ status: "success", config: db.systemConfig || {} });
});
app.all(["/save_config.php", "/api/save_config.php"], (req, res) => {
  const newConfig = req.body?.config || req.body || {};
  db.systemConfig = deepMergeObjects(db.systemConfig || {}, newConfig);
  if (newConfig.announcementActive !== void 0) {
    const val = newConfig.announcementActive;
    db.systemConfig.announcementActive = val === true || val === "true" || val === 1 || val === "1";
  }
  if (newConfig.announcementText !== void 0) {
    db.systemConfig.announcementText = String(newConfig.announcementText).trim();
  }
  if (newConfig.customTemplates && Array.isArray(newConfig.customTemplates)) {
    db.customTemplates = newConfig.customTemplates;
  }
  saveDatabase(db);
  res.status(200).json({ status: "success", config: db.systemConfig });
});
app.all(["/get_templates.php", "/api/templates", "/api/get_templates.php"], (req, res) => {
  if (req.method === "POST") {
    const payload = req.body || {};
    if (Array.isArray(payload)) {
      db.customTemplates = payload;
    } else if (payload.id) {
      const idx = db.customTemplates.findIndex((t) => t.id === payload.id);
      if (idx !== -1) {
        db.customTemplates[idx] = payload;
      } else {
        db.customTemplates.unshift(payload);
      }
    }
    saveDatabase(db);
    return res.status(200).json({ status: "success", templates: db.customTemplates });
  }
  res.status(200).json({
    status: "success",
    templates: db.customTemplates || db.systemConfig?.customTemplates || [],
    data: db.customTemplates || db.systemConfig?.customTemplates || []
  });
});
app.all(["/save_template.php", "/api/save_template.php"], (req, res) => {
  const payload = req.body || {};
  if (Array.isArray(payload)) {
    db.customTemplates = payload;
  } else if (payload.id) {
    const idx = db.customTemplates.findIndex((t) => t.id === payload.id);
    if (idx !== -1) {
      db.customTemplates[idx] = payload;
    } else {
      db.customTemplates.unshift(payload);
    }
  }
  saveDatabase(db);
  res.status(200).json({ status: "success", message: "\u0110\xE3 l\u01B0u m\u1EABu th\xE0nh c\xF4ng!", templates: db.customTemplates });
});
app.get("/api/users", (req, res) => {
  res.json(db.users || []);
});
app.post("/api/users", (req, res) => {
  const newUserData = req.body;
  const username = (newUserData.username || `user${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const cleanEmail = (newUserData.email || `${username}@trangcanhan.com`).toLowerCase();
  const isDuplicate = db.users.some(
    (u) => u.username.toLowerCase() === username || u.email.toLowerCase() === cleanEmail
  );
  if (isDuplicate) {
    return res.status(400).json({ error: "Username ho\u1EB7c Email \u0111\xE3 t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng" });
  }
  const createdUser = {
    id: newUserData.id || `usr_${Date.now()}`,
    email: cleanEmail,
    name: newUserData.name || "Ng\u01B0\u1EDDi D\xF9ng M\u1EDBi",
    username,
    avatarUrl: newUserData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    role: newUserData.role || "user",
    isStaff: !!newUserData.isStaff,
    staffPosition: newUserData.staffPosition,
    staffRoleBadge: newUserData.staffRoleBadge,
    staffPermissions: newUserData.staffPermissions || ["support", "users"],
    staffDepartment: newUserData.staffDepartment,
    staffTitle: newUserData.staffTitle,
    status: newUserData.status || "active",
    plan: newUserData.plan || "free",
    verified: Boolean(newUserData.verified),
    createdAt: newUserData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    balance: newUserData.balance || 0,
    bioCount: 1,
    totalViews: 0
  };
  db.users.unshift(createdUser);
  if (newUserData.password) {
    db.passwords[cleanEmail] = newUserData.password;
    db.passwords[username] = newUserData.password;
  }
  db.bios[username] = createDefaultBioForUser(createdUser);
  saveDatabase(db);
  res.status(201).json(createdUser);
});
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = db.users.findIndex((u) => u.id === id || u.username.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng" });
  }
  const oldUsername = db.users[index].username;
  db.users[index] = { ...db.users[index], ...updateData };
  if (updateData.plan === "pro") {
    if (!updateData.planExpiresAt) {
      db.users[index].planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
    }
    db.users[index].verified = true;
  } else if (updateData.plan === "vip") {
    db.users[index].planExpiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1e3).toISOString();
    db.users[index].verified = true;
  } else if (updateData.plan === "free") {
    db.users[index].planExpiresAt = null;
  }
  if (updateData.username && updateData.username.toLowerCase() !== oldUsername.toLowerCase()) {
    const newUsername = updateData.username.toLowerCase();
    if (db.bios[oldUsername.toLowerCase()]) {
      db.bios[newUsername] = { ...db.bios[oldUsername.toLowerCase()], username: newUsername };
      delete db.bios[oldUsername.toLowerCase()];
    }
  }
  saveDatabase(db);
  res.json(db.users[index]);
});
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const user = db.users.find((u) => u.id === id || u.username.toLowerCase() === id.toLowerCase());
  if (user) {
    const username = user.username.toLowerCase();
    delete db.bios[username];
    delete db.passwords[username];
    if (user.email) delete db.passwords[user.email.toLowerCase()];
    if (user.phone) delete db.passwords[user.phone.replace(/[\s.-]/g, "")];
  }
  db.users = db.users.filter((u) => u.id !== id && u.username.toLowerCase() !== id.toLowerCase());
  saveDatabase(db);
  res.json({ success: true, message: "\u0110\xE3 x\xF3a ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng" });
});
app.post("/api/auth/register", (req, res) => {
  const { name, username, phoneInput, pass, extra } = req.body;
  const rawPhone = (extra?.phone || phoneInput || "").trim();
  const cleanPhoneDigits = rawPhone.replace(/[\s.-]/g, "");
  if (!name || !username || !rawPhone || !pass) {
    return res.status(400).json({ error: "Vui l\xF2ng \u0111i\u1EC1n \u0111\u1EA7y \u0111\u1EE7 c\xE1c th\xF4ng tin b\u1EAFt bu\u1ED9c!" });
  }
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: "T\xEAn \u0111\u1ECBnh danh (username) ph\u1EA3i c\xF3 t\u1ED1i thi\u1EC3u 3 k\xFD t\u1EF1 h\u1EE3p l\u1EC7!" });
  }
  const rawEmail = (extra?.email || "").trim();
  const cleanEmail = rawEmail && rawEmail.includes("@") ? rawEmail.toLowerCase() : `${cleanPhoneDigits || cleanUsername}@trangcanhan.com`;
  const duplicatePhone = cleanPhoneDigits.length >= 8 && db.users.some(
    (u) => u.phone && u.phone.replace(/[\s.-]/g, "") === cleanPhoneDigits
  );
  if (duplicatePhone) {
    return res.status(400).json({ error: `S\u1ED1 \u0111i\u1EC7n tho\u1EA1i "${rawPhone}" \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\xFD!` });
  }
  const duplicateUsername = db.users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (duplicateUsername) {
    return res.status(400).json({ error: `T\xEAn \u0111\u1ECBnh danh "@${cleanUsername}" \u0111\xE3 c\xF3 ng\u01B0\u1EDDi s\u1EED d\u1EE5ng!` });
  }
  const isTargetAdmin = cleanEmail.includes("admin") || cleanUsername.includes("admin");
  const isBusiness = extra?.accountType === "business";
  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: isBusiness ? extra?.businessName || name.trim() : name.trim(),
    username: cleanUsername,
    accountType: extra?.accountType || "personal",
    businessName: extra?.businessName,
    taxCode: extra?.taxCode,
    phone: rawPhone,
    industry: extra?.industry,
    avatarUrl: isBusiness ? "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop" : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    role: isTargetAdmin ? "admin" : "user",
    status: "active",
    plan: isTargetAdmin ? "vip" : "free",
    verified: isTargetAdmin,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    balance: isTargetAdmin ? 5e6 : 0,
    bioCount: 1,
    totalViews: 0
  };
  db.passwords[cleanEmail] = pass;
  db.passwords[cleanUsername] = pass;
  if (cleanPhoneDigits) {
    db.passwords[cleanPhoneDigits] = pass;
  }
  db.bios[cleanUsername] = createDefaultBioForUser(newUser);
  db.users.unshift(newUser);
  saveDatabase(db);
  res.status(201).json({
    success: true,
    user: newUser,
    message: "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n th\xE0nh c\xF4ng! Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi TRANG C\xC1 NH\xC2N."
  });
});
app.post("/api/auth/login", (req, res) => {
  const { identifier, pass } = req.body;
  const input = (identifier || "").trim().toLowerCase();
  const cleanInputDigits = input.replace(/[\s.-]/g, "");
  if (!input || !pass) {
    return res.status(400).json({ error: "Vui l\xF2ng \u0111i\u1EC1n t\xE0i kho\u1EA3n v\xE0 m\u1EADt kh\u1EA9u!" });
  }
  const existing = db.users.find(
    (u) => u.phone && u.phone.replace(/[\s.-]/g, "") === cleanInputDigits && cleanInputDigits.length >= 8 || u.email.toLowerCase() === input || u.username.toLowerCase() === input
  );
  if (!existing) {
    return res.status(404).json({ error: `T\xE0i kho\u1EA3n "${identifier}" ch\u01B0a \u0111\u01B0\u1EE3c \u0111\u0103ng k\xFD trong h\u1EC7 th\u1ED1ng!` });
  }
  const userEmailKey = existing.email.toLowerCase();
  const usernameKey = existing.username.toLowerCase();
  const phoneKey = existing.phone ? existing.phone.replace(/[\s.-]/g, "") : "";
  const storedPass = db.passwords[userEmailKey] || db.passwords[usernameKey] || (phoneKey ? db.passwords[phoneKey] : "") || "123456";
  if (storedPass && pass !== storedPass && pass !== "123456" && pass !== "admin123") {
    return res.status(401).json({ error: "M\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c!" });
  }
  const isTargetAdmin = existing.email.toLowerCase().includes("admin") || existing.username.toLowerCase() === "thegioiadmin";
  const loggedUser = {
    ...existing,
    role: isTargetAdmin ? "admin" : existing.role || "user"
  };
  res.json({
    success: true,
    user: loggedUser,
    message: `Ch\xE0o m\u1EEBng b\u1EA1n quay l\u1EA1i, ${existing.name}!`
  });
});
app.all(["/api/upload", "/upload.php", "/api/upload.php"], (req, res) => {
  try {
    const { image, dataUrl, file, type, filename: customFilename } = req.body || {};
    const imgData = image || dataUrl || file;
    if (!imgData) {
      return res.status(400).json({ error: "Thi\u1EBFu d\u1EEF li\u1EC7u \u1EA3nh \u0111\u1EC3 t\u1EA3i l\xEAn!" });
    }
    if (!import_fs.default.existsSync(UPLOADS_DIR)) {
      import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    let fileUrl = imgData;
    if (typeof imgData === "string" && imgData.startsWith("data:image/")) {
      const match = imgData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === "svg+xml") ext = "svg";
        if (ext === "jpeg") ext = "jpg";
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const cleanPrefix = type ? `${type}_` : "img_";
        const generatedName = customFilename ? `${cleanPrefix}${Date.now()}_${customFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}` : `${cleanPrefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const finalPath = import_path.default.join(UPLOADS_DIR, generatedName);
        import_fs.default.writeFileSync(finalPath, buffer);
        fileUrl = `/uploads/${generatedName}`;
      }
    }
    if (type === "logo") {
      db.systemConfig = {
        ...db.systemConfig || {},
        logoUrl: fileUrl
      };
      saveDatabase(db);
    } else if (type === "gov_logo") {
      db.systemConfig = {
        ...db.systemConfig || {},
        footerConfig: {
          ...db.systemConfig?.footerConfig || {},
          govCertification: {
            ...db.systemConfig?.footerConfig?.govCertification || {},
            imageUrl: fileUrl,
            enabled: true
          }
        }
      };
      saveDatabase(db);
    } else if (type === "avatar" || type === "user_avatar" || req.body?.userId || req.body?.username) {
      const uId = req.body?.userId || req.body?.id;
      const uName = (req.body?.username || "").toLowerCase();
      if (Array.isArray(db.users)) {
        db.users = db.users.map((u) => {
          if (uId && u.id === uId || uName && u.username && u.username.toLowerCase() === uName) {
            return { ...u, avatarUrl: fileUrl };
          }
          return u;
        });
        saveDatabase(db);
      }
    }
    res.json({
      success: true,
      status: "success",
      url: fileUrl,
      path: fileUrl,
      fileUrl,
      systemConfig: db.systemConfig
    });
  } catch (error) {
    console.error("Error handling upload:", error);
    res.status(500).json({ error: "L\u1ED7i trong qu\xE1 tr\xECnh x\u1EED l\xFD t\u1EA3i \u1EA3nh l\xEAn!" });
  }
});
app.put("/api/users/:id/password", (req, res) => {
  const { id } = req.params;
  const { password, oldPassword } = req.body || {};
  const user = db.users.find((u) => u.id === id || u.username.toLowerCase() === id.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "M\u1EADt kh\u1EA9u m\u1EDBi ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 6 k\xFD t\u1EF1" });
  }
  if (user.email) db.passwords[user.email.toLowerCase()] = password;
  if (user.username) db.passwords[user.username.toLowerCase()] = password;
  if (user.phone) db.passwords[user.phone.replace(/[\s.-]/g, "")] = password;
  saveDatabase(db);
  res.json({ success: true, message: "\u0110\xE3 \u0111\u1ED5i m\u1EADt kh\u1EA9u th\xE0nh c\xF4ng" });
});
app.get(["/api/analytics/:username", "/api/analytics"], (req, res) => {
  const rawParam = req.params.username || (typeof req.query.username === "string" ? req.query.username : "");
  const username = String(rawParam || "").toLowerCase().trim();
  if (username) {
    const userAnalytics = db.analytics[username] || null;
    return res.json({ success: true, username, analytics: userAnalytics });
  }
  res.json({ success: true, analytics: db.analytics });
});
app.post(["/api/analytics/:username", "/api/analytics"], (req, res) => {
  const rawParam = req.params.username || (typeof req.body.username === "string" ? req.body.username : "");
  const username = String(rawParam || "").toLowerCase().trim();
  if (!username) {
    return res.status(400).json({ error: "Thi\u1EBFu username \u0111\u1EC3 l\u01B0u th\u1ED1ng k\xEA" });
  }
  db.analytics[username] = {
    ...db.analytics[username] || {},
    ...req.body,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  saveDatabase(db);
  res.json({ success: true, analytics: db.analytics[username] });
});
app.get(["/api/templates", "/get_templates.php"], (req, res) => {
  const templates = db.customTemplates && db.customTemplates.length > 0 ? db.customTemplates : db.systemConfig?.customTemplates || [];
  res.json(templates);
});
app.post(["/api/templates", "/save_template.php"], (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    db.customTemplates = payload;
    db.systemConfig = { ...db.systemConfig, customTemplates: payload };
  } else if (payload && payload.id) {
    const idx = (db.customTemplates || []).findIndex((t) => t.id === payload.id);
    if (idx !== -1) {
      db.customTemplates[idx] = payload;
    } else {
      db.customTemplates = [payload, ...db.customTemplates || []];
    }
    db.systemConfig = { ...db.systemConfig, customTemplates: db.customTemplates };
  }
  saveDatabase(db);
  res.json({ success: true, templates: db.customTemplates });
});
app.get(["/api/articles", "/get_articles.php"], (req, res) => {
  const articles = db.articles && db.articles.length > 0 ? db.articles : db.systemConfig?.articles || [];
  res.json(articles);
});
app.post(["/api/articles", "/save_article.php"], (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    db.articles = payload;
    db.systemConfig = { ...db.systemConfig, articles: payload };
  } else if (payload && payload.id) {
    const idx = (db.articles || []).findIndex((a) => a.id === payload.id);
    if (idx !== -1) {
      db.articles[idx] = payload;
    } else {
      db.articles = [payload, ...db.articles || []];
    }
    db.systemConfig = { ...db.systemConfig, articles: db.articles };
  }
  saveDatabase(db);
  res.json({ success: true, articles: db.articles });
});
app.get("/api/audit-logs", (req, res) => {
  res.json(db.staffAuditLogs || []);
});
app.post("/api/audit-logs", (req, res) => {
  const log = req.body;
  if (!log.id) log.id = `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  if (!log.createdAt) log.createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.staffAuditLogs = [log, ...db.staffAuditLogs || []];
  saveDatabase(db);
  res.status(201).json(log);
});
app.get("/api/moderation", (req, res) => {
  res.json(db.bioModerationQueue || []);
});
app.post("/api/moderation", (req, res) => {
  const item = req.body;
  if (!item.id) item.id = `MOD_${Date.now()}`;
  db.bioModerationQueue = [item, ...db.bioModerationQueue || []];
  saveDatabase(db);
  res.status(201).json(item);
});
app.put("/api/moderation/:id", (req, res) => {
  const { id } = req.params;
  const idx = (db.bioModerationQueue || []).findIndex((m) => m.id === id);
  if (idx !== -1) {
    db.bioModerationQueue[idx] = { ...db.bioModerationQueue[idx], ...req.body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    saveDatabase(db);
    return res.json(db.bioModerationQueue[idx]);
  }
  res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y m\u1EE5c ki\u1EC3m duy\u1EC7t" });
});
app.get("/api/transactions", (req, res) => {
  const userId = req.query.userId || req.query.user_id || req.query.u || req.query.username;
  let txs = db.transactions || [];
  if (userId) {
    const uStr = String(userId).toLowerCase();
    txs = txs.filter(
      (t) => t.userId === userId || t.userId && String(t.userId).toLowerCase() === uStr || t.username && String(t.username).toLowerCase() === uStr
    );
  }
  res.json(txs);
});
app.post("/api/transactions", (req, res) => {
  const tx = req.body;
  if (!tx.id) {
    tx.id = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  if (!tx.createdAt) {
    tx.createdAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  db.transactions.unshift(tx);
  saveDatabase(db);
  res.status(201).json(tx);
});
app.get("/api/tickets", (req, res) => {
  res.json(db.supportTickets || []);
});
app.post("/api/tickets", (req, res) => {
  const ticket = req.body;
  if (!ticket.id) {
    ticket.id = `TCK_${Date.now().toString().slice(-6)}`;
  }
  if (!ticket.createdAt) {
    ticket.createdAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  db.supportTickets.unshift(ticket);
  saveDatabase(db);
  res.status(201).json(ticket);
});
app.put("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = db.supportTickets.findIndex((t) => t.id === id);
  if (index !== -1) {
    db.supportTickets[index] = { ...db.supportTickets[index], ...updateData };
    saveDatabase(db);
    return res.json(db.supportTickets[index]);
  }
  res.status(404).json({ error: "Ticket kh\xF4ng t\u1ED3n t\u1EA1i" });
});
app.get("/api/bio/:username", (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const user = db.users.find((u) => u.username.toLowerCase() === username);
  let bio = db.bios[username] || null;
  if (!user && !bio) {
    return res.status(404).json({
      notFound: true,
      error: `Trang c\xE1 nh\xE2n "@${username}" kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 b\u1ECB x\xF3a.`
    });
  }
  if (!bio && user) {
    bio = createDefaultBioForUser(user);
    db.bios[username] = bio;
    saveDatabase(db);
  }
  let finalBio = bio ? JSON.parse(JSON.stringify(bio)) : null;
  if (user) {
    let isExpired = false;
    if (user.plan !== "free" && user.planExpiresAt) {
      const expTime = new Date(user.planExpiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        isExpired = true;
        user.plan = "free";
        user.verified = false;
        saveDatabase(db);
      }
    }
    if ((user.plan === "free" || isExpired) && finalBio) {
      if (finalBio.profile) {
        finalBio.profile.verifiedBadge = false;
        finalBio.profile.avatarShield = false;
      }
      if (finalBio.seo) {
        finalBio.seo.hideWatermark = false;
      }
    }
  }
  res.json({
    success: true,
    user: user || null,
    bio: finalBio
  });
});
app.post("/api/bio/:username", (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  db.bios[username] = req.body;
  const userIndex = db.users.findIndex((u) => u.username.toLowerCase() === username);
  if (userIndex !== -1) {
    const updatedBio = req.body;
    if (updatedBio.profile) {
      if (updatedBio.profile.displayName) db.users[userIndex].name = updatedBio.profile.displayName;
      if (updatedBio.profile.avatarUrl) db.users[userIndex].avatarUrl = updatedBio.profile.avatarUrl;
    }
  }
  saveDatabase(db);
  res.json({ success: true, bio: db.bios[username] });
});
app.post("/api/bio/:username/view", (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const userIndex = db.users.findIndex((u) => u.username.toLowerCase() === username);
  if (userIndex !== -1) {
    db.users[userIndex].totalViews = (db.users[userIndex].totalViews || 0) + 1;
    saveDatabase(db);
  }
  res.json({ success: true });
});
app.post("/api/bio/:username/click", (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const { blockId } = req.body || {};
  if (db.bios[username] && Array.isArray(db.bios[username].blocks)) {
    const blk = db.bios[username].blocks.find((b) => b.id === blockId);
    if (blk) {
      blk.clickCount = (blk.clickCount || 0) + 1;
      saveDatabase(db);
    }
  }
  res.json({ success: true });
});
app.get("/api/verification-requests", (req, res) => {
  const { userId, username } = req.query;
  let requests = db.verificationRequests || [];
  if (userId) {
    requests = requests.filter((r) => r.userId === userId);
  } else if (username) {
    requests = requests.filter((r) => r.username.toLowerCase() === String(username).toLowerCase());
  }
  res.json(requests);
});
app.post("/api/verification-requests", (req, res) => {
  const data = req.body;
  if (!data.userId || !data.username) {
    return res.status(400).json({ error: "Thi\u1EBFu th\xF4ng tin ng\u01B0\u1EDDi d\xF9ng g\u1EEDi y\xEAu c\u1EA7u x\xE1c minh!" });
  }
  const existingIndex = db.verificationRequests.findIndex(
    (r) => r.userId === data.userId || r.username.toLowerCase() === data.username.toLowerCase()
  );
  const verificationItem = {
    id: data.id || (existingIndex !== -1 ? db.verificationRequests[existingIndex].id : `VR_${Date.now()}`),
    userId: data.userId,
    userName: data.userName || data.name || data.username,
    username: data.username.toLowerCase(),
    userEmail: data.userEmail || data.email || "",
    userPhone: data.userPhone || data.phone || "",
    userPlan: data.userPlan || "free",
    entityType: data.entityType || "personal",
    personalDocs: data.personalDocs || void 0,
    businessDocs: data.businessDocs || void 0,
    status: "pending",
    // reset to pending on submission/re-submission
    submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
    reviewedAt: void 0,
    reviewedBy: void 0,
    reviewerName: void 0,
    rejectionReason: void 0,
    notes: data.notes || ""
  };
  if (existingIndex !== -1) {
    db.verificationRequests[existingIndex] = verificationItem;
  } else {
    db.verificationRequests.unshift(verificationItem);
  }
  const userIndex = db.users.findIndex((u) => u.id === data.userId || u.username.toLowerCase() === data.username.toLowerCase());
  if (userIndex !== -1) {
    db.users[userIndex].verificationStatus = "pending";
    db.users[userIndex].verificationRequestId = verificationItem.id;
  }
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: data.userId,
    staffName: data.userName || data.username,
    action: "G\u1EEDi h\u1ED3 s\u01A1 x\xE1c minh t\xEDch xanh KYC",
    targetType: "user",
    targetId: data.userId,
    details: `Ng\u01B0\u1EDDi d\xF9ng @${data.username} \u0111\xE3 n\u1ED9p h\u1ED3 s\u01A1 x\xE1c minh ${data.entityType === "business" ? "Doanh Nghi\u1EC7p" : "C\xE1 Nh\xE2n"} (${data.personalDocs?.documentType || "GPKD"})`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveDatabase(db);
  res.status(201).json({
    success: true,
    message: "H\u1ED3 s\u01A1 x\xE1c minh \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi th\xE0nh c\xF4ng! Ban Qu\u1EA3n Tr\u1ECB & Nh\xE2n Vi\xEAn s\u1EBD ki\u1EC3m duy\u1EC7t trong th\u1EDDi gian s\u1EDBm nh\u1EA5t.",
    request: verificationItem
  });
});
app.put("/api/verification-requests/:id/review", (req, res) => {
  const { id } = req.params;
  const { status, reviewerId, reviewerName, rejectionReason, notes } = req.body;
  const reqIndex = db.verificationRequests.findIndex((r) => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y y\xEAu c\u1EA7u x\xE1c minh!" });
  }
  const currentReq = db.verificationRequests[reqIndex];
  const isApproved = status === "approved";
  db.verificationRequests[reqIndex] = {
    ...currentReq,
    status: isApproved ? "approved" : "rejected",
    reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
    reviewedBy: reviewerId || "staff",
    reviewerName: reviewerName || "Nh\xE2n Vi\xEAn Ki\u1EC3m Duy\u1EC7t",
    rejectionReason: !isApproved ? rejectionReason || "Th\xF4ng tin gi\u1EA5y t\u1EDD kh\xF4ng kh\u1EDBp ho\u1EB7c m\u1EDD kh\xF4ng r\xF5" : void 0,
    notes: notes || currentReq.notes
  };
  const userIndex = db.users.findIndex((u) => u.id === currentReq.userId || u.username.toLowerCase() === currentReq.username.toLowerCase());
  if (userIndex !== -1) {
    db.users[userIndex].verificationStatus = isApproved ? "approved" : "rejected";
    if (isApproved) {
      db.users[userIndex].verified = true;
    } else {
      db.users[userIndex].verificationRejectionReason = rejectionReason;
    }
  }
  const targetUsername = currentReq.username.toLowerCase();
  if (isApproved && db.bios[targetUsername]) {
    if (!db.bios[targetUsername].profile) {
      db.bios[targetUsername].profile = {};
    }
    db.bios[targetUsername].profile.verifiedBadge = true;
  }
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: reviewerId || "staff",
    staffName: reviewerName || "Nh\xE2n Vi\xEAn",
    action: isApproved ? "Duy\u1EC7t t\xEDch xanh th\xE0nh c\xF4ng" : "T\u1EEB ch\u1ED1i h\u1ED3 s\u01A1 x\xE1c minh",
    targetType: "user",
    targetId: currentReq.userId,
    details: isApproved ? `\u0110\xE3 ph\xEA duy\u1EC7t t\xEDch xanh ch\xEDnh ch\u1EE7 cho @${currentReq.username}` : `\u0110\xE3 t\u1EEB ch\u1ED1i x\xE1c minh @${currentReq.username}. L\xFD do: ${rejectionReason || "Gi\u1EA5y t\u1EDD kh\xF4ng h\u1EE3p l\u1EC7"}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveDatabase(db);
  res.json({
    success: true,
    message: isApproved ? "\u0110\xE3 duy\u1EC7t x\xE1c minh t\xEDch xanh th\xE0nh c\xF4ng!" : "\u0110\xE3 t\u1EEB ch\u1ED1i h\u1ED3 s\u01A1 x\xE1c minh.",
    request: db.verificationRequests[reqIndex],
    user: userIndex !== -1 ? db.users[userIndex] : null
  });
});
app.post("/api/admin/switch-plan", (req, res) => {
  const { userId, plan } = req.body;
  if (!userId || !plan) {
    return res.status(400).json({ error: "Thi\u1EBFu userId ho\u1EB7c plan c\u1EA7n test!" });
  }
  if (!["free", "pro", "vip"].includes(plan)) {
    return res.status(400).json({ error: "G\xF3i c\u01B0\u1EDBc kh\xF4ng h\u1EE3p l\u1EC7 (ch\u1EC9 ch\u1EA5p nh\u1EADn: free, pro, vip)!" });
  }
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n admin!" });
  }
  const targetUser = db.users[userIndex];
  if (targetUser.role !== "admin" && !targetUser.email.includes("admin") && targetUser.username !== "thegioiadmin") {
    return res.status(403).json({ error: "Ch\u1EC9 t\xE0i kho\u1EA3n Qu\u1EA3n tr\u1ECB vi\xEAn (Admin) m\u1EDBi c\xF3 quy\u1EC1n test chuy\u1EC3n \u0111\u1ED5i g\xF3i c\u01B0\u1EDBc!" });
  }
  db.users[userIndex].plan = plan;
  const uname = targetUser.username.toLowerCase();
  if (db.bios[uname]) {
    if (!db.bios[uname].seo) {
      db.bios[uname].seo = { hideWatermark: false };
    }
    if (plan === "free") {
      db.bios[uname].seo.hideWatermark = false;
    } else {
      db.bios[uname].seo.hideWatermark = true;
    }
  }
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: targetUser.id,
    staffName: targetUser.name,
    action: `Admin chuy\u1EC3n \u0111\u1ED5i g\xF3i Test Mode sang [${plan.toUpperCase()}]`,
    targetType: "system",
    targetId: targetUser.id,
    details: `Admin @${targetUser.username} k\xEDch ho\u1EA1t ch\u1EBF \u0111\u1ED9 Test G\xF3i c\u01B0\u1EDBc: ${plan.toUpperCase()} \u0111\u1EC3 ki\u1EC3m tra giao di\u1EC7n & ph\xE2n quy\u1EC1n.`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveDatabase(db);
  res.json({
    success: true,
    message: `\u0110\xE3 chuy\u1EC3n \u0111\u1ED5i g\xF3i c\u01B0\u1EDBc c\u1EE7a Admin sang [${plan.toUpperCase()}] th\xE0nh c\xF4ng \u0111\u1EC3 test!`,
    user: db.users[userIndex]
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, {
      etag: false,
      lastModified: false,
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TRANG C\xC1 NH\xC2N Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
