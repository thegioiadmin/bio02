# HƯỚNG DẪN TRIỂN KHAI VÀ KẾT NỐI DATABASE MYSQL TRÊN HOSTING HOSTINGER (HPANEL)

## Nền Tảng Bio Link & Trang Cá Nhân Chuyên Nghiệp

Hệ thống được thiết kế tương thích 100% với **Hostinger Web Hosting (quản lý qua hPanel / phpMyAdmin, hỗ trợ PHP 7.4 - 8.3 & MySQL)** kết hợp cùng giao diện React hiện đại, mượt mà và bảo mật.

---

### BƯỚC 1: TẠO DATABASE & USER TRÊN HOSTINGER (HPANEL)

1. Đăng nhập vào trang quản trị **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Vào mục **Websites** -> Chọn website của bạn -> Bấm **Manage** (Quản lý).
3. Ở menu bên trái, tìm mục **Databases** (Cơ sở dữ liệu) -> Bấm **Management** (Quản lý cơ sở dữ liệu MySQL):
   - **MySQL Database Name:** Nhập tên cơ sở dữ liệu (Ví dụ: `u123456789_biolink`).
   - **MySQL Username:** Nhập tên người dùng MySQL (Ví dụ: `u123456789_admin`).
   - **Password:** Nhập mật khẩu bảo mật (Lưu lại để dùng ở bước tiếp theo).
4. Bấm **Create** (Tạo).

---

### BƯỚC 2: CẤU HÌNH THÔNG TIN KẾT NỐI TRONG FILE `config.php`

Mở file **`config.php`** (nằm trực tiếp trong thư mục `public_html` trên Hostinger) và điền thông tin database bạn vừa tạo ở Bước 1:

```php
<?php
// Cấu hình kết nối MySQL trên Hosting Hostinger
define('DB_HOST', 'localhost');                  // Thường là localhost trên Hostinger
define('DB_PORT', 3306);
define('DB_NAME', 'u123456789_biolink');         // Tên Database thật trên Hostinger
define('DB_USER', 'u123456789_admin');           // Tên User Database thật trên Hostinger
define('DB_PASS', 'MatKhauCuaBan@2026');         // Mật khẩu User Database
```

---

### BƯỚC 3: KHỞI TẠO CƠ SỞ DỮ LIỆU (CHỌN 1 TRONG 2 CÁCH)

#### Cách 1: Sử dụng công cụ tự động 1-Click (Khuyên dùng - Cực nhanh)
Sau khi upload mã nguồn lên `public_html`, bạn chỉ cần mở trình duyệt và truy cập:
👉 `https://tenmien-cua-ban.com/install.php`

Trang sẽ hiển thị trạng thái kết nối MySQL và có nút **"Tạo Toàn Bộ Bảng Dữ Liệu Ngay"**. Bấm vào nút này, hệ thống sẽ tự động tạo đầy đủ các bảng dữ liệu:
- `users`: Quản lý tài khoản, số dư ví, chức vụ, nhân viên & trạng thái KYC.
- `bios`: Quản lý cấu hình trang bio của từng người dùng.
- `templates`: Kho giao diện mẫu do Admin quản lý.
- `system_config`: Cấu hình hệ thống, loa thông báo, bảng giá, chân trang Bộ Công Thương & bài viết điều khoản.
- `transactions`: Lịch sử nạp/rút/cộng trừ tiền và tra soát tự động VietQR / SePay.
- `support_tickets`: Yêu cầu trợ giúp & CSKH.

#### Cách 2: Import thủ công qua phpMyAdmin trên Hostinger
1. Trong mục **Databases** trên hPanel, bấm nút **Enter phpMyAdmin** bên cạnh Database bạn vừa tạo.
2. Bấm vào tab **Import** (Nhập).
3. Bấm **Choose File** (Chọn tệp) -> Chọn file **`database.sql`**.
4. Bấm **Go / Import** (Thực hiện).

---

### BƯỚC 4: UPLOAD LÊN HOSTINGER (FILE MANAGER)

1. Mở **File Manager** (Trình quản lý tệp) trên Hostinger hPanel.
2. Truy cập vào thư mục **`public_html`**.
3. Upload toàn bộ các file mã nguồn (hoặc upload file nén `dist.zip` / `dist_hostinger_ready.zip` rồi bấm **Extract** giải nén trực tiếp vào `public_html`).
4. Đảm bảo cấu trúc file trong `public_html`:
   - `index.html`
   - `.htaccess`
   - `config.php`
   - `db.php`
   - `get_config.php`, `save_config.php`, `get_articles.php`, `save_article.php`...
   - Thư mục `assets/`
   - Thư mục `uploads/` (cấp quyền ghi 755 hoặc 777 cho thư mục này để hỗ trợ upload avatar và tài liệu).

---

### BƯỚC 5: ĐĂNG NHẬP QUẢN TRỊ VIÊN (ADMIN)

- **Đường dẫn quản trị:** `https://tenmien-cua-ban.com/admin`
- **Tài khoản:** `thegioiadmin` (hoặc Email: `thegioiadmin@gmail.com`)
- **Mật khẩu:** `admin123`
