// Import necessary modules and functions
import { updateVideoData, videoData as defaultConfig } from './config.js';
import { fetchData, mergeDefaults } from './api.js';
import * as dom from './dom.js'; // Imports the variables
import { initDom } from './dom.js'; // Imports the initializer function
import { animateSubtitle } from './animations.js';
import { initEasterEgg } from './easter-egg.js';
import {
    populateStaticData,
    goToScreen,
    initEventListeners,
    setSiteVersionId
} from './ui.js';

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
 */
async function initializeApp(id) {
    setSiteVersionId(id);

    // Attempt to fetch dynamic data from the CSV
    const fetchedDataFromCSV = await fetchData(id);

    if (fetchedDataFromCSV) {
        // Merge the fetched data with the hard-coded defaults.
        // The fetched data takes precedence, defaults fill in the blanks.
        let finalData = structuredClone(fetchedDataFromCSV);
        mergeDefaults(finalData, defaultConfig);
        updateVideoData(finalData); // Update the shared config object
        console.log("videoData updated with fetched data and defaults merged:", structuredClone(finalData));
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
    // If the query string has content (e.g., "?2"), strip the "?" and use it as the ID. Otherwise, it's null.
    const requestedId = queryString.length > 1 ? queryString.substring(1).trim() : null;

    if (requestedId) {
        // ID is in the URL, hide password screen and start immediately.
        dom.passwordScreen.style.display = 'none'; // Hide instantly
        initializeApp(requestedId);
    } else {
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
            const enteredId = dom.passcodeInput.value.trim();
            if (enteredId) {
                // Fade out the password screen, revealing the loader underneath.
                dom.passwordScreen.classList.add('hidden');
                initializeApp(enteredId);
            }
        });
    }
}

// Add the event listener to run the main function
document.addEventListener('DOMContentLoaded', main);