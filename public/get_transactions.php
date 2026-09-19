<?php
/**
 * API: Lấy danh sách lịch sử giao dịch & nạp tiền từ MySQL / phpMyAdmin
 */
require_once __DIR__ . '/db.php';

$userId = trim($_GET['user_id'] ?? $_GET['userId'] ?? $_GET['u'] ?? '');
$pdo = getPDO();

if ($pdo) {
    try {
        if (!empty($userId)) {
            // Find user id if username was provided
            $stmtU = $pdo->prepare("SELECT id, username FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
            $stmtU->execute(['id' => $userId, 'u' => strtolower($userId)]);
            $userFound = $stmtU->fetch();
            $effectiveUserId = $userFound ? $userFound['id'] : $userId;
            $effectiveUsername = $userFound ? strtolower($userFound['username']) : strtolower($userId);

            $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = :uid OR LOWER(user_id) = :u ORDER BY created_at DESC");
            $stmt->execute(['uid' => $effectiveUserId, 'u' => $effectiveUsername]);
        } else {
            $stmt = $pdo->query("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 500");
        }

        $rows = $stmt->fetchAll();
        $transactions = [];

        foreach ($rows as $r) {
            $transactions[] = [
                'id' => $r['id'],
                'userId' => $r['user_id'],
                'type' => $r['type'],
                'amount' => (int)$r['amount'],
                'description' => $r['description'] ?? '',
                'status' => $r['status'] ?? 'completed',
                'paymentMethod' => $r['payment_method'] ?? 'balance',
                'referenceCode' => $r['reference_code'] ?? null,
                'receiptNote' => $r['receipt_note'] ?? null,
                'createdAt' => $r['created_at'] ?? date('Y-m-d H:i:s')
            ];
        }

        sendJsonResponse([
            'status' => 'success',
            'success' => true,
            'data' => $transactions,
            'transactions' => $transactions
        ]);
    } catch (Exception $e) {
        sendJsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
} else {
    $db = readJsonDatabase();
    $txs = $db['transactions'] ?? [];
    if (!empty($userId)) {
        $txs = array_filter($txs, function($t) use ($userId) {
            return ($t['userId'] ?? '') === $userId;
        });
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'data' => array_values($txs),
        'transactions' => array_values($txs)
    ]);
}
