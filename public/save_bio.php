<?php
/**
 * API: Lưu cấu hình trang Bio người dùng vào MySQL / phpMyAdmin
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$username = strtolower(trim($payload['username'] ?? $payload['config']['username'] ?? ''));
$config = $payload['config'] ?? $payload['bio'] ?? $payload;

if (empty($username)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu thông tin username để lưu bio!'], 400);
}

// Luôn đảm bảo khối thẻ danh bạ (contact_card) nằm ở vị trí đầu tiên (index 0)
if (isset($config['blocks']) && is_array($config['blocks'])) {
    $contactBlock = null;
    $otherBlocks = [];
    foreach ($config['blocks'] as $b) {
        if (isset($b['type']) && $b['type'] === 'contact_card' && $contactBlock === null) {
            $contactBlock = $b;
        } else {
            $otherBlocks[] = $b;
        }
    }
    if (!$contactBlock) {
        $contactBlock = [
            'id' => 'blk_contact_' . time(),
            'type' => 'contact_card',
            'enabled' => true,
            'order' => 1,
            'phone' => $config['profile']['phone'] ?? '',
            'email' => $config['profile']['email'] ?? '',
            'jobTitle' => $config['profile']['jobTitle'] ?? 'Liên hệ & Hợp tác',
            'workplace' => $config['profile']['workplace'] ?? '',
            'vCardEnabled' => true
        ];
    }
    $contactBlock['order'] = 1;
    $sortedBlocks = [$contactBlock];
    $orderIndex = 2;
    foreach ($otherBlocks as $ob) {
        $ob['order'] = $orderIndex++;
        $sortedBlocks[] = $ob;
    }
    $config['blocks'] = $sortedBlocks;
}

$pdo = getPDO();

if ($pdo) {
    $configJson = json_encode($config, JSON_UNESCAPED_UNICODE);

    // 1. Lưu vào bảng bios
    $stmt = $pdo->prepare("
        INSERT INTO bios (username, config, created_at, updated_at) 
        VALUES (:u, :c, NOW(), NOW()) 
        ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()
    ");
    $stmt->execute(['u' => $username, 'c' => $configJson, 'c2' => $configJson]);

    // 2. Đồng bộ displayName, avatarUrl vào bảng users nếu có
    if (!empty($config['profile'])) {
        $profile = $config['profile'];
        $userUpdates = [];
        $params = ['u' => $username];

        if (!empty($profile['displayName'])) {
            $userUpdates[] = 'name = :name';
            $params['name'] = $profile['displayName'];
        }
        if (!empty($profile['avatarUrl'])) {
            $userUpdates[] = 'avatar_url = :avatar_url';
            $params['avatar_url'] = $profile['avatarUrl'];
        }
        if (!empty($profile['phone'])) {
            $userUpdates[] = 'phone = :phone';
            $params['phone'] = $profile['phone'];
        }

        if (!empty($userUpdates)) {
            $sql = "UPDATE users SET " . implode(', ', $userUpdates) . ", updated_at = NOW() WHERE LOWER(username) = :u";
            $updateUserStmt = $pdo->prepare($sql);
            $updateUserStmt->execute($params);
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu cấu hình trang bio thành công vào cơ sở dữ liệu!',
        'bio' => $config
    ]);
} else {
    $db = readJsonDatabase();
    $db['bios'][$username] = $config;

    foreach ($db['users'] as $i => $u) {
        if (strtolower($u['username']) === $username) {
            if (!empty($config['profile']['displayName'])) $db['users'][$i]['name'] = $config['profile']['displayName'];
            if (!empty($config['profile']['avatarUrl'])) $db['users'][$i]['avatarUrl'] = $config['profile']['avatarUrl'];
            break;
        }
    }

    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu cấu hình bio thành công!',
        'bio' => $config
    ]);
}
