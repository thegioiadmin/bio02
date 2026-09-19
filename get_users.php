<?php
/**
 * API: Lấy danh sách toàn bộ người dùng từ MySQL / phpMyAdmin theo thời gian thực
 */
require_once __DIR__ . '/db.php';

$pdo = getPDO();

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $users = array_map('normalizeUserFromDb', $rows);

        sendJsonResponse([
            'status' => 'success',
            'success' => true,
            'data' => $users,
            'users' => $users
        ]);
    } catch (Exception $e) {
        sendJsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
} else {
    $db = readJsonDatabase();
    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'data' => $db['users'] ?? [],
        'users' => $db['users'] ?? []
    ]);
}
