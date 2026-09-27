-- ==============================================================================
-- CƠ SỞ DỮ LIỆU MYSQL CHO HỆ THỐNG TRANG CÁ NHÂN (BIOLINK)
-- Tương thích 100% với Web Hosting Hostinger (hPanel) / cPanel / DirectAdmin (PHP 7.4 - 8.3)
-- Đồng bộ tự động toàn bộ 6 thành viên quản trị & mẫu Bio trực quan
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG USERS: Quản lý người dùng, tài khoản quản trị & nhân viên
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL DEFAULT '123456',
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `name` VARCHAR(255) NULL,
  `avatar_url` TEXT NULL,
  `avatarUrl` TEXT NULL,
  `dob` VARCHAR(50) NULL,
  `id_number` VARCHAR(50) NULL,
  `idNumber` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `role` VARCHAR(50) DEFAULT 'user',
  `is_staff` TINYINT(1) DEFAULT 0,
  `isStaff` TINYINT(1) DEFAULT 0,
  `staff_position` VARCHAR(50) NULL,
  `staffPosition` VARCHAR(50) NULL,
  `staff_role_badge` VARCHAR(50) NULL,
  `staffRoleBadge` VARCHAR(50) NULL,
  `staff_permissions` TEXT NULL,
  `staffPermissions` TEXT NULL,
  `staff_department` VARCHAR(100) NULL,
  `staffDepartment` VARCHAR(100) NULL,
  `staff_title` VARCHAR(100) NULL,
  `staffTitle` VARCHAR(100) NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `plan` VARCHAR(50) DEFAULT 'free',
  `plan_expires_at` VARCHAR(50) NULL,
  `planExpiresAt` VARCHAR(50) NULL,
  `verified` TINYINT(1) DEFAULT 0,
  `verification_status` VARCHAR(50) DEFAULT 'unverified',
  `verificationStatus` VARCHAR(50) DEFAULT 'unverified',
  `verification_request_id` VARCHAR(100) NULL,
  `verification_rejection_reason` TEXT NULL,
  `balance` BIGINT DEFAULT 0,
  `account_type` VARCHAR(50) DEFAULT 'personal',
  `accountType` VARCHAR(50) DEFAULT 'personal',
  `business_name` VARCHAR(255) NULL,
  `tax_code` VARCHAR(50) NULL,
  `industry` VARCHAR(100) NULL,
  `custom_domain` VARCHAR(255) NULL,
  `customDomain` VARCHAR(255) NULL,
  `bio_count` INT DEFAULT 1,
  `bioCount` INT DEFAULT 1,
  `total_views` INT DEFAULT 0,
  `totalViews` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG BIOS: Cấu hình giao diện Bio link của từng tài khoản
CREATE TABLE IF NOT EXISTS `bios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `config` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bio_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG SYSTEM_CONFIG: Cấu hình chung của toàn bộ hệ thống
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `config` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG TEMPLATES: Kho mẫu giao diện Bio tùy biến
CREATE TABLE IF NOT EXISTS `templates` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `data` LONGTEXT NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG TRANSACTIONS: Lịch sử nạp tiền và thanh toán VietQR / SePay
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `amount` BIGINT NOT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'completed',
  `payment_method` VARCHAR(50) DEFAULT 'balance',
  `reference_code` VARCHAR(100) NULL,
  `receipt_note` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO: ĐỒNG BỘ TOÀN BỘ 6 TÀI KHOẢN THÀNH VIÊN VÀ TRANG BIO
-- ==============================================================================

INSERT INTO `users` (
  `id`, `username`, `password`, `email`, `phone`, `name`, `avatar_url`, `role`,
  `is_staff`, `staff_position`, `staff_role_badge`, `staff_permissions`, `staff_department`,
  `staff_title`, `status`, `plan`, `verified`, `balance`, `bio_count`, `total_views`, `created_at`
) VALUES
(
  'usr_admin_01', 'thegioiadmin', 'admin123', 'thegioiadmin@gmail.com', '0988 889 999', 'Nguyễn Thành Nam', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'admin',
  1, 'admin', 'ADMIN', '["support", "finance", "moderation", "users", "analytics"]', 'Ban Quản Trị Tối Cao', 'Quản Trị Viên Trưởng',
  'active', 'vip', 1, 5022000, 3, 18450, NOW()
),
(
  'usr_staff_01', 'nhanvien', '123456', 'nhanvien@trangcanhan.com', '0977112233', 'Trần Thị Thu Hà', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop', 'support',
  1, 'support', 'CSKH', '["support", "users"]', 'Phòng Chăm Sóc Khách Hàng', 'Chuyên Viên Hỗ Trợ Khách Hàng 24/7',
  'active', 'vip', 1, 1000000, 1, 2340, NOW()
),
(
  'usr_linhchi', 'linhchi', '123456', 'linhchi.beauty@gmail.com', '', 'Linh Chi Beauty & Cosmetic', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop', 'user',
  0, '', '', '[]', '', '',
  'active', 'pro', 1, 250000, 1, 8920, NOW()
),
(
  'usr_creator_03', 'hoangnam', '123456', 'hoangnam.photo@gmail.com', '', 'Hoàng Nam Photography', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', 'user',
  0, '', '', '[]', '', '',
  'active', 'free', 0, 0, 1, 1450, NOW()
),
(
  'usr_1787995706_93e7', 'nguyenvanadaa', '123456', 'nguyenvanadaa@gmail.com', '0987898767', 'nguyenvanadaa', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'user',
  0, '', '', '[]', '', '',
  'active', 'free', 0, 950000, 1, 320, NOW()
),
(
  'usr_lybichngoc', 'lybichngoc', '123456', 'thangngockmhp@gmail.com', '0988889999', 'Lý Bích Ngọc', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 'admin',
  1, 'admin', 'ADMIN', '["support", "finance", "moderation", "users", "analytics"]', 'Ban Quản Trị Tối Cao', 'Quản Trị Viên Trưởng',
  'active', 'vip', 1, 5297000, 3, 18450, NOW()
)
ON DUPLICATE KEY UPDATE
  `role` = VALUES(`role`),
  `plan` = VALUES(`plan`),
  `verified` = VALUES(`verified`),
  `balance` = VALUES(`balance`),
  `name` = VALUES(`name`);

INSERT INTO `bios` (`username`, `config`, `created_at`, `updated_at`)
VALUES
('thegioiadmin', '{"username": "thegioiadmin", "profile": {"displayName": "Nguyễn Thành Nam", "bio": "Content Creator • Sáng tạo nội dung số tại Việt Nam. Chào mừng bạn đến với góc riêng của mình!", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", "coverImageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", "verifiedBadge": false, "avatarShield": false, "location": "TP. Hồ Chí Minh, Việt Nam", "tagline": "Kết nối đam mê - Chia sẻ giá trị", "jobTitle": "", "workplace": "CÔNG TY TNHH THẾ GIỚI ADMIN", "address": "Toà Nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh", "phone": "0988 889 999", "email": "thegioislide@gmail.com", "website": "https://trangcanhan.com", "showContactChips": true, "showShareButton": true, "showVCard": true, "showViewsCount": true, "floatingHotline": {"enabled": true, "phone": "0988 889 999", "label": "Hotline tư vấn", "position": "right"}}, "theme": {"id": "cyber-dark", "name": "Cyberpunk Neon", "bgType": "gradient", "bgColor": "#09090b", "bgGradient": {"from": "#09090b", "via": "#180e29", "to": "#0f172a", "direction": "to-b"}, "bgImageUrl": "", "bgOverlayOpacity": 0.2, "bgBlur": 0, "fontFamily": "Plus Jakarta Sans", "fontSize": "medium", "textColor": "#f8fafc", "accentColor": "#8b5cf6", "cardStyle": "glass", "cardBgColor": "rgba(30, 27, 75, 0.55)", "cardTextColor": "#ffffff", "cardBorderColor": "rgba(139, 92, 246, 0.4)", "cardHoverEffect": "glow", "buttonShape": "rounded-xl", "buttonAnimation": "pulse", "avatarShape": "circle", "avatarBorderColor": "#8b5cf6", "avatarBorderWidth": 3}, "socialLinks": [{"id": "1", "platform": "facebook", "url": "https://facebook.com/namcreator", "active": true, "label": "Facebook Cá Nhân"}, {"id": "2", "platform": "tiktok", "url": "https://tiktok.com/@namcreator", "active": true, "label": "TikTok 500k Followers"}, {"id": "3", "platform": "youtube", "url": "https://youtube.com/@namcreator", "active": true, "label": "Kênh YouTube Review"}, {"id": "4", "platform": "instagram", "url": "https://instagram.com/nam.visual", "active": true, "label": "Instagram Ảnh Đẹp"}, {"id": "5", "platform": "zalo", "url": "https://zalo.me/0988889999", "active": true, "label": "Zalo Công Việc"}, {"id": "6", "platform": "telegram", "url": "https://t.me/thegioiadmin", "active": true, "label": "Telegram Group"}], "blocks": [{"id": "block-contact", "type": "contact_card", "enabled": true, "order": 1, "jobTitle": "Content Creator & Admin", "workplace": "CÔNG TY TNHH THẾ GIỚI ADMIN", "phone": "0988 889 999", "email": "thegioislide@gmail.com", "address": "Toà Nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh", "website": "https://trangcanhan.com", "telegram": "thegioiadmin", "zalo": "0988889999", "vCardEnabled": true}], "seo": {"title": "Nguyễn Thành Nam - TRANG CÁ NHÂN Chính Thức", "description": "Trang thông tin tổng hợp liên kết, mạng xã hội, sản phẩm và khóa học chính thức của Nguyễn Thành Nam.", "ogImage": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", "hideWatermark": true}, "customDomain": {"domain": "", "verified": false, "cnameTarget": "cname.trangcanhan.com", "sslActive": false, "dnsRecords": []}, "updatedAt": "2026-09-07T17:38:16.574Z"}', NOW(), NOW()),
('linhchi', '{"username": "linhchi", "profile": {"displayName": "Linh Chi Beauty & Cosmetic", "bio": "Chuyên cung cấp mỹ phẩm xách tay chính hãng 100% • Skincare routine chuẩn y khoa • Tư vấn da miễn phí.", "avatarUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop", "coverImageUrl": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop", "verifiedBadge": true, "avatarShield": false, "location": "Hà Nội, Việt Nam", "tagline": "Vẻ đẹp tự nhiên của bạn là sứ mệnh của chúng tôi", "phone": "0912 345 678", "email": "linhchi.beauty@gmail.com", "showContactChips": true, "showShareButton": true, "showVCard": true}, "theme": {"id": "rose-gold", "name": "Rose Gold Luxury", "bgType": "gradient", "bgColor": "#1c1017", "bgGradient": {"from": "#1c1017", "via": "#2d1522", "to": "#120b10", "direction": "to-b"}, "fontFamily": "Outfit", "fontSize": "medium", "textColor": "#fdf2f8", "accentColor": "#f43f5e", "cardStyle": "glass", "cardBgColor": "rgba(50, 20, 35, 0.6)", "cardTextColor": "#ffffff", "cardBorderColor": "rgba(244, 63, 94, 0.3)", "buttonShape": "rounded-2xl", "avatarShape": "circle", "avatarBorderColor": "#f43f5e", "avatarBorderWidth": 3}, "socialLinks": [{"id": "1", "platform": "tiktok", "url": "https://tiktok.com/@linhchibeauty", "active": true, "label": "TikTok Shop"}, {"id": "2", "platform": "facebook", "url": "https://facebook.com/linhchicosmetic", "active": true, "label": "Fanpage Mỹ Phẩm"}, {"id": "3", "platform": "shopee", "url": "https://shopee.vn/linhchicosmetics", "active": true, "label": "Gian hàng Shopee Mall"}, {"id": "4", "platform": "zalo", "url": "https://zalo.me/0912345678", "active": true, "label": "Zalo Đặt Hàng"}], "blocks": [{"id": "blk-lc-1", "type": "product", "enabled": true, "order": 1, "title": "Serum Tái Tạo Da Chuyên Sâu B5 Hyaluronic Acid", "price": 380000, "originalPrice": 550000, "imageUrl": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop", "buttonText": "Săn Deal Shopee Mall -30%", "productUrl": "https://shopee.vn", "isHot": true, "clickCount": 1540}], "seo": {"title": "Linh Chi Beauty & Cosmetic | TRANG CÁ NHÂN", "description": "Mỹ phẩm xách tay chính hãng, tư vấn Skincare routine chuẩn y khoa.", "hideWatermark": true}, "customDomain": {"domain": "", "verified": false, "cnameTarget": "cname.trangcanhan.com"}, "updatedAt": "2026-08-29T12:03:46.269Z"}', NOW(), NOW()),
('hoangnam', '{"username": "hoangnam", "profile": {"displayName": "Hoàng Nam Photography", "bio": "Nhiếp ảnh gia tự do • Chụp ảnh cưới phong cách Hàn Quốc, Lookbook thời trang & Ảnh chân dung nghệ thuật.", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop", "verifiedBadge": false, "location": "Đà Nẵng, Việt Nam", "tagline": "Lưu giữ khoảnh khắc thanh xuân trọn vẹn", "phone": "0933 445 566", "email": "hoangnam.photo@gmail.com", "showContactChips": true, "showShareButton": true}, "theme": {"id": "minimal-slate", "name": "Minimal Dark Slate", "bgType": "color", "bgColor": "#0f172a", "fontFamily": "Plus Jakarta Sans", "fontSize": "medium", "textColor": "#f8fafc", "accentColor": "#38bdf8", "cardStyle": "glass", "cardBgColor": "rgba(30, 41, 59, 0.7)", "cardTextColor": "#ffffff", "cardBorderColor": "rgba(56, 189, 248, 0.2)", "buttonShape": "rounded-xl", "avatarShape": "circle", "avatarBorderColor": "#38bdf8", "avatarBorderWidth": 2}, "socialLinks": [{"id": "1", "platform": "instagram", "url": "https://instagram.com/hoangnam.visual", "active": true, "label": "Instagram Portfolio"}, {"id": "2", "platform": "facebook", "url": "https://facebook.com/hoangnamphoto", "active": true, "label": "Facebook Page"}], "blocks": [{"id": "blk-hn-1", "type": "link", "enabled": true, "order": 1, "title": "📸 Xem Bảng Giá Gói Chụp Ảnh Cưới & Lookbook 2026", "url": "https://trangcanhan.com", "subtitle": "Nhận tư vấn concept chụp độc quyền miễn phí", "clickCount": 420}], "seo": {"title": "Hoàng Nam Photography | TRANG CÁ NHÂN", "description": "Portfolio chụp ảnh cưới, lookbook thời trang và nghệ thuật.", "hideWatermark": false}, "customDomain": {"domain": "", "verified": false, "cnameTarget": "cname.trangcanhan.com"}, "updatedAt": "2026-08-29T12:03:46.269Z"}', NOW(), NOW()),
('lybichngoc', '{"username": "lybichngoc", "profile": {"displayName": "Lý Bích Ngọc", "bio": "Quản trị viên & Sáng lập TRANG CÁ NHÂN. Kết nối đam mê và phát triển nền tảng Bio Link số #1 Việt Nam.", "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", "coverImageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", "verifiedBadge": true, "avatarShield": true, "location": "Việt Nam", "tagline": "Founder & Administrator • TRANG CÁ NHÂN", "jobTitle": "", "workplace": "CÔNG TY TNHH THẾ GIỚI ADMIN", "address": "Toà Nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh", "phone": "0988 889 999", "email": "thegioislide@gmail.com", "website": "https://trangcanhan.com", "showContactChips": true, "showShareButton": true, "showVCard": true, "showViewsCount": true, "floatingHotline": {"enabled": true, "phone": "0988 889 999", "label": "Hotline tư vấn", "position": "right"}}, "theme": {"id": "cyber-dark", "name": "Cyberpunk Neon", "bgType": "gradient", "bgColor": "#09090b", "bgGradient": {"from": "#09090b", "via": "#180e29", "to": "#0f172a", "direction": "to-b"}, "bgImageUrl": "", "bgOverlayOpacity": 0.2, "bgBlur": 0, "fontFamily": "Plus Jakarta Sans", "fontSize": "medium", "textColor": "#f8fafc", "accentColor": "#8b5cf6", "cardStyle": "glass", "cardBgColor": "rgba(30, 27, 75, 0.55)", "cardTextColor": "#ffffff", "cardBorderColor": "rgba(139, 92, 246, 0.4)", "cardHoverEffect": "glow", "buttonShape": "rounded-xl", "buttonAnimation": "pulse", "avatarShape": "circle", "avatarBorderColor": "#8b5cf6", "avatarBorderWidth": 3}, "socialLinks": [{"id": "1", "platform": "facebook", "url": "https://facebook.com/namcreator", "active": true, "label": "Facebook Cá Nhân"}, {"id": "2", "platform": "tiktok", "url": "https://tiktok.com/@namcreator", "active": true, "label": "TikTok 500k Followers"}, {"id": "3", "platform": "youtube", "url": "https://youtube.com/@namcreator", "active": true, "label": "Kênh YouTube Review"}, {"id": "4", "platform": "instagram", "url": "https://instagram.com/nam.visual", "active": true, "label": "Instagram Ảnh Đẹp"}, {"id": "5", "platform": "zalo", "url": "https://zalo.me/0988889999", "active": true, "label": "Zalo Công Việc"}, {"id": "6", "platform": "telegram", "url": "https://t.me/thegioiadmin", "active": true, "label": "Telegram Group"}], "blocks": [{"id": "block-contact", "type": "contact_card", "enabled": true, "order": 1, "jobTitle": "Content Creator & Admin", "workplace": "CÔNG TY TNHH THẾ GIỚI ADMIN", "phone": "0988 889 999", "email": "thegioislide@gmail.com", "address": "Toà Nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh", "website": "https://trangcanhan.com", "telegram": "thegioiadmin", "zalo": "0988889999", "vCardEnabled": true}], "seo": {"title": "Nguyễn Thành Nam - TRANG CÁ NHÂN Chính Thức", "description": "Trang thông tin tổng hợp liên kết, mạng xã hội, sản phẩm và khóa học chính thức của Nguyễn Thành Nam.", "ogImage": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", "hideWatermark": true}, "customDomain": {"domain": "", "verified": false, "cnameTarget": "cname.trangcanhan.com", "sslActive": false, "dnsRecords": []}, "updatedAt": "2026-09-07T17:38:16.574Z"}', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `config` = VALUES(`config`),
  `updated_at` = NOW();

INSERT INTO `system_config` (`id`, `config`, `updated_at`)
VALUES (1, '{"siteName": "TRANG CÁ NHÂN", "bankAccount": "3510334132", "bankName": "BIDV", "bankOwner": "LY BICH NGOC", "announcementActive": false, "announcementText": "🎉 Chào mừng sự kiện nâng cấp hệ thống TRANG CÁ NHÂN v2.5! Tặng thêm 10% giá trị khi nạp tiền qua VietQR.", "autoPaymentConfig": {"enabled": true, "provider": "sepay", "apiKey": "Y8DQGZNOKWWPREEB9Q3296RFBLSHZ10YUFHHX0UGHOPCCPQMKVGNQJWFIDATPZVK", "webhookSecret": "", "depositPrefix": "NAP", "minDeposit": 10000, "syncInterval": 5}, "bonusDepositActive": true, "bonusDepositRate": 10, "siteTitle": "TRANG CÁ NHÂN - Nền tảng tạo trang bio cá nhân chuyên nghiệp #1 Việt Nam", "slogan": "", "logoUrl": "", "mainDomain": "", "cnameTarget": "cname.trangcanhan.com", "defaultUserPlan": "free", "supportEmail": "thegioiadmin@gmail.com", "hotline": "0988 888 999", "bankCode": "MB", "accountHolder": "NGUYEN THANH NAM", "momoNumber": "0988889999", "momoName": "NGUYEN THANH NAM", "bonusDepositNote": "Tặng thêm 10% giá trị nạp ví tự động qua VietQR", "popupModal": {"enabled": false, "title": "Chào Mừng Đến Với TRANG CÁ NHÂN", "badge": "THÔNG BÁO TỪ BAN QUẢN TRỊ", "content": "Hệ thống nâng cấp hoàn tất!", "buttonText": "Khám Phá Ngay", "buttonLink": "#pricing", "imageUrl": ""}, "maintenanceMode": false, "maintenanceConfig": {"globalMaintenance": false, "globalTitle": "Hệ Thống Đang Nâng Cấp & Bảo Trì Định Kỳ", "globalMessage": "Hệ thống đang được nâng cấp máy chủ và tối ưu cơ sở dữ liệu để nâng cao trải nghiệm của bạn. Vui lòng quay lại sau ít phút hoặc liên hệ Hotline để được hỗ trợ khẩn cấp.", "globalExpectedEndTime": "15:00 Hôm nay", "modules": {"global": {"key": "global", "name": "Toàn Bộ Hệ Thống", "description": "Tạm khóa toàn bộ website và các trang Bio công khai với thông báo bảo trì toàn diện", "isUnderMaintenance": false, "maintenanceTitle": "Bảo Trì Toàn Diện Hệ Thống", "maintenanceMessage": "Hệ thống đang được nâng cấp cụm máy chủ và tối ưu hóa hệ thống máy chủ dữ liệu.", "expectedEndTime": "15:00", "allowAdminBypass": true}, "wallet_deposit": {"key": "wallet_deposit", "name": "Nạp Tiền & Ví Tài Khoản", "description": "Tạm khóa nạp tiền tự động qua VietQR & MoMo để đối soát kết nối ngân hàng", "isUnderMaintenance": false, "maintenanceTitle": "Cổng Nạp Tiền & Ví Đang Bảo Trì Đối Soát", "maintenanceMessage": "Cổng thanh toán tự động qua Napas / VietQR đang được ngân hàng đối tác bảo trì kết nối định kỳ. Quý khách vui lòng thực hiện lại sau ít phút.", "expectedEndTime": "12:00", "allowAdminBypass": true}, "plan_upgrade": {"key": "plan_upgrade", "name": "Nâng Cấp Gói Pro & VIP", "description": "Tạm khóa đăng ký và gia hạn các gói Pro / Doanh Nghiệp", "isUnderMaintenance": false, "maintenanceTitle": "Hệ Thống Nâng Cấp Gói Đang Cập Nhật Bảng Giá Mới", "maintenanceMessage": "Tính năng nâng cấp gói đang được cập nhật chương trình khuyến mãi và gói cước mới.", "expectedEndTime": "14:30", "allowAdminBypass": true}, "user_register": {"key": "user_register", "name": "Đăng Ký Tài Khoản Mới", "description": "Tạm dừng tiếp nhận đăng ký người dùng mới để kiểm tra chất lượng dịch vụ", "isUnderMaintenance": false, "maintenanceTitle": "Tạm Dừng Tiếp Nhận Đăng Ký Mới", "maintenanceMessage": "Hệ thống đang tạm khóa tạo tài khoản mới để nâng cấp hạ tầng. Các thành viên đã có tài khoản vẫn đăng nhập sử dụng bình thường.", "expectedEndTime": "18:00", "allowAdminBypass": true}, "bio_editor": {"key": "bio_editor", "name": "Chỉnh Sửa & Quản Lý Bio", "description": "Tạm khóa chỉnh sửa khối liên kết và giao diện trang cá nhân", "isUnderMaintenance": false, "maintenanceTitle": "Trình Chỉnh Sửa Bio Đang Được Nâng Cấp", "maintenanceMessage": "Trình chỉnh sửa khối liên kết và kho mẫu giao diện đang được bổ sung thêm nhiều tính năng mới.", "expectedEndTime": "16:00", "allowAdminBypass": true}, "custom_domain": {"key": "custom_domain", "name": "Tên Miền Riêng & CNAME DNS", "description": "Tạm dừng xác minh SSL và kích hoạt tên miền riêng mới", "isUnderMaintenance": false, "maintenanceTitle": "Cổng Cấu Hình Tên Miền Riêng Đang Nâng Cấp SSL", "maintenanceMessage": "Hệ thống cấp phát chứng chỉ SSL tự động và máy chủ DNS đang được bảo trì định kỳ.", "expectedEndTime": "17:00", "allowAdminBypass": true}, "templates": {"key": "templates", "name": "Kho Mẫu Giao Diện", "description": "Tạm dừng áp dụng mẫu giao diện mới để tải dữ liệu 50+ theme mới", "isUnderMaintenance": false, "maintenanceTitle": "Kho Mẫu Đang Tải Thêm Giao Diện Mới", "maintenanceMessage": "Đội ngũ thiết kế đang tải lên các bộ giao diện Hot Trend 2026 mới.", "expectedEndTime": "13:00", "allowAdminBypass": true}, "analytics": {"key": "analytics", "name": "Thống Kê & Báo Cáo Truy Cập", "description": "Tạm dừng phân tích biểu đồ thời gian thực để tổng hợp dữ liệu", "isUnderMaintenance": false, "maintenanceTitle": "Máy Chủ Thống Kê Đang Tổng Hợp Dữ Liệu", "maintenanceMessage": "Dữ liệu phân tích truy cập đang được tối ưu hóa tốc độ xử lý.", "expectedEndTime": "14:00", "allowAdminBypass": true}, "homepage": {"key": "homepage", "name": "Trang Chủ (Landing Page)", "description": "Tạm khóa nội dung ngoài trang chủ với thông báo bảo trì, Logo và Menu Header vẫn hiển thị bình thường", "isUnderMaintenance": false, "maintenanceTitle": "Trang Chủ Đang Nâng Cấp & Bảo Trì", "maintenanceMessage": "Trang chủ TRANG CÁ NHÂN đang được nâng cấp giao diện và bổ sung thêm các tính năng mới. Các dịch vụ đăng nhập, quản lý bio và bảng giá vẫn hoạt động bình thường.", "expectedEndTime": "15:00 Hôm nay", "allowAdminBypass": true}}}, "defaultBioFooterText": "Đăng ký miễn phí TRANG CÁ NHÂN", "defaultBioFooterLink": "http://trangcanhan.com", "articles": [{"id": "art_gioi_thieu", "slug": "gioi-thieu", "title": "Về Chúng Tôi", "category": "Công ty", "author": "Ban Quản Trị TRANG CÁ NHÂN", "summary": "Nền tảng tạo trang cá nhân số và danh thiếp điện tử thông minh hàng đầu tại Việt Nam, giúp bạn kết nối mọi liên kết trong một chạm.", "coverImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-08-24", "isPublished": true, "views": 1258, "content": "## 🌟 Chào mừng bạn đến với TRANG CÁ NHÂN

Trong kỷ nguyên số, mỗi cá nhân, nhà sáng tạo nội dung, chuyên gia và doanh nghiệp đều sở hữu nhiều kênh thông tin khác nhau: từ Facebook, Instagram, TikTok, YouTube, cho đến tài khoản ngân hàng, danh bạ liên hệ, portfolio công việc và gian hàng trực tuyến.

**TRANG CÁ NHÂN** ra đời với sứ mệnh đơn giản hóa toàn bộ sự hiện diện trực tuyến của bạn thành **một đường link duy nhất, thông minh, tinh tế và đầy đủ tiện ích**.

---

### 🚀 Sứ Mệnh Của Chúng Tôi

Chúng tôi tin rằng việc xây dựng thương hiệu cá nhân không nên bị giới hạn bởi sự phức tạp về kỹ thuật. Mục tiêu của chúng tôi là:

- **Kết Nối Toàn Diện**: Gom tất cả mạng xã hội, dự án, sản phẩm và thông tin liên hệ vào một địa chỉ duy nhất.
- **Tối Ưu Trải Nghiệm**: Thiết kế chuẩn Mobile-First, tốc độ tải trang cực nhanh, giao diện sắc nét và mượt mà trên mọi thiết bị.
- **Đột Phá Tính Năng**: Tiên phong tích hợp mã **VietQR động** nhận tiền ủng hộ/thanh toán, **Lưu danh bạ vCard 1 chạm** vào điện thoại và gắn **Tên miền riêng**.

---

### 💡 Các Tính Năng Nổi Bật

1. **Kho Giao Diện Đa Dạng & Hiện Đại**: Hàng chục mẫu theme được thiết kế tỉ mỉ bởi các chuyên gia UI/UX, phù hợp cho mọi ngành nghề từ Nghệ sĩ, Freelancer, Doanh nhân đến Doanh nghiệp.
2. **Khối Nội Dung Linh Hoạt**: Dễ dàng tùy biến thêm video YouTube/TikTok, nhạc Spotify, hình ảnh slider, bảng giá, biểu mẫu liên hệ, khối sản phẩm...
3. **Thanh Toán & Ủng Hộ VietQR Siêu Tốc**: Tự động sinh mã QR ngân hàng chuẩn NAPAS kèm số tiền và nội dung, giúp người hâm mộ và khách hàng chuyển khoản tức thì không cần nhập số tài khoản.
4. **Lưu Danh Bạ Điện Thoại (vCard)**: Khách hàng quét QR hoặc bấm nút là thông tin tên, số điện thoại, email, chức danh và công ty được lưu thẳng vào danh bạ điện thoại của họ.
5. **Gắn Tên Miền Riêng (Custom Domain)**: Nâng tầm uy tín với tên miền thương hiệu riêng của bạn (vd: `bio.tenban.vn` hoặc `trangcanhan.com/tenban`).
6. **Báo Cáo & Thống Kê Chi Tiết**: Theo dõi lượt xem, số lần nhấp link, thiết bị truy cập và quốc gia theo thời gian thực.

---

### 🤝 Cam Kết Chất Lượng

Chúng tôi luôn đặt quyền lợi, sự bảo mật và trải nghiệm của người dùng lên hàng đầu. Đội ngũ kỹ thuật và hỗ trợ khách hàng luôn túc trực 24/7 để đồng hành cùng bạn trên hành trình khẳng định dấu ấn cá nhân trong thế giới số.

- **Hotline hỗ trợ:** 0988 889 999
- **Email:** support@trangcanhan.com / thegioislide@gmail.com
- **Website:** https://trangcanhan.com"}, {"id": "art_dieu_khoan", "slug": "dieu-khoan", "title": "Điều Khoản Sử Dụng Dịch Vụ", "category": "Chính sách", "author": "Ban Pháp Chế TRANG CÁ NHÂN", "summary": "Quy định quyền lợi, nghĩa vụ và trách nhiệm pháp lý của thành viên và Ban quản lý nền tảng TRANG CÁ NHÂN theo quy định pháp luật.", "coverImage": "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-09-19", "isPublished": true, "views": 1540, "content": "## 📜 ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ

Chào mừng bạn đến với **TRANG CÁ NHÂN** (website cung cấp nền tảng trang liên kết bio, danh thiếp điện tử và tích hợp thanh toán VietQR). Khi đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên hệ thống, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dưới đây.

---

### 1. Nguyên Tắc Chung & Chấp Thuận Điều Khoản
- Nền tảng cung cấp công cụ trực tuyến cho phép người dùng tự khởi tạo trang liên kết thông tin cá nhân, danh thiếp điện tử, giới thiệu dự án, sản phẩm và tích hợp tiện ích nhận chuyển khoản.
- Điều khoản này có hiệu lực áp dụng đối với tất cả thành viên đăng ký và sử dụng dịch vụ trên nền tảng.
- Ban quản trị có quyền cập nhật, sửa đổi nội dung điều khoản để phù hợp với quy định pháp luật và thông báo công khai trên website.

---

### 2. Quyền Và Nghĩa Vụ Của Người Dùng
- **Đăng ký tài khoản**: Người dùng có nghĩa vụ cung cấp thông tin chính xác, trung thực khi đăng ký và tự bảo mật thông tin đăng nhập của mình.
- **Trách nhiệm về nội dung**: Bạn chịu hoàn toàn trách nhiệm pháp lý đối với mọi thông tin, hình ảnh, văn bản và liên kết do mình đưa lên trang Bio cá nhân.
- **Các hành vi nghiêm cấm**:
  - Không đăng tải nội dung vi phạm pháp luật nước CHXHCN Việt Nam, thuần phong mỹ tục hoặc xâm phạm quyền, lợi ích hợp pháp của tổ chức, cá nhân khác.
  - Nghiêm cấm tạo trang giả mạo cá nhân, tổ chức, cơ quan nhà nước nhằm mục đích lừa đảo, chiếm đoạt tài sản.
  - Không truyền bá mã độc, đường link lừa đảo (phishing), cờ bạc, cá độ hoặc các hoạt động phi pháp.
  - Tài khoản vi phạm sẽ bị khóa vĩnh viễn và chuyển giao thông tin cho cơ quan chức năng khi có yêu cầu.

---

### 3. Quyền Và Trách Nhiệm Của Ban Quản Lý Nền Tảng
- **Đảm bảo vận hành**: Duy trì hệ thống máy chủ hoạt động ổn định, an toàn và hỗ trợ kỹ thuật kịp thời cho người dùng.
- **Quyền xử lý vi phạm**: Tạm ngừng hoặc chấm dứt cung cấp dịch vụ đối với tài khoản vi phạm các quy định mà không cần bồi thường thiệt hại phát sinh từ hành vi vi phạm đó.
- **Bảo mật dữ liệu**: Thực hiện các biện pháp kỹ thuật cần thiết để bảo vệ thông tin cá nhân của người dùng theo đúng Chính sách bảo mật.

---

### 4. Quyền Sở Hữu Trí Tuệ
- Toàn bộ giao diện, thiết kế, mã nguồn, nhãn hiệu và biểu tượng **TRANG CÁ NHÂN** thuộc quyền sở hữu của Ban quản lý nền tảng.
- Người dùng giữ quyền sở hữu đối với các nội dung do mình tự khởi tạo và chia sẻ hợp pháp trên trang cá nhân.

---

### 5. Giới Hạn Trách Nhiệm Pháp Lý
- Nền tảng đóng vai trò là công cụ hiển thị thông tin do người dùng tự thiết lập. Mọi giao dịch, trao đổi kinh tế hoặc thỏa thuận giữa chủ tài khoản Bio và người truy cập bên thứ ba là quan hệ dân sự riêng của các bên, nằm ngoài trách nhiệm của Nền tảng.
- Trong trường hợp bất khả kháng (thiên tai, sự cố đường truyền mạng quốc tế, sự cố nhà cung cấp hạ tầng cấp cao), Ban quản trị sẽ nỗ lực khắc phục trong thời gian sớm nhất nhưng được miễn trừ các trách nhiệm bồi thường gián tiếp."}, {"id": "art_chinh_sach", "slug": "chinh-sach", "title": "Chính Sách Bảo Mật Thông Tin Cá Nhân", "category": "Chính sách", "author": "Ban Quản Trị TRANG CÁ NHÂN", "summary": "Quy định thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân theo Điều 68-73 Nghị định 52/2013/NĐ-CP và Nghị định 13/2023/NĐ-CP.", "coverImage": "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-09-19", "isPublished": true, "views": 1820, "content": "## 🛡️ CHÍNH SÁCH BẢO MẬT THÔNG TIN CÁ NHÂN

Chính sách bảo mật này được lập nhằm tuân thủ quy định tại **Điều 68 đến Điều 73 Nghị định số 52/2013/NĐ-CP**, Nghị định số 85/2021/NĐ-CP và Nghị định số 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân trong hoạt động thương mại điện tử.

---

### 1. Mục Đích Thu Thập Thông Tin Cá Nhân
Chúng tôi thu thập thông tin cá nhân của người dùng nhằm:
- Cung cấp, duy trì và nâng cao chất lượng dịch vụ tạo trang Bio cá nhân và danh thiếp điện tử.
- Xác thực tài khoản, thực hiện các giao dịch nâng cấp gói dịch vụ (PRO, VIP) và nạp ví số dư.
- Gửi thông báo quan trọng về hệ thống, bảo mật tài khoản hoặc thay đổi chính sách dịch vụ.
- Hỗ trợ kỹ thuật, giải đáp thắc mắc và xử lý khiếu nại của người dùng.

---

### 2. Phạm Vi Thu Thập Thông Tin
- **Thông tin cơ bản**: Họ tên, Địa chỉ Email, Số điện thoại (dùng để đăng ký và khôi phục mật khẩu).
- **Thông tin trang Bio công khai**: Ảnh đại diện, tiểu sử, các đường liên kết mạng xã hội, thông tin liên hệ và số tài khoản ngân hàng nhận tiền mà người dùng chủ động công khai.
- **Dữ liệu kỹ thuật**: Địa chỉ IP, loại trình duyệt, hệ điều hành và số lượt tương tác ẩn danh phục vụ tính năng thống kê (Analytics) cho chủ tài khoản.

---

### 3. Phạm Vi Sử Dụng Thông Tin
- Thông tin thu thập chỉ được sử dụng trong phạm vi nội bộ nền tảng **TRANG CÁ NHÂN** để phục vụ các mục đích nêu tại Mục 1.
- **Cam kết**: Chúng tôi **tuyệt đối KHÔNG bán, chuyển nhượng hoặc chia sẻ** thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại.
- Thông tin chỉ được cung cấp cho cơ quan nhà nước có thẩm quyền khi có văn bản yêu cầu chính thức theo quy định của pháp luật Việt Nam.

---

### 4. Thời Gian Lưu Trữ Thông Tin
- Dữ liệu cá nhân của người dùng sẽ được lưu trữ an toàn trên hệ thống máy chủ trong suốt thời gian tài khoản hoạt động.
- Dữ liệu sẽ được hủy bỏ hoặc xóa vĩnh viễn khi người dùng thực hiện thao tác xóa tài khoản hoặc gửi yêu cầu bằng văn bản/email tới Ban quản lý.

---

### 5. Những Người Hoặc Tổ Chức Có Thể Tiếp Cận Thông Tin
- Đội ngũ kỹ thuật viên và bộ phận hỗ trợ khách hàng được ủy quyền của **TRANG CÁ NHÂN** (chỉ tiếp cận trong phạm vi xử lý sự cố hoặc hỗ trợ người dùng).
- Cơ quan nhà nước có thẩm quyền theo quy định pháp luật.

---

### 6. Địa Chỉ Của Đơn Vị Thu Thập Và Quản Lý Thông Tin
- **Đơn vị chủ quản**: Nền tảng TRANG CÁ NHÂN
- **Email hỗ trợ & tiếp nhận bảo mật**: thegioiadmin@gmail.com / contact@trangcanhan.com
- **Hotline**: 0988 888 999 (8h00 - 21h00 hàng ngày)
- **Địa chỉ liên hệ**: Tầng 6, Tòa nhà Công Nghệ Số, TP. Hồ Chí Minh, Việt Nam.

---

### 7. Phương Tiện Và Công Cụ Để Người Dùng Chỉnh Sửa Dữ Liệu Cá Nhân
- Người dùng có thể tự do đăng nhập vào hệ thống bất kỳ lúc nào để xem, chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân và thông tin trang Bio tại mục **Cài Đặt Hồ Sơ**.
- Trường hợp cần hỗ trợ xóa tài khoản hoàn toàn, người dùng có thể gửi email yêu cầu về địa chỉ **thegioiadmin@gmail.com** để được xử lý trong vòng 24 giờ.

---

### 8. Cam Kết Bảo Mật & Tiếp Nhận Khiếu Nại Về Thông Tin Cá Nhân
- Hệ thống áp dụng công nghệ mã hóa kết nối bảo mật SSL/TLS 256-bit, tường lửa bảo vệ máy chủ và sao lưu định kỳ.
- Mọi khiếu nại liên quan đến việc thông tin cá nhân bị sử dụng sai mục đích hoặc phạm vi đã thông báo sẽ được tiếp nhận và xử lý nhanh chóng trong vòng 48 giờ làm việc qua Email hoặc Hotline của Ban quản lý."}, {"id": "art_huong_dan", "slug": "huong-dan-tong-quan-a-den-z", "title": "Hướng Dẫn", "category": "Hướng dẫn", "author": "Đội Ngũ Hỗ Trợ TRANG CÁ NHÂN", "summary": "Cẩm nang từng bước giúp bạn xây dựng một TRANG CÁ NHÂN ấn tượng, thu hút người theo dõi và gia tăng chuyển đổi nhanh chóng.", "coverImage": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-05", "updatedAt": "2026-08-24", "isPublished": true, "views": 3120, "content": "## 📚 Hướng Dẫn Từng Bước Tạo TRANG CÁ NHÂN Ấn Tượng

Chỉ với 3 phút, bạn đã có thể sở hữu một TRANG CÁ NHÂN chuyên nghiệp để gắn vào tiểu sử TikTok, Instagram, Facebook hay danh thiếp kinh doanh!

---

### 🏁 Bước 1: Đăng Ký Tài Khoản & Đặt Tên Đường Dẫn
1. Bấm nút **\"Đăng ký\"** trên trang chủ (hỗ trợ đăng nhập Google, Facebook hoặc tài khoản hệ thống).
2. Chọn tên người dùng (username) ngắn gọn, dễ nhớ (vd: `trangcanhan.com/tenban`).

---

### 🎨 Bước 2: Chọn Mẫu Giao Diện (Templates)
1. Vào mục **Giao Diện Mẫu (Templates)**.
2. Khám phá các phong cách: Tối giản (Minimalist), Doanh nhân (Business Luxury), Cyberpunk, Neon hoặc Creative Glow.
3. Bấm **\"Áp Dụng Mẫu\"** để load cấu trúc nhanh chóng.

---

### 🔗 Bước 3: Thêm Các Khối Liên Kết & Thông Tin
- **Khối Danh Bạ & Liên Hệ**: Điền số hotline, email, Zalo, chức danh, công ty để khách hàng 1 chạm lưu ngay vào danh bạ máy qua vCard.
- **Khối Mạng Xã Hội**: Thêm link Facebook, TikTok, Instagram, YouTube, Telegram.
- **Khối Donate / Quét Mã VietQR**: Nhập số tài khoản ngân hàng và tên chủ thẻ để tự động sinh mã VietQR ủng hộ.

---

### 🌐 Bước 4: Chia Sẻ & Gắn Vào Mạng Xã Hội
1. Sao chép link cá nhân của bạn hoặc tải mã QR Code chất lượng cao.
2. Dán vào phần Bio của TikTok, Instagram, Zalo, YouTube hoặc in lên danh thiếp, thẻ NFC!"}, {"id": "art_hd_vcard", "slug": "huong-dan-cai-dat-danh-ba-vcard", "title": "Hướng Dẫn Cài Đặt Khối Thẻ Danh Bạ & Lưu vCard 1 Chạm", "category": "Hướng dẫn", "author": "Kỹ Thuật Viên TRANG CÁ NHÂN", "summary": "Cách thiết lập khối thông tin liên hệ chuyên nghiệp giúp đối tác lưu ngay số điện thoại, email và công ty vào điện thoại mà không cần gõ tay.", "coverImage": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-15", "updatedAt": "2026-08-25", "isPublished": true, "views": 2450, "content": "## 📇 Tối Ưu Hóa Khối Danh Bạ & Tính Năng vCard 1 Chạm

Khối thẻ danh bạ và liên hệ là khối nền tảng quan trọng nhất trên mọi trang bio, cho phép người xem gọi điện, nhắn Zalo, gửi email và tải tệp danh bạ (.vcf) chỉ với 1 cú chạm.

---

### 🚀 1. Các Trường Thông Tin Trong Khối Danh Bạ
- **Họ tên & Chức danh**: Hiển thị vai trò của bạn (vd: Giám Đốc Kinh Doanh, Content Creator, Chuyên Viên Tư Vấn).
- **Công ty / Nơi làm việc**: Nâng tầm uy tín và nhận diện thương hiệu.
- **Số điện thoại & Hotline**: Cho phép khách bấm gọi trực tiếp trên điện thoại.
- **Số Zalo**: Nút kết nối Zalo nhanh để chat và gửi báo giá.
- **Địa chỉ văn phòng / Showroom**: Giúp khách hàng dễ dàng tìm kiếm địa điểm.

---

### 📲 2. Cách Kích Hoạt Nút Tải Danh Bạ (vCard)
1. Vào tab **Nội dung (Blocks)** trong trình chỉnh sửa.
2. Chọn khối **Thẻ Danh Bạ & Liên Hệ** và bấm nút **Chỉnh sửa**.
3. Bật tùy chọn **\"Bật nút Lưu Danh Bạ (vCard)\"**.
4. Bấm **Lưu thay đổi**. Khi khách hàng truy cập, họ chỉ cần bấm nút \"Lưu Danh Bạ\" là điện thoại sẽ tự động mở ứng dụng Danh bạ và lưu đầy đủ thông tin."}, {"id": "art_hd_vietqr", "slug": "huong-dan-tich-hop-vietqr-chuyen-khoan", "title": "Hướng Dẫn Tích Hợp Mã VietQR Động Nhận Tiền & Donate Tức Thì", "category": "Hướng dẫn", "author": "Chuyên Viên Tài Chính Số", "summary": "Hướng dẫn cấu hình khối thanh toán VietQR NAPAS247 tự động sinh mã QR với số tài khoản và thông điệp chuyển khoản không mất phí trung gian.", "coverImage": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-20", "updatedAt": "2026-08-25", "isPublished": true, "views": 2890, "content": "## 💳 Tích Hợp VietQR Chuẩn NAPAS247 Nhận Chuyển Khoản Tức Thì

Không cần cổng thanh toán phức tạp, bạn có thể nhận donate và thanh toán đơn hàng trực tiếp về tài khoản ngân hàng cá nhân với mã VietQR.

---

### ⚡ Ưu Điểm Của Khối VietQR Trên TRANG CÁ NHÂN
- Tương thích 100% với hơn 50 ứng dụng ngân hàng và ví điện tử tại Việt Nam.
- Quét mã là tự động điền đúng Số tài khoản, Ngân hàng và Tên chủ thẻ, tránh rủi ro chuyển khoản nhầm.
- Người xem có thể chọn các mệnh giá donate định sẵn (20k, 50k, 100k, 200k) hoặc tùy chỉnh số tiền.

---

### 🛠️ Các Bước Cấu Hình Khối VietQR (Dành cho gói Pro/VIP)
1. Trong trình chỉnh sửa Bio, bấm **Thêm nội dung** -> Chọn **Mã VietQR Donate / Thanh Toán**.
2. Chọn ngân hàng thụ hưởng từ danh sách (MBBank, Vietcombank, Techcombank, BIDV, ACB...).
3. Nhập chính xác số tài khoản và tên chủ tài khoản viết hoa không dấu (vd: `NGUYEN VAN A`).
4. Đặt tiêu đề thu hút như: *\"☕ Mời tác giả ly cà phê\"* hoặc *\"💳 Quét mã chuyển khoản nhanh\"*.
5. Bấm **Lưu** để hiển thị ngay trên trang bio cá nhân của bạn."}, {"id": "art_hd_domain", "slug": "huong-dan-tro-ten-mien-rieng-custom-domain", "title": "Hướng Dẫn Cấu Hình & Trỏ Tên Miền Riêng (Custom Domain)", "category": "Hướng dẫn", "author": "Kỹ Sư Hệ Thống TRANG CÁ NHÂN", "summary": "Từng bước kết nối tên miền riêng của bạn vào trang cá nhân với chứng chỉ bảo mật SSL miễn phí và xác thực tự động.", "coverImage": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-02-01", "updatedAt": "2026-08-25", "isPublished": true, "views": 1980, "content": "## 🌐 Kết Nối Tên Miền Riêng Độc Bản (Custom Domain)

Sử dụng tên miền riêng như `bio.tenban.vn` hoặc `tenban.com` giúp bạn xây dựng hình ảnh chuyên nghiệp và gia tăng độ tin cậy trong mắt khách hàng và đối tác.

---

### 📋 Bước 1: Chuẩn Bị Tên Miền
Bạn có thể sử dụng tên miền chính (root domain) hoặc tên miền phụ (subdomain) đã mua từ bất kỳ nhà cung cấp nào (PA Việt Nam, Mắt Bão, INET, Cloudflare, Namecheap...).

---

### ⚙️ Bước 2: Cấu Hình Bản Ghi DNS
Truy cập trang quản trị DNS của nhà cung cấp tên miền và thêm bản ghi:
- **Loại bản ghi (Type)**: `CNAME`
- **Tên (Host/Name)**: `bio` (hoặc `@` nếu dùng domain chính)
- **Giá trị đích (Value/Target)**: `cname.trangcanhan.com`
- **TTL**: `Tự động` hoặc `300`

---

### ✅ Bước 3: Xác Thực Trên TRANG CÁ NHÂN
1. Vào tab **Tên Miền Riêng** trong trang Quản trị Bio.
2. Nhập tên miền của bạn (vd: `bio.tenban.vn`).
3. Bấm nút **\"Kiểm Tra & Kích Hoạt Tên Miền\"**. Hệ thống sẽ tự động cấp phát chứng chỉ SSL Let''s Encrypt trong 1-5 phút."}, {"id": "art_hd_theme", "slug": "huong-dan-tuy-bien-giao-dien-theme", "title": "Hướng Dẫn Tùy Biến Giao Diện, Bảng Màu & Phối Theme Độc Đáo", "category": "Hướng dẫn", "author": "UI/UX Designer TRANG CÁ NHÂN", "summary": "Bí quyết lựa chọn màu sắc, phông chữ, kiểu nút bấm và hình nền để tạo nên phong cách nhận diện thương hiệu cá nhân xuất sắc.", "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-02-15", "updatedAt": "2026-08-25", "isPublished": true, "views": 2150, "content": "## 🎨 Nghệ Thuật Phối Màu & Thiết Kế Trang Cá Nhân Chuẩn Đẹp

Giao diện là ấn tượng thị giác đầu tiên quyết định người xem có ở lại khám phá các liên kết của bạn hay không.

---

### 🌈 1. Chọn Bảng Màu Phù Hợp Tính Cách
- **Pastel / Soft Glow**: Phù hợp cho ngành Làm đẹp, Thời trang, Lifestyle, Blogger.
- **Dark Neon / Cyberpunk**: Hoàn hảo cho Streamer, Gamer, Lập trình viên, Âm nhạc điện tử.
- **Minimalist Black & White / Warm Luxury**: Lựa chọn hàng đầu cho Doanh nhân, Cố vấn, Bất động sản, Luật sư.

---

### 🔲 2. Tùy Biến Thẻ & Nút Bấm
- **Kiểu viền (Border Radius)**: Bo tròn mềm mại (Rounded-xl) hoặc góc vuông hiện đại.
- **Hiệu ứng khi di chuột (Hover Effect)**: Nâng nhẹ (Lift), Phát sáng (Glow), hoặc Đổi màu viền.
- **Kiểu thẻ (Card Style)**: Hiệu ứng kính mờ thời thượng (Glassmorphism) hoặc Màu phẳng (Solid)."}, {"id": "art_hd_social_nfc", "slug": "huong-dan-gan-link-bio-len-tiktok-instagram", "title": "Hướng Dẫn Gắn Link Bio Lên TikTok, Instagram, Zalo & Thẻ Danh Thiếp NFC", "category": "Hướng dẫn", "author": "Biên Tập Viên TRANG CÁ NHÂN", "summary": "Cách đặt liên kết Bio vào các mạng xã hội phổ biến và tích hợp vào thẻ thông minh NFC để chia sẻ thông tin trong 1 giây.", "coverImage": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-02-25", "updatedAt": "2026-08-25", "isPublished": true, "views": 2780, "content": "## 🚀 Cách Đặt Link Bio Vào Các Nền Tảng Mạng Xã Hội

Sau khi đã hoàn thiện trang cá nhân, bước tiếp theo là đưa đường dẫn tiếp cận đến đông đảo người theo dõi.

---

### 🎵 1. Gắn Vào Tiểu Sử TikTok
1. Mở ứng dụng **TikTok** -> Vào trang cá nhân -> Chọn **Sửa hồ sơ**.
2. Tìm mục **Trang web** (Website) -> Dán đường link Bio của bạn vào.
3. Bấm **Lưu**. Lúc này trên trang cá nhân TikTok sẽ xuất hiện đường link có thể nhấp trực tiếp.

---

### 📸 2. Gắn Vào Instagram
1. Mở **Instagram** -> Vào trang cá nhân -> Chọn **Chỉnh sửa trang cá nhân**.
2. Bấm vào mục **Liên kết (Links)** -> Chọn **Thêm liên kết bên ngoài**.
3. Dán link Bio của bạn và đặt tiêu đề (vd: *\"Trang Cá Nhân & Danh Bạ Chính Thức\"*).

---

### 🎴 3. Tích Hợp Vào Thẻ Danh Thiếp NFC
- Mở ứng dụng ghi NFC (như NFC Tools trên iOS/Android).
- Chọn **Write** -> **Add a record** -> **URL/URI**.
- Dán đường link TRANG CÁ NHÂN của bạn và chạm thẻ NFC vào lưng máy để ghi dữ liệu."}, {"id": "art_lien_he", "slug": "lien-he", "title": "Liên hệ", "category": "Hỗ trợ", "author": "Bộ Phận Chăm Sóc Khách Hàng", "summary": "Thông tin kết nối, hỗ trợ kỹ thuật 24/7 và cơ hội hợp tác doanh nghiệp, đại lý cùng Trang Cá Nhân.", "coverImage": "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-08-24", "isPublished": true, "views": 450, "content": "## 📞 Kênh Hỗ Trợ & Hợp Tác

Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp, giải đáp thắc mắc và đồng hành cùng các đối tác doanh nghiệp, nhà sáng tạo nội dung trên toàn quốc.

---

### 🏢 Thông Tin Trụ Sở & Liên Hệ

- **Đơn Vị Chủ Quản:** Nền Tảng TRANG CÁ NHÂN (TRANG CÁ NHÂN Vietnam)
- **Địa Chỉ:** Tòa nhà Landmark 81, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh
- **Hotline / Zalo:** **0988 889 999** (Hỗ trợ 24/7)
- **Email Hỗ Trợ:** **support@trangcanhan.com** / **thegioislide@gmail.com**
- **Thời Gian Làm Việc:** Thứ 2 - Chủ Nhật (08:00 - 22:00)

---

### 💼 Hợp Tác Doanh Nghiệp & Thẻ Danh Thiếp Thông Minh NFC

Nếu doanh nghiệp của bạn có nhu cầu:
- Trang bị trang cá nhân số đồng bộ cho toàn thể cán bộ công nhân viên.
- In ấn danh thiếp thông minh gắn chip NFC tích hợp TRANG CÁ NHÂN.
- Tích hợp giải pháp nhãn trắng (White-label) hoặc gắn tên miền công ty.

Vui lòng liên hệ trực tiếp qua Hotline hoặc Email để nhận báo giá ưu đãi tốt nhất dành cho doanh nghiệp!"}, {"id": "art_blog_1", "slug": "cach-tao-link-bio-chuyen-nghiep-2026", "title": "Cách Tạo TRANG CÁ NHÂN Chuyên Nghiệp Thu Hút Hàng Triệu Lượt Xem", "category": "Blog", "author": "Biên Tập Viên TRANG CÁ NHÂN", "summary": "Hướng dẫn toàn diện từ A-Z cách tạo và tối ưu TRANG CÁ NHÂN đẹp mắt, thu hút tương tác tối đa trên TikTok và Instagram.", "coverImage": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-03-01", "updatedAt": "2026-08-25", "isPublished": true, "views": 3420, "content": "## 🚀 Xu Hướng & Bí Quyết Xây Dựng TRANG CÁ NHÂN Đỉnh Cao 2026

Trong bối cảnh các nền tảng mạng xã hội như TikTok, Instagram chỉ cho phép đặt 1 liên kết duy nhất ở phần tiểu sử (Bio), việc tối ưu hóa TRANG CÁ NHÂN của bạn quyết định tới 80% tỷ lệ giữ chân người xem và chuyển đổi khách hàng tiềm năng.

---

### 🌟 1. Chọn Mẫu Giao Diện Đồng Bộ Nhận Diện Cá Nhân
- Hãy chọn bảng màu phù hợp với phong cách của bạn (Pastel nhẹ nhàng cho Beauty & Lifestyle, Dark Cyber cho Gaming/Dev, Tông Nâu Ấm cho F&B/Coffee).
- Sử dụng ảnh đại diện sắc nét, góc chụp trực diện, ánh sáng tự nhiên.
- Đặt tiêu đề ngắn gọn kèm các biểu tượng cảm xúc (emoji) dễ nhìn.

---

### ⚡ 2. Sắp Xếp Liên Kết Theo Thứ Tự Ưu Tiên
1. **Liên kết hành động quan trọng nhất (Top CTA):** Kênh YouTube mới nhất, Gian hàng Shopee, hoặc Khóa học đăng ký.
2. **Khối Ủng hộ & Thanh toán VietQR:** Tích hợp nhận donate nhanh không cần người xem phải gõ số tài khoản thủ công.
3. **Lưu danh bạ vCard 1 chạm:** Rất hữu ích khi bạn gặp gỡ đối tác ngoài đời hoặc qua thẻ NFC.
4. **Mạng xã hội:** Đặt hàng biểu tượng mạng xã hội (Facebook, TikTok, Instagram, Zalo) ở vị trí dễ chạm trên màn hình điện thoại.

---

### 📈 3. Đo Lường & Tối Ưu Hàng Tuần Với Báo Cáo Analytics
- Theo dõi xem nút liên kết nào có lượt click cao nhất.
- Đổi vị trí hoặc thay đổi câu chữ kêu gọi hành động (CTA) nếu nút đó ít người bấm.
- Thường xuyên cập nhật liên kết khuyến mãi hoặc video mới mỗi khi ra mắt sản phẩm!"}, {"id": "art_blog_2", "slug": "toi-uu-chuyen-doi-ban-hang-qua-bio", "title": "Bí Quyết Tăng Tỷ Lệ Chuyển Đổi Bán Hàng Gấp 3 Lần Từ TRANG CÁ NHÂN", "category": "Blog", "author": "Chuyên Gia Tăng Trưởng", "summary": "Chiến lược biến người theo dõi trên mạng xã hội thành khách hàng trung thành với kỹ thuật tối ưu hóa liên kết và call-to-action.", "coverImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-02-20", "updatedAt": "2026-08-24", "isPublished": true, "views": 2850, "content": "## 💰 Tối Ưu Tỷ Lệ Chuyển Đổi Bán Hàng Với TRANG CÁ NHÂN

Rất nhiều nhà sáng tạo nội dung có hàng trăm nghìn lượt xem mỗi video nhưng lại không tạo ra doanh số tương xứng. Lý do chính nằm ở chỗ: **Hành trình từ xem video đến mua hàng bị đứt gãy**.

---

### 🎯 1. Nguyên Tắc \"1 Nhấp Chuột Đến Ngay Sản Phẩm\"
- Khách hàng trên điện thoại có tính kiên nhẫn rất thấp. Nếu họ phải tìm kiếm hoặc load trang web quá 3 giây, 50% sẽ rời đi.
- Hãy đưa sản phẩm hot nhất hoặc chương trình flash sale lên ngay vị trí đầu tiên trong danh sách liên kết.

---

### 🔥 2. Đặt Tiêu Đề Nút Mang Tính Hành Động Mạnh
Thay vì viết chung chung:
- ❌ *\"Xem Shopee\"* -> Hãy đổi thành: ✅ *\"Săn Voucher Giảm 50% Shopee Hôm Nay\"*
- ❌ *\"Tài liệu\"* -> Hãy đổi thành: ✅ *\"Tải Trọn Bộ Tài Liệu Miễn Phí Tại Đây\"*

---

### 📊 3. Tận Dụng Báo Cáo Thống Kê Theo Thời Gian Thực
- Sử dụng hệ thống Analytics tích hợp của TRANG CÁ NHÂN để biết lượng traffic đến chủ yếu từ TikTok, Facebook hay Instagram.
- Tinh chỉnh nội dung cho phù hợp với từng tệp người xem theo thời gian thực."}, {"id": "art_blog_3", "slug": "tich-hop-vietqr-nhan-donate-tu-dong", "title": "Tích Hợp Mã VietQR Động Nhận Donate & Thanh Toán Tự Động 24/7", "category": "Blog", "author": "Kỹ Thuật Viên TRANG CÁ NHÂN", "summary": "Khám phá tính năng quét mã QR ngân hàng tự động điền sẵn số tiền và nội dung, giúp người hâm mộ chuyển khoản ngay trong tích tắc.", "coverImage": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-02-10", "updatedAt": "2026-08-22", "isPublished": true, "views": 2190, "content": "## 💳 Cách Mạng Hóa Thanh Toán Bằng Mã VietQR Động

Việc sao chép số tài khoản, mở app ngân hàng, gõ tên ngân hàng rồi dán số tài khoản và gõ nội dung chuyển tiền là rào cản lớn nhất khiến khách hàng ngại chuyển khoản.

---

### ⚡ VietQR Động Giải Quyết Triệt Để Vấn Đề Này:
1. **Một Chạm Mở App Ngân Hàng**: Mã QR chuẩn NAPAS tự động nhận diện tất cả app ngân hàng tại Việt Nam (MB Bank, Vietcombank, Techcombank, BIDV, ACB, VietinBank...).
2. **Điền Sẵn Thông Tin**: Số tài khoản, tên người thụ hưởng và số tiền được mã hóa chính xác, tránh nhầm lẫn 100%.
3. **Thông Báo Tức Thì**: Tiền về thẳng tài khoản cá nhân của bạn mà không qua trung gian tài chính.

---

### 🛠️ Cách Kích Hoạt Khối VietQR Trên TRANG CÁ NHÂN:
1. Truy cập trang chỉnh sửa (Editor).
2. Thêm khối **\"Ủng Hộ & Thanh Toán VietQR\"**.
3. Điền Ngân hàng, Số tài khoản và Tên chủ tài khoản.
4. Tùy chỉnh các mốc tiền gợi ý (vd: 20k, 50k, 100k) hoặc cho phép khách tự nhập số tiền!"}, {"id": "art_blog_4", "slug": "xu-huong-danh-thiep-dien-tu-nfc", "title": "Xu Hướng Danh Thiếp Điện Tử Thông Minh NFC Kết Hợp TRANG CÁ NHÂN Số", "category": "Blog", "author": "Ban Biên Tập TRANG CÁ NHÂN", "summary": "Thay thế hoàn toàn danh thiếp giấy truyền thống bằng thẻ thông minh chạm 1 giây để truyền toàn bộ hồ sơ chuyên nghiệp vào điện thoại.", "coverImage": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-28", "updatedAt": "2026-08-20", "isPublished": true, "views": 1980, "content": "## 📱 Danh Thiếp Thông Minh NFC - Đẳng Cấp Kết Nối Thời Đại Số

Danh thiếp giấy thường bị lãng quên hoặc vứt bỏ sau các cuộc gặp gỡ. Thẻ danh thiếp điện tử thông minh tích hợp chip NFC cùng đường link TRANG CÁ NHÂN đang trở thành tiêu chuẩn mới cho các doanh nhân và chuyên gia.

---

### 🌐 Ưu Điểm Vượt Trội Của Thẻ NFC TRANG CÁ NHÂN:
- **Chạm 1 Giây (One-Tap Share)**: Chỉ cần chạm nhẹ thẻ vào lưng điện thoại iPhone hoặc Android là trang thông tin của bạn hiện lên ngay mà không cần cài app.
- **Lưu Danh Bạ Tức Thì (vCard)**: Khách hàng chỉ cần bấm 1 nút là lưu toàn bộ Tên, Số điện thoại, Email, Chức danh vào danh bạ điện thoại của họ.
- **Cập Nhật Thông Tin Không Cần In Lại Thẻ**: Khi bạn đổi số điện thoại hay đổi chức vụ, chỉ cần cập nhật trên hệ thống là thẻ tự động hiển thị thông tin mới.
- **Tiết Kiệm Chi Phí & Bảo Vệ Môi Trường**: 1 chiếc thẻ sử dụng trọn đời, thay thế hàng nghìn tấm danh thiếp giấy in ấn tốn kém."}, {"id": "art_chinh_sach_thanh_toan", "slug": "chinh-sach-thanh-toan", "title": "Chính Sách Thanh Toán & Hoàn Tiền", "category": "Chính sách", "author": "Phòng Tài Chính TRANG CÁ NHÂN", "summary": "Quy định về phương thức thanh toán trực tuyến qua VietQR, quy trình kích hoạt gói dịch vụ và chính sách hoàn tiền minh bạch trong 07 ngày.", "coverImage": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-09-19", "isPublished": true, "views": 980, "content": "## 💳 CHÍNH SÁCH THANH TOÁN & HOÀN TIỀN

Nhằm đảm bảo quyền lợi tối đa và sự minh bạch cho khách hàng khi sử dụng các dịch vụ có thu phí (nâng cấp gói PRO, VIP, gắn tên miền riêng) tại **TRANG CÁ NHÂN**, chúng tôi công bố chính sách thanh toán và hoàn tiền cụ thể như sau:

---

### 1. Phương Thức Thanh Toán Chấp Nhận
- **Chuyển khoản ngân hàng trực tuyến 24/7 (VietQR)**: Quét mã QR tự động chuẩn NAPAS247 thông qua ứng dụng ngân hàng di động (Mobile Banking) hoặc ví điện tử. Nội dung chuyển khoản được tạo tự động để hệ thống ghi nhận chính xác tức thì.
- **Thanh toán bằng số dư ví tài khoản**: Sử dụng tiền đã nạp trong ví hệ thống để kích hoạt hoặc gia hạn gói dịch vụ.
- **Tính an toàn**: Tất cả thông tin giao dịch đều được mã hóa và xác thực trực tiếp qua hệ thống ngân hàng đối tác, không lưu trữ thông tin thẻ tín dụng/mật khẩu ngân hàng của khách hàng trên máy chủ.

---

### 2. Quy Trình Kích Hoạt Dịch Vụ
- Sau khi khách hàng thực hiện chuyển khoản thành công với đúng nội dung mã giao dịch được cấp, hệ thống tự động xác nhận và **kích hoạt tính năng gói cước ngay lập tức (trong vòng 1 - 3 phút)**.
- Khách hàng nhận được thông báo xác nhận nâng cấp thành công trên màn hình và qua email đăng ký tài khoản.
- Trường hợp chuyển khoản nhưng sau 15 phút chưa được kích hoạt do sai cú pháp, vui lòng liên hệ Hotline **0988 888 999** kèm ảnh chụp biên lai giao dịch để được hỗ trợ kích hoạt thủ công nhanh nhất.

---

### 3. Quy Định Về Bảng Giá Và Hóa Đơn
- Bảng giá các gói dịch vụ (Free, PRO, VIP) được niêm yết công khai tại mục **Bảng Giá** trên website.
- Giá dịch vụ đã bao gồm toàn bộ các tính năng tương ứng của từng gói, cam kết không phát sinh phụ phí ẩn trong suốt thời hạn sử dụng.

---

### 4. Chính Sách Hoàn Tiền (Refund Policy)
Chúng tôi cam kết chính sách hoàn tiền công bằng, minh bạch trong các trường hợp sau:
- **Thời hạn áp dụng**: Trong vòng **07 ngày** kể từ thời điểm giao dịch thanh toán nâng cấp gói thành công.
- **Điều kiện được hoàn tiền 100%**:
  - Dịch vụ phát sinh lỗi kỹ thuật nghiêm trọng từ phía hệ thống **TRANG CÁ NHÂN** dẫn đến khách hàng không thể sử dụng các tính năng cam kết của gói PRO/VIP và đội ngũ kỹ thuật không thể khắc phục trong vòng 48 giờ.
  - Khách hàng vô tình chuyển khoản trùng lặp nhiều lần cho cùng một gói dịch vụ.
- **Trường hợp không áp dụng hoàn tiền**:
  - Yêu cầu hoàn tiền gửi sau thời hạn 07 ngày kể từ ngày nâng cấp.
  - Tài khoản bị khóa hoặc tạm dừng do vi phạm nghiêm trọng Điều khoản sử dụng (đăng tải nội dung lừa đảo, cờ bạc, vi phạm pháp luật).
  - Khách hàng đổi ý không muốn sử dụng tiếp trong khi hệ thống vẫn đang hoạt động ổn định và bình thường.

---

### 5. Thời Gian & Phương Thức Hoàn Tiền
- **Phương thức hoàn tiền**: Chuyển khoản trực tiếp về số tài khoản ngân hàng chính chủ của khách hàng đã sử dụng để thanh toán.
- **Thời hạn xử lý**: Trong vòng **03 đến 05 ngày làm việc** kể từ thời điểm bộ phận chăm sóc khách hàng xác nhận yêu cầu hoàn tiền hợp lệ.
- **Kênh tiếp nhận yêu cầu hoàn tiền**: Gửi email về **thegioiadmin@gmail.com** hoặc gọi Hotline **0988 888 999** với tiêu đề: *Yêu cầu hoàn tiền - [Tên tài khoản / Mã giao dịch]*."}, {"id": "art_giai_quyet_khieu_nai", "slug": "giai-quyet-khieu-nai", "title": "Quy Trình Tiếp Nhận & Giải Quyết Khiếu Nại", "category": "Chính sách", "author": "Trung Tâm Chăm Sóc Khách Hàng", "summary": "Cơ chế tiếp nhận, thời hạn xác minh và quy trình giải quyết khiếu nại, tranh chấp phát sinh giữa người dùng và nền tảng theo quy định của pháp luật.", "coverImage": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-09-19", "isPublished": true, "views": 850, "content": "## ⚖️ QUY TRÌNH TIẾP NHẬN & GIẢI QUYẾT KHIẾU NẠI

**TRANG CÁ NHÂN** luôn coi trọng quyền lợi chính đáng của người sử dụng dịch vụ và khách hàng. Chúng tôi thiết lập quy trình tiếp nhận và giải quyết khiếu nại minh bạch, nhanh chóng và công bằng theo đúng quy định pháp luật thương mại điện tử Việt Nam.

---

### 1. Nguyên Tắc Giải Quyết Khiếu Nại & Tranh Chấp
- Mọi khiếu nại của người dùng đều được tiếp nhận và xử lý với tinh thần cầu thị, lắng nghe và tôn trọng.
- Ưu tiên phương thức **thương lượng, đối thoại và hòa giải** giữa các bên để đạt được sự đồng thuận tốt nhất.
- Trường hợp khiếu nại liên quan đến quyền lợi tài chính, thời gian kích hoạt gói hoặc an toàn dữ liệu, hệ thống cam kết xử lý ưu tiên khẩn cấp.

---

### 2. Các Kênh Tiếp Nhận Khiếu Nại Chính Thức
Người dùng có thể gửi khiếu nại qua một trong các kênh liên hệ sau:
- **Email tiếp nhận chuyên trách**: thegioiadmin@gmail.com / contact@trangcanhan.com
- **Đường dây nóng (Hotline)**: 0988 888 999 (Hoạt động từ 8h00 đến 21h00 hàng ngày)
- **Gửi phiếu hỗ trợ (Ticket)**: Trực tiếp tại mục Hỗ Trợ trong giao diện quản trị tài khoản người dùng.
- **Địa chỉ văn phòng**: Tầng 6, Tòa nhà Công Nghệ Số, TP. Hồ Chí Minh, Việt Nam.

---

### 3. Quy Trình 4 Bước Xử Lý Khiếu Nại
- **Bước 1: Tiếp nhận thông tin (Trong vòng 24 giờ làm việc)**
  Bộ phận Chăm sóc Khách hàng tiếp nhận khiếu nại, xác minh danh tính người gửi và phản hồi xác nhận đã nhận thông tin qua Email hoặc Tin nhắn SMS/Zalo.
- **Bước 2: Xác minh & Thẩm định (Trong vòng 24 - 48 giờ làm việc)**
  Bộ phận chuyên trách phối hợp cùng Kỹ thuật/Tài chính kiểm tra lịch sử thao tác hệ thống, dữ liệu nhật ký máy chủ và đối chiếu các bằng chứng liên quan.
- **Bước 3: Đưa ra giải pháp & Phản hồi (Tối đa 03 ngày làm việc)**
  Gửi văn bản/email phản hồi chính thức cho khách hàng, nêu rõ nguyên nhân và phương án giải quyết (khắc phục kỹ thuật, gia hạn thời gian sử dụng dịch vụ hoặc hoàn tiền theo Chính sách thanh toán).
- **Bước 4: Hoàn tất & Đóng hồ sơ**
  Thực hiện biện pháp khắc phục đã thỏa thuận và ghi nhận đánh giá hài lòng của khách hàng để cải tiến chất lượng hệ thống.

---

### 4. Cơ Chế Xử Lý Tranh Chấp Phát Sinh
- Trong trường hợp bất đồng ý kiến không thể giải quyết thông qua thương lượng hoặc hòa giải, một trong hai bên có quyền đưa vụ việc ra Tòa án nhân dân có thẩm quyền tại Việt Nam để giải quyết theo quy định của pháp luật.
- Phán quyết của Tòa án là quyết định cuối cùng và có hiệu lực thi hành bắt buộc đối với cả hai bên."}, {"id": "art_quy_che_hoat_dong", "slug": "quy-che-hoat-dong", "title": "Quy Chế Hoạt Động Nền Tảng", "category": "Chính sách", "author": "Ban Quản Trị TRANG CÁ NHÂN", "summary": "Quy chế quản lý, vận hành và cung cấp dịch vụ trực tuyến tại TRANG CÁ NHÂN, đáp ứng quy chuẩn thông báo website với Bộ Công Thương.", "coverImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop", "publishedAt": "2026-01-01", "updatedAt": "2026-09-19", "isPublished": true, "views": 920, "content": "## 📋 QUY CHẾ HOẠT ĐỘNG NỀN TẢNG

Quy chế hoạt động này quy định các nguyên tắc, quyền hạn và trách nhiệm trong việc quản lý, vận hành và cung ứng dịch vụ trực tuyến trên website **TRANG CÁ NHÂN**, phục vụ cho việc thông báo hoạt động website cung cấp dịch vụ thương mại điện tử với Bộ Công Thương Việt Nam.

---

### 1. Nguyên Tắc Hoạt Động Chung
- Nền tảng **TRANG CÁ NHÂN** hoạt động tuân thủ nghiêm túc các quy định của pháp luật Việt Nam về thương mại điện tử, an toàn thông tin mạng và bảo vệ quyền lợi người tiêu dùng.
- Hoạt động cung cấp dịch vụ được thực hiện công khai, minh bạch, bảo đảm quyền lợi chính đáng của mọi thành viên tham gia.
- Mọi cá nhân, tổ chức đều có quyền đăng ký tài khoản và sử dụng các tính năng miễn phí hoặc trả phí theo đúng quy chế này.

---

### 2. Quy Trình Cung Cấp & Sử Dụng Dịch Vụ
- **Bước 1: Đăng ký tài khoản**
  Người dùng điền thông tin email, mật khẩu để khởi tạo tài khoản miễn phí trên hệ thống.
- **Bước 2: Thiết lập trang Bio liên kết**
  Thành viên tự do tùy chỉnh giao diện, thêm các liên kết mạng xã hội, thẻ danh bạ vCard, mã VietQR nhận tiền, hình ảnh và nội dung giới thiệu cá nhân.
- **Bước 3: Lựa chọn gói dịch vụ**
  Người dùng có thể duy trì sử dụng gói Miễn phí (Free) hoặc nâng cấp lên các gói nâng cao (PRO, VIP) để mở rộng tính năng và gắn tên miền riêng.
- **Bước 4: Xuất bản và chia sẻ**
  Hệ thống cấp phát đường dẫn trực tuyến duy nhất dạng trangcanhan.com/username để thành viên gắn lên các nền tảng mạng xã hội hoặc in trên danh thiếp.

---

### 3. Cơ Chế Kiểm Soát Nội Dung & Phòng Chống Gian Lận
- Hệ thống áp dụng công cụ lọc tự động và đội ngũ kiểm duyệt viên định kỳ rà soát các trang Bio được xuất bản công khai.
- **Biện pháp xử lý**: Ngay khi phát hiện trang cá nhân chứa nội dung độc hại, lừa đảo, cờ bạc, vi phạm bản quyền hoặc nhận được phản ánh hợp lệ từ cơ quan chức năng, Ban quản trị sẽ tiến hành tạm khóa hoặc xóa vĩnh viễn trang vi phạm trong vòng 04 giờ.

---

### 4. An Toàn Thông Tin & Lưu Trữ Dữ Liệu
- Hệ thống lưu trữ dữ liệu trên nền tảng đám mây đạt tiêu chuẩn bảo mật cao, có cơ chế sao lưu tự động hàng ngày để phòng ngừa rủi ro mất mát dữ liệu.
- Mọi thông tin cá nhân và dữ liệu cấu hình của người dùng được bảo mật tuyệt đối theo Chính sách bảo mật thông tin đã công bố.

---

### 5. Hiệu Lực Và Sửa Đổi Quy Chế
- Quy chế này có hiệu lực kể từ ngày được đăng tải chính thức trên website **TRANG CÁ NHÂN**.
- Ban quản lý có quyền sửa đổi, bổ sung quy chế để đáp ứng các yêu cầu quản lý thực tế và quy định pháp luật mới của Nhà nước. Nội dung sửa đổi sẽ được thông báo trước ít nhất 05 ngày trên website trước khi áp dụng."}], "footerConfig": {"brandName": "TRANG CÁ NHÂN", "brandLink": "http://trangcanhan.com", "brandTagline": "Nền tảng tạo TRANG CÁ NHÂN #1 tại Việt Nam.
Giúp bạn kết nối tất cả liên kết trong một trang duy nhất.", "copyrightText": "© 2026 TRANG CÁ NHÂN. Tất cả quyền được bảo lưu.", "copyrightLink": "http://trangcanhan.com", "madeWithText": "Made with ❤️ Thế giới Admin", "madeWithLink": "https://facebook.com/thegioieditor", "govCertification": {"enabled": true, "imageUrl": "/bo-cong-thuong.svg", "targetUrl": "http://online.gov.vn/", "altText": "Đã thông báo Bộ Công Thương", "width": 140}, "columns": [{"id": "col_products", "title": "SẢN PHẨM", "links": [{"id": "p1", "label": "Tính năng nổi bật", "url": "#features-section"}, {"id": "p2", "label": "Kho mẫu giao diện", "url": "#templates-showcase"}, {"id": "p3", "label": "Bảng giá dịch vụ", "url": "#pricing-section"}, {"id": "p4", "label": "Tên miền riêng", "url": "#domains-section"}]}, {"id": "col_policies", "title": "CHÍNH SÁCH", "links": [{"id": "pol_1", "label": "Điều khoản sử dụng", "url": "/dieu-khoan", "articleSlug": "dieu-khoan"}, {"id": "pol_2", "label": "Chính sách bảo mật", "url": "/chinh-sach", "articleSlug": "chinh-sach"}, {"id": "pol_3", "label": "Thanh toán & Hoàn tiền", "url": "/chinh-sach-thanh-toan", "articleSlug": "chinh-sach-thanh-toan"}, {"id": "pol_4", "label": "Giải quyết khiếu nại", "url": "/giai-quyet-khieu-nai", "articleSlug": "giai-quyet-khieu-nai"}, {"id": "pol_5", "label": "Quy chế hoạt động", "url": "/quy-che-hoat-dong", "articleSlug": "quy-che-hoat-dong"}]}, {"id": "col_company", "title": "CÔNG TY", "links": [{"id": "c1", "label": "Về chúng tôi", "url": "/gioi-thieu", "articleSlug": "gioi-thieu"}, {"id": "c2", "label": "Hướng dẫn sử dụng", "url": "/huong-dan-tong-quan-a-den-z", "articleSlug": "huong-dan-tong-quan-a-den-z"}, {"id": "c3", "label": "FAQ (Hỏi & Đáp)", "url": "#faq"}, {"id": "c4", "label": "Liên hệ hỗ trợ", "url": "/lien-he", "articleSlug": "lien-he"}]}], "socialLinks": {"facebook": "https://facebook.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com", "tiktok": "https://tiktok.com", "email": "contact@trangcanhan.com"}}, "pricingPlans": [{"id": "free", "name": "Gói Miễn Phí (Free)", "priceMonth": 0, "price6Months": 0, "priceYear": 0, "description": "Dành cho cá nhân muốn tạo trang liên kết cá nhân đơn giản, tinh tế và hoàn toàn miễn phí.", "features": [{"text": "Thông tin cá nhân, hồ sơ & Mạng xã hội chuyên nghiệp", "included": true}, {"text": "Kho mẫu giao diện Free tinh tế & chuẩn di động", "included": true}, {"text": "Thẻ Danh Bạ Điện Tử & vCard chuẩn", "included": true}, {"text": "Thống kê lượt xem & truy cập cơ bản", "included": true}, {"text": "Thêm Khối nội dung (Link, Video, VietQR, Shop): Cần nâng cấp Pro/VIP", "included": false}, {"text": "Tích Xanh Xác Minh (Meta / TikTok): Cần nâng cấp Pro/VIP", "included": false}, {"text": "Khiên bảo vệ Avatar chống sao chép: Cần nâng cấp Pro/VIP", "included": false}, {"text": "Nút Hotline nổi chân trang (5 hiệu ứng): Cần nâng cấp Pro/VIP", "included": false}, {"text": "Tên miền riêng (Custom Domain) kèm SSL: Cần nâng cấp Pro/VIP", "included": false}, {"text": "Ẩn bản quyền chân trang \"TRANG CÁ NHÂN\": Cần nâng cấp Pro/VIP", "included": false}]}, {"id": "pro", "name": "Gói Nâng Cao (PRO) ⭐", "priceMonth": 55000, "price6Months": 300000, "priceYear": 550000, "popular": true, "badge": "PHỔ BIẾN NHẤT", "description": "Lựa chọn tốt nhất cho KOL, Creator, Freelancer & Shop bán hàng muốn xây dựng thương hiệu uy tín.", "features": [{"text": "Bao gồm toàn bộ tính năng của Gói Miễn Phí", "included": true}, {"text": "Mở khóa tính năng thêm khối nội dung (Link, YouTube, Spotify, VietQR...)", "included": true}, {"text": "Mở khóa hơn 175+ Mẫu giao diện PRO & Free đỉnh cao", "included": true}, {"text": "Huy hiệu Tích Xanh Đã Xác Minh chuẩn Meta", "included": true}, {"text": "Khiên bảo vệ Avatar chống chụp & sao chép ảnh", "included": true}, {"text": "Nút Hotline nổi tròn chân trang (5 kiểu sóng động)", "included": true}, {"text": "Khối VietQR nhận Donate & Chuyển khoản tự động", "included": true}, {"text": "Khối Video YouTube & Nhạc Spotify nhúng trực tiếp", "included": true}, {"text": "Gắn Tên miền riêng (Custom Domain) kèm SSL miễn phí", "included": true}, {"text": "Ẩn 100% bản quyền chân trang / Tùy biến thương hiệu", "included": true}, {"text": "Tích hợp mã đo lường Google Analytics (GA4)", "included": true}, {"text": "Khối Gian hàng Sản phẩm VIP & E-Commerce: Gói VIP", "included": false}]}, {"id": "vip", "name": "Gói Doanh Nghiệp (VIP) 👑", "priceMonth": 250000, "price6Months": 1350000, "priceYear": 2400000, "badge": "DOANH NGHIỆP", "description": "Dành cho thương hiệu, công ty và doanh nghiệp cần giải pháp toàn diện, E-Commerce & hỗ trợ chuyên biệt.", "features": [{"text": "Đầy đủ toàn bộ đặc quyền của gói PRO", "included": true}, {"text": "Mở khóa không giới hạn MỌI loại khối nội dung (Shop, FAQ, Banner...)", "included": true}, {"text": "Mở khóa trọn bộ 250+ Mẫu Giao Diện VIP & Độc Quyền", "included": true}, {"text": "Khối Gian hàng Sản phẩm E-Commerce (Giá ưu đãi & Mua ngay)", "included": true}, {"text": "Khối FAQ Hỏi Đáp & Banner hình ảnh quảng cáo cao cấp", "included": true}, {"text": "Tích Xanh VIP & Khiên bảo vệ cao cấp chống sao chép", "included": true}, {"text": "Nút Hotline nổi tròn chân trang đa phong cách", "included": true}, {"text": "Gắn đa tên miền riêng & tùy biến SEO Meta OG nâng cao", "included": true}, {"text": "Hiệu ứng phát sáng Neon, Gradient 3D & Animation độc quyền", "included": true}, {"text": "Ưu tiên hỗ trợ kỹ thuật riêng 1:1 qua CSKH & Ticket", "included": true}]}], "homepageSections": {"hero": {"enabled": true, "badgeText": "NỀN TẢNG BIO LINK #1 VIỆT NAM", "headingLine1": "Tất cả liên kết của bạn", "headingHighlight": "trong một link duy nhất", "headingLine2": "Đơn giản, chuyên nghiệp và miễn phí.", "description": "Tạo trang bio cá nhân đẹp mắt trong 30 giây. Kết nối mạng xã hội, chia sẻ nội dung, bán hàng và nhận thanh toán tự động VietQR.", "bulletPoints": ["Không cần kỹ năng lập trình", "Tùy biến dễ dàng, giao diện đẹp", "Theo dõi lượt nhấp chi tiết"], "primaryCtaText": "Tạo trang miễn phí", "secondaryCtaText": "Xem mẫu đẹp", "usersCountText": "Hơn 50,000+ người dùng", "clicksCountText": "đã tin tưởng TRANG CÁ NHÂN", "showPreviewCards": true}, "brands": {"enabled": true, "title": "ĐƯỢC TIN DÙNG BỞI CÁC CÁ NHÂN VÀ THƯƠNG HIỆU HÀNG ĐẦU", "brands": [{"id": "b_tiktok", "name": "TikTok", "iconType": "tiktok"}, {"id": "b_instagram", "name": "Instagram", "iconType": "instagram"}, {"id": "b_youtube", "name": "YouTube", "iconType": "youtube"}, {"id": "b_facebook", "name": "Facebook", "iconType": "facebook"}, {"id": "b_shopee", "name": "Shopee", "iconType": "shopee"}, {"id": "b_tiki", "name": "Tiki", "iconType": "custom", "customIcon": "🛍️"}, {"id": "b_lazada", "name": "Lazada", "iconType": "custom", "customIcon": "🛒"}]}, "features": {"enabled": true, "badge": "TÍNH NĂNG NỔI BẬT", "title": "Tất cả những gì bạn cần", "titleHighlight": "để nổi bật", "features": [{"id": "feat_1", "icon": "link", "title": "Tập hợp mọi liên kết", "description": "Facebook, TikTok, Instagram, YouTube, Shopee và hơn 30+ mạng xã hội khác chỉ trong 1 chạm.", "color": "indigo"}, {"id": "feat_2", "icon": "palette", "title": "Tùy biến giao diện chuyên sâu", "description": "Hàng trăm màu sắc, font chữ chuẩn tiếng Việt, hiệu ứng kính mờ glassmorphism và gradient sang trọng.", "color": "purple"}, {"id": "feat_3", "icon": "chart", "title": "Thống kê truy cập chi tiết", "description": "Nắm bắt chính xác lượt xem, lượt nhấp chuột theo ngày, thiết bị truy cập và link hiệu quả nhất.", "color": "emerald"}, {"id": "feat_4", "icon": "shield", "title": "Tích xanh uy tín & Tên miền riêng", "description": "Gắn tên miền của bạn (tenban.com), huy hiệu tích xanh xác minh chính chủ tăng 300% độ tin cậy.", "color": "blue"}], "showAnalyticsMockup": true, "mockupDomain": "trangcanhan.com/linhchi", "mockupViews": "45,820", "mockupClicks": "112,450", "mockupCtr": "24.5%", "mockupAvg": "2.45"}, "templates": {"enabled": true, "badge": "KHO GIAO DIỆN", "title": "Chọn mẫu phù hợp với bạn", "description": "Hơn 50+ mẫu chuẩn phong cách thực tế, sẵn sàng áp dụng chỉ trong 1 chạm", "exploreAllText": "Khám Phá Tất Cả Mẫu Giao Diện"}, "pricing": {"enabled": true, "badge": "BẢNG GIÁ MINH BẠCH", "title": "Gói Dịch Vụ Phù Hợp Cho", "titleHighlight": "Mọi Nhu Cầu", "description": "Bắt đầu miễn phí trọn đời hoặc nâng cấp gói PRO/VIP để mở khóa tên miền riêng và tính năng cao cấp.", "ctaText": "Xem chi tiết bảng giá"}, "ctaBanner": {"enabled": true, "title": "Sẵn sàng tạo TRANG CÁ NHÂN của riêng bạn?", "description": "Tham gia cùng hàng ngàn người dùng đã tạo TRANG CÁ NHÂN chuyên nghiệp và phát triển thương hiệu cá nhân.", "primaryButtonText": "Đăng ký ngay", "secondaryButtonText": "Xem bảng giá"}, "faq": {"enabled": true, "badge": "HỖ TRỢ & GIẢI ĐÁP", "title": "Câu hỏi thường gặp", "description": "Giải đáp nhanh các thắc mắc về cách tạo trang bio, nâng cấp gói và tên miền riêng.", "faqs": [{"id": "faq_1", "question": "Tạo trang bio trên TRANG CÁ NHÂN có thực sự miễn phí không?", "answer": "Hoàn toàn miễn phí! Gói Free cung cấp đầy đủ liên kết không giới hạn, các mẫu giao diện cơ bản và theo dõi thống kê truy cập cơ bản trọn đời."}, {"id": "faq_2", "question": "Tôi có thể gắn tên miền riêng (ví dụ: tenban.com) không?", "answer": "Có! Với gói PRO và VIP, bạn có thể dễ dàng trỏ tên miền cá nhân về hệ thống thông qua bản ghi CNAME đơn giản chỉ trong vài phút."}, {"id": "faq_3", "question": "Làm thế nào để nhận tích xanh xác minh chính chủ?", "answer": "Tài khoản gói PRO và VIP có thể gửi hồ sơ xác minh danh tính (KYC) để nhận huy hiệu tích xanh xác minh chính chủ ngay trên trang bio của mình."}, {"id": "faq_4", "question": "Hệ thống hỗ trợ nạp tiền và nâng cấp tự động qua đâu?", "answer": "Hệ thống tích hợp cổng thanh toán VietQR tự động 24/7. Bạn chỉ cần quét mã QR chuyển khoản, gói cước hoặc số dư ví sẽ được kích hoạt ngay lập tức sau 3-5 giây."}]}}, "googleAuthEnabled": false, "facebookAuthEnabled": false, "googleClientId": "", "facebookAppId": ""}', NOW())
ON DUPLICATE KEY UPDATE
  `config` = VALUES(`config`),
  `updated_at` = NOW();

SET FOREIGN_KEY_CHECKS = 1;
