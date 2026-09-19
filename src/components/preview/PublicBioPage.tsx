import React, { useState, useEffect } from 'react';
import { useBio } from '../../context/BioContext';
import { useAuth } from '../../context/AuthContext';
import { BlockRenderer } from './BlockRenderer';
import { SocialIconsBar } from './SocialIconsBar';
import { ProfileContactActions } from '../common/ProfileContactActions';
import { MetaVerifiedBadge } from '../common/MetaVerifiedBadge';
import { ProtectedAvatar } from '../common/ProtectedAvatar';
import { FloatingHotline } from '../common/FloatingHotline';
import { useToast } from '../Toast';
import { getUserBioUrl, getSystemDomain } from '../../utils/domain';
import { BioPageConfig, User } from '../../types';
import { INITIAL_BIO_CONFIG, PRESET_THEMES } from '../../utils/presets';
import { 
  Share2, 
  Copy, 
  MapPin, 
  Sparkles, 
  ArrowLeft, 
  X,
  UserX,
  Home,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface PublicBioPageProps {
  username?: string | null;
  onBackToEditor?: () => void;
}

export const PublicBioPage: React.FC<PublicBioPageProps> = ({ username, onBackToEditor }) => {
  const { bioConfig: fallbackBioConfig, recordPageView, recordBlockClick, isPreviewFullscreen } = useBio();
  const { isAuthenticated, user, systemConfig, allUsers } = useAuth();
  const { success } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(Boolean(username));
  const [notFound, setNotFound] = useState<boolean>(false);
  const [activeBio, setActiveBio] = useState<BioPageConfig | null>(null);
  const [bioOwner, setBioOwner] = useState<User | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch bio by username smoothly without intermediate flickering
  useEffect(() => {
    let isMounted = true;
    if (!username) {
      // In-editor preview or fullscreen preview
      setActiveBio(fallbackBioConfig);
      setBioOwner(user);
      setIsLoading(false);
      setNotFound(false);
      return;
    }

    const cleanUsername = username.toLowerCase().trim();
    setIsLoading(true);
    setNotFound(false);

    const resolveFinalBio = (foundUser: User, savedConfig?: BioPageConfig | null) => {
      if (!isMounted) return;
      const userPlan = foundUser.plan || 'free';
      const isPaid = userPlan === 'pro' || userPlan === 'vip';
      const isVip = userPlan === 'vip' || foundUser.role === 'admin';

      let baseTheme = PRESET_THEMES[0];
      if (isVip) {
        baseTheme = PRESET_THEMES.find(t => t.id === 'golden-vip') || PRESET_THEMES[1] || PRESET_THEMES[0];
      } else if (isPaid) {
        baseTheme = PRESET_THEMES.find(t => t.id === 'neon-future') || PRESET_THEMES[2] || PRESET_THEMES[0];
      }

      const mergedConfig: BioPageConfig = savedConfig ? {
        ...savedConfig,
        username: foundUser.username,
        profile: {
          ...savedConfig.profile,
          displayName: savedConfig.profile?.displayName || foundUser.name || foundUser.username,
          bio: savedConfig.profile?.bio || `Chào mừng bạn đến với trang cá nhân của ${foundUser.name || foundUser.username}!`,
          avatarUrl: savedConfig.profile?.avatarUrl || foundUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
          phone: savedConfig.profile?.phone || foundUser.phone || '',
          email: savedConfig.profile?.email || foundUser.email || '',
          verifiedBadge: isPaid,
          avatarShield: isVip,
        }
      } : {
        ...INITIAL_BIO_CONFIG,
        username: foundUser.username,
        theme: { ...baseTheme },
        profile: {
          ...INITIAL_BIO_CONFIG.profile,
          displayName: foundUser.name || foundUser.username,
          bio: `Chào mừng bạn đến với trang cá nhân của ${foundUser.name || foundUser.username}! Liên hệ hoặc kết nối với tôi qua các nút bên dưới.`,
          avatarUrl: foundUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
          phone: foundUser.phone || '',
          email: foundUser.email || '',
          verifiedBadge: isPaid,
          avatarShield: isVip,
          showContactChips: true,
          showVCard: true,
          showShareButton: true,
        },
        socialLinks: [
          { id: 'soc_fb', platform: 'facebook', url: 'https://facebook.com', active: true, label: 'Facebook' },
          { id: 'soc_zalo', platform: 'zalo', url: foundUser.phone ? `https://zalo.me/${foundUser.phone}` : 'https://zalo.me', active: true, label: 'Zalo' },
          { id: 'soc_phone', platform: 'phone', url: foundUser.phone ? `tel:${foundUser.phone}` : '', active: Boolean(foundUser.phone), label: 'Gọi Điện' }
        ],
        blocks: [
          {
            id: 'block_intro',
            type: 'link',
            title: '✨ Liên hệ & Nhận tư vấn trực tiếp',
            url: foundUser.phone ? `tel:${foundUser.phone}` : '#',
            subtitle: 'Phản hồi nhanh chóng qua Zalo / Hotline',
            enabled: true,
            order: 1,
            highlight: true,
            badge: 'HOT',
            animation: 'pulse',
            clickCount: 0
          },
          {
            id: 'block_zalo',
            type: 'link',
            title: '💬 Nhắn tin Zalo nhanh',
            url: foundUser.phone ? `https://zalo.me/${foundUser.phone}` : 'https://zalo.me',
            subtitle: 'Tư vấn trực tiếp 24/7',
            enabled: true,
            order: 2,
            highlight: false,
            clickCount: 0
          }
        ]
      };

      setActiveBio(mergedConfig);
      setBioOwner(foundUser);
      setNotFound(false);
      setIsLoading(false);
    };

    // Load from backend first, with local fallback smoothly
    let localSaved: BioPageConfig | null = null;
    try {
      const rawUserBio = localStorage.getItem(`biolink_page_config_${cleanUsername}`);
      if (rawUserBio) localSaved = JSON.parse(rawUserBio);
    } catch (e) {}

    const antiCacheHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    const loadBioData = (isBackgroundSync = false) => {
      const timestamp = Date.now();
      const fetchPromises = [
        fetch(`get_bio.php?u=${encodeURIComponent(cleanUsername)}&_t=${timestamp}`, { cache: 'no-store', headers: antiCacheHeaders }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/get_bio.php?u=${encodeURIComponent(cleanUsername)}&_t=${timestamp}`, { cache: 'no-store', headers: antiCacheHeaders }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/bio/${cleanUsername}?_t=${timestamp}`, { cache: 'no-store', headers: antiCacheHeaders }).then(r => r.ok ? r.json() : null).catch(() => null)
      ];

      Promise.all(fetchPromises)
        .then(([phpRes, phpRootRes, apiRes]) => {
          if (!isMounted) return;

          const resData = phpRes || phpRootRes || apiRes;
          if (resData && (resData.bio || resData.user || resData.username)) {
            const userObj: User = resData.user || {
              id: resData.id || `user_${cleanUsername}`,
              username: cleanUsername,
              name: resData.name || resData.bio?.profile?.displayName || cleanUsername,
              email: resData.email || resData.bio?.profile?.email || '',
              phone: resData.phone || resData.bio?.profile?.phone || '',
              avatarUrl: resData.avatar || resData.bio?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
              role: resData.role || 'user',
              plan: resData.plan || 'free',
              verified: resData.plan === 'pro' || resData.plan === 'vip',
              balance: resData.balance || 0,
              status: 'active',
              createdAt: new Date().toISOString()
            };
            const freshConfig = resData.bio || resData.config;
            if (freshConfig) {
              try {
                localStorage.setItem(`biolink_page_config_${cleanUsername}`, JSON.stringify(freshConfig));
              } catch (e) {}
            }
            resolveFinalBio(userObj, freshConfig || localSaved || null);
            return;
          }

          if (isBackgroundSync) return;

          // If not found from direct bio API, check in allUsers / MySQL users list
          const existingInList = allUsers.find(
            (u) => u.username && u.username.toLowerCase() === cleanUsername
          );

          if (existingInList) {
            resolveFinalBio(existingInList, localSaved);
          } else {
            // Attempt a fallback check with get_users.php before showing 404
            fetch(`get_users.php?_t=${Date.now()}`, { cache: 'no-store', headers: antiCacheHeaders })
              .then(r => r.json())
              .then(usersList => {
                if (!isMounted) return;
                if (Array.isArray(usersList)) {
                  const match = usersList.find((u: any) => u.username && u.username.toLowerCase() === cleanUsername);
                  if (match) {
                    resolveFinalBio(match, localSaved);
                    return;
                  }
                }
                setNotFound(true);
                setIsLoading(false);
              })
              .catch(() => {
                if (!isMounted) return;
                setNotFound(true);
                setIsLoading(false);
              });
          }
        })
        .catch(() => {
          if (!isMounted || isBackgroundSync) return;
          const existingInList = allUsers.find(
            (u) => u.username && u.username.toLowerCase() === cleanUsername
          );
          if (existingInList) {
            resolveFinalBio(existingInList, localSaved);
          } else {
            setNotFound(true);
            setIsLoading(false);
          }
        });
    };

    loadBioData(false);

    // Đồng bộ thời gian thực: Tự động cập nhật khi chuyển đổi giữa tab, khi người dùng mở lại điện thoại, hoặc theo chu kỳ 8s
    const onVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadBioData(true);
      }
    };

    const intervalSync = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadBioData(true);
      }
    }, 8000);

    window.addEventListener('focus', onVisibilityOrFocus);
    window.addEventListener('pageshow', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalSync);
      window.removeEventListener('focus', onVisibilityOrFocus);
      window.removeEventListener('pageshow', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [username]);

  // Record pageview locally in BioContext
  useEffect(() => {
    recordPageView();
  }, []);

  const configToRender: BioPageConfig = activeBio || fallbackBioConfig;
  const { profile, theme, socialLinks, blocks, seo, customDomain } = configToRender;

  // Update browser document.title and URL to show the username
  useEffect(() => {
    const originalTitle = document.title;
    const targetUsername = configToRender.username || username || user?.username;
    const displayName = profile?.displayName || targetUsername || 'Người dùng';
    const siteTitle = systemConfig?.siteName || 'TRANG CÁ NHÂN';

    if (seo?.title) {
      document.title = seo.title;
    } else if (targetUsername) {
      document.title = `${displayName} (@${targetUsername}) | ${siteTitle}`;
    }

    // If viewing in public standalone mode or fullscreen preview, sync URL bar if needed
    if (targetUsername && typeof window !== 'undefined' && window.history) {
      const currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (!currentPath && !window.location.search && !window.location.hash) {
        window.history.replaceState(null, '', `/${targetUsername}`);
      }
    }

    return () => {
      document.title = originalTitle;
    };
  }, [configToRender.username, profile?.displayName, seo?.title, systemConfig?.siteName]);

  // Check if current visitor is the owner of this bio page, or system admin, or previewing inside workspace
  const isOwner = Boolean(
    isPreviewFullscreen ||
    (isAuthenticated && user && (
      user.role === 'admin' ||
      (user.username && configToRender.username && user.username.toLowerCase() === configToRender.username.toLowerCase())
    ))
  );

  // Target owner plan check
  const targetUserPlan = bioOwner?.plan || (isOwner ? user?.plan : 'free');
  const isVerifiedActive = Boolean(profile?.verifiedBadge && targetUserPlan !== 'free');
  const isShieldActive = Boolean(profile?.avatarShield && targetUserPlan !== 'free');

  const currentBioUrl = getUserBioUrl(configToRender.username, customDomain, systemConfig);
  const systemDomain = getSystemDomain(systemConfig);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentBioUrl);
    success('Đã sao chép liên kết TRANG CÁ NHÂN vào bộ nhớ tạm!');
  };

  const handleGoHome = () => {
    if (onBackToEditor) {
      onBackToEditor();
    } else {
      window.location.href = '/';
    }
  };

  const handleRegisterThisUsername = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/?register=true&u=${encodeURIComponent(username || '')}`;
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-300">Đang tải TRANG CÁ NHÂN...</p>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found State: Non-existent bio
  if (notFound) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 text-white selection:bg-indigo-500 selection:text-white">
        {/* Top Header */}
        <header className="w-full max-w-lg mx-auto pt-6 flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Về Trang Chủ</span>
          </button>
          <div className="flex items-center gap-1.5 font-black text-sm uppercase tracking-wider text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{systemConfig?.siteName || 'TRANG CÁ NHÂN'}</span>
          </div>
        </header>

        {/* Center 404 Card */}
        <main className="w-full max-w-md my-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-800/60 border border-slate-700/80 flex items-center justify-center text-rose-400 shadow-xl">
              <UserX className="w-10 h-10 stroke-[1.75]" />
            </div>

            {/* Error Details */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>404 - Không Tìm Thấy Người Dùng</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trang Cá Nhân Không Tồn Tại
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                Địa chỉ <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">@{username}</strong> hiện chưa được ai đăng ký hoặc đã bị đổi tên/xóa khỏi hệ thống.
              </p>
            </div>

            {/* Opportunity Box */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-left text-xs space-y-1.5 text-indigo-200">
              <p className="font-bold flex items-center gap-1.5 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cơ hội dành cho bạn!</span>
              </p>
              <p className="text-indigo-200/80 leading-relaxed">
                Tên định danh <span className="font-semibold text-white">@{username}</span> vẫn còn trống. Bạn có thể đăng ký sở hữu ngay đường dẫn này hoàn toàn miễn phí.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleRegisterThisUsername}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Đăng Ký Tên @{username} Ngay (Miễn Phí)</span>
              </button>

              <button
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ {systemConfig?.siteName || 'TRANG CÁ NHÂN'}</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-center pb-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {systemConfig?.siteName || 'TRANG CÁ NHÂN'} • Nền tảng tạo TRANG CÁ NHÂN #1 Việt Nam</p>
        </footer>
      </div>
    );
  }

  // 3. Normal Render of Found Public Bio
  const getContainerBackgroundStyle = (): React.CSSProperties => {
    if (theme.bgType === 'color') {
      return { backgroundColor: theme.bgColor };
    }
    if (theme.bgType === 'gradient') {
      const grad = theme.bgGradient;
      const viaPart = grad.via ? `, ${grad.via}` : '';
      return {
        backgroundImage: `linear-gradient(${
          grad.direction === 'to-b' ? '180deg' : grad.direction === 'to-br' ? '135deg' : '90deg'
        }, ${grad.from}${viaPart}, ${grad.to})`,
      };
    }
    if (theme.bgType === 'image' && theme.bgImageUrl) {
      return {
        backgroundImage: `url(${theme.bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return { backgroundColor: '#09090b' };
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between pb-8 relative selection:bg-indigo-500 selection:text-white"
      style={{ ...getContainerBackgroundStyle(), fontFamily: theme.fontFamily }}
    >
      {/* Background Overlay */}
      {theme.bgType === 'image' && theme.bgOverlayOpacity > 0 && (
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{ opacity: theme.bgOverlayOpacity }}
        />
      )}

      {/* Floating Top Nav (Back to Editor & Share) */}
      <header className="fixed top-4 left-4 right-4 max-w-xl mx-auto z-40 flex items-center justify-between pointer-events-none">
        {onBackToEditor && isOwner ? (
          <button
            onClick={onBackToEditor}
            className="pointer-events-auto px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-2xl flex items-center gap-2 transition transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Quay lại Trình Chỉnh Sửa</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => setShowShareModal(true)}
          className="pointer-events-auto w-10 h-10 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 backdrop-blur-md rounded-full text-white shadow-2xl flex items-center justify-center transition transform hover:scale-105 ml-auto"
          title="Chia sẻ TRANG CÁ NHÂN"
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
        </button>
      </header>

      {/* Top Cover Banner */}
      <div className="w-full max-w-xl md:mt-4 md:px-4">
        <div className="w-full h-40 sm:h-52 md:h-48 md:rounded-3xl overflow-hidden relative shadow-lg">
          {profile.coverImageUrl ? (
            <img
              src={profile.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  theme.bgType === 'gradient'
                    ? `linear-gradient(135deg, ${theme.bgGradient.from}, ${theme.bgGradient.to})`
                    : `linear-gradient(135deg, ${theme.accentColor}40, ${theme.accentColor}90)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        </div>
      </div>

      {/* Main Bio Content Column */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 pb-8 flex flex-col items-center">

        {/* Profile Card Header */}
        <div className="text-center space-y-3.5 w-full">
          {/* Avatar */}
          <div className="relative z-20 flex justify-center -mt-16 sm:-mt-20 py-1">
            <div className="transition-transform drop-shadow-xl">
              <ProtectedAvatar
                avatarUrl={profile.avatarUrl}
                displayName={profile.displayName}
                verifiedBadge={isVerifiedActive}
                avatarShield={isShieldActive}
                shape={theme.avatarShape}
                size="xl"
                borderColor={theme.avatarBorderColor || theme.accentColor}
                borderWidth={theme.avatarBorderWidth || 3}
              />
            </div>
          </div>

          {/* Profile Details */}
          <div>
            <h1
              className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2"
              style={{ color: theme.textColor }}
            >
              <span>{profile.displayName || 'Tên hiển thị'}</span>
              {isVerifiedActive && (
                <MetaVerifiedBadge size="md" />
              )}
            </h1>

            {profile.tagline && (
              <p
                className="text-sm font-semibold mt-1 tracking-wide"
                style={{ color: theme.accentColor }}
              >
                {profile.tagline}
              </p>
            )}

            {profile.bio && (
              <p
                className="text-xs md:text-sm max-w-md mx-auto mt-2.5 leading-relaxed opacity-85 px-2"
                style={{ color: theme.textColor }}
              >
                {profile.bio}
              </p>
            )}

            {profile.location && (
              <div
                className="flex items-center justify-center gap-1.5 text-xs opacity-75 mt-2"
                style={{ color: theme.textColor }}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Social Icons Bar */}
          <SocialIconsBar socials={socialLinks} theme={theme} size="lg" className="pt-2" />

          {/* Lưu danh bạ & Mẫu icon QR đứng dưới các icon mạng xã hội */}
          <ProfileContactActions
            profile={profile}
            theme={theme}
            creatorName={profile.displayName}
            username={activeBio?.username || username || 'bio'}
            bioUrl={currentBioUrl}
            avatarUrl={profile.avatarUrl}
            size="lg"
            className="pt-2"
          />
        </div>

        {/* Blocks Section */}
        <div className="w-full my-6 space-y-3.5">
          {blocks
            .filter((b) => b.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                theme={theme}
                onBlockClick={recordBlockClick}
                creatorName={profile.displayName}
                bioUrl={currentBioUrl}
                username={activeBio?.username || username || 'bio'}
                avatarUrl={profile.avatarUrl}
              />
            ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 text-center pb-6 px-4">
        {targetUserPlan !== 'free' && seo.hideWatermark ? (
          seo.customFooterText ? (
            seo.customFooterLink ? (
              <a
                href={seo.customFooterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs opacity-75 hover:opacity-100 transition underline underline-offset-2"
                style={{ color: theme.textColor }}
              >
                {seo.customFooterText}
              </a>
            ) : (
              <p className="text-xs opacity-60" style={{ color: theme.textColor }}>
                {seo.customFooterText}
              </p>
            )
          ) : (
            <p className="text-xs opacity-50" style={{ color: theme.textColor }}>
              © {new Date().getFullYear()} {profile.displayName}
            </p>
          )
        ) : targetUserPlan !== 'free' && seo.customFooterText ? (
          seo.customFooterLink ? (
            <a
              href={seo.customFooterLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg hover:border-amber-400/40 hover:bg-slate-900/90 transition text-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-white/95">{seo.customFooterText}</span>
            </a>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg text-white"
            >
              <span className="text-white/95">{seo.customFooterText}</span>
            </div>
          )
        ) : (
          <a
            href={systemConfig?.defaultBioFooterLink || 'https://trangcanhan.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-xs font-semibold shadow-xl hover:bg-slate-900/95 hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all group select-none cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="text-slate-100 font-medium">Đăng ký miễn phí</span>
            <span className="font-black uppercase tracking-wider text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-amber-200 transition-colors">
              {systemConfig?.siteName && systemConfig.siteName.toLowerCase() !== 'linkbio' ? systemConfig.siteName : 'TRANG CÁ NHÂN'}
            </span>
          </a>
        )}
      </footer>

      {/* Floating Hotline Button if enabled */}
      <FloatingHotline config={profile.floatingHotline} isContainerAbsolute={false} />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-lg">Chia Sẻ TRANG CÁ NHÂN</h3>
            <p className="text-xs text-slate-400 mt-1">Gửi cho bạn bè hoặc quét mã QR</p>

            <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  currentBioUrl
                )}`}
                alt="QR Code"
                className="w-48 h-48 rounded"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Sao Chép Đường Dẫn TRANG CÁ NHÂN
              </button>
              <p className="text-[11px] font-mono text-slate-400 truncate">{currentBioUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
