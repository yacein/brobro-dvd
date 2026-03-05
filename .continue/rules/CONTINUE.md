# Project Guide: Brother Brother Website

## 1. Project Overview
**Brother Brother** is a portfolio website for the directing duo Yaz and Haz. The site features a distinctive retro, glitch-aesthetic interface - styled as a 90s DVD menu - designed to showcase their showreel, commercial work, and personality.

Note that some elements of this site that appear to be errors may actually be intentional glitches. Please check before "correcting" any code.

Note that much of this project was "vibe-coded" with AI, and sparodically over a long time period, so I don't necessarily have a full handle on all the technologies in use, or how everything works.

### Key Technologies
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Backend:** PHP (Analytics and Logging)
- **External Services:** Vimeo (Video hosting), Google Sheets (Data enrichment)
- **Fonts:** Google Fonts (Press Start 2P, Bangers, Jersey 15, etc.)

### High-Level Architecture
- **Single Page Experience:** The site operates as a single-page application where different "screens" (Menu, Scenes, About, Contact) are toggled via JavaScript.
- **Custom Analytics:** A privacy-focused, custom analytics system tracks visitor engagement and "telepathic" contact requests, logging them to a server-side file.
- **Dynamic Content:** Site content can be personalized based on a `versionId` query parameter, which maps to specific company names via a Google Sheet.

## 2. Getting Started

### Prerequisites
- A local web server with PHP support (e.g., Apache, Nginx, or PHP built-in server).
- Modern web browser.

### Installation
1. Clone the repository.
2. Ensure the `assets/` directory contains all required media files.
3. Configure the local server to serve the project root.

### Running Locally
To run the project with the PHP built-in server:
```bash
php -S localhost:8000
```
Visit `http://localhost:8000` in your browser.

> **Note:** The analytics logging script (`log-event.php`) contains logic to suppress logging or handle CORS differently when running on `localhost`.

## 3. Project Structure

### Key Directories
- **Root**: Contains entry points (`index.html`, PHP scripts) and global styles.
- **`js/`**: Modular JavaScript code.
  - `main.js`: Entry point, orchestrates initialization.
  - `ui.js`: Manages UI transitions, screen switching, and modal behavior.
  - `analytics.js`: Handles data collection and communication with `log-event.php`.
  - `dom.js`: DOM element selectors and manipulation helpers.
  - `config.js`: Configuration constants.
- **`assets/`**: Images, GIFs, SVGs, and other media assets.

### Important Files
- **`index.html`**: The main markup file containing all screen templates.
- **`style.css`**: Core styling for layout, typography, and responsive design.
- **`glitch.css`**: CSS for the glitch visual effects.
- **`log-event.php`**: Receives POST requests from the frontend to log analytics events.
- **`view-analytics.php`**: A password-protected dashboard to view the generated analytics logs.

### User Experience
- visitor arrives either with or without a ?id in the url
 - if they don't have one, the "password" screen is shown (where they enter their id to open the site)
 - once the id is establish, by either method, this is used to populate site from the csv-based cms
 - if the user hasn't entered their password, a 'insert vhs' screen is shown. they must click this to proceed (so video may autoplay)
- after the 'password' screen or 'insert vhs' screen (as appropriate), the showreel plays full screen
- at the end of the showreel OR when the use clicks the 'menu' button, the home menu screen is shown, and the user is now in the main minisite. they can navigate between minisite screens, or choose to watch the showreel again

## easter eggs
- the site has multiple easter eggs, and a counter that tracks how many have been found.

## 4. Development Workflow

### Coding Standards
- **JavaScript:** ES6+ modules are used. Keep concerns separated (UI logic in `ui.js`, data logic in `analytics.js`).
- **CSS:** Standard CSS. Use variables for colors and fonts where possible.
- **PHP:** script-based style. Ensure security headers and input sanitization are maintained.

### Analytics & Data
- The site uses a `versionId` URL parameter (e.g., `?v=123`) to track specific client visits.
- This ID is cross-referenced with a Google Sheet CSV to display the company name in the backend analytics view.
- **Security:** `view-analytics.php` is protected by a hardcoded password (check file for current value).

### Deployment
- The site is configured for environments like Netlify (frontend) and standard PHP hosting.
- `log-event.php` has an `$allowed_origins` array that must be updated if deploying to a new domain.

## 5. Key Concepts

- **Screens:** The UI is divided into "screens" (e.g., `#mainMenuScreen`, `#sceneSelectionScreen`). Only one is typically active/visible at a time.
- **Telepathy:** The "Contact" form is thematically styled as "Telepathic Communication". It sends a specific event type (`telepathic_contact`) to the backend.
- **Glitch Effect:** Applied via CSS classes (e.g., `.x_glitch`) and SVG filters (`#telepathy-wave`) to create the retro-tech vibe.

## 6. Common Tasks

### Adding a New Video
1. Upload the video to Vimeo.
2. Update the video data structure in `js/config.js` or `js/main.js` (depending on where the video list is defined).
3. Ensure the thumbnail exists in `assets/`.

### Updating the Company List
1. Open the linked Google Sheet (URL in `log-event.php`).
2. Add a new row with `versionId` and `company_name`.
3. The backend automatically fetches this CSV to enrich the logs.

### Viewing Analytics
1. Navigate to `/view-analytics.php`.
2. Enter the admin password.
3. Use the filters to search by date, company, or event type.

## 7. Troubleshooting

### Analytics Not Logging
- Check the browser console for CORS errors.
- Ensure `log-event.php` has write permissions to `analytics_log.txt`.
- Verify the `$allowed_origins` in `log-event.php` includes your current domain.

### Glitch Effects Not Working
- Ensure `glitch.css` is loaded.
- Some effects rely on SVG filters defined in `index.html`; ensure the `<svg>` block hasn't been removed.

### Videos Not Playing
- Check if the Vimeo URL/ID is correct.
- Browser autoplay policies might block unmuted video. The background video should always be muted.

## 8. References
- [MDN Web Docs](https://developer.mozilla.org/)
- [Vimeo Player API](https://developer.vimeo.com/player/sdk)
- [PHP Documentation](https://www.php.net/docs.php)
