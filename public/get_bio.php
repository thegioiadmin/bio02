<?php
/**
 * API: Lấy dữ liệu cấu hình trang Bio của người dùng từ MySQL
 */
require_once __DIR__ . '/db.php';

$username = strtolower(trim($_GET['u'] ?? $_GET['username'] ?? ''));
if (empty($username)) {
    $payload = getRequestJson();
    $username = strtolower(trim($payload['username'] ?? ''));
}

if (empty($username)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu tham số username!'], 400);
}

$pdo = getPDO();

if ($pdo) {
    // 1. Tìm user
    $stmtUser = $pdo->prepare("SELECT * FROM users WHERE LOWER(username) = :u LIMIT 1");
    $stmtUser->execute(['u' => $username]);
    $userRow = $stmtUser->fetch();

    // 2. Tìm bio
    $stmtBio = $pdo->prepare("SELECT * FROM bios WHERE LOWER(username) = :u LIMIT 1");
    $stmtBio->execute(['u' => $username]);
    $bioRow = $stmtBio->fetch();

    if (!$userRow && !$bioRow) {
        sendJsonResponse([
            'status' => 'error',
            'notFound' => true,
            'message' => "Trang cá nhân '@{$username}' không tồn tại hoặc đã bị gỡ bỏ."
        ], 404);
    }

    $bioConfig = null;
    if ($bioRow && !empty($bioRow['config'])) {
        $bioConfig = json_decode($bioRow['config'], true);
    }

    if (!$bioConfig && $userRow) {
        $displayName = $userRow['name'] ?: $userRow['username'];
        $bioConfig = [
            'username' => $userRow['username'],
            'profile' => [
                'displayName' => $displayName,
                'bio' => $userRow['account_type'] === 'business' ? 'Chào mừng bạn đến với trang chính thức của chúng tôi!' : 'Xin chào! Chào mừng đến với trang cá nhân của tôi.',
                'avatarUrl' => $userRow['avatar_url'] ?: "https://api.dicebear.com/7.x/bottts/svg?seed={$userRow['username']}",
                'verifiedBadge' => !empty($userRow['verified']),
            ],
            'theme' => [
                'id' => 'cyber-dark',
                'name' => 'Cyberpunk Neon',
                'bgType' => 'gradient',
                'bgColor' => '#09090b',
                'bgGradient' => ['from' => '#09090b', 'via' => '#180e29', 'to' => '#0f172a', 'direction' => 'to-b'],
                'fontFamily' => 'Plus Jakarta Sans',
                'textColor' => '#f8fafc',
                'accentColor' => '#8b5cf6',
                'cardStyle' => 'glass',
                'cardBgColor' => 'rgba(30, 27, 75, 0.55)',
                'cardTextColor' => '#ffffff',
                'cardBorderColor' => 'rgba(139, 92, 246, 0.4)',
                'buttonShape' => 'rounded-xl',
                'avatarShape' => 'circle'
            ],
            'socialLinks' => !empty($userRow['phone']) ? [
                ['id' => '1', 'platform' => 'zalo', 'url' => "https://zalo.me/" . preg_replace('/[\s.-]/', '', $userRow['phone']), 'active' => true, 'label' => 'Zalo']
            ] : [],
            'blocks' => [
                [
                    'id' => 'blk_' . time() . '_contact',
                    'type' => 'contact_card',
                    'enabled' => true,
                    'order' => 1,
                    'jobTitle' => $userRow['account_type'] === 'business' ? ($userRow['industry'] ?: 'Doanh Nghiệp & Dịch Vụ') : 'Liên hệ & Hợp tác',
                    'workplace' => $userRow['business_name'] ?: '',
                    'phone' => $userRow['phone'] ?: '0988 889 999',
                    'email' => $userRow['email'] ?: "{$userRow['username']}@trangcanhan.com",
                    'zalo' => preg_replace('/[\s.-]/', '', $userRow['phone'] ?: '0988889999'),
                    'vCardEnabled' => true
                ]
            ],
            'seo' => [
                'title' => "{$displayName} | TRANG CÁ NHÂN",
                'description' => "Khám phá TRANG CÁ NHÂN chính thức của {$displayName}",
                'hideWatermark' => !empty($userRow['verified']) || $userRow['plan'] === 'vip' || $userRow['plan'] === 'pro'
            ]
        ];

        // Lưu vào MySQL
        $ins = $pdo->prepare("INSERT INTO bios (username, config, created_at, updated_at) VALUES (:u, :c, NOW(), NOW()) ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()");
        $cJson = json_encode($bioConfig, JSON_UNESCAPED_UNICODE);
        $ins->execute(['u' => $username, 'c' => $cJson, 'c2' => $cJson]);
    }

    if ($userRow) {
        // Kiểm tra xem gói cước trả phí có bị hết hạn hay không
        $isExpired = false;
        if ($userRow['plan'] !== 'free' && !empty($userRow['plan_expires_at'])) {
            $expireTs = strtotime($userRow['plan_expires_at']);
            if ($expireTs > 0 && $expireTs < time()) {
                $isExpired = true;
                // Cập nhật trạng thái hạ về Free trong bảng users
                $upStmt = $pdo->prepare("UPDATE users SET plan = 'free', verified = 0, updated_at = NOW() WHERE id = :id");
                $upStmt->execute(['id' => $userRow['id']]);
                $userRow['plan'] = 'free';
                $userRow['verified'] = 0;
            }
        }

        // Cập nhật trạng thái verified / watermark theo gói cước nhưng luôn giữ nguyên 100% cấu trúc các khối (blocks) của mẫu giao diện
        if ($bioConfig && isset($bioConfig['profile'])) {
            $isPaid = ($userRow['plan'] === 'pro' || $userRow['plan'] === 'vip') && !$isExpired;
            $isVip = ($userRow['plan'] === 'vip' || $userRow['role'] === 'admin') && !$isExpired;
            if (!$isPaid) {
                $bioConfig['profile']['verifiedBadge'] = false;
                $bioConfig['profile']['avatarShield'] = false;
            }
            if (!$isPaid && isset($bioConfig['seo'])) {
                $bioConfig['seo']['hideWatermark'] = false;
            }
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'user' => $userRow ? normalizeUserFromDb($userRow) : null,
        'bio' => $bioConfig,
        'config' => $bioConfig
    ]);
} else {
    $db = readJsonDatabase();
    $bio = $db['bios'][$username] ?? null;
    $user = null;
    foreach ($db['users'] as $u) {
        if (strtolower($u['username']) === $username) {
            $user = $u;
            break;
        }
    }

    if (!$user && !$bio) {
        sendJsonResponse(['status' => 'error', 'notFound' => true, 'message' => 'Trang bio không tồn tại'], 404);
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'user' => $user,
        'bio' => $bio,
        'config' => $bio
    ]);
}
