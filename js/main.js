// Import necessary modules and functions
import { updateVideoData, videoData as defaultConfig } from './config.js';
import { fetchData, mergeDefaults } from './api.js';
import * as dom from './dom.js';
import { animateSubtitle } from './animations.js';
import { initEasterEgg } from './easter-egg.js';
import {
    populateStaticData,
    goToScreen,
    initEventListeners,
    setSiteVersionId
} from './ui.js';

/**
 * Main application entry point.
 * This function is executed when the DOM is fully loaded.
 */
async function main() {
    console.log("DOMContentLoaded fired. Initializing application...");

    // Determine the site version from the URL query string
    const requestedId = new URLSearchParams(window.location.search).get('id') || '1';
    setSiteVersionId(requestedId);

    // Attempt to fetch dynamic data from the CSV
    const fetchedDataFromCSV = await fetchData();

    if (fetchedDataFromCSV) {
        console.log("Data fetched from CSV:", JSON.parse(JSON.stringify(fetchedDataFromCSV)));
        // Merge the fetched data with the hard-coded defaults.
        // The fetched data takes precedence, defaults fill in the blanks.
        let finalData = JSON.parse(JSON.stringify(fetchedDataFromCSV));
        mergeDefaults(finalData, defaultConfig);
        updateVideoData(finalData); // Update the shared config object
        console.log("videoData updated with fetched data and defaults merged:", JSON.parse(JSON.stringify(finalData)));
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

// Add the event listener to run the main function
document.addEventListener('DOMContentLoaded', main);