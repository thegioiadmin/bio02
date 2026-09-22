import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../context/TabContext';
import { Megaphone, X, ArrowRight, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    _dismissedNoticeSignatures?: Set<string>;
  }
}

if (typeof window !== 'undefined') {
  window._dismissedNoticeSignatures = window._dismissedNoticeSignatures || new Set();
}

interface AnnouncementPopupModalProps {
  forceOpen?: boolean;
  onClosePreview?: () => void;
}

export const AnnouncementPopupModal: React.FC<AnnouncementPopupModalProps> = ({
  forceOpen = false,
  onClosePreview
}) => {
  const { systemConfig } = useAuth();
  const { setActiveTab } = useTab();
  const [isOpen, setIsOpen] = useState(false);

  const popup = systemConfig?.popupModal;
  const isEnabled = Boolean(
    popup &&
    (popup.enabled === true ||
      popup.enabled === ('true' as any) ||
      popup.enabled === (1 as any) ||
      popup.enabled === ('1' as any)) &&
    popup.title?.trim()
  );

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!isEnabled || !popup) {
      setIsOpen(false);
      return;
    }

    // Tạo signature duy nhất dựa trên tiêu đề & nội dung để không bị ghi đè nhầm
    const rawSig = `seen_notice_${(popup.title || '').trim().slice(0, 35)}_${(popup.content || '').trim().slice(0, 35)}`;
    const popupSig = rawSig.replace(/[^a-zA-Z0-9_]/g, '');

    // 1. Kiểm tra trong bộ nhớ RAM tạm thời của trang (chống bật lại ngay lập tức khi polling API)
    if (typeof window !== 'undefined' && window._dismissedNoticeSignatures?.has(popupSig)) {
      setIsOpen(false);
      return;
    }

    // 2. Kiểm tra trong sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage?.getItem(popupSig)) {
        setIsOpen(false);
        return;
      }
    } catch (e) {}

    // 3. Kiểm tra trong localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage?.getItem(popupSig)) {
        setIsOpen(false);
        return;
      }
    } catch (e) {}

    // Đã mở rồi thì không đặt lại timer
    if (isOpen) return;

    const timer = setTimeout(() => {
      // Kiểm tra lại lần nữa trước khi hiển thị
      if (typeof window !== 'undefined' && window._dismissedNoticeSignatures?.has(popupSig)) {
        return;
      }
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [forceOpen, isEnabled, popup?.title, popup?.content]);

  const handleClose = () => {
    setIsOpen(false);
    if (!forceOpen && popup) {
      const rawSig = `seen_notice_${(popup.title || '').trim().slice(0, 35)}_${(popup.content || '').trim().slice(0, 35)}`;
      const popupSig = rawSig.replace(/[^a-zA-Z0-9_]/g, '');

      // Lưu vào RAM cửa sổ trình duyệt (bảo đảm 100% không bao giờ tự bật lại trong cùng phiên duyệt)
      if (typeof window !== 'undefined' && window._dismissedNoticeSignatures) {
        window._dismissedNoticeSignatures.add(popupSig);
      }

      // Lưu vào sessionStorage (phiên truy cập)
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(popupSig, 'true');
        }
      } catch (e) {}

      // Lưu vào localStorage (lưu trữ lâu dài trên thiết bị)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(popupSig, String(Date.now()));
        }
      } catch (e) {}
    }
    if (onClosePreview) {
      onClosePreview();
    }
  };

  const handleActionClick = () => {
    handleClose();
    const link = popup?.buttonLink?.trim();
    if (!link) return;

    if (link === '#pricing' || link === 'pricing') {
      setActiveTab('pricing');
      const el = document.getElementById('pricing-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link === '#templates' || link === '#templates-showcase' || link === 'templates') {
      setActiveTab('templates');
      const el = document.getElementById('templates-showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link.startsWith('/')) {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', link);
        window.dispatchEvent(new Event('popstate'));
      }
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link.startsWith('#')) {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen || !popup) {
    return null;
  }

  return (
    <div
      id="system-broadcast-overlay"
      className="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={handleClose}
    >
      <div
        id="system-broadcast-card"
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-[2rem] p-6 sm:p-7 text-white shadow-2xl shadow-indigo-950/70 space-y-5 overflow-hidden"
        style={{
          position: 'relative',
          zIndex: 10000000,
          maxHeight: '88vh',
          overflowY: 'auto',
          scrollbarWidth: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow hiệu ứng nền */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-500/15 to-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer shadow-lg active:scale-95"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner ảnh minh họa (nếu có) */}
        {popup.imageUrl && popup.imageUrl.trim() && (
          <div className="relative -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 mb-4 h-40 sm:h-48 overflow-hidden rounded-t-[2rem] border-b border-indigo-500/20 bg-slate-950">
            <img
              src={popup.imageUrl.trim()}
              alt="Thông báo"
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
        )}

        {/* Header với Icon & Badge */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/30 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {popup.badge || 'THÔNG BÁO TỪ BAN QUẢN TRỊ'}
            </span>
          </div>
          {forceOpen && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 ml-auto mr-8">
              Xem thử
            </span>
          )}
        </div>

        {/* Tiêu đề thông báo */}
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {popup.title}
          </h3>
          {popup.content && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
              {popup.content}
            </p>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80 relative z-10">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer active:scale-95 border border-slate-700/60"
          >
            Đã hiểu
          </button>
          {popup.buttonText && popup.buttonText.trim() && (
            <button
              type="button"
              onClick={handleActionClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{popup.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
