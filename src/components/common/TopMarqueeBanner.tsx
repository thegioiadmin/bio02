import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Sparkles, Zap } from 'lucide-react';

export const TopMarqueeBanner: React.FC = () => {
  const { systemConfig, isAuthenticated } = useAuth();

  // CHỈ hiển thị ở ngoài trang chủ chính của website
  // Tuyệt đối không hiện trong cài đặt, bảng điều khiển quản trị viên/thành viên và trong các trang Bio
  if (isAuthenticated) {
    return null;
  }

  if (typeof window !== 'undefined') {
    const pathname = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();

    // Nếu URL có chứa bất kỳ tham số truy vấn nào liên quan tới bio, người dùng, cài đặt
    if (
      search.includes('u=') || 
      search.includes('bio=') || 
      search.includes('user=') || 
      search.includes('username=') || 
      search.includes('page=') ||
      search.includes('tab=') ||
      search.includes('action=') ||
      search.includes('setting')
    ) {
      return null;
    }

    // Nếu URL có chứa hash liên quan tới bio, cài đặt, admin
    if (
      hash.includes('bio') || 
      hash.includes('admin') || 
      hash.includes('setting') || 
      hash.includes('dashboard') ||
      hash.includes('user')
    ) {
      return null;
    }

    // Chỉ cho phép hiển thị nếu pathname đúng là trang chủ gốc
    const isMainHome = 
      pathname === '' || 
      pathname === '/' || 
      pathname === '/index.html' || 
      pathname === '/index.php' ||
      pathname === '/home';

    if (!isMainHome) {
      return null;
    }
  }

  const rawActive = (systemConfig as any)?.announcementActive;
  const isAnnouncementActive = 
    rawActive === true || 
    rawActive === 'true' || 
    rawActive === 1 || 
    rawActive === '1';

  if (!systemConfig || !isAnnouncementActive || !systemConfig.announcementText?.trim()) {
    return null;
  }

  const text = systemConfig.announcementText.trim();

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-500/30 text-white overflow-hidden shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center gap-3">
        {/* Left Badge Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black tracking-wide shadow-sm">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span className="uppercase whitespace-nowrap">THÔNG BÁO</span>
        </div>

        {/* Marquee Content Container */}
        <div className="relative flex-1 overflow-hidden whitespace-nowrap py-0.5">
          <div className="animate-marquee-smooth inline-flex items-center gap-8 text-xs font-semibold text-indigo-100">
            <span className="flex items-center gap-2">
              <span>{text}</span>
            </span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">
              <span>{text}</span>
            </span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">
              <span>{text}</span>
            </span>
            <span className="text-amber-400 font-black">•</span>
            <span className="flex items-center gap-2">
              <span>{text}</span>
            </span>
            <span className="text-amber-400 font-black">•</span>
          </div>
        </div>
      </div>
    </div>
  );
};
