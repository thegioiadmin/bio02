<?php
/**
 * API: Lấy danh sách hoặc chi tiết bài viết chính sách / hướng dẫn từ MySQL / JSON
 */
require_once __DIR__ . '/db.php';

$pdo = getPDO();
$articles = [];

if ($pdo) {
    // 1. Lấy từ system_config JSON
    $stmtCfg = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
    $row = $stmtCfg ? $stmtCfg->fetch() : null;
    if ($row && !empty($row['config'])) {
        $cfg = json_decode($row['config'], true);
        if (!empty($cfg['articles']) && is_array($cfg['articles'])) {
            $articles = $cfg['articles'];
        }
    }
}

// 2. Fallback đọc từ file data/db.json
if (empty($articles)) {
    $db = readJsonDatabase();
    if (!empty($db['articles']) && is_array($db['articles'])) {
        $articles = $db['articles'];
    } else if (!empty($db['systemConfig']['articles']) && is_array($db['systemConfig']['articles'])) {
        $articles = $db['systemConfig']['articles'];
    }
}

// Hỗ trợ tìm kiếm theo ID hoặc Slug nếu có tham số
$targetId = trim((string)($_GET['id'] ?? ''));
$targetSlug = trim((string)($_GET['slug'] ?? ''));

if (!empty($targetId) || !empty($targetSlug)) {
    $found = null;
    foreach ($articles as $a) {
        if (!empty($targetId) && ($a['id'] ?? '') === $targetId) {
            $found = $a;
            break;
        }
        if (!empty($targetSlug) && ($a['slug'] ?? '') === $targetSlug) {
            $found = $a;
            break;
        }
    }
    if ($found) {
        sendJsonResponse($found);
    } else {
        sendJsonResponse(['error' => 'Không tìm thấy bài viết'], 404);
    }
}

sendJsonResponse($articles);
