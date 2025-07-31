const endpoint = 'https://assets.brobro.film/dvd/log-event.php';

/**
 * Sends a custom event to the analytics backend. This is a "fire and forget" call.
 * @param {string} eventType A category for the event (e.g., 'site_load', 'play_reel_click').
 * @param {object} [data={}] Additional data to log with the event.
 */
export async function logEvent(eventType, data = {}) {
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