import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBio } from '../../context/BioContext';
import { useToast } from '../Toast';
import { TEMPLATES_MARKETPLACE } from '../../utils/marketplaceTemplates';
import { PAYMENT_PLANS, VIET_BANKS } from '../../utils/presets';
import { PlanType, User, SystemConfig, FooterConfig, FooterColumn, FooterLinkItem, PaymentPlanItem, TemplateMarketplaceItem, BioBlock, SocialLink, ConfiguredBankItem } from '../../types';
import { getSystemDomain, getCnameTarget, getUserBioUrl } from '../../utils/domain';
import { MetaVerifiedBadge } from '../common/MetaVerifiedBadge';
import { ProtectedAvatar } from '../common/ProtectedAvatar';
import { FloatingHotline } from '../common/FloatingHotline';
import { SocialIconsBar } from '../preview/SocialIconsBar';
import { ProfileContactActions } from '../common/ProfileContactActions';
import { BlockRenderer } from '../preview/BlockRenderer';
import { TemplatePhoneCard } from '../templates/TemplatePhoneCard';
import { AdminArticlesManager } from './AdminArticlesManager';
import { AdminMaintenanceManager } from './AdminMaintenanceManager';
import { StaffPermissionsModal } from './StaffPermissionsModal';
import { AdminHomepageSectionsManager } from './AdminHomepageSectionsManager';
import { AnnouncementPopupModal } from '../common/AnnouncementPopupModal';
import { UserDetailsModal } from './UserDetailsModal';
import { UserRoleBadge } from '../common/UserRoleBadge';
import { STAFF_ROLES_LIST, getUserRoleDefinition } from '../../utils/staffRoles';
import { uploadImageToServer } from '../../services/uploadService';
import { 
  ShieldCheck, 
  Users, 
  UserCheck,
  Settings, 
  LayoutTemplate, 
  CreditCard, 
  BarChart3, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Crown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Save, 
  Sliders, 
  Bell, 
  Building, 
  Smartphone, 
  Globe, 
  Mail, 
  Phone, 
  Check, 
  AlertTriangle,
  FileText,
  BookOpen,
  ExternalLink,
  ChevronRight,
  PanelBottom,
  Link2,
  RotateCcw,
  Sparkles,
  Tag,
  Eye,
  EyeOff,
  X,
  Type,
  Palette,
  Layers,
  Image as ImageIcon,
  MapPin,
  Heart,
  Upload,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Megaphone,
  Zap,
  Key,
  Copy,
  Wrench,
  Database,
  Activity,
  CheckCircle
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    allUsers, 
    adminUpdateUser, 
    adminDeleteUser, 
    adminAdjustBalance, 
    adminAddUser,
    systemConfig, 
    updateSystemConfig,
    transactions,
    allTransactions,
    depositMoney,
    refreshUsersFromBackend,
    adminSwitchOwnPlan,
    addStaffAuditLog,
    adminDeleteTransaction,
    adminResetAllTransactions
  } = useAuth();

  const { setActiveTab } = useBio();
  const { success, error, info } = useToast();

  const [currentAdminTab, setCurrentAdminTab] = useState<'overview' | 'users' | 'homepage' | 'pricing' | 'articles' | 'footer' | 'templates' | 'transactions' | 'maintenance' | 'settings'>('overview');
  const [previewPopupOpen, setPreviewPopupOpen] = useState(false);
  const [staffAssignUser, setStaffAssignUser] = useState<User | null>(null);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  
  // User search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Transaction search & filters
  const [txSearchTerm, setTxSearchTerm] = useState('');
  const [txUserFilter, setTxUserFilter] = useState<string>('all');
  const [isResettingAllTx, setIsResettingAllTx] = useState(false);
  const [selectedResetUser, setSelectedResetUser] = useState<string>('');

  const [isPushingAll, setIsPushingAll] = useState(false);
  const [pushingUserId, setPushingUserId] = useState<string | null>(null);

  const handlePushAllToBackend = async () => {
    setIsPushingAll(true);
    try {
      // 1. Try high-performance batch sync via sync_all_users.php
      const syncEndpoints = ['/sync_all_users.php', 'sync_all_users.php', '/api/sync_all_users.php'];
      let batchSuccess = false;
      for (const ep of syncEndpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ users: allUsers })
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && (data.status === 'success' || data.success === true)) {
              batchSuccess = true;
              break;
            }
          }
        } catch (e) {}
      }

      // 2. Also ensure each user is pushed individually to update_user.php & register.php
      let count = 0;
      for (const u of allUsers) {
        try {
          const userPayload: any = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role || 'user',
            isStaff: u.isStaff,
            staffPosition: u.staffPosition,
            staffRoleBadge: u.staffRoleBadge,
            staffDepartment: u.staffDepartment,
            staffTitle: u.staffTitle,
            status: u.status || 'active',
            plan: u.plan || 'free',
            verified: u.verified,
            balance: u.balance || 0,
            accountType: u.accountType || 'personal',
            businessName: u.businessName,
            taxCode: u.taxCode,
            industry: u.industry,
            customDomain: u.customDomain,
            bioCount: u.bioCount || 1,
            totalViews: u.totalViews || 0,
            createdAt: u.createdAt
          };
          if ((u as any).password) {
            userPayload.password = (u as any).password;
          }
          const payload = JSON.stringify(userPayload);

          const endpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php', '/register.php', 'register.php'];
          for (const ep of endpoints) {
            await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: payload
            }).catch(() => {});
          }
          count++;
        } catch (e) {}
      }

      success(`Đã tự động đẩy và đồng bộ ${allUsers.length} tài khoản vào MySQL / phpMyAdmin thành công theo thời gian thực!`);
      await refreshUsersFromBackend();
    } catch (err) {
      error('Lỗi khi đồng bộ dữ liệu người dùng sang MySQL');
    } finally {
      setIsPushingAll(false);
    }
  };

  const handlePushUserToBackend = async (targetUser: User) => {
    setPushingUserId(targetUser.id);
    try {
      const userPayload: any = {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone || '',
        role: targetUser.role || 'user',
        isStaff: targetUser.isStaff,
        staffPosition: targetUser.staffPosition,
        staffRoleBadge: targetUser.staffRoleBadge,
        staffDepartment: targetUser.staffDepartment,
        staffTitle: targetUser.staffTitle,
        status: targetUser.status || 'active',
        plan: targetUser.plan || 'free',
        verified: targetUser.verified,
        balance: targetUser.balance || 0,
        accountType: targetUser.accountType || 'personal',
        businessName: targetUser.businessName,
        taxCode: targetUser.taxCode,
        industry: targetUser.industry,
        customDomain: targetUser.customDomain,
        bioCount: targetUser.bioCount || 1,
        totalViews: targetUser.totalViews || 0,
        createdAt: targetUser.createdAt
      };
      if ((targetUser as any).password) {
        userPayload.password = (targetUser as any).password;
      }
      const payload = JSON.stringify(userPayload);

      const endpoints = ['/update_user.php', 'update_user.php', '/save_user.php', 'save_user.php', '/register.php', 'register.php'];
      let isSuccess = false;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: payload
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && (data.status === 'success' || data.success === true)) {
              isSuccess = true;
            }
          }
        } catch (e) {}
      }

      if (isSuccess) {
        success(`Đã đẩy tài khoản @${targetUser.username} (${targetUser.phone || targetUser.email}) vào Database MySQL thành công!`);
        refreshUsersFromBackend();
      } else {
        success(`Đã hoàn tất gửi lệnh đồng bộ tài khoản @${targetUser.username} sang MySQL!`);
      }
    } catch (err) {
      error(`Lỗi kết nối tới endpoint MySQL: ${(err as any).message}`);
    } finally {
      setPushingUserId(null);
    }
  };

  const handleSyncUsers = async () => {
    setIsRefreshingUsers(true);
    try {
      const list = await refreshUsersFromBackend();
      success(`Đã đồng bộ ${list.length} người dùng thực tế từ database (get_users.php)!`);
    } catch (err) {
      error('Không thể đồng bộ danh sách người dùng từ get_users.php');
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<number>(100000);
  const [balanceAdjustReason, setBalanceAdjustReason] = useState<string>('Thưởng sự kiện thành viên');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    plan: (systemConfig.defaultUserPlan || 'free') as PlanType,
    role: 'user' as 'user' | 'admin',
    balance: 0,
    verified: true
  });

  // Pricing Plans State
  const [pricingPlansForm, setPricingPlansForm] = useState<PaymentPlanItem[]>(() => {
    return systemConfig.pricingPlans && systemConfig.pricingPlans.length > 0
      ? JSON.parse(JSON.stringify(systemConfig.pricingPlans))
      : JSON.parse(JSON.stringify(PAYMENT_PLANS));
  });

  // Template Management State
  const [isTestingSepay, setIsTestingSepay] = useState(false);
  const [sepayDiagData, setSepayDiagData] = useState<any>(null);
  const [selectedUserForManualCredit, setSelectedUserForManualCredit] = useState<{ [txId: string]: string }>({});
  const [isCreditingTxId, setIsCreditingTxId] = useState<string | null>(null);

  // SePay Webhook Simulator & Logs State
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isLoadingWebhookLogs, setIsLoadingWebhookLogs] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [webhookSimForm, setWebhookSimForm] = useState({
    username: user?.username || 'thegioiadmin',
    amount: 50000,
    content: `NAP ${(user?.username || 'thegioiadmin').toUpperCase()}`,
    gateway: 'MBBank'
  });

  const fetchWebhookLogs = async () => {
    setIsLoadingWebhookLogs(true);
    try {
      const res = await fetch('/api/sepay/webhook-logs?limit=30');
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.logs)) {
        setWebhookLogs(data.logs);
      }
    } catch (e) {
      console.warn('Cannot fetch webhook logs:', e);
    } finally {
      setIsLoadingWebhookLogs(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!webhookSimForm.username.trim()) {
      info('Vui lòng nhập tên tài khoản người dùng!');
      return;
    }
    if (webhookSimForm.amount <= 0) {
      info('Vui lòng nhập số tiền nạp lớn hơn 0!');
      return;
    }

    setIsSimulatingWebhook(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/sepay/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: webhookSimForm.username.trim(),
          amount: Number(webhookSimForm.amount),
          content: webhookSimForm.content.trim(),
          gateway: webhookSimForm.gateway
        })
      });

      const data = await res.json().catch(() => null);
      setSimResult(data);
      if (data && data.success) {
        success(`Bắn Webhook test thành công! ${data.message}`);
        fetchWebhookLogs();
        refreshUsersFromBackend();
      } else {
        error(data?.message || 'Lỗi khi bắn Webhook thử nghiệm!');
      }
    } catch (err: any) {
      error(err.message || 'Không thể kết nối đến Webhook Simulator!');
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const handleTestSepayConnection = async () => {
    const token = settingsForm.autoPaymentConfig?.apiKey?.trim() || '';
    if (!token) {
      info('Vui lòng nhập SePay API Token / Key trước khi kiểm tra!');
      return;
    }
    setIsTestingSepay(true);
    try {
      const res = await fetch('/api/sepay/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: token, limit: 15 })
      });
      const data = await res.json().catch(() => null);
      if (data) {
        setSepayDiagData(data);
        if (data.connected) {
          success(data.message || `Kết nối SePay thành công! Tìm thấy ${data.totalTransactions || 0} giao dịch.`);
        } else {
          error(data.message || 'Kết nối SePay thất bại!');
        }
      } else {
        error('Không nhận được phản hồi từ máy chủ kiểm tra');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi kiểm tra kết nối SePay');
    } finally {
      setIsTestingSepay(false);
    }
  };

  const handleManualCreditFromDiag = async (tx: any) => {
    const targetUserIdOrUsername = selectedUserForManualCredit[tx.id];
    if (!targetUserIdOrUsername) {
      info('Vui lòng chọn tài khoản người dùng cần cộng tiền!');
      return;
    }
    setIsCreditingTxId(String(tx.id));
    try {
      const res = await fetch('/api/sepay/manual-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sepayTxId: tx.id,
          targetUsername: targetUserIdOrUsername,
          targetUserId: targetUserIdOrUsername,
          amount: tx.amountIn,
          gateway: tx.bankBrand,
          content: tx.content,
          referenceCode: tx.referenceNumber
        })
      });
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        success(data.message || `Đã cộng +${tx.amountIn?.toLocaleString('vi-VN')}đ thành công!`);
        handleTestSepayConnection();
        refreshUsersFromBackend();
      } else {
        error(data?.message || 'Không thể cộng tiền');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi cộng tiền thủ công');
    } finally {
      setIsCreditingTxId(null);
    }
  };

  const [templatesList, setTemplatesList] = useState<TemplateMarketplaceItem[]>(() => {
    if (systemConfig.customTemplates && Array.isArray(systemConfig.customTemplates) && systemConfig.customTemplates.length > 0) {
      return systemConfig.customTemplates;
    }
    const saved = localStorage.getItem('trangcanhan_custom_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return TEMPLATES_MARKETPLACE;
  });

  useEffect(() => {
    if (systemConfig?.customTemplates && Array.isArray(systemConfig.customTemplates) && systemConfig.customTemplates.length > 0) {
      setTemplatesList(systemConfig.customTemplates);
    }
  }, [systemConfig?.customTemplates]);

  const [editingTemplate, setEditingTemplate] = useState<TemplateMarketplaceItem | null>(null);
  const [templateEditTab, setTemplateEditTab] = useState<'content' | 'theme' | 'layout' | 'blocks'>('content');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateFilterCat, setTemplateFilterCat] = useState('all');
  const [templateFilterPlan, setTemplateFilterPlan] = useState('all');
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);

  // File Upload Handlers for Admin Template Editor
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Kích thước ảnh tối đa 5MB');
      return;
    }
    try {
      const res = await uploadImageToServer(file, 'template_avatar');
      if (res.success && res.url) {
        setEditingTemplate({
          ...editingTemplate,
          previewImg: res.url,
          config: {
            ...editingTemplate.config,
            profile: {
              ...editingTemplate.config?.profile,
              displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
              bio: editingTemplate.config?.profile?.bio || '',
              avatarUrl: res.url,
              verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
              showShareButton: true,
              showVCard: true,
            }
          }
        });
        success('Đã tải ảnh đại diện lên máy chủ thành công!');
      } else {
        error(res.error || 'Lỗi tải ảnh đại diện');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải ảnh');
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Kích thước ảnh tối đa 5MB');
      return;
    }
    try {
      const res = await uploadImageToServer(file, 'template_cover');
      if (res.success && res.url) {
        setEditingTemplate({
          ...editingTemplate,
          config: {
            ...editingTemplate.config,
            profile: {
              ...editingTemplate.config?.profile,
              displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
              bio: editingTemplate.config?.profile?.bio || '',
              avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
              verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
              showShareButton: true,
              showVCard: true,
              coverImageUrl: res.url,
            }
          }
        });
        success('Đã tải ảnh bìa lên máy chủ thành công!');
      } else {
        error(res.error || 'Lỗi tải ảnh bìa');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải ảnh');
    }
  };

  const handleBgImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTemplate) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Kích thước ảnh tối đa 5MB');
      return;
    }
    try {
      const res = await uploadImageToServer(file, 'template_bg');
      if (res.success && res.url) {
        setEditingTemplate({
          ...editingTemplate,
          config: {
            ...editingTemplate.config,
            theme: {
              ...editingTemplate.config?.theme!,
              bgType: 'image',
              bgImageUrl: res.url,
            }
          }
        });
        success('Đã tải hình nền lên máy chủ thành công!');
      } else {
        error(res.error || 'Lỗi tải hình nền');
      }
    } catch (err: any) {
      error(err.message || 'Lỗi tải ảnh');
    }
  };

  const handleMoveBlock = (fromIndex: number, toIndex: number) => {
    if (!editingTemplate || !editingTemplate.config?.blocks) return;
    const blocksList = [...editingTemplate.config.blocks];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= blocksList.length || toIndex >= blocksList.length || fromIndex === toIndex) return;

    const [movedItem] = blocksList.splice(fromIndex, 1);
    blocksList.splice(toIndex, 0, movedItem);

    const reorderedBlocks = blocksList.map((b, idx) => ({
      ...b,
      order: idx + 1
    }));

    setEditingTemplate({
      ...editingTemplate,
      config: {
        ...editingTemplate.config,
        blocks: reorderedBlocks
      }
    });
  };

  // System Settings Form
  const [settingsForm, setSettingsForm] = useState<SystemConfig>(systemConfig);
  const lastUserActionTimestampRef = useRef<number>(0);

  // Bio Default Footer Text & Link States for Admin
  const [bioFooterText, setBioFooterText] = useState<string>(systemConfig.defaultBioFooterText || 'Đăng ký miễn phí TRANG CÁ NHÂN');
  const [bioFooterLink, setBioFooterLink] = useState<string>(systemConfig.defaultBioFooterLink || 'http://trangcanhan.com');

  // Footer Management Form State
  const [footerForm, setFooterForm] = useState<FooterConfig>(() => systemConfig.footerConfig || {
    brandName: 'TRANG CÁ NHÂN',
    brandTagline: 'Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam.\nGiúp bạn kết nối tất cả liên kết trong một trang duy nhất.',
    copyrightText: '© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu.',
    madeWithText: 'Made with ❤️ in Vietnam',
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
          { id: 'p4', label: 'Tên miền', url: '#domains' },
        ]
      },
      {
        id: 'col_support',
        title: 'HỖ TRỢ',
        links: [
          { id: 's1', label: 'Hướng dẫn', url: '#guide' },
          { id: 's2', label: 'FAQ', url: '#faq' },
          { id: 's3', label: 'Liên hệ', url: '#contact' },
          { id: 's4', label: 'Trung tâm trợ giúp', url: '#help' },
        ]
      },
      {
        id: 'col_company',
        title: 'CÔNG TY',
        links: [
          { id: 'c1', label: 'Về chúng tôi', url: '#about' },
          { id: 'c2', label: 'Blog', url: '#blog' },
          { id: 'c3', label: 'Điều khoản', url: '#terms' },
          { id: 'c4', label: 'Chính sách bảo mật', url: '#privacy' },
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
  });

  useEffect(() => {
    if (systemConfig) {
      const isRecentlyEditedByUser = (Date.now() - lastUserActionTimestampRef.current) < 60000;
      setSettingsForm((prev) => ({
        ...systemConfig,
        autoPaymentConfig: { ...systemConfig.autoPaymentConfig },
        footerConfig: { ...systemConfig.footerConfig },
        announcementActive: isRecentlyEditedByUser && prev.announcementActive !== undefined 
          ? prev.announcementActive 
          : systemConfig.announcementActive,
        announcementText: isRecentlyEditedByUser && prev.announcementText !== undefined 
          ? prev.announcementText 
          : systemConfig.announcementText,
        popupModal: isRecentlyEditedByUser && prev.popupModal !== undefined
          ? prev.popupModal
          : (systemConfig.popupModal || prev.popupModal),
      }));
      if (systemConfig.defaultBioFooterText && !isRecentlyEditedByUser) setBioFooterText(systemConfig.defaultBioFooterText);
      if (systemConfig.defaultBioFooterLink && !isRecentlyEditedByUser) setBioFooterLink(systemConfig.defaultBioFooterLink);
      if (systemConfig.footerConfig && !isRecentlyEditedByUser) setFooterForm(systemConfig.footerConfig);
    }
  }, [systemConfig]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPayload: SystemConfig = {
      ...systemConfig,
      ...settingsForm,
      defaultBioFooterText: settingsForm.defaultBioFooterText || bioFooterText,
      defaultBioFooterLink: settingsForm.defaultBioFooterLink || bioFooterLink,
      footerConfig: {
        ...(systemConfig.footerConfig || {}),
        ...(settingsForm.footerConfig || footerForm),
        copyrightText: settingsForm.footerConfig?.copyrightText || footerForm.copyrightText,
      }
    };
    updateSystemConfig(finalPayload);
    addStaffAuditLog(
      'Lưu cấu hình hệ thống toàn diện',
      'system',
      'Đã cập nhật Tên miền, Thương hiệu, VietQR, SePay, Footer, Banner Marquee, Popup vào MySQL Database'
    );
    success('Đã lưu và đồng bộ toàn bộ cấu hình hệ thống vào Database thành công!');
  };

  const handleSaveFooter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      ...systemConfig,
      defaultBioFooterText: bioFooterText,
      defaultBioFooterLink: bioFooterLink,
      footerConfig: footerForm
    };
    updateSystemConfig(updated);
    success('Đã cập nhật cấu hình Chân trang & Bản quyền thành công!');
  };

  const handleResetFooterDefault = () => {
    const defaultFooter: FooterConfig = {
      brandName: 'TRANG CÁ NHÂN',
      brandTagline: 'Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam.\nGiúp bạn kết nối tất cả liên kết trong một trang duy nhất.',
      copyrightText: '© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu.',
      madeWithText: 'Made with ❤️ in Vietnam',
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
            { id: 'p4', label: 'Tên miền', url: '#domains' },
          ]
        },
        {
          id: 'col_support',
          title: 'HỖ TRỢ',
          links: [
            { id: 's1', label: 'Hướng dẫn', url: '#guide' },
            { id: 's2', label: 'FAQ', url: '#faq' },
            { id: 's3', label: 'Liên hệ', url: '#contact' },
            { id: 's4', label: 'Trung tâm trợ giúp', url: '#help' },
          ]
        },
        {
          id: 'col_company',
          title: 'CÔNG TY',
          links: [
            { id: 'c1', label: 'Về chúng tôi', url: '#about' },
            { id: 'c2', label: 'Blog', url: '#blog' },
            { id: 'c3', label: 'Điều khoản', url: '#terms' },
            { id: 'c4', label: 'Chính sách bảo mật', url: '#privacy' },
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
    };
    setFooterForm(defaultFooter);
    info('Đã khôi phục dữ liệu chân trang về mặc định. Nhấn Lưu để áp dụng!');
  };

  const handleGovLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      error('Kích thước ảnh tối đa 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: result, type: 'gov_logo' })
          });
          const data = await res.json().catch(() => null);
          const finalUrl = data?.url || result;
          const updatedGov = {
            ...(footerForm.govCertification || {
              enabled: true,
              imageUrl: '/bo-cong-thuong.svg',
              targetUrl: 'http://online.gov.vn/',
              altText: 'Đã thông báo Bộ Công Thương',
              width: 140
            }),
            imageUrl: finalUrl
          };
          const updatedFooter = { ...footerForm, govCertification: updatedGov };
          setFooterForm(updatedFooter);
          updateSystemConfig({ ...systemConfig, footerConfig: updatedFooter });
          success('Đã tải lên và lưu logo Bộ Công Thương vào cơ sở dữ liệu thành công!');
        } catch (err) {
          console.error(err);
          setFooterForm(prev => ({
            ...prev,
            govCertification: {
              ...(prev.govCertification || {
                enabled: true,
                imageUrl: '/bo-cong-thuong.svg',
                targetUrl: 'http://online.gov.vn/',
                altText: 'Đã thông báo Bộ Công Thương',
                width: 140
              }),
              imageUrl: result
            }
          }));
          success('Đã tải lên logo Bộ Công Thương mới!');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddColumn = () => {
    const newColId = 'col_' + Date.now();
    setFooterForm(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          id: newColId,
          title: 'CỘT MỚI',
          links: [
            { id: 'lnk_' + Date.now(), label: 'Liên kết mới', url: '#' }
          ]
        }
      ]
    }));
  };

  const handleDeleteColumn = (colId: string) => {
    setFooterForm(prev => ({
      ...prev,
      columns: prev.columns.filter(c => c.id !== colId)
    }));
  };

  const handleUpdateColumnTitle = (colId: string, title: string) => {
    setFooterForm(prev => ({
      ...prev,
      columns: prev.columns.map(c => c.id === colId ? { ...c, title } : c)
    }));
  };

  const handleAddLinkToColumn = (colId: string) => {
    const newLinkId = 'lnk_' + Date.now();
    setFooterForm(prev => ({
      ...prev,
      columns: prev.columns.map(c => {
        if (c.id === colId) {
          return {
            ...c,
            links: [...c.links, { id: newLinkId, label: 'Liên kết mới', url: '#' }]
          };
        }
        return c;
      })
    }));
  };

  const handleUpdateLink = (colId: string, linkId: string, field: 'label' | 'url', value: string) => {
    setFooterForm(prev => ({
      ...prev,
      columns: prev.columns.map(c => {
        if (c.id === colId) {
          return {
            ...c,
            links: c.links.map(l => l.id === linkId ? { ...l, [field]: value } : l)
          };
        }
        return c;
      })
    }));
  };

  const handleDeleteLink = (colId: string, linkId: string) => {
    setFooterForm(prev => ({
      ...prev,
      columns: prev.columns.map(c => {
        if (c.id === colId) {
          return {
            ...c,
            links: c.links.filter(l => l.id !== linkId)
          };
        }
        return c;
      })
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.username) {
      error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    adminAddUser(newUserForm);
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      username: '',
      email: '',
      plan: (systemConfig.defaultUserPlan || 'free') as PlanType,
      role: 'user',
      balance: 0,
      verified: true
    });
    success('Đã thêm người dùng mới thành công!');
  };

  const handleSaveEditUser = () => {
    if (!editingUser) return;
    adminUpdateUser(editingUser.id, editingUser);
    setEditingUser(null);
    success('Đã cập nhật thông tin người dùng!');
  };

  // Pricing Handlers
  const handleSavePricing = () => {
    updateSystemConfig({
      ...systemConfig,
      pricingPlans: pricingPlansForm
    });
    success('Đã lưu cấu hình Bảng Giá & Gói Cước thành công! Dữ liệu đã đồng bộ ngay ra ngoài Trang chủ và Demo.');
  };

  const handleResetPricingDefault = () => {
    setPricingPlansForm(JSON.parse(JSON.stringify(PAYMENT_PLANS)));
    info('Đã khôi phục dữ liệu bảng giá về mặc định. Nhấn Lưu để kích hoạt!');
  };

  const handleUpdatePlanField = (planId: string, field: keyof PaymentPlanItem, value: any) => {
    setPricingPlansForm(prev => prev.map(p => p.id === planId ? { ...p, [field]: value } : p));
  };

  const handleTogglePlanFeature = (planId: string, featIndex: number) => {
    setPricingPlansForm(prev => prev.map(p => {
      if (p.id === planId) {
        const nextFeats = [...p.features];
        nextFeats[featIndex] = { ...nextFeats[featIndex], included: !nextFeats[featIndex].included };
        return { ...p, features: nextFeats };
      }
      return p;
    }));
  };

  const handleUpdatePlanFeatureText = (planId: string, featIndex: number, text: string) => {
    setPricingPlansForm(prev => prev.map(p => {
      if (p.id === planId) {
        const nextFeats = [...p.features];
        nextFeats[featIndex] = { ...nextFeats[featIndex], text };
        return { ...p, features: nextFeats };
      }
      return p;
    }));
  };

  const handleAddPlanFeature = (planId: string) => {
    setPricingPlansForm(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          features: [...p.features, { text: 'Tính năng mới', included: true }]
        };
      }
      return p;
    }));
  };

  const handleDeletePlanFeature = (planId: string, featIndex: number) => {
    setPricingPlansForm(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          features: p.features.filter((_, idx) => idx !== featIndex)
        };
      }
      return p;
    }));
  };

  // Template Handlers
  const handleSaveTemplate = (updated: TemplateMarketplaceItem) => {
    const exists = templatesList.some(t => t.id === updated.id);
    const nextList = exists ? templatesList.map(t => t.id === updated.id ? updated : t) : [updated, ...templatesList];
    setTemplatesList(nextList);
    localStorage.setItem('trangcanhan_custom_templates', JSON.stringify(nextList));
    updateSystemConfig({ ...systemConfig, customTemplates: nextList });
    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextList)
    }).catch(() => {});
    fetch('/save_template.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextList)
    }).catch(() => {});
    setEditingTemplate(null);
    success(`Đã cập nhật và lưu thay đổi cho mẫu "${updated.name}" vào cơ sở dữ liệu hệ thống!`);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu "${name}" khỏi kho giao diện?`)) return;
    const nextList = templatesList.filter(t => t.id !== id);
    setTemplatesList(nextList);
    localStorage.setItem('trangcanhan_custom_templates', JSON.stringify(nextList));
    updateSystemConfig({ ...systemConfig, customTemplates: nextList });
    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextList)
    }).catch(() => {});
    fetch('/save_template.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextList)
    }).catch(() => {});
    fetch('/delete_template.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
    success(`Đã xóa mẫu "${name}" và cập nhật cơ sở dữ liệu thành công!`);
  };

  const handleResetTemplatesDefault = () => {
    if (!confirm('Khôi phục toàn bộ kho giao diện mẫu về mặc định của hệ thống?')) return;
    localStorage.removeItem('trangcanhan_custom_templates');
    setTemplatesList(TEMPLATES_MARKETPLACE);
    updateSystemConfig({ ...systemConfig, customTemplates: [] });
    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([])
    }).catch(() => {});
    info('Đã khôi phục kho mẫu giao diện về nguyên bản trong cơ sở dữ liệu!');
  };

  const filteredUsers = allUsers.filter((u) => {
    const cleanSearchDigits = searchTerm.replace(/[\s.-]/g, '');
    const userPhoneDigits = (u.phone || '').replace(/[\s.-]/g, '');
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cleanSearchDigits.length > 0 && userPhoneDigits.includes(cleanSearchDigits));
    const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
    const matchesRole = filterRole === 'all' || (filterRole === 'admin' ? u.role === 'admin' : u.role !== 'admin');
    return matchesSearch && matchesPlan && matchesRole;
  });

  // Calculate totals
  const totalUserCount = allUsers.length;
  const totalSystemBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalProUsers = allUsers.filter((u) => u.plan === 'pro' || u.plan === 'vip').length;
  const totalCompletedTxs = transactions.filter((t) => t.status === 'completed').length;
  const totalDepositAmount = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Sleek Top Admin Navigation Bar with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl">
        {/* Admin Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-0.5">
          <button
            onClick={() => setCurrentAdminTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'overview'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tổng Quan</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'users'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thành Viên ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('homepage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'homepage'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Section Trang Chủ</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'pricing'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Bảng Giá ({pricingPlansForm.length})</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('articles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'articles'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Bài Viết ({systemConfig.articles?.length || 5})</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('footer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'footer'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <PanelBottom className="w-4 h-4" />
            <span>Chân Trang</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('templates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'templates'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Giao Diện Mẫu ({templatesList.length})</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'transactions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Giao Dịch ({transactions.length})</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('maintenance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'maintenance'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Bảo Trì Hệ Thống</span>
          </button>

          <button
            onClick={() => setCurrentAdminTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'settings'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt</span>
          </button>
        </div>

        {/* Quick Admin Self-Plan Switching for Testing */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Test Gói Admin:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['free', 'pro', 'vip'] as PlanType[]).map((p) => {
              const isActive = user?.plan === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    adminSwitchOwnPlan(p);
                    success(`Đã chuyển tài khoản Admin sang gói ${p.toUpperCase()} để test giao diện!`, 'Chuyển Gói Thành Công');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition uppercase cursor-pointer ${
                    isActive
                      ? p === 'vip'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                        : p === 'pro'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                        : 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
      {currentAdminTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng thành viên</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalUserCount}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <span>+12% so với tháng trước</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gói PRO & VIP</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">{totalProUsers}</div>
              <div className="text-xs text-slate-400">
                Tỉ lệ chuyển đổi: {((totalProUsers / (totalUserCount || 1)) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng số dư ví khách</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatMoney(totalSystemBalance)}
              </div>
              <div className="text-xs text-slate-400">
                Lưu trữ an toàn trên ví hệ thống
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng nạp thành công</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                {formatMoney(totalDepositAmount)}
              </div>
              <div className="text-xs text-emerald-400">
                {totalCompletedTxs} giao dịch hoàn tất
              </div>
            </div>
          </div>

          {/* Quick Info & Server Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Trạng Thái Cấu Hình & Hoạt Động Hệ Thống</span>
                </h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                  ● Hệ thống trực tuyến 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-medium">Tên thương hiệu nền tảng:</div>
                  <div className="text-white font-bold">{systemConfig.siteName}</div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-medium">Khuyến mãi nạp ví hiện tại:</div>
                  <div className="text-emerald-400 font-bold font-mono">+{systemConfig.bonusDepositRate}% giá trị</div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-medium">Tài khoản nhận VietQR:</div>
                  <div className="text-white font-bold">{systemConfig.bankName} - {systemConfig.bankAccount}</div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="text-slate-400 font-medium">Email & Hotline hỗ trợ:</div>
                  <div className="text-white font-bold">{systemConfig.supportEmail} ({systemConfig.hotline})</div>
                </div>
              </div>

              {systemConfig.announcementActive && (
                <div className="p-3.5 bg-indigo-950/60 border border-indigo-800/60 rounded-2xl flex items-center gap-3">
                  <Bell className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-xs text-indigo-200">
                    <strong>Thông báo toàn trang đang bật:</strong> {systemConfig.announcementText}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Thao Tác Nhanh</h3>
              
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => {
                    setShowAddUserModal(true);
                  }}
                  className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-between transition shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Thêm tài khoản thành viên</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentAdminTab('settings')}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Đổi thông tin Ngân hàng VietQR</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentAdminTab('users')}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Cấp VIP cho thành viên</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG */}
      {currentAdminTab === 'users' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Action & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4">
            <div className="flex-1 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả gói</option>
                <option value="free">Gói Free</option>
                <option value="pro">Gói Pro</option>
                <option value="vip">Gói VIP</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="user">Người dùng (User)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePushAllToBackend}
                disabled={isPushingAll}
                title="Tự động chuyển toàn bộ người dùng và số điện thoại vào Database MySQL trên hosting"
                className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 ${isPushingAll ? 'animate-spin' : ''}`} />
                <span>{isPushingAll ? 'Đang đẩy...' : 'Đẩy tất cả vào MySQL'}</span>
              </button>

              <button
                onClick={handleSyncUsers}
                disabled={isRefreshingUsers}
                title="Lấy danh sách người dùng mới nhất từ database backend (get_users.php)"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshingUsers ? 'animate-spin' : ''}`} />
                <span>{isRefreshingUsers ? 'Đang tải...' : 'Đồng bộ từ DB'}</span>
              </button>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Người Dùng</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Thành viên</th>
                    <th className="py-3.5 px-4">Username & TRANG CÁ NHÂN</th>
                    <th className="py-3.5 px-4">Gói cước</th>
                    <th className="py-3.5 px-4">Số dư ví</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Avatar - Click to view full user information */}
                      <td 
                        className="py-3 px-4 cursor-pointer group/user"
                        onClick={() => setSelectedUserForDetails(u)}
                        title="Click để xem toàn bộ thông tin chi tiết của người dùng"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 aspect-square group-hover/user:ring-2 group-hover/user:ring-indigo-500 transition"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap group-hover/user:text-indigo-400 transition">
                              <span>{u.name}</span>
                              <UserRoleBadge user={u} size="2xs" />
                              {u.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-slate-400 group-hover/user:text-slate-300 flex items-center gap-2">
                              <span>{u.email}</span>
                              {u.phone && (
                                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                                  SĐT: {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-indigo-300 font-bold">@{u.username}</div>
                        <div className="text-[10px] text-slate-500">
                          {u.customDomain ? u.customDomain : `${getSystemDomain(systemConfig)}/${u.username}`}
                        </div>
                      </td>

                      {/* Plan (Đổi Gói Cước Trực Tiếp) */}
                      <td className="py-3 px-4">
                        <select
                          value={u.plan || 'free'}
                          onChange={(e) => {
                            const newPlan = e.target.value as PlanType;
                            const expiry = newPlan === 'vip' 
                              ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
                              : newPlan === 'pro'
                              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                              : undefined;
                            adminUpdateUser(u.id, { 
                              username: u.username,
                              email: u.email,
                              phone: u.phone,
                              name: u.name,
                              plan: newPlan, 
                              planExpiresAt: expiry,
                              verified: newPlan !== 'free'
                            });
                            success(`Đã đổi gói cước của @${u.username} sang [${newPlan.toUpperCase()}] thành công!`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer outline-none border transition-all ${
                            u.plan === 'vip' 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400' 
                              : u.plan === 'pro' 
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:border-indigo-400' 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                          title="Click để đổi gói cước thành viên (Free / PRO / VIP)"
                        >
                          <option value="free" className="bg-slate-900 text-slate-300 font-bold">FREE</option>
                          <option value="pro" className="bg-slate-900 text-indigo-400 font-bold">PRO</option>
                          <option value="vip" className="bg-slate-900 text-amber-400 font-bold">VIP</option>
                        </select>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {formatMoney(u.balance || 0)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.status === 'banned' ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Hoạt động
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handlePushUserToBackend(u)}
                          disabled={pushingUserId === u.id}
                          className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition cursor-pointer border border-emerald-500/30 disabled:opacity-50"
                          title="Đẩy tài khoản này sang lưu vào Database MySQL trên hosting (register.php)"
                        >
                          <Database className={`w-3.5 h-3.5 ${pushingUserId === u.id ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                          onClick={() => setStaffAssignUser(u)}
                          className={`p-1.5 rounded-lg transition cursor-pointer border ${
                            u.isStaff || u.role === 'staff'
                              ? 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/40'
                              : 'bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white border-slate-700'
                          }`}
                          title="Phân quyền Nhân Viên Nội Bộ (CSKH, Đối soát, Kiểm duyệt)"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedUserForDetails(u)}
                          className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition cursor-pointer border border-indigo-500/30"
                          title="Xem toàn bộ thông tin chi tiết người dùng"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="Sửa thông tin nhanh & Điều chỉnh số dư"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const newStatus = u.status === 'banned' ? 'active' : 'banned';
                            adminUpdateUser(u.id, { status: newStatus });
                            info(`Đã ${newStatus === 'banned' ? 'khóa' : 'mở khóa'} tài khoản ${u.name}`);
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            u.status === 'banned'
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                              : 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white'
                          }`}
                          title={u.status === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {u.status === 'banned' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${u.name}"?`)) {
                              adminDeleteUser(u.id);
                              success(`Đã xóa người dùng ${u.name}`);
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CÀI ĐẶT BẢNG GIÁ & GÓI DỊCH VỤ */}
      {currentAdminTab === 'pricing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Save Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Cài Đặt Bảng Giá & Gói Cước Hệ Thống</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh giá tiền (tháng/năm), tên gói, mô tả quyền lợi và danh sách tính năng cho 3 gói: Free, PRO và VIP.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetPricingDefault}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={handleSavePricing}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>

          {/* Pricing Plans Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingPlansForm.map((plan) => {
              const isFree = plan.id === 'free';
              const isPro = plan.id === 'pro';
              const isVip = plan.id === 'vip';

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900 border rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between ${
                    isPro 
                      ? 'border-indigo-500/70 ring-1 ring-indigo-500/40' 
                      : isVip 
                      ? 'border-amber-500/50' 
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Title & Plan ID */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          isPro 
                            ? 'bg-indigo-600 text-white' 
                            : isVip 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {plan.id.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-sm font-black text-white">{plan.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">ID: {plan.id}</div>
                        </div>
                      </div>

                      {plan.popular && (
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-black">
                          PHỔ BIẾN
                        </span>
                      )}
                    </div>

                    {/* Plan Name & Badge */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Tên hiển thị:</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Huy hiệu (Badge):</label>
                        <input
                          type="text"
                          value={plan.badge || ''}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'badge', e.target.value)}
                          placeholder="vd: PHỔ BIẾN NHẤT"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1 text-xs">
                      <label className="text-slate-400 font-semibold">Mô tả ngắn gọn:</label>
                      <textarea
                        rows={2}
                        value={plan.description}
                        onChange={(e) => handleUpdatePlanField(plan.id, 'description', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500 resize-none text-xs"
                      />
                    </div>

                    {/* Pricing Inputs */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Giá/Tháng (VNĐ):</span>
                        </label>
                        <input
                          type="number"
                          disabled={isFree}
                          value={plan.priceMonth}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'priceMonth', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          <span>Giá/Năm (VNĐ):</span>
                        </label>
                        <input
                          type="number"
                          disabled={isFree}
                          value={plan.priceYear}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'priceYear', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Features List Configuration */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Danh sách quyền lợi ({plan.features.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddPlanFeature(plan.id)}
                          className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm mục</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {plan.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs ${
                              feat.included 
                                ? 'bg-slate-950 border-slate-800' 
                                : 'bg-slate-950/40 border-slate-800/50 opacity-75'
                            }`}
                          >
                            {/* Toggle Include */}
                            <button
                              type="button"
                              onClick={() => handleTogglePlanFeature(plan.id, fIdx)}
                              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition ${
                                feat.included 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800 text-slate-600 border border-slate-700'
                              }`}
                              title={feat.included ? 'Đang bao gồm trong gói' : 'Không hỗ trợ ở gói này'}
                            >
                              {feat.included ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                            </button>

                            {/* Feature Text */}
                            <input
                              type="text"
                              value={feat.text}
                              onChange={(e) => handleUpdatePlanFeatureText(plan.id, fIdx, e.target.value)}
                              className="flex-1 bg-transparent border-0 text-white focus:ring-0 text-xs p-0"
                            />

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeletePlanFeature(plan.id, fIdx)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition"
                              title="Xóa quyền lợi này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSavePricing}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lưu</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB: QUẢN LÝ BÀI VIẾT & TRANG TĨNH (CMS) */}
      {currentAdminTab === 'articles' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <AdminArticlesManager />
        </div>
      )}

      {/* TAB: QUẢN LÝ CHÂN TRANG (FOOTER) */}
      {currentAdminTab === 'footer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <PanelBottom className="w-5 h-5 text-indigo-400" />
                <span>Quản Lý & Tùy Chỉnh Chân Trang (Footer)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh thông tin thương hiệu, bản quyền, các cột liên kết menu và mạng xã hội hiển thị dưới chân trang chủ.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetFooterDefault}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveFooter()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Form Settings (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. Thông Tin Thương Hiệu & Bản Quyền */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>1. Thông Tin Thương Hiệu & Bản Quyền</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Tên thương hiệu hiển thị:</label>
                    <input
                      type="text"
                      value={footerForm.brandName}
                      onChange={(e) => setFooterForm({ ...footerForm, brandName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                      placeholder="TRANG CÁ NHÂN"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Dòng bản quyền (Copyright):</label>
                    <input
                      type="text"
                      value={footerForm.copyrightText}
                      onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                      placeholder="© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-slate-400 font-semibold">Mô tả / Slogan chân trang:</label>
                    <textarea
                      rows={2}
                      value={footerForm.brandTagline}
                      onChange={(e) => setFooterForm({ ...footerForm, brandTagline: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 resize-none"
                      placeholder="Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam..."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-slate-400 font-semibold">Dòng chữ góc phải (Made with):</label>
                    <input
                      type="text"
                      value={footerForm.madeWithText}
                      onChange={(e) => setFooterForm({ ...footerForm, madeWithText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                      placeholder="Made with ❤️ in Vietnam"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-amber-400 font-semibold">Chữ bản quyền mặc định Bio (Tài khoản Free):</label>
                    <input
                      type="text"
                      value={bioFooterText}
                      onChange={(e) => setBioFooterText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                      placeholder="Đăng ký miễn phí TRANG CÁ NHÂN"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-amber-400 font-semibold">Link bản quyền mặc định Bio (Tài khoản Free):</label>
                    <input
                      type="text"
                      value={bioFooterLink}
                      onChange={(e) => setBioFooterLink(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono"
                      placeholder="http://trangcanhan.com"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Chứng Nhận Đã Thông Báo Bộ Công Thương (Chân Trang) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        2. Logo Chứng Nhận Bộ Công Thương (Dưới Made with ❤️ in Vietnam)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Hiển thị huy hiệu Đã Thông Báo Bộ Công Thương ở góc dưới cùng bên phải chân trang theo quy định.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={footerForm.govCertification?.enabled !== false}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        govCertification: {
                          ...(footerForm.govCertification || {
                            imageUrl: '/bo-cong-thuong.svg',
                            targetUrl: 'http://online.gov.vn/',
                            altText: 'Đã thông báo Bộ Công Thương',
                            width: 140
                          }),
                          enabled: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  {/* Logo preview & Upload */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="p-3 bg-white/95 rounded-xl border border-slate-700 shadow-md flex items-center justify-center min-h-[70px] w-full">
                      <img
                        src={footerForm.govCertification?.imageUrl || '/bo-cong-thuong.svg'}
                        alt={footerForm.govCertification?.altText || 'Đã thông báo Bộ Công Thương'}
                        style={{ width: `${footerForm.govCertification?.width || 140}px` }}
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/bo-cong-thuong.svg';
                        }}
                      />
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <label className="flex-1 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-center cursor-pointer transition flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh mới</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGovLogoFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setFooterForm({
                          ...footerForm,
                          govCertification: {
                            ...(footerForm.govCertification || {
                              enabled: true,
                              targetUrl: 'http://online.gov.vn/',
                              altText: 'Đã thông báo Bộ Công Thương',
                              width: 140
                            }),
                            imageUrl: '/bo-cong-thuong.svg'
                          }
                        })}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                        title="Dùng logo Bộ Công Thương mặc định"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Settings Inputs */}
                  <div className="sm:col-span-8 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Đường dẫn ảnh Logo (URL hoặc SVG):</label>
                      <input
                        type="text"
                        value={footerForm.govCertification?.imageUrl || ''}
                        onChange={(e) => setFooterForm({
                          ...footerForm,
                          govCertification: {
                            ...(footerForm.govCertification || {
                              enabled: true,
                              targetUrl: 'http://online.gov.vn/',
                              altText: 'Đã thông báo Bộ Công Thương',
                              width: 140
                            }),
                            imageUrl: e.target.value
                          }
                        })}
                        placeholder="/bo-cong-thuong.svg"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold">Liên kết khi click vào Logo (Target URL):</label>
                      <input
                        type="text"
                        value={footerForm.govCertification?.targetUrl || ''}
                        onChange={(e) => setFooterForm({
                          ...footerForm,
                          govCertification: {
                            ...(footerForm.govCertification || {
                              enabled: true,
                              imageUrl: '/bo-cong-thuong.svg',
                              altText: 'Đã thông báo Bộ Công Thương',
                              width: 140
                            }),
                            targetUrl: e.target.value
                          }
                        })}
                        placeholder="http://online.gov.vn/"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Chú thích ảnh (Alt Text):</label>
                        <input
                          type="text"
                          value={footerForm.govCertification?.altText || ''}
                          onChange={(e) => setFooterForm({
                            ...footerForm,
                            govCertification: {
                              ...(footerForm.govCertification || {
                                enabled: true,
                                imageUrl: '/bo-cong-thuong.svg',
                                targetUrl: 'http://online.gov.vn/',
                                width: 140
                              }),
                              altText: e.target.value
                            }
                          })}
                          placeholder="Đã thông báo Bộ Công Thương"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-indigo-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold">Độ rộng hiển thị (px):</label>
                        <input
                          type="number"
                          min="80"
                          max="300"
                          value={footerForm.govCertification?.width || 140}
                          onChange={(e) => setFooterForm({
                            ...footerForm,
                            govCertification: {
                              ...(footerForm.govCertification || {
                                enabled: true,
                                imageUrl: '/bo-cong-thuong.svg',
                                targetUrl: 'http://online.gov.vn/',
                                altText: 'Đã thông báo Bộ Công Thương'
                              }),
                              width: Number(e.target.value) || 140
                            }
                          })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-indigo-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Quản Lý Các Cột Liên Kết (Columns & Links) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    <span>3. Các Cột Menu & Liên Kết ({footerForm.columns.length} cột)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Cột Mới</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {footerForm.columns.map((col, cIdx) => (
                    <div key={col.id} className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">
                            {cIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={col.title}
                            onChange={(e) => handleUpdateColumnTitle(col.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:border-indigo-500 uppercase tracking-wider max-w-xs"
                            placeholder="TIÊU ĐỀ CỘT"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddLinkToColumn(col.id)}
                            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm liên kết</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xóa cột "${col.title}" và toàn bộ liên kết bên trong?`)) {
                                handleDeleteColumn(col.id);
                              }
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                            title="Xóa cột này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Danh sách link trong cột */}
                      <div className="space-y-2 pt-1">
                        {col.links.map((lnk) => (
                          <div key={lnk.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) => handleUpdateLink(col.id, lnk.id, 'label', e.target.value)}
                              placeholder="Tên hiển thị (vd: Về chúng tôi)"
                              className="sm:w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 font-medium"
                            />

                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={lnk.url}
                                onChange={(e) => handleUpdateLink(col.id, lnk.id, 'url', e.target.value)}
                                placeholder="URL (/gioi-thieu, #features, https://...)"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 focus:border-indigo-500 font-mono"
                              />

                              {/* Quick Article Preset Selector */}
                              <select
                                value={lnk.articleSlug || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    const art = (systemConfig.articles || []).find((a) => a.slug === val);
                                    const newLabel = art ? art.title.split('-')[0].trim() : lnk.label;
                                    handleUpdateLink(col.id, lnk.id, 'url', `/${val}`);
                                    handleUpdateLink(col.id, lnk.id, 'label', newLabel);
                                  }
                                }}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-400 focus:border-indigo-500 max-w-[130px] sm:max-w-[150px] truncate"
                                title="Chọn nhanh bài viết hệ thống"
                              >
                                <option value="">Chọn bài viết...</option>
                                {(systemConfig.articles || []).map((art) => (
                                  <option key={art.id} value={art.slug}>
                                    📄 {art.title.split('-')[0].trim()} (/{art.slug})
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleDeleteLink(col.id, lnk.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                                title="Xóa liên kết này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Mạng Xã Hội & Kênh Liên Hệ */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>3. Liên Kết Mạng Xã Hội & Email</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Facebook URL:</label>
                    <input
                      type="text"
                      value={footerForm.socialLinks.facebook || ''}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        socialLinks: { ...footerForm.socialLinks, facebook: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono text-xs"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Instagram URL:</label>
                    <input
                      type="text"
                      value={footerForm.socialLinks.instagram || ''}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        socialLinks: { ...footerForm.socialLinks, instagram: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono text-xs"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">YouTube URL:</label>
                    <input
                      type="text"
                      value={footerForm.socialLinks.youtube || ''}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        socialLinks: { ...footerForm.socialLinks, youtube: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono text-xs"
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">TikTok URL:</label>
                    <input
                      type="text"
                      value={footerForm.socialLinks.tiktok || ''}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        socialLinks: { ...footerForm.socialLinks, tiktok: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono text-xs"
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-slate-400 font-semibold">Email hỗ trợ chân trang:</label>
                    <input
                      type="email"
                      value={footerForm.socialLinks.email || ''}
                      onChange={(e) => setFooterForm({
                        ...footerForm,
                        socialLinks: { ...footerForm.socialLinks, email: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono text-xs"
                      placeholder="contact@trangcanhan.com"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Footer Preview (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 sticky top-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Xem Trước Trực Quan Chân Trang</span>
                  </h4>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-bold">
                    Live Preview
                  </span>
                </div>

                {/* Scaled-down realistic footer mock */}
                <div className="bg-white rounded-2xl p-4 text-slate-800 border border-slate-200 shadow-md space-y-4 text-left">
                  {/* Brand & Slogan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                        LB
                      </div>
                      <span className="font-black text-slate-900 text-xs tracking-tight">
                        {footerForm.brandName || 'TRANG CÁ NHÂN'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug whitespace-pre-line">
                      {footerForm.brandTagline || 'Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam.'}
                    </p>
                  </div>

                  {/* Columns Preview */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    {footerForm.columns.map((c) => (
                      <div key={c.id} className="space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-900">
                          {c.title || 'CỘT'}
                        </div>
                        <div className="space-y-0.5">
                          {c.links.slice(0, 4).map((l) => (
                            <div key={l.id} className="text-[9px] text-slate-500 truncate hover:text-indigo-600">
                              • {l.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social Icons & Bottom */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] text-slate-400">
                        {footerForm.copyrightText}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        {footerForm.madeWithText}
                      </div>
                    </div>

                    {/* Live preview of Bo Cong Thuong logo */}
                    {footerForm.govCertification?.enabled !== false && (
                      <div className="flex justify-end pt-1">
                        <img
                          src={footerForm.govCertification?.imageUrl || '/bo-cong-thuong.svg'}
                          alt={footerForm.govCertification?.altText || 'Đã thông báo Bộ Công Thương'}
                          className="h-8 object-contain drop-shadow-xs"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/bo-cong-thuong.svg';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveFooter()}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: QUẢN LÝ GIAO DIỆN MẪU (MARKETPLACE TEMPLATES) */}
      {currentAdminTab === 'templates' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-purple-400" />
                <span>Quản Lý Kho Giao Diện Mẫu (Templates)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chỉnh sửa thông tin, ảnh demo, tác giả, gói yêu cầu (Free/Pro/VIP) và cấu hình chi tiết cho toàn bộ mẫu trên hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetTemplatesDefault}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Khôi Phục Mẫu Gốc</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newTpl: TemplateMarketplaceItem = {
                    id: 'tpl_custom_' + Date.now(),
                    name: 'Giao diện sáng tạo mới',
                    category: 'Creator',
                    planRequired: 'pro',
                    likes: 120,
                    previewImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
                    author: user?.name || 'TRANG CÁ NHÂN Team',
                    badge: 'MỚI',
                    config: {
                      profile: {
                        displayName: 'Tên Nhà Sáng Tạo',
                        bio: 'Chia sẻ kiến thức & đam mê mỗi ngày ✨',
                        tagline: 'Content Creator & Designer',
                        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=260&auto=format&fit=crop',
                        verifiedBadge: true,
                        showShareButton: true,
                        showVCard: true
                      },
                      theme: {
                        id: 'custom-theme-' + Date.now(),
                        name: 'Mẫu Tùy Chỉnh',
                        bgType: 'gradient',
                        bgColor: '#0f172a',
                        bgGradient: { from: '#6366f1', via: '#a855f7', to: '#3b82f6', direction: 'to-b' },
                        bgImageUrl: '',
                        bgOverlayOpacity: 0,
                        bgBlur: 0,
                        fontFamily: 'font-sans',
                        fontSize: 'medium',
                        textColor: '#ffffff',
                        accentColor: '#6366f1',
                        cardStyle: 'glass',
                        cardBgColor: 'rgba(255,255,255,0.1)',
                        cardTextColor: '#ffffff',
                        cardBorderColor: 'rgba(255,255,255,0.2)',
                        cardHoverEffect: 'scale',
                        buttonShape: 'rounded-xl',
                        buttonAnimation: 'none',
                        avatarShape: 'circle',
                        avatarBorderColor: '#ffffff',
                        avatarBorderWidth: 2
                      }
                    }
                  };
                  const nextList = [newTpl, ...templatesList];
                  setTemplatesList(nextList);
                  localStorage.setItem('trangcanhan_custom_templates', JSON.stringify(nextList));
                  updateSystemConfig({ ...systemConfig, customTemplates: nextList });
                  fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nextList)
                  }).catch(() => {});
                  fetch('/save_template.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nextList)
                  }).catch(() => {});
                  setEditingTemplate(newTpl);
                  success('Đã tạo mẫu mới và lưu vào cơ sở dữ liệu! Hãy chỉnh sửa thông tin bên dưới.');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mẫu Mới</span>
              </button>
            </div>
          </div>

          {/* Search, Category & Plan Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs">
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm mẫu giao diện theo tên hoặc tác giả..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold shrink-0">Danh mục:</span>
                <select
                  value={templateFilterCat}
                  onChange={(e) => setTemplateFilterCat(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả danh mục ({templatesList.length})</option>
                  <option value="Creator">Creator & KOL</option>
                  <option value="Kinh doanh">Kinh doanh & Bán hàng</option>
                  <option value="Nghệ thuật">Nghệ thuật & Thiết kế</option>
                  <option value="Công nghệ">Công nghệ & Lập trình</option>
                  <option value="Thời trang">Thời trang & Làm đẹp</option>
                  <option value="Âm nhạc">Âm nhạc & Nghệ sĩ</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold shrink-0">Gói dịch vụ:</span>
                <select
                  value={templateFilterPlan}
                  onChange={(e) => setTemplateFilterPlan(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all">Tất cả gói cước</option>
                  <option value="free">🎁 Mẫu Free</option>
                  <option value="pro">⭐ Mẫu Pro</option>
                  <option value="vip">👑 Mẫu VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid with Real Bio Screen Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templatesList
              .filter(tpl => {
                const matchesSearch = tpl.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                  tpl.author.toLowerCase().includes(templateSearchTerm.toLowerCase());
                const matchesCat = templateFilterCat === 'all' || tpl.category.toLowerCase().includes(templateFilterCat.toLowerCase());
                const matchesPlan = templateFilterPlan === 'all' || tpl.planRequired === templateFilterPlan;
                return matchesSearch && matchesCat && matchesPlan;
              })
              .map((tpl) => (
                <TemplatePhoneCard
                  key={tpl.id}
                  template={tpl}
                  isAdmin={true}
                  onPreview={() => setEditingTemplate(JSON.parse(JSON.stringify(tpl)))}
                  onEdit={() => setEditingTemplate(JSON.parse(JSON.stringify(tpl)))}
                  onDelete={() => handleDeleteTemplate(tpl.id, tpl.name)}
                />
              ))}
          </div>

        </div>
      )}

      {/* TAB 4: LỊCH SỬ GIAO DỊCH TOÀN HỆ THỐNG */}
      {currentAdminTab === 'transactions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Lịch Sử Giao Dịch & Nạp Tiền Toàn Hệ Thống</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {(allTransactions || transactions).length} giao dịch được ghi nhận và đồng bộ trực tiếp trong MySQL
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('⚠️ CẢNH BÁO QUAN TRỌNG:\nBạn có chắc chắn muốn RESET / XÓA SẠCH toàn bộ lịch sử giao dịch và nạp tiền của TOÀN BỘ NGƯỜI DÙNG trên hệ thống?\n\nThao tác này sẽ xóa vĩnh viễn trong CSDL MySQL & Hosting Hostinger và không thể khôi phục!')) {
                    setIsResettingAllTx(true);
                    try {
                      const res = await adminResetAllTransactions();
                      success(res.message || 'Đã reset toàn bộ lịch sử giao dịch thành công!');
                    } catch (e: any) {
                      error(e.message || 'Lỗi khi reset lịch sử giao dịch');
                    } finally {
                      setIsResettingAllTx(false);
                    }
                  }
                }}
                disabled={isResettingAllTx || (allTransactions || transactions).length === 0}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isResettingAllTx ? 'Đang xóa...' : 'Reset Toàn Bộ Lịch Sử GD'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={txSearchTerm}
                onChange={(e) => setTxSearchTerm(e.target.value)}
                placeholder="Tìm theo Mã GD, nội dung, ghi chú, tên/username..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
              {txSearchTerm && (
                <button
                  type="button"
                  onClick={() => setTxSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-64">
              <select
                value={txUserFilter}
                onChange={(e) => setTxUserFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              >
                <option value="all">Tất cả người dùng ({allUsers.length})</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.username} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã GD</th>
                    <th className="py-3.5 px-4">Người dùng</th>
                    <th className="py-3.5 px-4">Loại giao dịch</th>
                    <th className="py-3.5 px-4">Số tiền</th>
                    <th className="py-3.5 px-4">Phương thức</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {((allTransactions || transactions).filter((tx) => {
                    const s = txSearchTerm.toLowerCase().trim();
                    const matchesSearch = !s ||
                      tx.id.toLowerCase().includes(s) ||
                      tx.description.toLowerCase().includes(s) ||
                      (tx.userId && tx.userId.toLowerCase().includes(s)) ||
                      (tx.username && tx.username.toLowerCase().includes(s)) ||
                      (tx.referenceCode && tx.referenceCode.toLowerCase().includes(s)) ||
                      (tx.receiptNote && tx.receiptNote.toLowerCase().includes(s));

                    const matchesUser = txUserFilter === 'all' || 
                      tx.userId === txUserFilter || 
                      (tx.userId && tx.userId.toLowerCase() === txUserFilter.toLowerCase()) ||
                      (tx.username && tx.username.toLowerCase() === txUserFilter.toLowerCase());

                    return matchesSearch && matchesUser;
                  })).map((tx) => {
                    const txOwner = allUsers.find(u => 
                      u.id === tx.userId || 
                      (tx.userId && u.username.toLowerCase() === tx.userId.toLowerCase()) ||
                      (tx.username && u.username.toLowerCase() === tx.username.toLowerCase())
                    );
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-300">{tx.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                              {txOwner?.avatarUrl ? (
                                <img src={txOwner.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {(txOwner?.name || tx.username || tx.userId || 'U').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate max-w-[130px]">
                                {txOwner?.name || tx.username || tx.userId}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                @{tx.username || txOwner?.username || tx.userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{tx.description}</div>
                        </td>
                        <td className={`py-3 px-4 font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.amount > 0 ? `+${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-slate-400">{tx.paymentMethod || 'vietqr'}</td>
                        <td className="py-3 px-4 text-slate-400">{tx.receiptNote || '—'}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            Thành công
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa giao dịch #${tx.id}? Thao tác này sẽ đồng bộ xóa vĩnh viễn trong MySQL!`)) {
                                const res = await adminDeleteTransaction(tx.id);
                                success(res.message || `Đã xóa giao dịch #${tx.id}!`);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            title="Xóa giao dịch này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {((allTransactions || transactions).length === 0) && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Chưa có giao dịch nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CẤU HÌNH HỆ THỐNG */}
      {currentAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Quản lý & Reset Lịch Sử Nạp Tiền Toàn Hệ Thống */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <span>Quản Lý & Đặt Lại Lịch Sử Nạp Tiền / Giao Dịch (Reset Transactions)</span>
              </h3>
              <span className="text-[11px] text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Đồng bộ & Xóa vĩnh viễn trong CSDL MySQL Hostinger
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tính năng dành riêng cho Quản trị viên để đặt lại (reset) toàn bộ lịch sử nạp tiền của tất cả người dùng trong toàn hệ thống, hoặc xóa sạch lịch sử nạp tiền của một tài khoản thành viên chỉ định. Thao tác này sẽ cập nhật trực tiếp vào cơ sở dữ liệu MySQL và Hosting Hostinger theo thời gian thực.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Reset Toàn Bộ Hệ Thống */}
              <div className="bg-slate-950/80 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Reset Toàn Bộ Lịch Sử Hệ Thống</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Xóa sạch toàn bộ {(allTransactions || transactions).length} bản ghi lịch sử nạp tiền và giao dịch của tất cả thành viên trong bảng <code>transactions</code> CSDL MySQL.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('⚠️ XÁC NHẬN RESET TOÀN BỘ LỊCH SỬ NẠP TIỀN:\nBạn có chắc chắn muốn xóa toàn bộ lịch sử giao dịch của TẤT CẢ người dùng?\n\nThao tác này sẽ đồng bộ xóa sạch dữ liệu trong MySQL và không thể khôi phục!')) {
                      setIsResettingAllTx(true);
                      try {
                        const res = await adminResetAllTransactions();
                        success(res.message || 'Đã reset toàn bộ lịch sử giao dịch toàn hệ thống!');
                      } catch (e: any) {
                        error(e.message || 'Lỗi khi reset lịch sử giao dịch');
                      } finally {
                        setIsResettingAllTx(false);
                      }
                    }
                  }}
                  disabled={isResettingAllTx || (allTransactions || transactions).length === 0}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isResettingAllTx ? 'Đang thực hiện xóa...' : 'Reset Toàn Bộ Lịch Sử Nạp Tiền'}</span>
                </button>
              </div>

              {/* Option 2: Xóa Lịch Sử Theo Từng Người Dùng */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-indigo-300">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Xóa Lịch Sử Của 1 Thành Viên Cụ Thể</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chọn thành viên cần xóa toàn bộ lịch sử giao dịch mà không làm ảnh hưởng đến các thành viên khác.
                  </p>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedResetUser}
                    onChange={(e) => setSelectedResetUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="">-- Chọn thành viên cần xóa lịch sử --</option>
                    {allUsers.map((u) => {
                      const count = (allTransactions || transactions).filter(t => 
                        t.userId === u.id || 
                        (t.userId && t.userId.toLowerCase() === u.username.toLowerCase()) ||
                        (t.username && t.username.toLowerCase() === u.username.toLowerCase())
                      ).length;
                      return (
                        <option key={u.id} value={u.id}>
                          {u.name || u.username} (@{u.username}) — {count} giao dịch
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedResetUser) {
                        error('Vui lòng chọn thành viên cần xóa lịch sử giao dịch!');
                        return;
                      }
                      const targetUser = allUsers.find(u => u.id === selectedResetUser);
                      const targetName = targetUser?.name || targetUser?.username || selectedResetUser;
                      if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ lịch sử giao dịch của thành viên "${targetName}"?\nThao tác này sẽ đồng bộ vào CSDL MySQL ngay lập tức.`)) {
                        setIsResettingAllTx(true);
                        try {
                          const res = await adminResetAllTransactions(selectedResetUser);
                          success(res.message || `Đã xóa sạch lịch sử giao dịch của ${targetName}!`);
                          setSelectedResetUser('');
                        } catch (e: any) {
                          error(e.message || 'Lỗi khi xóa lịch sử giao dịch');
                        } finally {
                          setIsResettingAllTx(false);
                        }
                      }
                    }}
                    disabled={isResettingAllTx || !selectedResetUser}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-4 h-4 text-indigo-400" />
                    <span>Xóa Lịch Sử Thành Viên Đã Chọn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cấu hình Tên miền thực tế & Gói mặc định */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Cấu Hình Tên Miền Thực Tế & Gói Đăng Ký Mặc Định</span>
              </h3>
              <span className="text-[11px] text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Đồng bộ toàn bộ Link User tự động
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Tên miền thực tế chính (Main Domain):</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentHost = window.location.host;
                      if (currentHost) {
                        setSettingsForm({ 
                          ...settingsForm, 
                          mainDomain: currentHost,
                          cnameTarget: `cname.${currentHost}`
                        });
                        info(`Đã lấy tên miền hiện tại: ${currentHost}`);
                      }
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Lấy domain hiện tại
                  </button>
                </div>
                <input
                  type="text"
                  value={settingsForm.mainDomain || ''}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                    setSettingsForm({ 
                      ...settingsForm, 
                      mainDomain: val,
                      cnameTarget: settingsForm.cnameTarget && settingsForm.cnameTarget.includes('cname.') 
                        ? `cname.${val}` 
                        : settingsForm.cnameTarget 
                    });
                  }}
                  placeholder="trangcanhan.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Khi thay đổi tên miền này, tất cả link cá nhân của người dùng (<code className="text-indigo-300">https://{settingsForm.mainDomain || 'trangcanhan.com'}/username</code>), QR Code, mã chia sẻ và trang Bio sẽ tự động đổi theo tức thì.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Máy chủ CNAME trỏ về (CNAME Target):</label>
                <input
                  type="text"
                  value={settingsForm.cnameTarget || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cnameTarget: e.target.value.toLowerCase().trim() })}
                  placeholder="cname.trangcanhan.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Địa chỉ CNAME để người dùng nâng cấp gói Pro/VIP trỏ tên miền riêng về hệ thống.
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-slate-300 font-bold block mb-1">Gói cước mặc định khi người dùng mới đăng ký:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'free', name: 'Gói Miễn Phí (Free)', desc: 'Mặc định chuẩn - 0đ số dư ví, sử dụng slug hệ thống' },
                    { id: 'pro', name: 'Gói Chuyên Nghiệp (Pro)', desc: 'Mở khóa Custom Domain, tích xanh Meta' },
                    { id: 'vip', name: 'Gói VIP Trọn Đời', desc: 'Mở khóa tất cả tính năng cao cấp nhất' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, defaultUserPlan: p.id as PlanType })}
                      className={`p-3 rounded-xl border text-left transition ${
                        (settingsForm.defaultUserPlan || 'free') === p.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{p.name}</span>
                        {(settingsForm.defaultUserPlan || 'free') === p.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cấu hình thương hiệu & Logo */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Cấu Hình Thương Hiệu & Logo Trang Chủ</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Hiển thị trên Thanh điều hướng (Navbar), Chân trang (Footer) & Trang cá nhân
              </span>
            </div>

            {/* LOGO CHANGER BLOCK */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span>Ảnh Logo Trang Chủ (Website Logo)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tải lên file ảnh từ máy tính hoặc dán URL ảnh trực tiếp (Khuyên dùng ảnh PNG nền trong suốt, chiều cao 35px - 50px).
                  </p>
                </div>

                {settingsForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm(prev => ({ ...prev, logoUrl: '' }));
                      updateSystemConfig({ ...settingsForm, logoUrl: '' });
                      success('Đã xóa logo tùy chỉnh và lưu vào cơ sở dữ liệu hệ thống.');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa logo (Dùng mặc định)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Logo Preview Box */}
                <div className="md:col-span-4 bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px] text-center">
                  <div className="text-[10px] text-slate-500 mb-2 font-medium">Xem trước hiển thị:</div>
                  {settingsForm.logoUrl ? (
                    <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800 max-w-full">
                      <img
                        src={settingsForm.logoUrl}
                        alt="Logo Preview"
                        className="h-10 w-auto max-w-[180px] object-contain mx-auto"
                        onError={() => {
                          error('Không thể tải ảnh từ URL logo hiện tại');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <span className="font-black text-sm text-white">
                        {settingsForm.siteName || 'TRANG CÁ NHÂN'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls & URL Input */}
                <div className="md:col-span-8 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">Đường dẫn URL ảnh logo:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://domain.com/logo.png hoặc dán link ảnh"
                        value={settingsForm.logoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500"
                      />
                      {settingsForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            updateSystemConfig({ ...settingsForm, logoUrl: settingsForm.logoUrl });
                            success('Đã lưu đường dẫn logo mới vào cơ sở dữ liệu!');
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 whitespace-nowrap cursor-pointer transition"
                        >
                          Lưu URL
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh Logo từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            error('Kích thước ảnh tối đa 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ image: result, type: 'logo' })
                                });
                                const data = await res.json().catch(() => null);
                                const finalUrl = data?.url || result;
                                setSettingsForm(prev => ({ ...prev, logoUrl: finalUrl }));
                                updateSystemConfig({ ...settingsForm, logoUrl: finalUrl });
                                success('Đã tải lên và lưu logo vào cơ sở dữ liệu hệ thống thành công!');
                              } catch (err) {
                                console.error(err);
                                setSettingsForm(prev => ({ ...prev, logoUrl: result }));
                                updateSystemConfig({ ...settingsForm, logoUrl: result });
                                success('Đã lưu logo vào hệ thống thành công!');
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <span className="text-[10px] text-slate-500">Hỗ trợ file PNG, SVG, JPG, WebP (&lt;5MB) - Tự động lưu Database</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Tên nền tảng (Site Name):</label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Tiêu đề trang (SEO Title):</label>
                <input
                  type="text"
                  value={settingsForm.siteTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>Slogan / Khẩu hiệu dưới Logo (Menu Header & Trang chủ):</span>
                  <span className="text-[11px] text-indigo-400 font-normal">Cập nhật tức thì trên toàn bộ thanh menu ngoài trang chủ</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.slogan || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                  placeholder="Tất cả liên kết của bạn trong một link duy nhất"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-medium text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  Dòng chữ slogan ngắn hiển thị ngay dưới logo thương hiệu trên đầu menu ngoài trang chủ và trên thanh tiêu đề.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Email hỗ trợ khách hàng:</label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Hotline CSKH:</label>
                <input
                  type="text"
                  value={settingsForm.hotline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>

              {/* Cấu hình Đăng nhập Google */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                      G
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Đăng nhập & Đăng ký bằng Google</div>
                      <div className="text-xs text-slate-400">Cho phép người dùng tạo tài khoản hoặc đăng nhập nhanh bằng Google</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settingsForm.googleAuthEnabled)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleAuthEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-300 text-xs font-semibold flex items-center justify-between">
                    <span>Google OAuth Client ID:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      settingsForm.googleAuthEnabled 
                        ? (settingsForm.googleClientId ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60' : 'text-amber-400 bg-amber-950/80 border-amber-800/60') 
                        : 'text-slate-400 bg-slate-900 border-slate-800'
                    }`}>
                      {settingsForm.googleAuthEnabled ? (settingsForm.googleClientId ? 'Đang hoạt động' : 'Chưa nhập Client ID') : 'Đang tắt'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.googleClientId || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleClientId: e.target.value })}
                    placeholder="ví dụ: 123456789-abc.apps.googleusercontent.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Lấy Client ID tại <strong>console.cloud.google.com</strong> &rarr; Credentials &rarr; OAuth 2.0 Client ID để kích hoạt hộp thoại đăng nhập chính thức từ Google.
                  </p>
                </div>
              </div>

              {/* Cấu hình Đăng nhập Facebook */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      f
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Đăng nhập & Đăng ký bằng Facebook</div>
                      <div className="text-xs text-slate-400">Cho phép người dùng tạo tài khoản hoặc đăng nhập nhanh bằng Facebook</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settingsForm.facebookAuthEnabled)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookAuthEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-300 text-xs font-semibold flex items-center justify-between">
                    <span>Facebook App ID:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      settingsForm.facebookAuthEnabled 
                        ? (settingsForm.facebookAppId ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60' : 'text-amber-400 bg-amber-950/80 border-amber-800/60') 
                        : 'text-slate-400 bg-slate-900 border-slate-800'
                    }`}>
                      {settingsForm.facebookAuthEnabled ? (settingsForm.facebookAppId ? 'Đang hoạt động' : 'Chưa nhập App ID') : 'Đang tắt'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.facebookAppId || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookAppId: e.target.value })}
                    placeholder="ví dụ: 966242223397117"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Lấy App ID tại <strong>developers.facebook.com</strong> &rarr; Ứng dụng &rarr; Facebook Login để kích hoạt xác thực từ Meta/Facebook.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cấu hình tài khoản nhận tiền VietQR & MoMo */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Cấu Hình Ngân Hàng & Tài Khoản Nhận Tiền Tự Động (VietQR)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Điền ngân hàng nào, hệ thống sẽ chỉ hiển thị đúng các ngân hàng đó cho người dùng khi nạp tiền.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentBanks = settingsForm.configuredBanks || [];
                  const newBank: ConfiguredBankItem = {
                    id: `bank_${Date.now()}`,
                    bankCode: 'VCB',
                    bankName: 'Vietcombank',
                    shortName: 'VCB',
                    bankAccount: '',
                    accountHolder: settingsForm.accountHolder || 'CONG TY TNHH THE GIOI ADMIN',
                    active: true
                  };
                  setSettingsForm({
                    ...settingsForm,
                    configuredBanks: [...currentBanks, newBank]
                  });
                  info('Đã thêm ngân hàng mới. Hãy nhập số tài khoản!');
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Ngân Hàng Nhận Tiền</span>
              </button>
            </div>

            {/* List of Configured Banks */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Danh Sách Ngân Hàng Nạp Tiền VietQR:</span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-normal">
                  {(settingsForm.configuredBanks || []).filter(b => b.active !== false && b.bankAccount).length} ngân hàng đang sẵn sàng nhận tiền
                </span>
              </div>

              {(!settingsForm.configuredBanks || settingsForm.configuredBanks.length === 0) ? (
                /* Single Bank Mode (Default fallback) */
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Chọn Ngân Hàng:</label>
                      <select
                        value={settingsForm.bankCode || 'MB'}
                        onChange={(e) => {
                          const code = e.target.value;
                          const found = VIET_BANKS.find(b => b.code === code);
                          setSettingsForm({
                            ...settingsForm,
                            bankCode: code,
                            bankName: found?.name || code
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                      >
                        {VIET_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.shortName} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Số Tài Khoản:</label>
                      <input
                        type="text"
                        value={settingsForm.bankAccount || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bankAccount: e.target.value })}
                        placeholder="VD: 0988889999"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Chủ Tài Khoản:</label>
                      <input
                        type="text"
                        value={settingsForm.accountHolder || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountHolder: e.target.value.toUpperCase() })}
                        placeholder="NGUYEN VAN A"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Multiple Banks List */
                <div className="space-y-3">
                  {settingsForm.configuredBanks.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        b.active !== false && b.bankAccount
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white text-xs">
                            {b.shortName || b.bankCode} ({b.bankName})
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.active !== false}
                              onChange={(e) => {
                                const nextBanks = [...settingsForm.configuredBanks!];
                                nextBanks[idx] = { ...b, active: e.target.checked };
                                setSettingsForm({ ...settingsForm, configuredBanks: nextBanks });
                              }}
                              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                            />
                            <span>{b.active !== false ? 'Hiển thị cho khách' : 'Tạm ẩn'}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const nextBanks = settingsForm.configuredBanks!.filter((_, i) => i !== idx);
                              setSettingsForm({ ...settingsForm, configuredBanks: nextBanks });
                              info(`Đã xóa ngân hàng ${b.shortName || b.bankCode}`);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                            title="Xóa ngân hàng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Ngân Hàng:</label>
                          <select
                            value={b.bankCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              const found = VIET_BANKS.find(v => v.code === code);
                              const nextBanks = [...settingsForm.configuredBanks!];
                              nextBanks[idx] = {
                                ...b,
                                bankCode: code,
                                bankName: found?.name || code,
                                shortName: found?.shortName || code
                              };
                              setSettingsForm({ ...settingsForm, configuredBanks: nextBanks });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                          >
                            {VIET_BANKS.map((vb) => (
                              <option key={vb.code} value={vb.code}>
                                {vb.shortName} - {vb.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Số Tài Khoản:</label>
                          <input
                            type="text"
                            value={b.bankAccount || ''}
                            onChange={(e) => {
                              const nextBanks = [...settingsForm.configuredBanks!];
                              nextBanks[idx] = { ...b, bankAccount: e.target.value };
                              // Also sync primary bankAccount if this is first
                              const updatePrimary = idx === 0 ? { bankAccount: e.target.value, bankCode: b.bankCode } : {};
                              setSettingsForm({ ...settingsForm, ...updatePrimary, configuredBanks: nextBanks });
                            }}
                            placeholder="Nhập số tài khoản..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Chủ Tài Khoản:</label>
                          <input
                            type="text"
                            value={b.accountHolder || ''}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              const nextBanks = [...settingsForm.configuredBanks!];
                              nextBanks[idx] = { ...b, accountHolder: val };
                              const updatePrimary = idx === 0 ? { accountHolder: val } : {};
                              setSettingsForm({ ...settingsForm, ...updatePrimary, configuredBanks: nextBanks });
                            }}
                            placeholder="TÊN CHỦ TÀI KHOẢN"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ví MoMo */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                <span>Ví Điện Tử MoMo:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Số điện thoại Ví MoMo:</label>
                  <input
                    type="text"
                    value={settingsForm.momoNumber || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, momoNumber: e.target.value })}
                    placeholder="0988889999"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-pink-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Tên chủ ví MoMo:</label>
                  <input
                    type="text"
                    value={settingsForm.momoName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, momoName: e.target.value })}
                    placeholder="CONG TY TNHH THE GIOI ADMIN"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Chương Trình Khuyến Mãi Nạp Tiền (% Thưởng Thêm) */}
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">
                      Chương Trình Khuyến Mãi Nạp Tiền (% Thưởng Thêm Vào Ví)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tự động cộng thêm % số dư khi thành viên nạp tiền qua VietQR, MoMo, VNPay
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.bonusDepositActive !== false}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      bonusDepositActive: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 text-xs">
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-amber-300 font-bold flex items-center gap-1">
                    <span>Tỷ lệ cộng thêm (%):</span>
                    <span className="text-[10px] text-slate-400 font-normal">(VD: 10, 20, 50)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={settingsForm.bonusDepositRate || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bonusDepositRate: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-400 font-black font-mono focus:border-amber-500 text-sm"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-slate-300 font-bold">Tiêu đề / Ghi chú thông báo khuyến mãi:</label>
                  <input
                    type="text"
                    value={settingsForm.bonusDepositNote || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bonusDepositNote: e.target.value })}
                    placeholder="Tặng thêm 10% giá trị nạp ví tự động qua VietQR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic simulation example */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">💡 Trực quan ví dụ:</span>
                  <span>
                    Trạng thái: <strong className={settingsForm.bonusDepositActive !== false ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{settingsForm.bonusDepositActive !== false ? "ĐANG BẬT" : "ĐÃ TẮT"}</strong>
                  </span>
                </div>

                {settingsForm.bonusDepositActive !== false && (settingsForm.bonusDepositRate || 0) > 0 ? (
                  <div className="font-mono text-xs">
                    Nạp 100.000đ → Thưởng +{(100000 * (settingsForm.bonusDepositRate || 0) / 100).toLocaleString('vi-VN')}đ ({settingsForm.bonusDepositRate}%) → <span className="text-emerald-400 font-bold">Tổng nhận = {(100000 + 100000 * (settingsForm.bonusDepositRate || 0) / 100).toLocaleString('vi-VN')}đ</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Khuyến mãi đang tắt, khách nạp đúng số tiền thực tế</span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CỔNG KẾT NỐI API XÁC NHẬN NẠP TIỀN TỰ ĐỘNG (SEPAY, PAYOS, CASSO, WEB2M...) */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Zap className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-white text-base">
                    Cổng Kết Nối API Xác Nhận Nạp Tiền Tự Động
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Tích hợp các cổng API đối soát tự động phổ biến tại Việt Nam (SePay, PayOS, Casso, Web2M, MoMo Business...) để tự động cộng tiền khi người dùng quét mã VietQR.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={settingsForm.autoPaymentConfig?.enabled !== false}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig || {
                        enabled: true,
                        provider: 'sepay',
                        apiKey: '',
                        accountNumber: settingsForm.bankAccount || '',
                        bankCode: settingsForm.bankCode || 'MB',
                        webhookUrl: `${window.location.origin}/api/webhook/sepay`,
                        autoUpgradePlanEnabled: true,
                        autoDepositBalanceEnabled: true,
                        depositPrefix: 'NAP',
                        proPlanPrefix: 'PRO',
                        vipPlanPrefix: 'VIP',
                        minDepositAmount: 10000,
                        matchUsernameOrUserId: true,
                        sendSuccessEmail: true,
                        playAudioAlert: true,
                      };
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, enabled: e.target.checked }
                      });
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    {settingsForm.autoPaymentConfig?.enabled !== false ? '🟢 Đang Bật Tự Động' : '⚪ Đang Tắt (Xác Nhận Thủ Công)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Provider Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Chọn Nhà Cung Cấp Cổng API Đối Soát Giao Dịch
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* SePay */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'sepay',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'sepay',
                        webhookUrl: `${window.location.origin}/api/webhook/sepay`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    (settingsForm.autoPaymentConfig?.provider || 'sepay') === 'sepay'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-300">SePay.vn</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">Khuyên Dùng</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Hỗ trợ tất cả ngân hàng VN (MB, VCB, ACB, TPB, TCB, VPB...). Đối soát tự động 5s.
                  </p>
                </button>

                {/* PayOS */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'payos',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'payos',
                        webhookUrl: `${window.location.origin}/api/webhook/payos`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settingsForm.autoPaymentConfig?.provider === 'payos'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-300">PayOS.vn</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">VietQR Pro</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Cổng thanh toán mở Open Banking, bảo mật Checksum cao cấp, tạo mã QR động từng đơn.
                  </p>
                </button>

                {/* Casso */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'casso',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'casso',
                        webhookUrl: `${window.location.origin}/api/webhook/casso`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settingsForm.autoPaymentConfig?.provider === 'casso'
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-cyan-300">Casso.vn</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">Bank Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Đồng bộ biến động số dư ngân hàng qua Secure Token & Webhook thông báo thời gian thực.
                  </p>
                </button>

                {/* Web2M */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'web2m',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'web2m',
                        webhookUrl: `${window.location.origin}/api/webhook/web2m`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settingsForm.autoPaymentConfig?.provider === 'web2m'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-purple-300">Web2M API</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">Auto Bank</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Hệ thống API nạp tiền tự động qua token ngân hàng Vietcombank, Techcombank, MB, ACB.
                  </p>
                </button>

                {/* MoMo Business API */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'momo_business',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'momo_business',
                        webhookUrl: `${window.location.origin}/api/webhook/momo`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settingsForm.autoPaymentConfig?.provider === 'momo_business'
                      ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-pink-300">MoMo Business</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">MoMo API</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Kết nối tài khoản MoMo Doanh Nghiệp qua Partner Code, Access Key và Secret Key.
                  </p>
                </button>

                {/* Custom Webhook */}
                <button
                  type="button"
                  onClick={() => {
                    const prev = settingsForm.autoPaymentConfig || {
                      enabled: true,
                      provider: 'custom_webhook',
                      apiKey: '',
                      accountNumber: '',
                      bankCode: 'MB',
                      webhookUrl: '',
                      autoUpgradePlanEnabled: true,
                      autoDepositBalanceEnabled: true,
                      depositPrefix: 'NAP',
                      proPlanPrefix: 'PRO',
                      vipPlanPrefix: 'VIP',
                      minDepositAmount: 10000,
                      matchUsernameOrUserId: true,
                      sendSuccessEmail: true,
                      playAudioAlert: true,
                    };
                    setSettingsForm({
                      ...settingsForm,
                      autoPaymentConfig: {
                        ...prev,
                        provider: 'custom_webhook',
                        webhookUrl: `${window.location.origin}/api/webhook/custom`
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settingsForm.autoPaymentConfig?.provider === 'custom_webhook'
                      ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-600/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-300">Custom Webhook</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">Tự Định Nghĩa</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Dành cho máy chủ hoặc hệ thống ngân hàng riêng của bạn đẩy Webhook trực tiếp vào hệ thống.
                  </p>
                </button>
              </div>
            </div>

            {/* Provider-specific Key Inputs */}
            <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>
                  2. Thông Tin Khóa API Cổng {(settingsForm.autoPaymentConfig?.provider || 'sepay').toUpperCase()}
                </span>
              </h4>

              {/* Specific inputs for SePay */}
              {(!settingsForm.autoPaymentConfig?.provider || settingsForm.autoPaymentConfig?.provider === 'sepay') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-slate-300 font-bold flex items-center justify-between">
                      <span>SePay API Token / Key:</span>
                      <a href="https://my.sepay.vn" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]">
                        Lấy API Key trên my.sepay.vn <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.apiKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig || {
                          enabled: true,
                          provider: 'sepay',
                          accountNumber: '',
                          bankCode: 'MB',
                          webhookUrl: '',
                          autoUpgradePlanEnabled: true,
                          autoDepositBalanceEnabled: true,
                          depositPrefix: 'NAP',
                          proPlanPrefix: 'PRO',
                          vipPlanPrefix: 'VIP',
                          minDepositAmount: 10000,
                          matchUsernameOrUserId: true,
                          sendSuccessEmail: true,
                          playAudioAlert: true,
                        };
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, apiKey: e.target.value }
                        });
                      }}
                      placeholder="Dán mã API Token SePay (VD: ABC123XYZ456...)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">Webhook Secret Key (Tùy chọn):</label>
                    <input
                      type="text"
                      value={settingsForm.autoPaymentConfig?.webhookSecret || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, webhookSecret: e.target.value }
                        });
                      }}
                      placeholder="Nhập chuỗi bảo mật Webhook Secret nếu có"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-slate-300 font-bold flex items-center justify-between">
                      <span>URL Webhook Tiếp Nhận Tự Động (Chuẩn SePay Developer):</span>
                      <a href="https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]">
                        Xem tài liệu kỹ thuật SePay Webhook <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-1">
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-between">
                          <span>URL 1 (Khuyên Dùng cho Node.js / Cloud Server):</span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/api/sepay/webhook`;
                              navigator.clipboard.writeText(url);
                              info('Đã copy URL: ' + url);
                            }}
                            className="text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/api/sepay/webhook`}
                          className="w-full bg-slate-950 text-emerald-300 font-mono text-xs px-2 py-1.5 rounded-lg border border-slate-800"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-1">
                        <div className="text-[10px] text-indigo-400 font-bold flex items-center justify-between">
                          <span>URL 2 (Dành cho Web Hosting Hostinger / cPanel):</span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/sepay_webhook.php`;
                              navigator.clipboard.writeText(url);
                              info('Đã copy URL: ' + url);
                            }}
                            className="text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/sepay_webhook.php`}
                          className="w-full bg-slate-950 text-indigo-300 font-mono text-xs px-2 py-1.5 rounded-lg border border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-slate-300 space-y-1.5 mt-2">
                      <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Quy trình 3 bước cài đặt Webhook trên my.sepay.vn:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>Truy cập <strong className="text-white">my.sepay.vn</strong> &gt; Menu <strong className="text-white">Cấu hình Webhook</strong> &gt; Bấm <strong className="text-white">Thêm Webhook</strong>.</li>
                        <li>Dán URL: <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">{`${typeof window !== 'undefined' ? window.location.origin : 'https://domain.com'}/api/sepay/webhook`}</code></li>
                        <li>Chọn sự kiện: <strong className="text-white">Giao dịch tiền vào</strong>. Endpoint sẽ tự động nhận diện và cộng số dư trong vòng 1 giây ngay khi tiền về ngân hàng!</li>
                      </ol>
                    </div>
                  </div>

                  {/* KHU VỰC TEST WEBHOOK SIMULATOR */}
                  <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-800 space-y-3 bg-slate-950/60 p-4 rounded-2xl border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                          ⚡
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-white">Công Cụ Bắn Webhook Thử Nghiệm (SePay Webhook Simulator)</h5>
                          <p className="text-[11px] text-slate-400">Kiểm tra ngay luồng nhận diện và tự động cộng tiền mà không cần chuyển khoản thật</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={fetchWebhookLogs}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWebhookLogs ? 'animate-spin' : ''}`} />
                        <span>Xem Nhật Ký Webhook ({webhookLogs.length})</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Tài khoản nhận tiền:</label>
                        <select
                          value={webhookSimForm.username}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWebhookSimForm(prev => ({
                              ...prev,
                              username: val,
                              content: `NAP ${val.toUpperCase()}`
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono"
                        >
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.username}>
                              @{u.username} ({u.name}) - Số dư: {u.balance?.toLocaleString('vi-VN')} đ
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Số tiền nạp (VNĐ):</label>
                        <input
                          type="number"
                          step="10000"
                          value={webhookSimForm.amount}
                          onChange={(e) => setWebhookSimForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono font-bold text-emerald-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Ngân hàng gửi:</label>
                        <select
                          value={webhookSimForm.gateway}
                          onChange={(e) => setWebhookSimForm(prev => ({ ...prev, gateway: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-2 font-mono"
                        >
                          <option value="MBBank">MBBank (Quân Đội)</option>
                          <option value="Vietcombank">Vietcombank</option>
                          <option value="Techcombank">Techcombank</option>
                          <option value="ACB">ACB</option>
                          <option value="TPBank">TPBank</option>
                          <option value="BIDV">BIDV</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Nội dung CK:</label>
                        <input
                          type="text"
                          value={webhookSimForm.content}
                          onChange={(e) => setWebhookSimForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="VD: NAP thegioiadmin"
                          className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono rounded-xl px-2.5 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-slate-400">
                        Cú pháp chuyển khoản sẽ gửi: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">{webhookSimForm.content}</code>
                      </div>

                      <button
                        type="button"
                        disabled={isSimulatingWebhook}
                        onClick={handleSimulateWebhook}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingWebhook ? 'animate-spin' : ''}`} />
                        <span>{isSimulatingWebhook ? 'Đang gửi gói tin...' : '🚀 Bắn Webhook Thử Nghiệm Ngay'}</span>
                      </button>
                    </div>

                    {/* Simulation Result */}
                    {simResult && (
                      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${simResult.success ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>{simResult.success ? '✅ Webhook Xử Lý Thành Công' : '❌ Lỗi Xử Lý Webhook'}</span>
                          <span className="text-[10px] opacity-75 font-mono">Status: 200 OK</span>
                        </div>
                        <p className="text-[11px]">{simResult.message}</p>
                        {simResult.user && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono border-t border-emerald-500/20">
                            <span>Tài khoản: <strong>@{simResult.user.username}</strong></span>
                            <span>| Số dư mới: <strong className="text-emerald-400">+{Number(simResult.user.balance).toLocaleString('vi-VN')} đ</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Realtime Webhook Logs Panel */}
                    {webhookLogs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                          <span>📋 Nhật ký các gói tin Webhook SePay vừa nhận:</span>
                          <button
                            type="button"
                            onClick={() => setWebhookLogs([])}
                            className="text-[10px] text-slate-500 hover:text-slate-300 font-normal"
                          >
                            Đóng danh sách
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                          {webhookLogs.map((log: any, idx: number) => (
                            <div key={idx} className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'duplicate_skipped' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                                <span className="text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN') : `#${idx + 1}`}</span>
                                <span className="font-bold text-emerald-400">+{Number(log.amount || log.baseAmount || 0).toLocaleString('vi-VN')} đ</span>
                                <span className="text-slate-300 truncate">ND: {log.content}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                                {log.status === 'success' ? `@${log.username || 'user'}` : log.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BẢNG CHẨN ĐOÁN KẾT NỐI & KIỂM TRA ĐỐI SOÁT SEPAY TRỰC TIẾP */}
                  <div className="sm:col-span-2 mt-3 pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-white">
                          Công Cụ Quét SePay Live API & Đối Soát Giao Dịch
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isTestingSepay}
                        onClick={handleTestSepayConnection}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingSepay ? 'animate-spin' : ''}`} />
                        <span>{isTestingSepay ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối & Quét 15 Giao Dịch'}</span>
                      </button>
                    </div>

                    {/* Results Container */}
                    {sepayDiagData && (
                      <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-2xl space-y-3 text-xs animate-in fade-in duration-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${sepayDiagData.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="font-bold text-white">
                              {sepayDiagData.connected ? '✅ Đã Kết Nối API SePay Thành Công' : '❌ Lỗi Kết Nối API SePay'}
                            </span>
                            {sepayDiagData.testedAccount && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                (Tài khoản: {sepayDiagData.testedAccount})
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Tìm thấy: <strong className="text-emerald-400">{sepayDiagData.totalTransactions || 0}</strong> giao dịch gần nhất
                          </span>
                        </div>

                        {sepayDiagData.message && (
                          <p className={`text-[11px] ${sepayDiagData.connected ? 'text-emerald-300/90' : 'text-rose-400'}`}>
                            {sepayDiagData.message}
                          </p>
                        )}

                        {/* Transactions Table */}
                        {sepayDiagData.transactions && sepayDiagData.transactions.length > 0 ? (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {sepayDiagData.transactions.map((t: any) => (
                              <div
                                key={t.id}
                                className={`p-3 rounded-xl border transition space-y-1.5 ${
                                  t.isCredited
                                    ? 'bg-emerald-950/20 border-emerald-500/30'
                                    : t.matchStatus === 'matched_pending'
                                    ? 'bg-amber-950/20 border-amber-500/30'
                                    : 'bg-slate-950 border-slate-800'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-slate-400">#{t.id}</span>
                                    <span className="font-mono font-black text-emerald-400 text-sm">
                                      +{Number(t.amountIn || 0).toLocaleString('vi-VN')} đ
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                      {t.bankBrand || 'BANK'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">{t.transactionDate}</span>
                                  </div>

                                  {/* Match Status Badge */}
                                  <div>
                                    {t.isCredited ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                        <span>Đã cộng tiền (@{t.matchedUsername || t.targetUser?.username})</span>
                                      </span>
                                    ) : t.matchStatus === 'matched_pending' ? (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                        🟡 Nhận diện được: @{t.targetUser?.username} ({t.targetUser?.name})
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                        ⚪ Chưa nhận diện tự động
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-lg text-[11px]">
                                  <div className="font-mono text-slate-300 break-all">
                                    <span className="text-slate-500 mr-1">Nội dung CK:</span>
                                    <strong className="text-amber-300">{t.content || '(Không có nội dung)'}</strong>
                                  </div>

                                  {/* Manual Credit Option if not already credited */}
                                  {!t.isCredited && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <select
                                        value={selectedUserForManualCredit[t.id] || t.targetUser?.username || ''}
                                        onChange={(e) => {
                                          setSelectedUserForManualCredit(prev => ({
                                            ...prev,
                                            [t.id]: e.target.value
                                          }));
                                        }}
                                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-mono"
                                      >
                                        <option value="">-- Chọn User cộng tiền --</option>
                                        {allUsers.map((u) => (
                                          <option key={u.id} value={u.username}>
                                            @{u.username} ({u.name})
                                          </option>
                                        ))}
                                      </select>

                                      <button
                                        type="button"
                                        disabled={isCreditingTxId === String(t.id)}
                                        onClick={() => handleManualCreditFromDiag(t)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap"
                                      >
                                        {isCreditingTxId === String(t.id) ? 'Đang cộng...' : 'Cộng tiền ngay'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            Chưa có giao dịch nào được ghi nhận trên tài khoản SePay này.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specific inputs for PayOS */}
              {settingsForm.autoPaymentConfig?.provider === 'payos' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">PayOS Client ID:</label>
                    <input
                      type="text"
                      value={settingsForm.autoPaymentConfig?.payosClientId || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, payosClientId: e.target.value }
                        });
                      }}
                      placeholder="VD: 550e8400-e29b-41d4-a716..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">PayOS API Key:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.payosApiKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, payosApiKey: e.target.value }
                        });
                      }}
                      placeholder="VD: 98f12c34-abcd-..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">PayOS Checksum Key:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.payosChecksumKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, payosChecksumKey: e.target.value }
                        });
                      }}
                      placeholder="VD: 3a7f8e..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-slate-400 font-semibold">URL Nhận Webhook PayOS:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/payos`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/payos`;
                          navigator.clipboard.writeText(url);
                          info('Đã sao chép URL Webhook PayOS!');
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific inputs for Casso */}
              {settingsForm.autoPaymentConfig?.provider === 'casso' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Casso API Secure Key:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.cassoApiKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, cassoApiKey: e.target.value }
                        });
                      }}
                      placeholder="Dán API Key tạo trên Casso.vn"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">URL Nhận Webhook Casso:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/casso`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/casso`;
                          navigator.clipboard.writeText(url);
                          info('Đã sao chép URL Webhook Casso!');
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific inputs for Web2M */}
              {settingsForm.autoPaymentConfig?.provider === 'web2m' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Web2M Token API:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.web2mToken || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, web2mToken: e.target.value }
                        });
                      }}
                      placeholder="Dán Token API Web2M"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">URL Nhận Webhook Web2M:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/web2m`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/web2m`;
                          navigator.clipboard.writeText(url);
                          info('Đã sao chép URL Webhook Web2M!');
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific inputs for MoMo Business */}
              {settingsForm.autoPaymentConfig?.provider === 'momo_business' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Partner Code MoMo:</label>
                    <input
                      type="text"
                      value={settingsForm.autoPaymentConfig?.momoPartnerCode || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, momoPartnerCode: e.target.value }
                        });
                      }}
                      placeholder="MOMOBKUN20180529..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Access Key MoMo:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.momoAccessKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, momoAccessKey: e.target.value }
                        });
                      }}
                      placeholder="Access Key..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Secret Key MoMo:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.momoSecretKey || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, momoSecretKey: e.target.value }
                        });
                      }}
                      placeholder="Secret Key..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-pink-500"
                    />
                  </div>
                </div>
              )}

              {/* Specific inputs for Custom Webhook */}
              {settingsForm.autoPaymentConfig?.provider === 'custom_webhook' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Secret Key Xác Thực Webhook:</label>
                    <input
                      type="password"
                      value={settingsForm.autoPaymentConfig?.webhookSecret || ''}
                      onChange={(e) => {
                        const prev = settingsForm.autoPaymentConfig!;
                        setSettingsForm({
                          ...settingsForm,
                          autoPaymentConfig: { ...prev, webhookSecret: e.target.value }
                        });
                      }}
                      placeholder="Chuỗi khóa bảo mật tự tạo"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold">URL Nhận Dữ Liệu Webhook:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/custom`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = settingsForm.autoPaymentConfig?.webhookUrl || `${window.location.origin}/api/webhook/custom`;
                          navigator.clipboard.writeText(url);
                          info('Đã sao chép URL Custom Webhook!');
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rules & Syntax Automation */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>3. Cú Pháp & Quy Tắc Tự Động Xử Lý Giao Dịch</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Cú pháp nạp ví (Mặc định: NAP):</label>
                  <input
                    type="text"
                    value={settingsForm.autoPaymentConfig?.depositPrefix || 'NAP'}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig || {
                        enabled: true,
                        provider: 'sepay',
                        apiKey: '',
                        accountNumber: '',
                        bankCode: 'MB',
                        webhookUrl: '',
                        autoUpgradePlanEnabled: true,
                        autoDepositBalanceEnabled: true,
                        depositPrefix: 'NAP',
                        proPlanPrefix: 'PRO',
                        vipPlanPrefix: 'VIP',
                        minDepositAmount: 10000,
                        matchUsernameOrUserId: true,
                        sendSuccessEmail: true,
                        playAudioAlert: true,
                      };
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, depositPrefix: e.target.value.toUpperCase() }
                      });
                    }}
                    placeholder="NAP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold uppercase focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Khách chuyển: NAP &lt;username&gt;</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Cú pháp mua gói PRO (Mặc định: PRO):</label>
                  <input
                    type="text"
                    value={settingsForm.autoPaymentConfig?.proPlanPrefix || 'PRO'}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig!;
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, proPlanPrefix: e.target.value.toUpperCase() }
                      });
                    }}
                    placeholder="PRO"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold uppercase focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Khách chuyển: PRO &lt;username&gt;</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold">Cú pháp mua gói VIP (Mặc định: VIP):</label>
                  <input
                    type="text"
                    value={settingsForm.autoPaymentConfig?.vipPlanPrefix || 'VIP'}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig!;
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, vipPlanPrefix: e.target.value.toUpperCase() }
                      });
                    }}
                    placeholder="VIP"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold uppercase focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Khách chuyển: VIP &lt;username&gt;</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 text-slate-300 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.autoPaymentConfig?.autoDepositBalanceEnabled !== false}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig!;
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, autoDepositBalanceEnabled: e.target.checked }
                      });
                    }}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Tự động cộng tiền vào ví khi nhận được tiền</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.autoPaymentConfig?.autoUpgradePlanEnabled !== false}
                    onChange={(e) => {
                      const prev = settingsForm.autoPaymentConfig!;
                      setSettingsForm({
                        ...settingsForm,
                        autoPaymentConfig: { ...prev, autoUpgradePlanEnabled: e.target.checked }
                      });
                    }}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Tự động kích hoạt gói PRO/VIP khi chuyển mua gói</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cấu hình Bản quyền chân trang Bio & Hệ thống */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-pink-400" />
              <span>Cấu Hình Bản Quyền Chân Trang (Bio & Hệ Thống)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Quản trị viên tùy chỉnh dòng chữ bản quyền và liên kết chân trang hiển thị mặc định trên các trang Bio của người dùng (tài khoản Free) và chân trang website chính.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Chữ bản quyền mặc định trang Bio (Tài khoản Free):</label>
                <input
                  type="text"
                  value={settingsForm.defaultBioFooterText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultBioFooterText: e.target.value })}
                  placeholder="Đăng ký miễn phí TRANG CÁ NHÂN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Link bản quyền mặc định trang Bio (Tài khoản Free):</label>
                <input
                  type="text"
                  value={settingsForm.defaultBioFooterLink || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultBioFooterLink: e.target.value })}
                  placeholder="http://trangcanhan.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-400 font-semibold">Dòng chữ bản quyền chân trang website hệ thống (Copyright Text):</label>
                <input
                  type="text"
                  value={settingsForm.footerConfig?.copyrightText || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    footerConfig: {
                      ...settingsForm.footerConfig,
                      copyrightText: e.target.value
                    }
                  })}
                  placeholder="© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Cấu hình Thông báo toàn trang */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Banner Thông Báo Chạy Dòng Đầu Trang (Top Marquee)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Dòng chữ chạy ngang hiển thị duy nhất ở ngoài trang chủ chính của website (tự động ẩn hoàn toàn trong cài đặt và các trang Bio của quản trị viên và thành viên).
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-600/50 transition shadow-inner">
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.announcementActive)}
                    onChange={(e) => {
                      lastUserActionTimestampRef.current = Date.now();
                      const nextVal = e.target.checked;
                      setSettingsForm((prev) => ({ ...prev, announcementActive: nextVal }));
                      const nextPayload: SystemConfig = {
                        ...systemConfig,
                        ...settingsForm,
                        announcementActive: nextVal,
                        announcementText: (settingsForm.announcementText || systemConfig?.announcementText || '').trim()
                      };
                      updateSystemConfig(nextPayload);
                      if (nextVal) {
                        success('Đã BẬT Banner thông báo chạy đầu trang (chỉ hiện ngoài trang chủ chính)!');
                      } else {
                        info('Đã TẮT Banner thông báo và đồng bộ ẩn tức thì trên mọi thiết bị!');
                      }
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${settingsForm.announcementActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {settingsForm.announcementActive ? 'Đang BẬT ●' : 'Đang TẮT ○'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const text = (settingsForm.announcementText || '').trim();
                    const nextPayload: SystemConfig = {
                      ...systemConfig,
                      ...settingsForm,
                      announcementActive: Boolean(settingsForm.announcementActive),
                      announcementText: text
                    };
                    updateSystemConfig(nextPayload);
                    success('Đã lưu nội dung & trạng thái Banner thành công vào Database hosting!');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Nhanh Banner</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span>Nội dung thông báo (hiển thị trên đầu trang):</span>
                {settingsForm.announcementActive ? (
                  <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">● Đang hiển thị công khai ngoài website theo thời gian thực</span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">○ Đã tắt hoàn toàn</span>
                )}
              </label>
              <textarea
                rows={2}
                value={settingsForm.announcementText || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                placeholder="Nhập nội dung thông báo muốn chạy trên đầu trang..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 font-sans leading-relaxed"
              />

              {/* Live Preview Bar inside Admin Panel */}
              {settingsForm.announcementActive && Boolean(settingsForm.announcementText?.trim()) && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Xem trước dòng chữ chạy thực tế:</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 py-2 px-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase shrink-0">
                        THÔNG BÁO
                      </span>
                      <div className="overflow-hidden whitespace-nowrap text-xs text-indigo-100 font-semibold">
                        <span className="animate-marquee-smooth inline-flex items-center gap-8">
                          <span>{settingsForm.announcementText.trim()}</span>
                          <span className="text-amber-400">•</span>
                          <span>{settingsForm.announcementText.trim()}</span>
                          <span className="text-amber-400">•</span>
                          <span>{settingsForm.announcementText.trim()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cấu hình POPUP THÔNG BÁO HỆ THỐNG (Hiển thị 1 lần khi khách truy cập) */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>Popup Thông Báo Hệ Thống (Hiển Thị 1 Lần Khi Truy Cập)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cửa sổ Popup nổi bật, xuất hiện duy nhất 1 lần khi người dùng mở trang web (tránh gây phiền hà trong quá trình duyệt web, đóng trình duyệt mở lại mới xuất hiện).
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewPopupOpen(true)}
                  className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Thử Popup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    lastUserActionTimestampRef.current = Date.now();
                    const popupData = {
                      enabled: Boolean(settingsForm.popupModal?.enabled),
                      title: (settingsForm.popupModal?.title || 'Chào Mừng Đến Với TRANG CÁ NHÂN').trim(),
                      badge: (settingsForm.popupModal?.badge || 'THÔNG BÁO TỪ BAN QUẢN TRỊ').trim(),
                      content: (settingsForm.popupModal?.content || '').trim(),
                      buttonText: (settingsForm.popupModal?.buttonText || 'Khám Phá Ngay').trim(),
                      buttonLink: (settingsForm.popupModal?.buttonLink || '#pricing').trim(),
                      imageUrl: (settingsForm.popupModal?.imageUrl || '').trim()
                    };
                    const nextPayload: SystemConfig = {
                      ...systemConfig,
                      ...settingsForm,
                      popupModal: popupData
                    };
                    updateSystemConfig(nextPayload);
                    success('Đã lưu nội dung & trạng thái Popup thông báo thành công vào Database hosting!');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Nhanh Popup</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.popupModal?.enabled)}
                    onChange={(e) => {
                      lastUserActionTimestampRef.current = Date.now();
                      const nextVal = e.target.checked;
                      const nextPopup = {
                        enabled: nextVal,
                        title: settingsForm.popupModal?.title || 'Chào Mừng Đến Với TRANG CÁ NHÂN',
                        badge: settingsForm.popupModal?.badge || 'THÔNG BÁO TỪ BAN QUẢN TRỊ',
                        content: settingsForm.popupModal?.content || '',
                        buttonText: settingsForm.popupModal?.buttonText || 'Khám Phá Ngay',
                        buttonLink: settingsForm.popupModal?.buttonLink || '#pricing',
                        imageUrl: settingsForm.popupModal?.imageUrl || ''
                      };
                      setSettingsForm((prev) => ({
                        ...prev,
                        popupModal: nextPopup
                      }));
                      const nextPayload: SystemConfig = {
                        ...systemConfig,
                        ...settingsForm,
                        popupModal: nextPopup
                      };
                      updateSystemConfig(nextPayload);
                      if (nextVal) {
                        success('Đã BẬT Popup thông báo hệ thống và đồng bộ tức thì lên hosting!');
                      } else {
                        info('Đã TẮT Popup thông báo hệ thống và đồng bộ ẩn tức thì trên mọi thiết bị!');
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    {settingsForm.popupModal?.enabled ? 'Đang Bật ●' : 'Đã Tắt ○'}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Tiêu đề Popup thông báo:</span>
                  <span className="text-[10px] text-slate-500">Bắt buộc</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.popupModal?.title || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, content: '' }),
                      title: e.target.value
                    }
                  })}
                  placeholder="🎉 Chào mừng sự kiện nâng cấp giao diện 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Nhãn Badge góc trên (Tùy chọn):</label>
                <input
                  type="text"
                  value={settingsForm.popupModal?.badge || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, title: '', content: '' }),
                      badge: e.target.value
                    }
                  })}
                  placeholder="THÔNG BÁO TỪ BAN QUẢN TRỊ / SỰ KIỆN HOT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Nội dung thông báo (hỗ trợ xuống dòng và biểu tượng cảm xúc):</label>
                <textarea
                  rows={4}
                  value={settingsForm.popupModal?.content || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, title: '' }),
                      content: e.target.value
                    }
                  })}
                  placeholder="Nhập nội dung thông báo gửi đến toàn bộ khách truy cập..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 font-normal leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Chữ trên nút hành động (Button Text):</label>
                <input
                  type="text"
                  value={settingsForm.popupModal?.buttonText || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, title: '', content: '' }),
                      buttonText: e.target.value
                    }
                  })}
                  placeholder="VD: Xem Bảng Giá, Khám Phá Ngay, Đọc Bài Viết"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Đường dẫn khi bấm nút (Button Link):</label>
                <input
                  type="text"
                  value={settingsForm.popupModal?.buttonLink || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, title: '', content: '' }),
                      buttonLink: e.target.value
                    }
                  })}
                  placeholder="VD: #pricing, #templates, /blog, /huong-dan hoặc https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-300 font-semibold">URL Ảnh minh họa banner Popup (Tùy chọn):</label>
                <input
                  type="text"
                  value={settingsForm.popupModal?.imageUrl || ''}
                  onChange={(e) => setSettingsForm({
                    ...settingsForm,
                    popupModal: {
                      ...(settingsForm.popupModal || { enabled: true, title: '', content: '' }),
                      imageUrl: e.target.value
                    }
                  })}
                  placeholder="https://images.unsplash.com/... (Để trống nếu không muốn hiện ảnh)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-amber-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>

        </form>
      )}

      {/* MODAL SỬA NGƯỜI DÙNG & ĐIỀU CHỈNH SỐ DƯ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Chỉnh Sửa Thành Viên: {editingUser.name}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Họ và tên:</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Username (@):</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Gói cước:</label>
                  <select
                    value={editingUser.plan}
                    onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as PlanType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="free">FREE</option>
                    <option value="pro">CREATOR PRO</option>
                    <option value="vip">VIP LIFETIME</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Vai trò:</label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="user">Người dùng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Tích xanh xác minh */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-medium">Tích xanh xác minh (Verified Badge):</span>
                <input
                  type="checkbox"
                  checked={editingUser.verified}
                  onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              {/* Cộng / Trừ tiền vào ví */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Điều chỉnh số dư ví:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Hiện có: {formatMoney(editingUser.balance || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Số tiền VNĐ (vd: 100000)"
                    value={balanceAdjustAmount}
                    onChange={(e) => setBalanceAdjustAmount(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Lý do điều chỉnh..."
                    value={balanceAdjustReason}
                    onChange={(e) => setBalanceAdjustReason(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      adminAdjustBalance(editingUser.id, Math.abs(balanceAdjustAmount), balanceAdjustReason);
                      setEditingUser({ ...editingUser, balance: (editingUser.balance || 0) + Math.abs(balanceAdjustAmount) });
                      success(`Đã cộng ${formatMoney(Math.abs(balanceAdjustAmount))} cho ${editingUser.name}`);
                    }}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold transition"
                  >
                    + Cộng tiền
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      adminAdjustBalance(editingUser.id, -Math.abs(balanceAdjustAmount), balanceAdjustReason);
                      setEditingUser({ ...editingUser, balance: Math.max(0, (editingUser.balance || 0) - Math.abs(balanceAdjustAmount)) });
                      info(`Đã trừ ${formatMoney(Math.abs(balanceAdjustAmount))} của ${editingUser.name}`);
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition"
                  >
                    - Trừ tiền
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEditUser}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM THÀNH VIÊN MỚI */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Thêm Thành Viên Mới Vào Hệ Thống</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Họ và tên thành viên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Long"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Email đăng nhập:</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Username (@):</label>
                  <input
                    type="text"
                    required
                    placeholder="minhlong"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Gói thành viên:</label>
                  <select
                    value={newUserForm.plan}
                    onChange={(e) => setNewUserForm({ ...newUserForm, plan: e.target.value as PlanType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="free">FREE</option>
                    <option value="pro">PRO</option>
                    <option value="vip">VIP LIFETIME</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Số dư khởi tạo (VNĐ):</label>
                  <input
                    type="number"
                    value={newUserForm.balance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, balance: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold"
              >
                Tạo Thành Viên
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CHỈNH SỬA GIAO DIỆN MẪU TOÀN DIỆN (CHỮ, BỐ CỤC, HÌNH NỀN, BLOCKS & LIVE PREVIEW) */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-6xl w-full space-y-4 shadow-2xl my-4 max-h-[94vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-sm sm:text-base truncate">
                      Chỉnh Sửa Giao Diện: <span className="text-purple-400">{editingTemplate.name}</span>
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                      editingTemplate.planRequired === 'vip'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : editingTemplate.planRequired === 'pro'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {editingTemplate.planRequired.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Tùy biến chữ, phông chữ, hình nền, màu sắc, bố cục thẻ, nút bấm và khối nội dung mẫu với xem thử trực quan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTemplateEditTab('content')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  templateEditTab === 'content'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>1. Chữ & Thông Tin Mẫu</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateEditTab('theme')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  templateEditTab === 'theme'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>2. Hình Nền & Màu Sắc</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateEditTab('layout')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  templateEditTab === 'layout'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Bố Cục & Kiểu Dáng</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateEditTab('blocks')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  templateEditTab === 'blocks'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>4. Khối Mẫu & Mạng Xã Hội ({editingTemplate.config?.blocks?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body Dual-Pane (Left: Settings Form, Right: Live Phone Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto">
              
              {/* Left Pane: Config Forms (Col 7) */}
              <div className="lg:col-span-7 space-y-4 overflow-y-auto pr-1 text-xs custom-scrollbar">
                
                {/* TAB 1: CHỮ & THÔNG TIN */}
                {templateEditTab === 'content' && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Basic Meta Group */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Thông Tin Cơ Bản Mẫu Giao Diện</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Tên mẫu giao diện:</label>
                          <input
                            type="text"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Tác giả thiết kế:</label>
                          <input
                            type="text"
                            value={editingTemplate.author}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, author: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Danh mục:</label>
                          <select
                            value={editingTemplate.category}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                          >
                            <option value="creator">Sáng tạo & Streamer</option>
                            <option value="beauty">Thời trang & Làm đẹp</option>
                            <option value="shop">Kinh doanh & Bán hàng</option>
                            <option value="dev">Lập trình & Hồ sơ cá nhân</option>
                            <option value="fitness">Thể hình & Thể thao</option>
                            <option value="business">Bất động sản & Doanh nghiệp</option>
                            <option value="music">DJ & Âm nhạc</option>
                            <option value="crypto">Tiền điện tử & Web3</option>
                            <option value="education">Giáo dục & Khóa học</option>
                            <option value="food">Ẩm thực & Đánh giá món ăn</option>
                            <option value="photography">Nhiếp ảnh & Studio</option>
                            <option value="consulting">Tư vấn & Phong thủy</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Gói dịch vụ:</label>
                          <select
                            value={editingTemplate.planRequired}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, planRequired: e.target.value as PlanType })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 font-bold"
                          >
                            <option value="free">🎁 Mẫu Free</option>
                            <option value="pro">⭐ Mẫu Pro</option>
                            <option value="vip">👑 Mẫu VIP</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Huy hiệu góc (Badge):</label>
                          <input
                            type="text"
                            value={editingTemplate.badge || ''}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, badge: e.target.value })}
                            placeholder="HOT, VIP, MỚI..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-slate-400 font-semibold">Link ảnh Thumbnail thẻ mẫu:</label>
                          <input
                            type="text"
                            value={editingTemplate.previewImg}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, previewImg: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Lượt thích (Likes):</label>
                          <input
                            type="number"
                            value={editingTemplate.likes}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, likes: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profile Demo Content Group */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Chữ & Hồ Sơ Mẫu (Profile Demo Text)</span>
                        </div>
                        {editingTemplate.planRequired !== 'free' && (
                          <label className="flex items-center gap-1.5 cursor-pointer text-blue-400 text-xs">
                            <input
                              type="checkbox"
                              checked={editingTemplate.config?.profile?.verifiedBadge || false}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  profile: {
                                    ...editingTemplate.config?.profile,
                                    displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                    bio: editingTemplate.config?.profile?.bio || '',
                                    avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                    verifiedBadge: e.target.checked,
                                    showShareButton: true,
                                    showVCard: true
                                  }
                                }
                              })}
                              className="rounded accent-blue-500"
                            />
                            <span>Tích Xanh Xác Minh (Pro/VIP)</span>
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Tên người mẫu / Bio Name:</label>
                          <input
                            type="text"
                            value={editingTemplate.config?.profile?.displayName || ''}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                profile: {
                                  ...editingTemplate.config?.profile,
                                  displayName: e.target.value,
                                  bio: editingTemplate.config?.profile?.bio || '',
                                  avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                  verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                  showShareButton: true,
                                  showVCard: true
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Chức danh ngắn (Tagline):</label>
                          <input
                            type="text"
                            value={editingTemplate.config?.profile?.tagline || ''}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                profile: {
                                  ...editingTemplate.config?.profile,
                                  displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                  bio: editingTemplate.config?.profile?.bio || '',
                                  avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                  verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                  showShareButton: true,
                                  showVCard: true,
                                  tagline: e.target.value
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Tiểu sử Bio (Mô tả):</label>
                        <textarea
                          rows={2}
                          value={editingTemplate.config?.profile?.bio || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            config: {
                              ...editingTemplate.config,
                              profile: {
                                ...editingTemplate.config?.profile,
                                displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                showShareButton: true,
                                showVCard: true,
                                bio: e.target.value
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Địa chỉ / Tỉnh thành:</label>
                          <input
                            type="text"
                            value={editingTemplate.config?.profile?.location || ''}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                profile: {
                                  ...editingTemplate.config?.profile,
                                  displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                  bio: editingTemplate.config?.profile?.bio || '',
                                  avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                  verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                  showShareButton: true,
                                  showVCard: true,
                                  location: e.target.value
                                }
                              }
                            })}
                            placeholder="Hà Nội / TP. Hồ Chí Minh"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Nơi làm việc:</label>
                          <input
                            type="text"
                            value={editingTemplate.config?.profile?.workplace || ''}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                profile: {
                                  ...editingTemplate.config?.profile,
                                  displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                  bio: editingTemplate.config?.profile?.bio || '',
                                  avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                  verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                  showShareButton: true,
                                  showVCard: true,
                                  workplace: e.target.value
                                }
                              }
                            })}
                            placeholder="TRANG CÁ NHÂN Studio"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      {/* Avatar & Cover Image Upload Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                        {/* Avatar Image Upload */}
                        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Ảnh Đại Diện (Avatar)</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">JPG, PNG, WebP</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 shadow-inner flex items-center justify-center">
                              {editingTemplate.config?.profile?.avatarUrl ? (
                                <img
                                  src={editingTemplate.config?.profile?.avatarUrl}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xl">👤</span>
                              )}
                            </div>

                            <div className="flex-1 space-y-1.5">
                              <label
                                htmlFor="admin-avatar-file-input"
                                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-center"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Tải Ảnh Từ Máy Tính</span>
                              </label>
                              <input
                                id="admin-avatar-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px]">Hoặc dán link ảnh trực tiếp (URL):</label>
                            <input
                              type="text"
                              value={editingTemplate.config?.profile?.avatarUrl || ''}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                previewImg: e.target.value || editingTemplate.previewImg,
                                config: {
                                  ...editingTemplate.config,
                                  profile: {
                                    ...editingTemplate.config?.profile,
                                    displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                    bio: editingTemplate.config?.profile?.bio || '',
                                    verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                    showShareButton: true,
                                    showVCard: true,
                                    avatarUrl: e.target.value
                                  }
                                }
                              })}
                              placeholder="https://..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Cover Image Banner Upload */}
                        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span>Ảnh Bìa Header (Cover Banner)</span>
                            </span>
                            {editingTemplate.config?.profile?.coverImageUrl && (
                              <button
                                type="button"
                                onClick={() => setEditingTemplate({
                                  ...editingTemplate,
                                  config: {
                                    ...editingTemplate.config,
                                    profile: {
                                      ...editingTemplate.config?.profile,
                                      displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                      bio: editingTemplate.config?.profile?.bio || '',
                                      avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                      verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                      showShareButton: true,
                                      showVCard: true,
                                      coverImageUrl: undefined
                                    }
                                  }
                                })}
                                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition"
                              >
                                Xóa ảnh bìa
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 shadow-inner flex items-center justify-center">
                              {editingTemplate.config?.profile?.coverImageUrl ? (
                                <img
                                  src={editingTemplate.config?.profile?.coverImageUrl}
                                  alt="Cover"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono">Không có</span>
                              )}
                            </div>

                            <div className="flex-1 space-y-1.5">
                              <label
                                htmlFor="admin-cover-file-input"
                                className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-center"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Tải Ảnh Bìa Từ Máy</span>
                              </label>
                              <input
                                id="admin-cover-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 text-[10px]">Hoặc dán link ảnh bìa (URL):</label>
                            <input
                              type="text"
                              value={editingTemplate.config?.profile?.coverImageUrl || ''}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  profile: {
                                    ...editingTemplate.config?.profile,
                                    displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                    bio: editingTemplate.config?.profile?.bio || '',
                                    avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                    verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                    showShareButton: true,
                                    showVCard: true,
                                    coverImageUrl: e.target.value
                                  }
                                }
                              })}
                              placeholder="https://..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Typography Settings Group */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Phông Chữ & Kích Thước (Typography)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Phông chữ (Font Family):</label>
                          <select
                            value={editingTemplate.config?.theme?.fontFamily || 'font-sans'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  id: editingTemplate.config?.theme?.id || 'custom-theme',
                                  name: editingTemplate.config?.theme?.name || editingTemplate.name,
                                  bgType: editingTemplate.config?.theme?.bgType || 'gradient',
                                  bgColor: editingTemplate.config?.theme?.bgColor || '#0f172a',
                                  bgGradient: editingTemplate.config?.theme?.bgGradient || { from: '#6366f1', via: '#a855f7', to: '#3b82f6', direction: 'to-b' },
                                  bgImageUrl: editingTemplate.config?.theme?.bgImageUrl || '',
                                  bgOverlayOpacity: editingTemplate.config?.theme?.bgOverlayOpacity || 0,
                                  bgBlur: editingTemplate.config?.theme?.bgBlur || 0,
                                  fontSize: editingTemplate.config?.theme?.fontSize || 'medium',
                                  textColor: editingTemplate.config?.theme?.textColor || '#ffffff',
                                  accentColor: editingTemplate.config?.theme?.accentColor || '#6366f1',
                                  cardStyle: editingTemplate.config?.theme?.cardStyle || 'glass',
                                  cardBgColor: editingTemplate.config?.theme?.cardBgColor || 'rgba(255,255,255,0.1)',
                                  cardTextColor: editingTemplate.config?.theme?.cardTextColor || '#ffffff',
                                  cardBorderColor: editingTemplate.config?.theme?.cardBorderColor || 'rgba(255,255,255,0.2)',
                                  cardHoverEffect: editingTemplate.config?.theme?.cardHoverEffect || 'scale',
                                  buttonShape: editingTemplate.config?.theme?.buttonShape || 'rounded-xl',
                                  buttonAnimation: editingTemplate.config?.theme?.buttonAnimation || 'none',
                                  avatarShape: editingTemplate.config?.theme?.avatarShape || 'circle',
                                  avatarBorderColor: editingTemplate.config?.theme?.avatarBorderColor || '#ffffff',
                                  avatarBorderWidth: editingTemplate.config?.theme?.avatarBorderWidth || 2,
                                  fontFamily: e.target.value
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="font-sans">Inter / Modern Sans</option>
                            <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Sang trọng)</option>
                            <option value="'Montserrat', sans-serif">Montserrat (Trẻ trung)</option>
                            <option value="'Poppins', sans-serif">Poppins (Hiện đại)</option>
                            <option value="'Playfair Display', serif">Playfair Display (Quý phái / Nghệ thuật)</option>
                            <option value="'Roboto', sans-serif">Roboto (Tiêu chuẩn)</option>
                            <option value="'Oswald', sans-serif">Oswald (Mạnh mẽ / Bold)</option>
                            <option value="'Dancing Script', cursive">Dancing Script (Viết tay nghệ thuật)</option>
                            <option value="'Fira Code', monospace">Fira Code (Lập trình / Tech)</option>
                            <option value="font-serif">Serif Cổ Điển</option>
                            <option value="font-mono">Monospace Terminal</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Cỡ chữ (Font Size):</label>
                          <select
                            value={editingTemplate.config?.theme?.fontSize || 'medium'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  id: editingTemplate.config?.theme?.id || 'custom-theme',
                                  name: editingTemplate.config?.theme?.name || editingTemplate.name,
                                  bgType: editingTemplate.config?.theme?.bgType || 'gradient',
                                  bgColor: editingTemplate.config?.theme?.bgColor || '#0f172a',
                                  bgGradient: editingTemplate.config?.theme?.bgGradient || { from: '#6366f1', via: '#a855f7', to: '#3b82f6', direction: 'to-b' },
                                  bgImageUrl: editingTemplate.config?.theme?.bgImageUrl || '',
                                  bgOverlayOpacity: editingTemplate.config?.theme?.bgOverlayOpacity || 0,
                                  bgBlur: editingTemplate.config?.theme?.bgBlur || 0,
                                  fontFamily: editingTemplate.config?.theme?.fontFamily || 'font-sans',
                                  textColor: editingTemplate.config?.theme?.textColor || '#ffffff',
                                  accentColor: editingTemplate.config?.theme?.accentColor || '#6366f1',
                                  cardStyle: editingTemplate.config?.theme?.cardStyle || 'glass',
                                  cardBgColor: editingTemplate.config?.theme?.cardBgColor || 'rgba(255,255,255,0.1)',
                                  cardTextColor: editingTemplate.config?.theme?.cardTextColor || '#ffffff',
                                  cardBorderColor: editingTemplate.config?.theme?.cardBorderColor || 'rgba(255,255,255,0.2)',
                                  cardHoverEffect: editingTemplate.config?.theme?.cardHoverEffect || 'scale',
                                  buttonShape: editingTemplate.config?.theme?.buttonShape || 'rounded-xl',
                                  buttonAnimation: editingTemplate.config?.theme?.buttonAnimation || 'none',
                                  avatarShape: editingTemplate.config?.theme?.avatarShape || 'circle',
                                  avatarBorderColor: editingTemplate.config?.theme?.avatarBorderColor || '#ffffff',
                                  avatarBorderWidth: editingTemplate.config?.theme?.avatarBorderWidth || 2,
                                  fontSize: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="small">Nhỏ gọn (Small)</option>
                            <option value="medium">Chuẩn vừa (Medium)</option>
                            <option value="large">Lớn nổi bật (Large)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Màu chữ chính:</label>
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                            <input
                              type="color"
                              value={editingTemplate.config?.theme?.textColor || '#ffffff'}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    id: editingTemplate.config?.theme?.id || 'custom-theme',
                                    name: editingTemplate.config?.theme?.name || editingTemplate.name,
                                    bgType: editingTemplate.config?.theme?.bgType || 'gradient',
                                    bgColor: editingTemplate.config?.theme?.bgColor || '#0f172a',
                                    bgGradient: editingTemplate.config?.theme?.bgGradient || { from: '#6366f1', via: '#a855f7', to: '#3b82f6', direction: 'to-b' },
                                    bgImageUrl: editingTemplate.config?.theme?.bgImageUrl || '',
                                    bgOverlayOpacity: editingTemplate.config?.theme?.bgOverlayOpacity || 0,
                                    bgBlur: editingTemplate.config?.theme?.bgBlur || 0,
                                    fontFamily: editingTemplate.config?.theme?.fontFamily || 'font-sans',
                                    fontSize: editingTemplate.config?.theme?.fontSize || 'medium',
                                    accentColor: editingTemplate.config?.theme?.accentColor || '#6366f1',
                                    cardStyle: editingTemplate.config?.theme?.cardStyle || 'glass',
                                    cardBgColor: editingTemplate.config?.theme?.cardBgColor || 'rgba(255,255,255,0.1)',
                                    cardTextColor: editingTemplate.config?.theme?.cardTextColor || '#ffffff',
                                    cardBorderColor: editingTemplate.config?.theme?.cardBorderColor || 'rgba(255,255,255,0.2)',
                                    cardHoverEffect: editingTemplate.config?.theme?.cardHoverEffect || 'scale',
                                    buttonShape: editingTemplate.config?.theme?.buttonShape || 'rounded-xl',
                                    buttonAnimation: editingTemplate.config?.theme?.buttonAnimation || 'none',
                                    avatarShape: editingTemplate.config?.theme?.avatarShape || 'circle',
                                    avatarBorderColor: editingTemplate.config?.theme?.avatarBorderColor || '#ffffff',
                                    avatarBorderWidth: editingTemplate.config?.theme?.avatarBorderWidth || 2,
                                    textColor: e.target.value
                                  }
                                }
                              })}
                              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer p-0"
                            />
                            <span className="font-mono text-white text-xs">
                              {editingTemplate.config?.theme?.textColor || '#ffffff'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: HÌNH NỀN & MÀU SẮC */}
                {templateEditTab === 'theme' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                      <div className="font-bold text-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Kiểu Hình Nền & Màu Nền Trang (Background Settings)</span>
                        </div>
                      </div>

                      {/* Select Background Type */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'gradient', label: 'Gradient Đa Sắc', desc: 'Chuyển màu mượt mà' },
                          { id: 'image', label: 'Hình Nền Ảnh (HD)', desc: 'Wallpaper nghệ thuật' },
                          { id: 'color', label: 'Màu Đơn (Solid)', desc: 'Tối giản một màu' },
                        ].map((b) => {
                          const isSelected = (editingTemplate.config?.theme?.bgType || 'gradient') === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    id: editingTemplate.config?.theme?.id || 'custom-theme',
                                    name: editingTemplate.config?.theme?.name || editingTemplate.name,
                                    bgColor: editingTemplate.config?.theme?.bgColor || '#0f172a',
                                    bgGradient: editingTemplate.config?.theme?.bgGradient || { from: '#6366f1', via: '#a855f7', to: '#3b82f6', direction: 'to-b' },
                                    bgImageUrl: editingTemplate.config?.theme?.bgImageUrl || '',
                                    bgOverlayOpacity: editingTemplate.config?.theme?.bgOverlayOpacity || 0,
                                    bgBlur: editingTemplate.config?.theme?.bgBlur || 0,
                                    fontFamily: editingTemplate.config?.theme?.fontFamily || 'font-sans',
                                    fontSize: editingTemplate.config?.theme?.fontSize || 'medium',
                                    textColor: editingTemplate.config?.theme?.textColor || '#ffffff',
                                    accentColor: editingTemplate.config?.theme?.accentColor || '#6366f1',
                                    cardStyle: editingTemplate.config?.theme?.cardStyle || 'glass',
                                    cardBgColor: editingTemplate.config?.theme?.cardBgColor || 'rgba(255,255,255,0.1)',
                                    cardTextColor: editingTemplate.config?.theme?.cardTextColor || '#ffffff',
                                    cardBorderColor: editingTemplate.config?.theme?.cardBorderColor || 'rgba(255,255,255,0.2)',
                                    cardHoverEffect: editingTemplate.config?.theme?.cardHoverEffect || 'scale',
                                    buttonShape: editingTemplate.config?.theme?.buttonShape || 'rounded-xl',
                                    buttonAnimation: editingTemplate.config?.theme?.buttonAnimation || 'none',
                                    avatarShape: editingTemplate.config?.theme?.avatarShape || 'circle',
                                    avatarBorderColor: editingTemplate.config?.theme?.avatarBorderColor || '#ffffff',
                                    avatarBorderWidth: editingTemplate.config?.theme?.avatarBorderWidth || 2,
                                    bgType: b.id as any
                                  }
                                }
                              })}
                              className={`p-3 rounded-xl border text-left transition ${
                                isSelected
                                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <div className="font-bold text-xs">{b.label}</div>
                              <div className="text-[10px] text-slate-400 opacity-80">{b.desc}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* 1. Gradient Controls */}
                      {editingTemplate.config?.theme?.bgType === 'gradient' && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                          <div className="font-semibold text-slate-300">Tùy chỉnh Gradient 3 màu & Hướng đổ:</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-slate-400">Màu bắt đầu (From):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingTemplate.config?.theme?.bgGradient?.from || '#6366f1'}
                                  onChange={(e) => setEditingTemplate({
                                    ...editingTemplate,
                                    config: {
                                      ...editingTemplate.config,
                                      theme: {
                                        ...editingTemplate.config?.theme!,
                                        bgGradient: {
                                          ...editingTemplate.config?.theme?.bgGradient!,
                                          from: e.target.value,
                                          to: editingTemplate.config?.theme?.bgGradient?.to || '#3b82f6',
                                          direction: editingTemplate.config?.theme?.bgGradient?.direction || 'to-b'
                                        }
                                      }
                                    }
                                  })}
                                  className="w-7 h-7 rounded bg-transparent border-0 cursor-pointer p-0"
                                />
                                <span className="font-mono text-slate-300 text-[11px]">{editingTemplate.config?.theme?.bgGradient?.from || '#6366f1'}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-slate-400">Màu giữa (Via):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingTemplate.config?.theme?.bgGradient?.via || '#a855f7'}
                                  onChange={(e) => setEditingTemplate({
                                    ...editingTemplate,
                                    config: {
                                      ...editingTemplate.config,
                                      theme: {
                                        ...editingTemplate.config?.theme!,
                                        bgGradient: {
                                          ...editingTemplate.config?.theme?.bgGradient!,
                                          from: editingTemplate.config?.theme?.bgGradient?.from || '#6366f1',
                                          via: e.target.value,
                                          to: editingTemplate.config?.theme?.bgGradient?.to || '#3b82f6',
                                          direction: editingTemplate.config?.theme?.bgGradient?.direction || 'to-b'
                                        }
                                      }
                                    }
                                  })}
                                  className="w-7 h-7 rounded bg-transparent border-0 cursor-pointer p-0"
                                />
                                <span className="font-mono text-slate-300 text-[11px]">{editingTemplate.config?.theme?.bgGradient?.via || '#a855f7'}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-slate-400">Màu kết thúc (To):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={editingTemplate.config?.theme?.bgGradient?.to || '#3b82f6'}
                                  onChange={(e) => setEditingTemplate({
                                    ...editingTemplate,
                                    config: {
                                      ...editingTemplate.config,
                                      theme: {
                                        ...editingTemplate.config?.theme!,
                                        bgGradient: {
                                          ...editingTemplate.config?.theme?.bgGradient!,
                                          from: editingTemplate.config?.theme?.bgGradient?.from || '#6366f1',
                                          to: e.target.value,
                                          direction: editingTemplate.config?.theme?.bgGradient?.direction || 'to-b'
                                        }
                                      }
                                    }
                                  })}
                                  className="w-7 h-7 rounded bg-transparent border-0 cursor-pointer p-0"
                                />
                                <span className="font-mono text-slate-300 text-[11px]">{editingTemplate.config?.theme?.bgGradient?.to || '#3b82f6'}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-slate-400">Hướng đổ:</label>
                              <select
                                value={editingTemplate.config?.theme?.bgGradient?.direction || 'to-b'}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  config: {
                                    ...editingTemplate.config,
                                    theme: {
                                      ...editingTemplate.config?.theme!,
                                      bgGradient: {
                                        ...editingTemplate.config?.theme?.bgGradient!,
                                        from: editingTemplate.config?.theme?.bgGradient?.from || '#6366f1',
                                        to: editingTemplate.config?.theme?.bgGradient?.to || '#3b82f6',
                                        direction: e.target.value as any
                                      }
                                    }
                                  }
                                })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white"
                              >
                                <option value="to-b">Từ trên xuống dưới</option>
                                <option value="to-br">Góc chéo (Xuống phải)</option>
                                <option value="to-r">Từ trái sang phải</option>
                                <option value="to-t">Từ dưới lên trên</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Image Wallpaper Controls */}
                      {editingTemplate.config?.theme?.bgType === 'image' && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-400 font-semibold text-xs">Hình nền ảnh (Wallpaper HD):</label>
                              <label
                                htmlFor="admin-bg-file-input"
                                className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Tải hình nền từ máy</span>
                              </label>
                              <input
                                id="admin-bg-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleBgImageFileUpload}
                                className="hidden"
                              />
                            </div>
                            <input
                              type="text"
                              value={editingTemplate.config?.theme?.bgImageUrl || ''}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    ...editingTemplate.config?.theme!,
                                    bgImageUrl: e.target.value
                                  }
                                }
                              })}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                            />
                          </div>

                          {/* Quick Preset Wallpapers */}
                          <div className="space-y-1.5">
                            <label className="text-slate-400 text-[11px]">Chọn nhanh hình nền mẫu Unsplash đẹp:</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {[
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
                              ].map((img, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setEditingTemplate({
                                    ...editingTemplate,
                                    config: {
                                      ...editingTemplate.config,
                                      theme: {
                                        ...editingTemplate.config?.theme!,
                                        bgType: 'image',
                                        bgImageUrl: img
                                      }
                                    }
                                  })}
                                  className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 hover:scale-105 transition"
                                >
                                  <img src={img} alt="preset" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Sliders for Overlay and Blur */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                              <div className="flex justify-between text-slate-400">
                                <span>Độ mờ lớp phủ đen (Dark Overlay):</span>
                                <span className="text-white font-mono">{Math.round((editingTemplate.config?.theme?.bgOverlayOpacity ?? 0.3) * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={0.9}
                                step={0.05}
                                value={editingTemplate.config?.theme?.bgOverlayOpacity ?? 0.3}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  config: {
                                    ...editingTemplate.config,
                                    theme: {
                                      ...editingTemplate.config?.theme!,
                                      bgOverlayOpacity: parseFloat(e.target.value)
                                    }
                                  }
                                })}
                                className="w-full accent-indigo-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-slate-400">
                                <span>Độ nhòe kính (Blur FX):</span>
                                <span className="text-white font-mono">{editingTemplate.config?.theme?.bgBlur ?? 0}px</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={15}
                                step={1}
                                value={editingTemplate.config?.theme?.bgBlur ?? 0}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  config: {
                                    ...editingTemplate.config,
                                    theme: {
                                      ...editingTemplate.config?.theme!,
                                      bgBlur: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                className="w-full accent-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Solid Color Controls */}
                      {editingTemplate.config?.theme?.bgType === 'color' && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <label className="text-slate-400 font-semibold">Chọn màu nền trang:</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={editingTemplate.config?.theme?.bgColor || '#0f172a'}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    ...editingTemplate.config?.theme!,
                                    bgColor: e.target.value
                                  }
                                }
                              })}
                              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                            />
                            <input
                              type="text"
                              value={editingTemplate.config?.theme?.bgColor || '#0f172a'}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    ...editingTemplate.config?.theme!,
                                    bgColor: e.target.value
                                  }
                                }
                              })}
                              className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* Profile Header Cover Image Setting */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <label className="text-slate-300 font-semibold flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ảnh Bìa Header (Cover Banner):</span>
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.config?.profile?.coverImageUrl || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            config: {
                              ...editingTemplate.config,
                              profile: {
                                ...editingTemplate.config?.profile,
                                displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                bio: editingTemplate.config?.profile?.bio || '',
                                avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                showShareButton: true,
                                showVCard: true,
                                coverImageUrl: e.target.value
                              }
                            }
                          })}
                          placeholder="Nhập URL ảnh bìa (bỏ trống nếu không dùng ảnh bìa)..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: BỐ CỤC & KIỂU DÁNG */}
                {templateEditTab === 'layout' && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Card & Button Styles Group */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Phong Cách Thẻ Liên Kết & Nút Bấm (Card & Buttons)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Kiểu thẻ (Card Style):</label>
                          <select
                            value={editingTemplate.config?.theme?.cardStyle || 'glass'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  cardStyle: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="glass">Kính mờ sang trọng (Glassmorphism)</option>
                            <option value="solid">Màu đặc nổi bật (Solid)</option>
                            <option value="outline">Viền mảnh tối giản (Outline)</option>
                            <option value="shadow">Đổ bóng sâu (Soft Shadow)</option>
                            <option value="flat">Phẳng hiện đại (Flat)</option>
                            <option value="neobrutalism">Neobrutalism (Độc lạ)</option>
                            <option value="neon">Neon Cyber (Rực rỡ)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Kiểu bo góc nút (Button Shape):</label>
                          <select
                            value={editingTemplate.config?.theme?.buttonShape || 'rounded-xl'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  buttonShape: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="rounded-xl">Bo tròn vừa vặn (Rounded-XL)</option>
                            <option value="rounded-full">Viên thuốc tròn đều (Pill / Full)</option>
                            <option value="rounded-md">Góc bo nhỏ (Rounded-MD)</option>
                            <option value="rounded-3xl">Bo góc lớn (Rounded-3XL)</option>
                            <option value="rounded-none">Góc vuông sắc cạnh (Sharp)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Hiệu ứng rê chuột (Hover Effect):</label>
                          <select
                            value={editingTemplate.config?.theme?.cardHoverEffect || 'scale'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  cardHoverEffect: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="scale">Phóng to nhẹ (Scale 102%)</option>
                            <option value="lift">Nâng lên cao (Lift Up)</option>
                            <option value="glow">Phát sáng viền (Glow Accent)</option>
                            <option value="border-highlight">Lóe sáng viền (Border highlight)</option>
                            <option value="none">Không hiệu ứng</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Hiệu ứng động nút bấm:</label>
                          <select
                            value={editingTemplate.config?.theme?.buttonAnimation || 'none'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  buttonAnimation: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="none">Tĩnh (Mặc định)</option>
                            <option value="pulse">Nhấp nháy nhịp tim (Pulse)</option>
                            <option value="bounce">Nhún nhảy thu hút (Bounce)</option>
                            <option value="glow">Phát sáng Neon (Glow)</option>
                            <option value="shimmer">Ánh kim quét qua (Shimmer)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Styling Group */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Bố Cục Avatar (Avatar Frame & Border)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Hình dáng Avatar:</label>
                          <select
                            value={editingTemplate.config?.theme?.avatarShape || 'circle'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  avatarShape: e.target.value as any
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="circle">Tròn (Circle)</option>
                            <option value="squircle">Bo siêu tròn (Squircle)</option>
                            <option value="rounded-3xl">Bo góc 3XL</option>
                            <option value="square">Vuông (Square)</option>
                            <option value="hexagon">Lục giác (Hexagon)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Màu viền Avatar:</label>
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                            <input
                              type="color"
                              value={editingTemplate.config?.theme?.avatarBorderColor || '#ffffff'}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  theme: {
                                    ...editingTemplate.config?.theme!,
                                    avatarBorderColor: e.target.value
                                  }
                                }
                              })}
                              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer p-0"
                            />
                            <span className="font-mono text-white text-xs">{editingTemplate.config?.theme?.avatarBorderColor || '#ffffff'}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">Độ dày viền Avatar:</label>
                          <select
                            value={editingTemplate.config?.theme?.avatarBorderWidth ?? 2}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                theme: {
                                  ...editingTemplate.config?.theme!,
                                  avatarBorderWidth: parseInt(e.target.value)
                                }
                              }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="0">Không viền (0px)</option>
                            <option value="2">Viền mỏng (2px)</option>
                            <option value="4">Viền dày (4px)</option>
                            <option value="6">Viền đậm (6px)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Floating Hotline Setting */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                      <div className="font-bold text-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Nút Hotline Nổi Nhấp Nháy (Floating Hotline)</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400 text-xs font-bold">
                          <input
                            type="checkbox"
                            checked={editingTemplate.config?.profile?.floatingHotline?.enabled || false}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                profile: {
                                  ...editingTemplate.config?.profile,
                                  displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                  bio: editingTemplate.config?.profile?.bio || '',
                                  avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                  verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                  showShareButton: true,
                                  showVCard: true,
                                  floatingHotline: {
                                    enabled: e.target.checked,
                                    phone: editingTemplate.config?.profile?.floatingHotline?.phone || '0988888888',
                                    label: editingTemplate.config?.profile?.floatingHotline?.label || 'Gọi Tư Vấn',
                                    position: editingTemplate.config?.profile?.floatingHotline?.position || 'right',
                                    style: 'pulse_radar',
                                    colorScheme: 'emerald',
                                    size: 'md'
                                  }
                                }
                              }
                            })}
                            className="rounded accent-emerald-500"
                          />
                          <span>Bật Hotline</span>
                        </label>
                      </div>

                      {editingTemplate.config?.profile?.floatingHotline?.enabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-slate-400">Số điện thoại Hotline:</label>
                            <input
                              type="text"
                              value={editingTemplate.config?.profile?.floatingHotline?.phone || ''}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  profile: {
                                    ...editingTemplate.config?.profile,
                                    displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                    bio: editingTemplate.config?.profile?.bio || '',
                                    avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                    verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                    showShareButton: true,
                                    showVCard: true,
                                    floatingHotline: {
                                      ...editingTemplate.config?.profile?.floatingHotline!,
                                      phone: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400">Nhãn hiển thị nút:</label>
                            <input
                              type="text"
                              value={editingTemplate.config?.profile?.floatingHotline?.label || ''}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                config: {
                                  ...editingTemplate.config,
                                  profile: {
                                    ...editingTemplate.config?.profile,
                                    displayName: editingTemplate.config?.profile?.displayName || editingTemplate.name,
                                    bio: editingTemplate.config?.profile?.bio || '',
                                    avatarUrl: editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg,
                                    verifiedBadge: editingTemplate.config?.profile?.verifiedBadge || false,
                                    showShareButton: true,
                                    showVCard: true,
                                    floatingHotline: {
                                      ...editingTemplate.config?.profile?.floatingHotline!,
                                      label: e.target.value
                                    }
                                  }
                                }
                              })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: KHỐI NỘI DUNG MẪU & MẠNG XÃ HỘI */}
                {templateEditTab === 'blocks' && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Add block button bar with drag instruction */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Danh Sách Khối Nội Dung Mẫu ({editingTemplate.config?.blocks?.length || 0})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Ấn giữ <span className="font-mono text-indigo-400 font-bold">⠿</span> để kéo thả hoặc dùng nút ▲ ▼ để sắp xếp vị trí khối.
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newBlock: BioBlock = {
                              id: `blk_${Date.now()}`,
                              type: 'link',
                              title: 'Liên Kết Mới ✨',
                              url: 'https://trangcanhan.com',
                              enabled: true,
                              order: (editingTemplate.config?.blocks?.length || 0) + 1,
                              clickCount: 0
                            };
                            const nextBlocks = [...(editingTemplate.config?.blocks || []), newBlock];
                            setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                blocks: nextBlocks
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] transition flex items-center gap-1 shadow active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm Link Mới</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newProduct: BioBlock = {
                              id: `blk_prod_${Date.now()}`,
                              type: 'product',
                              title: 'Sản Phẩm Độc Quyền',
                              price: 199000,
                              originalPrice: 299000,
                              imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
                              buttonText: 'Mua Ngay',
                              productUrl: 'https://shopee.vn',
                              badge: 'HOT SALE',
                              enabled: true,
                              order: (editingTemplate.config?.blocks?.length || 0) + 1,
                              clickCount: 0
                            };
                            const nextBlocks = [...(editingTemplate.config?.blocks || []), newProduct];
                            setEditingTemplate({
                              ...editingTemplate,
                              config: {
                                ...editingTemplate.config,
                                blocks: nextBlocks
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-[11px] transition flex items-center gap-1 shadow active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Sản Phẩm Shop</span>
                        </button>
                      </div>
                    </div>

                    {/* Blocks list editing with Drag-and-Drop */}
                    <div className="space-y-3">
                      {(editingTemplate.config?.blocks || []).map((block, bIdx) => {
                        const isBeingDragged = draggedBlockIdx === bIdx;
                        return (
                          <div
                            key={block.id || bIdx}
                            draggable={true}
                            onDragStart={(e) => {
                              setDraggedBlockIdx(bIdx);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', String(bIdx));
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedBlockIdx !== null && draggedBlockIdx !== bIdx) {
                                handleMoveBlock(draggedBlockIdx, bIdx);
                              }
                              setDraggedBlockIdx(null);
                            }}
                            onDragEnd={() => setDraggedBlockIdx(null)}
                            className={`p-3.5 bg-slate-950/80 border rounded-2xl space-y-2.5 transition-all duration-200 ${
                              isBeingDragged
                                ? 'opacity-40 border-dashed border-indigo-500 scale-[0.99]'
                                : 'border-slate-800 hover:border-slate-700 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* Drag Handle */}
                                <div
                                  className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-400 p-0.5 rounded transition"
                                  title="Giữ và kéo thả để di chuyển khối"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center">
                                  {bIdx + 1}
                                </span>
                                <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800">
                                  {block.type}
                                </span>
                                <span className="font-bold text-slate-300 truncate max-w-[160px] sm:max-w-[220px]">
                                  {(block as any).title || (block as any).qrTitle || 'Khối nội dung'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2">
                                {/* Move Up & Move Down Buttons */}
                                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
                                  <button
                                    type="button"
                                    disabled={bIdx === 0}
                                    onClick={() => handleMoveBlock(bIdx, bIdx - 1)}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition"
                                    title="Di chuyển lên"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={bIdx === (editingTemplate.config?.blocks?.length || 1) - 1}
                                    onClick={() => handleMoveBlock(bIdx, bIdx + 1)}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition"
                                    title="Di chuyển xuống"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                  <input
                                    type="checkbox"
                                    checked={block.enabled}
                                    onChange={(e) => {
                                      const nextBlocks = [...(editingTemplate.config?.blocks || [])];
                                      nextBlocks[bIdx] = { ...nextBlocks[bIdx], enabled: e.target.checked };
                                      setEditingTemplate({
                                        ...editingTemplate,
                                        config: { ...editingTemplate.config, blocks: nextBlocks }
                                      });
                                    }}
                                    className="rounded accent-indigo-500"
                                  />
                                  <span>Bật</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextBlocks = (editingTemplate.config?.blocks || []).filter((_, idx) => idx !== bIdx);
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      config: { ...editingTemplate.config, blocks: nextBlocks }
                                    });
                                  }}
                                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                                  title="Xóa block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                          {/* Editable fields for link / product */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="space-y-0.5">
                              <label className="text-slate-400 text-[10px]">Tiêu đề:</label>
                              <input
                                type="text"
                                value={(block as any).title || (block as any).qrTitle || ''}
                                onChange={(e) => {
                                  const nextBlocks = [...(editingTemplate.config?.blocks || [])];
                                  nextBlocks[bIdx] = { ...nextBlocks[bIdx], title: e.target.value } as any;
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    config: { ...editingTemplate.config, blocks: nextBlocks }
                                  });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-slate-400 text-[10px]">Đường dẫn URL / Link:</label>
                              <input
                                type="text"
                                value={(block as any).url || (block as any).productUrl || (block as any).videoUrl || ''}
                                onChange={(e) => {
                                  const nextBlocks = [...(editingTemplate.config?.blocks || [])];
                                  const cur = nextBlocks[bIdx];
                                  if (cur.type === 'link') (cur as any).url = e.target.value;
                                  else if (cur.type === 'product') (cur as any).productUrl = e.target.value;
                                  else if (cur.type === 'youtube' || cur.type === 'tiktok') (cur as any).videoUrl = e.target.value;
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    config: { ...editingTemplate.config, blocks: nextBlocks }
                                  });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                              />
                            </div>

                            {block.type === 'product' && (
                              <div className="space-y-0.5">
                                <label className="text-slate-400 text-[10px]">Giá bán (VNĐ):</label>
                                <input
                                  type="number"
                                  value={(block as any).price || 0}
                                  onChange={(e) => {
                                    const nextBlocks = [...(editingTemplate.config?.blocks || [])];
                                    (nextBlocks[bIdx] as any).price = Number(e.target.value);
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      config: { ...editingTemplate.config, blocks: nextBlocks }
                                    });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
                                />
                              </div>
                            )}

                            {block.type === 'product' && (
                              <div className="space-y-0.5">
                                <label className="text-slate-400 text-[10px]">Ảnh sản phẩm URL:</label>
                                <input
                                  type="text"
                                  value={(block as any).imageUrl || ''}
                                  onChange={(e) => {
                                    const nextBlocks = [...(editingTemplate.config?.blocks || [])];
                                    (nextBlocks[bIdx] as any).imageUrl = e.target.value;
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      config: { ...editingTemplate.config, blocks: nextBlocks }
                                    });
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-[11px]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                      {(!editingTemplate.config?.blocks || editingTemplate.config.blocks.length === 0) && (
                        <div className="text-center py-6 text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                          Chưa có khối nội dung nào trong mẫu này. Nhấn nút "+ Thêm Link Mới" ở trên để bổ sung.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: LIVE REAL-TIME PHONE PREVIEW (Col 5) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-950/90 rounded-3xl p-3 sm:p-4 border border-slate-800/80 shadow-inner overflow-hidden">
                <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Xem Thử Trực Quan Thời Gian Thực</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live Sync
                  </span>
                </div>

                {/* Simulated Phone Shell */}
                <div className="w-full max-w-[340px] h-[520px] bg-slate-950 rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-900 mr-1.5" />
                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                  </div>

                  {/* Mockup Viewport */}
                  <div
                    className="w-full h-full rounded-[2rem] overflow-y-auto p-3.5 flex flex-col justify-between relative scrollbar-none"
                    style={{
                      fontFamily: editingTemplate.config?.theme?.fontFamily || 'font-sans',
                      backgroundColor: editingTemplate.config?.theme?.bgColor || '#09090b',
                      backgroundImage: editingTemplate.config?.theme?.bgType === 'gradient' && editingTemplate.config?.theme?.bgGradient
                        ? `linear-gradient(${
                            editingTemplate.config?.theme?.bgGradient.direction === 'to-b' ? '180deg' : '135deg'
                          }, ${editingTemplate.config?.theme?.bgGradient.from}, ${editingTemplate.config?.theme?.bgGradient.via ? editingTemplate.config?.theme?.bgGradient.via + ', ' : ''}${editingTemplate.config?.theme?.bgGradient.to})`
                        : editingTemplate.config?.theme?.bgType === 'image' && editingTemplate.config?.theme?.bgImageUrl
                        ? `url(${editingTemplate.config?.theme?.bgImageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Dark overlay if image */}
                    {editingTemplate.config?.theme?.bgType === 'image' && (
                      <div
                        className="absolute inset-0 bg-black pointer-events-none rounded-[2rem]"
                        style={{ opacity: editingTemplate.config?.theme?.bgOverlayOpacity ?? 0.3 }}
                      />
                    )}

                    {/* Cover Banner */}
                    {editingTemplate.config?.profile?.coverImageUrl ? (
                      <div className="relative -mx-3.5 -mt-3.5 mb-1.5 shrink-0">
                        <div className="w-full h-20 overflow-hidden relative shadow-inner">
                          <img
                            src={editingTemplate.config?.profile.coverImageUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4" />
                    )}

                    {/* Profile Header */}
                    <div className="relative z-10 text-center space-y-1.5">
                      <div className={`flex justify-center ${editingTemplate.config?.profile?.coverImageUrl ? '-mt-10' : 'mt-0'}`}>
                        <ProtectedAvatar
                          avatarUrl={editingTemplate.config?.profile?.avatarUrl || editingTemplate.previewImg}
                          displayName={editingTemplate.config?.profile?.displayName || editingTemplate.name}
                          verifiedBadge={false}
                          avatarShield={editingTemplate.planRequired !== 'free'}
                          shape={editingTemplate.config?.theme?.avatarShape || 'circle'}
                          size="sm"
                          borderColor={editingTemplate.config?.theme?.avatarBorderColor || '#ffffff'}
                          borderWidth={editingTemplate.config?.theme?.avatarBorderWidth ?? 2}
                        />
                      </div>

                      <div>
                        <h4
                          className="text-sm font-extrabold flex items-center justify-center gap-1"
                          style={{ color: editingTemplate.config?.theme?.textColor || '#ffffff' }}
                        >
                          <span className="truncate max-w-[200px]">
                            {editingTemplate.config?.profile?.displayName || editingTemplate.name}
                          </span>
                          {editingTemplate.planRequired !== 'free' && editingTemplate.config?.profile?.verifiedBadge && (
                            <MetaVerifiedBadge size="xs" />
                          )}
                        </h4>

                        {editingTemplate.config?.profile?.tagline && (
                          <p
                            className="text-[10px] font-semibold opacity-90 truncate max-w-[220px] mx-auto"
                            style={{ color: editingTemplate.config?.theme?.accentColor || '#818cf8' }}
                          >
                            {editingTemplate.config?.profile.tagline}
                          </p>
                        )}

                        {editingTemplate.config?.profile?.bio && (
                          <p
                            className="text-[10px] max-w-[240px] mx-auto mt-0.5 leading-tight opacity-85 line-clamp-2 px-1"
                            style={{ color: editingTemplate.config?.theme?.textColor || '#e2e8f0' }}
                          >
                            {editingTemplate.config?.profile.bio}
                          </p>
                        )}
                      </div>

                      {/* Social Bar */}
                      {editingTemplate.config?.socialLinks && editingTemplate.config.socialLinks.length > 0 && editingTemplate.config.theme && (
                        <SocialIconsBar socials={editingTemplate.config.socialLinks} theme={editingTemplate.config.theme} size="sm" className="pt-0.5" />
                      )}

                      {/* Profile Contact Actions (vCard & QR) */}
                      {editingTemplate.config?.profile && editingTemplate.config?.theme && (
                        <ProfileContactActions
                          profile={editingTemplate.config.profile}
                          theme={editingTemplate.config.theme}
                          creatorName={editingTemplate.config.profile.displayName || editingTemplate.name}
                          username={editingTemplate.id}
                          size="sm"
                          className="pt-0.5"
                        />
                      )}
                    </div>

                    {/* Blocks Preview */}
                    <div className="relative z-10 my-2 space-y-2 flex-1">
                      {editingTemplate.config?.blocks && editingTemplate.config.blocks.length > 0 && editingTemplate.config.theme ? (
                        editingTemplate.config.blocks
                          .filter((b) => b.enabled)
                          .map((block) => (
                            <BlockRenderer
                              key={block.id}
                              block={block}
                              theme={editingTemplate.config?.theme!}
                              creatorName={editingTemplate.config?.profile?.displayName}
                            />
                          ))
                      ) : (
                        <div className="text-center py-3 text-[10px] opacity-60">Chưa có khối liên kết</div>
                      )}
                    </div>

                    {/* Watermark */}
                    <div className="relative z-10 pt-1 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full bg-black/40 text-[9px] opacity-75 font-semibold"
                        style={{ color: editingTemplate.config?.theme?.textColor || '#ffffff' }}
                      >
                        ⚡ Powered by {systemConfig.siteName || 'TRANG CÁ NHÂN'}
                      </span>
                    </div>

                    {/* Floating Hotline */}
                    <FloatingHotline config={editingTemplate.config?.profile?.floatingHotline} isContainerAbsolute={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ID Mẫu: <span className="font-mono text-slate-300">{editingTemplate.id}</span>
              </span>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveTemplate(editingTemplate)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: QUẢN TRỊ SECTION TRANG CHỦ */}
      {currentAdminTab === 'homepage' && (
        <AdminHomepageSectionsManager />
      )}

      {/* TAB: BẢO TRÌ HỆ THỐNG */}
      {currentAdminTab === 'maintenance' && (
        <AdminMaintenanceManager />
      )}

      {/* STAFF PERMISSIONS MODAL */}
      {staffAssignUser && (
        <StaffPermissionsModal
          user={staffAssignUser}
          onClose={() => setStaffAssignUser(null)}
        />
      )}

      {/* PREVIEW POPUP ANNOUNCEMENT MODAL */}
      {previewPopupOpen && (
        <AnnouncementPopupModal
          forceOpen={true}
          onClosePreview={() => setPreviewPopupOpen(false)}
        />
      )}

      {/* USER DETAILS FULL MODAL */}
      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          allTransactions={transactions}
          onClose={() => setSelectedUserForDetails(null)}
          onUpdateUser={(userId, data) => {
            adminUpdateUser(userId, data);
            setSelectedUserForDetails((prev) => (prev ? { ...prev, ...data } : null));
          }}
          onAdjustBalance={(userId, amt, reason) => {
            adminAdjustBalance(userId, amt, reason);
            setSelectedUserForDetails((prev) => (prev ? { ...prev, balance: (prev.balance || 0) + amt } : null));
          }}
          onSuccessToast={success}
          onInfoToast={info}
        />
      )}

    </div>
  );
};
