<?php
/**
 * API: Đăng ký tài khoản người dùng mới (Lưu trực tiếp vào MySQL / phpMyAdmin)
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$username = trim($payload['username'] ?? '');
$password = trim($payload['password'] ?? $payload['pass'] ?? '');
$name = trim($payload['name'] ?? '');
$phone = trim($payload['phone'] ?? $payload['phoneInput'] ?? '');
$email = trim($payload['email'] ?? '');
$accountType = $payload['account_type'] ?? $payload['accountType'] ?? 'personal';
$businessName = trim($payload['business_name'] ?? $payload['businessName'] ?? '');
$taxCode = trim($payload['tax_code'] ?? $payload['taxCode'] ?? '');
$industry = trim($payload['industry'] ?? '');

if (empty($username) || empty($password)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu!'], 400);
}

$cleanUsername = strtolower(preg_replace('/[^a-z0-9_-]/i', '', $username));
if (strlen($cleanUsername) < 3) {
    sendJsonResponse(['status' => 'error', 'message' => 'Tên định danh (username) phải có tối thiểu 3 ký tự!'], 400);
}

$cleanPhone = preg_replace('/[\s.-]/', '', $phone);
$cleanEmail = !empty($email) && strpos($email, '@') !== false ? strtolower($email) : ($cleanPhone ? "{$cleanPhone}@trangcanhan.com" : "{$cleanUsername}@trangcanhan.com");
$isTargetAdmin = (strpos($cleanEmail, 'admin') !== false || strpos($cleanUsername, 'admin') !== false);
$displayName = !empty($name) ? $name : ($accountType === 'business' && !empty($businessName) ? $businessName : $cleanUsername);
$userId = 'usr_' . time() . '_' . substr(md5(uniqid()), 0, 5);

$avatarUrl = $accountType === 'business'
    ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop'
    : "https://api.dicebear.com/7.x/bottts/svg?seed={$cleanUsername}";

$pdo = getPDO();

if ($pdo) {
    // 0. Check system maintenance mode
    try {
        $cfgStmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
        if ($cfgStmt) {
            $cfgRow = $cfgStmt->fetch();
            if ($cfgRow && !empty($cfgRow['config'])) {
                $sysCfg = json_decode($cfgRow['config'], true);
                if (!empty($sysCfg['maintenanceConfig']['globalMaintenance']) || !empty($sysCfg['maintenanceMode'])) {
                    sendJsonResponse(['status' => 'error', 'message' => 'Hệ thống đang trong quá trình bảo trì nâng cấp máy chủ. Vui lòng quay lại sau ít phút!'], 503);
                }
                if (!empty($sysCfg['maintenanceConfig']['modules']['user_register']['isUnderMaintenance'])) {
                    $mMsg = $sysCfg['maintenanceConfig']['modules']['user_register']['maintenanceMessage'] ?? 'Hệ thống đang tạm ngừng tiếp nhận đăng ký mới để nâng cấp.';
                    sendJsonResponse(['status' => 'error', 'message' => $mMsg], 503);
                }
            }
        }
    } catch (Exception $e) {}

    // 1. Check duplicate username or phone or email
    $stmt = $pdo->prepare("SELECT id, username, phone, email FROM users WHERE username = :u OR (phone != '' AND phone = :p) OR (email != '' AND email = :e) LIMIT 1");
    $stmt->execute(['u' => $cleanUsername, 'p' => $cleanPhone, 'e' => $cleanEmail]);
    $exist = $stmt->fetch();

    if ($exist) {
        if (strtolower($exist['username']) === $cleanUsername) {
            sendJsonResponse(['status' => 'error', 'message' => "Tên định danh '@{$cleanUsername}' đã có người sử dụng!"], 400);
        }
        if (!empty($cleanPhone) && $exist['phone'] === $cleanPhone) {
            sendJsonResponse(['status' => 'error', 'message' => "Số điện thoại '{$phone}' đã được đăng ký trong hệ thống!"], 400);
        }
        sendJsonResponse(['status' => 'error', 'message' => "Email '{$cleanEmail}' đã được liên kết với một tài khoản khác!"], 400);
    }

    // 2. Insert into MySQL `users` table safely
    $userRecord = upsertUserInDatabase($pdo, [
        'id' => $userId,
        'username' => $cleanUsername,
        'password' => $password,
        'email' => $cleanEmail,
        'phone' => $cleanPhone,
        'name' => $displayName,
        'avatar_url' => $avatarUrl,
        'avatarUrl' => $avatarUrl,
        'role' => $isTargetAdmin ? 'admin' : 'user',
        'plan' => $isTargetAdmin ? 'vip' : 'free',
        'verified' => $isTargetAdmin ? 1 : 0,
        'balance' => 0,
        'account_type' => $accountType,
        'business_name' => $businessName,
        'tax_code' => $taxCode,
        'industry' => $industry
    ]);

    // 3. Create default Bio in `bios` table
    $defaultBio = [
        'username' => $cleanUsername,
        'profile' => [
            'displayName' => $displayName,
            'bio' => $accountType === 'business' ? 'Chào mừng bạn đến với trang chính thức của chúng tôi!' : 'Xin chào! Chào mừng đến với trang cá nhân của tôi.',
            'avatarUrl' => $avatarUrl,
            'verifiedBadge' => $isTargetAdmin,
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
        'socialLinks' => !empty($cleanPhone) ? [
            ['id' => '1', 'platform' => 'zalo', 'url' => "https://zalo.me/{$cleanPhone}", 'active' => true, 'label' => 'Zalo']
        ] : [],
        'blocks' => [
            [
                'id' => 'blk_' . time() . '_contact',
                'type' => 'contact_card',
                'enabled' => true,
                'order' => 1,
                'jobTitle' => $accountType === 'business' ? ($industry ?: 'Doanh Nghiệp & Dịch Vụ') : 'Liên hệ & Hợp tác',
                'workplace' => $businessName,
                'phone' => $phone ?: '0988 889 999',
                'email' => $cleanEmail,
                'zalo' => $cleanPhone ?: '0988889999',
                'vCardEnabled' => true
            ]
        ],
        'seo' => [
            'title' => "{$displayName} | TRANG CÁ NHÂN",
            'description' => "Khám phá TRANG CÁ NHÂN chính thức của {$displayName}",
            'hideWatermark' => $isTargetAdmin
        ],
        'createdAt' => date('Y-m-d H:i:s'),
        'updatedAt' => date('Y-m-d H:i:s')
    ];

    $insertBio = $pdo->prepare("INSERT INTO bios (username, config, created_at, updated_at) VALUES (:u, :c, NOW(), NOW()) ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()");
    $bioJson = json_encode($defaultBio, JSON_UNESCAPED_UNICODE);
    $insertBio->execute(['u' => $cleanUsername, 'c' => $bioJson, 'c2' => $bioJson]);

    // Fetch created user
    $stmtFetch = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmtFetch->execute(['id' => $userId]);
    $createdRow = $stmtFetch->fetch();

    $normalizedUser = normalizeUserFromDb($createdRow);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đăng ký tài khoản thành công! Dữ liệu đã được ghi nhận vào cơ sở dữ liệu MySQL.',
        'user' => $normalizedUser
    ]);
} else {
    // Fallback: JSON File
    $db = readJsonDatabase();
    foreach ($db['users'] as $u) {
        if (strtolower($u['username']) === $cleanUsername) {
            sendJsonResponse(['status' => 'error', 'message' => "Tên định danh '@{$cleanUsername}' đã có người sử dụng!"], 400);
        }
    }

    $newUser = [
        'id' => $userId,
        'username' => $cleanUsername,
        'email' => $cleanEmail,
        'phone' => $cleanPhone,
        'name' => $displayName,
        'avatarUrl' => $avatarUrl,
        'role' => $isTargetAdmin ? 'admin' : 'user',
        'status' => 'active',
        'plan' => $isTargetAdmin ? 'vip' : 'free',
        'verified' => $isTargetAdmin,
        'balance' => $isTargetAdmin ? 5000000 : 0,
        'accountType' => $accountType,
        'businessName' => $businessName,
        'taxCode' => $taxCode,
        'industry' => $industry,
        'bioCount' => 1,
        'totalViews' => 0,
        'createdAt' => date('Y-m-d H:i:s')
    ];

    $db['users'][] = $newUser;
    $db['passwords'][$cleanUsername] = $password;
    $db['passwords'][$cleanEmail] = $password;
    if ($cleanPhone) $db['passwords'][$cleanPhone] = $password;
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đăng ký tài khoản thành công!',
        'user' => $newUser
    ]);
}
