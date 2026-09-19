# HƯỚNG DẪN TRIỂN KHAI VÀ KẾT NỐI DATABASE MYSQL TRÊN HOSTING INET / CPANEL

## Nền Tảng Bio Link & Trang Cá Nhân Chuyên Nghiệp

Hệ thống được thiết kế hỗ trợ **100% Cơ sở dữ liệu MySQL thật (quản lý qua phpMyAdmin trên hosting iNET, cPanel, DirectAdmin)** kết hợp cùng Single Page App React siêu mượt.

---

### BƯỚC 1: TẠO DATABASE & USER TRÊN HOSTING INET (CPANEL)

1. Đăng nhập vào trang quản trị Hosting iNET (cPanel).
2. Tìm và bấm vào mục **MySQL® Databases** (hoặc **MySQL Database Wizard**):
   - **Tạo Database:** Ví dụ đặt tên là `inet_biolink` (Tên đầy đủ có thể là `usercpanel_biolink`).
   - **Tạo User MySQL:** Ví dụ đặt tên là `inet_dbuser` và đặt mật khẩu mạnh (ví dụ: `MatKhauBaoMat@2026`).
   - **Gán User vào Database:** Chọn User vừa tạo, chọn Database vừa tạo, bấm **Add** -> Tích chọn **ALL PRIVILEGES (Toàn quyền)** -> Bấm **Make Changes**.

---

### BƯỚC 2: CẤU HÌNH THÔNG TIN KẾT NỐI TRONG FILE `config.php`

Mở file **`public/config.php`** (hoặc mở file `config.php` trong thư mục `public_html` sau khi giải nén) và điền thông tin database bạn vừa tạo ở Bước 1:

```php
<?php
// Cấu hình kết nối MySQL trên Hosting iNET
define('DB_HOST', 'localhost');                  // Thường là localhost trên iNET
define('DB_PORT', 3306);
define('DB_NAME', 'usercpanel_biolink');         // Tên Database thật trên hosting
define('DB_USER', 'usercpanel_dbuser');          // Tên User Database thật
define('DB_PASS', 'MatKhauBaoMat@2026');         // Mật khẩu User Database
```

---

### BƯỚC 3: NHẬP DỮ LIỆU BAN ĐẦU VÀO PHPMYADMIN (CHỌN 1 TRONG 2 CÁCH)

#### Cách 1: Sử dụng công cụ tự động 1-Click (Khuyên dùng - Cực dễ)
Sau khi upload source code lên hosting, bạn chỉ cần mở trình duyệt và truy cập:
👉 `https://tenmien-cua-ban.vn/install.php`

Trang sẽ hiển thị trạng thái kết nối MySQL và có nút **"Tạo Toàn Bộ Bảng Dữ Liệu Ngay"**. Bấm vào nút này, hệ thống sẽ tự động tạo đầy đủ các bảng:
- `users`: Quản lý tài khoản, số dư, chức vụ, trạng thái xác minh KYC.
- `bios`: Quản lý cấu hình trang bio của từng người dùng.
- `templates`: Kho giao diện mẫu do Admin quản lý.
- `system_config`: Cấu hình hệ thống toàn diện.
- `transactions`: Lịch sử nạp/rút/cộng trừ tiền.
- `support_tickets`: Yêu cầu CSKH.

#### Cách 2: Import thủ công qua phpMyAdmin
1. Trên cPanel, bấm vào **phpMyAdmin**.
2. Chọn Database bạn đã tạo ở cột bên trái.
3. Bấm vào tab **Import** (Nhập).
4. Bấm **Choose File** (Chọn tệp) -> Chọn file **`database.sql`** (có sẵn trong source code).
5. Kéo xuống dưới cùng và bấm **Go / Thực hiện**.

---

### BƯỚC 4: ĐÓNG GÓI & UPLOAD LÊN HOSTING (CHỌN 1 TRONG 2 CÁCH)

#### CÁCH 1: DÙNG BẢN ĐÃ ĐÓNG GÓI SẴN (CỰC NHANH - KHÔNG CẦN CÀI NODE.JS)
Trong source code đã có sẵn file nén hoàn chỉnh sẵn sàng cho hosting:
👉 File: `public/dist_inet_ready.zip` (hoặc tải trực tiếp từ đường dẫn `/dist_inet_ready.zip`).
- Bạn chỉ cần upload thẳng file `dist_inet_ready.zip` lên thư mục `public_html` trên hosting iNET (cPanel).
- Bấm chuột phải -> Chọn **Extract (Giải nén)**.
- Mở file `config.php` điền tên database, user, password MySQL là xong ngay!

#### CÁCH 2: TỰ BUILD TRÊN MÁY TÍNH CÁ NHÂN (NẾU CÓ NODE.JS)
1. **LƯU Ý QUAN TRỌNG:** Khi tải mã nguồn từ Google AI Studio / Git về, bạn **BẮT BUỘC** phải cài đặt thư viện trước bằng lệnh:
   ```bash
   npm install
   ```
   *(Nếu không chạy `npm install` mà chạy ngay `npm run build`, máy tính sẽ báo lỗi không tìm thấy `vite` vì file ZIP tải về là mã nguồn gốc sạch, không kèm theo thư mục nặng `node_modules`)*.

2. Sau khi `npm install` hoàn tất, chạy lệnh build cho Hosting:
   ```bash
   npm run build:hosting
   ```
   *(hoặc lệnh `npm run build`)*.

3. Thư mục **`dist/`** sẽ được tạo ra, chứa toàn bộ giao diện đã tối ưu cùng các file backend PHP (`login.php`, `register.php`, `save_bio.php`, `get_users.php`, `adjust_balance.php`, `get_templates.php`, `upload.php`, `config.php`, `.htaccess`, `database.sql`...).
4. Nén toàn bộ file & thư mục **BÊN TRONG thư mục `dist/`** thành file `.zip`.
5. Mở **File Manager** trên iNET cPanel -> Truy cập thư mục **`public_html`** -> Upload file `.zip` lên và chọn **Extract (Giải nén)**.
6. Cấp quyền **755** (hoặc 777) cho thư mục **`uploads/`** để hỗ trợ người dùng upload ảnh đại diện và tài liệu KYC.

---

### BƯỚC 5: ĐĂNG NHẬP QUẢN TRỊ VIÊN (ADMIN)

- **Đường dẫn quản trị:** `https://tenmien-cua-ban.vn/admin`
- **Tài khoản:** `thegioiadmin` (hoặc Email: `thegioiadmin@gmail.com`)
- **Mật khẩu:** `admin123`

### CÁC TÍNH NĂNG ĐÃ ĐỒNG BỘ THỜI GIAN THỰC VỚI MYSQL:
- **Đăng ký / Đăng nhập:** Dữ liệu người dùng mới được lưu trực tiếp vào bảng `users` trong MySQL / phpMyAdmin.
- **Thay đổi mẫu giao diện:** Khi Admin tạo mẫu mới hoặc chỉnh sửa mẫu, dữ liệu được ghi vào bảng `templates` & `system_config`, tất cả người dùng và khách truy cập đều nhìn thấy cập nhật ngay lập tức.
- **Cộng/Trừ tiền thủ công:** Khi Admin bấm nút Cộng tiền trong Quản lý người dùng, số dư được cập nhật trực tiếp vào MySQL và ghi nhận lịch sử vào bảng `transactions`.
