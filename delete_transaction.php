<?php
/**
 * API: Xóa lịch sử giao dịch bởi Admin (Hỗ trợ: Xóa 1 GD, Xóa tất cả của 1 thành viên, hoặc RESET toàn bộ hệ thống)
 * Lưu & đồng bộ trực tiếp vào MySQL / phpMyAdmin trên Hosting iNET
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$txId = trim($payload['id'] ?? $payload['txId'] ?? $payload['transactionId'] ?? $_GET['id'] ?? '');
$userId = trim($payload['userId'] ?? $payload['user_id'] ?? $_GET['userId'] ?? '');
$action = trim($payload['action'] ?? $_GET['action'] ?? '');
$clearAll = !empty($payload['clearAll']) || !empty($_GET['clearAll']) || $action === 'reset_all' || $action === 'clear_all';

$pdo = getPDO();

if ($pdo) {
    try {
        if ($clearAll && empty($userId)) {
            // RESET TOÀN BỘ LỊCH SỬ GIAO DỊCH CỦA TOÀN HỆ THỐNG
            $countStmt = $pdo->query("SELECT COUNT(*) as total FROM transactions");
            $initialCount = (int)($countStmt->fetch()['total'] ?? 0);

            $stmt = $pdo->prepare("DELETE FROM transactions");
            $stmt->execute();
            $deletedCount = $stmt->rowCount() ?: $initialCount;

            sendJsonResponse([
                'status' => 'success',
                'success' => true,
                'message' => "Đã reset và xóa toàn bộ {$deletedCount} lịch sử giao dịch toàn hệ thống trong MySQL thành công!",
                'deletedCount' => $deletedCount,
                'isResetAll' => true
            ]);
        } else if (!empty($txId)) {
            // Xóa 1 giao dịch cụ thể theo ID
            $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = :id");
            $stmt->execute(['id' => $txId]);
            $deletedCount = $stmt->rowCount();

            sendJsonResponse([
                'status' => 'success',
                'success' => true,
                'message' => "Đã xóa giao dịch #{$txId} thành công khỏi cơ sở dữ liệu MySQL!",
                'deletedCount' => $deletedCount,
                'deletedTxId' => $txId
            ]);
        } else if (!empty($userId) && $clearAll) {
            // Xóa tất cả giao dịch của 1 thành viên
            $stmtU = $pdo->prepare("SELECT id, username FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
            $stmtU->execute(['id' => $userId, 'u' => strtolower($userId)]);
            $uRow = $stmtU->fetch();
            $effectiveUserId = $uRow ? $uRow['id'] : $userId;
            $username = $uRow ? $uRow['username'] : $userId;

            $stmt = $pdo->prepare("DELETE FROM transactions WHERE user_id = :uid OR LOWER(user_id) = :u");
            $stmt->execute(['uid' => $effectiveUserId, 'u' => strtolower($username)]);
            $deletedCount = $stmt->rowCount();

            sendJsonResponse([
                'status' => 'success',
                'success' => true,
                'message' => "Đã xóa toàn bộ {$deletedCount} giao dịch của thành viên @{$username} thành công!",
                'deletedCount' => $deletedCount,
                'userId' => $effectiveUserId
            ]);
        } else {
            sendJsonResponse(['status' => 'error', 'message' => 'Yêu cầu xóa không hợp lệ! Vui lòng chọn giao dịch hoặc thao tác reset.'], 400);
        }
    } catch (Exception $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Lỗi khi xóa giao dịch trong MySQL: ' . $e->getMessage()], 500);
    }
} else {
    // Fallback JSON database
    $db = readJsonDatabase();
    if (!isset($db['transactions']) || !is_array($db['transactions'])) {
        $db['transactions'] = [];
    }

    $initialCount = count($db['transactions']);
    if ($clearAll && empty($userId)) {
        $db['transactions'] = [];
        $deletedCount = $initialCount;
    } else if (!empty($txId)) {
        $db['transactions'] = array_values(array_filter($db['transactions'], function($t) use ($txId) {
            return ($t['id'] ?? '') !== $txId;
        }));
        $deletedCount = $initialCount - count($db['transactions']);
    } else if (!empty($userId) && $clearAll) {
        $uLower = strtolower($userId);
        $db['transactions'] = array_values(array_filter($db['transactions'], function($t) use ($userId, $uLower) {
            $tUid = strtolower($t['userId'] ?? '');
            $tUname = strtolower($t['username'] ?? '');
            return $tUid !== $userId && $tUid !== $uLower && $tUname !== $uLower;
        }));
        $deletedCount = $initialCount - count($db['transactions']);
    } else {
        sendJsonResponse(['status' => 'error', 'message' => 'Yêu cầu không hợp lệ!'], 400);
    }

    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => ($clearAll && empty($userId)) ? "Đã reset toàn bộ {$deletedCount} lịch sử giao dịch!" : "Đã xóa thành công {$deletedCount} giao dịch!",
        'deletedCount' => $deletedCount
    ]);
}
