<?php
/**
 * API Kiểm tra trạng thái nạp tiền SePay theo thời gian thực (Hỗ trợ hosting iNET / cPanel)
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = getRequestJson();
$username = trim((string)($input['username'] ?? $_GET['username'] ?? ''));
$userId = trim((string)($input['userId'] ?? $_GET['userId'] ?? ''));
$expectedAmount = (int)($input['expectedAmount'] ?? $input['amount'] ?? $_GET['amount'] ?? 0);
$sinceTime = !empty($input['sinceTime']) ? strtotime($input['sinceTime']) : (time() - 600);

$pdo = getPDO();

if ($pdo) {
    // 1. Tìm user
    $userStmt = $pdo->prepare("SELECT id, username, name, email, phone, balance, plan, verified, role FROM users WHERE username = :u OR id = :id LIMIT 1");
    $userStmt->execute([
        ':u' => $username,
        ':id' => $userId ?: ($username ? "usr_{$username}" : "")
    ]);
    $user = $userStmt->fetch();

    if (!$user) {
        echo json_encode([
            'success' => false,
            'isPaid' => false,
            'message' => 'Không tìm thấy người dùng'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Tìm transaction hoàn tất gần nhất
    $txStmt = $pdo->prepare("
        SELECT * FROM transactions 
        WHERE user_id = :uid 
          AND type = 'deposit' 
          AND status = 'completed' 
          AND created_at >= FROM_UNIXTIME(:since)
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $txStmt->execute([
        ':uid' => $user['id'],
        ':since' => $sinceTime - 60 // Trừ bù 60s
    ]);
    $recentTx = $txStmt->fetch();

    if ($recentTx) {
        echo json_encode([
            'success' => true,
            'isPaid' => true,
            'status' => 'completed',
            'message' => 'Đã nhận được tiền nạp vào tài khoản!',
            'transaction' => $recentTx,
            'balance' => (int)$user['balance'],
            'user' => $user
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 3. Nếu chưa thấy trong MySQL, thử gọi trực tiếp SePay API nếu có API Key
    try {
        $sepayKey = trim((string)($input['apiKey'] ?? $_GET['apiKey'] ?? ''));
        if (empty($sepayKey)) {
            $cfgStmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
            $cfgRow = $cfgStmt->fetch();
            if ($cfgRow && !empty($cfgRow['config'])) {
                $cfg = json_decode($cfgRow['config'], true);
                $sepayKey = trim((string)($cfg['autoPaymentConfig']['apiKey'] ?? ''));
            }
        }

        if (!empty($sepayKey)) {
            $opts = [
                'http' => [
                    'method' => 'GET',
                    'header' => "Authorization: Bearer {$sepayKey}\r\nContent-Type: application/json\r\n",
                    'timeout' => 4
                ]
            ];
            $context = stream_context_create($opts);
            $res = @file_get_contents('https://my.sepay.vn/userapi/transactions/list?limit=30', false, $context);
            if ($res) {
                $sepayData = json_decode($res, true);
                if (!empty($sepayData['transactions']) && is_array($sepayData['transactions'])) {
                    $uNameClean = preg_replace('/[^a-z0-9]/', '', mb_strtolower($user['username']));
                    $uIdClean = preg_replace('/[^a-z0-9]/', '', mb_strtolower($user['id']));

                    // Kích hoạt nạp nếu tìm thấy
                    foreach ($sepayData['transactions'] as $item) {
                        $inAmt = (int)($item['amount_in'] ?? 0);
                        $inContent = preg_replace('/[^a-z0-9]/', '', mb_strtolower($item['transaction_content'] ?? $item['body'] ?? ''));
                        $inCode = preg_replace('/[^a-z0-9]/', '', mb_strtolower($item['code'] ?? ''));
                        $fullSearch = $inContent . ' ' . $inCode;
                        $ref = $item['reference_number'] ?? (string)$item['id'];

                        $isMatch = ($inAmt > 0) && (
                            (!empty($uNameClean) && (strpos($fullSearch, $uNameClean) !== false || strpos($fullSearch, 'nap' . $uNameClean) !== false)) ||
                            (!empty($uIdClean) && strpos($fullSearch, $uIdClean) !== false)
                        );

                        if ($isMatch) {
                            // Kiểm tra đã nạp chưa
                            $cTx = $pdo->prepare("SELECT id FROM transactions WHERE reference_code = :ref LIMIT 1");
                            $cTx->execute([':ref' => (string)$ref]);
                            if (!$cTx->fetch()) {
                                // Lấy tỷ lệ khuyến mãi nạp ví
                                $bonusRate = 0;
                                try {
                                    $cfgStmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
                                    $cfgRow = $cfgStmt->fetch();
                                    if ($cfgRow && !empty($cfgRow['config'])) {
                                        $cfg = json_decode($cfgRow['config'], true);
                                        $isActive = isset($cfg['bonusDepositActive']) ? ($cfg['bonusDepositActive'] === true || $cfg['bonusDepositActive'] === 'true' || $cfg['bonusDepositActive'] === 1 || $cfg['bonusDepositActive'] === '1') : true;
                                        if ($isActive && !empty($cfg['bonusDepositRate']) && (int)$cfg['bonusDepositRate'] > 0) {
                                            $bonusRate = (int)$cfg['bonusDepositRate'];
                                        }
                                    }
                                } catch (Exception $e) {}

                                $bonusAmt = ($bonusRate > 0) ? (int)round($inAmt * ($bonusRate / 100)) : 0;
                                $totalCredit = $inAmt + $bonusAmt;
                                $bonusNote = ($bonusAmt > 0) ? " (+{$bonusRate}% KM: +" . number_format($bonusAmt, 0, ',', '.') . " đ)" : "";

                                // Cộng tiền ngay vào MySQL
                                $pdo->prepare("UPDATE users SET balance = balance + :amount, updated_at = NOW() WHERE id = :id")->execute([
                                    ':amount' => $totalCredit,
                                    ':id' => $user['id']
                                ]);
                                $newTxId = 'TX_SEPAY_' . time() . '_' . substr(md5(uniqid()), 0, 4);
                                $pdo->prepare("
                                    INSERT INTO transactions (id, user_id, type, amount, description, status, payment_method, reference_code, receipt_note, created_at)
                                    VALUES (:id, :user_id, 'deposit', :amount, :description, 'completed', 'sepay_vietqr', :ref, :note, NOW())
                                ")->execute([
                                    ':id' => $newTxId,
                                    ':user_id' => $user['id'],
                                    ':amount' => $totalCredit,
                                    ':description' => "Nạp tiền tự động SePay qua " . ($item['bank_brand_name'] ?? 'VietQR') . " - ND: " . ($item['transaction_content'] ?? '') . $bonusNote,
                                    ':ref' => (string)$ref,
                                    ':note' => "SePay Auto-Sync ID: {$item['id']} | Gốc: " . number_format($inAmt, 0, ',', '.') . " đ{$bonusNote}"
                                ]);

                                $user['balance'] = (int)$user['balance'] + $totalCredit;

                                echo json_encode([
                                    'success' => true,
                                    'isPaid' => true,
                                    'status' => 'completed',
                                    'message' => 'Nạp tiền tự động thành công!' . ($bonusAmt > 0 ? " Đã cộng thêm {$bonusRate}% khuyến mãi!" : ''),
                                    'bonusAmount' => $bonusAmt,
                                    'totalAmount' => $totalCredit,
                                    'balance' => (int)$user['balance'],
                                    'user' => $user
                                ], JSON_UNESCAPED_UNICODE);
                                exit;
                            }
                        }
                    }
                }
            }
        }
    } catch (Exception $e) {}

    echo json_encode([
        'success' => true,
        'isPaid' => false,
        'status' => 'pending',
        'balance' => (int)$user['balance'],
        'message' => 'Đang chờ chuyển khoản từ ứng dụng ngân hàng...'
    ], JSON_UNESCAPED_UNICODE);
    exit;
} else {
    // Fallback JSON
    $jsonDb = readJsonDatabase();
    $foundUser = null;
    foreach (($jsonDb['users'] ?? []) as $u) {
        if ($u['username'] === $username || $u['id'] === $userId) {
            $foundUser = $u;
            break;
        }
    }

    echo json_encode([
        'success' => true,
        'isPaid' => false,
        'status' => 'pending',
        'balance' => $foundUser ? (int)($foundUser['balance'] ?? 0) : 0,
        'message' => 'Đang chờ chuyển khoản...'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
