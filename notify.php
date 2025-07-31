<?php
// notify.php

// Polyfill for str_ends_with() for PHP versions < 8.0
if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool
    {
        $needle_len = strlen($needle);
        return ($needle_len === 0) || (substr($haystack, -$needle_len) === $needle);
    }
}

/**
 * Logs a structured validation error to the analytics log and exits the script.
 * @param string $log_file The path to the log file.
 * @param int $http_code The HTTP status code to send.
 * @param string $error_type A short description of the error type.
 * @param string $error_details Specific details about the error.
 */
function log_validation_error_and_exit($log_file, $http_code, $error_type, $error_details) {
    http_response_code($http_code);
    $log_entry = [
        'timestamp' => date('c'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'type' => 'validation_error',
        'data' => [
            'source_script' => basename(__FILE__),
            'error' => $error_type,
            'details' => $error_details
        ]
    ];
    file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);
    exit;
}

// --- Configuration ---
$to = 'yacein@gmail.com'; // Your email address.
$subject_prefix = '[Telepathy Contact]';
$telepathy_log_file = __DIR__ . '/telepathy_log.txt'; // Log for successful contacts.
$analytics_log_file = __DIR__ . '/analytics_log.txt'; // Log for validation errors.

// IMPORTANT: For security, specify the exact origin of your website.
// This prevents other sites from using your notification script.
$allowed_origins = [
    'https://dvd.brobro.local', // Local development
    'https://fastidious-cocada-e6cae6.netlify.app', // Netlify testing URL
    '.brobro.film' // Wildcard for any subdomain of brobro.film
];

// --- Security & Validation ---

// Only allow POST requests.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_validation_error_and_exit($analytics_log_file, 405, 'Method Not Allowed', 'Expected POST, received ' . $_SERVER['REQUEST_METHOD']);
}

// Check the origin of the request against the allowed list.
$origin_is_allowed = false;
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $request_origin = $_SERVER['HTTP_ORIGIN'];

    foreach ($allowed_origins as $allowed) {
        // Check for exact match or if it's a wildcard for a subdomain.
        if ($request_origin === $allowed || ($allowed[0] === '.' && str_ends_with($request_origin, $allowed))) {
            $origin_is_allowed = true;
            // Set the header to the specific origin that matched.
            header("Access-Control-Allow-Origin: " . $request_origin);
            break;
        }
    }
}

if (!$origin_is_allowed) {
    log_validation_error_and_exit($analytics_log_file, 403, 'Origin Not Allowed', 'Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'Not set'));
}

// Check if the versionId was sent.
if (!isset($_POST['versionId']) || empty($_POST['versionId'])) {
    log_validation_error_and_exit($analytics_log_file, 400, 'Bad Request', 'Missing versionId');
}

// --- Process Data & Send Email ---

// Sanitize the input to prevent attacks.
$versionId = htmlspecialchars(strip_tags(trim($_POST['versionId'])));

$subject = "$subject_prefix New contact from site version: $versionId";
$email_message = "You have received a new telepathic contact.\n\n"
         . "Site Version ID: " . $versionId . "\n"
         . "Timestamp: " . date('Y-m-d H:i:s') . " (UTC)\n"
         . "User IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";

$headers = 'From: noreply@' . $_SERVER['SERVER_NAME'] . "\r\n";

// Use PHP's mail() function. Note: Your server must be configured to send mail.
mail($to, $subject, $email_message, $headers);

// --- NEW: Logging ---
$log_message = "Timestamp: " . date('Y-m-d H:i:s') . " UTC | "
             . "Version ID: " . $versionId . " | "
             . "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Append the message to the log file. LOCK_EX prevents race conditions.
file_put_contents($telepathy_log_file, $log_message, FILE_APPEND | LOCK_EX);

// Send a success response back to the browser (optional, but good practice).
http_response_code(200);
echo 'Notification sent.';