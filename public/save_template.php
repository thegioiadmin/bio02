<?php
/**
 * API: Lưu mẫu giao diện mới hoặc chỉnh sửa mẫu giao diện trong MySQL
 */
require_once __DIR__ . '/db.php';

function ensureTemplateContactFirst(&$tpl) {
    if (isset($tpl['config']['blocks']) && is_array($tpl['config']['blocks'])) {
        $contact = null;
        $others = [];
        foreach ($tpl['config']['blocks'] as $b) {
            if (isset($b['type']) && $b['type'] === 'contact_card' && $contact === null) {
                $contact = $b;
            } else {
                $others[] = $b;
            }
        }
        if (!$contact) {
            $contact = [
                'id' => 'blk_contact_' . time(),
                'type' => 'contact_card',
                'enabled' => true,
                'order' => 1,
                'phone' => '',
                'email' => '',
                'jobTitle' => $tpl['config']['profile']['jobTitle'] ?? 'Liên hệ & Hợp tác',
                'vCardEnabled' => true
            ];
        }
        $contact['order'] = 1;
        $result = [$contact];
        $o = 2;
        foreach ($others as $ot) {
            $ot['order'] = $o++;
            $result[] = $ot;
        }
        $tpl['config']['blocks'] = $result;
    }
}

$payload = getRequestJson();

if (isset($payload['id']) && isset($payload['name'])) {
    ensureTemplateContactFirst($payload);
} else if (is_array($payload)) {
    foreach ($payload as &$item) {
        ensureTemplateContactFirst($item);
    }
    unset($item);
}

$pdo = getPDO();

if ($pdo) {
    if (isset($payload['id']) && isset($payload['name'])) {
        // Lưu 1 mẫu đơn lẻ
        $tplJson = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $stmt = $pdo->prepare("
            INSERT INTO templates (id, name, category, description, data, is_active, created_at, updated_at)
            VALUES (:id, :name, :cat, :desc, :data, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE name = :name2, category = :cat2, description = :desc2, data = :data2, updated_at = NOW()
        ");
        $stmt->execute([
            'id' => $payload['id'],
            'name' => $payload['name'],
            'cat' => $payload['category'] ?? 'creative',
            'desc' => $payload['description'] ?? '',
            'data' => $tplJson,
            'name2' => $payload['name'],
            'cat2' => $payload['category'] ?? 'creative',
            'desc2' => $payload['description'] ?? '',
            'data2' => $tplJson
        ]);
    } else if (is_array($payload)) {
        // Lưu danh sách nhiều mẫu
        $stmt = $pdo->prepare("
            INSERT INTO templates (id, name, category, description, data, is_active, created_at, updated_at)
            VALUES (:id, :name, :cat, :desc, :data, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE name = :name2, category = :cat2, description = :desc2, data = :data2, updated_at = NOW()
        ");
        foreach ($payload as $t) {
            if (!empty($t['id']) && !empty($t['name'])) {
                $tJson = json_encode($t, JSON_UNESCAPED_UNICODE);
                $stmt->execute([
                    'id' => $t['id'],
                    'name' => $t['name'],
                    'cat' => $t['category'] ?? 'creative',
                    'desc' => $t['description'] ?? '',
                    'data' => $tJson,
                    'name2' => $t['name'],
                    'cat2' => $t['category'] ?? 'creative',
                    'desc2' => $t['description'] ?? '',
                    'data2' => $tJson
                ]);
            }
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu mẫu giao diện thành công vào MySQL!'
    ]);
} else {
    $db = readJsonDatabase();
    if (isset($payload['id'])) {
        $idx = -1;
        foreach ($db['customTemplates'] as $i => $t) {
            if ($t['id'] === $payload['id']) {
                $idx = $i;
                break;
            }
        }
        if ($idx !== -1) {
            $db['customTemplates'][$idx] = $payload;
        } else {
            array_unshift($db['customTemplates'], $payload);
        }
    } else if (is_array($payload)) {
        $db['customTemplates'] = $payload;
    }
    saveJsonDatabase($db);

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'message' => 'Đã lưu mẫu thành công!'
    ]);
}
