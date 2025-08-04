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
    // Suppress validation error logging for local development to keep logs clean.
    $local_dev_origin = 'http://127.0.0.1:5500';
    if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $local_dev_origin) {
        http_response_code($http_code);
        exit; // Exit silently without logging.
    }

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

/**
 * Fetches company data from a Google Sheet CSV and creates a lookup map.
 * @param string $url The URL of the published Google Sheet CSV.
 * @return array An associative array mapping versionId to company_name.
 */
function get_company_map($url) {
    $map = [];
    // Use a stream context to set a timeout, preventing the page from hanging if Google Sheets is slow.
    $context = stream_context_create(['http' => ['timeout' => 5]]);
    // Use @ to suppress warnings on failure, we handle the error below.
    $csv_data = @file_get_contents($url, false, $context);

    if ($csv_data === false) {
        return []; // Return an empty map if the fetch fails.
    }

    $lines = str_getcsv($csv_data, "\n");
    if (count($lines) < 2) {
        return []; // Not enough data (must have header + at least one row).
    }

    $headers = str_getcsv(array_shift($lines));
    $versionId_index = array_search('versionId', $headers);
    $companyName_index = array_search('company_name', $headers);

    // If required columns aren't found, we can't build the map.
    if ($versionId_index === false || $companyName_index === false) {
        return [];
    }

    foreach ($lines as $line) {
        $row = str_getcsv($line);
        $versionId = $row[$versionId_index] ?? null;
        $companyName = $row[$companyName_index] ?? null;

        if ($versionId && $companyName) {
            $map[trim($versionId)] = trim($companyName);
        }
    }

    return $map;
}

// --- Configuration ---
$log_file = __DIR__ . '/analytics_log.txt';
// The private Google Sheet CSV URL for company data enrichment.
$company_data_csv_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnDZiD0zbEjdALbE4BPJrGUvnC3jK4mK4uebn2kLjajcgCbXQsE5xBG9a0R1wxn9WJo-ogpLC3p-X0/pub?gid=0&single=true&output=csv';
$analytics_page_url = 'https://assets.brobro.film/dvd/view-analytics.php';

// Email configuration (moved from notify.php)
$email_recipients = [
    //'halshaater@gmail.com',
    //'brobrofilm@gmail.com',
    'yacein@gmail.com' // temporarily disabled others while testing
];
$email_to = implode(',', $email_recipients);
$email_subject_prefix = '[Telepathy Contact]';

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

// --- Special Actions for Specific Events ---
if ($eventType === 'telepathic_contact') {
    // This event should also trigger an email notification.
    if (isset($eventData['versionId']) && !empty($eventData['versionId'])) {
        $versionId = htmlspecialchars(strip_tags(trim($eventData['versionId'])));

        $subject = "$email_subject_prefix New contact from site version: $versionId";
        $email_message = "You have received a new telepathic contact.\n\n"
                 . "Site Version ID: " . $versionId . "\n"
                 . "Timestamp: " . date('Y-m-d H:i:s') . " (UTC)\n"
                 . "User IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n\n"
                 . "View Analytics: " . $analytics_page_url . "\n";

        $headers = 'From: noreply@' . $_SERVER['SERVER_NAME'] . "\r\n";

        mail($email_to, $subject, $email_message, $headers);
    }
}

// Check for a first-time site load for a specific versionId
if ($eventType === 'site_load') {
    if (isset($eventData['versionId']) && !empty($eventData['versionId'])) {
        $versionId = $eventData['versionId'];
        $isFirstVisit = true;

        // Check existing logs to see if this versionId has been loaded before.
        // This check happens *before* the new event is logged.
        if (file_exists($log_file)) {
            $handle = fopen($log_file, 'r');
            if ($handle) {
                while (($line = fgets($handle)) !== false) {
                    $entry = json_decode($line, true);
                    if (
                        $entry && // Ensure line is valid JSON
                        isset($entry['type']) && $entry['type'] === 'site_load' &&
                        isset($entry['data']['versionId']) && $entry['data']['versionId'] === $versionId
                    ) {
                        $isFirstVisit = false;
                        break; // Found a previous visit, no need to check further.
                    }
                }
                fclose($handle);
            }
        }

        if ($isFirstVisit) {
            // This is the first time, send an email notification.
            $company_map = get_company_map($company_data_csv_url);
            $companyName = htmlspecialchars($company_map[$versionId] ?? 'Unknown Company');
            $arrivalMethod = htmlspecialchars($eventData['method'] ?? 'N/A');
            $versionIdSafe = htmlspecialchars($versionId);

            $subject = "[First Visit] $companyName has accessed the site ($versionIdSafe)";
            $email_message = "This is the first time this version of the site has been accessed.\n\n"
                             . "Company: " . $companyName . "\n"
                             . "Site Version ID: " . $versionIdSafe . "\n"
                             . "Arrival Method: " . $arrivalMethod . "\n"
                             . "Timestamp: " . date('Y-m-d H:i:s') . " (UTC)\n"
                             . "User IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n\n"
                             . "View Analytics: " . $analytics_page_url . "\n";

            $headers = 'From: noreply@' . $_SERVER['SERVER_NAME'] . "\r\n";
            mail($email_to, $subject, $email_message, $headers);
        }
    }
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