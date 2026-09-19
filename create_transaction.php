<?php
/**
 * API: Tạo giao dịch nạp tiền / thanh toán và ghi nhận trực tiếp vào MySQL & Cập nhật số dư User
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$userId = trim($payload['userId'] ?? $payload['user_id'] ?? $payload['username'] ?? '');
$amount = (int)($payload['amount'] ?? 0);
$type = trim($payload['type'] ?? 'deposit');
$description = trim($payload['description'] ?? 'Giao dịch nạp tiền');
$paymentMethod = trim($payload['paymentMethod'] ?? $payload['payment_method'] ?? 'vietqr');
$referenceCode = trim($payload['referenceCode'] ?? $payload['reference_code'] ?? ('TX' . substr(time(), -6)));
$receiptNote = trim($payload['receiptNote'] ?? $payload['receipt_note'] ?? '');
$customTxId = trim($payload['id'] ?? '');

if (empty($userId)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu thông tin người dùng thực hiện giao dịch!'], 400);
}

$pdo = getPDO();

if ($pdo) {
    // 1. Tìm user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
    $stmt->execute(['id' => $userId, 'u' => strtolower($userId)]);
    $userRow = $stmt->fetch();

    if (!$userRow) {
        sendJsonResponse(['status' => 'error', 'message' => 'Không tìm thấy người dùng trong hệ thống!'], 404);
    }

    $currentBalance = (int)($userRow['balance'] ?? 0);
    // If it's a payment with balance and amount is negative, ensure user has enough balance
    if ($amount < 0 && ($currentBalance + $amount) < 0) {
        sendJsonResponse([
            'status' => 'error', 
            'message' => 'Số dư không đủ để thực hiện thanh toán! Vui lòng nạp thêm tiền.'
        ], 400);
    }

    $newBalance = max(0, $currentBalance + $amount);

    // 2. Cập nhật số dư bảng users
    $stmtUpdate = $pdo->prepare("UPDATE users SET balance = :b, updated_at = NOW() WHERE id = :id");
    $stmtUpdate->execute(['b' => $newBalance, 'id' => $userRow['id']]);

    // 3. Ghi nhận giao dịch vào bảng transactions
    $txId = $customTxId ?: ('TX_' . ($amount >= 0 ? 'DEP_' : 'PAY_') . time() . '_' . substr(md5(uniqid()), 0, 4));
    
    $stmtTx = $pdo->prepare("
        INSERT INTO transactions (
            id, user_id, type, amount, description, status, payment_method, reference_code, receipt_note, created_at
        ) VALUES (
            :id, :user_id, :type, :amount, :description, 'completed', :payment_method, :reference_code, :receipt_note, NOW()
        )
    ");
    $stmtTx->execute([
        'id' => $txId,
        'user_id' => $userRow['id'],
        'type' => $type,
        'amount' => $amount,
        'description' => $description,
        'payment_method' => $paymentMethod,
        'reference_code' => $referenceCode,
        'receipt_note' => $receiptNote
    ]);

    // 4. Lấy lại user mới nhất
    $stmtRe = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmtRe->execute(['id' => $userRow['id']]);
    $updatedUser = $stmtRe->fetch();

    $newTx = [
        'id' => $txId,
        'userId' => $userRow['id'],
        'type' => $type,
        'amount' => $amount,
        'description' => $description,
        'status' => 'completed',
        'paymentMethod' => $paymentMethod,
        'referenceCode' => $referenceCode,
        'receiptNote' => $receiptNote,
        'createdAt' => date('Y-m-d H:i:s')
    ];

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Ghi nhận giao dịch và cập nhật số dư thành công!',
        'transaction' => $newTx,
        'tx' => $newTx,
        'user' => normalizeUserFromDb($updatedUser)
    ]);
} else {
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

    $txId = $customTxId ?: ('TX_' . ($amount >= 0 ? 'DEP_' : 'PAY_') . time());
    $newTx = [
        'id' => $txId,
        'userId' => $db['users'][$foundIdx]['id'],
        'type' => $type,
        'amount' => $amount,
        'description' => $description,
        'status' => 'completed',
        'paymentMethod' => $paymentMethod,
        'referenceCode' => $referenceCode,
        'receiptNote' => $receiptNote,
        'createdAt' => date('Y-m-d H:i:s')
    ];

    if (!isset($db['transactions']) || !is_array($db['transactions'])) {
        $db['transactions'] = [];
    }
    array_unshift($db['transactions'], $newTx);
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Ghi nhận giao dịch thành công!',
        'transaction' => $newTx,
        'tx' => $newTx,
        'user' => $db['users'][$foundIdx]
    ]);
}
