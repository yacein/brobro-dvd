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

    // --- DEBUGGING STEP ---
    // Log the live HTML of the body to the console to see what the script is working with.
    console.log('Current document.body.innerHTML:', document.body.innerHTML);

    // Initialize all DOM element references now that the DOM is ready.
    initDom();

    const urlParams = new URLSearchParams(window.location.search);
    const requestedId = urlParams.get('id');

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
        const promptText = 'Hello...<br>Please enter your passcode > ';
        const typingSpeed = 80;

        // Start the typewriter animation.
        typeWriter(promptLabel, promptText, typingSpeed, () => {
            // When typing is complete, reveal and focus the input field.
            dom.passcodeInput.style.display = 'block';
            dom.passcodeInput.focus();
        });

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