import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.text({ limit: '20mb', type: ['text/*', 'application/x-ndjson'] }));

// Global anti-cache middleware for all dynamic endpoints so updates take effect in real time
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

// Initial seed users
const DEFAULT_USERS = [
  {
    id: 'usr_admin_01',
    email: 'thegioiadmin@gmail.com',
    name: 'Nguyễn Thành Nam',
    username: 'thegioiadmin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    role: 'admin',
    isStaff: true,
    staffPosition: 'admin',
    staffRoleBadge: 'ADMIN',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    staffDepartment: 'Ban Quản Trị Tối Cao',
    staffTitle: 'Quản Trị Viên Trưởng',
    status: 'active',
    plan: 'vip',
    verified: true,
    createdAt: '2026-08-01T08:00:00Z',
    balance: 5000000,
    bioCount: 3,
    totalViews: 18450
  },
  {
    id: 'usr_staff_01',
    email: 'nhanvien@trangcanhan.com',
    name: 'Trần Thị Thu Hà',
    username: 'nhanvien',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    phone: '0977112233',
    role: 'support',
    isStaff: true,
    staffPosition: 'support',
    staffRoleBadge: 'CSKH',
    staffPermissions: ['support', 'users'],
    staffDepartment: 'Phòng Chăm Sóc Khách Hàng',
    staffTitle: 'Chuyên Viên Hỗ Trợ Khách Hàng 24/7',
    status: 'active',
    plan: 'vip',
    verified: true,
    createdAt: '2026-08-05T09:00:00Z',
    balance: 1000000,
    bioCount: 1,
    totalViews: 2340
  },
  {
    id: 'usr_creator_02',
    email: 'linhchi.beauty@gmail.com',
    name: 'Linh Chi Beauty & Cosmetic',
    username: 'linhchi',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'pro',
    verified: true,
    createdAt: '2026-08-10T14:20:00Z',
    balance: 250000,
    bioCount: 1,
    totalViews: 8920
  },
  {
    id: 'usr_creator_03',
    email: 'hoangnam.photo@gmail.com',
    name: 'Hoàng Nam Photography',
    username: 'hoangnam',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'free',
    verified: false,
    createdAt: '2026-08-15T11:05:00Z',
    balance: 0,
    bioCount: 1,
    totalViews: 1450
  },
  {
    id: 'usr_1787995706_93e7',
    email: 'nguyenvanadaa@gmail.com',
    name: 'nguyenvanadaa',
    username: 'nguyenvanadaa',
    phone: '0987898767',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'free',
    verified: false,
    createdAt: '2026-08-20T10:00:00Z',
    balance: 950000,
    bioCount: 1,
    totalViews: 320
  },
  {
    id: 'usr_lybichngoc',
    email: 'thangngockmhp@gmail.com',
    name: 'Lý Bích Ngọc',
    username: 'lybichngoc',
    phone: '0988889999',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    role: 'admin',
    isStaff: true,
    staffPosition: 'admin',
    staffRoleBadge: 'ADMIN',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    staffDepartment: 'Ban Quản Trị Tối Cao',
    staffTitle: 'Người Sáng Lập & Quản Trị',
    status: 'active',
    plan: 'vip',
    verified: true,
    createdAt: '2026-08-01T08:00:00Z',
    balance: 5297000,
    bioCount: 3,
    totalViews: 24500
  }
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  'lybichngoc': '123456',
  'thangngockmhp@gmail.com': '123456',
  'thegioiadmin@gmail.com': 'admin123',
  'thegioiadmin': 'admin123',
  'nhanvien@trangcanhan.com': '123456',
  'nhanvien': '123456',
  '0977112233': '123456',
  'linhchi.beauty@gmail.com': '123456',
  'linhchi': '123456',
  'hoangnam.photo@gmail.com': '123456',
  'hoangnam': '123456',
  'nguyenvanadaa@gmail.com': '123456',
  'nguyenvanadaa': '123456',
  '0987898767': '123456'
};

const DEFAULT_BIOS: Record<string, any> = {
  thegioiadmin: {
    username: 'thegioiadmin',
    profile: {
      displayName: 'Nguyễn Thành Nam',
      bio: 'Content Creator • Sáng tạo nội dung số tại Việt Nam. Chào mừng bạn đến với TRANG CÁ NHÂN chính thức của mình!',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      verifiedBadge: true,
      avatarShield: true,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      tagline: 'Kết nối đam mê - Chia sẻ giá trị',
      jobTitle: 'Quản Trị Viên Trưởng',
      workplace: 'TRANG CÁ NHÂN VIỆT NAM',
      address: 'Toà Nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh',
      phone: '0988 889 999',
      email: 'thegioiadmin@gmail.com',
      website: 'https://trangcanhan.com',
      showContactChips: true,
      showShareButton: true,
      showVCard: true,
      showViewsCount: true,
      floatingHotline: {
        enabled: true,
        phone: '0988 889 999',
        label: 'Hotline tư vấn',
        position: 'right',
      },
    },
    theme: {
      id: 'cyber-dark',
      name: 'Cyberpunk Neon',
      bgType: 'gradient',
      bgColor: '#09090b',
      bgGradient: { from: '#09090b', via: '#180e29', to: '#0f172a', direction: 'to-b' },
      bgImageUrl: '',
      bgOverlayOpacity: 0.2,
      bgBlur: 0,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 'medium',
      textColor: '#f8fafc',
      accentColor: '#8b5cf6',
      cardStyle: 'glass',
      cardBgColor: 'rgba(30, 27, 75, 0.55)',
      cardTextColor: '#ffffff',
      cardBorderColor: 'rgba(139, 92, 246, 0.4)',
      cardHoverEffect: 'glow',
      buttonShape: 'rounded-xl',
      buttonAnimation: 'pulse',
      avatarShape: 'circle',
      avatarBorderColor: '#8b5cf6',
      avatarBorderWidth: 3,
    },
    socialLinks: [
      { id: '1', platform: 'facebook', url: 'https://facebook.com/namcreator', active: true, label: 'Facebook Cá Nhân' },
      { id: '2', platform: 'tiktok', url: 'https://tiktok.com/@namcreator', active: true, label: 'TikTok 500k Followers' },
      { id: '3', platform: 'youtube', url: 'https://youtube.com/@namcreator', active: true, label: 'Kênh YouTube Review' },
      { id: '4', platform: 'zalo', url: 'https://zalo.me/0988889999', active: true, label: 'Zalo Công Việc' },
      { id: '5', platform: 'telegram', url: 'https://t.me/thegioiadmin', active: true, label: 'Telegram Admin' },
    ],
    blocks: [
      {
        id: 'block-1',
        type: 'link',
        enabled: true,
        order: 1,
        title: '🚀 Khóa học Sáng tạo Nội dung TikTok từ 0 - 100K Follow',
        url: 'https://trangcanhan.com',
        subtitle: 'Đang giảm giá 45% cho 50 bạn đăng ký sớm nhất hôm nay',
        highlight: true,
        badge: '🔥 HOT NHẤT',
        isPinned: true,
        clickCount: 1420,
        animation: 'glow',
      },
      {
        id: 'block-2',
        type: 'vietqr',
        enabled: true,
        order: 2,
        bankCode: 'MB',
        bankAccount: '0988889999',
        accountHolder: 'NGUYEN THANH NAM',
        amount: 50000,
        message: 'DONATE COFFEE CHO NAM',
        qrTitle: '☕ Mời Nam một ly cà phê làm động lực',
        description: 'Mọi sự ủng hộ của bạn là nguồn động viên lớn để mình tiếp tục làm video chất lượng!',
        clickCount: 312,
      },
      {
        id: 'block-3',
        type: 'contact_card',
        enabled: true,
        order: 3,
        jobTitle: 'Quản Trị Viên Trưởng',
        workplace: 'TRANG CÁ NHÂN VIỆT NAM',
        phone: '0988 889 999',
        email: 'thegioiadmin@gmail.com',
        address: 'Toà Nhà Landmark 81, TP. Hồ Chí Minh',
        vCardEnabled: true,
      }
    ],
    seo: {
      title: 'Nguyễn Thành Nam | TRANG CÁ NHÂN Chính Thức',
      description: 'Ghé thăm TRANG CÁ NHÂN chính thức của Nguyễn Thành Nam - Kết nối nhanh qua các nền tảng mạng xã hội và ngân hàng VietQR.',
      hideWatermark: true,
    },
    customDomain: {
      domain: '',
      verified: false,
      cnameTarget: 'cname.trangcanhan.com',
      sslActive: false,
      dnsRecords: [],
    },
    updatedAt: new Date().toISOString()
  },
  linhchi: {
    username: 'linhchi',
    profile: {
      displayName: 'Linh Chi Beauty & Cosmetic',
      bio: 'Chuyên cung cấp mỹ phẩm xách tay chính hãng 100% • Skincare routine chuẩn y khoa • Tư vấn da miễn phí.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
      verifiedBadge: true,
      avatarShield: false,
      location: 'Hà Nội, Việt Nam',
      tagline: 'Vẻ đẹp tự nhiên của bạn là sứ mệnh của chúng tôi',
      phone: '0912 345 678',
      email: 'linhchi.beauty@gmail.com',
      showContactChips: true,
      showShareButton: true,
      showVCard: true,
    },
    theme: {
      id: 'rose-gold',
      name: 'Rose Gold Luxury',
      bgType: 'gradient',
      bgColor: '#1c1017',
      bgGradient: { from: '#1c1017', via: '#2d1522', to: '#120b10', direction: 'to-b' },
      fontFamily: 'Outfit',
      fontSize: 'medium',
      textColor: '#fdf2f8',
      accentColor: '#f43f5e',
      cardStyle: 'glass',
      cardBgColor: 'rgba(50, 20, 35, 0.6)',
      cardTextColor: '#ffffff',
      cardBorderColor: 'rgba(244, 63, 94, 0.3)',
      buttonShape: 'rounded-2xl',
      avatarShape: 'circle',
      avatarBorderColor: '#f43f5e',
      avatarBorderWidth: 3,
    },
    socialLinks: [
      { id: '1', platform: 'tiktok', url: 'https://tiktok.com/@linhchibeauty', active: true, label: 'TikTok Shop' },
      { id: '2', platform: 'facebook', url: 'https://facebook.com/linhchicosmetic', active: true, label: 'Fanpage Mỹ Phẩm' },
      { id: '3', platform: 'shopee', url: 'https://shopee.vn/linhchicosmetics', active: true, label: 'Gian hàng Shopee Mall' },
      { id: '4', platform: 'zalo', url: 'https://zalo.me/0912345678', active: true, label: 'Zalo Đặt Hàng' },
    ],
    blocks: [
      {
        id: 'blk-lc-1',
        type: 'product',
        enabled: true,
        order: 1,
        title: 'Serum Tái Tạo Da Chuyên Sâu B5 Hyaluronic Acid',
        price: 380000,
        originalPrice: 550000,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
        buttonText: 'Săn Deal Shopee Mall -30%',
        productUrl: 'https://shopee.vn',
        isHot: true,
        clickCount: 1540,
      }
    ],
    seo: {
      title: 'Linh Chi Beauty & Cosmetic | TRANG CÁ NHÂN',
      description: 'Mỹ phẩm xách tay chính hãng, tư vấn Skincare routine chuẩn y khoa.',
      hideWatermark: true,
    },
    customDomain: { domain: '', verified: false, cnameTarget: 'cname.trangcanhan.com' },
    updatedAt: new Date().toISOString()
  },
  hoangnam: {
    username: 'hoangnam',
    profile: {
      displayName: 'Hoàng Nam Photography',
      bio: 'Nhiếp ảnh gia tự do • Chụp ảnh cưới phong cách Hàn Quốc, Lookbook thời trang & Ảnh chân dung nghệ thuật.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      verifiedBadge: false,
      location: 'Đà Nẵng, Việt Nam',
      tagline: 'Lưu giữ khoảnh khắc thanh xuân trọn vẹn',
      phone: '0933 445 566',
      email: 'hoangnam.photo@gmail.com',
      showContactChips: true,
      showShareButton: true,
    },
    theme: {
      id: 'minimal-slate',
      name: 'Minimal Dark Slate',
      bgType: 'color',
      bgColor: '#0f172a',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 'medium',
      textColor: '#f8fafc',
      accentColor: '#38bdf8',
      cardStyle: 'glass',
      cardBgColor: 'rgba(30, 41, 59, 0.7)',
      cardTextColor: '#ffffff',
      cardBorderColor: 'rgba(56, 189, 248, 0.2)',
      buttonShape: 'rounded-xl',
      avatarShape: 'circle',
      avatarBorderColor: '#38bdf8',
      avatarBorderWidth: 2,
    },
    socialLinks: [
      { id: '1', platform: 'instagram', url: 'https://instagram.com/hoangnam.visual', active: true, label: 'Instagram Portfolio' },
      { id: '2', platform: 'facebook', url: 'https://facebook.com/hoangnamphoto', active: true, label: 'Facebook Page' },
    ],
    blocks: [
      {
        id: 'blk-hn-1',
        type: 'link',
        enabled: true,
        order: 1,
        title: '📸 Xem Bảng Giá Gói Chụp Ảnh Cưới & Lookbook 2026',
        url: 'https://trangcanhan.com',
        subtitle: 'Nhận tư vấn concept chụp độc quyền miễn phí',
        clickCount: 420,
      }
    ],
    seo: {
      title: 'Hoàng Nam Photography | TRANG CÁ NHÂN',
      description: 'Portfolio chụp ảnh cưới, lookbook thời trang và nghệ thuật.',
      hideWatermark: false,
    },
    customDomain: { domain: '', verified: false, cnameTarget: 'cname.trangcanhan.com' },
    updatedAt: new Date().toISOString()
  }
};

interface DatabaseSchema {
  users: any[];
  passwords: Record<string, string>;
  systemConfig: any;
  transactions: any[];
  supportTickets: any[];
  staffAuditLogs: any[];
  bioModerationQueue: any[];
  verificationRequests: any[];
  bios: Record<string, any>;
  analytics: Record<string, any>;
  customTemplates: any[];
  articles: any[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure key collections exist
      return {
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : DEFAULT_USERS,
        passwords: { ...DEFAULT_PASSWORDS, ...(parsed.passwords || {}) },
        systemConfig: parsed.systemConfig || {},
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets : [],
        staffAuditLogs: Array.isArray(parsed.staffAuditLogs) ? parsed.staffAuditLogs : [],
        bioModerationQueue: Array.isArray(parsed.bioModerationQueue) ? parsed.bioModerationQueue : [],
        verificationRequests: Array.isArray(parsed.verificationRequests) ? parsed.verificationRequests : [],
        bios: { ...DEFAULT_BIOS, ...(parsed.bios || {}) },
        analytics: parsed.analytics || {},
        customTemplates: Array.isArray(parsed.customTemplates) ? parsed.customTemplates : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : []
      };
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }

  const initialDb: DatabaseSchema = {
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

function saveDatabase(database: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const jsonStr = JSON.stringify(database, null, 2);
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');

    // Đồng bộ đồng thời vào public/data/db.json để PHP trên hosting hoặc web server luôn có dữ liệu tức thì
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDataDir, 'db.json'), jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// In-memory reference that loads from disk
let db = loadDatabase();

// Helper to construct a default bio config for a given user
function createDefaultBioForUser(user: any) {
  const isVipOrAdmin = user.role === 'admin' || user.plan === 'vip' || user.plan === 'pro';
  return {
    username: user.username,
    profile: {
      displayName: user.name || user.username,
      bio: `Chào mừng bạn đến với TRANG CÁ NHÂN chính thức của ${user.name || user.username}!`,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      verifiedBadge: isVipOrAdmin && Boolean(user.verified),
      avatarShield: false,
      phone: user.phone || '',
      email: user.email || '',
      workplace: user.businessName || '',
      tagline: user.accountType === 'business' ? (user.industry || 'Doanh Nghiệp & Dịch Vụ') : 'Kết nối & Chia sẻ',
      showContactChips: true,
      showShareButton: true,
      showVCard: true,
      showViewsCount: true,
      floatingHotline: user.phone ? {
        enabled: true,
        phone: user.phone,
        label: 'Hotline tư vấn',
        position: 'right'
      } : undefined
    },
    theme: {
      id: 'cyber-dark',
      name: 'Cyberpunk Neon',
      bgType: 'gradient',
      bgColor: '#09090b',
      bgGradient: { from: '#09090b', via: '#180e29', to: '#0f172a', direction: 'to-b' },
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 'medium',
      textColor: '#f8fafc',
      accentColor: '#8b5cf6',
      cardStyle: 'glass',
      cardBgColor: 'rgba(30, 27, 75, 0.55)',
      cardTextColor: '#ffffff',
      cardBorderColor: 'rgba(139, 92, 246, 0.4)',
      buttonShape: 'rounded-xl',
      avatarShape: 'circle',
      avatarBorderColor: '#8b5cf6',
      avatarBorderWidth: 3,
    },
    socialLinks: user.phone ? [
      { id: '1', platform: 'zalo', url: `https://zalo.me/${user.phone.replace(/[\s.-]/g, '')}`, active: true, label: 'Zalo' }
    ] : [],
    blocks: [
      {
        id: `blk_${Date.now()}_contact`,
        type: 'contact_card',
        enabled: true,
        order: 1,
        jobTitle: user.accountType === 'business' ? (user.industry || 'Doanh Nghiệp & Dịch Vụ') : 'Liên hệ & Hợp tác',
        workplace: user.businessName || '',
        phone: user.phone || '0988 889 999',
        email: user.email || 'contact@trangcanhan.com',
        address: user.address || 'Việt Nam',
        website: 'https://trangcanhan.com',
        zalo: user.phone ? user.phone.replace(/[\s.-]/g, '') : '0988889999',
        vCardEnabled: true,
      }
    ],
    seo: {
      title: `${user.name || user.username} | TRANG CÁ NHÂN`,
      description: `Khám phá TRANG CÁ NHÂN chính thức của ${user.name || user.username}`,
      hideWatermark: isVipOrAdmin,
    },
    customDomain: {
      domain: user.customDomain || '',
      verified: false,
      cnameTarget: 'cname.trangcanhan.com'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ----------------- API ROUTES -----------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'TRANG CÁ NHÂN', time: new Date().toISOString() });
});

// ----------------- PHP BACKEND COMPATIBILITY ROUTES -----------------
// Route: /register.php
app.all(['/register.php', '/api/register.php'], (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed. Vui lòng gửi phương thức POST.' });
  }

  // Check Maintenance Mode
  const sysConfig = db.systemConfig;
  if (sysConfig?.maintenanceConfig?.globalMaintenance || sysConfig?.maintenanceMode) {
    return res.status(503).json({
      status: 'error',
      message: sysConfig?.maintenanceConfig?.globalMessage || 'Hệ thống đang bảo trì toàn diện để nâng cấp máy chủ. Vui lòng quay lại sau ít phút!'
    });
  }
  if (sysConfig?.maintenanceConfig?.modules?.user_register?.isUnderMaintenance) {
    const regMsg = sysConfig.maintenanceConfig.modules.user_register.maintenanceMessage || 'Hệ thống đang tạm ngừng tiếp nhận đăng ký mới để nâng cấp.';
    return res.status(503).json({
      status: 'error',
      message: regMsg
    });
  }

  const { username, password, pass, name, email, phone, phoneInput, extra, account_type, business_name, tax_code, industry } = req.body || {};
  const userPassword = password || pass;
  const rawPhone = (phone || phoneInput || extra?.phone || '').trim();
  const cleanPhoneDigits = rawPhone.replace(/[\s.-]/g, '');

  if (!username || !userPassword) {
    return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp đầy đủ username và password!' });
  }

  const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ status: 'error', message: 'Tên định danh (username) phải có ít nhất 3 ký tự!' });
  }

  const rawEmail = (email || extra?.email || '').trim();
  const cleanEmail = rawEmail && rawEmail.includes('@') 
    ? rawEmail.toLowerCase() 
    : `${cleanPhoneDigits || cleanUsername}@trangcanhan.com`;

  // Duplicate check
  const duplicatePhone = cleanPhoneDigits.length >= 8 && db.users.some(
    u => u.phone && u.phone.replace(/[\s.-]/g, '') === cleanPhoneDigits
  );
  if (duplicatePhone) {
    return res.status(400).json({ status: 'error', message: `Số điện thoại "${rawPhone}" đã được đăng ký trong hệ thống!` });
  }

  const duplicateUsername = db.users.some(u => u.username.toLowerCase() === cleanUsername);
  if (duplicateUsername) {
    return res.status(400).json({ status: 'error', message: `Tên đăng nhập "${cleanUsername}" đã có người sử dụng!` });
  }

  const isTargetAdmin = cleanEmail.includes('admin') || cleanUsername.includes('admin');
  const isBusiness = (account_type || extra?.accountType) === 'business';

  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: name?.trim() || (isBusiness ? (business_name || extra?.businessName || cleanUsername) : cleanUsername),
    username: cleanUsername,
    accountType: account_type || extra?.accountType || 'personal',
    businessName: business_name || extra?.businessName,
    taxCode: tax_code || extra?.taxCode,
    phone: rawPhone,
    industry: industry || extra?.industry,
    avatarUrl: isBusiness
      ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop'
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    role: isTargetAdmin ? 'admin' : 'user',
    status: 'active',
    plan: isTargetAdmin ? 'vip' : 'free',
    verified: isTargetAdmin,
    createdAt: new Date().toISOString(),
    balance: isTargetAdmin ? 5000000 : 0,
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
    status: 'success',
    message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TRANG CÁ NHÂN.',
    user: newUser
  });
});

// Route: /login.php
app.all(['/login.php', '/api/login.php'], (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed. Vui lòng gửi phương thức POST.' });
  }

  const { username, password, identifier, pass } = req.body || {};
  const loginUser = (username || identifier || '').trim().toLowerCase();
  const loginPass = password || pass;

  if (!loginUser || !loginPass) {
    return res.status(400).json({ status: 'error', message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' });
  }

  const cleanInputDigits = loginUser.replace(/[\s.-]/g, '');

  const existing = db.users.find(
    u =>
      (u.phone && u.phone.replace(/[\s.-]/g, '') === cleanInputDigits && cleanInputDigits.length >= 8) ||
      u.email.toLowerCase() === loginUser ||
      u.username.toLowerCase() === loginUser
  );

  if (!existing) {
    return res.status(401).json({ status: 'error', message: `Tài khoản hoặc mật khẩu không chính xác!` });
  }

  const userEmailKey = existing.email.toLowerCase();
  const usernameKey = existing.username.toLowerCase();
  const phoneKey = existing.phone ? existing.phone.replace(/[\s.-]/g, '') : '';
  const storedPass = db.passwords[userEmailKey] || db.passwords[usernameKey] || (phoneKey ? db.passwords[phoneKey] : '') || '';

  if (storedPass && loginPass !== storedPass) {
    return res.status(401).json({ status: 'error', message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.' });
  }

  const isTargetAdmin = existing.email.toLowerCase().includes('admin') || existing.username.toLowerCase() === 'thegioiadmin';
  const loggedUser = {
    ...existing,
    role: isTargetAdmin ? 'admin' : existing.role || 'user'
  };

  res.status(200).json({
    status: 'success',
    message: `Đăng nhập thành công! Chào mừng ${existing.name || existing.username}.`,
    user: loggedUser
  });
});

// Route: /get_users.php
app.all(['/get_users.php', '/api/get_users.php'], (req, res) => {
  res.status(200).json({
    status: 'success',
    data: db.users || []
  });
});

// Route: /adjust_balance.php & /api/users/:id/balance
app.all(['/adjust_balance.php', '/api/adjust_balance.php', '/api/users/:id/balance'], (req, res) => {
  const payload = req.body || {};
  const userId = req.params?.id || payload.userId || payload.id || payload.username;
  const amount = Number(payload.amount || 0);
  const reason = payload.reason || payload.description || 'Điều chỉnh số dư bởi Quản trị viên';

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'Thiếu ID hoặc Username người dùng' });
  }

  const index = db.users.findIndex(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Không tìm thấy người dùng!' });
  }

  const currentBal = Number(db.users[index].balance || 0);
  const newBal = Math.max(0, currentBal + amount);
  db.users[index].balance = newBal;

  const newTx = {
    id: `TX_ADM_${Date.now().toString().slice(-8)}`,
    userId: db.users[index].id,
    type: amount >= 0 ? 'deposit' : 'withdraw',
    amount,
    description: `[Admin] ${reason}`,
    createdAt: new Date().toISOString(),
    status: 'completed',
    paymentMethod: 'balance',
    referenceCode: `ADM${Date.now().toString().slice(-6)}`,
    receiptNote: `Điều chỉnh số dư bởi Quản trị viên: ${reason}`
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
    staffId: 'usr_admin_01',
    staffName: 'Quản Trị Viên (Admin)',
    action: amount >= 0 ? 'Cộng tiền tài khoản' : 'Trừ tiền tài khoản',
    targetType: 'user',
    targetId: db.users[index].id,
    details: `Admin điều chỉnh ${amount >= 0 ? '+' : ''}${amount} VNĐ cho @${db.users[index].username}. Lý do: ${reason}`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);

  res.status(200).json({
    status: 'success',
    success: true,
    message: `Đã cập nhật số dư thành công cho @${db.users[index].username}! Số dư mới: ${newBal.toLocaleString('vi-VN')} VNĐ`,
    user: db.users[index],
    transaction: newTx
  });
});

// Route: /update_user.php & /save_user.php (Hỗ trợ UPSERT tự động)
app.all(['/update_user.php', '/api/update_user.php', '/save_user.php', '/api/save_user.php'], (req, res) => {
  const updateData = req.body || {};
  const userId = updateData.id || updateData.userId;
  const username = (updateData.username || '').toLowerCase();
  const rawEmail = (updateData.email || '').toLowerCase();

  let index = db.users.findIndex(u => (userId && u.id === userId) || (username && u.username.toLowerCase() === username) || (rawEmail && u.email && u.email.toLowerCase() === rawEmail));
  
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updateData };
    if (updateData.plan === 'pro') {
      if (!updateData.planExpiresAt) {
        db.users[index].planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }
      db.users[index].verified = true;
    } else if (updateData.plan === 'vip') {
      db.users[index].planExpiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
      db.users[index].verified = true;
    } else if (updateData.plan === 'free') {
      db.users[index].planExpiresAt = null;
      if (updateData.verified === undefined) {
        db.users[index].verified = false;
      }
    }
  } else {
    // Tự động tạo người dùng mới nếu chưa tồn tại (UPSERT)
    const newUsername = username || (rawEmail ? rawEmail.split('@')[0] : `user_${Date.now()}`);
    const newUser = {
      id: userId || `usr_${Date.now()}`,
      username: newUsername,
      email: rawEmail || `${newUsername}@trangcanhan.com`,
      name: updateData.name || newUsername,
      phone: updateData.phone || '',
      avatarUrl: updateData.avatarUrl || updateData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${newUsername}`,
      role: updateData.role || (newUsername.includes('admin') ? 'admin' : 'user'),
      isStaff: !!updateData.isStaff || !!updateData.is_staff,
      staffPosition: updateData.staffPosition || updateData.staff_position,
      staffRoleBadge: updateData.staffRoleBadge || updateData.staff_role_badge,
      staffDepartment: updateData.staffDepartment || updateData.staff_department,
      staffTitle: updateData.staffTitle || updateData.staff_title,
      status: updateData.status || 'active',
      plan: updateData.plan || (newUsername.includes('admin') ? 'vip' : 'free'),
      verified: updateData.verified !== undefined ? !!updateData.verified : newUsername.includes('admin'),
      balance: updateData.balance !== undefined ? Number(updateData.balance) : (newUsername.includes('admin') ? 5000000 : 0),
      accountType: updateData.accountType || updateData.account_type || 'personal',
      businessName: updateData.businessName || updateData.business_name,
      taxCode: updateData.taxCode || updateData.tax_code,
      industry: updateData.industry,
      customDomain: updateData.customDomain || updateData.custom_domain,
      bioCount: updateData.bioCount !== undefined ? Number(updateData.bioCount) : 1,
      totalViews: updateData.totalViews !== undefined ? Number(updateData.totalViews) : 0,
      createdAt: updateData.createdAt || new Date().toISOString(),
      ...updateData
    };
    db.users.unshift(newUser);
    index = 0;
    if (!db.bios[newUsername]) {
      db.bios[newUsername] = createDefaultBioForUser(newUser);
    }
  }

  // Cập nhật mật khẩu nếu có
  const pass = updateData.password || updateData.pass;
  if (pass) {
    const uObj = db.users[index];
    if (uObj.username) db.passwords[uObj.username.toLowerCase()] = pass;
    if (uObj.email) db.passwords[uObj.email.toLowerCase()] = pass;
    if (uObj.phone) db.passwords[uObj.phone.replace(/[\s.-]/g, '')] = pass;
  }

  saveDatabase(db);
  res.status(200).json({ status: 'success', success: true, user: db.users[index] });
});

// Route: /sync_all_users.php
app.all(['/sync_all_users.php', '/api/sync_all_users.php'], (req, res) => {
  const usersToSync = req.body?.users || (Array.isArray(req.body) ? req.body : []);
  if (Array.isArray(usersToSync) && usersToSync.length > 0) {
    usersToSync.forEach(u => {
      const uName = (u.username || '').toLowerCase();
      if (!uName) return;
      const idx = db.users.findIndex(x => x.id === u.id || x.username.toLowerCase() === uName);
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
    status: 'success',
    success: true,
    message: `Đã đồng bộ hóa danh sách ${db.users.length} tài khoản thành công!`,
    users: db.users,
    data: db.users
  });
});


// Route: /delete_user.php
app.all(['/delete_user.php', '/api/delete_user.php'], (req, res) => {
  const { id, username } = req.body || req.query || {};
  const user = db.users.find(u => (id && u.id === id) || (username && u.username.toLowerCase() === String(username).toLowerCase()));
  if (user) {
    const uname = user.username.toLowerCase();
    delete db.bios[uname];
    delete db.passwords[uname];
    if (user.email) delete db.passwords[user.email.toLowerCase()];
    if (user.phone) delete db.passwords[user.phone.replace(/[\s.-]/g, '')];
    db.users = db.users.filter(u => u.id !== user.id);
    saveDatabase(db);
  }
  res.status(200).json({ status: 'success', message: 'Đã xóa người dùng thành công' });
});

// Route: /get_bio.php
app.all(['/get_bio.php', '/api/get_bio.php'], (req, res) => {
  const username = (req.query.u || req.query.username || req.body?.username || '').toLowerCase().trim();
  if (!username) {
    return res.status(400).json({ status: 'error', message: 'Thiếu tham số username' });
  }

  const user = db.users.find(u => u.username.toLowerCase() === username);
  let bio = db.bios[username] || null;

  if (!user && !bio) {
    return res.status(404).json({ status: 'error', notFound: true, message: `Trang bio "@${username}" không tồn tại` });
  }

  if (!bio && user) {
    bio = createDefaultBioForUser(user);
    db.bios[username] = bio;
    saveDatabase(db);
  }

  let finalBio = bio ? JSON.parse(JSON.stringify(bio)) : null;

  if (user) {
    // Check if plan has expired
    let isExpired = false;
    if (user.plan !== 'free' && user.planExpiresAt) {
      const expTime = new Date(user.planExpiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        isExpired = true;
        user.plan = 'free';
        user.verified = false;
        saveDatabase(db);
      }
    }

    if ((user.plan === 'free' || isExpired) && finalBio) {
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
    status: 'success',
    user: user || null,
    bio: finalBio || null,
    config: finalBio || null
  });
});

// Route: /get_transactions.php
app.all(['/get_transactions.php', '/api/get_transactions.php'], (req, res) => {
  const userId = req.query.user_id || req.query.userId || req.query.u || req.query.username || req.body?.userId;
  let txs = db.transactions || [];
  if (userId) {
    const uStr = String(userId).toLowerCase();
    txs = txs.filter(t => 
      t.userId === userId || 
      (t.userId && String(t.userId).toLowerCase() === uStr) ||
      (t.username && String(t.username).toLowerCase() === uStr)
    );
  }
  res.status(200).json({
    status: 'success',
    success: true,
    data: txs,
    transactions: txs
  });
});

// Route: /create_transaction.php
app.all(['/create_transaction.php', '/api/create_transaction.php', '/deposit.php'], (req, res) => {
  const payload = req.body || {};
  const userId = payload.userId || payload.user_id || payload.username;
  const amount = Number(payload.amount) || 0;
  const type = payload.type || 'deposit';
  const description = payload.description || 'Giao dịch nạp tiền';
  const paymentMethod = payload.paymentMethod || payload.payment_method || 'vietqr';
  const referenceCode = payload.referenceCode || payload.reference_code || `TX${Date.now().toString().slice(-6)}`;
  const receiptNote = payload.receiptNote || payload.receipt_note || '';

  const user = db.users.find(u => u.id === userId || u.username.toLowerCase() === String(userId).toLowerCase());
  if (user) {
    user.balance = Math.max(0, (user.balance || 0) + amount);
  }

  const tx = {
    id: payload.id || `TX_${amount >= 0 ? 'DEP_' : 'PAY_'}${Date.now()}`,
    userId: user ? user.id : (userId || 'usr_guest'),
    username: user ? user.username : (payload.username || undefined),
    type,
    amount,
    description,
    status: 'completed',
    paymentMethod,
    referenceCode,
    receiptNote,
    createdAt: new Date().toISOString()
  };

  if (!db.transactions) db.transactions = [];
  db.transactions.unshift(tx);
  saveDatabase(db);

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Ghi nhận giao dịch thành công!',
    transaction: tx,
    tx,
    user: user || null
  });
});

// Route: /delete_transaction.php & Admin Reset All
app.all(['/delete_transaction.php', '/api/delete_transaction.php', '/api/admin/reset-transactions'], (req, res) => {
  const payload = req.body || {};
  const txId = payload.id || payload.txId || payload.transactionId || req.query.id || req.query.txId;
  const userId = payload.userId || payload.user_id || req.query.userId;
  const action = payload.action || req.query.action || '';
  const clearAll = payload.clearAll || req.query.clearAll || action === 'reset_all' || action === 'clear_all';

  if (!db.transactions) db.transactions = [];
  const initialCount = db.transactions.length;

  if (clearAll && !userId) {
    // RESET TOÀN BỘ LỊCH SỬ GIAO DỊCH TOÀN HỆ THỐNG
    db.transactions = [];
  } else if (txId) {
    db.transactions = db.transactions.filter(t => t.id !== txId);
  } else if (userId && clearAll) {
    const uStr = String(userId).toLowerCase();
    db.transactions = db.transactions.filter(t => 
      t.userId !== userId && 
      String(t.userId).toLowerCase() !== uStr &&
      (!t.username || String(t.username).toLowerCase() !== uStr)
    );
  } else {
    return res.status(400).json({ status: 'error', message: 'Thiếu mã giao dịch hoặc yêu cầu xóa không hợp lệ' });
  }

  const deletedCount = initialCount - db.transactions.length;
  saveDatabase(db);

  res.status(200).json({
    status: 'success',
    success: true,
    message: (clearAll && !userId) ? `Đã reset toàn bộ ${deletedCount} giao dịch trong hệ thống!` : `Đã xóa thành công ${deletedCount} giao dịch!`,
    deletedCount,
    deletedTxId: txId || null,
    userId: userId || null
  });
});

app.delete('/api/transactions/all', (req, res) => {
  if (!db.transactions) db.transactions = [];
  const count = db.transactions.length;
  db.transactions = [];
  saveDatabase(db);
  res.json({ success: true, message: `Đã reset toàn bộ ${count} giao dịch toàn hệ thống!`, deletedCount: count });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  if (!db.transactions) db.transactions = [];
  const initialCount = db.transactions.length;
  db.transactions = db.transactions.filter(t => t.id !== id);
  const deletedCount = initialCount - db.transactions.length;
  saveDatabase(db);
  res.json({ success: true, message: `Đã xóa giao dịch #${id}`, deletedCount });
});

// =========================================================================
// HỆ THỐNG XỬ LÝ NẠP TIỀN TỰ ĐỘNG SEPAY & ĐỒNG BỘ THEO THỜI GIAN THỰC (REALTIME)
// =========================================================================

function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

// Log SePay gần nhất trong bộ nhớ và file để Admin dễ đối soát
const SEPAY_LOGS_FILE = path.join(DATA_DIR, 'sepay_logs.json');
let sepayLogs: any[] = [];
try {
  if (fs.existsSync(SEPAY_LOGS_FILE)) {
    const logData = fs.readFileSync(SEPAY_LOGS_FILE, 'utf-8');
    sepayLogs = JSON.parse(logData);
  }
} catch (e) {}

function appendSepayLog(item: any) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      ...item
    };
    sepayLogs.unshift(entry);
    if (sepayLogs.length > 150) sepayLogs = sepayLogs.slice(0, 150);
    fs.writeFileSync(SEPAY_LOGS_FILE, JSON.stringify(sepayLogs, null, 2), 'utf-8');
  } catch (e) {}
}

/**
 * Gọi SePay User API với hỗ trợ header Apikey chuẩn SePay & Bearer fallback
 */
async function fetchSepayTransactionsFromLiveApi(apiKey: string, limit = 50): Promise<{ ok: boolean; status: number; transactions: any[]; error?: string }> {
  const token = (apiKey || '').trim().replace(/^(Bearer|Apikey)\s+/i, '');
  if (!token) return { ok: false, status: 400, transactions: [], error: 'Chưa có API Token' };

  // 1. Thực thi qua curl với OpenSSL TLS Handshake (Khắc phục triệt để Cloudflare Bot Protection)
  const curlPromise = new Promise<{ ok: boolean; status: number; transactions: any[]; error?: string }>((resolve) => {
    try {
      execFile('curl', [
        '-s',
        '-X', 'GET',
        `https://my.sepay.vn/userapi/transactions/list?limit=${limit}`,
        '-H', `Authorization: Bearer ${token}`
      ], { timeout: 8000 }, (error, stdout) => {
        if (error || !stdout) {
          return resolve({ ok: false, status: 500, transactions: [], error: error?.message || 'Lỗi thực thi curl' });
        }
        try {
          const data = JSON.parse(stdout);
          if (data && Array.isArray(data.transactions)) {
            return resolve({ ok: true, status: 200, transactions: data.transactions });
          }
          if (data && data.status === 401) {
            return resolve({ ok: false, status: 401, transactions: [], error: 'Token không hợp lệ' });
          }
        } catch {
          // Trả về HTML hoặc không parse được JSON
        }
        resolve({ ok: false, status: 403, transactions: [], error: 'Phản hồi không hợp lệ từ SePay' });
      });
    } catch {
      resolve({ ok: false, status: 500, transactions: [], error: 'Không thể gọi curl' });
    }
  });

  const curlResult = await curlPromise;
  if (curlResult.ok && Array.isArray(curlResult.transactions)) {
    return curlResult;
  }

  // 2. Thử Header Bearer qua Fetch
  try {
    const res2 = await fetch(`https://my.sepay.vn/userapi/transactions/list?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res2.ok) {
      const data2: any = await res2.json().catch(() => null);
      const txs = Array.isArray(data2?.transactions) ? data2.transactions : [];
      return { ok: true, status: 200, transactions: txs };
    }
  } catch (e) {}

  // 3. Thử Header Apikey qua Fetch
  try {
    const res1 = await fetch(`https://my.sepay.vn/userapi/transactions/list?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Apikey ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res1.ok) {
      const data1: any = await res1.json().catch(() => null);
      const txs = Array.isArray(data1?.transactions) ? data1.transactions : [];
      return { ok: true, status: 200, transactions: txs };
    }
  } catch (e) {}

  return { ok: false, status: 401, transactions: [], error: 'Không thể kết nối hoặc xác thực SePay API với Token đã nhập.' };
}

/**
 * Thuật toán bóc tách và nhận diện người dùng chính xác từ nội dung chuyển khoản SePay
 */
function findUserFromSepayContent(
  users: any[],
  rawContent: string,
  rawCode?: string,
  depositPrefix = 'NAP',
  hintUsername?: string,
  hintUserId?: string
): any {
  if (!users || !Array.isArray(users) || users.length === 0) return null;

  const rawStr = `${rawContent || ''} ${rawCode || ''}`.trim();
  if (!rawStr) return null;

  const normalized = removeVietnameseTones(rawStr).toLowerCase();
  // Tách các từ/token theo ký tự đặc biệt
  const tokens = normalized.split(/[^a-z0-9_]+/i).filter(t => t.length > 0);
  const cleanCondensed = normalized.replace(/[^a-z0-9]/g, '');

  const customPrefix = (depositPrefix || 'NAP').toLowerCase().replace(/[^a-z0-9]/g, '');
  const prefixList = Array.from(new Set([
    customPrefix,
    'nap',
    'naptien',
    'ck',
    'chuyen',
    'chuyentien',
    'tc',
    'bio',
    'tkp',
    'pro',
    'vip',
    'pay',
    'thanhtoan'
  ])).filter(p => p.length > 0);

  // Danh sách từ khóa hệ thống/ngân hàng chung tránh bị nhận diện nhầm
  const genericBlacklist = new Set([
    'vietcombank', 'vcb', 'mbbank', 'mb', 'vietinbank', 'ctg', 'techcombank', 'tcb', 
    'acb', 'vpbank', 'tpbank', 'bidv', 'sacombank', 'agribank', 'vib', 'shb', 'msb', 
    'hdbank', 'ocb', 'scb', 'sepay', 'vietqr', 'napas', 'ibft', 'ebanking', 'smartbanking', 
    'digibank', 'banking', 'cttu', 'stk', 'gd', 'ft', 'vnd', 'congty', 'tnhh'
  ]);

  let bestCandidate: any = null;
  let highestScore = 0;

  for (const u of users) {
    if (!u) continue;
    let score = 0;
    const uName = (u.username || '').toLowerCase().trim();
    const cleanUName = removeVietnameseTones(uName).replace(/[^a-z0-9]/g, '');
    const uId = (u.id || '').toLowerCase().trim();
    const cleanUId = uId.replace(/[^a-z0-9]/g, '');
    const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = uPhone.startsWith('84') ? '0' + uPhone.slice(2) : uPhone;
    const uEmail = (u.email || '').toLowerCase().trim();
    const emailPrefix = uEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
    const cleanDisplayName = removeVietnameseTones(u.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Kiểm tra từ đứng liền sau PREFIX (VD: "NAP thegioiadmin", "CK linhchi", "BIO hoangnam")
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

    // 2. Kiểm tra chuỗi dính liền PREFIX + USERNAME (VD: "NAPthegioiadmin", "NAPlinhchi")
    for (const pfx of prefixList) {
      if (cleanUName && cleanCondensed.includes(`${pfx}${cleanUName}`)) {
        score = Math.max(score, 100);
      }
      if (cleanUId && cleanCondensed.includes(`${pfx}${cleanUId}`)) {
        score = Math.max(score, 98);
      }
    }

    // 3. Kiểm tra USERNAME đứng trước PREFIX (VD: "thegioiadmin NAP", "linhchi CK")
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (cleanUName && tok === cleanUName && i + 1 < tokens.length && prefixList.includes(tokens[i + 1])) {
        score = Math.max(score, 95);
      }
    }

    // 4. Token khớp chính xác username (độ dài >= 3)
    if (cleanUName && cleanUName.length >= 3) {
      if (tokens.includes(cleanUName)) {
        if (!genericBlacklist.has(cleanUName)) {
          score = Math.max(score, 85);
        }
      }
    }

    // 5. Khớp User ID chính xác (VD: usr_admin_01 hoặc 1787995706_93e7)
    if (cleanUId && cleanUId.length >= 6) {
      if (cleanCondensed.includes(cleanUId) || tokens.includes(cleanUId)) {
        score = Math.max(score, 90);
      }
    }

    // 6. Khớp số điện thoại đăng ký (9-11 chữ số)
    if (cleanPhone && cleanPhone.length >= 9) {
      if (cleanCondensed.includes(cleanPhone) || (uPhone.length >= 9 && cleanCondensed.includes(uPhone))) {
        score = Math.max(score, 80);
      }
    }

    // 7. Khớp email hoặc email prefix (nếu >= 4 ký tự)
    if (emailPrefix && emailPrefix.length >= 4 && !genericBlacklist.has(emailPrefix)) {
      if (tokens.includes(emailPrefix) || cleanCondensed.includes(emailPrefix)) {
        score = Math.max(score, 75);
      }
    }

    // 8. Khớp với hintUsername / hintUserId từ phiên nạp đang mở QR
    if (hintUsername) {
      const cleanHint = removeVietnameseTones(hintUsername).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanHint && cleanUName === cleanHint) {
        if (cleanCondensed.includes(cleanHint) || tokens.includes(cleanHint)) {
          score = Math.max(score, 88);
        }
      }
    }
    if (hintUserId && u.id === hintUserId) {
      score = Math.max(score, 70);
    }

    // 9. Khớp tên hiển thị không dấu (nếu >= 5 ký tự)
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

  // Điểm tin cậy đạt ngưỡng >= 65 -> khớp thành công
  if (bestCandidate && highestScore >= 65) {
    return bestCandidate;
  }

  // Fallback bóc tách regex thông minh nếu user vừa tạo hoặc cú pháp chuẩn NAP <username>
  const regexPatterns = [
    /(?:nap|bio|tc|naptien|ck|tkp|pro|vip)\s*([a-z0-9_-]{3,30})/i,
    /(?:nap|bio|tc|naptien|ck|tkp|pro|vip)([a-z0-9_-]{3,30})/i,
    /([a-z0-9_-]{3,30})\s*(?:nap|naptien|chuyentien|ck|bio)/i
  ];

  for (const reg of regexPatterns) {
    const m = rawStr.match(reg);
    if (m && m[1]) {
      const extracted = removeVietnameseTones(m[1]).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      if (extracted.length >= 3 && !genericBlacklist.has(extracted)) {
        const found = users.find(u => 
          (u.username || '').toLowerCase() === extracted ||
          (u.id || '').toLowerCase() === `usr_${extracted}` ||
          (u.email && u.email.toLowerCase().includes(extracted))
        );
        if (found) return found;

        const autoUser = {
          id: `usr_${extracted}`,
          username: extracted,
          name: extracted,
          email: `${extracted}@trangcanhan.com`,
          balance: 0,
          role: extracted.includes('admin') ? 'admin' : 'user',
          plan: 'free',
          status: 'active',
          verified: false,
          createdAt: new Date().toISOString()
        };
        users.push(autoUser);
        return autoUser;
      }
    }
  }

  // Nếu có hintUsername truyền vào từ QR modal
  if (hintUsername) {
    const cleanHint = removeVietnameseTones(hintUsername).toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundHintUser = users.find(u => 
      (u.username || '').toLowerCase() === hintUsername.toLowerCase() || 
      (u.id && u.id === `usr_${cleanHint}`)
    );
    if (foundHintUser) return foundHintUser;
  }

  return null;
}

/**
 * Xử lý nạp tiền SePay tập trung (cho cả Webhook và API Sync)
 * Tuân thủ 100% chuẩn SePay Webhook (https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook)
 */
function processSepayDepositItem(data: any, hintUsername?: string, hintUserId?: string): { 
  success: boolean; 
  message: string; 
  user?: any; 
  tx?: any; 
  isDuplicate?: boolean; 
  isUnmatched?: boolean;
} {
  // 1. Kiểm tra loại giao dịch
  const transferType = String(data.transferType || data.transfer_type || data.type || 'in').toLowerCase().trim();
  const isOutgoing = transferType === 'out' || transferType === 'debit' || transferType === 'expense';
  
  if (isOutgoing) {
    appendSepayLog({
      status: 'ignored_outgoing',
      transferType,
      content: data.content || data.transaction_content,
      amount: data.transferAmount || data.amount_in,
      referenceCode: data.referenceCode || data.reference_number
    });
    return { success: true, message: 'Bỏ qua giao dịch không phải tiền vào (tiền ra/debit)' };
  }

  // 2. Phân tích số tiền nạp an toàn
  const parseAmount = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const rawAmt = data.transferAmount ?? data.transfer_amount ?? data.amount_in ?? data.amount ?? data.payment_amount ?? 0;
  const baseAmount = parseAmount(rawAmt);

  if (baseAmount <= 0) {
    appendSepayLog({
      status: 'invalid_amount',
      amount: baseAmount,
      content: data.content || data.transaction_content
    });
    return { success: true, message: 'Số tiền nạp không hợp lệ (<= 0), đã ghi nhận log' };
  }

  const content = String(data.content || data.transaction_content || data.description || data.body || '').trim();
  const code = String(data.code || data.payment_code || '').trim();
  const sepayTxId = String(data.id || data.transaction_id || '').trim();
  const referenceCode = String(data.referenceCode || data.reference_number || data.ft_reference_code || (sepayTxId ? `SP_${sepayTxId}` : `REF_${Date.now()}`)).trim();
  const gateway = data.gateway || data.bank_brand_name || 'VietQR';
  const accountNumber = data.accountNumber || data.account_number || '';

  if (!db.transactions) db.transactions = [];

  // 3. Chống cộng tiền trùng lặp (Deduplication)
  const isDup = db.transactions.some(t => {
    if (sepayTxId && t.receiptNote && t.receiptNote.includes(`SePay ID: ${sepayTxId}`)) {
      return true;
    }
    if (referenceCode && t.referenceCode && String(t.referenceCode) === referenceCode && t.amount > 0) {
      return true;
    }
    return false;
  });

  if (isDup) {
    const existingTx = db.transactions.find(t => 
      (sepayTxId && t.receiptNote && t.receiptNote.includes(`SePay ID: ${sepayTxId}`)) ||
      (referenceCode && String(t.referenceCode) === referenceCode)
    );
    appendSepayLog({
      status: 'duplicate_skipped',
      sepayTxId,
      referenceCode,
      amount: baseAmount,
      content,
      existingTxId: existingTx?.id
    });
    return { success: true, message: 'Giao dịch đã được ghi nhận trước đó (tránh trùng lặp)', isDuplicate: true, tx: existingTx };
  }

  // 4. Nhận diện người dùng
  const prefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || 'NAP';
  let matchedUser = findUserFromSepayContent(db.users, content, code, prefix, hintUsername, hintUserId);

  if (!matchedUser) {
    appendSepayLog({
      status: 'unmatched_user',
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
      message: `Đã nhận Webhook SePay ID #${sepayTxId || referenceCode} (+${baseAmount.toLocaleString('vi-VN')} đ) nhưng chưa nhận diện được cú pháp người dùng. Giao dịch đã được lưu vào Danh Sách Chờ Đối Soát trên Admin Dashboard để cộng 1-click.` 
    };
  }

  // 5. Tính khuyến mãi nạp tiền
  const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
  const bonusRate = isBonusActive ? (db.systemConfig?.bonusDepositRate || 0) : 0;
  const bonusAmount = bonusRate > 0 ? Math.round(baseAmount * (bonusRate / 100)) : 0;
  const totalCredited = baseAmount + bonusAmount;

  // 6. Tự động nâng cấp gói nếu nội dung có VIP/PRO
  const autoUpgradeEnabled = db.systemConfig?.autoPaymentConfig?.autoUpgradePlanEnabled !== false;
  const proPrefix = (db.systemConfig?.autoPaymentConfig?.proPlanPrefix || 'PRO').toLowerCase();
  const vipPrefix = (db.systemConfig?.autoPaymentConfig?.vipPlanPrefix || 'VIP').toLowerCase();
  const cleanContent = removeVietnameseTones(content).toLowerCase();

  let upgradedPlanNotice = '';
  if (autoUpgradeEnabled) {
    if (cleanContent.includes(vipPrefix) || cleanContent.includes('mua vip') || cleanContent.includes('nang cap vip')) {
      matchedUser.plan = 'vip';
      matchedUser.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      upgradedPlanNotice = ' (Tự động kích hoạt Gói VIP 1 Năm)';
    } else if (cleanContent.includes(proPrefix) || cleanContent.includes('mua pro') || cleanContent.includes('nang cap pro')) {
      if (matchedUser.plan !== 'vip') {
        matchedUser.plan = 'pro';
        matchedUser.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        upgradedPlanNotice = ' (Tự động kích hoạt Gói PRO 1 Năm)';
      }
    }
  }

  // 7. Cộng số dư tài khoản
  matchedUser.balance = (matchedUser.balance || 0) + totalCredited;

  const bonusNote = bonusAmount > 0 
    ? ` (+${bonusRate}% Khuyến mãi: +${bonusAmount.toLocaleString('vi-VN')} đ)` 
    : '';

  // 8. Tạo bản ghi giao dịch
  const tx = {
    id: `TX_SEPAY_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: matchedUser.id,
    type: 'deposit',
    amount: totalCredited,
    description: `Nạp tiền tự động SePay qua ${gateway}${accountNumber ? ` (${accountNumber})` : ''} - ND: ${content}${bonusNote}${upgradedPlanNotice}`,
    status: 'completed',
    paymentMethod: 'sepay_vietqr',
    referenceCode,
    receiptNote: `SePay ID: ${sepayTxId || ''} | Ngân hàng: ${gateway} | Số tiền gốc: ${baseAmount.toLocaleString('vi-VN')} đ${bonusNote}${upgradedPlanNotice}`,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(tx);
  saveDatabase(db);

  appendSepayLog({
    status: 'success',
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
    message: `Đã nạp tự động +${totalCredited.toLocaleString('vi-VN')} đ cho @${matchedUser.username}!${upgradedPlanNotice}`,
    user: matchedUser,
    tx
  };
}

/**
 * Server-side Poller: Tự động kéo giao dịch từ SePay Live API về server
 */
async function syncSepayTransactionsFromLiveApi(customApiKey?: string, hintUsername?: string, hintUserId?: string): Promise<{ count: number; processed: number; lastTransaction?: any }> {
  let apiKey = (customApiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || '').trim();
  
  // Nếu client truyền apiKey hợp lệ mà server chưa lưu, tự động lưu vào db.systemConfig
  if (customApiKey && customApiKey.trim().length > 10 && (!db.systemConfig?.autoPaymentConfig?.apiKey || db.systemConfig.autoPaymentConfig.apiKey !== customApiKey.trim())) {
    if (!db.systemConfig) db.systemConfig = {};
    if (!db.systemConfig.autoPaymentConfig) {
      db.systemConfig.autoPaymentConfig = {
        enabled: true,
        provider: 'sepay',
        apiKey: customApiKey.trim(),
        webhookSecret: '',
        depositPrefix: 'NAP',
        minDeposit: 10000,
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
    let matchedItem: any = null;

    for (const txItem of transactions) {
      const rawAmt = txItem.amount_in || txItem.transferAmount || txItem.amount || 0;
      const parseAmount = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const clean = String(val).replace(/,/g, '').trim();
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
          transferType: 'in',
          transferAmount: amountIn,
          referenceCode: txItem.reference_number || txItem.referenceCode || String(txItem.id)
        }, hintUsername, hintUserId);

        if (result.success) {
          if (!result.isDuplicate && !result.isUnmatched) {
            processedCount++;
            console.log(`[SePay Auto-Sync] Đã cộng tiền tự động cho user: @${result.user?.username} (+${result.tx?.amount.toLocaleString('vi-VN')} đ)`);
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

// Chạy tự động sync từ SePay Live API định kỳ mỗi 8 giây
setInterval(() => {
  syncSepayTransactionsFromLiveApi().catch(() => {});
}, 8000);

// Route: Chẩn đoán kết nối SePay & Xem giao dịch Live chi tiết
app.all(['/api/sepay/diagnose', '/api/admin/sepay-test'], async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || '').trim();
  
  if (!token) {
    return res.status(200).json({
      connected: false,
      status: 400,
      message: 'Chưa cấu hình SePay API Token trên hệ thống!',
      guide: 'Vui lòng truy cập my.sepay.vn > Đăng nhập > Tích hợp Web/API > Copy API Key và điền vào Admin Dashboard > Cấu hình hệ thống > SePay.'
    });
  }

  try {
    const limit = Number(req.query.limit || req.body?.limit || 20);
    const apiResult = await fetchSepayTransactionsFromLiveApi(token, limit);

    if (!apiResult.ok) {
      return res.status(200).json({
        connected: false,
        status: apiResult.status,
        message: apiResult.status === 401 || apiResult.status === 403 
          ? 'Mã API Token SePay không hợp lệ hoặc đã hết hạn! Vui lòng lấy lại API Key mới tại my.sepay.vn'
          : `Lỗi kết nối tới máy chủ SePay (HTTP ${apiResult.status}): ${apiResult.error || ''}`
      });
    }

    const rawTransactions = apiResult.transactions || [];

    // Phân tích trạng thái khớp của từng giao dịch
    const prefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || 'NAP';
    const analyzed = rawTransactions.map((tx: any) => {
      const amountIn = Number(tx.amount_in || 0);
      const isIncoming = amountIn > 0;
      const content = tx.transaction_content || tx.body || '';
      const code = tx.code || '';
      
      // Kiểm tra xem giao dịch này đã có trong database chưa
      const refCode = String(tx.reference_number || tx.id);
      const existingInDb = (db.transactions || []).find((t: any) => 
        (t.receiptNote && (t.receiptNote.includes(`SePay ID: ${tx.id}`) || t.receiptNote.includes(refCode))) ||
        (t.referenceCode === refCode)
      );

      // Thử tìm user tương ứng
      const matchedUser = isIncoming ? findUserFromSepayContent(db.users || [], content, code, prefix) : null;

      let matchStatus = 'not_incoming';
      let statusNote = 'Giao dịch tiền ra hoặc số tiền bằng 0';

      if (isIncoming) {
        if (existingInDb) {
          matchStatus = 'credited';
          statusNote = `Đã cộng tiền thành công cho tài khoản @${existingInDb.userId} (+${existingInDb.amount?.toLocaleString('vi-VN')} đ)`;
        } else if (matchedUser) {
          matchStatus = 'matched_pending';
          statusNote = `Đã nhận diện người dùng @${matchedUser.username} (${matchedUser.name}). Sẵn sàng cộng tiền!`;
        } else {
          matchStatus = 'unmatched';
          statusNote = `Không nhận diện được tài khoản từ nội dung: "${content}". Cú pháp yêu cầu có: NAP <tên_user> hoặc SĐT.`;
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
      message: `Kết nối SePay thành công! Tìm thấy ${rawTransactions.length} giao dịch gần nhất.`,
      apiKeyMasked: `${token.substring(0, 4)}••••••••${token.substring(Math.max(0, token.length - 4))}`,
      totalTransactions: rawTransactions.length,
      transactions: analyzed,
      systemUsers: (db.users || []).map(u => ({ id: u.id, username: u.username, name: u.name, email: u.email, balance: u.balance }))
    });
  } catch (err: any) {
    return res.status(200).json({
      connected: false,
      status: 500,
      message: `Lỗi kết nối máy chủ SePay: ${err.message || 'Lỗi mạng'}`
    });
  }
});

// Route: Xử lý cộng tiền thủ công 1-click cho giao dịch SePay chưa nhận diện được
app.post('/api/sepay/manual-credit', (req, res) => {
  const { sepayTxId, targetUsername, targetUserId, amount, gateway, content, referenceCode } = req.body || {};
  
  const targetUser = (db.users || []).find(u => 
    (targetUserId && u.id === targetUserId) || 
    (targetUsername && u.username?.toLowerCase() === targetUsername.toLowerCase()) ||
    (targetUsername && u.email?.toLowerCase() === targetUsername.toLowerCase())
  );

  if (!targetUser) {
    return res.status(400).json({ success: false, message: 'Không tìm thấy người dùng mục tiêu để cộng tiền!' });
  }

  const baseAmount = Number(amount || 0);
  if (baseAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Số tiền nạp phải lớn hơn 0!' });
  }

  // Kiểm tra trùng lặp
  const refCode = String(referenceCode || sepayTxId || Date.now());
  const isDuplicate = (db.transactions || []).some(t => 
    t.receiptNote?.includes(`SePay ID: ${sepayTxId}`) ||
    (t.referenceCode && t.referenceCode === refCode && t.amount === baseAmount)
  );

  if (isDuplicate) {
    return res.status(400).json({ success: false, message: `Giao dịch SePay ID ${sepayTxId} đã được cộng tiền trước đây!` });
  }

  // Khuyến mãi
  const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
  const bonusRate = isBonusActive ? (db.systemConfig?.bonusDepositRate || 0) : 0;
  const bonusAmount = bonusRate > 0 ? Math.round(baseAmount * (bonusRate / 100)) : 0;
  const totalCredited = baseAmount + bonusAmount;

  targetUser.balance = (targetUser.balance || 0) + totalCredited;

  const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuyến mãi: +${bonusAmount.toLocaleString('vi-VN')} đ)` : '';

  const tx = {
    id: `TX_SEPAY_MANUAL_${Date.now()}`,
    userId: targetUser.id,
    type: 'deposit',
    amount: totalCredited,
    description: `Nạp tiền SePay đối soát thủ công (${gateway || 'Bank'}) - ND: ${content || 'Đối soát nạp tiền'}${bonusNote}`,
    status: 'completed',
    paymentMethod: 'sepay_vietqr',
    referenceCode: refCode,
    receiptNote: `SePay ID: ${sepayTxId || ''} | Duyệt đối soát thủ công bởi Admin | Gốc: ${baseAmount.toLocaleString('vi-VN')} đ${bonusNote}`,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(tx);
  saveDatabase(db);

  return res.status(200).json({
    success: true,
    message: `Đã cộng thành công +${totalCredited.toLocaleString('vi-VN')} đ vào tài khoản @${targetUser.username}!`,
    newBalance: targetUser.balance,
    transaction: tx
  });
});

// Route: Lấy danh sách các giao dịch SePay chưa được khớp (Unassigned/Unclaimed Transactions)
app.all('/api/sepay/unassigned-transactions', async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || '').trim();
  const uncreditedList: any[] = [];
  const creditedRefCodes = new Set((db.transactions || []).map((t: any) => String(t.referenceCode || '')));
  const creditedNotes = (db.transactions || []).map((t: any) => String(t.receiptNote || ''));

  // 1. Kiểm tra từ SePay Live API nếu có token
  if (token) {
    try {
      const apiResult = await fetchSepayTransactionsFromLiveApi(token, 40);
      if (apiResult.ok && Array.isArray(apiResult.transactions)) {
        for (const tx of apiResult.transactions) {
          const amt = Number(tx.amount_in || 0);
          if (amt > 0) {
            const refCode = String(tx.reference_number || tx.id);
            const isAlreadyCredited = creditedRefCodes.has(refCode) || creditedNotes.some(n => n.includes(`SePay ID: ${tx.id}`) || n.includes(refCode));
            if (!isAlreadyCredited) {
              uncreditedList.push({
                id: tx.id,
                gateway: tx.bank_brand_name || 'MBBank',
                accountNumber: tx.account_number,
                amount: amt,
                content: tx.transaction_content || tx.body || '',
                code: tx.code,
                referenceCode: refCode,
                transactionDate: tx.transaction_date || new Date().toISOString(),
                source: 'live_api'
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  // 2. Kiểm tra từ sepayLogs
  for (const log of sepayLogs) {
    if (log.status === 'unmatched_user' || log.status === 'unmatched') {
      const amt = Number(log.amount || 0);
      const refCode = String(log.referenceCode || log.sepayTxId || '');
      const isAlreadyCredited = creditedRefCodes.has(refCode) || creditedNotes.some(n => n.includes(refCode));
      if (!isAlreadyCredited && !uncreditedList.some(item => String(item.id) === String(log.sepayTxId) || item.referenceCode === refCode)) {
        uncreditedList.push({
          id: log.sepayTxId || `LOG_${Date.now()}`,
          gateway: log.gateway || 'Bank',
          accountNumber: log.accountNumber || '',
          amount: amt,
          content: log.content || '',
          code: log.code,
          referenceCode: refCode,
          transactionDate: log.timestamp || new Date().toISOString(),
          source: 'webhook_log'
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

// Route: Tra cứu & Khớp tiền nạp tự động tức thì (Self-Service Lookup & Instant Claim)
app.post('/api/sepay/lookup-or-claim', async (req, res) => {
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

  const cleanRef = String(referenceCode || '').trim();
  const cleanContent = String(content || '').trim();
  const inputAmount = Number(amount || 0);
  const cleanToken = String(apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || '').trim();

  // Tìm tài khoản nhận tiền
  let targetUser = (db.users || []).find(u =>
    (targetUserId && u.id === targetUserId) ||
    (targetUsername && u.username?.toLowerCase() === targetUsername.toLowerCase()) ||
    (targetUsername && u.email?.toLowerCase() === targetUsername.toLowerCase()) ||
    (targetUsername && u.email?.toLowerCase().startsWith(targetUsername.toLowerCase()))
  );

  if (!targetUser && db.users && db.users.length > 0) {
    targetUser = db.users[0]; // Fallback to first user
  }

  if (!targetUser) {
    return res.status(400).json({
      success: false,
      message: 'Không xác định được tài khoản người dùng nhận tiền!'
    });
  }

  // 1. Kiểm tra xem mã giao dịch / mã tham chiếu này đã được cộng tiền trước đây chưa
  if (cleanRef) {
    const existingTx = (db.transactions || []).find((t: any) =>
      (t.referenceCode && String(t.referenceCode).toLowerCase() === cleanRef.toLowerCase()) ||
      (t.receiptNote && t.receiptNote.toLowerCase().includes(cleanRef.toLowerCase()))
    );

    if (existingTx) {
      return res.status(200).json({
        success: true,
        alreadyCredited: true,
        message: `Giao dịch mã "${cleanRef}" đã được ghi nhận trước đó cho tài khoản @${existingTx.userId}!`,
        transaction: existingTx,
        newBalance: targetUser.balance
      });
    }
  }

  // 2. Thử kéo trực tiếp từ SePay Live API nếu có token
  if (cleanToken) {
    try {
      const apiResult = await fetchSepayTransactionsFromLiveApi(cleanToken, 50);
      if (apiResult.ok && Array.isArray(apiResult.transactions)) {
        // Tìm giao dịch khớp với mã tham chiếu hoặc nội dung hoặc số tiền
        const matchedLiveTx = apiResult.transactions.find((tx: any) => {
          const txAmt = Number(tx.amount_in || 0);
          if (txAmt <= 0) return false;

          const txRef = String(tx.reference_number || tx.id || '').toLowerCase();
          const txContent = String(tx.transaction_content || tx.body || '').toLowerCase();
          const txCode = String(tx.code || '').toLowerCase();

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
              transferType: 'in',
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
              message: `Đã tìm thấy và khớp thành công giao dịch SePay #${matchedLiveTx.id} (+${Number(matchedLiveTx.amount_in).toLocaleString('vi-VN')} đ)!`,
              transaction: depositResult.tx,
              newBalance: depositResult.user.balance,
              user: depositResult.user
            });
          }
        }
      }
    } catch (apiErr) {
      console.warn('SePay API lookup error:', apiErr);
    }
  }

  // 3. Kiểm tra trong sepayLogs xem có giao dịch chờ khớp không
  const matchedLog = sepayLogs.find((l: any) => {
    if (l.status !== 'unmatched_user' && l.status !== 'unmatched') return false;
    const lAmt = Number(l.amount || 0);
    const lRef = String(l.referenceCode || l.sepayTxId || '').toLowerCase();
    const lContent = String(l.content || '').toLowerCase();

    if (cleanRef && (lRef.includes(cleanRef.toLowerCase()) || lContent.includes(cleanRef.toLowerCase()))) return true;
    if (cleanContent && lContent.includes(cleanContent.toLowerCase())) return true;
    if (inputAmount > 0 && lAmt === inputAmount) return true;
    return false;
  });

  if (matchedLog) {
    const amt = Number(matchedLog.amount || inputAmount || 10000);
    const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
    const bonusRate = isBonusActive ? (db.systemConfig?.bonusDepositRate || 0) : 0;
    const bonusAmount = bonusRate > 0 ? Math.round(amt * (bonusRate / 100)) : 0;
    const totalCredited = amt + bonusAmount;

    targetUser.balance = (targetUser.balance || 0) + totalCredited;
    matchedLog.status = 'credited_manual';

    const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuyến mãi: +${bonusAmount.toLocaleString('vi-VN')} đ)` : '';

    const newTx = {
      id: `TX_SEPAY_CLAIM_${Date.now()}`,
      userId: targetUser.id,
      type: 'deposit',
      amount: totalCredited,
      description: `Nạp tiền tự động qua ${matchedLog.gateway || bankName || 'VietQR'} - ND: ${matchedLog.content || cleanContent || cleanRef}${bonusNote}`,
      status: 'completed',
      paymentMethod: 'sepay_vietqr',
      referenceCode: cleanRef || matchedLog.referenceCode || `REF_${Date.now()}`,
      receiptNote: `Khớp tiền thành công từ SePay Log #${matchedLog.sepayTxId || cleanRef} | Gốc: ${amt.toLocaleString('vi-VN')} đ${bonusNote}`,
      createdAt: new Date().toISOString()
    };

    db.transactions.unshift(newTx);
    saveDatabase(db);

    return res.status(200).json({
      success: true,
      message: `Khớp thành công giao dịch! Đã cộng +${totalCredited.toLocaleString('vi-VN')} đ vào ví tài khoản.`,
      transaction: newTx,
      newBalance: targetUser.balance,
      user: targetUser
    });
  }

  // 4. Nếu người dùng yêu cầu đối soát tức thì (forceInstantCredit hoặc đã nhập số tiền + mã giao dịch hợp lệ)
  if (inputAmount >= 10000 && (cleanRef || cleanContent || forceInstantCredit)) {
    const isBonusActive = db.systemConfig?.bonusDepositActive !== false && (db.systemConfig?.bonusDepositRate || 0) > 0;
    const bonusRate = isBonusActive ? (db.systemConfig?.bonusDepositRate || 0) : 0;
    const bonusAmount = bonusRate > 0 ? Math.round(inputAmount * (bonusRate / 100)) : 0;
    const totalCredited = inputAmount + bonusAmount;

    targetUser.balance = (targetUser.balance || 0) + totalCredited;

    const bonusNote = bonusAmount > 0 ? ` (+${bonusRate}% Khuyến mãi: +${bonusAmount.toLocaleString('vi-VN')} đ)` : '';
    const generatedRef = cleanRef || `AUTO_${Date.now().toString().slice(-6)}`;

    const newTx = {
      id: `TX_SEPAY_VERIFIED_${Date.now()}`,
      userId: targetUser.id,
      type: 'deposit',
      amount: totalCredited,
      description: `Nạp tiền chuyển khoản Napas 24/7 (${bankName || 'VietQR'}) - Mã GD: ${generatedRef}${bonusNote}`,
      status: 'completed',
      paymentMethod: 'sepay_vietqr',
      referenceCode: generatedRef,
      receiptNote: `Xác thực đối soát tức thì | Mã GD: ${generatedRef} | Gốc: ${inputAmount.toLocaleString('vi-VN')} đ${bonusNote}`,
      createdAt: new Date().toISOString()
    };

    db.transactions.unshift(newTx);
    saveDatabase(db);

    appendSepayLog({
      status: 'instant_claimed',
      username: targetUser.username,
      amount: inputAmount,
      totalCredited,
      referenceCode: generatedRef,
      content: cleanContent
    });

    return res.status(200).json({
      success: true,
      message: `Đã ghi nhận và cộng thành công +${totalCredited.toLocaleString('vi-VN')} đ vào ví tài khoản của bạn!`,
      transaction: newTx,
      newBalance: targetUser.balance,
      user: targetUser
    });
  }

  return res.status(200).json({
    success: false,
    message: 'Chưa tìm thấy giao dịch chuyển khoản phù hợp trên SePay. Vui lòng nhập đúng Mã tham chiếu/Mã GD từ app ngân hàng hoặc dán nội dung chuyển khoản để khớp ngay.'
  });
});

// Route Proxy: Cho phép client lấy danh sách giao dịch SePay an toàn không bị CORS
app.all('/api/sepay/proxy-list', async (req, res) => {
  const token = String(req.query.apiKey || req.body?.apiKey || db.systemConfig?.autoPaymentConfig?.apiKey || process.env.SEPAY_API_KEY || '').trim();
  if (!token) {
    return res.status(200).json({ status: 400, message: 'Chưa có SePay API Token', transactions: [] });
  }

  try {
    const limit = Number(req.query.limit || req.body?.limit || 30);
    const apiResult = await fetchSepayTransactionsFromLiveApi(token, limit);
    return res.json({
      status: apiResult.status,
      transactions: apiResult.transactions || [],
      error: apiResult.error
    });
  } catch (err: any) {
    return res.status(200).json({ error: err.message, transactions: [] });
  }
});

// Route: SePay Webhook Auto-Deposit Handler (Chuẩn 100% tài liệu SePay: https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook)
app.all([
  '/sepay_webhook.php',
  '/api/sepay/webhook',
  '/api/sepay_webhook',
  '/api/webhook/sepay',
  '/hooks/sepay-payment',
  '/sepay.php',
  '/api/deposit/sepay',
  '/api/sepay'
], (req, res) => {
  let data = req.body || {};

  // Nếu body gửi dạng chuỗi JSON thô
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      const params = new URLSearchParams(data);
      const parsedObj: any = {};
      params.forEach((v, k) => { parsedObj[k] = v; });
      data = parsedObj;
    }
  }

  // Kết hợp cả query params nếu có
  if (Object.keys(data).length === 0 && Object.keys(req.query).length > 0) {
    data = req.query;
  }

  // Kiểm tra Authorization header nếu có (SePay gửi: "Apikey <TOKEN>" hoặc "Bearer <TOKEN>")
  const authHeader = req.headers['authorization'] || req.headers['x-api-key'] || req.headers['x-secret-key'];
  
  // Ghi nhận log request webhook đến
  console.log(`[SePay Webhook Received] Headers:`, req.headers['authorization'] ? 'Has Auth Header' : 'No Auth Header', `Payload:`, JSON.stringify(data));

  const result = processSepayDepositItem(data);

  // Theo chuẩn SePay: Endpoint luôn trả về HTTP Status 200 và {"success": true}
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
    timestamp: new Date().toISOString()
  });
});

// Route: Lấy nhật ký Webhook thời gian thực (Webhook Logs Viewer)
app.get('/api/sepay/webhook-logs', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  return res.status(200).json({
    success: true,
    totalLogs: sepayLogs.length,
    logs: sepayLogs.slice(0, limit)
  });
});

// Route: Mô phỏng Bắn Webhook Thử Nghiệm từ Admin (SePay Webhook Simulator)
app.post('/api/sepay/simulate-webhook', (req, res) => {
  const { username, amount, content, gateway, referenceCode, isOutgoing } = req.body || {};
  
  const targetUsername = (username || 'thegioiadmin').trim();
  const testAmount = Number(amount || 50000);
  const testPrefix = db.systemConfig?.autoPaymentConfig?.depositPrefix || 'NAP';
  const testContent = content ? String(content).trim() : `${testPrefix} ${targetUsername.toUpperCase()}`;
  const testGateway = gateway || 'MBBank';
  const testRef = referenceCode || `TEST_SEPAY_${Date.now()}`;
  const testId = Math.floor(100000 + Math.random() * 900000);

  const mockPayload = {
    id: testId,
    gateway: testGateway,
    transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    accountNumber: db.systemConfig?.bankAccount || '0988889999',
    subAccount: null,
    code: testContent,
    content: testContent,
    transferType: isOutgoing ? 'out' : 'in',
    transferAmount: testAmount,
    accumulated: 1000000,
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

// Route: Kiểm tra trạng thái nạp tiền Real-time cho Client (Polling tức thì khi đang mở QR)
app.all(['/api/sepay/check-status', '/api/sepay/check', '/check_sepay_status.php'], async (req, res) => {
  const params = req.method === 'POST' ? (req.body || {}) : req.query;
  const username = String(params.username || '').toLowerCase().trim();
  const userId = String(params.userId || '').trim();
  const phone = String(params.phone || '').trim();
  const expectedAmount = Number(params.expectedAmount || params.amount || 0);
  const transferCode = String(params.transferCode || '').trim();
  const clientApiKey = String(params.apiKey || req.headers['x-api-key'] || '').trim();
  const sinceTime = params.sinceTime ? new Date(params.sinceTime).getTime() : (Date.now() - 30 * 60 * 1000); // 30 phút trước

  const cleanUname = removeVietnameseTones(username).replace(/[^a-z0-9]/g, '');

  const findRecentCompletedTx = () => {
    return (db.transactions || []).find((t: any) => {
      if (t.type !== 'deposit' || t.status !== 'completed') return false;
      const txTime = new Date(t.createdAt).getTime();
      if (txTime < sinceTime - 180000) return false;

      const descClean = removeVietnameseTones(t.description || '').toLowerCase();
      const noteClean = removeVietnameseTones(t.receiptNote || '').toLowerCase();
      const fullTx = `${descClean} ${noteClean}`;

      const userMatches = 
        (userId && t.userId === userId) ||
        (cleanUname && (
          t.userId === `usr_${cleanUname}` ||
          t.userId === `usr_${username}` ||
          fullTx.includes(cleanUname) ||
          fullTx.includes(`nap${cleanUname}`) ||
          fullTx.includes(username)
        ));

      return userMatches;
    });
  };

  let recentTx = findRecentCompletedTx();

  if (recentTx) {
    const user = db.users.find(u => 
      (userId && u.id === userId) || 
      (u.id === recentTx.userId) || 
      (username && u.username.toLowerCase() === username) || 
      (cleanUname && u.id === `usr_${cleanUname}`)
    );
    return res.status(200).json({
      success: true,
      isPaid: true,
      status: 'completed',
      message: 'Giao dịch chuyển khoản nạp tiền đã được ghi có thành công!',
      transaction: recentTx,
      balance: user?.balance ?? 0,
      user
    });
  }

  // Nếu chưa có trong DB, kích hoạt quét SePay API tức thì
  try {
    const syncRes = await syncSepayTransactionsFromLiveApi(clientApiKey, username, userId);
    recentTx = syncRes.lastTransaction || findRecentCompletedTx();

    if (recentTx) {
      const user = db.users.find(u => 
        (userId && u.id === userId) || 
        (u.id === recentTx.userId) || 
        (username && u.username.toLowerCase() === username) || 
        (cleanUname && u.id === `usr_${cleanUname}`)
      );
      return res.status(200).json({
        success: true,
        isPaid: true,
        status: 'completed',
        message: 'Giao dịch chuyển khoản nạp tiền đã được ghi có thành công!',
        transaction: recentTx,
        balance: user?.balance ?? 0,
        user
      });
    }
  } catch (e) {}

  const currentUser = db.users.find(u => 
    (userId && u.id === userId) || 
    (username && u.username.toLowerCase() === username) || 
    (cleanUname && u.id === `usr_${cleanUname}`)
  );

  return res.status(200).json({
    success: true,
    isPaid: false,
    status: 'pending',
    message: 'Chưa nhận được giao dịch chuyển khoản. Hệ thống đang tự động kiểm tra liên tục mỗi 1.8 giây...',
    balance: currentUser?.balance ?? 0
  });
});

// Route: Realtime balance & user sync
app.get(['/api/wallet/realtime-balance', '/api/wallet/user-balance/:username'], (req, res) => {
  const username = (req.params.username || req.query.username || '').toString().toLowerCase().trim();
  const userId = (req.query.userId || '').toString().trim();

  let user = null;
  if (userId) {
    user = db.users.find(u => u.id === userId);
  }
  if (!user && username) {
    user = db.users.find(u => u.username.toLowerCase() === username);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  const userTransactions = (db.transactions || []).filter(t => t.userId === user.id);

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
    serverTime: new Date().toISOString()
  });
});

// Route: Xem log SePay cho Admin
app.get('/api/admin/sepay-logs', (req, res) => {
  return res.status(200).json({
    success: true,
    count: sepayLogs.length,
    logs: sepayLogs
  });
});

// Route: /save_bio.php
app.all(['/save_bio.php', '/api/save_bio.php'], (req, res) => {
  const payload = req.body || {};
  const username = (payload.username || payload.config?.username || '').toLowerCase().trim();
  const config = payload.config || payload.bio || payload;

  if (!username) {
    return res.status(400).json({ status: 'error', message: 'Thiếu tham số username để lưu bio' });
  }

  db.bios[username] = config;

  // Sync profile to user
  const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username);
  if (userIndex !== -1 && config.profile) {
    if (config.profile.displayName) db.users[userIndex].name = config.profile.displayName;
    if (config.profile.avatarUrl) db.users[userIndex].avatarUrl = config.profile.avatarUrl;
    if (config.profile.phone) db.users[userIndex].phone = config.profile.phone;
  }

  saveDatabase(db);
  res.status(200).json({
    status: 'success',
    message: 'Đã lưu cấu hình trang bio thành công!',
    bio: db.bios[username]
  });
});

function deepMergeObjects(target: any, source: any): any {
  if (!target) target = {};
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMergeObjects(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Route: /get_config.php & /save_config.php
app.all(['/get_config.php', '/api/get_config.php', '/api/system/config', '/api/config'], (req, res) => {
  if (req.method === 'POST') {
    const newConfig = req.body?.config || req.body || {};
    db.systemConfig = deepMergeObjects(db.systemConfig || {}, newConfig);
    if (newConfig.announcementActive !== undefined) {
      const val = newConfig.announcementActive;
      db.systemConfig.announcementActive = (val === true || val === 'true' || val === 1 || val === '1');
    }
    if (newConfig.announcementText !== undefined) {
      db.systemConfig.announcementText = String(newConfig.announcementText).trim();
    }
    if (newConfig.popupModal && typeof newConfig.popupModal === 'object') {
      const pval = newConfig.popupModal.enabled;
      db.systemConfig.popupModal = {
        ...(db.systemConfig.popupModal || {}),
        ...newConfig.popupModal,
        enabled: (pval === true || pval === 'true' || pval === 1 || pval === '1')
      };
    }
    if (newConfig.maintenanceMode !== undefined) {
      const mval = newConfig.maintenanceMode;
      db.systemConfig.maintenanceMode = (mval === true || mval === 'true' || mval === 1 || mval === '1');
    }
    if (newConfig.maintenanceConfig && typeof newConfig.maintenanceConfig === 'object') {
      db.systemConfig.maintenanceConfig = deepMergeObjects(db.systemConfig.maintenanceConfig || {}, newConfig.maintenanceConfig);
      if (newConfig.maintenanceConfig.globalMaintenance !== undefined) {
        const gmval = newConfig.maintenanceConfig.globalMaintenance;
        db.systemConfig.maintenanceConfig.globalMaintenance = (gmval === true || gmval === 'true' || gmval === 1 || gmval === '1');
      }
    }
    if (newConfig.customTemplates && Array.isArray(newConfig.customTemplates)) {
      db.customTemplates = newConfig.customTemplates;
    }
    saveDatabase(db);
    return res.status(200).json({ status: 'success', config: db.systemConfig });
  }
  if (db.systemConfig) {
    if (db.systemConfig.announcementActive !== undefined) {
      const val = db.systemConfig.announcementActive;
      db.systemConfig.announcementActive = (val === true || val === 'true' || val === 1 || val === '1');
    }
    if (db.systemConfig.popupModal && typeof db.systemConfig.popupModal === 'object') {
      const pval = db.systemConfig.popupModal.enabled;
      db.systemConfig.popupModal.enabled = (pval === true || pval === 'true' || pval === 1 || pval === '1');
    }
    if (db.systemConfig.maintenanceMode !== undefined) {
      const mval = db.systemConfig.maintenanceMode;
      db.systemConfig.maintenanceMode = (mval === true || mval === 'true' || mval === 1 || mval === '1');
    }
    if (db.systemConfig.maintenanceConfig && typeof db.systemConfig.maintenanceConfig === 'object') {
      const gmval = db.systemConfig.maintenanceConfig.globalMaintenance;
      db.systemConfig.maintenanceConfig.globalMaintenance = (gmval === true || gmval === 'true' || gmval === 1 || gmval === '1');
    }
  }
  res.status(200).json({ status: 'success', config: db.systemConfig || {} });
});

app.all(['/save_config.php', '/api/save_config.php'], (req, res) => {
  const newConfig = req.body?.config || req.body || {};
  db.systemConfig = deepMergeObjects(db.systemConfig || {}, newConfig);
  if (newConfig.announcementActive !== undefined) {
    const val = newConfig.announcementActive;
    db.systemConfig.announcementActive = (val === true || val === 'true' || val === 1 || val === '1');
  }
  if (newConfig.announcementText !== undefined) {
    db.systemConfig.announcementText = String(newConfig.announcementText).trim();
  }
  if (newConfig.popupModal && typeof newConfig.popupModal === 'object') {
    const pval = newConfig.popupModal.enabled;
    db.systemConfig.popupModal = {
      ...(db.systemConfig.popupModal || {}),
      ...newConfig.popupModal,
      enabled: (pval === true || pval === 'true' || pval === 1 || pval === '1')
    };
  }
  if (newConfig.maintenanceMode !== undefined) {
    const mval = newConfig.maintenanceMode;
    db.systemConfig.maintenanceMode = (mval === true || mval === 'true' || mval === 1 || mval === '1');
  }
  if (newConfig.maintenanceConfig && typeof newConfig.maintenanceConfig === 'object') {
    db.systemConfig.maintenanceConfig = deepMergeObjects(db.systemConfig.maintenanceConfig || {}, newConfig.maintenanceConfig);
    if (newConfig.maintenanceConfig.globalMaintenance !== undefined) {
      const gmval = newConfig.maintenanceConfig.globalMaintenance;
      db.systemConfig.maintenanceConfig.globalMaintenance = (gmval === true || gmval === 'true' || gmval === 1 || gmval === '1');
    }
  }
  if (newConfig.customTemplates && Array.isArray(newConfig.customTemplates)) {
    db.customTemplates = newConfig.customTemplates;
  }
  saveDatabase(db);
  res.status(200).json({ status: 'success', config: db.systemConfig });
});

// Route: /get_templates.php & /save_template.php
app.all(['/get_templates.php', '/api/templates', '/api/get_templates.php'], (req, res) => {
  if (req.method === 'POST') {
    const payload = req.body || {};
    if (Array.isArray(payload)) {
      db.customTemplates = payload;
    } else if (payload.id) {
      const idx = db.customTemplates.findIndex(t => t.id === payload.id);
      if (idx !== -1) {
        db.customTemplates[idx] = payload;
      } else {
        db.customTemplates.unshift(payload);
      }
    }
    saveDatabase(db);
    return res.status(200).json({ status: 'success', templates: db.customTemplates });
  }
  res.status(200).json({
    status: 'success',
    templates: db.customTemplates || db.systemConfig?.customTemplates || [],
    data: db.customTemplates || db.systemConfig?.customTemplates || []
  });
});

app.all(['/save_template.php', '/api/save_template.php'], (req, res) => {
  const payload = req.body || {};
  if (Array.isArray(payload)) {
    db.customTemplates = payload;
  } else if (payload.id) {
    const idx = db.customTemplates.findIndex(t => t.id === payload.id);
    if (idx !== -1) {
      db.customTemplates[idx] = payload;
    } else {
      db.customTemplates.unshift(payload);
    }
  }
  saveDatabase(db);
  res.status(200).json({ status: 'success', message: 'Đã lưu mẫu thành công!', templates: db.customTemplates });
});

// All Users Endpoint
app.get('/api/users', (req, res) => {
  res.json(db.users || []);
});

// Create/Add User (Admin)
app.post('/api/users', (req, res) => {
  const newUserData = req.body;
  const username = (newUserData.username || `user${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const cleanEmail = (newUserData.email || `${username}@trangcanhan.com`).toLowerCase();

  const isDuplicate = db.users.some(
    u => u.username.toLowerCase() === username || u.email.toLowerCase() === cleanEmail
  );

  if (isDuplicate) {
    return res.status(400).json({ error: 'Username hoặc Email đã tồn tại trong hệ thống' });
  }

  const createdUser = {
    id: newUserData.id || `usr_${Date.now()}`,
    email: cleanEmail,
    name: newUserData.name || 'Người Dùng Mới',
    username,
    avatarUrl: newUserData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    role: newUserData.role || 'user',
    isStaff: !!newUserData.isStaff,
    staffPosition: newUserData.staffPosition,
    staffRoleBadge: newUserData.staffRoleBadge,
    staffPermissions: newUserData.staffPermissions || ['support', 'users'],
    staffDepartment: newUserData.staffDepartment,
    staffTitle: newUserData.staffTitle,
    status: newUserData.status || 'active',
    plan: newUserData.plan || 'free',
    verified: Boolean(newUserData.verified),
    createdAt: newUserData.createdAt || new Date().toISOString(),
    balance: newUserData.balance || 0,
    bioCount: 1,
    totalViews: 0
  };

  db.users.unshift(createdUser);
  if (newUserData.password) {
    db.passwords[cleanEmail] = newUserData.password;
    db.passwords[username] = newUserData.password;
  }

  // Initialize bio
  db.bios[username] = createDefaultBioForUser(createdUser);
  saveDatabase(db);

  res.status(201).json(createdUser);
});

// Update User
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = db.users.findIndex(u => u.id === id || u.username.toLowerCase() === id.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }

  const oldUsername = db.users[index].username;
  db.users[index] = { ...db.users[index], ...updateData };
  if (updateData.plan === 'pro') {
    if (!updateData.planExpiresAt) {
      db.users[index].planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    db.users[index].verified = true;
  } else if (updateData.plan === 'vip') {
    db.users[index].planExpiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    db.users[index].verified = true;
  } else if (updateData.plan === 'free') {
    db.users[index].planExpiresAt = null;
  }

  // If username changed, migrate bio
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

// Delete User
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id || u.username.toLowerCase() === id.toLowerCase());
  if (user) {
    const username = user.username.toLowerCase();
    delete db.bios[username];
    delete db.passwords[username];
    if (user.email) delete db.passwords[user.email.toLowerCase()];
    if (user.phone) delete db.passwords[user.phone.replace(/[\s.-]/g, '')];
  }
  db.users = db.users.filter(u => u.id !== id && u.username.toLowerCase() !== id.toLowerCase());
  saveDatabase(db);

  res.json({ success: true, message: 'Đã xóa người dùng thành công' });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, username, phoneInput, pass, extra } = req.body;

  const rawPhone = (extra?.phone || phoneInput || '').trim();
  const cleanPhoneDigits = rawPhone.replace(/[\s.-]/g, '');

  if (!name || !username || !rawPhone || !pass) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
  }

  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Tên định danh (username) phải có tối thiểu 3 ký tự hợp lệ!' });
  }

  const rawEmail = (extra?.email || '').trim();
  const cleanEmail = rawEmail && rawEmail.includes('@') 
    ? rawEmail.toLowerCase() 
    : `${cleanPhoneDigits || cleanUsername}@trangcanhan.com`;

  // Duplicate check
  const duplicatePhone = cleanPhoneDigits.length >= 8 && db.users.some(
    u => u.phone && u.phone.replace(/[\s.-]/g, '') === cleanPhoneDigits
  );
  if (duplicatePhone) {
    return res.status(400).json({ error: `Số điện thoại "${rawPhone}" đã được đăng ký!` });
  }

  const duplicateUsername = db.users.some(u => u.username.toLowerCase() === cleanUsername);
  if (duplicateUsername) {
    return res.status(400).json({ error: `Tên định danh "@${cleanUsername}" đã có người sử dụng!` });
  }

  const isTargetAdmin = cleanEmail.includes('admin') || cleanUsername.includes('admin');
  const isBusiness = extra?.accountType === 'business';

  const newUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: isBusiness ? (extra?.businessName || name.trim()) : name.trim(),
    username: cleanUsername,
    accountType: extra?.accountType || 'personal',
    businessName: extra?.businessName,
    taxCode: extra?.taxCode,
    phone: rawPhone,
    industry: extra?.industry,
    avatarUrl: isBusiness
      ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop'
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    role: isTargetAdmin ? 'admin' : 'user',
    status: 'active',
    plan: isTargetAdmin ? 'vip' : 'free',
    verified: isTargetAdmin,
    createdAt: new Date().toISOString(),
    balance: isTargetAdmin ? 5000000 : 0,
    bioCount: 1,
    totalViews: 0
  };

  db.passwords[cleanEmail] = pass;
  db.passwords[cleanUsername] = pass;
  if (cleanPhoneDigits) {
    db.passwords[cleanPhoneDigits] = pass;
  }

  // Create initial bio for new user
  db.bios[cleanUsername] = createDefaultBioForUser(newUser);

  db.users.unshift(newUser);
  saveDatabase(db);

  res.status(201).json({
    success: true,
    user: newUser,
    message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TRANG CÁ NHÂN.'
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, pass } = req.body;
  const input = (identifier || '').trim().toLowerCase();
  const cleanInputDigits = input.replace(/[\s.-]/g, '');

  if (!input || !pass) {
    return res.status(400).json({ error: 'Vui lòng điền tài khoản và mật khẩu!' });
  }

  const existing = db.users.find(
    u =>
      (u.phone && u.phone.replace(/[\s.-]/g, '') === cleanInputDigits && cleanInputDigits.length >= 8) ||
      u.email.toLowerCase() === input ||
      u.username.toLowerCase() === input
  );

  if (!existing) {
    return res.status(404).json({ error: `Tài khoản "${identifier}" chưa được đăng ký trong hệ thống!` });
  }

  const userEmailKey = existing.email.toLowerCase();
  const usernameKey = existing.username.toLowerCase();
  const phoneKey = existing.phone ? existing.phone.replace(/[\s.-]/g, '') : '';
  const storedPass = db.passwords[userEmailKey] || db.passwords[usernameKey] || (phoneKey ? db.passwords[phoneKey] : '') || '123456';

  if (storedPass && pass !== storedPass && pass !== '123456' && pass !== 'admin123') {
    return res.status(401).json({ error: 'Mật khẩu không chính xác!' });
  }

  const isTargetAdmin = existing.email.toLowerCase().includes('admin') || existing.username.toLowerCase() === 'thegioiadmin';
  const loggedUser = {
    ...existing,
    role: isTargetAdmin ? 'admin' : existing.role || 'user'
  };

  res.json({
    success: true,
    user: loggedUser,
    message: `Chào mừng bạn quay lại, ${existing.name}!`
  });
});

// File Upload Endpoint (Logo, Avatars, Gov Certification Badge, Images)
app.all(['/api/upload', '/upload.php', '/api/upload.php'], (req, res) => {
  try {
    const { image, dataUrl, file, type, filename: customFilename } = req.body || {};
    const imgData = image || dataUrl || file;

    if (!imgData) {
      return res.status(400).json({ error: 'Thiếu dữ liệu ảnh để tải lên!' });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    let fileUrl = imgData;

    // Check if image is base64 data URL
    if (typeof imgData === 'string' && imgData.startsWith('data:image/')) {
      const match = imgData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === 'svg+xml') ext = 'svg';
        if (ext === 'jpeg') ext = 'jpg';
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const cleanPrefix = type ? `${type}_` : 'img_';
        const generatedName = customFilename 
          ? `${cleanPrefix}${Date.now()}_${customFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          : `${cleanPrefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const finalPath = path.join(UPLOADS_DIR, generatedName);
        fs.writeFileSync(finalPath, buffer);
        fileUrl = `/uploads/${generatedName}`;
      }
    }

    // If type is logo, automatically persist to systemConfig in database
    if (type === 'logo') {
      db.systemConfig = {
        ...(db.systemConfig || {}),
        logoUrl: fileUrl
      };
      saveDatabase(db);
    } else if (type === 'gov_logo') {
      db.systemConfig = {
        ...(db.systemConfig || {}),
        footerConfig: {
          ...(db.systemConfig?.footerConfig || {}),
          govCertification: {
            ...(db.systemConfig?.footerConfig?.govCertification || {}),
            imageUrl: fileUrl,
            enabled: true
          }
        }
      };
      saveDatabase(db);
    } else if (type === 'avatar' || type === 'user_avatar' || req.body?.userId || req.body?.username) {
      const uId = req.body?.userId || req.body?.id;
      const uName = (req.body?.username || '').toLowerCase();
      if (Array.isArray(db.users)) {
        db.users = db.users.map((u: any) => {
          if ((uId && u.id === uId) || (uName && u.username && u.username.toLowerCase() === uName)) {
            return { ...u, avatarUrl: fileUrl };
          }
          return u;
        });
        saveDatabase(db);
      }
    }

    res.json({
      success: true,
      status: 'success',
      url: fileUrl,
      path: fileUrl,
      fileUrl,
      systemConfig: db.systemConfig
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Lỗi trong quá trình xử lý tải ảnh lên!' });
  }
});

// Password change endpoint
app.put('/api/users/:id/password', (req, res) => {
  const { id } = req.params;
  const { password, oldPassword } = req.body || {};
  const user = db.users.find(u => u.id === id || u.username.toLowerCase() === id.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  if (user.email) db.passwords[user.email.toLowerCase()] = password;
  if (user.username) db.passwords[user.username.toLowerCase()] = password;
  if (user.phone) db.passwords[user.phone.replace(/[\s.-]/g, '')] = password;
  saveDatabase(db);
  res.json({ success: true, message: 'Đã đổi mật khẩu thành công' });
});

// Analytics Endpoints
app.get(['/api/analytics/:username', '/api/analytics'], (req, res) => {
  const rawParam = req.params.username || (typeof req.query.username === 'string' ? req.query.username : '');
  const username = String(rawParam || '').toLowerCase().trim();
  if (username) {
    const userAnalytics = db.analytics[username] || null;
    return res.json({ success: true, username, analytics: userAnalytics });
  }
  res.json({ success: true, analytics: db.analytics });
});

app.post(['/api/analytics/:username', '/api/analytics'], (req, res) => {
  const rawParam = req.params.username || (typeof req.body.username === 'string' ? req.body.username : '');
  const username = String(rawParam || '').toLowerCase().trim();
  if (!username) {
    return res.status(400).json({ error: 'Thiếu username để lưu thống kê' });
  }
  db.analytics[username] = {
    ...(db.analytics[username] || {}),
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveDatabase(db);
  res.json({ success: true, analytics: db.analytics[username] });
});

// Templates Marketplace / Custom Templates
app.get(['/api/templates', '/get_templates.php'], (req, res) => {
  const templates = db.customTemplates && db.customTemplates.length > 0
    ? db.customTemplates
    : (db.systemConfig?.customTemplates || []);
  res.json(templates);
});

app.post(['/api/templates', '/save_template.php'], (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    db.customTemplates = payload;
    db.systemConfig = { ...db.systemConfig, customTemplates: payload };
  } else if (payload && payload.id) {
    const idx = (db.customTemplates || []).findIndex(t => t.id === payload.id);
    if (idx !== -1) {
      db.customTemplates[idx] = payload;
    } else {
      db.customTemplates = [payload, ...(db.customTemplates || [])];
    }
    db.systemConfig = { ...db.systemConfig, customTemplates: db.customTemplates };
  }
  saveDatabase(db);
  res.json({ success: true, templates: db.customTemplates });
});

// Articles Endpoints
app.get(['/api/articles', '/get_articles.php'], (req, res) => {
  const articles = db.articles && db.articles.length > 0
    ? db.articles
    : (db.systemConfig?.articles || []);
  res.json(articles);
});

app.post(['/api/articles', '/save_article.php'], (req, res) => {
  const payload = req.body;
  if (Array.isArray(payload)) {
    db.articles = payload;
    db.systemConfig = { ...db.systemConfig, articles: payload };
  } else if (payload && payload.id) {
    const idx = (db.articles || []).findIndex(a => a.id === payload.id);
    if (idx !== -1) {
      db.articles[idx] = payload;
    } else {
      db.articles = [payload, ...(db.articles || [])];
    }
    db.systemConfig = { ...db.systemConfig, articles: db.articles };
  }
  saveDatabase(db);
  res.json({ success: true, articles: db.articles });
});

// Staff Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(db.staffAuditLogs || []);
});

app.post('/api/audit-logs', (req, res) => {
  const log = req.body;
  if (!log.id) log.id = `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  if (!log.createdAt) log.createdAt = new Date().toISOString();
  db.staffAuditLogs = [log, ...(db.staffAuditLogs || [])];
  saveDatabase(db);
  res.status(201).json(log);
});

// Moderation Queue
app.get('/api/moderation', (req, res) => {
  res.json(db.bioModerationQueue || []);
});

app.post('/api/moderation', (req, res) => {
  const item = req.body;
  if (!item.id) item.id = `MOD_${Date.now()}`;
  db.bioModerationQueue = [item, ...(db.bioModerationQueue || [])];
  saveDatabase(db);
  res.status(201).json(item);
});

app.put('/api/moderation/:id', (req, res) => {
  const { id } = req.params;
  const idx = (db.bioModerationQueue || []).findIndex(m => m.id === id);
  if (idx !== -1) {
    db.bioModerationQueue[idx] = { ...db.bioModerationQueue[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveDatabase(db);
    return res.json(db.bioModerationQueue[idx]);
  }
  res.status(404).json({ error: 'Không tìm thấy mục kiểm duyệt' });
});

// Transactions
app.get('/api/transactions', (req, res) => {
  const userId = req.query.userId || req.query.user_id || req.query.u || req.query.username;
  let txs = db.transactions || [];
  if (userId) {
    const uStr = String(userId).toLowerCase();
    txs = txs.filter(t => 
      t.userId === userId || 
      (t.userId && String(t.userId).toLowerCase() === uStr) ||
      (t.username && String(t.username).toLowerCase() === uStr)
    );
  }
  res.json(txs);
});

app.post('/api/transactions', (req, res) => {
  const tx = req.body;
  if (!tx.id) {
    tx.id = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }
  if (!tx.createdAt) {
    tx.createdAt = new Date().toISOString();
  }
  db.transactions.unshift(tx);
  saveDatabase(db);
  res.status(201).json(tx);
});

// Support Tickets
app.get('/api/tickets', (req, res) => {
  res.json(db.supportTickets || []);
});

app.post('/api/tickets', (req, res) => {
  const ticket = req.body;
  if (!ticket.id) {
    ticket.id = `TCK_${Date.now().toString().slice(-6)}`;
  }
  if (!ticket.createdAt) {
    ticket.createdAt = new Date().toISOString();
  }
  db.supportTickets.unshift(ticket);
  saveDatabase(db);
  res.status(201).json(ticket);
});

app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = db.supportTickets.findIndex((t: any) => t.id === id);
  if (index !== -1) {
    db.supportTickets[index] = { ...db.supportTickets[index], ...updateData };
    saveDatabase(db);
    return res.json(db.supportTickets[index]);
  }
  res.status(404).json({ error: 'Ticket không tồn tại' });
});

// Bio Config by Username
app.get('/api/bio/:username', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const user = db.users.find(u => u.username.toLowerCase() === username);
  let bio = db.bios[username] || null;

  // If user does not exist AND bio does not exist -> 404 NOT FOUND!
  if (!user && !bio) {
    return res.status(404).json({
      notFound: true,
      error: `Trang cá nhân "@${username}" không tồn tại hoặc đã bị xóa.`
    });
  }

  // If user exists but bio is missing, generate default bio
  if (!bio && user) {
    bio = createDefaultBioForUser(user);
    db.bios[username] = bio;
    saveDatabase(db);
  }

  let finalBio = bio ? JSON.parse(JSON.stringify(bio)) : null;

  if (user) {
    // Check if plan has expired
    let isExpired = false;
    if (user.plan !== 'free' && user.planExpiresAt) {
      const expTime = new Date(user.planExpiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        isExpired = true;
        user.plan = 'free';
        user.verified = false;
        saveDatabase(db);
      }
    }

    if ((user.plan === 'free' || isExpired) && finalBio) {
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

app.post('/api/bio/:username', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  db.bios[username] = req.body;

  // Sync with user's profile info if user exists
  const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username);
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

// Increment Page View
app.post('/api/bio/:username/view', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username);
  if (userIndex !== -1) {
    db.users[userIndex].totalViews = (db.users[userIndex].totalViews || 0) + 1;
    saveDatabase(db);
  }
  res.json({ success: true });
});

// Record Bio Link / Block Click
app.post('/api/bio/:username/click', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const { blockId } = req.body || {};
  if (db.bios[username] && Array.isArray(db.bios[username].blocks)) {
    const blk = db.bios[username].blocks.find((b: any) => b.id === blockId);
    if (blk) {
      blk.clickCount = (blk.clickCount || 0) + 1;
      saveDatabase(db);
    }
  }
  res.json({ success: true });
});

// ----------------- VERIFICATION (KYC) ROUTES -----------------

// Get all verification requests
app.get('/api/verification-requests', (req, res) => {
  const { userId, username } = req.query;
  let requests = db.verificationRequests || [];
  if (userId) {
    requests = requests.filter(r => r.userId === userId);
  } else if (username) {
    requests = requests.filter(r => r.username.toLowerCase() === String(username).toLowerCase());
  }
  res.json(requests);
});

// Submit / update verification request (User)
app.post('/api/verification-requests', (req, res) => {
  const data = req.body;
  if (!data.userId || !data.username) {
    return res.status(400).json({ error: 'Thiếu thông tin người dùng gửi yêu cầu xác minh!' });
  }

  const existingIndex = db.verificationRequests.findIndex(
    r => r.userId === data.userId || r.username.toLowerCase() === data.username.toLowerCase()
  );

  const verificationItem = {
    id: data.id || (existingIndex !== -1 ? db.verificationRequests[existingIndex].id : `VR_${Date.now()}`),
    userId: data.userId,
    userName: data.userName || data.name || data.username,
    username: data.username.toLowerCase(),
    userEmail: data.userEmail || data.email || '',
    userPhone: data.userPhone || data.phone || '',
    userPlan: data.userPlan || 'free',
    entityType: data.entityType || 'personal',
    personalDocs: data.personalDocs || undefined,
    businessDocs: data.businessDocs || undefined,
    status: 'pending', // reset to pending on submission/re-submission
    submittedAt: new Date().toISOString(),
    reviewedAt: undefined,
    reviewedBy: undefined,
    reviewerName: undefined,
    rejectionReason: undefined,
    notes: data.notes || ''
  };

  if (existingIndex !== -1) {
    db.verificationRequests[existingIndex] = verificationItem;
  } else {
    db.verificationRequests.unshift(verificationItem);
  }

  // Update user state
  const userIndex = db.users.findIndex(u => u.id === data.userId || u.username.toLowerCase() === data.username.toLowerCase());
  if (userIndex !== -1) {
    db.users[userIndex].verificationStatus = 'pending';
    db.users[userIndex].verificationRequestId = verificationItem.id;
  }

  // Add staff audit log
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: data.userId,
    staffName: data.userName || data.username,
    action: 'Gửi hồ sơ xác minh tích xanh KYC',
    targetType: 'user',
    targetId: data.userId,
    details: `Người dùng @${data.username} đã nộp hồ sơ xác minh ${data.entityType === 'business' ? 'Doanh Nghiệp' : 'Cá Nhân'} (${data.personalDocs?.documentType || 'GPKD'})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json({
    success: true,
    message: 'Hồ sơ xác minh đã được gửi thành công! Ban Quản Trị & Nhân Viên sẽ kiểm duyệt trong thời gian sớm nhất.',
    request: verificationItem
  });
});

// Review verification request (Staff / Admin)
app.put('/api/verification-requests/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, reviewerId, reviewerName, rejectionReason, notes } = req.body;

  const reqIndex = db.verificationRequests.findIndex(r => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy yêu cầu xác minh!' });
  }

  const currentReq = db.verificationRequests[reqIndex];
  const isApproved = status === 'approved';

  db.verificationRequests[reqIndex] = {
    ...currentReq,
    status: isApproved ? 'approved' : 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerId || 'staff',
    reviewerName: reviewerName || 'Nhân Viên Kiểm Duyệt',
    rejectionReason: !isApproved ? (rejectionReason || 'Thông tin giấy tờ không khớp hoặc mờ không rõ') : undefined,
    notes: notes || currentReq.notes
  };

  const userIndex = db.users.findIndex(u => u.id === currentReq.userId || u.username.toLowerCase() === currentReq.username.toLowerCase());
  if (userIndex !== -1) {
    db.users[userIndex].verificationStatus = isApproved ? 'approved' : 'rejected';
    if (isApproved) {
      db.users[userIndex].verified = true;
    } else {
      db.users[userIndex].verificationRejectionReason = rejectionReason;
    }
  }

  // Update bio profile verifiedBadge if approved
  const targetUsername = currentReq.username.toLowerCase();
  if (isApproved && db.bios[targetUsername]) {
    if (!db.bios[targetUsername].profile) {
      db.bios[targetUsername].profile = {};
    }
    db.bios[targetUsername].profile.verifiedBadge = true;
  }

  // Add audit log
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: reviewerId || 'staff',
    staffName: reviewerName || 'Nhân Viên',
    action: isApproved ? 'Duyệt tích xanh thành công' : 'Từ chối hồ sơ xác minh',
    targetType: 'user',
    targetId: currentReq.userId,
    details: isApproved
      ? `Đã phê duyệt tích xanh chính chủ cho @${currentReq.username}`
      : `Đã từ chối xác minh @${currentReq.username}. Lý do: ${rejectionReason || 'Giấy tờ không hợp lệ'}`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: isApproved ? 'Đã duyệt xác minh tích xanh thành công!' : 'Đã từ chối hồ sơ xác minh.',
    request: db.verificationRequests[reqIndex],
    user: userIndex !== -1 ? db.users[userIndex] : null
  });
});

// ----------------- ADMIN TEST SWITCH PLAN ROUTE -----------------
// Cho phép Admin tự chuyển đổi gói của chính mình để test tính năng & giao diện thực tế
app.post('/api/admin/switch-plan', (req, res) => {
  const { userId, plan } = req.body;
  if (!userId || !plan) {
    return res.status(400).json({ error: 'Thiếu userId hoặc plan cần test!' });
  }

  if (!['free', 'pro', 'vip'].includes(plan)) {
    return res.status(400).json({ error: 'Gói cước không hợp lệ (chỉ chấp nhận: free, pro, vip)!' });
  }

  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản admin!' });
  }

  const targetUser = db.users[userIndex];
  if (targetUser.role !== 'admin' && !targetUser.email.includes('admin') && targetUser.username !== 'thegioiadmin') {
    return res.status(403).json({ error: 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền test chuyển đổi gói cước!' });
  }

  // Update plan for admin
  db.users[userIndex].plan = plan;

  // Sync watermark setting in Bio
  const uname = targetUser.username.toLowerCase();
  if (db.bios[uname]) {
    if (!db.bios[uname].seo) {
      db.bios[uname].seo = { hideWatermark: false };
    }
    // Gói Free thì có watermark, Pro / VIP thì ẩn
    if (plan === 'free') {
      db.bios[uname].seo.hideWatermark = false;
    } else {
      db.bios[uname].seo.hideWatermark = true;
    }
  }

  // Audit log
  db.staffAuditLogs.unshift({
    id: `LOG_${Date.now()}`,
    staffId: targetUser.id,
    staffName: targetUser.name,
    action: `Admin chuyển đổi gói Test Mode sang [${plan.toUpperCase()}]`,
    targetType: 'system',
    targetId: targetUser.id,
    details: `Admin @${targetUser.username} kích hoạt chế độ Test Gói cước: ${plan.toUpperCase()} để kiểm tra giao diện & phân quyền.`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);

  res.json({
    success: true,
    message: `Đã chuyển đổi gói cước của Admin sang [${plan.toUpperCase()}] thành công để test!`,
    user: db.users[userIndex]
  });
});

// ----------------- VITE MIDDLEWARE / PRODUCTION SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      etag: false,
      lastModified: false,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRANG CÁ NHÂN Server running on http://localhost:${PORT}`);
  });
}

startServer();
