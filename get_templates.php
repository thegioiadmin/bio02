<?php
/**
 * API: Lấy danh sách toàn bộ mẫu giao diện từ MySQL
 */
require_once __DIR__ . '/db.php';

$pdo = getPDO();

if ($pdo) {
    $stmt = $pdo->query("SELECT * FROM templates WHERE is_active = 1 ORDER BY updated_at DESC");
    $rows = $stmt->fetchAll();
    $templates = [];
    foreach ($rows as $r) {
        $data = json_decode($r['data'], true);
        if ($data && is_array($data)) {
            $templates[] = array_merge($data, [
                'id' => $r['id'],
                'name' => $r['name'],
                'category' => $r['category'] ?? $data['category'] ?? 'creative',
                'description' => $r['description'] ?? $data['description'] ?? ''
            ]);
        }
    }

    if (empty($templates)) {
        $stmtCfg = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
        $cfgRow = $stmtCfg->fetch();
        if ($cfgRow && !empty($cfgRow['config'])) {
            $cfg = json_decode($cfgRow['config'], true);
            if (!empty($cfg['customTemplates'])) {
                $templates = $cfg['customTemplates'];
            }
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'templates' => $templates,
        'data' => $templates
    ]);
} else {
    $db = readJsonDatabase();
    $templates = $db['customTemplates'] ?? $db['systemConfig']['customTemplates'] ?? [];
    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'templates' => $templates,
        'data' => $templates
    ]);
}
