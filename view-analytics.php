<?php
session_start();

// --- CONFIGURATION ---
// IMPORTANT: Change this to a strong, unique password.
$password = 'wakeupneo';
$log_file = __DIR__ . '/analytics_log.txt';

// --- LOGIC ---

// Handle logout request
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: view-analytics.php');
    exit;
}

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Use hash_equals for a timing-attack-safe comparison
    if (isset($_POST['password']) && hash_equals($password, $_POST['password'])) {
        // Password is correct, set session variable
        $_SESSION['loggedin'] = true;
        header('Location: view-analytics.php'); // Redirect to prevent form resubmission on refresh
        exit;
    } else {
        $error_message = 'Invalid password.';
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Viewer</title>
    <!-- Google Fonts: Press Start 2P for a pixelated, retro feel -->
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-bg: #000000;
            --color-text: #e0e0e0;
            --color-border: #444;
            --color-header-bg: #2a2a2a;
            --color-row-hover: #333;
            --color-link: #ffff00; /* Yellow to match site accent */
            --color-accent-green: #00ff00; /* Matrix green */
            --color-warning-bg: #504030; /* Dark orange/brown for warnings */
            --color-error: #ff4d4d;
            --font-pixel: 'Press Start 2P', cursive;
        }
        body {
            font-family: var(--font-pixel);
            background-color: var(--color-bg);
            color: var(--color-text);
            margin: 0;
            padding: 2em;
            font-size: 12px; /* Pixel fonts look best at specific sizes */
        }
        .container {
            max-width: 1400px; /* A bit wider for the new font */
            margin: 0 auto;
        }
        h1 {
            border-bottom: 2px solid var(--color-border);
            padding-bottom: 0.5em;
            margin-bottom: 1em;
        }
        h1, .login-form label {
            color: var(--color-link);
        }
        a {
            color: var(--color-link);
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1em;
        }
        th, td {
            border: 1px solid var(--color-border);
            padding: 0.8em;
            text-align: left;
            vertical-align: top;
            color: var(--color-accent-green); /* Default text color for table cells */
        }
        thead {
            background-color: var(--color-header-bg);
        }
        /* Make table headers yellow to stand out */
        th {
            color: var(--color-link);
        }
        tbody tr:hover {
            background-color: var(--color-row-hover);
        }
        pre {
            margin: 0;
            font-family: "SF Mono", "Fira Code", "Consolas", monospace;
            font-size: 0.9em;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        /* New class for error rows */
        .error-row {
            background-color: var(--color-bg); /* Black background */
        }
        .error-row td, .error-row td pre {
            color: var(--color-error); /* Red text */
            font-weight: bold;
        }
        .error-row td pre {
            font-weight: normal; /* Keep preformatted text normal weight for readability */
        }
        /* New class for telepathic contact rows */
        .contact-row td, .contact-row td pre {
            color: var(--color-link); /* Yellow text */
            font-weight: bold;
        }
        .login-form {
            max-width: 300px;
        }
        .login-form input {
            width: 100%;
            padding: 0.5em;
            margin-top: 0.5em;
            margin-bottom: 1em;
            background-color: #333;
            border: 1px solid var(--color-border);
            color: var(--color-text);
            border-radius: 4px;
        }
        .login-form button {
            padding: 0.7em 1.5em;
            background-color: var(--color-accent-green);
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .error {
            color: var(--color-error);
            margin-bottom: 1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true): ?>
            <!-- Analytics View -->
            <h1>Analytics Log</h1>
            <p><a href="?logout=true">Logout</a></p>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>IP Address</th>
                        <th>Event Type</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    if (file_exists($log_file)) {
                        $lines = file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                        $lines = array_reverse($lines); // Show newest entries first
                        foreach ($lines as $line) {
                            $entry = json_decode($line, true);

                            // Check if the line was valid JSON
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $row_class = '';
                                if (isset($entry['type'])) {
                                    if ($entry['type'] === 'validation_error') {
                                        $row_class = 'class="error-row"';
                                    } elseif ($entry['type'] === 'telepathic_contact') {
                                        $row_class = 'class="contact-row"';
                                    }
                                }

                                // Format the timestamp to be more readable (UK format)
                                $formatted_timestamp = 'N/A';
                                if (!empty($entry['timestamp'])) {
                                    try {
                                        $date = new DateTime($entry['timestamp']);
                                        $formatted_timestamp = $date->format('d/m/Y H:i:s');
                                    } catch (Exception $e) {
                                        // Fallback for invalid date format
                                        $formatted_timestamp = htmlspecialchars($entry['timestamp']);
                                    }
                                }

                                // This is a valid entry, display it normally.
                                echo "<tr {$row_class}>";
                                echo '<td>' . $formatted_timestamp . '</td>';
                                echo '<td>' . htmlspecialchars($entry['ip'] ?? 'N/A') . '</td>';
                                echo '<td>' . htmlspecialchars($entry['type'] ?? 'N/A') . '</td>';
                                echo '<td><pre>' . htmlspecialchars(json_encode($entry['data'] ?? [], JSON_PRETTY_PRINT)) . '</pre></td>';
                                echo '</tr>';
                            } else {
                                // This is a malformed line. Display it as an error so it's visible.
                                echo '<tr class="error-row">';
                                echo '<td colspan="3">Malformed Log Entry</td>';
                                echo '<td><pre>' . htmlspecialchars($line) . '</pre></td>';
                                echo '</tr>';
                            }
                        }
                    } else {
                        echo '<tr><td colspan="4">Log file not found or is empty.</td></tr>';
                    }
                    ?>
                </tbody>
            </table>

        <?php else: ?>
            <!-- Login Form -->
            <h1>Login to View Analytics</h1>
            <form method="POST" action="view-analytics.php" class="login-form">
                <?php if (isset($error_message)): ?>
                    <p class="error"><?php echo $error_message; ?></p>
                <?php endif; ?>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required autofocus>
                <button type="submit">Login</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>