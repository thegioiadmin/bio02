<?php
/**
 * API: Xóa tài khoản người dùng và trang Bio khỏi MySQL
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$userId = $payload['id'] ?? $payload['userId'] ?? $_GET['id'] ?? null;
$username = strtolower(trim($payload['username'] ?? $_GET['username'] ?? ''));

if (empty($userId) && empty($username)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu thông tin người dùng cần xóa!'], 400);
}

$pdo = getPDO();

if ($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
        $stmt->execute(['id' => $userId ?: '', 'u' => $username ?: '']);
        $user = $stmt->fetch();

        if ($user) {
            $uName = strtolower($user['username']);
            $delBio = $pdo->prepare("DELETE FROM bios WHERE LOWER(username) = :u");
            $delBio->execute(['u' => $uName]);

            $delUser = $pdo->prepare("DELETE FROM users WHERE id = :id");
            $delUser->execute(['id' => $user['id']]);
            $username = $uName;
        }
    } catch (Exception $e) {}
}

// Luôn đồng bộ xóa khỏi file data/db.json trên hosting
try {
    $db = readJsonDatabase();
    $targetUsername = strtolower($username);
    $db['users'] = array_values(array_filter($db['users'], function($u) use ($userId, $targetUsername) {
        return ($userId && $u['id'] !== $userId) && (!$targetUsername || strtolower($u['username']) !== $targetUsername);
    }));
    if ($targetUsername && isset($db['bios'][$targetUsername])) {
        unset($db['bios'][$targetUsername]);
    }
    saveJsonDatabase($db);
} catch (Exception $e) {}

sendJsonResponse([
    'status' => 'success',
    'success' => true,
    'message' => 'Đã xóa người dùng và dữ liệu bio liên quan thành công!'
]);
