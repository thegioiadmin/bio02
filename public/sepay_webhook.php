<?php
/**
 * SePay Webhook Handler (Hỗ trợ hosting iNET / cPanel / Apache / Nginx / LiteSpeed)
 * Tự động ghi nhận giao dịch nạp tiền & cộng số dư tài khoản người dùng theo thời gian thực 24/7
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

function removeVietnameseAccents($str) {
    if (!$str) return '';
    $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/i", "a", $str);
    $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/i", "e", $str);
    $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/i", "i", $str);
    $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/i", "o", $str);
    $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/i", "u", $str);
    $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/i", "y", $str);
    $str = preg_replace("/(đ)/i", "d", $str);
    return $str;
}

function logSepayOperation($entry) {
    try {
        $logDir = __DIR__ . '/data';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logFile = $logDir . '/sepay_logs.json';
        $currentLogs = [];
        if (file_exists($logFile)) {
            $raw = @file_get_contents($logFile);
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) $currentLogs = $decoded;
            }
        }
        $entry['time'] = date('Y-m-d H:i:s');
        array_unshift($currentLogs, $entry);
        if (count($currentLogs) > 100) {
            $currentLogs = array_slice($currentLogs, 0, 100);
        }
        @file_put_contents($logFile, json_encode($currentLogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    } catch (Exception $e) {}
}

// 1. Đọc dữ liệu gửi đến
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}
if (empty($data) && !empty($_GET)) {
    $data = $_GET;
}

if (empty($data)) {
    echo json_encode([
        'success' => false,
        'message' => 'Không nhận được dữ liệu payload từ SePay'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$transferType = strtolower((string)($data['transferType'] ?? $data['transfer_type'] ?? 'in'));
if ($transferType !== 'in') {
    echo json_encode([
        'success' => true,
        'message' => 'Bỏ qua giao dịch không phải tiền vào (transferType != in)'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$baseAmount = (int)($data['transferAmount'] ?? $data['transfer_amount'] ?? $data['amount_in'] ?? $data['amount'] ?? 0);
if ($baseAmount <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Số tiền nạp không hợp lệ (<= 0)'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$content = trim((string)($data['content'] ?? $data['transaction_content'] ?? $data['description'] ?? $data['body'] ?? ''));
$code = trim((string)($data['code'] ?? ''));
$referenceCode = (string)($data['referenceCode'] ?? $data['reference_number'] ?? $data['id'] ?? ('SP_' . time()));
$gateway = (string)($data['gateway'] ?? $data['bank_brand_name'] ?? 'VietQR');
$accountNumber = (string)($data['accountNumber'] ?? $data['account_number'] ?? '');
$sepayId = (string)($data['id'] ?? '');

$pdo = getPDO();

if ($pdo) {
    // ----------------------------------------------------
    // XỬ LÝ VỚI MYSQL PDO TRÊN HOSTING INET
    // ----------------------------------------------------
    $stmt = $pdo->query("SELECT id, username, phone, balance, email FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Lấy config khuyến mãi nếu có
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

    $matchedUser = null;
    $contentNorm = removeVietnameseAccents(mb_strtolower($content, 'UTF-8'));
    $codeNorm = removeVietnameseAccents(mb_strtolower($code, 'UTF-8'));
    $fullSearch = preg_replace('/[^a-z0-9]/', '', $contentNorm . ' ' . $codeNorm);

    // Thuật toán so khớp
    foreach ($users as $u) {
        $uNameClean = preg_replace('/[^a-z0-9]/', '', removeVietnameseAccents(mb_strtolower($u['username'], 'UTF-8')));
        $uIdClean = preg_replace('/[^a-z0-9]/', '', mb_strtolower($u['id'], 'UTF-8'));
        $uPhone = !empty($u['phone']) ? preg_replace('/[^0-9]/', '', $u['phone']) : '';

        if (
            (!empty($uNameClean) && (strpos($fullSearch, 'nap' . $uNameClean) !== false || strpos($fullSearch, 'bio' . $uNameClean) !== false)) ||
            (!empty($uIdClean) && (strpos($fullSearch, 'nap' . $uIdClean) !== false || strpos($fullSearch, $uIdClean) !== false)) ||
            (!empty($uPhone) && strlen($uPhone) >= 9 && strpos($fullSearch, $uPhone) !== false) ||
            (!empty($uNameClean) && strlen($uNameClean) >= 4 && strpos($fullSearch, $uNameClean) !== false)
        ) {
            $matchedUser = $u;
            break;
        }
    }

    if (!$matchedUser) {
        logSepayOperation([
            'status' => 'unmatched',
            'content' => $content,
            'amount' => $baseAmount,
            'referenceCode' => $referenceCode,
            'gateway' => $gateway
        ]);
        echo json_encode([
            'success' => false,
            'message' => "Không tìm thấy người dùng khớp với nội dung: '$content'"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Chống nạp trùng
    $checkTx = $pdo->prepare("SELECT id FROM transactions WHERE reference_code = :ref OR receipt_note LIKE :sepay_id LIMIT 1");
    $checkTx->execute([
        ':ref' => (string)$referenceCode,
        ':sepay_id' => "%SePay ID: {$sepayId}%"
    ]);
    if ($checkTx->fetch()) {
        echo json_encode([
            'success' => true,
            'message' => 'Giao dịch đã được ghi nhận trước đó, bỏ qua xử lý lặp.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Tính khuyến mãi
    $bonusAmount = ($bonusRate > 0) ? (int)round($baseAmount * ($bonusRate / 100)) : 0;
    $totalAmount = $baseAmount + $bonusAmount;
    $bonusNote = ($bonusAmount > 0) ? " (+{$bonusRate}% KM: +" . number_format($bonusAmount, 0, ',', '.') . " đ)" : "";

    // Cộng tiền
    $newBalance = (int)$matchedUser['balance'] + $totalAmount;
    $updateStmt = $pdo->prepare("UPDATE users SET balance = balance + :amount WHERE id = :id");
    $updateStmt->execute([
        ':amount' => $totalAmount,
        ':id' => $matchedUser['id']
    ]);

    // Tạo bản ghi giao dịch
    $txId = 'TX_SEPAY_' . time() . '_' . substr(md5(uniqid()), 0, 4);
    $desc = "Nạp tiền tự động SePay qua {$gateway}" . ($accountNumber ? " ({$accountNumber})" : '') . " - ND: {$content}{$bonusNote}";

    $insertTx = $pdo->prepare("
        INSERT INTO transactions (
            id, user_id, type, amount, description, status, payment_method, reference_code, receipt_note, created_at
        ) VALUES (
            :id, :user_id, 'deposit', :amount, :description, 'completed', 'sepay_vietqr', :reference_code, :receipt_note, NOW()
        )
    ");
    $insertTx->execute([
        ':id' => $txId,
        ':user_id' => $matchedUser['id'],
        ':amount' => $totalAmount,
        ':description' => $desc,
        ':reference_code' => (string)$referenceCode,
        ':receipt_note' => "SePay ID: {$sepayId} | Ngân hàng: {$gateway} | Gốc: " . number_format($baseAmount, 0, ',', '.') . " đ{$bonusNote}"
    ]);

    logSepayOperation([
        'status' => 'success',
        'username' => $matchedUser['username'],
        'userId' => $matchedUser['id'],
        'amount' => $totalAmount,
        'referenceCode' => $referenceCode,
        'newBalance' => $newBalance
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Cộng tiền tự động thành công!',
        'user_id' => $matchedUser['id'],
        'username' => $matchedUser['username'],
        'amount' => $totalAmount,
        'new_balance' => $newBalance,
        'reference_code' => $referenceCode
    ], JSON_UNESCAPED_UNICODE);
    exit;
} else {
    // ----------------------------------------------------
    // FALLBACK SANG JSON DATABASE NẾU CHƯA CÀI MYSQL
    // ----------------------------------------------------
    $jsonDb = readJsonDatabase();
    if (!isset($jsonDb['users']) || !is_array($jsonDb['users'])) {
        $jsonDb['users'] = [];
    }
    if (!isset($jsonDb['transactions']) || !is_array($jsonDb['transactions'])) {
        $jsonDb['transactions'] = [];
    }

    $matchedUserIndex = -1;
    $contentNorm = removeVietnameseAccents(mb_strtolower($content, 'UTF-8'));
    $codeNorm = removeVietnameseAccents(mb_strtolower($code, 'UTF-8'));
    $fullSearch = preg_replace('/[^a-z0-9]/', '', $contentNorm . ' ' . $codeNorm);

    foreach ($jsonDb['users'] as $idx => $u) {
        $uNameClean = preg_replace('/[^a-z0-9]/', '', removeVietnameseAccents(mb_strtolower($u['username'] ?? '', 'UTF-8')));
        $uIdClean = preg_replace('/[^a-z0-9]/', '', mb_strtolower($u['id'] ?? '', 'UTF-8'));
        $uPhone = !empty($u['phone']) ? preg_replace('/[^0-9]/', '', $u['phone']) : '';

        if (
            (!empty($uNameClean) && (strpos($fullSearch, 'nap' . $uNameClean) !== false || strpos($fullSearch, 'bio' . $uNameClean) !== false)) ||
            (!empty($uIdClean) && (strpos($fullSearch, 'nap' . $uIdClean) !== false || strpos($fullSearch, $uIdClean) !== false)) ||
            (!empty($uPhone) && strlen($uPhone) >= 9 && strpos($fullSearch, $uPhone) !== false) ||
            (!empty($uNameClean) && strlen($uNameClean) >= 4 && strpos($fullSearch, $uNameClean) !== false)
        ) {
            $matchedUserIndex = $idx;
            break;
        }
    }

    if ($matchedUserIndex === -1) {
        echo json_encode([
            'success' => false,
            'message' => "Không tìm thấy người dùng khớp với nội dung: '$content'"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Kiểm tra trùng
    foreach ($jsonDb['transactions'] as $t) {
        if (!empty($t['referenceCode']) && $t['referenceCode'] === $referenceCode) {
            echo json_encode([
                'success' => true,
                'message' => 'Giao dịch này đã được ghi nhận trước đó.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $matchedUser = &$jsonDb['users'][$matchedUserIndex];
    
    // Lấy bonus config
    $bonusRate = 0;
    $cfg = $jsonDb['systemConfig'] ?? [];
    $isActive = isset($cfg['bonusDepositActive']) ? ($cfg['bonusDepositActive'] === true || $cfg['bonusDepositActive'] === 'true' || $cfg['bonusDepositActive'] === 1 || $cfg['bonusDepositActive'] === '1') : true;
    if ($isActive && !empty($cfg['bonusDepositRate']) && (int)$cfg['bonusDepositRate'] > 0) {
        $bonusRate = (int)$cfg['bonusDepositRate'];
    }

    $bonusAmount = ($bonusRate > 0) ? (int)round($baseAmount * ($bonusRate / 100)) : 0;
    $totalAmount = $baseAmount + $bonusAmount;
    $bonusNote = ($bonusAmount > 0) ? " (+{$bonusRate}% KM: +" . number_format($bonusAmount, 0, ',', '.') . " đ)" : "";

    $newBalance = (int)($matchedUser['balance'] ?? 0) + $totalAmount;
    $matchedUser['balance'] = $newBalance;

    $txId = 'TX_SEPAY_' . time() . '_' . substr(md5(uniqid()), 0, 4);
    $newTx = [
        'id' => $txId,
        'userId' => $matchedUser['id'],
        'type' => 'deposit',
        'amount' => $totalAmount,
        'description' => "Nạp tiền tự động SePay qua {$gateway} - ND: {$content}{$bonusNote}",
        'status' => 'completed',
        'paymentMethod' => 'sepay_vietqr',
        'referenceCode' => $referenceCode,
        'receiptNote' => "SePay ID: {$sepayId} | Ngân hàng: {$gateway} | Gốc: " . number_format($baseAmount, 0, ',', '.') . " đ{$bonusNote}",
        'createdAt' => date('c')
    ];

    array_unshift($jsonDb['transactions'], $newTx);
    saveJsonDatabase($jsonDb);

    echo json_encode([
        'success' => true,
        'message' => 'Cộng tiền tự động thành công (JSON DB)!' . ($bonusAmount > 0 ? " Đã cộng {$bonusRate}% KM!" : ''),
        'user_id' => $matchedUser['id'],
        'username' => $matchedUser['username'],
        'amount' => $totalAmount,
        'bonus_amount' => $bonusAmount,
        'new_balance' => $newBalance,
        'reference_code' => $referenceCode
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

