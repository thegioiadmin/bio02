<?php
/**
 * DB Core Helper: Kết nối MySQL PDO & Hỗ trợ chuyển đổi dữ liệu thời gian thực
 */

require_once __DIR__ . '/config.php';

function getPDO(): ?PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    if (empty(DB_NAME) || empty(DB_USER) || DB_NAME === 'biolink_db' && DB_PASS === '') {
        // Có thể thử kết nối local nếu có
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        ensureTablesExist($pdo);
        autoSyncDbJsonToMySQL($pdo);
        return $pdo;
    } catch (Exception $e) {
        // Không thể kết nối MySQL -> sẽ fallback sang file JSON nếu cần
        return null;
    }
}

function ensureTablesExist(PDO $pdo): void {
    static $tablesChecked = false;
    if ($tablesChecked) return;

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `users` (
              `id` VARCHAR(100) NOT NULL PRIMARY KEY,
              `username` VARCHAR(100) NOT NULL UNIQUE,
              `password` VARCHAR(255) NOT NULL,
              `email` VARCHAR(150) NULL,
              `phone` VARCHAR(50) NULL,
              `name` VARCHAR(255) NULL,
              `avatar_url` TEXT NULL,
              `role` VARCHAR(50) DEFAULT 'user',
              `is_staff` TINYINT(1) DEFAULT 0,
              `staff_position` VARCHAR(50) NULL,
              `staff_role_badge` VARCHAR(50) NULL,
              `staff_permissions` TEXT NULL,
              `staff_department` VARCHAR(100) NULL,
              `staff_title` VARCHAR(100) NULL,
              `status` VARCHAR(50) DEFAULT 'active',
              `plan` VARCHAR(50) DEFAULT 'free',
              `plan_expires_at` VARCHAR(50) NULL,
              `verified` TINYINT(1) DEFAULT 0,
              `verification_status` VARCHAR(50) DEFAULT 'unverified',
              `verification_request_id` VARCHAR(100) NULL,
              `verification_rejection_reason` TEXT NULL,
              `balance` BIGINT DEFAULT 0,
              `account_type` VARCHAR(50) DEFAULT 'personal',
              `business_name` VARCHAR(255) NULL,
              `tax_code` VARCHAR(50) NULL,
              `industry` VARCHAR(100) NULL,
              `custom_domain` VARCHAR(255) NULL,
              `bio_count` INT DEFAULT 1,
              `total_views` INT DEFAULT 0,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX `idx_username` (`username`),
              INDEX `idx_email` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `bios` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `username` VARCHAR(100) NOT NULL UNIQUE,
              `config` LONGTEXT NOT NULL,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX `idx_bio_username` (`username`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `system_config` (
              `id` INT PRIMARY KEY DEFAULT 1,
              `config` LONGTEXT NOT NULL,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `templates` (
              `id` VARCHAR(100) NOT NULL PRIMARY KEY,
              `name` VARCHAR(255) NOT NULL,
              `category` VARCHAR(100) NULL,
              `description` TEXT NULL,
              `data` LONGTEXT NOT NULL,
              `is_active` TINYINT(1) DEFAULT 1,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS `transactions` (
              `id` VARCHAR(100) NOT NULL PRIMARY KEY,
              `user_id` VARCHAR(100) NOT NULL,
              `type` VARCHAR(50) NOT NULL,
              `amount` BIGINT NOT NULL,
              `description` TEXT NULL,
              `status` VARCHAR(50) DEFAULT 'completed',
              `payment_method` VARCHAR(50) DEFAULT 'balance',
              `reference_code` VARCHAR(100) NULL,
              `receipt_note` TEXT NULL,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX `idx_tx_user` (`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Safe auto-migration: Ensure all columns exist in `users` table
        $columns = [
            'password' => "VARCHAR(255) NOT NULL DEFAULT '123456'",
            'phone' => "VARCHAR(50) NULL",
            'avatar_url' => "TEXT NULL",
            'avatarUrl' => "TEXT NULL",
            'dob' => "VARCHAR(50) NULL",
            'id_number' => "VARCHAR(50) NULL",
            'idNumber' => "VARCHAR(50) NULL",
            'address' => "TEXT NULL",
            'is_staff' => "TINYINT(1) DEFAULT 0",
            'staff_position' => "VARCHAR(50) NULL",
            'staff_role_badge' => "VARCHAR(50) NULL",
            'staff_permissions' => "TEXT NULL",
            'staff_department' => "VARCHAR(100) NULL",
            'staff_title' => "VARCHAR(100) NULL",
            'status' => "VARCHAR(50) DEFAULT 'active'",
            'plan' => "VARCHAR(50) DEFAULT 'free'",
            'plan_expires_at' => "VARCHAR(50) NULL",
            'verified' => "TINYINT(1) DEFAULT 0",
            'verification_status' => "VARCHAR(50) DEFAULT 'unverified'",
            'verification_request_id' => "VARCHAR(100) NULL",
            'verification_rejection_reason' => "TEXT NULL",
            'balance' => "BIGINT DEFAULT 0",
            'account_type' => "VARCHAR(50) DEFAULT 'personal'",
            'business_name' => "VARCHAR(255) NULL",
            'tax_code' => "VARCHAR(50) NULL",
            'industry' => "VARCHAR(100) NULL",
            'custom_domain' => "VARCHAR(255) NULL",
            'bio_count' => "INT DEFAULT 1",
            'total_views' => "INT DEFAULT 0",
            'updated_at' => "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];

        foreach ($columns as $col => $definition) {
            try {
                $check = $pdo->query("SHOW COLUMNS FROM `users` LIKE '{$col}'");
                if ($check && $check->rowCount() === 0) {
                    $pdo->exec("ALTER TABLE `users` ADD COLUMN `{$col}` {$definition}");
                }
            } catch (Exception $ex) {}
        }

        $tablesChecked = true;
    } catch (Exception $e) {
        // Table creation warning
    }
}

function autoSyncDbJsonToMySQL(PDO $pdo, bool $force = false): void {
    static $syncedOnce = false;
    if ($syncedOnce && !$force) return;
    $syncedOnce = true;

    try {
        $jsonFile = __DIR__ . '/data/db.json';
        if (!file_exists($jsonFile)) return;
        $content = file_get_contents($jsonFile);
        if (!$content) return;
        $db = json_decode($content, true);
        if (!$db) return;

        // 1. Kiểm tra danh sách người dùng hiện có trong MySQL
        $stmtCheck = $pdo->query("SELECT LOWER(username) FROM `users`");
        $existingUsernames = $stmtCheck ? $stmtCheck->fetchAll(PDO::FETCH_COLUMN) : [];
        $existingMap = array_flip(array_map('strtolower', $existingUsernames));

        // Đồng bộ người dùng nếu thiếu bất kỳ người dùng nào từ db.json
        if (!empty($db['users']) && is_array($db['users'])) {
            foreach ($db['users'] as $u) {
                $uName = strtolower(trim($u['username'] ?? ''));
                if (empty($uName)) continue;
                if (!isset($existingMap[$uName])) {
                    upsertUserInDatabase($pdo, $u);
                    $existingMap[$uName] = true;
                }
            }
        }

        // Đảm bảo các tài khoản cốt lõi luôn có thông tin chuẩn
        $pdo->exec("UPDATE `users` SET `password` = 'admin123', `role` = 'admin', `plan` = 'vip' WHERE `username` = 'thegioiadmin' AND (`password` IS NULL OR `password` = '' OR `password` = '123456')");
        $pdo->exec("UPDATE `users` SET `password` = '123456', `role` = 'admin', `plan` = 'vip' WHERE `username` = 'lybichngoc' AND (`password` IS NULL OR `password` = '')");

        // 2. Đồng bộ các trang Bios nếu chưa có trong MySQL
        if (!empty($db['bios']) && is_array($db['bios'])) {
            $stmtBioCheck = $pdo->query("SELECT LOWER(username) FROM `bios`");
            $existingBios = $stmtBioCheck ? $stmtBioCheck->fetchAll(PDO::FETCH_COLUMN) : [];
            $existingBioMap = array_flip(array_map('strtolower', $existingBios));

            $stmtInsertBio = $pdo->prepare("INSERT INTO `bios` (`username`, `config`, `created_at`, `updated_at`) VALUES (:u, :c, NOW(), NOW())");
            foreach ($db['bios'] as $bUser => $bConfig) {
                $bUserLower = strtolower(trim($bUser));
                if (empty($bUserLower)) continue;
                if (!isset($existingBioMap[$bUserLower])) {
                    $stmtInsertBio->execute([
                        'u' => $bUserLower,
                        'c' => is_string($bConfig) ? $bConfig : json_encode($bConfig, JSON_UNESCAPED_UNICODE)
                    ]);
                    $existingBioMap[$bUserLower] = true;
                }
            }
        }

        // 3. Đồng bộ System Config và làm sạch mainDomain (loại bỏ ais-dev / run.app)
        $stmtCfg = $pdo->query("SELECT `config` FROM `system_config` WHERE `id` = 1 LIMIT 1");
        $rowCfg = $stmtCfg ? $stmtCfg->fetch() : null;
        if (!$rowCfg && !empty($db['systemConfig'])) {
            $cfg = $db['systemConfig'];
            $cfg['mainDomain'] = '';
            $stmtInsCfg = $pdo->prepare("INSERT INTO `system_config` (`id`, `config`, `updated_at`) VALUES (1, :c, NOW())");
            $stmtInsCfg->execute(['c' => json_encode($cfg, JSON_UNESCAPED_UNICODE)]);
        } else if ($rowCfg && !empty($rowCfg['config'])) {
            $currentCfg = json_decode($rowCfg['config'], true);
            if ($currentCfg && is_array($currentCfg)) {
                $needsUpdate = false;
                if (!empty($currentCfg['mainDomain']) && (strpos($currentCfg['mainDomain'], 'run.app') !== false || strpos($currentCfg['mainDomain'], 'ais-dev') !== false)) {
                    $currentCfg['mainDomain'] = '';
                    $needsUpdate = true;
                }
                // Tự động bổ sung các bài viết chính sách nếu CSDL chưa có
                if (empty($currentCfg['articles']) && !empty($db['systemConfig']['articles'])) {
                    $currentCfg['articles'] = $db['systemConfig']['articles'];
                    $needsUpdate = true;
                }
                // Tự động bổ sung cấu hình chân trang Bộ Công Thương nếu CSDL chưa có
                if (empty($currentCfg['footerConfig']['columns']) && !empty($db['systemConfig']['footerConfig']['columns'])) {
                    $currentCfg['footerConfig'] = $db['systemConfig']['footerConfig'];
                    $needsUpdate = true;
                }
                if ($needsUpdate) {
                    $stmtUpdCfg = $pdo->prepare("UPDATE `system_config` SET `config` = :c, `updated_at` = NOW() WHERE `id` = 1");
                    $stmtUpdCfg->execute(['c' => json_encode($currentCfg, JSON_UNESCAPED_UNICODE)]);
                }
            }
        }
    } catch (Exception $e) {
        // Silent catch for smooth execution
    }
}

function getTableColumns(PDO $pdo, string $table): array {
    static $cache = [];
    if (isset($cache[$table])) return $cache[$table];
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$table}`");
        $cols = [];
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if (!empty($row['Field'])) {
                    $cols[$row['Field']] = true;
                }
            }
        }
        $cache[$table] = $cols;
        return $cols;
    } catch (Exception $e) {
        return [];
    }
}

function upsertUserInDatabase(PDO $pdo, array $u): array {
    $uName = strtolower(trim($u['username'] ?? ''));
    if (empty($uName) && !empty($u['email'])) {
        $uName = strtolower(explode('@', $u['email'])[0]);
    }
    if (empty($uName) && !empty($u['phone'])) {
        $uName = 'user_' . preg_replace('/[^0-9]/', '', $u['phone']);
    }
    $cleanUsername = preg_replace('/[^a-z0-9_-]/i', '', $uName) ?: ('user_' . time());
    
    $uId = $u['id'] ?? $u['userId'] ?? ('usr_' . time() . '_' . substr(md5($cleanUsername), 0, 5));
    $uPass = $u['password'] ?? $u['pass'] ?? '123456';
    $uEmail = strtolower(trim($u['email'] ?? ''));
    $uPhone = trim($u['phone'] ?? '');
    $uDisplayName = trim($u['name'] ?? $cleanUsername);
    $uAvatar = $u['avatarUrl'] ?? $u['avatar_url'] ?? "https://api.dicebear.com/7.x/bottts/svg?seed={$cleanUsername}";
    $uDob = $u['dob'] ?? null;
    $uIdNumber = $u['idNumber'] ?? $u['id_number'] ?? null;
    $uAddress = $u['address'] ?? null;
    $uRole = $u['role'] ?? ($cleanUsername === 'thegioiadmin' || strpos($uEmail, 'admin') !== false ? 'admin' : 'user');
    $uIsStaff = (!empty($u['isStaff']) || !empty($u['is_staff'])) ? 1 : 0;
    $uStaffPos = $u['staffPosition'] ?? $u['staff_position'] ?? null;
    $uStaffBadge = $u['staffRoleBadge'] ?? $u['staff_role_badge'] ?? null;
    $perms = $u['staffPermissions'] ?? $u['staff_permissions'] ?? null;
    $uStaffPerms = is_array($perms) ? json_encode($perms, JSON_UNESCAPED_UNICODE) : $perms;
    $uStaffDept = $u['staffDepartment'] ?? $u['staff_department'] ?? null;
    $uStaffTitle = $u['staffTitle'] ?? $u['staff_title'] ?? null;
    $uStatus = $u['status'] ?? 'active';
    $uPlan = $u['plan'] ?? ($uRole === 'admin' ? 'vip' : 'free');
    $uPlanExp = $u['planExpiresAt'] ?? $u['plan_expires_at'] ?? null;
    $uVerified = (!empty($u['verified']) || $uRole === 'admin') ? 1 : 0;
    $uVerStatus = $u['verificationStatus'] ?? $u['verification_status'] ?? ($uVerified ? 'approved' : 'unverified');
    $uVerReason = $u['verificationRejectionReason'] ?? $u['verification_rejection_reason'] ?? null;
    $uBalance = isset($u['balance']) ? (int)$u['balance'] : ($uRole === 'admin' ? 5000000 : 0);
    $uAccType = $u['accountType'] ?? $u['account_type'] ?? 'personal';
    $uBizName = $u['businessName'] ?? $u['business_name'] ?? null;
    $uTaxCode = $u['taxCode'] ?? $u['tax_code'] ?? null;
    $uIndustry = $u['industry'] ?? null;
    $uDomain = $u['customDomain'] ?? $u['custom_domain'] ?? null;
    $uBioCount = isset($u['bioCount']) ? (int)$u['bioCount'] : (isset($u['bio_count']) ? (int)$u['bio_count'] : 1);
    $uViews = isset($u['totalViews']) ? (int)$u['totalViews'] : (isset($u['total_views']) ? (int)$u['total_views'] : 0);
    $uCreatedAt = $u['createdAt'] ?? $u['created_at'] ?? date('Y-m-d H:i:s');

    $existingCols = getTableColumns($pdo, 'users');
    if (empty($existingCols)) {
        // Default fallback if SHOW COLUMNS fails
        $existingCols = ['id' => true, 'username' => true, 'password' => true, 'name' => true, 'email' => true, 'phone' => true];
    }

    // Check if user exists by ID or username or email
    $stmtFind = $pdo->prepare("SELECT id FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
    $stmtFind->execute(['id' => $uId, 'u' => $cleanUsername]);
    $found = $stmtFind->fetch();

    $dataMap = [
        'id' => $uId,
        'username' => $cleanUsername,
        'password' => $uPass,
        'name' => $uDisplayName,
        'email' => $uEmail,
        'phone' => $uPhone,
        'avatar_url' => $uAvatar,
        'avatarUrl' => $uAvatar,
        'dob' => $uDob,
        'id_number' => $uIdNumber,
        'idNumber' => $uIdNumber,
        'address' => $uAddress,
        'role' => $uRole,
        'is_staff' => $uIsStaff,
        'isStaff' => $uIsStaff,
        'staff_position' => $uStaffPos,
        'staffPosition' => $uStaffPos,
        'staff_role_badge' => $uStaffBadge,
        'staffRoleBadge' => $uStaffBadge,
        'staff_permissions' => $uStaffPerms,
        'staffPermissions' => $uStaffPerms,
        'staff_department' => $uStaffDept,
        'staffDepartment' => $uStaffDept,
        'staff_title' => $uStaffTitle,
        'staffTitle' => $uStaffTitle,
        'status' => $uStatus,
        'plan' => $uPlan,
        'plan_expires_at' => $uPlanExp,
        'planExpiresAt' => $uPlanExp,
        'verified' => $uVerified,
        'verification_status' => $uVerStatus,
        'verificationStatus' => $uVerStatus,
        'verification_rejection_reason' => $uVerReason,
        'verificationRejectionReason' => $uVerReason,
        'balance' => $uBalance,
        'account_type' => $uAccType,
        'accountType' => $uAccType,
        'business_name' => $uBizName,
        'businessName' => $uBizName,
        'tax_code' => $uTaxCode,
        'taxCode' => $uTaxCode,
        'industry' => $uIndustry,
        'custom_domain' => $uDomain,
        'customDomain' => $uDomain,
        'bio_count' => $uBioCount,
        'bioCount' => $uBioCount,
        'total_views' => $uViews,
        'totalViews' => $uViews,
        'created_at' => $uCreatedAt,
        'createdAt' => $uCreatedAt
    ];

    // Filter to only columns that actually exist in MySQL table
    $insertCols = [];
    $insertParams = [];
    $insertPlaceholders = [];
    $updatePairs = [];

    foreach ($dataMap as $col => $val) {
        if (isset($existingCols[$col])) {
            $insertCols[] = "`{$col}`";
            $placeholder = ":{$col}";
            $insertPlaceholders[] = $placeholder;
            $insertParams[$col] = $val;
            if ($col !== 'id' && $col !== 'created_at' && $col !== 'createdAt') {
                $updatePairs[] = "`{$col}` = :up_{$col}";
            }
        }
    }

    if ($found) {
        // Update
        $realId = $found['id'];
        $updateFields = [];
        $updateValues = ['u_id' => $realId];
        foreach ($dataMap as $col => $val) {
            if (isset($existingCols[$col]) && $col !== 'id' && $col !== 'created_at' && $col !== 'createdAt') {
                $updateFields[] = "`{$col}` = :{$col}";
                $updateValues[$col] = $val;
            }
        }
        if (!empty($updateFields)) {
            $sql = "UPDATE `users` SET " . implode(', ', $updateFields) . " WHERE `id` = :u_id";
            $stmtUp = $pdo->prepare($sql);
            $stmtUp->execute($updateValues);
        }
        $finalId = $realId;
    } else {
        // Insert
        $sql = "INSERT INTO `users` (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertPlaceholders) . ")";
        $stmtIns = $pdo->prepare($sql);
        $stmtIns->execute($insertParams);
        $finalId = $uId;
    }

    // Auto-create bio if not exists
    try {
        $checkBio = $pdo->prepare("SELECT id FROM bios WHERE LOWER(username) = :u LIMIT 1");
        $checkBio->execute(['u' => $cleanUsername]);
        if (!$checkBio->fetch()) {
            $defaultBio = [
                'username' => $cleanUsername,
                'profile' => [
                    'displayName' => $uDisplayName,
                    'bio' => $uAccType === 'business' ? 'Chào mừng bạn đến với trang chính thức của chúng tôi!' : 'Xin chào! Chào mừng đến với trang cá nhân của tôi.',
                    'avatarUrl' => $uAvatar,
                    'verifiedBadge' => ($uRole === 'admin' || !empty($uVerified)),
                ],
                'theme' => [
                    'id' => 'cyber-dark',
                    'name' => 'Cyberpunk Neon',
                    'bgType' => 'gradient',
                    'bgColor' => '#09090b',
                    'bgGradient' => ['from' => '#09090b', 'via' => '#180e29', 'to' => '#0f172a', 'direction' => 'to-b'],
                    'fontFamily' => 'Plus Jakarta Sans',
                    'textColor' => '#f8fafc',
                    'accentColor' => '#8b5cf6',
                    'cardStyle' => 'glass',
                    'cardBgColor' => 'rgba(30, 27, 75, 0.55)',
                    'cardTextColor' => '#ffffff',
                    'cardBorderColor' => 'rgba(139, 92, 246, 0.4)',
                    'buttonShape' => 'rounded-xl',
                    'avatarShape' => 'circle'
                ],
                'socialLinks' => !empty($uPhone) ? [
                    ['id' => '1', 'platform' => 'zalo', 'url' => "https://zalo.me/{$uPhone}", 'active' => true, 'label' => 'Zalo']
                ] : [],
                'blocks' => [
                    [
                        'id' => 'blk_' . time() . '_contact',
                        'type' => 'contact_card',
                        'enabled' => true,
                        'order' => 1,
                        'jobTitle' => $uAccType === 'business' ? ($uIndustry ?: 'Doanh Nghiệp & Dịch Vụ') : 'Liên hệ & Hợp tác',
                        'workplace' => $uBizName,
                        'phone' => $uPhone ?: '0988 889 999',
                        'email' => $uEmail,
                        'zalo' => $uPhone ?: '0988889999',
                        'vCardEnabled' => true
                    ]
                ],
                'seo' => [
                    'title' => "{$uDisplayName} | TRANG CÁ NHÂN",
                    'description' => "Khám phá TRANG CÁ NHÂN chính thức của {$uDisplayName}",
                    'hideWatermark' => ($uRole === 'admin')
                ],
                'createdAt' => date('Y-m-d H:i:s'),
                'updatedAt' => date('Y-m-d H:i:s')
            ];
            $insertBio = $pdo->prepare("INSERT INTO bios (username, config, created_at, updated_at) VALUES (:u, :c, NOW(), NOW())");
            $insertBio->execute(['u' => $cleanUsername, 'c' => json_encode($defaultBio, JSON_UNESCAPED_UNICODE)]);
        }
    } catch (Exception $e) {}

    $stmtFinal = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmtFinal->execute(['id' => $finalId]);
    $resRow = $stmtFinal->fetch(PDO::FETCH_ASSOC);

    return $resRow ? normalizeUserFromDb($resRow) : $u;
}

function getJsonDatabasePath(): string {
    // Nếu file data/db.json ở thư mục cha tồn tại (cấu trúc chuẩn Vite/Node)
    if (file_exists(__DIR__ . '/../data/db.json')) {
        return __DIR__ . '/../data/db.json';
    }
    // Nếu chạy trên hosting iNET (thư mục public_html)
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir . '/db.json';
}

function readJsonDatabase(): array {
    $path = getJsonDatabasePath();
    if (file_exists($path)) {
        $content = @file_get_contents($path);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    // Thử thêm đường dẫn phụ nếu chưa đọc được
    $altPath = __DIR__ . '/data/db.json';
    if ($altPath !== $path && file_exists($altPath)) {
        $content = @file_get_contents($altPath);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [
        'users' => [],
        'bios' => [],
        'systemConfig' => [],
        'customTemplates' => [],
        'transactions' => [],
        'supportTickets' => [],
        'passwords' => []
    ];
}

function saveJsonDatabase(array $data): bool {
    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $path = getJsonDatabasePath();
    $saved = (bool)@file_put_contents($path, $encoded, LOCK_EX);
    
    // Đồng bộ thêm vào thư mục phụ data/ nếu có để đồng nhất dữ liệu
    $paths = [__DIR__ . '/data/db.json', __DIR__ . '/../data/db.json'];
    foreach ($paths as $p) {
        if ($p !== $path && (file_exists($p) || is_dir(dirname($p)))) {
            @file_put_contents($p, $encoded, LOCK_EX);
        }
    }
    return $saved;
}

function getRequestJson(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST ?: [];
    $data = json_decode($raw, true);
    return is_array($data) ? array_merge($_POST ?: [], $data) : ($_POST ?: []);
}

function sendJsonResponse(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function normalizeUserFromDb(array $row): array {
    $perms = [];
    $rawPerms = $row['staff_permissions'] ?? $row['staffPermissions'] ?? null;
    if (!empty($rawPerms)) {
        $decoded = is_string($rawPerms) ? json_decode($rawPerms, true) : $rawPerms;
        if (is_array($decoded)) $perms = $decoded;
    }

    return [
        'id' => $row['id'] ?? ('usr_' . ($row['username'] ?? 'anon')),
        'username' => $row['username'] ?? '',
        'name' => $row['name'] ?? ($row['username'] ?? ''),
        'email' => $row['email'] ?? '',
        'phone' => $row['phone'] ?? '',
        'avatarUrl' => $row['avatarUrl'] ?? $row['avatar_url'] ?? '',
        'role' => $row['role'] ?? 'user',
        'isStaff' => !empty($row['is_staff']) || !empty($row['isStaff']),
        'staffPosition' => $row['staff_position'] ?? $row['staffPosition'] ?? null,
        'staffRoleBadge' => $row['staff_role_badge'] ?? $row['staffRoleBadge'] ?? null,
        'staffPermissions' => $perms,
        'staffDepartment' => $row['staff_department'] ?? $row['staffDepartment'] ?? null,
        'staffTitle' => $row['staff_title'] ?? $row['staffTitle'] ?? null,
        'status' => $row['status'] ?? 'active',
        'plan' => $row['plan'] ?? 'free',
        'planExpiresAt' => $row['plan_expires_at'] ?? $row['planExpiresAt'] ?? null,
        'verified' => !empty($row['verified']),
        'verificationStatus' => $row['verification_status'] ?? $row['verificationStatus'] ?? 'unverified',
        'balance' => isset($row['balance']) ? (int)$row['balance'] : 0,
        'accountType' => $row['account_type'] ?? $row['accountType'] ?? 'personal',
        'businessName' => $row['business_name'] ?? $row['businessName'] ?? null,
        'taxCode' => $row['tax_code'] ?? $row['taxCode'] ?? null,
        'industry' => $row['industry'] ?? null,
        'customDomain' => $row['custom_domain'] ?? $row['customDomain'] ?? null,
        'bioCount' => isset($row['bio_count']) ? (int)$row['bio_count'] : (isset($row['bioCount']) ? (int)$row['bioCount'] : 1),
        'totalViews' => isset($row['total_views']) ? (int)$row['total_views'] : (isset($row['totalViews']) ? (int)$row['totalViews'] : 0),
        'createdAt' => $row['created_at'] ?? $row['createdAt'] ?? date('Y-m-d H:i:s')
    ];
}
