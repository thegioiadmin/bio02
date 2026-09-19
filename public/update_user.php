<?php
/**
 * API: Cập nhật thông tin người dùng (Gói cước, Tích xanh, Vai trò, Số dư...) vào MySQL và JSON
 * Tương thích hoàn toàn với hosting iNET / cPanel / Node.js
 */
require_once __DIR__ . '/db.php';

$payload = getRequestJson();
$userId = trim((string)($payload['id'] ?? $payload['userId'] ?? ''));
$username = strtolower(trim((string)($payload['username'] ?? '')));
$email = strtolower(trim((string)($payload['email'] ?? '')));
$phone = trim((string)($payload['phone'] ?? ''));

if (empty($userId) && empty($username) && empty($email) && empty($phone)) {
    sendJsonResponse(['status' => 'error', 'message' => 'Thiếu ID, Username hoặc Email người dùng cần cập nhật!'], 400);
}

$pdo = getPDO();

if ($pdo) {
    try {
        // Tìm user theo id, username, email hoặc phone (ưu tiên theo thứ tự)
        $user = null;
        if (!empty($userId)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $userId]);
            $user = $stmt->fetch();
        }
        if (!$user && !empty($username)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(username) = :u LIMIT 1");
            $stmt->execute(['u' => $username]);
            $user = $stmt->fetch();
        }
        if (!$user && !empty($email)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = :e LIMIT 1");
            $stmt->execute(['e' => $email]);
            $user = $stmt->fetch();
        }
        if (!$user && !empty($phone)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = :p LIMIT 1");
            $stmt->execute(['p' => $phone]);
            $user = $stmt->fetch();
        }

        if ($user) {
            $updateFields = [];
            $params = ['id' => $user['id']];

            // 1. Gói cước (Plan) & Thời hạn (planExpiresAt)
            $hasExplicitVerified = isset($payload['verified']);
            $verifiedVal = (!empty($payload['verified']) && $payload['verified'] !== 'false') ? 1 : 0;

            if (isset($payload['plan'])) {
                $plan = strtolower(trim((string)$payload['plan']));
                if (in_array($plan, ['free', 'pro', 'vip'])) {
                    $updateFields[] = "`plan` = :plan";
                    $params['plan'] = $plan;

                    if ($plan === 'pro') {
                        $exp = !empty($payload['planExpiresAt']) 
                            ? $payload['planExpiresAt'] 
                            : date('Y-m-d H:i:s', strtotime('+1 year'));
                        $updateFields[] = "`plan_expires_at` = :plan_expires_at";
                        $params['plan_expires_at'] = $exp;
                        $updateFields[] = "`verified` = :verified_plan";
                        $params['verified_plan'] = $hasExplicitVerified ? $verifiedVal : 1;
                    } elseif ($plan === 'vip') {
                        $exp = !empty($payload['planExpiresAt']) 
                            ? $payload['planExpiresAt'] 
                            : date('Y-m-d H:i:s', strtotime('+100 years'));
                        $updateFields[] = "`plan_expires_at` = :plan_expires_at";
                        $params['plan_expires_at'] = $exp;
                        $updateFields[] = "`verified` = :verified_plan";
                        $params['verified_plan'] = $hasExplicitVerified ? $verifiedVal : 1;
                    } elseif ($plan === 'free') {
                        $updateFields[] = "`plan_expires_at` = NULL";
                        $updateFields[] = "`verified` = :verified_plan";
                        $params['verified_plan'] = $hasExplicitVerified ? $verifiedVal : 0;
                    }
                }
            } elseif (isset($payload['planExpiresAt'])) {
                $updateFields[] = "`plan_expires_at` = :plan_expires_at";
                $params['plan_expires_at'] = $payload['planExpiresAt'] ? $payload['planExpiresAt'] : null;
            }

            // 2. Tích xanh xác minh (Verified) nếu chưa xử lý ở mục plan
            if ($hasExplicitVerified && !isset($payload['plan'])) {
                $updateFields[] = "`verified` = :verified_only";
                $params['verified_only'] = $verifiedVal;
            }

            // 3. Trạng thái xác minh
            if (isset($payload['verificationStatus'])) {
                $updateFields[] = "`verification_status` = :verification_status";
                $params['verification_status'] = $payload['verificationStatus'];
            }

            // 4. Vai trò (Role)
            if (isset($payload['role'])) {
                $updateFields[] = "`role` = :role";
                $params['role'] = $payload['role'];
            }

            // 5. Trạng thái tài khoản (Status)
            if (isset($payload['status'])) {
                $updateFields[] = "`status` = :status";
                $params['status'] = $payload['status'];
            }

            // 6. Tên hiển thị (Name)
            if (isset($payload['name'])) {
                $updateFields[] = "`name` = :name";
                $params['name'] = $payload['name'];
            }

            // 7. Email
            if (isset($payload['email']) && !empty($payload['email'])) {
                $updateFields[] = "`email` = :email";
                $params['email'] = strtolower(trim((string)$payload['email']));
            }

            // 8. Số điện thoại (Phone)
            if (isset($payload['phone'])) {
                $updateFields[] = "`phone` = :phone";
                $params['phone'] = $payload['phone'];
            }

            // 9. Avatar
            if (isset($payload['avatarUrl']) || isset($payload['avatar_url'])) {
                $updateFields[] = "`avatar_url` = :avatar_url";
                $params['avatar_url'] = $payload['avatarUrl'] ?? $payload['avatar_url'];
            }

            // 10. Số dư ví (Balance)
            if (isset($payload['balance'])) {
                $updateFields[] = "`balance` = :balance";
                $params['balance'] = (int)$payload['balance'];
            }

            // 11. Thông tin doanh nghiệp / cá nhân
            if (isset($payload['accountType'])) {
                $updateFields[] = "`account_type` = :account_type";
                $params['account_type'] = $payload['accountType'];
            }
            if (isset($payload['businessName'])) {
                $updateFields[] = "`business_name` = :business_name";
                $params['business_name'] = $payload['businessName'];
            }
            if (isset($payload['taxCode'])) {
                $updateFields[] = "`tax_code` = :tax_code";
                $params['tax_code'] = $payload['taxCode'];
            }
            if (isset($payload['industry'])) {
                $updateFields[] = "`industry` = :industry";
                $params['industry'] = $payload['industry'];
            }
            if (isset($payload['customDomain'])) {
                $updateFields[] = "`custom_domain` = :custom_domain";
                $params['custom_domain'] = $payload['customDomain'];
            }

            // 12. Phân quyền nhân viên (Staff)
            if (isset($payload['isStaff'])) {
                $updateFields[] = "`is_staff` = :is_staff";
                $params['is_staff'] = !empty($payload['isStaff']) ? 1 : 0;
            }
            if (isset($payload['staffPosition'])) {
                $updateFields[] = "`staff_position` = :staff_position";
                $params['staff_position'] = $payload['staffPosition'];
            }
            if (isset($payload['staffRoleBadge'])) {
                $updateFields[] = "`staff_role_badge` = :staff_role_badge";
                $params['staff_role_badge'] = $payload['staffRoleBadge'];
            }
            if (isset($payload['staffDepartment'])) {
                $updateFields[] = "`staff_department` = :staff_department";
                $params['staff_department'] = $payload['staffDepartment'];
            }
            if (isset($payload['staffTitle'])) {
                $updateFields[] = "`staff_title` = :staff_title";
                $params['staff_title'] = $payload['staffTitle'];
            }
            if (isset($payload['staffPermissions'])) {
                $updateFields[] = "`staff_permissions` = :staff_permissions";
                $params['staff_permissions'] = is_string($payload['staffPermissions']) 
                    ? $payload['staffPermissions'] 
                    : json_encode($payload['staffPermissions'], JSON_UNESCAPED_UNICODE);
            }

            // 13. Mật khẩu nếu có
            if (!empty($payload['password']) || !empty($payload['pass'])) {
                $rawPass = $payload['password'] ?? $payload['pass'];
                $updateFields[] = "`password` = :password";
                $params['password'] = password_hash($rawPass, PASSWORD_DEFAULT);
            }

            if (!empty($updateFields)) {
                $sql = "UPDATE users SET " . implode(", ", $updateFields) . ", `updated_at` = NOW() WHERE id = :id";
                $upStmt = $pdo->prepare($sql);
                $upStmt->execute($params);
            }

            // Lấy lại user đã cập nhật
            $refetch = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
            $refetch->execute(['id' => $user['id']]);
            $updatedUserRow = $refetch->fetch();
            $normalized = normalizeUserFromDb($updatedUserRow ?: $user);

            // Đồng bộ sang file data/db.json
            try {
                $db = readJsonDatabase();
                if (!empty($db['users'])) {
                    $found = false;
                    foreach ($db['users'] as &$u) {
                        if ($u['id'] === $user['id'] || (strtolower($u['username']) === strtolower($user['username']))) {
                            $u = array_merge($u, $normalized);
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        $db['users'][] = $normalized;
                    }
                    saveJsonDatabase($db);
                }
            } catch (Exception $e) {}

            sendJsonResponse([
                'status' => 'success',
                'success' => true,
                'message' => 'Đã cập nhật thông tin người dùng và gói cước vào MySQL thành công!',
                'user' => $normalized,
                'data' => $normalized
            ]);
        } else {
            // Kiểm tra trong file data/db.json trước khi tạo mới ngẫu nhiên
            $existingJsonUser = null;
            try {
                $db = readJsonDatabase();
                if (!empty($db['users'])) {
                    foreach ($db['users'] as $ju) {
                        if (($userId && $ju['id'] === $userId) || 
                            ($username && strtolower($ju['username']) === $username) ||
                            ($email && strtolower($ju['email'] ?? '') === $email)) {
                            $existingJsonUser = $ju;
                            break;
                        }
                    }
                }
            } catch (Exception $e) {}

            $newId = $userId ?: ($existingJsonUser['id'] ?? ('usr_' . time()));
            $newUsername = $username ?: ($existingJsonUser['username'] ?? ('user' . time()));
            $newPlan = $payload['plan'] ?? ($existingJsonUser['plan'] ?? 'free');
            $isPro = $newPlan === 'pro';
            $isVip = $newPlan === 'vip';
            $exp = $isPro ? date('Y-m-d H:i:s', strtotime('+1 year')) : ($isVip ? date('Y-m-d H:i:s', strtotime('+100 years')) : null);
            $verified = ($isPro || $isVip || !empty($payload['verified']) || !empty($existingJsonUser['verified'])) ? 1 : 0;
            $rawPass = $payload['password'] ?? ($existingJsonUser['password'] ?? '123456');

            $insStmt = $pdo->prepare("
                INSERT INTO users (id, username, password, email, phone, name, avatar_url, role, status, plan, plan_expires_at, verified, balance, created_at, updated_at)
                VALUES (:id, :u, :p, :e, :phone, :n, :a, :r, 'active', :plan, :exp, :v, :b, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                    plan = VALUES(plan),
                    plan_expires_at = VALUES(plan_expires_at),
                    verified = VALUES(verified),
                    updated_at = NOW()
            ");
            $insStmt->execute([
                'id' => $newId,
                'u' => $newUsername,
                'p' => password_hash($rawPass, PASSWORD_DEFAULT),
                'e' => $email ?: ($existingJsonUser['email'] ?? ($newUsername . '@trangcanhan.com')),
                'phone' => $payload['phone'] ?? ($existingJsonUser['phone'] ?? ''),
                'n' => $payload['name'] ?? ($existingJsonUser['name'] ?? $newUsername),
                'a' => $payload['avatarUrl'] ?? ($existingJsonUser['avatarUrl'] ?? ('https://api.dicebear.com/7.x/bottts/svg?seed=' . $newUsername)),
                'r' => $payload['role'] ?? ($existingJsonUser['role'] ?? 'user'),
                'plan' => $newPlan,
                'exp' => $exp,
                'v' => $verified,
                'b' => (int)($payload['balance'] ?? ($existingJsonUser['balance'] ?? 0))
            ]);

            $refetch = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
            $refetch->execute(['id' => $newId, 'u' => strtolower($newUsername)]);
            $normalized = normalizeUserFromDb($refetch->fetch());

            // Lưu luôn vào db.json
            try {
                $db = readJsonDatabase();
                $found = false;
                if (!empty($db['users'])) {
                    foreach ($db['users'] as &$ju) {
                        if ($ju['id'] === $newId || strtolower($ju['username']) === strtolower($newUsername)) {
                            $ju = array_merge($ju, $normalized);
                            $found = true;
                            break;
                        }
                    }
                }
                if (!$found) {
                    $db['users'][] = $normalized;
                }
                saveJsonDatabase($db);
            } catch (Exception $e) {}

            sendJsonResponse([
                'status' => 'success',
                'success' => true,
                'message' => 'Đã lưu và đồng bộ người dùng vào MySQL thành công!',
                'user' => $normalized,
                'data' => $normalized
            ]);
        }
    } catch (Exception $e) {
        sendJsonResponse(['status' => 'error', 'message' => 'Lỗi cập nhật MySQL: ' . $e->getMessage()], 500);
    }
} else {
    // Fallback JSON DB
    $db = readJsonDatabase();
    $foundIdx = -1;
    foreach ($db['users'] as $idx => $u) {
        if (($userId && $u['id'] === $userId) || 
            ($username && strtolower($u['username']) === $username) ||
            ($email && strtolower($u['email'] ?? '') === $email)) {
            $foundIdx = $idx;
            break;
        }
    }

    if ($foundIdx !== -1) {
        $u = &$db['users'][$foundIdx];
        if (isset($payload['plan'])) {
            $u['plan'] = $payload['plan'];
            if ($payload['plan'] === 'pro') {
                $u['planExpiresAt'] = $payload['planExpiresAt'] ?? date('c', strtotime('+1 year'));
                $u['verified'] = true;
            } elseif ($payload['plan'] === 'vip') {
                $u['planExpiresAt'] = $payload['planExpiresAt'] ?? date('c', strtotime('+100 years'));
                $u['verified'] = true;
            } elseif ($payload['plan'] === 'free') {
                $u['planExpiresAt'] = null;
                $u['verified'] = false;
            }
        }
        if (isset($payload['verified'])) $u['verified'] = !empty($payload['verified']);
        if (isset($payload['role'])) $u['role'] = $payload['role'];
        if (isset($payload['name'])) $u['name'] = $payload['name'];
        if (isset($payload['phone'])) $u['phone'] = $payload['phone'];
        if (isset($payload['balance'])) $u['balance'] = (int)$payload['balance'];
        if (isset($payload['status'])) $u['status'] = $payload['status'];
        
        saveJsonDatabase($db);
        sendJsonResponse(['status' => 'success', 'success' => true, 'user' => $u, 'data' => $u]);
    } else {
        sendJsonResponse(['status' => 'error', 'message' => 'Không tìm thấy người dùng'], 404);
    }
}
