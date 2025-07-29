<?php
// notify.php

// --- Configuration ---
$to = 'yacein@gmail.com'; // Your email address.
$subject_prefix = '[Telepathy Contact]';
$log_file = __DIR__ . '/telepathy_log.txt'; // Log file will be created in the same directory.

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
    http_response_code(405); // Method Not Allowed
    $log_message = "Timestamp: " . date('Y-m-d H:i:s') . " UTC | ERROR: Invalid request method. Expected POST. | IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
    exit('Error: This script only accepts POST requests.');
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
    http_response_code(403); // Forbidden
    $log_message = "Timestamp: " . date('Y-m-d H:i:s') . " UTC | ERROR: Origin not allowed. Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? 'Not set') . " | IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
    exit('Error: Origin not allowed.');
}

// Check if the versionId was sent.
if (!isset($_POST['versionId']) || empty($_POST['versionId'])) {
    http_response_code(400); // Bad Request
    $log_message = "Timestamp: " . date('Y-m-d H:i:s') . " UTC | ERROR: Missing versionId. | IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
    exit('Error: Missing versionId.');
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
file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);

// Send a success response back to the browser (optional, but good practice).
http_response_code(200);
echo 'Notification sent.';