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

        // Xử lý riêng biệt tuyệt đối giữa Avatar và Ảnh Bìa (Cover)
        $targetUserId = $payload['userId'] ?? $payload['id'] ?? '';
        $targetUsername = strtolower(trim($payload['username'] ?? ''));

        if ($type === 'avatar' || $type === 'user_avatar') {
            try {
                if (empty($targetUsername) && !empty($targetUserId)) {
                    $uStmt = $pdo->prepare("SELECT username FROM users WHERE id = :id LIMIT 1");
                    $uStmt->execute(['id' => $targetUserId]);
                    $uRow = $uStmt->fetch();
                    if ($uRow) $targetUsername = strtolower($uRow['username']);
                }

                if (!empty($targetUserId) || !empty($targetUsername)) {
                    $userCols = getTableColumns($pdo, 'users');
                    if (isset($userCols['avatar_url'])) {
                        $upAvatar = $pdo->prepare("UPDATE users SET avatar_url = :url, updated_at = NOW() WHERE id = :id OR LOWER(username) = :u");
                        $upAvatar->execute(['url' => $fileUrl, 'id' => $targetUserId, 'u' => $targetUsername]);
                    }
                    if (isset($userCols['avatarUrl'])) {
                        $upAvatar = $pdo->prepare("UPDATE users SET avatarUrl = :url, updated_at = NOW() WHERE id = :id OR LOWER(username) = :u");
                        $upAvatar->execute(['url' => $fileUrl, 'id' => $targetUserId, 'u' => $targetUsername]);
                    }
                }

                // Cập nhật DUY NHẤT avatar vào bảng bios nếu user đã có bio
                if (!empty($targetUsername)) {
                    $bioStmt = $pdo->prepare("SELECT config FROM bios WHERE LOWER(username) = :u LIMIT 1");
                    $bioStmt->execute(['u' => $targetUsername]);
                    $bioRow = $bioStmt->fetch();
                    if ($bioRow && !empty($bioRow['config'])) {
                        $bioCfg = json_decode($bioRow['config'], true);
                        if ($bioCfg && is_array($bioCfg)) {
                            if (!isset($bioCfg['profile'])) $bioCfg['profile'] = [];
                            $bioCfg['profile']['avatarUrl'] = $fileUrl;
                            $newBioCfgJson = json_encode($bioCfg, JSON_UNESCAPED_UNICODE);
                            $upBio = $pdo->prepare("UPDATE bios SET config = :c, updated_at = NOW() WHERE LOWER(username) = :u");
                            $upBio->execute(['c' => $newBioCfgJson, 'u' => $targetUsername]);
                        }
                    }
                }
            } catch (Exception $e) {}
        } else if ($type === 'cover' || $type === 'bio_cover') {
            try {
                if (empty($targetUsername) && !empty($targetUserId)) {
                    $uStmt = $pdo->prepare("SELECT username FROM users WHERE id = :id LIMIT 1");
                    $uStmt->execute(['id' => $targetUserId]);
                    $uRow = $uStmt->fetch();
                    if ($uRow) $targetUsername = strtolower($uRow['username']);
                }

                // Cập nhật DUY NHẤT coverImageUrl vào bảng bios, KHÔNG BAO GIỜ đụng vào avatar
                if (!empty($targetUsername)) {
                    $bioStmt = $pdo->prepare("SELECT config FROM bios WHERE LOWER(username) = :u LIMIT 1");
                    $bioStmt->execute(['u' => $targetUsername]);
                    $bioRow = $bioStmt->fetch();
                    if ($bioRow && !empty($bioRow['config'])) {
                        $bioCfg = json_decode($bioRow['config'], true);
                        if ($bioCfg && is_array($bioCfg)) {
                            if (!isset($bioCfg['profile'])) $bioCfg['profile'] = [];
                            $bioCfg['profile']['coverImageUrl'] = $fileUrl;
                            $newBioCfgJson = json_encode($bioCfg, JSON_UNESCAPED_UNICODE);
                            $upBio = $pdo->prepare("UPDATE bios SET config = :c, updated_at = NOW() WHERE LOWER(username) = :u");
                            $upBio->execute(['c' => $newBioCfgJson, 'u' => $targetUsername]);
                        }
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
        } else if ($type === 'avatar' || $type === 'user_avatar') {
            if (!empty($db['users'])) {
                foreach ($db['users'] as &$u) {
                    if ((!empty($targetUserId) && $u['id'] === $targetUserId) || (!empty($targetUsername) && strtolower($u['username']) === $targetUsername)) {
                        $u['avatarUrl'] = $fileUrl;
                        if (empty($targetUsername)) $targetUsername = strtolower($u['username']);
                        break;
                    }
                }
            }
            if (!empty($targetUsername) && isset($db['bios'][$targetUsername])) {
                if (!isset($db['bios'][$targetUsername]['profile'])) $db['bios'][$targetUsername]['profile'] = [];
                $db['bios'][$targetUsername]['profile']['avatarUrl'] = $fileUrl;
            }
            saveJsonDatabase($db);
        } else if ($type === 'cover' || $type === 'bio_cover') {
            if (!empty($targetUsername) && isset($db['bios'][$targetUsername])) {
                if (!isset($db['bios'][$targetUsername]['profile'])) $db['bios'][$targetUsername]['profile'] = [];
                $db['bios'][$targetUsername]['profile']['coverImageUrl'] = $fileUrl;
            }
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
