<?php
/**
 * REST API Router for Hosting & Apache/LiteSpeed Server
 * Routes all /api/* endpoints seamlessly to PHP backend with real-time MySQL and JSON persistence
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$path = preg_replace('#^/api/#', '', trim($uri, '/'));
$segments = explode('/', $path);
$base = $segments[0] ?? '';
$id = $segments[1] ?? null;
$sub = $segments[2] ?? null;

// Handle CORS Preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    exit;
}

// 1. Health check
if ($base === 'health') {
    sendJsonResponse(['status' => 'ok', 'brand' => 'TRANG CÁ NHÂN', 'time' => date('c')]);
}

// 2. Auth routes
if ($base === 'auth' || $base === 'login' || $base === 'register') {
    $action = $id ?: $base;
    if ($action === 'login') {
        require __DIR__ . '/login.php';
        exit;
    }
    if ($action === 'register') {
        require __DIR__ . '/register.php';
        exit;
    }
}

// 3. User routes: /api/users, /api/users/:id, /api/users/:id/balance, /api/users/:id/password
if ($base === 'users') {
    if (!$id) {
        if ($method === 'GET') {
            require __DIR__ . '/get_users.php';
            exit;
        } else if ($method === 'POST') {
            require __DIR__ . '/update_user.php';
            exit;
        }
    } else {
        $_GET['id'] = $id;
        $_GET['userId'] = $id;
        if ($sub === 'balance' && $method === 'POST') {
            require __DIR__ . '/adjust_balance.php';
            exit;
        }
        if ($method === 'DELETE') {
            require __DIR__ . '/delete_user.php';
            exit;
        }
        if ($method === 'PUT' || $method === 'POST') {
            require __DIR__ . '/update_user.php';
            exit;
        }
        if ($method === 'GET') {
            $pdo = getPDO();
            if ($pdo) {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id OR LOWER(username) = :u LIMIT 1");
                $stmt->execute(['id' => $id, 'u' => strtolower($id)]);
                $row = $stmt->fetch();
                if ($row) {
                    sendJsonResponse(['status' => 'success', 'user' => normalizeUserFromDb($row)]);
                }
            }
            $db = readJsonDatabase();
            foreach ($db['users'] as $u) {
                if ($u['id'] === $id || strtolower($u['username']) === strtolower($id)) {
                    sendJsonResponse(['status' => 'success', 'user' => $u]);
                }
            }
            sendJsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
        }
    }
}

// 4. Bio routes: /api/bio/:username, /api/bio/:username/view, /api/bio/:username/click
if ($base === 'bio') {
    $username = $id;
    if ($username) {
        $_GET['u'] = $username;
        $_GET['username'] = $username;
        
        if ($sub === 'view' && $method === 'POST') {
            $pdo = getPDO();
            if ($pdo) {
                try {
                    $pdo->prepare("UPDATE users SET total_views = total_views + 1 WHERE LOWER(username) = :u")->execute(['u' => strtolower($username)]);
                } catch (Exception $e) {}
            }
            $db = readJsonDatabase();
            foreach ($db['users'] as &$u) {
                if (strtolower($u['username']) === strtolower($username)) {
                    $u['totalViews'] = ($u['totalViews'] ?? 0) + 1;
                    break;
                }
            }
            saveJsonDatabase($db);
            sendJsonResponse(['status' => 'success', 'message' => 'View tracked']);
        }
        
        if ($sub === 'click' && $method === 'POST') {
            $payload = getRequestJson();
            $blockId = $payload['blockId'] ?? '';
            $db = readJsonDatabase();
            if (!empty($db['bios'][$username]['blocks']) && is_array($db['bios'][$username]['blocks'])) {
                foreach ($db['bios'][$username]['blocks'] as &$b) {
                    if (($b['id'] ?? '') === $blockId) {
                        $b['clickCount'] = ($b['clickCount'] ?? 0) + 1;
                        break;
                    }
                }
                saveJsonDatabase($db);
            }
            sendJsonResponse(['status' => 'success', 'message' => 'Click tracked']);
        }

        if ($method === 'POST' || $method === 'PUT') {
            require __DIR__ . '/save_bio.php';
            exit;
        }
        if ($method === 'GET') {
            require __DIR__ . '/get_bio.php';
            exit;
        }
    }
}

// 5. Config routes: /api/config, /api/system/config, /api/save_config, /api/get_config
if ($base === 'config' || ($base === 'system' && $id === 'config') || $base === 'save_config' || $base === 'get_config') {
    if ($method === 'POST' || $base === 'save_config') {
        require __DIR__ . '/save_config.php';
        exit;
    } else {
        require __DIR__ . '/get_config.php';
        exit;
    }
}

// 6. Templates: /api/templates, /api/templates/:id
if ($base === 'templates') {
    if ($method === 'GET') {
        require __DIR__ . '/get_templates.php';
        exit;
    }
    if ($method === 'POST') {
        require __DIR__ . '/save_template.php';
        exit;
    }
    if ($method === 'DELETE' && $id) {
        $_GET['id'] = $id;
        require __DIR__ . '/delete_template.php';
        exit;
    }
}

// 7. Articles: /api/articles, /api/articles/:id
if ($base === 'articles') {
    if ($method === 'GET') {
        require __DIR__ . '/get_articles.php';
        exit;
    }
    if ($method === 'POST' || $method === 'PUT') {
        require __DIR__ . '/save_article.php';
        exit;
    }
}

// 8. Transactions: /api/transactions, /api/transactions/all, /api/transactions/:id
if ($base === 'transactions') {
    if ($method === 'GET') {
        require __DIR__ . '/get_transactions.php';
        exit;
    }
    if ($method === 'POST') {
        require __DIR__ . '/create_transaction.php';
        exit;
    }
    if ($method === 'DELETE') {
        if ($id === 'all') {
            $_GET['clearAll'] = true;
        } else if ($id) {
            $_GET['id'] = $id;
        }
        require __DIR__ . '/delete_transaction.php';
        exit;
    }
}

// 9. Sync All Users: /api/sync_all_users
if ($base === 'sync_all_users' || $base === 'sync-all-users') {
    require __DIR__ . '/sync_all_users.php';
    exit;
}

// 10. Upload: /api/upload
if ($base === 'upload') {
    require __DIR__ . '/upload.php';
    exit;
}

// 11. SePay: /api/sepay/check-status, /api/sepay/check, /api/sepay/webhook
if ($base === 'sepay') {
    if ($id === 'check-status' || $id === 'check') {
        require __DIR__ . '/check_sepay_status.php';
        exit;
    }
    if ($id === 'webhook') {
        require __DIR__ . '/sepay_webhook.php';
        exit;
    }
}

// 12. Tickets: /api/tickets, /api/tickets/:id
if ($base === 'tickets') {
    $db = readJsonDatabase();
    if ($method === 'GET') {
        sendJsonResponse(['status' => 'success', 'data' => $db['supportTickets'] ?? [], 'tickets' => $db['supportTickets'] ?? []]);
    }
    if ($method === 'POST') {
        $payload = getRequestJson();
        $newTicket = array_merge([
            'id' => 'TCK_' . time(),
            'status' => 'open',
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ], $payload);
        if (!isset($db['supportTickets'])) $db['supportTickets'] = [];
        array_unshift($db['supportTickets'], $newTicket);
        saveJsonDatabase($db);
        sendJsonResponse(['status' => 'success', 'ticket' => $newTicket]);
    }
    if (($method === 'PUT' || $method === 'POST') && $id) {
        $payload = getRequestJson();
        if (isset($db['supportTickets'])) {
            foreach ($db['supportTickets'] as &$t) {
                if (($t['id'] ?? '') === $id) {
                    $t = array_merge($t, $payload, ['updatedAt' => date('Y-m-d H:i:s')]);
                    break;
                }
            }
            saveJsonDatabase($db);
        }
        sendJsonResponse(['status' => 'success', 'message' => 'Ticket updated']);
    }
}

// 13. Verification Requests: /api/verification-requests, /api/verification-requests/:id/review
if ($base === 'verification-requests' || $base === 'verification_requests') {
    $db = readJsonDatabase();
    if ($method === 'GET') {
        sendJsonResponse(['status' => 'success', 'data' => $db['verificationRequests'] ?? [], 'requests' => $db['verificationRequests'] ?? []]);
    }
    if ($method === 'POST' && !$id) {
        $payload = getRequestJson();
        $newReq = array_merge([
            'id' => 'VR_' . time(),
            'status' => 'pending',
            'createdAt' => date('Y-m-d H:i:s')
        ], $payload);
        if (!isset($db['verificationRequests'])) $db['verificationRequests'] = [];
        array_unshift($db['verificationRequests'], $newReq);
        saveJsonDatabase($db);
        sendJsonResponse(['status' => 'success', 'request' => $newReq]);
    }
    if (($method === 'PUT' || $method === 'POST') && $id) {
        $payload = getRequestJson();
        if (isset($db['verificationRequests'])) {
            foreach ($db['verificationRequests'] as &$vr) {
                if (($vr['id'] ?? '') === $id) {
                    $vr = array_merge($vr, $payload, ['reviewedAt' => date('Y-m-d H:i:s')]);
                    if (!empty($vr['userId']) && isset($payload['status'])) {
                        $isApproved = $payload['status'] === 'approved';
                        // Update user
                        foreach ($db['users'] as &$u) {
                            if ($u['id'] === $vr['userId']) {
                                $u['verified'] = $isApproved;
                                $u['verificationStatus'] = $payload['status'];
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            saveJsonDatabase($db);
        }
        sendJsonResponse(['status' => 'success', 'message' => 'Verification review completed']);
    }
}

// 14. Audit logs: /api/audit-logs
if ($base === 'audit-logs' || $base === 'audit_logs') {
    $db = readJsonDatabase();
    if ($method === 'GET') {
        sendJsonResponse(['status' => 'success', 'data' => $db['staffAuditLogs'] ?? []]);
    }
    if ($method === 'POST') {
        $payload = getRequestJson();
        $newLog = array_merge([
            'id' => 'LOG_' . time(),
            'createdAt' => date('Y-m-d H:i:s')
        ], $payload);
        if (!isset($db['staffAuditLogs'])) $db['staffAuditLogs'] = [];
        array_unshift($db['staffAuditLogs'], $newLog);
        saveJsonDatabase($db);
        sendJsonResponse(['status' => 'success', 'log' => $newLog]);
    }
}

// 15. Moderation: /api/moderation
if ($base === 'moderation') {
    $db = readJsonDatabase();
    if ($method === 'GET') {
        sendJsonResponse(['status' => 'success', 'data' => $db['bioModerationQueue'] ?? []]);
    }
    if (($method === 'PUT' || $method === 'POST') && $id) {
        $payload = getRequestJson();
        if (isset($db['bioModerationQueue'])) {
            foreach ($db['bioModerationQueue'] as &$m) {
                if (($m['id'] ?? '') === $id) {
                    $m = array_merge($m, $payload, ['reviewedAt' => date('Y-m-d H:i:s')]);
                    break;
                }
            }
            saveJsonDatabase($db);
        }
        sendJsonResponse(['status' => 'success', 'message' => 'Moderation item updated']);
    }
}

// Fallback for unhandled /api/*
sendJsonResponse(['status' => 'error', 'message' => "Endpoint '/api/{$path}' not found"], 404);
