import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../context/TabContext';
import { Megaphone, X, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

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

    // Tạo signature dựa trên tiêu đề & nội dung để khi admin cập nhật thông báo mới, người dùng sẽ thấy ngay
    const popupSig = `seen_notice_${(popup.title || '').trim().slice(0, 30)}_${(popup.content || '').trim().slice(0, 30)}`;

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const alreadySeen = window.sessionStorage.getItem(popupSig);
        if (!alreadySeen) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 600);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      // Cốc Cốc / Safari Private mode fallback
      setIsOpen(true);
    }
  }, [forceOpen, isEnabled, popup?.title, popup?.content]);

  const handleClose = () => {
    setIsOpen(false);
    if (!forceOpen && popup) {
      const popupSig = `seen_notice_${(popup.title || '').trim().slice(0, 30)}_${(popup.content || '').trim().slice(0, 30)}`;
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(popupSig, 'true');
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
      onClick={handleClose}
    >
      <div
        id="system-broadcast-card"
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-[2rem] p-6 sm:p-7 text-white shadow-2xl shadow-indigo-950/70 space-y-5 overflow-hidden"
        style={{
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          maxHeight: '90vh',
          overflowY: 'auto'
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
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700/50 cursor-pointer shadow-md"
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/30 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {popup.badge || 'THÔNG BÁO TỪ BAN QUẢN TRỊ'}
            </span>
          </div>
        </div>

        {/* Tiêu đề & Nội dung */}
        <div className="space-y-2.5">
          <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
            {popup.title}
          </h3>
          {popup.content && (
            <div className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
              {popup.content}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          {popup.buttonText && popup.buttonText.trim() && (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{popup.buttonText}</span>
              {popup.buttonLink?.startsWith('http') ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition border border-slate-700/60 cursor-pointer text-center"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
