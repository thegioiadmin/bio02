/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BioProvider, useBio } from './context/BioContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EditorTabs } from './components/editor/EditorTabs';
import { PhonePreview } from './components/preview/PhonePreview';
import { PublicBioPage } from './components/preview/PublicBioPage';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PricingView } from './components/pricing/PricingView';
import { TemplatesView } from './components/templates/TemplatesView';
import { DomainEditor } from './components/editor/DomainEditor';
import { WalletView } from './components/wallet/WalletView';
import { LandingView } from './components/landing/LandingView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { DepositModal } from './components/wallet/DepositModal';
import { ArticleDetailView } from './components/article/ArticleDetailView';
import { BlogDirectoryView } from './components/blog/BlogDirectoryView';
import { GuideDirectoryView } from './components/blog/GuideDirectoryView';
import { AnnouncementPopupModal } from './components/common/AnnouncementPopupModal';
import { TopMarqueeBanner } from './components/common/TopMarqueeBanner';
import { StaffPortalView } from './components/staff/StaffPortalView';
import { MaintenanceNoticeCard } from './components/common/MaintenanceNoticeCard';
import { AuthPageView } from './components/auth/AuthPageView';
import { StandalonePricingPage } from './components/pricing/StandalonePricingPage';
import { MembersManagementView } from './components/members/MembersManagementView';
import { SYSTEM_RESERVED_ROUTES, KNOWN_ARTICLE_SLUGS } from './utils/domain';

function getRequestedAuthMode(): 'login' | 'register' | null {
  if (typeof window === 'undefined') return null;

  // 1. Check search params: ?auth=login, ?auth=register, ?mode=login, ?mode=register, ?login=1, ?register=1
  try {
    const params = new URLSearchParams(window.location.search);
    const authParam = (params.get('auth') || params.get('mode') || params.get('action') || '').toLowerCase().trim();
    if (authParam === 'login' || authParam === 'signin' || authParam === 'dang-nhap') {
      return 'login';
    }
    if (authParam === 'register' || authParam === 'signup' || authParam === 'dang-ky') {
      return 'register';
    }
    if (params.has('login') || params.has('signin')) return 'login';
    if (params.has('register') || params.has('signup') || params.has('dang-ky')) return 'register';
  } catch (e) {
    // ignore
  }

  // 2. Check hash route: #/login, #/register, #login, #register, #signup, #dang-ky, #dang-nhap
  const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
  if (hash === 'login' || hash === 'signin' || hash === 'dang-nhap') return 'login';
  if (hash === 'register' || hash === 'signup' || hash === 'dang-ky') return 'register';

  // 3. Check pathname: /login, /register, /dang-ky, /dang-nhap, /signup, /signin, /admin
  const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  const firstSegment = path.split('/')[0];
  if (firstSegment === 'login' || firstSegment === 'signin' || firstSegment === 'dang-nhap' || firstSegment === 'admin' || firstSegment === 'quan-tri') return 'login';
  if (firstSegment === 'register' || firstSegment === 'signup' || firstSegment === 'dang-ky') return 'register';

  return null;
}

function getRequestedPricing(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const p = (params.get('p') || params.get('page') || params.get('view') || '').toLowerCase().trim();
    if (p === 'pricing' || p === 'bang-gia') return true;
    if (params.has('pricing') || params.has('bang-gia')) return true;
  } catch (e) {
    // ignore
  }

  const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase().trim();
  if (hash === 'pricing' || hash === 'bang-gia') return true;

  const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  const firstSegment = path.split('/')[0];
  if (firstSegment === 'pricing' || firstSegment === 'bang-gia') return true;

  return false;
}

function getRequestedArticleSlug(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check search params ?p=slug or ?article=slug or ?page=slug
  try {
    const params = new URLSearchParams(window.location.search);
    const pSlug = params.get('p') || params.get('article') || params.get('page');
    if (pSlug) {
      return pSlug.toLowerCase().trim();
    }
  } catch (e) {
    // ignore
  }

  // 2. Check hash route: #/slug or #slug or #/blog/slug or #/huong-dan/slug
  const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
  if (hash) {
    const parts = hash.split('?')[0].split('/').filter(Boolean);
    if (parts.length > 0) {
      const firstSegment = parts[0].toLowerCase().trim();
      if (firstSegment === 'blog') {
        return parts.length > 1 ? parts[1].toLowerCase().trim() : 'blog';
      }
      if (firstSegment === 'huong-dan' || firstSegment === 'guides' || firstSegment === 'guide') {
        return parts.length > 1 ? parts[1].toLowerCase().trim() : 'huong-dan';
      }
      if (KNOWN_ARTICLE_SLUGS.includes(firstSegment) || firstSegment.startsWith('art_')) {
        return firstSegment;
      }
    }
  }

  // 3. Check pathname: /slug or /blog/slug or /huong-dan/slug
  const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').trim();
  if (path && !path.includes('.')) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const firstSegment = parts[0].toLowerCase().trim();
      if (firstSegment === 'blog') {
        return parts.length > 1 ? parts[1].toLowerCase().trim() : 'blog';
      }
      if (firstSegment === 'huong-dan' || firstSegment === 'guides' || firstSegment === 'guide') {
        return parts.length > 1 ? parts[1].toLowerCase().trim() : 'huong-dan';
      }
      if (KNOWN_ARTICLE_SLUGS.includes(firstSegment) || firstSegment.startsWith('art_')) {
        return firstSegment;
      }
    }
  }

  return null;
}

function getRequestedBioSlug(): string | null {
  if (typeof window === 'undefined') return null;

  // If this is an article slug, do NOT treat it as a bio username
  if (getRequestedArticleSlug()) return null;

  // 1. Check search params ?u=username or ?user=username or ?bio=username
  try {
    const params = new URLSearchParams(window.location.search);
    const qBio = params.get('u') || params.get('user') || params.get('bio');
    if (qBio) {
      const clean = qBio.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      if (!SYSTEM_RESERVED_ROUTES.includes(clean)) return clean;
    }
  } catch (e) {
    // ignore
  }

  // 2. Check hash route: #/username or #username
  const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
  if (hash && !hash.startsWith('!')) {
    const cleanHash = hash.split('?')[0].split('/')[0].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (cleanHash && !SYSTEM_RESERVED_ROUTES.includes(cleanHash)) {
      return cleanHash;
    }
  }

  // 3. Check pathname: /username
  const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').trim();
  if (path && !path.includes('.')) {
    const cleanPath = path.split('/')[0].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (cleanPath && !SYSTEM_RESERVED_ROUTES.includes(cleanPath)) {
      return cleanPath;
    }
  }

  return null;
}

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isPreviewFullscreen, setIsPreviewFullscreen } = useBio();
  const { 
    user,
    isAuthenticated, 
    isAdmin,
    isStaff,
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    suggestedDepositAmount, 
    systemConfig,
    isModuleUnderMaintenance
  } = useAuth();
  const [requestedBio, setRequestedBio] = useState<string | null>(getRequestedBioSlug());
  const [requestedArticle, setRequestedArticle] = useState<string | null>(getRequestedArticleSlug());
  const [requestedAuth, setRequestedAuth] = useState<'login' | 'register' | null>(getRequestedAuthMode());
  const [requestedPricing, setRequestedPricing] = useState<boolean>(getRequestedPricing());

  // Listen to browser navigation changes (hashchange, popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      setRequestedArticle(getRequestedArticleSlug());
      setRequestedBio(getRequestedBioSlug());
      setRequestedAuth(getRequestedAuthMode());
      setRequestedPricing(getRequestedPricing());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Global Maintenance Guard for public unauthenticated visitors / normal users
  if (systemConfig?.maintenanceConfig?.globalMaintenance && !isAdmin && !isStaff && user?.role !== 'admin' && !user?.isStaff) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="w-full max-w-xl">
          <MaintenanceNoticeCard isGlobal={true} />
        </div>
      </div>
    );
  }

  // Standalone Pricing Page View (e.g. /pricing, /bang-gia, #/pricing)
  if (requestedPricing && !isAuthenticated) {
    return (
      <StandalonePricingPage
        onOpenArticle={(slug) => {
          setRequestedArticle(slug);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${slug}`);
          }
        }}
        onOpenAuthPage={(mode) => {
          setRequestedAuth(mode);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${mode}`);
          }
        }}
      />
    );
  }

  // Full Page Standalone Login / Register View (e.g. /login, /register, #/login, #/register)
  if (requestedAuth && !isAuthenticated) {
    return (
      <AuthPageView
        initialMode={requestedAuth}
        onBackToHome={() => {
          setRequestedAuth(null);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/');
          }
        }}
        onNavigateMode={(newMode) => {
          setRequestedAuth(newMode);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${newMode}`);
          }
        }}
      />
    );
  }

  // Dedicated Blog Directory View (e.g. /blog, /#blog, #/blog)
  if (requestedArticle === 'blog') {
    return (
      <BlogDirectoryView
        onBackToHome={() => {
          setRequestedArticle(null);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/');
          }
        }}
        onSelectArticle={(newSlug) => {
          setRequestedArticle(newSlug);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${newSlug}`);
          }
        }}
      />
    );
  }

  // Dedicated Guide Directory View (e.g. /huong-dan, /#huong-dan, #/huong-dan, /guides)
  if (requestedArticle === 'huong-dan' || requestedArticle === 'guides' || requestedArticle === 'guide') {
    return (
      <GuideDirectoryView
        onBackToHome={() => {
          setRequestedArticle(null);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/');
          }
        }}
        onSelectArticle={(newSlug) => {
          setRequestedArticle(newSlug);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${newSlug}`);
          }
        }}
      />
    );
  }

  // Article Page View (e.g. /gioi-thieu, /dieu-khoan, /chinh-sach, /huong-dan, /lien-he, blog articles)
  if (requestedArticle) {
    return (
      <ArticleDetailView
        slug={requestedArticle}
        onBackToHome={() => {
          setRequestedArticle(null);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', '/');
          }
        }}
        onNavigateArticle={(newSlug) => {
          setRequestedArticle(newSlug);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', `/${newSlug}`);
          }
        }}
      />
    );
  }

  // Public Bio View requested via URL (e.g. /{username}, /#/{username}, or ?u={username})
  if (requestedBio) {
    return (
      <PublicBioPage
        username={requestedBio}
        onBackToEditor={() => {
          setRequestedBio(null);
          setIsPreviewFullscreen(false);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', isAuthenticated ? '/editor' : '/');
          }
        }}
      />
    );
  }

  // Fullscreen Public Mode inside workspace
  if (isPreviewFullscreen) {
    const activeUsername = user?.username || requestedBio;
    return (
      <PublicBioPage
        username={activeUsername}
        onBackToEditor={() => {
          setIsPreviewFullscreen(false);
          setRequestedBio(null);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(null, '', isAuthenticated ? '/editor' : '/');
          }
        }}
      />
    );
  }

  // If user is not logged in: Show public landing page with top Navbar
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafaff] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
        <TopMarqueeBanner />
        <Navbar 
          onOpenAuthPage={(mode) => {
            setRequestedAuth(mode);
            if (typeof window !== 'undefined' && window.history) {
              window.history.pushState(null, '', `/${mode}`);
            }
          }}
        />
        <main className="flex-1 w-full">
          <LandingView 
            onOpenAuthPage={(mode) => {
              setRequestedAuth(mode);
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState(null, '', `/${mode}`);
              }
            }}
            onOpenArticle={(slug) => {
              setRequestedArticle(slug);
              if (typeof window !== 'undefined' && window.history) {
                window.history.pushState(null, '', `/${slug}`);
              }
            }}
          />
        </main>
      </div>
    );
  }

  // Authenticated Creator Workspace: Vertical Left Sidebar Layout
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Vertical Left Sidebar Menu */}
        <Sidebar />

        {/* Main Workspace Content Canvas */}
        <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full pb-8">
          {/* TAB 1: BIO EDITOR WITH FIXED/STICKY LIVE PREVIEW */}
          {activeTab === 'editor' && (
            isModuleUnderMaintenance('bio_editor') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="bio_editor" onRetry={() => setActiveTab('wallet')} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start relative">
                {/* Left Editor Controls */}
                <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur">
                  <EditorTabs />
                </div>

                {/* Right Live Device Mockup - FIXED/STICKY so it floats along with the screen and is always centered */}
                <div className="lg:col-span-5 hidden lg:block sticky top-2 xl:top-4 h-[calc(100vh-2.5rem)] self-start z-10">
                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur h-full flex flex-col justify-center">
                    <PhonePreview />
                  </div>
                </div>

                {/* Mobile Preview toggle drawer at bottom if on small screen */}
                <div className="lg:hidden mt-6 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 text-center text-xs font-bold text-slate-300">
                    📱 Xem Trước Giao Diện Thực Tế
                  </div>
                  <PhonePreview />
                </div>
              </div>
            )
          )}

          {/* TAB 2: WALLET & DEPOSIT */}
          {activeTab === 'wallet' && (
            isModuleUnderMaintenance('wallet_deposit') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="wallet_deposit" onRetry={() => setActiveTab('editor')} />
              </div>
            ) : (
              <WalletView />
            )
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            isModuleUnderMaintenance('analytics') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="analytics" onRetry={() => setActiveTab('editor')} />
              </div>
            ) : (
              <AnalyticsView />
            )
          )}

          {/* TAB 4: PRICING & VIP */}
          {activeTab === 'pricing' && (
            isModuleUnderMaintenance('plan_upgrade') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="plan_upgrade" onRetry={() => setActiveTab('editor')} />
              </div>
            ) : (
              <PricingView />
            )
          )}

          {/* TAB 5: TEMPLATES GALLERY */}
          {activeTab === 'templates' && (
            isModuleUnderMaintenance('templates') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="templates" onRetry={() => setActiveTab('editor')} />
              </div>
            ) : (
              <TemplatesView />
            )
          )}

          {/* TAB 6: CUSTOM DOMAIN & SLUG */}
          {activeTab === 'domains' && (
            isModuleUnderMaintenance('custom_domain') && !isAdmin && !isStaff ? (
              <div className="max-w-3xl mx-auto py-6">
                <MaintenanceNoticeCard moduleKey="custom_domain" onRetry={() => setActiveTab('editor')} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <DomainEditor />
              </div>
            )
          )}

          {/* TAB 7: STAFF INTERNAL PORTAL */}
          {activeTab === 'staff' && (
            (isAdmin || isStaff || user?.role === 'staff' || user?.isStaff) ? (
              <StaffPortalView />
            ) : (
              <div className="max-w-xl mx-auto py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  🔒
                </div>
                <h3 className="text-lg font-bold text-white">Truy Cập Bị Giới Hạn</h3>
                <p className="text-xs text-slate-400">
                  Khu vực này chỉ dành cho nhân viên nội bộ và Quản trị viên được phân quyền trong hệ thống.
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Quay về Trình Chỉnh Sửa
                </button>
              </div>
            )
          )}

          {/* TAB 8: MEMBERS MANAGEMENT (Admin & Staff only) */}
          {activeTab === 'members' && (
            (isAdmin || isStaff || user?.role === 'staff' || user?.isStaff) ? (
              <MembersManagementView />
            ) : (
              <div className="max-w-xl mx-auto py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  👥
                </div>
                <h3 className="text-lg font-bold text-white">Truy Cập Bị Giới Hạn</h3>
                <p className="text-xs text-slate-400">
                  Mục Quản lý Thành viên chỉ dành cho Nhân viên và Quản trị viên hệ thống.
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Quay về Trình Chỉnh Sửa
                </button>
              </div>
            )
          )}

          {/* TAB 9: ADMIN DASHBOARD */}
          {activeTab === 'admin' && (
            isAdmin ? (
              <AdminDashboardView />
            ) : (
              <div className="max-w-xl mx-auto py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  🛡️
                </div>
                <h3 className="text-lg font-bold text-white">Yêu Cầu Quyền Quản Trị Viên</h3>
                <p className="text-xs text-slate-400">
                  Bạn cần đăng nhập với tài khoản Admin để truy cập trang quản trị hệ thống.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      {/* Global Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        initialAmount={suggestedDepositAmount}
      />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BioProvider>
          <MainContent />
          <AnnouncementPopupModal />
        </BioProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
