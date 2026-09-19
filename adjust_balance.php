<?php
/**
 * API: Điều chỉnh số dư / Cộng tiền thủ công bởi Admin (Lưu trực tiếp vào MySQL & Transactions)
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$userId = $payload['userId'] ?? $payload['id'] ?? $payload['username'] ?? '';
$amount = (int)($payload['amount'] ?? 0);
$reason = trim($payload['reason'] ?? $payload['description'] ?? 'Điều chỉnh số dư bởi Quản trị viên');

if (empty($userId)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu thông tin ID hoặc Username người dùng cần cộng/trừ tiền!'], 400);
}

$pdo = getPDO();

if ($pdo) {
    // 1. Tìm user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
    $stmt->execute(['id' => $userId, 'u' => strtolower($userId)]);
    $targetUser = $stmt->fetch();

    if (!$targetUser) {
        sendJsonResponse(['status' => 'error', 'message' => 'Không tìm thấy người dùng trong hệ thống!'], 404);
    }

    $currentBalance = (int)($targetUser['balance'] ?? 0);
    $newBalance = max(0, $currentBalance + $amount);

    // 2. Cập nhật số dư mới vào bảng `users`
    $stmtUpdate = $pdo->prepare("UPDATE users SET balance = :b, updated_at = NOW() WHERE id = :id");
    $stmtUpdate->execute(['b' => $newBalance, 'id' => $targetUser['id']]);

    // 3. Ghi nhận giao dịch vào bảng `transactions`
    $txId = 'TX_ADM_' . time() . '_' . substr(md5(uniqid()), 0, 4);
    $stmtTx = $pdo->prepare("
        INSERT INTO transactions (
            id, user_id, type, amount, description, status, payment_method, reference_code, receipt_note, created_at
        ) VALUES (
            :id, :user_id, :type, :amount, :description, 'completed', 'balance', :ref, :note, NOW()
        )
    ");
    $stmtTx->execute([
        'id' => $txId,
        'user_id' => $targetUser['id'],
        'type' => $amount >= 0 ? 'deposit' : 'withdraw',
        'amount' => $amount,
        'description' => "[Admin] {$reason}",
        'ref' => 'ADM' . substr(time(), -6),
        'note' => "Điều chỉnh số dư bởi Quản trị viên: {$reason}"
    ]);

    // 4. Lấy lại user cập nhật
    $stmtRe = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmtRe->execute(['id' => $targetUser['id']]);
    $updatedRow = $stmtRe->fetch();

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => "Đã điều chỉnh số dư thành công cho @{$targetUser['username']}. Số dư mới: " . number_format($newBalance, 0, ',', '.') . " VNĐ",
        'user' => normalizeUserFromDb($updatedRow),
        'transaction' => [
            'id' => $txId,
            'userId' => $targetUser['id'],
            'type' => $amount >= 0 ? 'deposit' : 'withdraw',
            'amount' => $amount,
            'description' => "[Admin] {$reason}",
            'createdAt' => date('Y-m-d H:i:s'),
            'status' => 'completed',
            'paymentMethod' => 'balance'
        ]
    ]);
} else {
    // Fallback JSON
    $db = readJsonDatabase();
    $foundIdx = -1;
    foreach ($db['users'] as $i => $u) {
        if ($u['id'] === $userId || strtolower($u['username']) === strtolower($userId)) {
            $foundIdx = $i;
            break;
        }
    }

    if ($foundIdx === -1) {
        sendJsonResponse(['status' => 'error', 'message' => 'Không tìm thấy người dùng!'], 404);
    }

    $currBal = (int)($db['users'][$foundIdx]['balance'] ?? 0);
    $newBal = max(0, $currBal + $amount);
    $db['users'][$foundIdx]['balance'] = $newBal;

    $tx = [
        'id' => 'TX_ADM_' . time(),
        'userId' => $db['users'][$foundIdx]['id'],
        'type' => $amount >= 0 ? 'deposit' : 'withdraw',
        'amount' => $amount,
        'description' => "[Admin] {$reason}",
        'createdAt' => date('Y-m-d H:i:s'),
        'status' => 'completed',
        'paymentMethod' => 'balance'
    ];

    if (!isset($db['transactions']) || !is_array($db['transactions'])) {
        $db['transactions'] = [];
    }
    array_unshift($db['transactions'], $tx);
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => "Đã điều chỉnh số dư thành công. Số dư mới: {$newBal}",
        'user' => $db['users'][$foundIdx],
        'transaction' => $tx
    ]);
}
