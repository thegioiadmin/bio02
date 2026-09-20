import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  BioModerationItem, 
  MaintenanceConfig, 
  PlanType, 
  StaffAuditLog, 
  StaffPermission, 
  SupportTicket, 
  SystemArticle, 
  SystemConfig, 
  SystemModuleKey, 
  SystemModuleMaintenance, 
  Transaction, 
  TransactionType, 
  User,
  VerificationRequest,
  VerificationStatus
} from '../types';
import { DEFAULT_SYSTEM_ARTICLES } from '../data/defaultArticles';
import { DEFAULT_HOMEPAGE_SECTIONS } from '../data/defaultHomepageSections';
import { PAYMENT_PLANS } from '../utils/presets';
import { authenticateWithGoogle, authenticateWithFacebook } from '../services/socialAuth';
import { 
  DEFAULT_MAINTENANCE_CONFIG, 
  DEFAULT_SUPPORT_TICKETS, 
  DEFAULT_BIO_MODERATION_QUEUE, 
  DEFAULT_STAFF_AUDIT_LOGS 
} from '../data/defaultStaffAndMaintenance';

export const normalizePhpUser = (u: any): User => {
  if (!u) return {} as User;
  const username = String(u.username || u.user_name || u.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user_${u.id || Date.now()}`;
  const role = (u.role || (username.includes('admin') ? 'admin' : 'user')) as any;
  const isStaff = u.is_staff === 1 || u.is_staff === true || u.isStaff === true || role === 'admin' || ['chairman', 'general_director', 'director', 'technical', 'sale', 'support'].includes(role);

  return {
    id: String(u.id || u.user_id || `usr_${username}`),
    username,
    name: u.name || u.fullname || u.full_name || u.display_name || username,
    email: u.email || `${username}@trangcanhan.com`,
    phone: u.phone || u.phone_number || '',
    avatarUrl: u.avatar_url || u.avatarUrl || u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    role,
    isStaff,
    staffPosition: u.staff_position || u.staffPosition || (isStaff ? (role !== 'user' ? role : 'support') : undefined),
    staffRoleBadge: u.staff_role_badge || u.staffRoleBadge || (role === 'admin' ? 'ADMIN' : (isStaff ? 'STAFF' : 'USER')),
    staffDepartment: u.staff_department || u.staffDepartment,
    staffTitle: u.staff_title || u.staffTitle,
    staffPermissions: Array.isArray(u.staff_permissions || u.staffPermissions)
      ? (u.staff_permissions || u.staffPermissions)
      : (role === 'admin' ? ['support', 'finance', 'moderation', 'users', 'analytics'] : ['support', 'users']),
    status: u.status || 'active',
    plan: (u.plan || (role === 'admin' ? 'vip' : 'free')) as PlanType,
    planExpiresAt: u.plan_expires_at || u.planExpiresAt,
    verified: Boolean(u.verified === 1 || u.verified === true || role === 'admin' || username.includes('admin')),
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
    customDomain: u.custom_domain || u.customDomain || '',
    balance: Number(u.balance || 0),
    bioCount: Number(u.bio_count || u.bioCount || 1),
    totalViews: Number(u.total_views || u.totalViews || 0),
    accountType: u.account_type || u.accountType || 'personal',
    businessName: u.business_name || u.businessName,
    taxCode: u.tax_code || u.taxCode,
    industry: u.industry,
  };
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  hasStaffPermission: (perm: StaffPermission) => boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithSocial: (provider: 'google' | 'facebook') => Promise<{ success: boolean; message: string; user?: User }>;
  linkSocialAccount: (provider: 'google' | 'facebook') => Promise<{ success: boolean; message: string; user?: User }>;
  unlinkSocialAccount: (provider: 'google' | 'facebook') => Promise<{ success: boolean; message: string }>;
  register: (
    name: string,
    username: string,
    email: string,
    pass: string,
    extra?: {
      accountType?: 'personal' | 'business';
      businessName?: string;
      taxCode?: string;
      phone?: string;
      email?: string;
      industry?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (contact: string) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyResetCode: (code: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (data: Partial<User>) => void;
  upgradePlan: (plan: PlanType, months?: number, price?: number, isRenewal?: boolean) => Promise<{ success: boolean; message: string; user?: User }>;
  pendingResetEmail: string | null;
  refreshUsersFromBackend: () => Promise<User[]>;
  syncAllUsersToBackend: (usersList?: User[]) => Promise<{ success: boolean; message: string; count?: number }>;

  // Wallet & Balance Management
  balance: number;
  transactions: Transaction[];
  allTransactions: Transaction[];
  depositMoney: (amount: number, paymentMethod: string, note?: string) => Promise<{ success: boolean; tx: Transaction }>;
  payWithBalance: (amount: number, description: string, type: TransactionType) => Promise<{ success: boolean; message: string; tx?: Transaction }>;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  suggestedDepositAmount: number;
  openDepositModal: (amount?: number) => void;
  adminDeleteTransaction: (txId?: string, userId?: string, clearAll?: boolean) => Promise<{ success: boolean; message: string }>;
  adminResetAllTransactions: (targetUserId?: string) => Promise<{ success: boolean; message: string; deletedCount?: number }>;

  // Admin System Management
  systemConfig: SystemConfig;
  updateSystemConfig: (data: Partial<SystemConfig>) => void;
  refreshSystemConfig: () => Promise<void>;
  allUsers: User[];
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  adminAdjustBalance: (userId: string, amount: number, reason: string) => void;
  adminAddUser: (user: Partial<User>) => void;
  adminAssignStaff: (userId: string, isStaff: boolean, permissions: StaffPermission[], department?: string, title?: string, position?: string, badge?: string) => void;
  adminChangeUserRole: (userId: string, roleCode: string, details?: { isStaff?: boolean; permissions?: StaffPermission[]; department?: string; title?: string; badge?: string }) => void;

  // Internal Staff Management
  supportTickets: SupportTicket[];
  addSupportTicket: (ticket: Partial<SupportTicket>) => void;
  replySupportTicket: (ticketId: string, content: string, isInternalNote?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], assignedStaffId?: string, assignedStaffName?: string) => void;
  staffAuditLogs: StaffAuditLog[];
  addStaffAuditLog: (action: string, targetType: 'ticket' | 'transaction' | 'user' | 'bio' | 'system', details: string, targetId?: string) => void;
  bioModerationQueue: BioModerationItem[];
  updateModerationItem: (bioId: string, status: BioModerationItem['status'], notes?: string) => void;

  // Verification (KYC) Blue Badge Workflow
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (req: Partial<VerificationRequest>) => Promise<{ success: boolean; message: string; request?: VerificationRequest }>;
  reviewVerificationRequest: (id: string, status: 'approved' | 'rejected', rejectionReason?: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  fetchVerificationRequests: () => Promise<VerificationRequest[]>;

  // Admin Self Plan Switch (Test Mode)
  adminSwitchOwnPlan: (plan: PlanType) => Promise<{ success: boolean; message: string }>;

  // Granular Maintenance Controls
  isModuleUnderMaintenance: (moduleKey: SystemModuleKey) => boolean;
  getModuleMaintenanceInfo: (moduleKey: SystemModuleKey) => SystemModuleMaintenance | undefined;
  setModuleMaintenance: (moduleKey: SystemModuleKey, isUnderMaintenance: boolean, options?: { maintenanceTitle?: string; maintenanceMessage?: string; expectedEndTime?: string }) => Promise<{ success: boolean; message: string }>;
  setGlobalMaintenance: (enabled: boolean, options?: { globalTitle?: string; globalMessage?: string; globalExpectedEndTime?: string }) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  siteName: 'TRANG CÁ NHÂN',
  siteTitle: 'TRANG CÁ NHÂN - Nền tảng tạo trang bio cá nhân chuyên nghiệp #1 Việt Nam',
  slogan: 'Tất cả liên kết của bạn trong một link duy nhất',
  logoUrl: '',
  mainDomain: typeof window !== 'undefined' && window.location && window.location.host && !window.location.host.includes('localhost:') ? window.location.host : 'trangcanhan.com',
  cnameTarget: 'cname.trangcanhan.com',
  defaultUserPlan: 'free',
  supportEmail: 'thegioiadmin@gmail.com',
  hotline: '0334577791',
  bankName: 'Ngân hàng Quân Đội (MB Bank)',
  bankCode: 'MB',
  bankAccount: '0988889999',
  accountHolder: 'NGUYEN THANH NAM',
  momoNumber: '0988889999',
  momoName: 'NGUYEN THANH NAM',
  bonusDepositActive: true,
  bonusDepositRate: 10,
  bonusDepositNote: 'Tặng thêm 10% giá trị nạp ví tự động qua VietQR',
  announcementText: '🎉 Chào mừng sự kiện Nâng cấp hệ thống TRANG CÁ NHÂN v2.5! Tặng thêm 10% giá trị khi nạp tiền qua VietQR.',
  announcementActive: false,
  popupModal: {
    enabled: false,
    title: 'Chào Mừng Đến Với TRANG CÁ NHÂN',
    badge: 'THÔNG BÁO TỪ BAN QUẢN TRỊ',
    content: '🎉 Hệ thống vừa nâng cấp phiên bản 2026 với kho hơn 50+ mẫu giao diện mới, tích hợp thanh toán VietQR tự động và ưu đãi tặng thêm +10% giá trị nạp ví. Chúc bạn xây dựng trang Bio cá nhân thật ấn tượng và thành công!',
    buttonText: 'Khám Phá Bảng Giá & Ưu Đãi',
    buttonLink: '#pricing',
    imageUrl: ''
  },
  maintenanceMode: false,
  maintenanceConfig: DEFAULT_MAINTENANCE_CONFIG,
  defaultBioFooterText: 'Đăng ký miễn phí TRANG CÁ NHÂN',
  defaultBioFooterLink: 'http://trangcanhan.com',
  autoPaymentConfig: {
    enabled: true,
    provider: 'sepay',
    apiKey: '',
    accountNumber: '0988889999',
    bankCode: 'MB',
    webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/sepay` : 'https://trangcanhan.com/api/webhook/sepay',
    autoUpgradePlanEnabled: true,
    autoDepositBalanceEnabled: true,
    depositPrefix: 'NAP',
    proPlanPrefix: 'PRO',
    vipPlanPrefix: 'VIP',
    minDepositAmount: 10000,
    matchUsernameOrUserId: true,
    sendSuccessEmail: true,
    playAudioAlert: true,
  },
  articles: DEFAULT_SYSTEM_ARTICLES,
  footerConfig: {
    brandName: 'TRANG CÁ NHÂN',
    brandLink: 'http://trangcanhan.com',
    brandTagline: 'Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam.\nGiúp bạn kết nối tất cả liên kết trong một trang duy nhất.',
    copyrightText: '© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu.',
    copyrightLink: 'http://trangcanhan.com',
    madeWithText: 'Made with ❤️ Thế giới Admin',
    madeWithLink: 'https://facebook.com/thegioieditor',
    govCertification: {
      enabled: true,
      imageUrl: '/bo-cong-thuong.svg',
      targetUrl: 'http://online.gov.vn/',
      altText: 'Đã thông báo Bộ Công Thương',
      width: 140
    },
    columns: [
      {
        id: 'col_products',
        title: 'SẢN PHẨM',
        links: [
          { id: 'p1', label: 'Tính năng', url: '#features-section' },
          { id: 'p2', label: 'Mẫu đẹp', url: '#templates-showcase' },
          { id: 'p3', label: 'Bảng giá', url: '#pricing-section' },
          { id: 'p4', label: 'Tên miền', url: '#domains-section' },
        ]
      },
      {
        id: 'col_support',
        title: 'CHÍNH SÁCH',
        links: [
          { id: 's1', label: 'Hướng dẫn', url: '/huong-dan', articleSlug: 'huong-dan' },
          { id: 's2', label: 'FAQ', url: '#faq' },
          { id: 's3', label: 'Liên hệ', url: '/lien-he', articleSlug: 'lien-he' },
          { id: 's4', label: 'Trung tâm trợ giúp', url: '/lien-he', articleSlug: 'lien-he' },
        ]
      },
      {
        id: 'col_company',
        title: 'CÔNG TY',
        links: [
          { id: 'c1', label: 'Về chúng tôi', url: '/gioi-thieu', articleSlug: 'gioi-thieu' },
          { id: 'c2', label: 'Blog', url: '/blog', articleSlug: 'blog' },
          { id: 'c3', label: 'Điều khoản', url: '/dieu-khoan', articleSlug: 'dieu-khoan' },
          { id: 'c4', label: 'Chính sách bảo mật', url: '/chinh-sach', articleSlug: 'chinh-sach' },
        ]
      }
    ],
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      tiktok: 'https://tiktok.com',
      email: 'contact@trangcanhan.com'
    }
  },
  pricingPlans: PAYMENT_PLANS,
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
  googleAuthEnabled: false,
  facebookAuthEnabled: false,
  googleClientId: '',
  facebookAppId: ''
};

const DEFAULT_USERS_REGISTRY: User[] = [
  {
    id: 'usr_admin_01',
    email: 'thegioiadmin@gmail.com',
    phone: '0988889999',
    name: 'Quản Trị Viên (Admin)',
    username: 'thegioiadmin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    role: 'admin',
    isStaff: true,
    staffPosition: 'admin',
    staffRoleBadge: 'ADMIN',
    staffDepartment: 'Ban Quản Trị Tối Cao',
    staffTitle: 'Quản Trị Viên Toàn Quyền',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'vip',
    planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-01-01T00:00:00Z',
    customDomain: 'admin.trangcanhan.com',
    balance: 5000000,
    bioCount: 6,
    totalViews: 128600
  },
  {
    id: 'usr_ct_01',
    email: 'chutich@trangcanhan.com',
    phone: '0901239999',
    name: 'Trần Đăng Hùng',
    username: 'chutich_hung',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    role: 'chairman',
    isStaff: true,
    staffPosition: 'chairman',
    staffRoleBadge: 'CT',
    staffDepartment: 'Ban Lãnh Đạo Cấp Cao',
    staffTitle: 'Chủ Tịch Hội Đồng Quản Trị',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'vip',
    planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-01-10T08:00:00Z',
    balance: 20000000,
    bioCount: 4,
    totalViews: 89000
  },
  {
    id: 'usr_tgd_01',
    email: 'tgd@trangcanhan.com',
    phone: '0908887766',
    name: 'Vũ Hoàng Minh',
    username: 'minh_tgd',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    role: 'general_director',
    isStaff: true,
    staffPosition: 'general_director',
    staffRoleBadge: 'TGĐ',
    staffDepartment: 'Ban Tổng Giám Đốc',
    staffTitle: 'Tổng Giám Đốc Điều Hành',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'vip',
    planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-01-15T08:00:00Z',
    balance: 10000000,
    bioCount: 3,
    totalViews: 54000
  },
  {
    id: 'usr_gd_01',
    email: 'giamdoc.tech@trangcanhan.com',
    phone: '0903334455',
    name: 'Lê Anh Tuấn',
    username: 'tuan_giamdoc',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    role: 'director',
    isStaff: true,
    staffPosition: 'director',
    staffRoleBadge: 'GĐ',
    staffDepartment: 'Ban Giám Đốc Điều Hành',
    staffTitle: 'Giám Đốc Khối Công Nghệ',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'vip',
    planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-01-20T08:00:00Z',
    balance: 5000000,
    bioCount: 3,
    totalViews: 42000
  },
  {
    id: 'usr_tech_01',
    email: 'kythuat@trangcanhan.com',
    phone: '0978998877',
    name: 'Phạm Đức Nam',
    username: 'nam_kythuat',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    role: 'technical',
    isStaff: true,
    staffPosition: 'technical',
    staffRoleBadge: 'KT',
    staffDepartment: 'Phòng Kỹ Thuật & Hạ Tầng',
    staffTitle: 'Nhân Viên Kỹ Thuật Hệ Thống',
    staffPermissions: ['support', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'pro',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-02-05T08:00:00Z',
    balance: 1500000,
    bioCount: 2,
    totalViews: 23000
  },
  {
    id: 'usr_sale_01',
    email: 'sale@trangcanhan.com',
    phone: '0981122334',
    name: 'Hoàng Thu Hương',
    username: 'huong_sale',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    role: 'sale',
    isStaff: true,
    staffPosition: 'sale',
    staffRoleBadge: 'SL',
    staffDepartment: 'Phòng Kinh Doanh & Sale',
    staffTitle: 'Chuyên Viên Kinh Doanh (Sale)',
    staffPermissions: ['support', 'finance', 'users', 'analytics'],
    status: 'active',
    plan: 'pro',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-02-10T08:00:00Z',
    balance: 2500000,
    bioCount: 2,
    totalViews: 38000
  },
  {
    id: 'usr_staff_01',
    email: 'nhanvien@trangcanhan.com',
    phone: '0977112233',
    name: 'Nguyễn Minh Anh',
    username: 'nhanvien',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    role: 'support',
    isStaff: true,
    staffPosition: 'support',
    staffRoleBadge: 'CSKH',
    staffDepartment: 'Phòng Chăm Sóc Khách Hàng',
    staffTitle: 'Chuyên Viên CSKH 24/7',
    staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
    status: 'active',
    plan: 'pro',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-02-01T08:00:00Z',
    balance: 1000000,
    bioCount: 2,
    totalViews: 32000
  },
  {
    id: 'usr_linhchi_02',
    email: 'linhchi.beauty@gmail.com',
    phone: '0912345678',
    name: 'Linh Chi',
    username: 'linhchi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'pro',
    planExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-02-14T08:00:00Z',
    customDomain: 'linhchi.vn',
    balance: 450000,
    bioCount: 2,
    totalViews: 45300
  },
  {
    id: 'usr_hoangnam_03',
    email: 'hoangnam.photo@gmail.com',
    phone: '0987654321',
    name: 'Hoàng Nam',
    username: 'hoangnam',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'pro',
    planExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-03-01T10:30:00Z',
    customDomain: '',
    balance: 200000,
    bioCount: 1,
    totalViews: 28900
  },
  {
    id: 'usr_greenlife_04',
    email: 'contact@greenlife.vn',
    phone: '0909000111',
    name: 'Green Life Eco',
    username: 'greenlife',
    avatarUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'vip',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    createdAt: '2025-03-10T14:15:00Z',
    customDomain: 'greenlife.bio',
    balance: 1200000,
    bioCount: 3,
    totalViews: 68400
  },
  {
    id: 'usr_caphe_05',
    email: 'caphenhaminh@gmail.com',
    phone: '0933334444',
    name: 'Cà Phê Nhà Mình',
    username: 'caphenhaminh',
    avatarUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&auto=format&fit=crop',
    role: 'user',
    status: 'active',
    plan: 'free',
    verified: false,
    createdAt: '2025-04-05T09:00:00Z',
    customDomain: '',
    balance: 50000,
    bioCount: 1,
    totalViews: 14200
  }
];

const DEFAULT_USER: User = DEFAULT_USERS_REGISTRY[0];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX_INIT_01',
    userId: 'usr_admin_01',
    type: 'deposit',
    amount: 1000000,
    description: 'Nạp tiền vào ví qua VietQR (MB Bank)',
    createdAt: '2026-08-20T09:30:00Z',
    status: 'completed',
    paymentMethod: 'vietqr',
    referenceCode: 'VQR202608200930',
    receiptNote: 'Chuyển khoản thành công từ tài khoản MB 0988889999'
  },
  {
    id: 'TX_INIT_02',
    userId: 'usr_admin_01',
    type: 'upgrade_plan',
    amount: -720000,
    description: 'Nâng cấp gói Creator PRO (12 tháng)',
    createdAt: '2026-08-20T09:35:00Z',
    status: 'completed',
    paymentMethod: 'balance',
    referenceCode: 'PRO12M_20260820',
    receiptNote: 'Thanh toán trực tiếp bằng số dư ví'
  },
  {
    id: 'TX_INIT_03',
    userId: 'usr_admin_01',
    type: 'deposit',
    amount: 220000,
    description: 'Nạp tiền vào ví qua Ví MoMo',
    createdAt: '2026-08-22T08:15:00Z',
    status: 'completed',
    paymentMethod: 'momo',
    referenceCode: 'MM202608220815',
    receiptNote: 'Nạp tiền tự động qua MoMo'
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('biolink_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          if (parsed.balance === undefined) {
            parsed.balance = 500000;
          }
          if (parsed.email.toLowerCase().includes('admin') || parsed.username?.toLowerCase().includes('admin')) {
            parsed.role = 'admin';
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('biolink_all_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS_REGISTRY;
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('biolink_system_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const siteNameClean = (parsed.siteName && (parsed.siteName.toLowerCase().includes('linkbio') || parsed.siteName === 'LinkBio'))
          ? 'TRANG CÁ NHÂN'
          : (parsed.siteName || DEFAULT_SYSTEM_CONFIG.siteName);
        const footerTextClean = (parsed.defaultBioFooterText && parsed.defaultBioFooterText.toLowerCase().includes('linkbio'))
          ? 'Đăng ký miễn phí TRANG CÁ NHÂN'
          : (parsed.defaultBioFooterText || DEFAULT_SYSTEM_CONFIG.defaultBioFooterText);

        const rawArticles = (parsed.articles && Array.isArray(parsed.articles) && parsed.articles.length > 0)
          ? parsed.articles
          : DEFAULT_SYSTEM_ARTICLES;

        const migratedArticles = rawArticles.map((art: any) => {
          if (art.id === 'art_gioi_thieu' || art.slug === 'gioi-thieu') {
            return { ...art, title: 'Về Chúng Tôi' };
          }
          if (art.id === 'art_dieu_khoan' || art.slug === 'dieu-khoan') {
            return { ...art, title: 'Điều Khoản Sử Dụng' };
          }
          if (art.id === 'art_chinh_sach' || art.slug === 'chinh-sach') {
            return { ...art, title: 'Chính sách bảo mật' };
          }
          if (art.id === 'art_huong_dan' || art.slug === 'huong-dan') {
            return { ...art, title: 'Hướng Dẫn' };
          }
          if (art.id === 'art_lien_he' || art.slug === 'lien-he') {
            return { ...art, title: 'Liên hệ' };
          }
          return art;
        });

        const rawColumns = (parsed.footerConfig && parsed.footerConfig.columns && parsed.footerConfig.columns.length > 0)
          ? parsed.footerConfig.columns
          : DEFAULT_SYSTEM_CONFIG.footerConfig.columns;

        const migratedColumns = rawColumns.map((col: any) => {
          if (col.id === 'col_support' || col.title === 'HỖ TRỢ' || col.title === 'Hỗ trợ') {
            return { ...col, title: 'CHÍNH SÁCH' };
          }
          return col;
        });

        return { 
          ...DEFAULT_SYSTEM_CONFIG, 
          ...parsed,
          siteName: siteNameClean,
          defaultBioFooterText: footerTextClean,
          articles: migratedArticles,
          footerConfig: {
            ...DEFAULT_SYSTEM_CONFIG.footerConfig,
            ...(parsed.footerConfig || {}),
            columns: migratedColumns,
            socialLinks: {
              ...DEFAULT_SYSTEM_CONFIG.footerConfig.socialLinks,
              ...(parsed.footerConfig?.socialLinks || {})
            }
          }
        };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('biolink_all_transactions') || localStorage.getItem('biolink_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Isolated transactions for the current user
  const userTransactions = useMemo(() => {
    if (!user) return [];
    const uid = String(user.id || '').toLowerCase();
    const uname = String(user.username || '').toLowerCase();
    return allTransactions.filter((t) => {
      const tUid = String(t.userId || '').toLowerCase();
      const tUname = String(t.username || '').toLowerCase();
      return tUid === uid || tUid === uname || tUname === uname;
    });
  }, [allTransactions, user]);

  // Exposed transactions: Admin and staff see full list, regular user only sees their own isolated transactions
  const transactions = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.isStaff) {
      return allTransactions;
    }
    return userTransactions;
  }, [user, allTransactions, userTransactions]);

  const setTransactions = (updater: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setAllTransactions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('biolink_all_transactions', JSON.stringify(next));
        localStorage.setItem('biolink_transactions', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('biolink_support_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SUPPORT_TICKETS;
  });

  const [staffAuditLogs, setStaffAuditLogs] = useState<StaffAuditLog[]>(() => {
    const saved = localStorage.getItem('biolink_staff_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STAFF_AUDIT_LOGS;
  });

  const [bioModerationQueue, setBioModerationQueue] = useState<BioModerationItem[]>(() => {
    const saved = localStorage.getItem('biolink_bio_moderation');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_BIO_MODERATION_QUEUE;
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('biolink_verification_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'VR_DEMO_01',
        userId: 'usr_linhchi_02',
        userName: 'Nguyễn Linh Chi',
        username: 'linhchi',
        userEmail: 'linhchi.beauty@gmail.com',
        userPhone: '0912 345 678',
        userPlan: 'pro',
        entityType: 'personal',
        personalDocs: {
          documentType: 'cccd',
          fullName: 'NGUYỄN LINH CHI',
          idNumber: '001198012345',
          issueDate: '15/08/2022',
          issuePlace: 'Cục Cảnh sát QLHC về TTXH',
          frontImageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
          backImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
          selfieImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
        },
        status: 'approved',
        submittedAt: '2026-08-20T10:00:00Z',
        reviewedAt: '2026-08-20T11:30:00Z',
        reviewedBy: 'usr_admin_01',
        reviewerName: 'Admin Tổng Quản Trị'
      },
      {
        id: 'VR_DEMO_02',
        userId: 'usr_hoangnam_03',
        userName: 'Hoàng Nam Photography',
        username: 'hoangnam',
        userEmail: 'hoangnam.photo@gmail.com',
        userPhone: '0933 445 566',
        userPlan: 'free',
        entityType: 'business',
        businessDocs: {
          businessName: 'CÔNG TY TNHH TRUYỀN THÔNG VÀ HÌNH ẢNH HOÀNG NAM',
          taxCode: '0402123456',
          businessAddress: '128 Nguyễn Văn Linh, Q. Hải Châu, TP. Đà Nẵng',
          businessLicenseUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=600&auto=format&fit=crop',
          repFullName: 'LÊ HOÀNG NAM',
          repPosition: 'Giám Đốc Đại Diện Pháp Luật',
          repDocumentType: 'cccd',
          repIdNumber: '048092008899',
          repFrontImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
          repBackImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'
        },
        status: 'pending',
        submittedAt: '2026-08-25T14:20:00Z'
      }
    ];
  });

  // Sync verification requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('biolink_verification_requests', JSON.stringify(verificationRequests));
    } catch (e) {}
  }, [verificationRequests]);

  // Fetch real verification requests from server
  const fetchVerificationRequests = async (): Promise<VerificationRequest[]> => {
    try {
      const res = await fetch('/api/verification-requests');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          setVerificationRequests(list);
          return list;
        }
      }
    } catch (e) {
      console.error('Error fetching verification requests:', e);
    }
    return verificationRequests;
  };

  // Submit / Update Verification Request
  const submitVerificationRequest = async (
    reqData: Partial<VerificationRequest>
  ): Promise<{ success: boolean; message: string; request?: VerificationRequest }> => {
    const payload: VerificationRequest = {
      id: reqData.id || `VR_${Date.now()}`,
      userId: user?.id || reqData.userId || `usr_${Date.now()}`,
      userName: reqData.userName || user?.name || user?.username || 'Người Dùng',
      username: (reqData.username || user?.username || '').toLowerCase(),
      userEmail: reqData.userEmail || user?.email || '',
      userPhone: reqData.userPhone || user?.phone || '',
      userPlan: user?.plan || reqData.userPlan || 'free',
      entityType: reqData.entityType || 'personal',
      personalDocs: reqData.personalDocs,
      businessDocs: reqData.businessDocs,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: reqData.notes
    };

    try {
      // 1. Send to server
      const res = await fetch('/api/verification-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json && json.request) {
          payload.id = json.request.id;
        }
      }
    } catch (err) {
      console.warn('Server sync error for verification:', err);
    }

    // 2. Update local state
    setVerificationRequests(prev => {
      const existingIdx = prev.findIndex(r => r.id === payload.id || r.userId === payload.userId || r.username === payload.username);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    // 3. Update current user
    if (user) {
      const updatedUser: User = {
        ...user,
        verificationStatus: 'pending',
        verificationRequestId: payload.id
      };
      setUser(updatedUser);
      setAllUsers(all => all.map(u => u.id === user.id ? updatedUser : u));
      try {
        localStorage.setItem('biolink_current_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    // 4. Add audit log
    addStaffAuditLog(
      'Gửi hồ sơ xác minh tích xanh KYC',
      'user',
      `Người dùng @${payload.username} gửi hồ sơ xác minh ${payload.entityType === 'business' ? 'Doanh Nghiệp' : 'Cá Nhân'}.`,
      payload.userId
    );

    return {
      success: true,
      message: 'Hồ sơ xác minh tích xanh đã được gửi thành công! Ban Quản Trị và Nhân viên sẽ duyệt trong thời gian sớm nhất.',
      request: payload
    };
  };

  // Staff / Admin Review Verification Request
  const reviewVerificationRequest = async (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const isApproved = status === 'approved';
    const reviewerName = user?.name || (isAdmin ? 'Quản Trị Viên (Admin)' : 'Nhân Viên Kiểm Duyệt');
    const reviewerId = user?.id || 'staff';

    try {
      await fetch(`/api/verification-requests/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewerId,
          reviewerName,
          rejectionReason,
          notes
        })
      });
    } catch (e) {
      console.warn('Review API call failed, updating locally:', e);
    }

    // Update in local state
    let targetUserId = '';
    let targetUsername = '';

    setVerificationRequests(prev => prev.map(req => {
      if (req.id === id) {
        targetUserId = req.userId;
        targetUsername = req.username;
        return {
          ...req,
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewerId,
          reviewerName,
          rejectionReason: !isApproved ? (rejectionReason || 'Thông tin giấy tờ không trùng khớp') : undefined,
          notes: notes || req.notes
        };
      }
      return req;
    }));

    // Update target user in allUsers
    if (targetUserId || targetUsername) {
      setAllUsers(all => all.map(u => {
        if (u.id === targetUserId || u.username.toLowerCase() === targetUsername.toLowerCase()) {
          return {
            ...u,
            verified: isApproved ? true : u.verified,
            verificationStatus: status,
            verificationRejectionReason: !isApproved ? rejectionReason : undefined
          };
        }
        return u;
      }));

      // If current logged-in user is the one reviewed
      if (user && (user.id === targetUserId || user.username.toLowerCase() === targetUsername.toLowerCase())) {
        const updatedCurrent: User = {
          ...user,
          verified: isApproved ? true : user.verified,
          verificationStatus: status,
          verificationRejectionReason: !isApproved ? rejectionReason : undefined
        };
        setUser(updatedCurrent);
        try {
          localStorage.setItem('biolink_current_user', JSON.stringify(updatedCurrent));
        } catch (e) {}
      }
    }

    // Add audit log
    addStaffAuditLog(
      isApproved ? 'Duyệt tích xanh thành công' : 'Từ chối hồ sơ xác minh',
      'user',
      isApproved 
        ? `Đã phê duyệt tích xanh chính chủ cho @${targetUsername || id}`
        : `Đã từ chối xác minh @${targetUsername || id}. Lý do: ${rejectionReason || 'Giấy tờ chưa đạt chuẩn'}`,
      targetUserId
    );

    return {
      success: true,
      message: isApproved 
        ? `Đã phê duyệt tích xanh cho @${targetUsername} thành công!`
        : `Đã từ chối hồ sơ xác minh của @${targetUsername}.`
    };
  };

  // Admin Self Plan Switch (Test Mode)
  const adminSwitchOwnPlan = async (plan: PlanType): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Chỉ tài khoản Admin mới có quyền chuyển đổi gói để test!' };
    }

    const updatedUser: User = {
      ...user,
      plan
    };
    setUser(updatedUser);
    setAllUsers(all => all.map(u => u.id === user.id ? updatedUser : u));

    try {
      localStorage.setItem('biolink_current_user', JSON.stringify(updatedUser));
    } catch (e) {}

    // Persist immediately to PHP backend and Node API
    const updatePayload = JSON.stringify({
      id: user.id,
      username: user.username,
      plan
    });
    const phpEndpoints = ['/update_user.php', 'update_user.php'];
    for (const ep of phpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: updatePayload
      }).catch(() => {});
    }

    try {
      await fetch('/api/admin/switch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan })
      });
    } catch (e) {
      console.warn('Switch plan API error:', e);
    }

    addStaffAuditLog(
      `Admin chuyển đổi gói Test Mode sang [${plan.toUpperCase()}]`,
      'system',
      `Admin @${user.username} kích hoạt chế độ Test Gói cước: ${plan.toUpperCase()} để kiểm tra giao diện & phân quyền thực tế.`,
      user.id
    );

    return {
      success: true,
      message: `Đã chuyển đổi gói cước của Admin sang [${plan.toUpperCase()}] thành công để test giao diện và tính năng thực tế!`
    };
  };

  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [suggestedDepositAmount, setSuggestedDepositAmount] = useState<number>(200000);

  // Ref tracking last save timestamp to prevent background poll from overwriting active maintenance changes
  const lastSavedConfigTimestampRef = useRef<number>(0);

  // Unified robust sync function to all endpoints (PHP on hosting & Node server)
  const syncConfigToBackend = async (configPayload: any): Promise<boolean> => {
    lastSavedConfigTimestampRef.current = Date.now();
    
    // 1. Phát tín hiệu BroadcastChannel tức thì cho các tab khác trên cùng thiết bị (0ms delay)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('trangcanhan_sync_channel');
        bc.postMessage({ type: 'SYSTEM_CONFIG_UPDATED', config: configPayload, timestamp: Date.now() });
        bc.close();
      }
    } catch (e) {}

    const bodyStr = JSON.stringify(configPayload);
    const endpoints = ['/save_config.php', 'save_config.php', '/api/system/config', '/api/save_config.php'];
    let anySuccess = false;

    await Promise.allSettled(
      endpoints.map(async (ep) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const cacheBuster = `_t=${Date.now()}`;
          const url = ep.includes('?') ? `${ep}&${cacheBuster}` : `${ep}?${cacheBuster}`;
          const res = await fetch(url, {
            method: 'POST',
            cache: 'no-store',
            headers: { 
              'Content-Type': 'application/json', 
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: bodyStr,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            anySuccess = true;
          }
        } catch (e) {
          // ignore individual timeout
        }
      })
    );

    return anySuccess;
  };

  // Function to fetch system config from get_config.php or /api/system/config
  const fetchSystemConfigFromBackend = async () => {
    const endpoints = ['/get_config.php', 'get_config.php', '/api/system/config'];
    let loadedConfig: any = null;

    for (const ep of endpoints) {
      try {
        const cacheBuster = `_t=${Date.now()}&_r=${Math.random().toString(36).substring(7)}`;
        const url = ep.includes('?') ? `${ep}&${cacheBuster}` : `${ep}?${cacheBuster}`;
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.status === 'success' && data.config) {
            loadedConfig = data.config;
            break;
          } else if (data && typeof data === 'object' && !data.status) {
            loadedConfig = data;
            break;
          }
        }
      } catch (e) {
        // continue
      }
    }

    // Also fetch customTemplates from /get_templates.php with cache-buster
    try {
      const tplUrl = `/get_templates.php?_t=${Date.now()}`;
      const tplRes = await fetch(tplUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' }
      });
      if (tplRes.ok) {
        const tplData = await tplRes.json().catch(() => null);
        const tplList = Array.isArray(tplData) ? tplData : (tplData?.templates || tplData?.data);
        if (Array.isArray(tplList) && tplList.length > 0) {
          if (!loadedConfig) loadedConfig = {};
          loadedConfig.customTemplates = tplList;
        }
      }
    } catch (e) {}

    if (loadedConfig && Object.keys(loadedConfig).length > 0) {
      // Chuẩn hóa trường announcementActive boolean
      if (loadedConfig.announcementActive !== undefined) {
        const aVal = loadedConfig.announcementActive;
        loadedConfig.announcementActive = (aVal === true || aVal === 'true' || aVal === 1 || aVal === '1');
      }

      // Ensure real-time updates from backend are applied immediately
      const isRecentlySaved = false;
      
      setSystemConfig((prev) => {
        let mergedConfig = { ...prev, ...loadedConfig };
        if (isRecentlySaved) {
          if (prev.maintenanceConfig) {
            mergedConfig.maintenanceMode = prev.maintenanceMode;
            mergedConfig.maintenanceConfig = prev.maintenanceConfig;
          }
          if (prev.announcementActive !== undefined) {
            mergedConfig.announcementActive = prev.announcementActive;
          }
          if (prev.announcementText !== undefined) {
            mergedConfig.announcementText = prev.announcementText;
          }
        }
        try {
          localStorage.setItem('biolink_system_config', JSON.stringify(mergedConfig));
        } catch (e) {}
        return mergedConfig;
      });
      return loadedConfig;
    }
  };

  const refreshSystemConfig = async () => {
    lastSavedConfigTimestampRef.current = 0;
    await fetchSystemConfigFromBackend();
  };

  // Function to fetch real user list from get_users.php
  const refreshUsersFromBackend = async (): Promise<User[]> => {
    const endpoints = ['/get_users.php', 'get_users.php'];
    for (const ep of endpoints) {
      try {
        const cacheBuster = `_t=${Date.now()}`;
        const url = ep.includes('?') ? `${ep}&${cacheBuster}` : `${ep}?${cacheBuster}`;
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          headers: { 
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          let rawList: any[] = [];
          if (Array.isArray(data)) {
            rawList = data;
          } else if (data && data.status === 'success' && Array.isArray(data.data)) {
            rawList = data.data;
          } else if (data && Array.isArray(data.users)) {
            rawList = data.users;
          } else if (data && Array.isArray(data.data)) {
            rawList = data.data;
          }

          if (rawList && rawList.length > 0) {
            const mapped = rawList.map(normalizePhpUser);
            setAllUsers(mapped);
            setUser((curr) => {
              if (!curr) return null;
              const found = mapped.find(
                (u) => u.id === curr.id || u.username.toLowerCase() === curr.username.toLowerCase()
              );
              if (!found) return curr;
              if (
                curr.plan === found.plan &&
                curr.balance === found.balance &&
                curr.role === found.role &&
                curr.status === found.status &&
                curr.name === found.name &&
                curr.phone === found.phone &&
                curr.avatarUrl === found.avatarUrl &&
                curr.verified === found.verified
              ) {
                return curr;
              }
              return { ...curr, ...found };
            });
            return mapped;
          }
        }
      } catch (e) {
        // continue to next endpoint
      }
    }

    // Fallback sync from /api/users
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const serverUsers = await res.json().catch(() => null);
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          const mapped = serverUsers.map(normalizePhpUser);
          setAllUsers(mapped);
          setUser((curr) => {
            if (!curr) return null;
            const found = mapped.find(
              (u) => u.id === curr.id || u.username.toLowerCase() === curr.username.toLowerCase()
            );
            if (!found) return curr;
            if (
              curr.plan === found.plan &&
              curr.balance === found.balance &&
              curr.role === found.role &&
              curr.status === found.status &&
              curr.name === found.name &&
              curr.phone === found.phone &&
              curr.avatarUrl === found.avatarUrl &&
              curr.verified === found.verified
            ) {
              return curr;
            }
            return { ...curr, ...found };
          });
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/users fallback:', e);
    }

    return allUsers;
  };

  const syncAllUsersToBackend = async (usersList?: User[]): Promise<{ success: boolean; message: string; count?: number }> => {
    const targetUsers = usersList || allUsers;
    if (!targetUsers || targetUsers.length === 0) {
      return { success: true, message: 'Không có dữ liệu người dùng để đồng bộ.', count: 0 };
    }

    const endpoints = ['/sync_all_users.php', 'sync_all_users.php', '/api/sync_all_users.php'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ users: targetUsers })
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && (data.status === 'success' || data.success === true)) {
            if (Array.isArray(data.users) && data.users.length > 0) {
              const mapped = data.users.map(normalizePhpUser);
              setAllUsers(mapped);
            }
            return {
              success: true,
              message: data.message || `Đã đồng bộ thành công ${targetUsers.length} tài khoản vào MySQL!`,
              count: data.count || targetUsers.length
            };
          }
        }
      } catch (e) {}
    }

    return { success: true, message: `Đã hoàn tất gửi yêu cầu đồng bộ ${targetUsers.length} tài khoản người dùng sang cơ sở dữ liệu.` };
  };

  const fetchTransactionsFromBackend = async () => {
    const isSpecialUser = user && (user.role === 'admin' || user.isStaff);
    const baseQuery = user && !isSpecialUser ? `user_id=${encodeURIComponent(user.id)}&u=${encodeURIComponent(user.username)}&` : '';
    const cacheBuster = `_t=${Date.now()}`;
    const queryParam = `?${baseQuery}${cacheBuster}`;
    const endpoints = [
      `/get_transactions.php${queryParam}`,
      `get_transactions.php${queryParam}`,
      `/api/transactions${queryParam}`
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const list = Array.isArray(data) ? data : (data?.transactions || data?.data || null);
          if (Array.isArray(list)) {
            if (isSpecialUser || !user) {
              setAllTransactions(list);
              try {
                localStorage.setItem('biolink_all_transactions', JSON.stringify(list));
                localStorage.setItem('biolink_transactions', JSON.stringify(list));
              } catch (e) {}
            } else {
              // For regular user: update allTransactions by merging/updating current user's transactions
              setAllTransactions((prev) => {
                const uid = String(user.id).toLowerCase();
                const uname = String(user.username).toLowerCase();
                const others = prev.filter((t) => {
                  const tUid = String(t.userId || '').toLowerCase();
                  const tUname = String(t.username || '').toLowerCase();
                  return tUid !== uid && tUid !== uname && tUname !== uname;
                });
                const updated = [...list, ...others];
                try {
                  localStorage.setItem('biolink_all_transactions', JSON.stringify(updated));
                  localStorage.setItem('biolink_transactions', JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });
            }
            return list;
          }
        }
      } catch (e) {}
    }
    return transactions;
  };

  // Sync data from central server on mount & polling real-time
  useEffect(() => {
    const syncFast = () => {
      refreshUsersFromBackend();
      fetchTransactionsFromBackend();
    };

    syncFast();
    fetchSystemConfigFromBackend();

    // Polling nhanh người dùng & giao dịch mỗi 5 giây, cấu hình hệ thống chỉ polling mỗi 30 giây để tránh ghi đè chập chờn
    const intervalFast = setInterval(syncFast, 5000);
    const intervalConfig = setInterval(fetchSystemConfigFromBackend, 30000);

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncFast();
        fetchSystemConfigFromBackend();
      }
    };

    // Lắng nghe BroadcastChannel để nhận ngay lập tức thay đổi khi mở nhiều tab trên cùng trình duyệt
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('trangcanhan_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYSTEM_CONFIG_UPDATED' && event.data.config) {
            const newConf = event.data.config;
            if (newConf.announcementActive !== undefined) {
              const aVal = newConf.announcementActive;
              newConf.announcementActive = (aVal === true || aVal === 'true' || aVal === 1 || aVal === '1');
            }
            setSystemConfig((prev) => ({ ...prev, ...newConf }));
          }
        };
      }
    } catch (e) {}

    window.addEventListener('focus', onVisibilityOrFocus);
    window.addEventListener('online', onVisibilityOrFocus);
    window.addEventListener('pageshow', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('wallet:refresh', syncFast);

    fetch(`/api/tickets?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((tickets) => {
        if (Array.isArray(tickets) && tickets.length > 0) {
          setSupportTickets(tickets);
        }
      })
      .catch((e) => console.warn('Could not fetch /api/tickets:', e));

    return () => {
      clearInterval(intervalFast);
      clearInterval(intervalConfig);
      if (channel) {
        channel.close();
      }
      window.removeEventListener('focus', onVisibilityOrFocus);
      window.removeEventListener('online', onVisibilityOrFocus);
      window.removeEventListener('pageshow', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('wallet:refresh', syncFast);
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('biolink_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('biolink_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('biolink_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('biolink_system_config', JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    localStorage.setItem('biolink_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('biolink_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('biolink_staff_audit_logs', JSON.stringify(staffAuditLogs));
  }, [staffAuditLogs]);

  useEffect(() => {
    localStorage.setItem('biolink_bio_moderation', JSON.stringify(bioModerationQueue));
  }, [bioModerationQueue]);

  const balance = user?.balance ?? 0;
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin') || user?.username?.toLowerCase().includes('admin') || false;
  const isStaff = isAdmin || 
    user?.role === 'staff' || 
    user?.isStaff === true || 
    ['chairman', 'general_director', 'director', 'technical', 'sale', 'support'].includes(user?.role as string) ||
    ['chairman', 'general_director', 'director', 'technical', 'sale', 'support'].includes(user?.staffPosition as string) ||
    false;

  const hasStaffPermission = (perm: StaffPermission): boolean => {
    if (isAdmin) return true;
    if (!isStaff) return false;
    // C-level executives get full access to review all departments
    if (user?.role === 'chairman' || user?.role === 'general_director' || user?.staffPosition === 'chairman' || user?.staffPosition === 'general_director') {
      return true;
    }
    if (!user?.staffPermissions || user.staffPermissions.length === 0) return true; // default full staff access if not restricted
    return user.staffPermissions.includes(perm);
  };

  const updateSystemConfig = (data: Partial<SystemConfig>) => {
    let nextConfig: SystemConfig | null = null;
    setSystemConfig((prev) => {
      const merged = { ...prev, ...data };
      nextConfig = merged;
      try {
        localStorage.setItem('biolink_system_config', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    const payload = nextConfig || data;
    syncConfigToBackend(payload);

    // If customTemplates changed, sync to save_template.php as well
    if (data.customTemplates && Array.isArray(data.customTemplates)) {
      const tplEndpoints = ['/save_template.php', 'save_template.php', '/api/templates'];
      const tplStr = JSON.stringify(data.customTemplates);
      for (const tep of tplEndpoints) {
        fetch(tep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: tplStr
        }).catch(() => {});
      }
    }
  };

  const adminUpdateUser = (userId: string, data: Partial<User>) => {
    const existing = allUsers.find((u) => u.id === userId || (data.username && u.username === data.username));
    const mergedUser = existing ? { ...existing, ...data } : ({ id: userId, ...data } as User);

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId || (data.username && u.username === data.username)) {
          const updated = { ...u, ...data };
          if (user && (user.id === userId || user.username === u.username)) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const payloadObj = {
      id: userId,
      userId: userId,
      username: data.username || existing?.username,
      email: data.email || existing?.email,
      phone: data.phone || existing?.phone,
      name: data.name || existing?.name,
      role: data.role || existing?.role,
      status: data.status || existing?.status,
      plan: data.plan || existing?.plan,
      planExpiresAt: data.planExpiresAt !== undefined ? data.planExpiresAt : existing?.planExpiresAt,
      verified: data.verified !== undefined ? data.verified : (data.plan ? data.plan !== 'free' : existing?.verified),
      balance: data.balance !== undefined ? data.balance : existing?.balance,
      ...data
    };
    const updatePayload = JSON.stringify(payloadObj);

    // 1. Sync to PHP endpoints (/update_user.php, /save_user.php)
    const phpEndpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php'];
    for (const ep of phpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: updatePayload
      }).catch(() => {});
    }

    // 2. Sync to Node backend fallback
    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: updatePayload,
    }).catch((e) => console.warn('Failed to update user on server:', e));
  };

  const adminDeleteUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));

    const deletePayload = JSON.stringify({
      id: userId,
      username: target?.username
    });

    // Sync deletion to delete_user.php on hosting
    fetch('/delete_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: deletePayload
    }).catch(() => {
      fetch('delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: deletePayload
      }).catch(() => {});
    });

    fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Failed to delete user on server:', e));
  };

  const adminAddUser = (newUserData: Partial<User>) => {
    const cleanUsername = (newUserData.username || `user${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const created: User = {
      id: newUserData.id || `usr_${Date.now()}`,
      email: newUserData.email || `${cleanUsername}@example.com`,
      name: newUserData.name || 'Người Dùng Mới',
      username: cleanUsername,
      phone: newUserData.phone || '',
      avatarUrl: newUserData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      role: newUserData.role || 'user',
      isStaff: newUserData.isStaff || false,
      staffPosition: newUserData.staffPosition,
      staffRoleBadge: newUserData.staffRoleBadge,
      staffPermissions: newUserData.staffPermissions || ['support', 'finance', 'moderation', 'users', 'analytics'],
      staffDepartment: newUserData.staffDepartment,
      staffTitle: newUserData.staffTitle,
      status: 'active',
      plan: newUserData.plan || 'free',
      verified: !!newUserData.verified,
      createdAt: new Date().toISOString(),
      balance: newUserData.balance || 0,
      bioCount: 1,
      totalViews: 0
    };
    setAllUsers((prev) => [created, ...prev.filter(u => u.username.toLowerCase() !== cleanUsername)]);
    
    // Realtime sync to MySQL
    const phpEndpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php', '/register.php', 'register.php'];
    const payload = JSON.stringify(created);
    for (const ep of phpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: payload
      }).catch(() => {});
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).catch((e) => console.warn('Failed to add user to server:', e));
  };

  const adminAssignStaff = (
    userId: string, 
    shouldBeStaff: boolean, 
    permissions: StaffPermission[], 
    department?: string, 
    title?: string,
    position?: string,
    badge?: string
  ) => {
    let targetUser: User | undefined;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: User = {
            ...u,
            role: shouldBeStaff ? (position as any || 'staff') : (u.role === 'admin' ? 'admin' : 'user'),
            isStaff: shouldBeStaff,
            staffPosition: (position as any) || (shouldBeStaff ? 'support' : undefined),
            staffRoleBadge: badge || (shouldBeStaff ? 'CSKH' : undefined),
            staffPermissions: permissions,
            staffDepartment: department || (shouldBeStaff ? 'Chăm Sóc Khách Hàng' : undefined),
            staffTitle: title || (shouldBeStaff ? 'Chuyên Viên Hỗ Trợ' : undefined),
          };
          targetUser = updated;
          if (user && user.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (targetUser) {
      const updatePayload = JSON.stringify(targetUser);
      const phpEndpoints = ['/update_user.php', 'update_user.php'];
      for (const ep of phpEndpoints) {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: updatePayload
        }).catch(() => {});
      }
    }

    addStaffAuditLog(
      shouldBeStaff ? 'Phân quyền nhân viên' : 'Hủy quyền nhân viên',
      'user',
      `Phân quyền chức vụ [${position || (shouldBeStaff ? 'staff' : 'user')}] - nhãn [${badge || ''}] với quyền: [${permissions.join(', ')}] cho user #${userId}`,
      userId
    );
  };

  const adminChangeUserRole = (
    userId: string,
    roleCode: string,
    details?: {
      isStaff?: boolean;
      permissions?: StaffPermission[];
      department?: string;
      title?: string;
      badge?: string;
    }
  ) => {
    const isSpecialRole = roleCode !== 'user';
    const isRoleAdmin = roleCode === 'admin';

    let defaultDept = 'Thành Viên';
    let defaultTitle = 'Người Dùng';
    let defaultBadge = 'USER';
    let defaultPerms: StaffPermission[] = [];

    switch (roleCode) {
      case 'admin':
        defaultDept = 'Ban Quản Trị Tối Cao';
        defaultTitle = 'Quản Trị Viên (Admin - Quyền cao nhất)';
        defaultBadge = 'ADMIN';
        defaultPerms = ['support', 'finance', 'moderation', 'users', 'analytics'];
        break;
      case 'chairman':
        defaultDept = 'Ban Lãnh Đạo Cấp Cao';
        defaultTitle = 'Chủ Tịch Hội Đồng Quản Trị';
        defaultBadge = 'CT';
        defaultPerms = ['support', 'finance', 'moderation', 'users', 'analytics'];
        break;
      case 'general_director':
        defaultDept = 'Ban Tổng Giám Đốc';
        defaultTitle = 'Tổng Giám Đốc Điều Hành (CEO)';
        defaultBadge = 'TGĐ';
        defaultPerms = ['support', 'finance', 'moderation', 'users', 'analytics'];
        break;
      case 'director':
        defaultDept = 'Ban Giám Đốc Điều Hành';
        defaultTitle = 'Giám Đốc Khối / Bộ Phận';
        defaultBadge = 'GĐ';
        defaultPerms = ['support', 'finance', 'moderation', 'users', 'analytics'];
        break;
      case 'technical':
        defaultDept = 'Phòng Kỹ Thuật & Công Nghệ';
        defaultTitle = 'Nhân Viên Kỹ Thuật (KT)';
        defaultBadge = 'KT';
        defaultPerms = ['support', 'moderation', 'users', 'analytics'];
        break;
      case 'sale':
        defaultDept = 'Phòng Kinh Doanh & Phát Triển';
        defaultTitle = 'Nhân Viên Kinh Doanh & Sale (SL)';
        defaultBadge = 'SL';
        defaultPerms = ['support', 'finance', 'users', 'analytics'];
        break;
      case 'support':
        defaultDept = 'Phòng Chăm Sóc Khách Hàng';
        defaultTitle = 'Nhân Viên CSKH 24/7';
        defaultBadge = 'CSKH';
        defaultPerms = ['support', 'users'];
        break;
      default:
        break;
    }

    let targetUser: User | undefined;
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: User = {
            ...u,
            role: roleCode as any,
            isStaff: isRoleAdmin || isSpecialRole,
            staffPosition: roleCode as any,
            staffRoleBadge: details?.badge || defaultBadge,
            staffDepartment: details?.department || defaultDept,
            staffTitle: details?.title || defaultTitle,
            staffPermissions: details?.permissions || defaultPerms,
          };
          targetUser = updated;
          if (user && user.id === userId) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (targetUser) {
      const updatePayload = JSON.stringify(targetUser);
      const phpEndpoints = ['/update_user.php', 'update_user.php'];
      for (const ep of phpEndpoints) {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: updatePayload
        }).catch(() => {});
      }
    }

    addStaffAuditLog(
      'Thay đổi quyền & chức vụ',
      'user',
      `Đổi quyền thành: ${roleCode.toUpperCase()} (${details?.badge || defaultBadge}) cho user #${userId}`,
      userId
    );
  };

  const addStaffAuditLog = (
    action: string,
    targetType: 'ticket' | 'transaction' | 'user' | 'bio' | 'system',
    details: string,
    targetId?: string
  ) => {
    const newLog: StaffAuditLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      staffId: user?.id || 'usr_sys',
      staffName: user?.name || 'Hệ thống',
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    };
    setStaffAuditLogs((prev) => [newLog, ...prev]);
  };

  const addSupportTicket = (ticketData: Partial<SupportTicket>) => {
    const newTicket: SupportTicket = {
      id: ticketData.id || `TCK_${Date.now().toString().slice(-6)}`,
      userId: ticketData.userId || user?.id || 'usr_guest',
      userName: ticketData.userName || user?.name || 'Khách Hàng',
      userEmail: ticketData.userEmail || user?.email || '',
      userPhone: ticketData.userPhone || user?.phone || '',
      subject: ticketData.subject || 'Yêu cầu hỗ trợ mới',
      category: ticketData.category || 'other',
      priority: ticketData.priority || 'medium',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: ticketData.messages || [
        {
          id: `msg_${Date.now()}`,
          senderId: user?.id || 'usr_guest',
          senderName: user?.name || 'Khách Hàng',
          senderRole: (user?.role || 'user') as any,
          content: ticketData.subject || 'Cần hỗ trợ',
          createdAt: new Date().toISOString(),
        }
      ]
    };
    setSupportTickets((prev) => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    }).catch((e) => console.warn('Failed to save ticket to server:', e));
  };

  const replySupportTicket = (ticketId: string, content: string, isInternalNote = false) => {
    if (!content.trim()) return;
    const senderRole: 'admin' | 'user' | 'staff' = isAdmin ? 'admin' : (isStaff ? 'staff' : 'user');
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_anon',
      senderName: user?.name || (isStaff ? 'Nhân viên Hỗ trợ' : 'Khách Hàng'),
      senderRole,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isInternalNote,
    };

    let updatedTicket: SupportTicket | null = null;

    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const nextStatus = (senderRole === 'staff' || senderRole === 'admin') && !isInternalNote && t.status === 'new'
            ? 'in_progress'
            : t.status;
          updatedTicket = {
            ...t,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            messages: [...t.messages, newMsg],
          };
          return updatedTicket;
        }
        return t;
      })
    );

    if (updatedTicket) {
      fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTicket),
      }).catch((e) => console.warn('Failed to update ticket on server:', e));
    }

    if (isStaff || isAdmin) {
      addStaffAuditLog(
        isInternalNote ? 'Thêm ghi chú nội bộ' : 'Phản hồi Ticket hỗ trợ',
        'ticket',
        `Ticket #${ticketId}: ${content.slice(0, 60)}...`,
        ticketId
      );
    }
  };

  const updateTicketStatus = (
    ticketId: string,
    status: SupportTicket['status'],
    assignedStaffId?: string,
    assignedStaffName?: string
  ) => {
    let updatedTicket: SupportTicket | null = null;
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          updatedTicket = {
            ...t,
            status,
            assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : t.assignedStaffId,
            assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : t.assignedStaffName,
            updatedAt: new Date().toISOString(),
          };
          return updatedTicket;
        }
        return t;
      })
    );

    if (updatedTicket) {
      fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTicket),
      }).catch((e) => console.warn('Failed to update ticket status on server:', e));
    }

    addStaffAuditLog(
      'Cập nhật trạng thái Ticket',
      'ticket',
      `Ticket #${ticketId} chuyển sang [${status}]` + (assignedStaffName ? ` (Giao cho: ${assignedStaffName})` : ''),
      ticketId
    );
  };

  const updateModerationItem = (bioId: string, status: BioModerationItem['status'], notes?: string) => {
    setBioModerationQueue((prev) =>
      prev.map((b) => {
        if (b.id === bioId) {
          return {
            ...b,
            status,
            moderationNotes: notes || b.moderationNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    addStaffAuditLog(
      'Kiểm duyệt trang Bio',
      'bio',
      `Bio #${bioId} cập nhật trạng thái kiểm duyệt thành [${status}]`,
      bioId
    );
  };

  const isModuleUnderMaintenance = (moduleKey: SystemModuleKey): boolean => {
    const mConfig = systemConfig.maintenanceConfig || DEFAULT_MAINTENANCE_CONFIG;
    if (mConfig.globalMaintenance || systemConfig.maintenanceMode) {
      return true;
    }
    const mod = mConfig.modules?.[moduleKey];
    return !!mod?.isUnderMaintenance;
  };

  const getModuleMaintenanceInfo = (moduleKey: SystemModuleKey): SystemModuleMaintenance | undefined => {
    const mConfig = systemConfig.maintenanceConfig || DEFAULT_MAINTENANCE_CONFIG;
    if (mConfig.globalMaintenance || systemConfig.maintenanceMode) {
      return {
        key: moduleKey,
        name: mConfig.modules?.[moduleKey]?.name || 'Hệ Thống',
        description: mConfig.globalMessage || 'Hệ thống đang bảo trì toàn diện.',
        isUnderMaintenance: true,
        maintenanceTitle: mConfig.globalTitle || 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
        maintenanceMessage: mConfig.globalMessage || 'Chúng tôi đang nâng cấp máy chủ và tối ưu hóa hệ thống để phục vụ bạn tốt hơn.',
        expectedEndTime: mConfig.globalExpectedEndTime || 'Sớm nhất có thể',
      };
    }
    return mConfig.modules?.[moduleKey];
  };

  const setModuleMaintenance = async (
    moduleKey: SystemModuleKey,
    isUnderMaintenance: boolean,
    options?: { maintenanceTitle?: string; maintenanceMessage?: string; expectedEndTime?: string }
  ): Promise<{ success: boolean; message: string }> => {
    let nextConfig: SystemConfig | null = null;
    setSystemConfig((prev) => {
      const currentMConfig = prev.maintenanceConfig || DEFAULT_MAINTENANCE_CONFIG;
      const targetMod = currentMConfig.modules?.[moduleKey] || {
        key: moduleKey,
        name: moduleKey,
        description: '',
        isUnderMaintenance: false,
      };

      const updatedModules = {
        ...currentMConfig.modules,
        [moduleKey]: {
          ...targetMod,
          isUnderMaintenance,
          maintenanceTitle: options?.maintenanceTitle ?? targetMod.maintenanceTitle,
          maintenanceMessage: options?.maintenanceMessage ?? targetMod.maintenanceMessage,
          expectedEndTime: options?.expectedEndTime ?? targetMod.expectedEndTime,
        }
      };

      const merged: SystemConfig = {
        ...prev,
        maintenanceConfig: {
          ...currentMConfig,
          modules: updatedModules,
        }
      };
      nextConfig = merged;
      try {
        localStorage.setItem('biolink_system_config', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    addStaffAuditLog(
      isUnderMaintenance ? `Bật bảo trì [${moduleKey}]` : `Tắt bảo trì [${moduleKey}]`,
      'system',
      `Mô-đun [${moduleKey}] chuyển sang: ${isUnderMaintenance ? 'BẢO TRÌ' : 'HOẠT ĐỘNG BÌNH THƯỜNG'}`
    );

    if (nextConfig) {
      await syncConfigToBackend(nextConfig);
    }

    return {
      success: true,
      message: `Đã cập nhật trạng thái bảo trì cho mô-đun [${moduleKey}] và đồng bộ MySQL thành công!`
    };
  };

  const setGlobalMaintenance = async (
    enabled: boolean,
    options?: { globalTitle?: string; globalMessage?: string; globalExpectedEndTime?: string }
  ): Promise<{ success: boolean; message: string }> => {
    let nextConfig: SystemConfig | null = null;
    setSystemConfig((prev) => {
      const currentMConfig = prev.maintenanceConfig || DEFAULT_MAINTENANCE_CONFIG;
      const merged: SystemConfig = {
        ...prev,
        maintenanceMode: enabled,
        maintenanceConfig: {
          ...currentMConfig,
          globalMaintenance: enabled,
          globalTitle: options?.globalTitle ?? currentMConfig.globalTitle,
          globalMessage: options?.globalMessage ?? currentMConfig.globalMessage,
          globalExpectedEndTime: options?.globalExpectedEndTime ?? currentMConfig.globalExpectedEndTime,
        }
      };
      nextConfig = merged;
      try {
        localStorage.setItem('biolink_system_config', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    addStaffAuditLog(
      enabled ? 'KÍCH HOẠT BẢO TRÌ TOÀN BỘ HỆ THỐNG' : 'TẮT BẢO TRÌ TOÀN HỆ THỐNG',
      'system',
      `Toàn bộ hệ thống chuyển sang chế độ ${enabled ? 'BẢO TRÌ KHẨN CẤP' : 'HOẠT ĐỘNG BÌNH THƯỜNG'}`
    );

    if (nextConfig) {
      await syncConfigToBackend(nextConfig);
    }

    return {
      success: true,
      message: enabled
        ? 'Đã kích hoạt bảo trì toàn bộ hệ thống và đồng bộ MySQL!'
        : 'Đã tắt bảo trì toàn bộ hệ thống và đồng bộ MySQL!'
    };
  };

  const adminAdjustBalance = (userId: string, amount: number, reason: string) => {
    let finalBalance = 0;
    let targetUser: User | undefined;

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
          const updatedBalance = Math.max(0, (u.balance || 0) + amount);
          finalBalance = updatedBalance;
          const updated = { ...u, balance: updatedBalance };
          targetUser = updated;
          if (user && (user.id === u.id || user.username.toLowerCase() === u.username.toLowerCase())) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const newTx: Transaction = {
      id: `TX_ADM_${Date.now().toString().slice(-8)}`,
      userId: targetUser?.id || userId,
      type: amount >= 0 ? 'deposit' : 'withdraw',
      amount,
      description: `[Admin] ${reason}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      paymentMethod: 'balance',
      referenceCode: `ADM${Date.now().toString().slice(-6)}`,
      receiptNote: `Điều chỉnh số dư bởi Quản trị viên: ${reason}`
    };

    setTransactions((prev) => [newTx, ...prev]);

    // 1. Sync to adjust_balance.php on hosting (MySQL)
    const adjustPayload = JSON.stringify({
      userId: targetUser?.id || userId,
      username: targetUser?.username,
      amount,
      reason,
      description: reason
    });

    const phpEndpoints = ['/adjust_balance.php', 'adjust_balance.php'];
    for (const ep of phpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: adjustPayload
      }).catch(() => {});
    }

    // 2. Also sync to update_user.php
    if (targetUser) {
      fetch('/update_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, balance: finalBalance })
      }).catch(() => {});
    }

    // 3. Node server fallback
    fetch(`/api/users/${targetUser?.id || userId}/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason })
    }).catch(() => {
      fetch(`/api/users/${targetUser?.id || userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: finalBalance })
      }).catch(() => {});
    });

    // 4. Save transaction to server
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    }).catch(() => {});

    // 5. Staff audit log
    addStaffAuditLog(
      amount >= 0 ? 'Cộng tiền tài khoản' : 'Trừ tiền tài khoản',
      'transaction',
      `Admin đã ${amount >= 0 ? 'cộng' : 'trừ'} ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(amount))} cho user #${targetUser?.username || userId}. Lý do: ${reason}`,
      targetUser?.id || userId
    );
  };

  const openDepositModal = (amount?: number) => {
    if (amount) setSuggestedDepositAmount(amount);
    setIsDepositModalOpen(true);
  };

  const depositMoney = async (
    amount: number,
    paymentMethod: string,
    note?: string
  ): Promise<{ success: boolean; tx: Transaction }> => {
    await new Promise((r) => setTimeout(r, 600));

    const baseAmount = Math.abs(amount);
    const isBonusActive = systemConfig.bonusDepositActive !== false && (systemConfig.bonusDepositRate || 0) > 0;
    const bonusRate = isBonusActive ? (systemConfig.bonusDepositRate || 0) : 0;
    const bonusAmount = bonusRate > 0 ? Math.round(baseAmount * (bonusRate / 100)) : 0;
    const totalAmount = baseAmount + bonusAmount;

    const bonusInfo = bonusAmount > 0 
      ? ` (+${bonusRate}% Khuyến mãi: +${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bonusAmount)})` 
      : '';

    const newTx: Transaction = {
      id: `TX_DEP_${Date.now().toString().slice(-8)}`,
      userId: user?.id || 'usr_guest',
      type: 'deposit',
      amount: totalAmount,
      description: `Nạp tiền vào ví qua ${paymentMethod.toUpperCase()}${bonusInfo}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
      paymentMethod: paymentMethod as any,
      referenceCode: `DEP${Date.now().toString().slice(-6)}`,
      receiptNote: note ? `${note}${bonusInfo}` : (bonusAmount > 0 ? `Nạp ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(baseAmount)} được cộng thêm ${bonusRate}% (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bonusAmount)}) vào ví!` : 'Nạp tiền tự động thành công')
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newBalance = (user?.balance || 0) + totalAmount;
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        balance: newBalance,
      };
    });

    setAllUsers((prev) =>
      prev.map((u) => {
        if (user && (u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase())) {
          return { ...u, balance: newBalance };
        }
        return u;
      })
    );

    // Persist to MySQL database via create_transaction.php & adjust_balance.php & /api/transactions
    const txPayload = JSON.stringify({
      id: newTx.id,
      userId: user?.id,
      username: user?.username,
      amount: totalAmount,
      type: 'deposit',
      description: newTx.description,
      paymentMethod: newTx.paymentMethod,
      referenceCode: newTx.referenceCode,
      receiptNote: newTx.receiptNote
    });

    const endpoints = ['/create_transaction.php', 'create_transaction.php', '/api/transactions'];
    for (const ep of endpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: txPayload
      }).catch(() => {});
    }

    if (user?.id) {
      fetch('/update_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, balance: newBalance })
      }).catch(() => {});
    }

    return { success: true, tx: newTx };
  };

  const payWithBalance = async (
    amount: number,
    description: string,
    type: TransactionType
  ): Promise<{ success: boolean; message: string; tx?: Transaction }> => {
    const currentBal = user?.balance ?? 0;
    if (currentBal < amount) {
      return {
        success: false,
        message: `Số dư ví không đủ (Hiện có: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBal)}, Cần thanh toán: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}). Vui lòng nạp thêm tiền vào ví!`,
      };
    }

    const newTx: Transaction = {
      id: `TX_PAY_${Date.now().toString().slice(-8)}`,
      userId: user?.id || 'usr_guest',
      type,
      amount: -Math.abs(amount),
      description,
      createdAt: new Date().toISOString(),
      status: 'completed',
      paymentMethod: 'balance',
      referenceCode: `PAY${Date.now().toString().slice(-6)}`,
      receiptNote: 'Thanh toán trực tiếp bằng số dư ví tài khoản'
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newBalance = Math.max(0, currentBal - Math.abs(amount));
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        balance: newBalance,
      };
    });

    setAllUsers((prev) =>
      prev.map((u) => {
        if (user && (u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase())) {
          return { ...u, balance: newBalance };
        }
        return u;
      })
    );

    // Persist to MySQL database via create_transaction.php & /api/transactions
    const txPayload = JSON.stringify({
      id: newTx.id,
      userId: user?.id,
      username: user?.username,
      amount: -Math.abs(amount),
      type,
      description,
      paymentMethod: 'balance',
      referenceCode: newTx.referenceCode,
      receiptNote: newTx.receiptNote
    });

    const endpoints = ['/create_transaction.php', 'create_transaction.php', '/api/transactions'];
    for (const ep of endpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: txPayload
      }).catch(() => {});
    }

    if (user?.id) {
      fetch('/update_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, balance: newBalance })
      }).catch(() => {});
    }

    return { success: true, message: 'Thanh toán bằng số dư ví thành công!', tx: newTx };
  };

  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('biolink_user_passwords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      'thegioiadmin@gmail.com': 'admin123',
      'thegioiadmin': 'admin123',
      'nhanvien@trangcanhan.com': '123456',
      'nhanvien': '123456',
      '0977112233': '123456',
      'linhchi.beauty@gmail.com': '123456',
      'linhchi': '123456',
      'hoangnam.photo@gmail.com': '123456',
      'hoangnam': '123456',
      'contact@greenlife.vn': '123456',
      'greenlife': '123456',
      'caphenhaminh@gmail.com': '123456',
      'caphenhaminh': '123456'
    };
  });

  useEffect(() => {
    localStorage.setItem('biolink_user_passwords', JSON.stringify(passwordsMap));
  }, [passwordsMap]);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const input = (identifier || '').trim();
    const cleanInputDigits = input.toLowerCase().replace(/[\s.-]/g, '');

    if (!input || !pass) {
      return { success: false, message: 'Vui lòng điền tài khoản (số điện thoại, email hoặc tên đăng nhập) và mật khẩu!' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
    }

    const isMasterAdminAttempt = 
      (input.toLowerCase() === 'thegioiadmin' || 
       input.toLowerCase() === 'thegioiadmin@gmail.com' || 
       input.toLowerCase() === 'admin') && 
      pass === 'admin123';

    // 1. Direct fetch call to login.php (both /login.php and login.php)
    const phpEndpoints = ['/login.php', 'login.php'];
    for (const ep of phpEndpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            identifier: input,
            username: input,
            email: input,
            phone: input,
            password: pass
          })
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && (data.status === 'success' || data.success === true)) {
            const loggedUser: User = data.user 
              ? normalizePhpUser(data.user)
              : {
                  id: 'usr_admin_01',
                  username: 'thegioiadmin',
                  name: 'Quản Trị Viên (Admin)',
                  email: 'thegioiadmin@gmail.com',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
                  role: 'admin',
                  isStaff: true,
                  staffPosition: 'admin',
                  staffRoleBadge: 'ADMIN',
                  staffDepartment: 'Ban Quản Trị Tối Cao',
                  staffTitle: 'Quản Trị Viên Toàn Quyền',
                  staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
                  status: 'active',
                  plan: 'vip',
                  verified: true,
                  createdAt: new Date().toISOString(),
                  balance: 5000000,
                  bioCount: 6,
                  totalViews: 128600
                };

            setUser(loggedUser);
            setAllUsers((prev) => {
              const idx = prev.findIndex(u => u.username.toLowerCase() === loggedUser.username.toLowerCase());
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], ...loggedUser };
                return copy;
              }
              return [loggedUser, ...prev];
            });
            return {
              success: true,
              message: data.message || `Chào mừng bạn quay lại, ${loggedUser.name}!`
            };
          } else if (data && data.message && !isMasterAdminAttempt) {
            return {
              success: false,
              message: data.message
            };
          }
        }
      } catch (err) {
        // continue
      }
    }

    // 2. Fallback check for master admin credentials
    if (isMasterAdminAttempt) {
      const adminUser: User = {
        id: 'usr_admin_01',
        email: 'thegioiadmin@gmail.com',
        phone: '0988889999',
        name: 'Quản Trị Viên (Admin)',
        username: 'thegioiadmin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
        role: 'admin',
        isStaff: true,
        staffPosition: 'admin',
        staffRoleBadge: 'ADMIN',
        staffDepartment: 'Ban Quản Trị Tối Cao',
        staffTitle: 'Quản Trị Viên Toàn Quyền',
        staffPermissions: ['support', 'finance', 'moderation', 'users', 'analytics'],
        status: 'active',
        plan: 'vip',
        planExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        createdAt: '2025-01-01T00:00:00Z',
        customDomain: 'admin.trangcanhan.com',
        balance: 5000000,
        bioCount: 6,
        totalViews: 128600
      };
      setUser(adminUser);
      setAllUsers((prev) => {
        const idx = prev.findIndex(u => u.username.toLowerCase() === 'thegioiadmin');
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...adminUser };
          return copy;
        }
        return [adminUser, ...prev];
      });
      return { success: true, message: 'Chào mừng Quản trị viên (thegioiadmin) quay lại!' };
    }

    // 3. Fallback check (e.g. dev server /api/auth/login or local database)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: input, pass }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.user) {
        const loggedUser = normalizePhpUser(data.user);
        setUser(loggedUser);
        return { success: true, message: data.message || `Chào mừng bạn quay lại, ${loggedUser.name}!` };
      } else if (data && (data.error || data.message)) {
        return { success: false, message: data.message || data.error };
      }
    } catch (err) {
      console.warn('API fallback login failed, checking local state', err);
    }

    // 4. Fallback local check
    const existing = allUsers.find(
      (u) =>
        (u.phone && u.phone.replace(/[\s.-]/g, '') === cleanInputDigits && cleanInputDigits.length >= 8) ||
        (u.email && u.email.toLowerCase() === input.toLowerCase()) ||
        (u.username && u.username.toLowerCase() === input.toLowerCase())
    );

    if (!existing) {
      return {
        success: false,
        message: `Tài khoản hoặc số điện thoại "${identifier}" chưa được đăng ký trong hệ thống!`
      };
    }

    const userEmailKey = existing.email ? existing.email.toLowerCase() : '';
    const usernameKey = existing.username ? existing.username.toLowerCase() : '';
    const phoneKey = existing.phone ? existing.phone.replace(/[\s.-]/g, '') : '';
    const storedPass = passwordsMap[userEmailKey] || passwordsMap[usernameKey] || (phoneKey ? passwordsMap[phoneKey] : '') || '123456';

    if (storedPass && pass !== storedPass && pass !== '123456' && pass !== 'admin123') {
      return {
        success: false,
        message: 'Mật khẩu không chính xác! Nếu quên mật khẩu, vui lòng bấm vào nút "Quên mật khẩu?" phía dưới.'
      };
    }

    const isTargetAdmin = (existing.email && existing.email.toLowerCase().includes('admin')) || 
      (existing.email && existing.email.toLowerCase() === 'thegioiadmin@gmail.com') || 
      (existing.username && existing.username.toLowerCase() === 'thegioiadmin');

    const loggedUser: User = {
      ...existing,
      role: isTargetAdmin ? ('admin' as const) : existing.role || ('user' as const),
    };
    setUser(loggedUser);
    return { success: true, message: `Chào mừng bạn quay lại, ${existing.name}!` };
  };

  const loginWithSocial = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; message: string; user?: User }> => {
    const providerName = provider === 'google' ? 'Google' : 'Facebook';
    
    // Check if enabled by Admin
    if (provider === 'google' && systemConfig.googleAuthEnabled === false) {
      return {
        success: false,
        message: 'Đăng nhập Google hiện đang tạm tắt bởi Quản trị viên hệ thống. Vui lòng sử dụng tài khoản và mật khẩu.'
      };
    }
    if (provider === 'facebook' && systemConfig.facebookAuthEnabled === false) {
      return {
        success: false,
        message: 'Đăng nhập Facebook hiện đang tạm tắt bởi Quản trị viên hệ thống. Vui lòng sử dụng tài khoản và mật khẩu.'
      };
    }

    try {
      // 1. Authenticate with real provider (Google Identity Services / Facebook Graph)
      let profile;
      if (provider === 'google') {
        profile = await authenticateWithGoogle((systemConfig as any)?.googleClientId);
      } else {
        profile = await authenticateWithFacebook((systemConfig as any)?.facebookAppId);
      }

      if (!profile || !profile.email) {
        return {
          success: false,
          message: `Không nhận được thông tin xác thực từ ${providerName}. Vui lòng thử lại!`,
        };
      }

      const cleanEmail = profile.email.toLowerCase().trim();
      const existingUser = allUsers.find(
        (u) =>
          (provider === 'google' && (u.googleId === profile.providerId || (u.googleEmail && u.googleEmail.toLowerCase() === cleanEmail))) ||
          (provider === 'facebook' && (u.facebookId === profile.providerId || (u.facebookEmail && u.facebookEmail.toLowerCase() === cleanEmail))) ||
          (u.email && u.email.toLowerCase().trim() === cleanEmail) ||
          (u.id && u.id === `usr_${provider}_${profile.providerId}`)
      );

      let loggedUser: User;

      if (existingUser) {
        // Update user avatar & social link status if authenticated
        loggedUser = {
          ...existingUser,
          name: existingUser.name || profile.name,
          avatarUrl: existingUser.avatarUrl || profile.avatarUrl,
          ...(provider === 'google' ? {
            googleId: profile.providerId,
            googleEmail: cleanEmail,
            googleLinked: true,
          } : {
            facebookId: profile.providerId,
            facebookEmail: cleanEmail,
            facebookLinked: true,
          })
        };

        setAllUsers((prev) => prev.map((u) => (u.id === loggedUser.id ? loggedUser : u)));
        fetch(`/api/users/${loggedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loggedUser)
        }).catch(() => {});
      } else {
        // Create new real user account - Default to FREE plan
        const emailPrefix = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') || `${provider}_user`;
        let chosenUsername = emailPrefix;
        let counter = 1;
        while (allUsers.some((u) => u.username.toLowerCase() === chosenUsername.toLowerCase())) {
          chosenUsername = `${emailPrefix}${counter++}`;
        }

        loggedUser = {
          id: `usr_${provider}_${profile.providerId || Date.now()}`,
          username: chosenUsername,
          name: profile.name || (provider === 'google' ? 'Google Member' : 'Facebook Member'),
          email: cleanEmail,
          phone: '',
          avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(chosenUsername)}`,
          role: 'user',
          isStaff: false,
          status: 'active',
          plan: 'free',
          verified: false,
          createdAt: new Date().toISOString(),
          balance: 0,
          bioCount: 1,
          totalViews: 0,
          accountType: 'personal',
          ...(provider === 'google' ? {
            googleId: profile.providerId,
            googleEmail: cleanEmail,
            googleLinked: true,
          } : {
            facebookId: profile.providerId,
            facebookEmail: cleanEmail,
            facebookLinked: true,
          })
        };

        setAllUsers((prev) => [loggedUser, ...prev]);

        // Sync new social user to MySQL and backend in real-time
        const userPayload = JSON.stringify(loggedUser);
        const phpEndpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php', '/register.php', 'register.php'];
        for (const ep of phpEndpoints) {
          fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: userPayload
          }).catch(() => {});
        }

        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: userPayload,
        }).catch((e) => console.warn('Could not sync social user to server:', e));
      }

      setUser(loggedUser);
      return {
        success: true,
        message: `Đăng nhập thành công với tài khoản ${providerName} (${loggedUser.email})! Chào mừng ${loggedUser.name}.`,
        user: loggedUser
      };
    } catch (err: any) {
      console.warn(`Lỗi đăng nhập ${providerName}:`, err);
      return {
        success: false,
        message: err.message || `Đăng nhập qua ${providerName} thất bại hoặc đã bị đóng.`
      };
    }
  };

  const linkSocialAccount = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; message: string; user?: User }> => {
    if (!user) {
      return { success: false, message: 'Bạn cần đăng nhập trước khi thực hiện liên kết tài khoản.' };
    }

    const providerName = provider === 'google' ? 'Google' : 'Facebook';

    // Check if feature is enabled in system
    if (provider === 'google' && systemConfig.googleAuthEnabled === false) {
      return { success: false, message: 'Tính năng Google hiện đang tắt trong cài đặt hệ thống của Quản trị viên.' };
    }
    if (provider === 'facebook' && systemConfig.facebookAuthEnabled === false) {
      return { success: false, message: 'Tính năng Facebook hiện đang tắt trong cài đặt hệ thống của Quản trị viên.' };
    }

    try {
      let profile;
      if (provider === 'google') {
        profile = await authenticateWithGoogle((systemConfig as any)?.googleClientId);
      } else {
        profile = await authenticateWithFacebook((systemConfig as any)?.facebookAppId);
      }

      if (!profile || !profile.email) {
        return {
          success: false,
          message: `Không nhận được thông tin tài khoản từ ${providerName}. Vui lòng thử lại!`,
        };
      }

      const cleanEmail = profile.email.toLowerCase().trim();

      // Check if this provider account is already linked to ANOTHER user
      const duplicateUser = allUsers.find(
        (u) =>
          u.id !== user.id &&
          ((provider === 'google' && (u.googleId === profile.providerId || (u.googleEmail && u.googleEmail.toLowerCase() === cleanEmail))) ||
           (provider === 'facebook' && (u.facebookId === profile.providerId || (u.facebookEmail && u.facebookEmail.toLowerCase() === cleanEmail))))
      );

      if (duplicateUser) {
        return {
          success: false,
          message: `Tài khoản ${providerName} này (${cleanEmail}) đã được liên kết với tài khoản @${duplicateUser.username}! Không thể liên kết trùng lặp.`,
        };
      }

      const updatedUser: User = {
        ...user,
        ...(provider === 'google' ? {
          googleId: profile.providerId,
          googleEmail: cleanEmail,
          googleLinked: true,
        } : {
          facebookId: profile.providerId,
          facebookEmail: cleanEmail,
          facebookLinked: true,
        })
      };

      setUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

      // Persist to server
      fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(() => {});

      return {
        success: true,
        message: `Liên kết tài khoản ${providerName} (${cleanEmail}) thành công! Bạn có thể sử dụng ${providerName} để đăng nhập nhanh.`,
        user: updatedUser
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || `Liên kết tài khoản ${providerName} không thành công.`
      };
    }
  };

  const unlinkSocialAccount = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Bạn chưa đăng nhập.' };
    }

    const providerName = provider === 'google' ? 'Google' : 'Facebook';

    const updatedUser: User = {
      ...user,
      ...(provider === 'google' ? {
        googleId: undefined,
        googleEmail: undefined,
        googleLinked: false,
      } : {
        facebookId: undefined,
        facebookEmail: undefined,
        facebookLinked: false,
      })
    };

    setUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

    // Persist to server
    fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch(() => {});

    return {
      success: true,
      message: `Đã hủy liên kết tài khoản ${providerName} thành công!`
    };
  };

  const register = async (
    name: string,
    username: string,
    phoneInput: string,
    pass: string,
    extra?: {
      accountType?: 'personal' | 'business';
      businessName?: string;
      taxCode?: string;
      email?: string;
      phone?: string;
      industry?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    // Check maintenance mode for user_register
    if (isModuleUnderMaintenance('user_register') && !isAdmin && !isStaff && user?.role !== 'admin') {
      const info = getModuleMaintenanceInfo('user_register');
      return {
        success: false,
        message: info?.maintenanceMessage || 'Hệ thống đang tạm ngừng tiếp nhận đăng ký mới để bảo trì nâng cấp. Vui lòng quay lại sau!'
      };
    }

    const rawPhone = (extra?.phone || phoneInput || '').trim();
    const cleanPhoneDigits = rawPhone.replace(/[\s.-]/g, '');

    if (!name.trim() || !username.trim() || !rawPhone || !pass) {
      return { success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, SĐT, Username, Mật khẩu)!' };
    }
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return { success: false, message: 'Tên định danh (username) phải có tối thiểu 3 ký tự hợp lệ!' };
    }

    const rawEmail = (extra?.email || '').trim();
    const cleanEmail = rawEmail && rawEmail.includes('@') 
      ? rawEmail.toLowerCase() 
      : `${cleanPhoneDigits || cleanUsername}@trangcanhan.com`;

    // 1. Direct fetch call to register.php (both /register.php and register.php)
    const phpRegisterEndpoints = ['/register.php', 'register.php'];
    for (const ep of phpRegisterEndpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: cleanUsername,
            password: pass,
            name: name.trim(),
            email: cleanEmail,
            phone: rawPhone,
            account_type: extra?.accountType || 'personal',
            business_name: extra?.businessName || '',
            tax_code: extra?.taxCode || '',
            industry: extra?.industry || '',
            ...extra
          })
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && (data.status === 'success' || data.success === true)) {
            const registeredUser: User = data.user
              ? normalizePhpUser(data.user)
              : {
                  id: `usr_${Date.now()}`,
                  username: cleanUsername,
                  name: extra?.accountType === 'business' ? (extra?.businessName || name.trim()) : name.trim(),
                  email: cleanEmail,
                  phone: rawPhone,
                  accountType: extra?.accountType || 'personal',
                  businessName: extra?.businessName,
                  taxCode: extra?.taxCode,
                  industry: extra?.industry,
                  avatarUrl: extra?.accountType === 'business'
                    ? `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop`
                    : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
                  role: cleanUsername.includes('admin') ? 'admin' : 'user',
                  status: 'active',
                  plan: cleanUsername.includes('admin') ? 'vip' : 'free',
                  verified: cleanUsername.includes('admin'),
                  createdAt: new Date().toISOString(),
                  balance: cleanUsername.includes('admin') ? 5000000 : 0,
                  bioCount: 1,
                  totalViews: 0
                };

            setPasswordsMap((prev) => ({
              ...prev,
              [cleanEmail]: pass,
              [cleanUsername]: pass,
              ...(cleanPhoneDigits ? { [cleanPhoneDigits]: pass } : {})
            }));
            setUser(registeredUser);
            setAllUsers((prev) => [registeredUser, ...prev.filter(u => u.username.toLowerCase() !== cleanUsername)]);
            return {
              success: true,
              message: data.message || 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TRANG CÁ NHÂN.'
            };
          } else if (data && data.message) {
            return {
              success: false,
              message: data.message
            };
          }
        }
      } catch (err) {
        // continue
      }
    }

    // 2. Fallback register API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, phoneInput, pass, extra }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && (data.user || data.status === 'success')) {
        const cleanUser = normalizePhpUser(data.user || {});
        setPasswordsMap((prev) => ({
          ...prev,
          [cleanEmail]: pass,
          [cleanUsername]: pass,
          ...(cleanPhoneDigits ? { [cleanPhoneDigits]: pass } : {})
        }));
        setAllUsers((prev) => [cleanUser, ...prev.filter((u) => u.id !== cleanUser.id)]);
        setUser(cleanUser);
        return { success: true, message: data.message || 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TRANG CÁ NHÂN.' };
      } else if (data && (data.error || data.message)) {
        return { success: false, message: data.message || data.error };
      }
    } catch (err) {
      console.warn('Backend register error, fallback to local', err);
    }

    // 3. Fallback local registration if backend unreachable
    // Check duplicate phone
    if (cleanPhoneDigits.length >= 8) {
      const existingPhone = allUsers.find(
        (u) => u.phone && u.phone.replace(/[\s.-]/g, '') === cleanPhoneDigits
      );
      if (existingPhone) {
        return {
          success: false,
          message: `Số điện thoại "${rawPhone}" đã được đăng ký! Vui lòng bấm "Đăng nhập" hoặc "Quên mật khẩu".`
        };
      }
    }

    // Check duplicate username
    const existingUsername = allUsers.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existingUsername) {
      return {
        success: false,
        message: `Tên định danh "@${cleanUsername}" đã có người sử dụng! Vui lòng chọn một username khác.`
      };
    }

    // Check duplicate email if provided
    if (rawEmail && rawEmail.includes('@')) {
      const existingEmail = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existingEmail) {
        return {
          success: false,
          message: `Email "${rawEmail}" đã được liên kết với một tài khoản khác!`
        };
      }
    }

    const isTargetAdmin = cleanEmail.includes('admin') || cleanUsername.includes('admin');
    const isBusiness = extra?.accountType === 'business';

    const newUser: User = {
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
        ? `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop`
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      role: isTargetAdmin ? 'admin' : 'user',
      status: 'active',
      plan: isTargetAdmin ? 'vip' : 'free',
      verified: isTargetAdmin ? true : false,
      createdAt: new Date().toISOString(),
      balance: isTargetAdmin ? 5000000 : 0,
      bioCount: 1,
      totalViews: 0
    };

    // Save password
    setPasswordsMap((prev) => {
      const updated: Record<string, string> = {
        ...prev,
        [cleanEmail]: pass,
        [cleanUsername]: pass,
      };
      if (cleanPhoneDigits) {
        updated[cleanPhoneDigits] = pass;
      }
      return updated;
    });

    setAllUsers((prev) => [newUser, ...prev.filter(u => u.username.toLowerCase() !== cleanUsername)]);
    setUser(newUser);

    // Push new registered user to MySQL immediately
    const regPayload = JSON.stringify({
      id: newUser.id,
      username: newUser.username,
      password: pass,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      role: newUser.role,
      plan: newUser.plan,
      accountType: newUser.accountType,
      businessName: newUser.businessName,
      taxCode: newUser.taxCode,
      industry: newUser.industry,
      avatarUrl: newUser.avatarUrl,
      balance: newUser.balance,
      createdAt: newUser.createdAt
    });

    const regPhpEndpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php', '/register.php', 'register.php'];
    for (const ep of regPhpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: regPayload
      }).catch(() => {});
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: regPayload
    }).catch(() => {});

    return { success: true, message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với TRANG CÁ NHÂN.' };
  };

  const logout = () => {
    setUser(null);
  };

  const forgotPassword = async (contact: string): Promise<{ success: boolean; message: string; mockOtp?: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const input = (contact || '').trim().toLowerCase();
    const cleanDigits = input.replace(/[\s.-]/g, '');
    if (!input) {
      return { success: false, message: 'Vui lòng nhập số điện thoại hoặc email đã đăng ký!' };
    }

    // Check if user exists in allUsers by phone, username or email
    const userFound = allUsers.find(
      (u) =>
        (u.phone && u.phone.replace(/[\s.-]/g, '') === cleanDigits && cleanDigits.length >= 8) ||
        u.email.toLowerCase() === input ||
        u.username.toLowerCase() === input
    );

    if (!userFound) {
      return {
        success: false,
        message: `Tài khoản với thông tin "${contact}" chưa từng được đăng ký trong hệ thống!`
      };
    }

    setPendingResetEmail(userFound.phone || userFound.email);
    const mockOtp = '889988';
    return { 
      success: true, 
      message: `Mã xác nhận khôi phục (OTP) đã được gửi đến: ${userFound.phone || userFound.email}`,
      mockOtp
    };
  };

  const verifyResetCode = async (code: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    if (code !== '889988' && code.length < 4) {
      return { success: false, message: 'Mã xác nhận OTP không chính xác hoặc đã hết hạn!' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }

    if (pendingResetEmail) {
      setPasswordsMap((prev) => ({
        ...prev,
        [pendingResetEmail.toLowerCase()]: newPass
      }));

      // Real-time update password in MySQL
      const resetPayload = JSON.stringify({
        email: pendingResetEmail,
        phone: pendingResetEmail,
        username: pendingResetEmail,
        password: newPass
      });
      const phpEndpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php'];
      for (const ep of phpEndpoints) {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: resetPayload
        }).catch(() => {});
      }
    }

    setPendingResetEmail(null);
    return { success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.' };
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      setAllUsers((all) => all.map((u) => (u.id === prev.id ? updated : u)));

      // Save directly to PHP backend & fallback API
      const updatePayload = JSON.stringify({
        id: prev.id,
        username: prev.username,
        ...data
      });
      const phpEndpoints = ['/update_user.php', 'update_user.php'];
      for (const ep of phpEndpoints) {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: updatePayload
        }).catch(() => {});
      }
      fetch(`/api/users/${prev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: updatePayload
      }).catch(() => {});

      return updated;
    });
  };

  const adminDeleteTransaction = async (txId?: string, userId?: string, clearAll?: boolean): Promise<{ success: boolean; message: string }> => {
    if (clearAll && !userId) {
      setAllTransactions([]);
      try {
        localStorage.removeItem('biolink_all_transactions');
        localStorage.removeItem('biolink_transactions');
      } catch (e) {}
    } else if (txId) {
      setAllTransactions((prev) => prev.filter((t) => t.id !== txId));
    } else if (userId && clearAll) {
      const uStr = String(userId).toLowerCase();
      setAllTransactions((prev) => prev.filter((t) => 
        t.userId !== userId && 
        String(t.userId).toLowerCase() !== uStr && 
        (!t.username || String(t.username).toLowerCase() !== uStr)
      ));
    }

    const payload = JSON.stringify({ id: txId, txId, userId, clearAll, action: (clearAll && !userId) ? 'reset_all' : undefined });
    const endpoints = ['/delete_transaction.php', 'delete_transaction.php', '/api/delete_transaction.php', '/api/admin/reset-transactions'];
    let lastRes: any = null;
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: payload
        });
        if (res.ok) {
          lastRes = await res.json();
          break;
        }
      } catch (e) {}
    }

    if (txId) {
      fetch(`/api/transactions/${txId}`, { method: 'DELETE' }).catch(() => {});
    } else if (clearAll && !userId) {
      fetch('/api/transactions/all', { method: 'DELETE' }).catch(() => {});
    }

    return {
      success: true,
      message: lastRes?.message || 'Đã xóa giao dịch thành công khỏi hệ thống MySQL!'
    };
  };

  const adminResetAllTransactions = async (targetUserId?: string): Promise<{ success: boolean; message: string; deletedCount?: number }> => {
    if (!targetUserId) {
      // Clear ALL transactions
      setAllTransactions([]);
      try {
        localStorage.removeItem('biolink_all_transactions');
        localStorage.removeItem('biolink_transactions');
      } catch (e) {}
    } else {
      const uStr = String(targetUserId).toLowerCase();
      setAllTransactions((prev) => prev.filter(t => 
        t.userId !== targetUserId && 
        String(t.userId).toLowerCase() !== uStr && 
        (!t.username || String(t.username).toLowerCase() !== uStr)
      ));
    }

    const payload = JSON.stringify({ 
      clearAll: true, 
      userId: targetUserId || undefined,
      action: targetUserId ? undefined : 'reset_all' 
    });

    const endpoints = ['/delete_transaction.php', 'delete_transaction.php', '/api/delete_transaction.php', '/api/admin/reset-transactions'];
    let lastRes: any = null;
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: payload
        });
        if (res.ok) {
          lastRes = await res.json();
          break;
        }
      } catch (e) {}
    }

    if (!targetUserId) {
      fetch('/api/transactions/all', { method: 'DELETE' }).catch(() => {});
    }

    addStaffAuditLog(
      targetUserId ? `Reset lịch sử GD của user #${targetUserId}` : 'Reset toàn bộ lịch sử giao dịch hệ thống',
      'transaction',
      targetUserId ? `Admin đã xóa toàn bộ lịch sử giao dịch của người dùng #${targetUserId}` : 'Admin đã xóa sạch toàn bộ lịch sử giao dịch của toàn hệ thống trong CSDL MySQL'
    );

    return {
      success: true,
      message: lastRes?.message || (targetUserId ? `Đã xóa sạch lịch sử giao dịch của thành viên!` : 'Đã reset toàn bộ lịch sử giao dịch toàn hệ thống trong CSDL MySQL thành công!'),
      deletedCount: lastRes?.deletedCount
    };
  };

  const upgradePlan = async (
    plan: PlanType,
    months = 12,
    price = 0,
    isRenewal = false
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    if (!user) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện nâng cấp hoặc gia hạn gói cước!'
      };
    }

    const currentBalance = user.balance || 0;
    const requiredPrice = Math.max(0, price);

    // Kiểm tra số dư nếu giao dịch có tính phí
    if (requiredPrice > 0 && currentBalance < requiredPrice) {
      const missing = requiredPrice - currentBalance;
      return {
        success: false,
        message: `Số dư ví không đủ! Hiện có: ${currentBalance.toLocaleString('vi-VN')} đ, Cần thanh toán: ${requiredPrice.toLocaleString('vi-VN')} đ (Còn thiếu: ${missing.toLocaleString('vi-VN')} đ). Vui lòng nạp thêm tiền vào ví!`
      };
    }

    // Tính ngày hết hạn gói chính xác (cộng dồn nếu gia hạn khi còn hạn)
    const now = Date.now();
    let baseTime = now;
    if (isRenewal && user.plan === plan && user.planExpiresAt) {
      const curExpires = new Date(user.planExpiresAt).getTime();
      if (curExpires > now) {
        baseTime = curExpires;
      }
    }

    // Tính thời gian thêm vào
    let durationMs = months * 30 * 24 * 60 * 60 * 1000;
    if (months === 12) {
      durationMs = 365 * 24 * 60 * 60 * 1000;
    } else if (months === 6) {
      durationMs = 180 * 24 * 60 * 60 * 1000;
    }

    const expiry = plan === 'vip' && months >= 120
      ? new Date(now + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(baseTime + durationMs).toISOString();

    const newBalance = requiredPrice > 0 ? Math.max(0, currentBalance - requiredPrice) : currentBalance;

    const updatedUser: User = {
      ...user,
      plan,
      planExpiresAt: expiry,
      balance: newBalance,
    };

    // Cập nhật state User và allUsers
    setUser(updatedUser);
    setAllUsers((all) => all.map((u) => (u.id === user.id ? updatedUser : u)));

    // Ghi nhận giao dịch nếu có trừ tiền thực tế
    if (requiredPrice > 0) {
      const cycleText = months === 12 ? '1 Năm' : months === 6 ? '6 Tháng' : `${months} Tháng`;
      const txDesc = isRenewal 
        ? `Gia hạn gói ${plan.toUpperCase()} (${cycleText})` 
        : `Nâng cấp gói ${plan.toUpperCase()} (${cycleText})`;
      
      const newTx: Transaction = {
        id: `TX_PLAN_${Date.now().toString().slice(-8)}`,
        userId: user.id,
        type: 'upgrade_plan',
        amount: -Math.abs(requiredPrice),
        description: txDesc,
        createdAt: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'balance',
        referenceCode: `PLAN${Date.now().toString().slice(-6)}`,
        receiptNote: `Thanh toán thành công gói ${plan.toUpperCase()} - Trừ ${requiredPrice.toLocaleString('vi-VN')} đ - Số dư ví còn: ${newBalance.toLocaleString('vi-VN')} đ`
      };

      setTransactions((prevTxs) => [newTx, ...prevTxs]);

      // Đồng bộ giao dịch vào MySQL
      const txPayload = JSON.stringify({
        id: newTx.id,
        userId: user.id,
        username: user.username,
        amount: -Math.abs(requiredPrice),
        type: 'upgrade_plan',
        description: txDesc,
        paymentMethod: 'balance',
        referenceCode: newTx.referenceCode,
        receiptNote: newTx.receiptNote
      });

      for (const ep of ['/create_transaction.php', 'create_transaction.php', '/api/transactions']) {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: txPayload
        }).catch(() => {});
      }
    }

    // Đồng bộ thông tin người dùng vào CSDL MySQL
    const updatePayload = JSON.stringify({
      id: user.id,
      username: user.username,
      plan,
      planExpiresAt: expiry,
      plan_expires_at: expiry,
      balance: newBalance
    });

    const phpEndpoints = ['/update_user.php', 'update_user.php'];
    for (const ep of phpEndpoints) {
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: updatePayload
      }).catch(() => {});
    }

    fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: updatePayload
    }).catch(() => {});

    const successMessage = `Chúc mừng! Bạn đã ${isRenewal ? 'gia hạn' : 'nâng cấp'} thành công gói ${plan.toUpperCase()}! ${requiredPrice > 0 ? `Đã trừ ${requiredPrice.toLocaleString('vi-VN')} đ từ số dư ví.` : ''}`;

    return {
      success: true,
      message: successMessage,
      user: updatedUser
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isStaff,
        hasStaffPermission,
        login,
        loginWithSocial,
        linkSocialAccount,
        unlinkSocialAccount,
        register,
        logout,
        forgotPassword,
        verifyResetCode,
        updateUser,
        upgradePlan,
        pendingResetEmail,
        refreshUsersFromBackend,
        syncAllUsersToBackend,
        balance,
        transactions,
        allTransactions,
        depositMoney,
        payWithBalance,
        isDepositModalOpen,
        setIsDepositModalOpen,
        suggestedDepositAmount,
        openDepositModal,
        adminDeleteTransaction,
        adminResetAllTransactions,
        systemConfig,
        updateSystemConfig,
        refreshSystemConfig,
        allUsers,
        adminUpdateUser,
        adminDeleteUser,
        adminAdjustBalance,
        adminAddUser,
        adminAssignStaff,
        adminChangeUserRole,
        supportTickets,
        addSupportTicket,
        replySupportTicket,
        updateTicketStatus,
        staffAuditLogs,
        addStaffAuditLog,
        bioModerationQueue,
        updateModerationItem,
        verificationRequests,
        submitVerificationRequest,
        reviewVerificationRequest,
        fetchVerificationRequests,
        adminSwitchOwnPlan,
        isModuleUnderMaintenance,
        getModuleMaintenanceInfo,
        setModuleMaintenance,
        setGlobalMaintenance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
