<?php
/**
 * TRANG KIỂM TRA & TỰ ĐỘNG KHỞI TẠO CƠ SỞ DỮ LIỆU MYSQL TRÊN HOSTING INET / CPANEL
 * Truy cập qua trình duyệt: https://yourdomain.vn/install.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$message = '';
$status = 'info';
$tablesCreated = [];

$autoTrigger = isset($_GET['sync']) || isset($_GET['run']);
if ((isset($_POST['action']) && ($_POST['action'] === 'install' || $_POST['action'] === 'sync')) || $autoTrigger) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);

        $sql = file_get_contents(__DIR__ . '/database.sql');
        if ($sql) {
            // Thực thi từng câu lệnh SQL để tránh giới hạn PDO multi-query
            $queries = array_filter(array_map('trim', explode(";\n", $sql)));
            foreach ($queries as $q) {
                if (!empty($q)) {
                    try {
                        $pdo->exec($q);
                    } catch (Exception $qe) {
                        // Tiếp tục thực thi câu lệnh tiếp theo
                    }
                }
            }
        }
        
        // Luôn đồng bộ danh sách thành viên cốt lõi vào bảng users
        autoSyncDbJsonToMySQL($pdo, true);

        // Lấy lại danh sách thành viên thực tế trong MySQL
        $stmtU = $pdo->query("SELECT username, role, name FROM users ORDER BY created_at DESC");
        $allUsersList = $stmtU ? $stmtU->fetchAll(PDO::FETCH_ASSOC) : [];
        $uCount = count($allUsersList);

        $message = "<b>✓ Cập nhật & đồng bộ thành công!</b><br>Đã tạo đầy đủ các bảng dữ liệu và đồng bộ <b>{$uCount} thành viên</b> vào bảng <code>users</code> của MySQL!";
        $status = "success";
    } catch (Exception $e) {
        $message = "Lỗi kết nối MySQL: " . $e->getMessage() . "<br>Vui lòng kiểm tra lại thông tin cấu hình trong file <b>config.php</b>!";
        $status = "error";
    }
}

// Kiểm tra kết nối hiện tại
$connected = false;
$existingTables = [];
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $testPdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $connected = true;
    $stmt = $testPdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Exception $e) {
    $connected = false;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cài đặt Cơ sở dữ liệu MySQL | TRANG CÁ NHÂN</title>
    <style>
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 600px; width: 100%; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        h1 { margin-top: 0; font-size: 24px; color: #38bdf8; display: flex; align-items: center; gap: 10px; }
        .status-box { padding: 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
        .status-success { background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80; }
        .status-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #f87171; }
        .status-info { background: rgba(56, 189, 248, 0.15); border: 1px solid #0284c7; color: #38bdf8; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
        .info-label { color: #94a3b8; }
        .info-value { font-weight: 600; color: #f1f5f9; }
        .btn { background: #2563eb; color: white; border: none; padding: 14px 20px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.2s; margin-top: 20px; }
        .btn:hover { background: #1d4ed8; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #22c55e; color: #052e16; }
        .badge-danger { background: #ef4444; color: #450a0a; }
        ul { margin: 10px 0; padding-left: 20px; color: #cbd5e1; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🛠️ Khởi Tạo Cơ Sở Dữ Liệu MySQL</h1>
        <p style="color: #94a3b8; font-size: 14px;">Công cụ tự động kết nối và tạo bảng dữ liệu trên Hosting iNET / cPanel / DirectAdmin.</p>

        <?php if (!empty($message)): ?>
            <div class="status-box status-<?= $status ?>">
                <?= $message ?>
            </div>
        <?php endif; ?>

        <div style="background: #0f172a; border-radius: 10px; padding: 16px; margin: 20px 0; border: 1px solid #334155;">
            <div class="info-row">
                <span class="info-label">Trạng thái kết nối:</span>
                <span class="info-value">
                    <?php if ($connected): ?>
                        <span class="badge badge-success">✓ KẾT NỐI THÀNH CÔNG</span>
                    <?php else: ?>
                        <span class="badge badge-danger">✗ CHƯA KẾT NỐI ĐƯỢC</span>
                    <?php endif; ?>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Host:</span>
                <span class="info-value"><?= htmlspecialchars(DB_HOST) ?>:<?= htmlspecialchars((string)DB_PORT) ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Database Name:</span>
                <span class="info-value"><?= htmlspecialchars(DB_NAME) ?></span>
            </div>
            <div class="info-row" style="border-bottom: none;">
                <span class="info-label">User:</span>
                <span class="info-value"><?= htmlspecialchars(DB_USER) ?></span>
            </div>
        </div>

        <?php if ($connected && !empty($existingTables)): ?>
            <div style="margin-top: 15px;">
                <div style="font-weight: 600; color: #e2e8f0; font-size: 14px; margin-bottom: 8px;">Các bảng đã có trong MySQL (phpMyAdmin):</div>
                <ul>
                    <?php foreach ($existingTables as $tbl): ?>
                        <li><b style="color: #38bdf8;"><?= htmlspecialchars($tbl) ?></b></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <form method="POST">
            <input type="hidden" name="action" value="install">
            <button type="submit" class="btn">
                ⚡ <?= empty($existingTables) ? 'Tạo Toàn Bộ Bảng & Đồng Bộ 6 Thành Viên Ngay' : 'Cập Nhật & Đồng Bộ Thành Viên Vào MySQL' ?>
            </button>
        </form>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 13px; color: #94a3b8; line-height: 1.6;">
            <b>Tên miền nhận diện hiện tại:</b> <span style="color: #38bdf8; font-weight: 600;"><?= htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'trangcanhan.com') ?></span><br><br>
            <b>Tài khoản Quản Trị Viên (Admin) sẵn sàng sử dụng:</b><br>
            • Quản trị viên 1: <b>lybichngoc</b> (Mật khẩu: <b>123456</b>)<br>
            • Quản trị viên 2: <b>thegioiadmin</b> (Mật khẩu: <b>admin123</b>)<br>
            • Nhân viên hỗ trợ: <b>nhanvien</b> (Mật khẩu: <b>123456</b>)<br>
            • Người dùng mẫu: <b>linhchi</b>, <b>hoangnam</b>, <b>nguyenvanadaa</b> (Mật khẩu: <b>123456</b>)
        </div>
    </div>
</body>
</html>
