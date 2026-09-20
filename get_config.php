<?php
/**
 * API: Lấy cấu hình hệ thống toàn diện & Kho mẫu giao diện từ MySQL
 */
require_once __DIR__ . '/db.php';

$pdo = getPDO();

if ($pdo) {
    $stmt = $pdo->query("SELECT config FROM system_config WHERE id = 1 LIMIT 1");
    $row = $stmt->fetch();
    $config = [];
    if ($row && !empty($row['config'])) {
        $config = json_decode($row['config'], true) ?: [];
    }

    // Lấy thêm danh sách mẫu tùy chỉnh từ bảng templates nếu có
    $stmtTpl = $pdo->query("SELECT * FROM templates WHERE is_active = 1 ORDER BY updated_at DESC");
    $dbTemplates = $stmtTpl->fetchAll();
    if (!empty($dbTemplates)) {
        $tplList = [];
        foreach ($dbTemplates as $t) {
            $tplData = json_decode($t['data'], true);
            if ($tplData && is_array($tplData)) {
                $tplList[] = array_merge($tplData, [
                    'id' => $t['id'],
                    'name' => $t['name'],
                    'category' => $t['category'] ?? $tplData['category'] ?? 'creative',
                    'description' => $t['description'] ?? $tplData['description'] ?? ''
                ]);
            }
        }
        if (!empty($tplList)) {
            $config['customTemplates'] = $tplList;
        }
    }

    if (empty($config['articles'])) {
        $db = readJsonDatabase();
        if (!empty($db['articles'])) {
            $config['articles'] = $db['articles'];
        }
    }

    // Chuẩn hóa trạng thái banner thông báo chạy dòng đầu trang
    if (isset($config['announcementActive'])) {
        $val = $config['announcementActive'];
        $config['announcementActive'] = ($val === true || $val === 'true' || $val === 1 || $val === '1');
    } else {
        $config['announcementActive'] = false;
    }

    // Tự động nhận diện tên miền thực tế trên Hosting cPanel / iNET
    $httpHost = $_SERVER['HTTP_HOST'] ?? '';
    $cleanHost = preg_replace('/:\d+$/', '', $httpHost);
    $isAiStudio = (strpos($cleanHost, 'run.app') !== false || strpos($cleanHost, 'ais-') !== false || strpos($cleanHost, 'localhost') !== false);
    if (empty($config['mainDomain']) || strpos($config['mainDomain'], 'run.app') !== false || strpos($config['mainDomain'], 'ais-dev') !== false) {
        if (!empty($cleanHost) && !$isAiStudio) {
            $config['mainDomain'] = $cleanHost;
        } else if (empty($config['mainDomain'])) {
            $config['mainDomain'] = !empty($cleanHost) ? $cleanHost : 'trangcanhan.com';
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'config' => $config
    ]);
} else {
    $db = readJsonDatabase();
    $config = $db['systemConfig'] ?? [];
    if (!empty($db['customTemplates'])) {
        $config['customTemplates'] = $db['customTemplates'];
    }
    if (empty($config['articles']) && !empty($db['articles'])) {
        $config['articles'] = $db['articles'];
    }
    if (isset($config['announcementActive'])) {
        $val = $config['announcementActive'];
        $config['announcementActive'] = ($val === true || $val === 'true' || $val === 1 || $val === '1');
    } else {
        $config['announcementActive'] = false;
    }

    // Tự động nhận diện tên miền thực tế trên Hosting cPanel / iNET
    $httpHost = $_SERVER['HTTP_HOST'] ?? '';
    $cleanHost = preg_replace('/:\d+$/', '', $httpHost);
    $isAiStudio = (strpos($cleanHost, 'run.app') !== false || strpos($cleanHost, 'ais-') !== false || strpos($cleanHost, 'localhost') !== false);
    if (empty($config['mainDomain']) || strpos($config['mainDomain'], 'run.app') !== false || strpos($config['mainDomain'], 'ais-dev') !== false) {
        if (!empty($cleanHost) && !$isAiStudio) {
            $config['mainDomain'] = $cleanHost;
        } else if (empty($config['mainDomain'])) {
            $config['mainDomain'] = !empty($cleanHost) ? $cleanHost : 'trangcanhan.com';
        }
    }

    sendJsonResponse([
        'status' => 'success',
        'success' => true,
        'config' => $config
    ]);
}
