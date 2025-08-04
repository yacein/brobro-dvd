const endpoint = 'https://assets.brobro.film/dvd/log-event.php';
let analyticsEnabled = true; // Enabled by default

/**
 * Disables all analytics logging for the current session.
 * This is triggered by appending '-x' to the site ID.
 */
export function disableAnalytics() {
    analyticsEnabled = false;
    console.log('%cAnalytics logging is disabled for this session.', 'color: orange; font-weight: bold;');
}

/**
 * Sends a custom event to the analytics backend. This is a "fire and forget" call.
 * @param {string} eventType A category for the event (e.g., 'site_load', 'play_reel_click').
 * @param {object} [data={}] Additional data to log with the event.
 */
export async function logEvent(eventType, data = {}) {
    if (!analyticsEnabled) {
        return; // Do nothing if analytics are disabled for this session.
    }
    try {
        const formData = new FormData();
        formData.append('eventType', eventType);
        formData.append('eventData', JSON.stringify(data)); // Send data as a JSON string

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error(`Analytics server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to send analytics event:', error);
    }
}