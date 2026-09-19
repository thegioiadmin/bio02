<?php
/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU MYSQL / PHPMYADMIN (HOSTINGER / CPANEL / INET)
 * ==============================================================================
 * 
 * HƯỚNG DẪN CẤU HÌNH TRÊN HOSTINGER (hPanel):
 * 1. Đăng nhập hPanel Hostinger -> Chọn website của bạn -> Bấm "Quản lý" (Manage).
 * 2. Tìm mục "Databases" (Cơ sở dữ liệu) -> "MySQL Databases":
 *    - Tên CSDL (MySQL Database name): Ví dụ nhập `trangcanhan` -> Hệ thống sẽ tạo `u123456789_trangcanhan`
 *    - Tên người dùng (MySQL Username): Ví dụ nhập `admin` -> Hệ thống sẽ tạo `u123456789_admin`
 *    - Mật khẩu (Password): Nhập mật khẩu bạn tự đặt
 *    - Bấm "Tạo" (Create).
 * 3. Điền đúng các thông tin có tiền tố `u123...` vào các biến DB_NAME, DB_USER, DB_PASS bên dưới.
 *    (Hostinger luôn dùng DB_HOST là 'localhost' hoặc '127.0.0.1').
 */

define('DB_HOST', 'localhost');              // Thông thường trên Hostinger là 'localhost' hoặc '127.0.0.1'
define('DB_PORT', 3306);                     // Cổng mặc định MySQL: 3306
define('DB_NAME', 'u492841778_trangcanhan'); // Tên Database Hostinger
define('DB_USER', 'u492841778_trangcanhan'); // Tên User Database Hostinger
define('DB_PASS', 'Thangngoc91!');           // Mật khẩu User Database Hostinger

// Thiết lập múi giờ Việt Nam
date_default_timezone_set('Asia/Ho_Chi_Minh');

// CORS Headers cho phép gọi API từ frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
