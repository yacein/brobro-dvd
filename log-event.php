<?php
// log-event.php

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
$log_file = __DIR__ . '/analytics_log.txt';

// IMPORTANT: For security, specify the exact origin of your website.
$allowed_origins = [
    'https://dvd.brobro.local', // Local development
    'https://fastidious-cocada-e6cae6.netlify.app', // Netlify testing URL
    '.brobro.film' // Wildcard for any subdomain of brobro.film
];

// --- Security & Validation ---

// Only allow POST requests.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_validation_error_and_exit($log_file, 405, 'Method Not Allowed', 'Expected POST, received ' . $_SERVER['REQUEST_METHOD']);
}

// Check the origin of the request against the allowed list.
$origin_is_allowed = false;
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $request_origin = $_SERVER['HTTP_ORIGIN'];

    foreach ($allowed_origins as $allowed) {
        if ($request_origin === $allowed || ($allowed[0] === '.' && str_ends_with($request_origin, $allowed))) {
            $origin_is_allowed = true;
            header("Access-Control-Allow-Origin: " . $request_origin);
            break;
        }
    }
}

if (!$origin_is_allowed) {
    log_validation_error_and_exit($log_file, 403, 'Origin Not Allowed', 'Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'Not set'));
}

// Check if the eventType was sent.
if (!isset($_POST['eventType']) || empty($_POST['eventType'])) {
    log_validation_error_and_exit($log_file, 400, 'Bad Request', 'Missing eventType');
}

// --- Process & Log Data ---

// Sanitize the event type.
$eventType = htmlspecialchars(strip_tags(trim($_POST['eventType'])));

// Decode the event data from its JSON string format.
$eventData = isset($_POST['eventData']) ? json_decode($_POST['eventData'], true) : [];

// Basic validation to check if json_decode failed.
if (json_last_error() !== JSON_ERROR_NONE) {
    // If JSON is malformed, log an error and the raw string.
    $eventData = [
        'error' => 'Invalid JSON received',
        'raw_data' => $_POST['eventData']
    ];
}

$log_entry = [
    'timestamp' => date('c'), // ISO 8601 format (e.g., 2004-02-12T15:19:21+00:00)
    'ip' => $_SERVER['REMOTE_ADDR'],
    'type' => $eventType,
    'data' => $eventData
];

// Append the JSON string to the log file. LOCK_EX prevents race conditions.
file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);

// Send a success response back to the browser.
http_response_code(200);
echo 'Event logged.';