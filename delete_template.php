<?php
/**
 * API: Xóa mẫu giao diện trong MySQL
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$id = $payload['id'] ?? $_GET['id'] ?? '';

if (empty($id)) {
    sendJsonResponse([
        'status' => 'error',
        'success' => false,
        'message' => 'Thiếu ID mẫu giao diện cần xóa!'
    ], 400);
}

$pdo = getPDO();

if ($pdo) {
    try {
        $stmt = $pdo->prepare("DELETE FROM templates WHERE id = :id");
        $stmt->execute(['id' => $id]);

        // Also update system_config if present
        $stmtCfg = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
        $cfgRow = $stmtCfg ? $stmtCfg->fetch() : null;
        if ($cfgRow && !empty($cfgRow['config'])) {
            $cfg = json_decode($cfgRow['config'], true);
            if (!empty($cfg['customTemplates']) && is_array($cfg['customTemplates'])) {
                $cfg['customTemplates'] = array_values(array_filter($cfg['customTemplates'], function($t) use ($id) {
                    return ($t['id'] ?? '') !== $id;
                }));
                $newCfgJson = json_encode($cfg, JSON_UNESCAPED_UNICODE);
                $stmtUpdate = $pdo->prepare("UPDATE system_config SET config = :config, updated_at = NOW() WHERE id = 1");
                $stmtUpdate->execute(['config' => $newCfgJson]);
            }
        }
    } catch (Exception $e) {}
}

// Luôn đồng bộ xóa khỏi file data/db.json trên hosting
try {
    $db = readJsonDatabase();
    if (isset($db['customTemplates']) && is_array($db['customTemplates'])) {
        $db['customTemplates'] = array_values(array_filter($db['customTemplates'], function($t) use ($id) {
            return ($t['id'] ?? '') !== $id;
        }));
    }
    if (isset($db['systemConfig']['customTemplates']) && is_array($db['systemConfig']['customTemplates'])) {
        $db['systemConfig']['customTemplates'] = array_values(array_filter($db['systemConfig']['customTemplates'], function($t) use ($id) {
            return ($t['id'] ?? '') !== $id;
        }));
    }
    saveJsonDatabase($db);
} catch (Exception $e) {}

sendJsonResponse([
    'status' => 'success',
    'success' => true,
    'message' => 'Đã xóa mẫu giao diện thành công!'
]);
