<?php
/**
 * API: Lưu cấu hình hệ thống & Kho mẫu giao diện vào MySQL
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$newConfig = $payload['config'] ?? $payload;

if (empty($newConfig) || !is_array($newConfig)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Dữ liệu cấu hình không hợp lệ!'], 400);
}

// Chuẩn hóa tường minh trường announcementActive và announcementText
if (isset($newConfig['announcementActive'])) {
    $val = $newConfig['announcementActive'];
    $newConfig['announcementActive'] = ($val === true || $val === 'true' || $val === 1 || $val === '1');
}
if (isset($newConfig['announcementText'])) {
    $newConfig['announcementText'] = trim((string)$newConfig['announcementText']);
}

// Chuẩn hóa tường minh trường popupModal
if (isset($newConfig['popupModal']) && is_array($newConfig['popupModal'])) {
    if (isset($newConfig['popupModal']['enabled'])) {
        $pval = $newConfig['popupModal']['enabled'];
        $newConfig['popupModal']['enabled'] = ($pval === true || $pval === 'true' || $pval === 1 || $pval === '1');
    }
}

// Chuẩn hóa tường minh trường maintenanceMode và maintenanceConfig
if (isset($newConfig['maintenanceMode'])) {
    $mval = $newConfig['maintenanceMode'];
    $newConfig['maintenanceMode'] = ($mval === true || $mval === 'true' || $mval === 1 || $mval === '1');
}
if (isset($newConfig['maintenanceConfig']) && is_array($newConfig['maintenanceConfig'])) {
    if (isset($newConfig['maintenanceConfig']['globalMaintenance'])) {
        $gmval = $newConfig['maintenanceConfig']['globalMaintenance'];
        $newConfig['maintenanceConfig']['globalMaintenance'] = ($gmval === true || $gmval === 'true' || $gmval === 1 || $gmval === '1');
    }
}

// Hàm hỗ trợ merge đệ quy sâu để bảo toàn các thiết lập con (VietQR, SePay, Popup, Footer)
function deepMergeArrays(array $current, array $new): array {
    foreach ($new as $key => $value) {
        if (isset($current[$key]) && is_array($current[$key]) && is_array($value)) {
            // Nếu là danh sách mảng tuần tự (như footer columns, customTemplates, articles) hoặc mảng rỗng thì nhận mảng mới
            if (empty($value) || array_keys($value) === range(0, count($value) - 1)) {
                $current[$key] = $value;
            } else {
                $current[$key] = deepMergeArrays($current[$key], $value);
            }
        } else {
            $current[$key] = $value;
        }
    }
    return $current;
}

$pdo = getPDO();

if ($pdo) {
    // 1. Lấy cấu hình hiện tại để merge
    $stmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
    $row = $stmt->fetch();
    $current = [];
    if ($row && !empty($row['config'])) {
        $current = json_decode($row['config'], true) ?: [];
    }

    $merged = deepMergeArrays($current, $newConfig);
    $mergedJson = json_encode($merged, JSON_UNESCAPED_UNICODE);

    // 2. Lưu vào bảng system_config
    $saveStmt = $pdo->prepare("
        INSERT INTO system_config (id, config, updated_at) 
        VALUES (1, :c, NOW()) 
        ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()
    ");
    $saveStmt->execute(['c' => $mergedJson, 'c2' => $mergedJson]);

    // 3. Nếu có danh sách customTemplates, lưu từng mẫu vào bảng templates để người dùng lấy được ngay lập tức
    if (!empty($newConfig['customTemplates']) && is_array($newConfig['customTemplates'])) {
        $tplStmt = $pdo->prepare("
            INSERT INTO templates (id, name, category, description, data, is_active, created_at, updated_at)
            VALUES (:id, :name, :cat, :desc, :data, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE name = :name2, category = :cat2, description = :desc2, data = :data2, updated_at = NOW()
        ");

        foreach ($newConfig['customTemplates'] as $tpl) {
            if (!empty($tpl['id']) && !empty($tpl['name'])) {
                $tplJson = json_encode($tpl, JSON_UNESCAPED_UNICODE);
                $tplStmt->execute([
                    'id' => $tpl['id'],
                    'name' => $tpl['name'],
                    'cat' => $tpl['category'] ?? 'creative',
                    'desc' => $tpl['description'] ?? '',
                    'data' => $tplJson,
                    'name2' => $tpl['name'],
                    'cat2' => $tpl['category'] ?? 'creative',
                    'desc2' => $tpl['description'] ?? '',
                    'data2' => $tplJson
                ]);
            }
        }
    }

    // Luôn đồng bộ cấu hình sang file data/db.json dự phòng
    try {
        $db = readJsonDatabase();
        $db['systemConfig'] = $merged;
        if (!empty($newConfig['customTemplates'])) {
            $db['customTemplates'] = $newConfig['customTemplates'];
        }
        saveJsonDatabase($db);
    } catch (Exception $e) {}

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu cấu hình hệ thống và kho mẫu thành công vào MySQL!',
        'config' => $merged
    ]);
} else {
    $db = readJsonDatabase();
    $current = $db['systemConfig'] ?? [];
    $merged = deepMergeArrays($current, $newConfig);
    $db['systemConfig'] = $merged;
    if (!empty($newConfig['customTemplates'])) {
        $db['customTemplates'] = $newConfig['customTemplates'];
    }
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu cấu hình thành công!',
        'config' => $db['systemConfig']
    ]);
}
