<?php
/**
 * API: Lưu / Cập nhật bài viết chính sách & điều khoản vào MySQL và db.json
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
if (empty($payload)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Dữ liệu không hợp lệ!'], 400);
}

$pdo = getPDO();
$articles = [];

if ($pdo) {
    // 1. Lấy config hiện tại
    $stmtCfg = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
    $row = $stmtCfg ? $stmtCfg->fetch() : null;
    $cfg = ($row && !empty($row['config'])) ? (json_decode($row['config'], true) ?: []) : [];
    $articles = (!empty($cfg['articles']) && is_array($cfg['articles'])) ? $cfg['articles'] : [];

    if (is_array($payload) && isset($payload[0])) {
        $articles = $payload;
    } else if (!empty($payload['id'])) {
        $idx = -1;
        foreach ($articles as $i => $a) {
            if (($a['id'] ?? '') === $payload['id']) {
                $idx = $i;
                break;
            }
        }
        if ($idx !== -1) {
            $articles[$idx] = array_merge($articles[$idx], $payload);
        } else {
            array_unshift($articles, $payload);
        }
    }

    $cfg['articles'] = $articles;
    $newCfgJson = json_encode($cfg, JSON_UNESCAPED_UNICODE);

    $saveStmt = $pdo->prepare("
        INSERT INTO system_config (id, config, updated_at) 
        VALUES (1, :c, NOW()) 
        ON DUPLICATE KEY UPDATE config = :c2, updated_at = NOW()
    ");
    $saveStmt->execute(['c' => $newCfgJson, 'c2' => $newCfgJson]);

    // Đồng bộ sang db.json
    try {
        $db = readJsonDatabase();
        $db['articles'] = $articles;
        if (!isset($db['systemConfig'])) $db['systemConfig'] = [];
        $db['systemConfig']['articles'] = $articles;
        saveJsonDatabase($db);
    } catch (Exception $e) {}

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu bài viết thành công vào MySQL!',
        'articles' => $articles
    ]);
} else {
    $db = readJsonDatabase();
    $articles = (!empty($db['articles']) && is_array($db['articles'])) ? $db['articles'] : ((!empty($db['systemConfig']['articles']) && is_array($db['systemConfig']['articles'])) ? $db['systemConfig']['articles'] : []);

    if (is_array($payload) && isset($payload[0])) {
        $articles = $payload;
    } else if (!empty($payload['id'])) {
        $idx = -1;
        foreach ($articles as $i => $a) {
            if (($a['id'] ?? '') === $payload['id']) {
                $idx = $i;
                break;
            }
        }
        if ($idx !== -1) {
            $articles[$idx] = array_merge($articles[$idx], $payload);
        } else {
            array_unshift($articles, $payload);
        }
    }

    $db['articles'] = $articles;
    if (!isset($db['systemConfig'])) $db['systemConfig'] = [];
    $db['systemConfig']['articles'] = $articles;
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu bài viết thành công!',
        'articles' => $articles
    ]);
}
