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
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
    $stmt->execute(['id' => $userId ?: '', 'u' => $username ?: '']);
    $user = $stmt->fetch();

    if ($user) {
        $uName = strtolower($user['username']);
        $delBio = $pdo->prepare("DELETE FROM bios WHERE LOWER(username) = :u");
        $delBio->execute(['u' => $uName]);

        $delUser = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $delUser->execute(['id' => $user['id']]);
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã xóa người dùng và dữ liệu bio liên quan thành công khỏi MySQL!'
    ]);
} else {
    $db = readJsonDatabase();
    $db['users'] = array_values(array_filter($db['users'], function($u) use ($userId, $username) {
        return ($u['id'] !== $userId && strtolower($u['username']) !== $username);
    }));
    if ($username && isset($db['bios'][$username])) {
        unset($db['bios'][$username]);
    }
    saveJsonDatabase($db);

    sendJsonResponse(['status' => 'success', 'success' => true, 'message' => 'Đã xóa thành công']);
}
