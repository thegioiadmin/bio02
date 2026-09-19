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
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
        $newName = "{$type}_" . time() . "_{$origName}";
        $dest = $uploadDir . '/' . $newName;
        if (move_uploaded_file($tmpName, $dest)) {
            $fileUrl = '/uploads/' . $newName;
        }
    }
} else if (!empty($imageData) && strpos($imageData, 'data:image/') === 0) {
    if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $imageData, $matches)) {
        $ext = strtolower($matches[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
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
            $stmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
            $row = $stmt->fetch();
            $cfg = $row && !empty($row['config']) ? json_decode($row['config'], true) : [];
            $cfg['logoUrl'] = $fileUrl;
            $cfgJson = json_encode($cfg, JSON_UNESCAPED_UNICODE);
            $saveStmt = $pdo->prepare("INSERT INTO system_config (id, config, updated_at) VALUES (1, :c, NOW()) ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()");
            $saveStmt->execute(['c' => $cfgJson, 'c2' => $cfgJson]);
        }

        // Nếu upload Avatar người dùng, cập nhật ngay lập tức vào bảng users trong MySQL
        $targetUserId = $payload['userId'] ?? $payload['id'] ?? '';
        $targetUsername = strtolower(trim($payload['username'] ?? ''));
        if ($type === 'avatar' || $type === 'user_avatar' || !empty($targetUserId) || !empty($targetUsername)) {
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
        }
    }

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
