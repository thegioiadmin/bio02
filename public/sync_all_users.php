<?php
/**
 * API: Đồng bộ hóa toàn diện danh sách người dùng vào MySQL / phpMyAdmin theo thời gian thực
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$usersToSync = [];

if (isset($payload['users']) && is_array($payload['users'])) {
    $usersToSync = $payload['users'];
} elseif (is_array($payload) && isset($payload[0])) {
    $usersToSync = $payload;
}

if (empty($usersToSync)) {
    $db = readJsonDatabase();
    $usersToSync = $db['users'] ?? [];
}

$pdo = getPDO();

if ($pdo) {
    try {
        $syncedCount = 0;
        foreach ($usersToSync as $u) {
            if (empty($u['username']) && empty($u['email']) && empty($u['phone'])) continue;
            upsertUserInDatabase($pdo, $u);
            $syncedCount++;
        }

        // Lấy lại toàn bộ danh sách users từ MySQL
        $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $allUsers = array_map('normalizeUserFromDb', $rows);

        sendJsonResponse([
            'status' => 'success',
            'success' => true,
            'message' => "Đã đồng bộ thành công {$syncedCount} tài khoản vào MySQL / phpMyAdmin!",
            'count' => count($allUsers),
            'syncedCount' => $syncedCount,
            'users' => $allUsers,
            'data' => $allUsers
        ]);
    } catch (Exception $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Lỗi đồng bộ MySQL: ' . $e->getMessage()], 500);
    }
} else {
    // Fallback JSON
    $db = readJsonDatabase();
    foreach ($usersToSync as $u) {
        $uName = strtolower(trim($u['username'] ?? ''));
        if (empty($uName)) continue;
        $foundIdx = -1;
        foreach ($db['users'] as $idx => $existing) {
            if (strtolower($existing['username']) === $uName || $existing['id'] === ($u['id'] ?? '')) {
                $foundIdx = $idx;
                break;
            }
        }
        if ($foundIdx !== -1) {
            $db['users'][$foundIdx] = array_merge($db['users'][$foundIdx], $u);
        } else {
            $db['users'][] = $u;
        }
    }
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã đồng bộ tài khoản người dùng thành công!',
        'count' => count($db['users']),
        'users' => $db['users'],
        'data' => $db['users']
    ]);
}
