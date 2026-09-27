<?php
/**
 * API: Tải lên hình ảnh (Avatar, Logo, Banner, Ảnh xác minh) vào thư mục uploads/ trên Hosting
 */
require_once __DIR__ . '/db.php';

$uploadDir = __DIR__ . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$fileUrl = '';
$payload = getRequestJson();
$imageData = $payload['image'] ?? $payload['dataUrl'] ?? $payload['file'] ?? '';
$customFilename = $payload['filename'] ?? '';
$type = $payload['type'] ?? 'img';

if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['file']['tmp_name'];
    $origName = basename($_FILES['file']['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'])) {
        $newName = "{$type}_" . time() . "_{$origName}";
        $dest = $uploadDir . '/' . $newName;
        if (move_uploaded_file($tmpName, $dest)) {
            $fileUrl = '/uploads/' . $newName;
        }
    }
} else if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['image']['tmp_name'];
    $origName = basename($_FILES['image']['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'])) {
        $newName = "{$type}_" . time() . "_{$origName}";
        $dest = $uploadDir . '/' . $newName;
        if (move_uploaded_file($tmpName, $dest)) {
            $fileUrl = '/uploads/' . $newName;
        }
    }
} else if (!empty($imageData) && strpos($imageData, 'data:image/') === 0) {
    if (preg_match('/^data:image\/([^;]+);base64,(.+)$/s', $imageData, $matches)) {
        $rawExt = strtolower($matches[1]);
        if ($rawExt === 'svg+xml') {
            $ext = 'svg';
        } else if ($rawExt === 'jpeg') {
            $ext = 'jpg';
        } else if ($rawExt === 'x-icon' || $rawExt === 'vnd.microsoft.icon') {
            $ext = 'ico';
        } else {
            $ext = preg_replace('/[^a-z0-9]/', '', $rawExt) ?: 'png';
        }
        $data = base64_decode($matches[2]);
        $newName = "{$type}_" . time() . '_' . substr(md5(uniqid()), 0, 6) . ".{$ext}";
        $dest = $uploadDir . '/' . $newName;
        if (@file_put_contents($dest, $data)) {
            $fileUrl = '/uploads/' . $newName;
        }
    }
}

if (!empty($fileUrl)) {
    $pdo = getPDO();
    if ($pdo) {
        // Nếu upload Logo hệ thống, tự động cập nhật vào system_config trong MySQL
        if ($type === 'logo') {
            try {
                $stmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
                $row = $stmt ? $stmt->fetch() : null;
                $cfg = $row && !empty($row['config']) ? json_decode($row['config'], true) : [];
                $cfg['logoUrl'] = $fileUrl;
                $cfgJson = json_encode($cfg, JSON_UNESCAPED_UNICODE);
                $saveStmt = $pdo->prepare("INSERT INTO system_config (id, config, updated_at) VALUES (1, :c, NOW()) ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()");
                $saveStmt->execute(['c' => $cfgJson, 'c2' => $cfgJson]);
            } catch (Exception $e) {}
        }

        // Nếu upload Logo Bộ Công Thương, tự động cập nhật vào footerConfig trong MySQL
        if ($type === 'gov_logo' || $type === 'bocongthuong') {
            try {
                $stmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
                $row = $stmt ? $stmt->fetch() : null;
                $cfg = $row && !empty($row['config']) ? json_decode($row['config'], true) : [];
                if (!isset($cfg['footerConfig'])) $cfg['footerConfig'] = [];
                if (!isset($cfg['footerConfig']['govCertification'])) $cfg['footerConfig']['govCertification'] = [];
                $cfg['footerConfig']['govCertification']['imageUrl'] = $fileUrl;
                $cfg['footerConfig']['govCertification']['enabled'] = true;
                $cfgJson = json_encode($cfg, JSON_UNESCAPED_UNICODE);
                $saveStmt = $pdo->prepare("INSERT INTO system_config (id, config, updated_at) VALUES (1, :c, NOW()) ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()");
                $saveStmt->execute(['c' => $cfgJson, 'c2' => $cfgJson]);
            } catch (Exception $e) {}
        }

        // Nếu upload Avatar người dùng, cập nhật ngay lập tức vào bảng users trong MySQL
        $targetUserId = $payload['userId'] ?? $payload['id'] ?? '';
        $targetUsername = strtolower(trim($payload['username'] ?? ''));
        if ($type === 'avatar' || $type === 'user_avatar' || !empty($targetUserId) || !empty($targetUsername)) {
            try {
                if (!empty($targetUserId) || !empty($targetUsername)) {
                    $userCols = getTableColumns($pdo, 'users');
                    if (isset($userCols['avatar_url'])) {
                        $upAvatar = $pdo->prepare("UPDATE users SET avatar_url = :url WHERE id = :id OR LOWER(username) = :u");
                        $upAvatar->execute(['url' => $fileUrl, 'id' => $targetUserId, 'u' => $targetUsername]);
                    }
                    if (isset($userCols['avatarUrl'])) {
                        $upAvatar = $pdo->prepare("UPDATE users SET avatarUrl = :url WHERE id = :id OR LOWER(username) = :u");
                        $upAvatar->execute(['url' => $fileUrl, 'id' => $targetUserId, 'u' => $targetUsername]);
                    }
                }
            } catch (Exception $e) {}
        }
    }

    // Luôn đồng bộ cấu hình vào data/db.json
    try {
        $db = readJsonDatabase();
        if ($type === 'logo') {
            $db['systemConfig']['logoUrl'] = $fileUrl;
            saveJsonDatabase($db);
        } else if ($type === 'gov_logo' || $type === 'bocongthuong') {
            if (!isset($db['systemConfig']['footerConfig'])) $db['systemConfig']['footerConfig'] = [];
            if (!isset($db['systemConfig']['footerConfig']['govCertification'])) $db['systemConfig']['footerConfig']['govCertification'] = [];
            $db['systemConfig']['footerConfig']['govCertification']['imageUrl'] = $fileUrl;
            $db['systemConfig']['footerConfig']['govCertification']['enabled'] = true;
            saveJsonDatabase($db);
        }
    } catch (Exception $e) {}

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'url' => $fileUrl,
        'fileUrl' => $fileUrl,
        'path' => $fileUrl
    ]);
} else {
    sendJsonResponse([
        'status' => 'error',
        'message' => 'Không thể tải ảnh lên hoặc định dạng ảnh không được hỗ trợ!'
    ], 400);
}
