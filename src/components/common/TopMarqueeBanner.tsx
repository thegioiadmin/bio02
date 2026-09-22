import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Megaphone } from 'lucide-react';

export const TopMarqueeBanner: React.FC = () => {
  const { systemConfig } = useAuth();

  // Kiểm tra đường dẫn: Không hiện khi người xem đang ở trong trang Bio cá nhân độc lập
  if (typeof window !== 'undefined') {
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const pathname = (window.location.pathname || '').toLowerCase();

    // Nếu đang xem trang Bio cá nhân của một người dùng cụ thể
    if (
      search.includes('u=') || 
      search.includes('bio=') || 
      search.includes('username=') ||
      hash.includes('#bio/') ||
      hash.includes('#editor')
    ) {
      return null;
    }

    // Nếu pathname là trang cá nhân trực tiếp (ví dụ /namcreator) mà không phải trang hệ thống
    const isSystemPath = 
      pathname === '' || 
      pathname === '/' || 
      pathname === '/index.html' || 
      pathname === '/index.php' ||
      pathname === '/home' ||
      pathname.startsWith('/blog') ||
      pathname.startsWith('/huong-dan') ||
      pathname.startsWith('/dieu-khoan') ||
      pathname.startsWith('/chinh-sach') ||
      pathname.startsWith('/gioi-thieu') ||
      pathname.startsWith('/lien-he') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/templates');

    if (!isSystemPath && pathname.split('/').filter(Boolean).length === 1) {
      // Có thể là slug trang bio cá nhân độc lập
      const singleSlug = pathname.split('/').filter(Boolean)[0];
      const reservedSlugs = ['home', 'login', 'register', 'pricing', 'templates', 'blog', 'terms', 'privacy', 'guide', 'contact', 'about'];
      if (!reservedSlugs.includes(singleSlug)) {
        return null;
      }
    }
  }

  const rawActive = (systemConfig as any)?.announcementActive;
  const isAnnouncementActive = Boolean(
    rawActive === true || 
    rawActive === 'true' || 
    rawActive === 1 || 
    rawActive === '1'
  );

  const text = (systemConfig?.announcementText || '').trim();

  if (!systemConfig || !isAnnouncementActive || !text) {
    return null;
  }

  return (
    <aside
      id="sys-top-notice-bar"
      aria-label="Thông báo đầu trang"
      className="relative z-40 w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-500/30 text-white overflow-hidden shadow-sm select-none"
      style={{
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-3">
        {/* Left Badge Indicator - Icon chiếc loa */}
        <div
          className="shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm"
          title="Thông báo hệ thống"
        >
          <Megaphone className="w-3.5 h-3.5" />
        </div>

        {/* Marquee Content Container */}
        <div className="relative flex-1 overflow-hidden whitespace-nowrap py-0.5 mask-gradient">
          <div
            className="animate-marquee-smooth inline-flex items-center gap-8 text-xs font-semibold text-indigo-100"
            style={{
              willChange: 'transform',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
          >
            <span className="flex items-center gap-2">{text}</span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">{text}</span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">{text}</span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">{text}</span>
            <span className="text-amber-400 font-black">•</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
