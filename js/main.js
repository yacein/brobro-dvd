// Import necessary modules and functions
import { updateVideoData, videoData as defaultConfig, setSiteVersionId } from './config.js';
import { fetchData, mergeDefaults } from './api.js';
import * as dom from './dom.js'; // Imports the variables
import { logEvent, disableAnalytics } from './analytics.js';
import { initDom } from './dom.js'; // Imports the initializer function
import { animateSubtitle } from './animations.js';
import { initEasterEgg, initImageEasterEgg, initSecondImageEasterEgg, initMenuEasterEgg } from './easter-egg.js';
import { populateStaticData, goToScreen, initEventListeners } from './ui.js';

/**
 * Animates text with a typewriter effect, supporting simple HTML like <br>.
 * @param {HTMLElement} element The element to type into.
 * @param {string} fullText The text to type.
 * @param {number} speed The delay between characters in ms.
 * @param {function} [onComplete] A callback function to run when typing is finished.
 */
function typeWriter(element, fullText, speed, onComplete) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < fullText.length) {
            // Check for a <br> tag to handle newlines correctly
            if (fullText.substring(i, i + 4).toLowerCase() === '<br>') {
                element.innerHTML += '<br>';
                i += 4;
            } else {
                element.innerHTML += fullText.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        } else if (onComplete) {
            onComplete();
        }
    }
    type();
}

/**
 * Initializes the main application after a passcode has been provided or found.
 * @param {string} id The site version ID to load.
 * @param {string} arrivalMethod How the user arrived ('direct_link' or 'password_entry').
 */
async function initializeApp(id, arrivalMethod) {
    setSiteVersionId(id);

    // --- ANALYTICS: Log the initial site load with the version ID and arrival method ---
    logEvent('site_load', { versionId: id, method: arrivalMethod });

    // Attempt to fetch dynamic data from the CSV
    const fetchedDataFromCSV = await fetchData(id);

    if (fetchedDataFromCSV) {
        // Merge the fetched data with the hard-coded defaults.
        // The fetched data takes precedence, defaults fill in the blanks.
        let finalData = structuredClone(fetchedDataFromCSV);
        mergeDefaults(finalData, defaultConfig);

        // Now that all merging is complete, compact the arrays to remove empty slots and invalid entries.
        // This is the correct place for this logic.
        if (finalData) {
            if (Array.isArray(finalData.chapters)) {
                finalData.chapters = finalData.chapters.filter(chapter => chapter && Object.keys(chapter).length > 0 && chapter.title);
            }
            if (Array.isArray(finalData.specialFeatures)) {
                finalData.specialFeatures = finalData.specialFeatures.filter(feature => feature && Object.keys(feature).length > 0 && feature.text);
            }
            if (Array.isArray(finalData.pagination)) {
                finalData.pagination = finalData.pagination.filter(page => page && Object.keys(page).length > 0 && page.name);
            }
        }

        updateVideoData(finalData); // Update the shared config object
        console.log("MAIN: Final videoData object after all merging and cleanup:", structuredClone(finalData));
    } else {
        console.warn("Failed to fetch data from CSV. Using ONLY hard-coded videoData defaults.");
    }

    // Populate all data-driven content
    populateStaticData();

    // Initialize all static event listeners
    initEventListeners();

    // Start on the main screen
    goToScreen('main');

    // Animate subtitle on initial load
    const finalSubtitleText = dom.mainMenuSubtitle.dataset.text;
    const charCounts = [8, 8, 7, 0, 7, 6, 6, 5, 4, 8, 2, 2];
    animateSubtitle(dom.subtitleShowreelElement, finalSubtitleText, charCounts);

    // Highlight the "Play Reel" button by default
    dom.playReelButton.classList.add('is-active');

    // Add a one-time listener to remove the default highlight on interaction
    const mainMenuButtonContainer = dom.mainMenuScreen.querySelector('.button-container');
    if (mainMenuButtonContainer) {
        mainMenuButtonContainer.addEventListener('mouseenter', () => {
            dom.playReelButton.classList.remove('is-active');
        }, { once: true });
    }

    // Initialize the bouncing DVD logo easter egg
    initEasterEgg();

    // Initialize the image click easter egg
    initImageEasterEgg();

    // Initialize the second image easter egg
    initSecondImageEasterEgg();

    // Initialize the menu easter egg
    initMenuEasterEgg();

    // Hide the loading overlay now that everything is ready
    dom.loadingOverlay.classList.add('hidden');
    console.log("Loading overlay hidden. Application is ready.");
}

/**
 * Main application entry point. Decides whether to show password screen or start app.
 */
async function main() {
    console.log("DOMContentLoaded fired. Initializing application...");

    // Initialize all DOM element references now that the DOM is ready.
    initDom();

    // Get the ID directly from the query string (e.g., "?2")
    const queryString = window.location.search;
    let requestedId = queryString.length > 1 ? queryString.substring(1).trim() : null;

    // Check for the analytics exclusion flag '-x'
    if (requestedId && requestedId.endsWith('-x')) {
        disableAnalytics(); // Disable logging for this session
        requestedId = requestedId.slice(0, -2); // Use the ID without the flag
    }

    if (requestedId) {
        // ID is in the URL, hide password screen and start immediately.
        dom.passwordScreen.style.display = 'none'; // Hide instantly
        initializeApp(requestedId, 'direct_link');
    } else {
        // --- ANALYTICS: Log that the user has landed on the password screen ---
        logEvent('password_screen_view');

        // Defensive check: ensure the password screen elements were found in the DOM.
        if (!dom.passwordScreen || !dom.passcodeInput || !dom.passwordForm.querySelector('label')) {
            console.error("Fatal Error: Password screen HTML elements not found. Please ensure index.html is up to date and not cached.");
            document.body.innerHTML = '<div style="color: red; font-family: monospace; padding: 2em;">Fatal Error: Could not find password screen elements. Check the console for details.</div>';
            return;
        }

        // The loading overlay remains visible underneath the password screen to prevent flashing.
        const promptLabel = dom.passwordForm.querySelector('label');
        const initialText = 'Hello...';
        const restOfText = 'We\'re glad you found us.<br>Please type your passcode and press enter > ';
        const typingSpeed = 80;
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        if (isTouchDevice) {
            // --- MOBILE (TOUCH) LOGIC ---
            // 1. Type out the initial greeting.
            typeWriter(promptLabel, initialText, typingSpeed, () => {
                // 2. Once the greeting is typed, show the "tap to continue" prompt.
                dom.tapPrompt.style.display = 'block';

                // 3. Add a one-time event listener for the tap.
                dom.passwordScreen.addEventListener('click', () => {
                    // 4. Focus the invisible input to trigger keyboard.
                    dom.passcodeInput.focus();
                    // 5. Hide the tap prompt.
                    dom.tapPrompt.style.display = 'none';

                    // 6. Type the rest of the message.
                    promptLabel.innerHTML += '<br>';
                    const spanForRest = document.createElement('span');
                    promptLabel.appendChild(spanForRest);
                    typeWriter(spanForRest, restOfText, typingSpeed, () => {
                        // 7. When typing is complete, make the input field visually appear.
                        dom.passcodeInput.classList.add('visible');
                    });
                }, { once: true }); // The listener runs only once.
            });
        } else {
            // --- DESKTOP (NON-TOUCH) LOGIC ---
            const fullText = initialText + '<br>' + restOfText;
            typeWriter(promptLabel, fullText, typingSpeed, () => {
                // When typing is complete, reveal and focus the input field.
                dom.passcodeInput.classList.add('visible');
                dom.passcodeInput.focus();
            });
        }


        dom.passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let enteredId = dom.passcodeInput.value.trim();

            // Check for the analytics exclusion flag '-x' in the password input
            if (enteredId.endsWith('-x')) {
                disableAnalytics(); // Disable logging for this session
                enteredId = enteredId.slice(0, -2); // Use the ID without the flag
            }

            if (enteredId) {
                // Fade out the password screen, revealing the loader underneath.
                dom.passwordScreen.classList.add('hidden');
                initializeApp(enteredId, 'password_entry');
            }
        });
    }
}

// Add the event listener to run the main function
document.addEventListener('DOMContentLoaded', main);