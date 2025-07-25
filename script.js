// --- DATA DEFINITION (NOW DEFAULT VALUES) ---
let videoData = { // Changed to 'let' as it will be reassigned or merged
    siteTitle: 'Brother Brother | The Showreel',
    mainMenuTitle: 'BROTHER BROTHER',
    mainMenuGlitchText: 'YAZ and HAZ',
    mainMenuSubtitle: 'THE SHOWREEL',
    copyrightText: '© 2025 BROTHER BROTHER. ALL RIGHTS RESERVED.',
    mainBackgroundVimeoId: '292109430',
    mainReelVimeoId: '431751544', // Updated showreel video ID
    // Corrected URL: Removed markdown formatting
    specialFeaturesBackgroundImage: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/d56856ff-5d6d-4d98-acfe-1ed609ef3d75/RUTH+|+festival+preview-high1.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg', // New background image for scene selection
    chapters: [
        { title: 'FASHION FILM: SON AND PARK', vimeoId: '292109430', 
          // Corrected URL: Removed markdown formatting
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/1030ca68-958a-42c1-842f-882228239462/Son+%26+Park+Campaign+Teaser+2-low.gif?content-type=image%2Fgif' },
        { title: 'COMMERCIAL: MAKE IT COUNT', vimeoId: '292109430', 
          // Corrected URL: Removed markdown formatting
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/aec16f05-ed69-456a-ba1e-14d6e44ae8d1/ALEX+%28Short+film%29+Trailer-high.gif?content-type=image%2Fgif' },
        { title: 'DOCUMENTARY: SOMETHING', vimeoId: '292109430', 
          // Corrected URL: Removed markdown formatting
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/30eb84ab-fdd4-4304-b360-e3d6ac1700d8/An+Admin+Worker+At+The+End+Of+The+World+-+trailer-high.gif?content-type=image%2Fgif' },
        { title: 'EDUCATION: RHP', vimeoId: '292109430', 
          // Corrected URL: Removed markdown formatting
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/ad2a4236-30d9-4261-9af8-5b6166575282/Brother+Brother+Reel+2020-3-high.gif?content-type=image%2Fgif' }
    ],
    specialFeatures: [
        { text: 'Make Contact', url: '#' },
        { text: 'About Us', url: '#' },
        { text: 'Instagram', 
          // Corrected URL: Removed markdown formatting
          url: 'https://www.instagram.com/brobrofilm/', target: '_blank' },
        { text: 'Easter Eggs', url: '#' }
    ]
};
// --- END DATA DEFINITION ---


// Get references to DOM elements
const mainMenuHeroTitle = document.getElementById('mainMenuHeroTitle');
const mainMenuGlitchText = document.getElementById('mainMenuGlitchText');
const mainMenuSubtitle = document.getElementById('mainMenuSubtitle');
const specialFeaturesButtonContainer = document.getElementById('specialFeaturesButtonContainer');
const mainBackgroundVideo = document.getElementById('mainBackgroundVideo');
const playReelButton = document.getElementById('playReelButton');
const sceneSelectionButton = document.getElementById('sceneSelectionButton');
const specialFeaturesButton = document.getElementById('specialFeaturesButton'); // Original button
const specialFeaturesClone = document.getElementById('specialFeaturesClone'); // Clone element
const videoModal = document.getElementById('videoModal');
const videoModalIframe = document.getElementById('videoModalIframe');
const closeModalButton = document.getElementById('closeModal');
const screenContainer = document.getElementById('screenContainer');
const mainMenuScreen = document.getElementById('mainMenuScreen');
const sceneSelectionScreen = document.getElementById('sceneSelectionScreen');
const specialFeaturesScreen = document.getElementById('specialFeaturesScreen'); // Get reference to special features screen
const backToMainMenuFromScenes = document.getElementById('backToMainMenuFromScenes');
const backToMainMenuFromFeatures = document.getElementById('backToMainMenuFromFeatures');
const sceneSelectionGrid = document.getElementById('sceneSelectionGrid');
const transitionOverlay = document.getElementById('transitionOverlay'); // New: Transition Overlay
const subtitleShowreelElement = document.querySelector('.subtitle-showreel'); // Reference to the subtitle element

// Placeholder for sound effect
const bloopSound = new Audio('https://www.soundjay.com/buttons/button-1.mp3');

// Function to play sound effect
function playBloopSound() {
    bloopSound.currentTime = 0;
    bloopSound.play().catch(e => console.error("Error playing sound:", e));
}

// Function to attach hover sound to all menu buttons
function attachButtonHoverSounds() {
    // Remove existing listeners to prevent duplicates if called multiple times
    document.querySelectorAll('.menu-button').forEach(button => {
        button.removeEventListener('mouseenter', playBloopSound);
    });
    // Add new listeners
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('mouseenter', playBloopSound);
    });
}


// Function to populate static data from the videoData object
function populateStaticData() {
    // Set page title
    document.title = videoData.siteTitle;

    // Set main menu title and glitch text
    mainMenuHeroTitle.textContent = videoData.mainMenuTitle;
    mainMenuGlitchText.dataset.text = videoData.mainMenuGlitchText;
    mainMenuSubtitle.dataset.text = videoData.mainMenuSubtitle;

    // Set copyright text in all footers
    document.querySelectorAll('.copyright-text').forEach(el => {
        el.innerHTML = videoData.copyrightText;
    });

    // Populate Special Features buttons
    specialFeaturesButtonContainer.innerHTML = ''; // Clear existing
    videoData.specialFeatures.forEach(item => {
        const button = document.createElement('a');
        button.href = item.url || '#'; // Ensure a fallback URL
        button.className = 'menu-button';
        button.textContent = item.text;
        if (item.target) {
            button.target = item.target;
            button.rel = 'noopener noreferrer'; // Good practice for security
        }
        specialFeaturesButtonContainer.appendChild(button);
    });
    attachButtonHoverSounds(); // Re-attach sounds after populating buttons
}

// Function to dynamically load chapter videos
function loadChapterVideos() {
    sceneSelectionGrid.innerHTML = ''; // Clear existing content
    videoData.chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.classList.add('chapter-video-item');

        const videoThumbnail = document.createElement('div');
        videoThumbnail.classList.add('video-thumbnail');

        const thumbnailImg = document.createElement('img');
        // Corrected URL: Removed markdown formatting. Added fallback
        thumbnailImg.src = chapter.thumbnailUrl || 'https://placehold.co/1280x720/000000/FFFFFF?text=No+Image';
        thumbnailImg.alt = `Thumbnail for ${chapter.title || 'Untitled Chapter'}`;

        videoThumbnail.appendChild(thumbnailImg);

        const chapterTitle = document.createElement('div');
        chapterTitle.classList.add('chapter-title');
        chapterTitle.textContent = chapter.title || 'Untitled Chapter'; // Fallback

        chapterItem.appendChild(videoThumbnail);
        chapterItem.appendChild(chapterTitle);

        // Add click listener to open modal for chapter video
        chapterItem.addEventListener('click', () => {
            const vimeoId = chapter.vimeoId || videoData.mainBackgroundVimeoId; // Fallback to background video
            videoModalIframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=0&autopause=1&muted=0`;
            videoModal.classList.add('show-modal');
        });

        sceneSelectionGrid.appendChild(chapterItem);
    });
}

/**
 * Animates text character by character with a digital reveal effect.
 * Each character cycles through random symbols before settling on its final form.
 * @param {HTMLElement} element The HTML element to animate (e.g., an <h2>).
 * @param {string} finalText The final text string to display.
 * @param {number[]} charCycleCounts An array specifying how many "incorrect" characters each final character should cycle through.
 * The length of this array should match the length of `finalText`.
 */
function animateSubtitle(element, finalText, charCycleCounts) {
    element.innerHTML = ''; // Clear any existing content
    // Expanded pool of random chars, including common Latin, numbers, and some Cyrillic
    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?`~АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'; 

    finalText.split('').forEach((finalChar, index) => {
        const charSpan = document.createElement('span');
        // For spaces, set textContent to '_' to maintain width, but keep it invisible
        charSpan.textContent = (finalChar === ' ') ? '_' : finalChar;
        element.appendChild(charSpan);

        // Initial state for ALL spans (including spaces)
        charSpan.style.opacity = '0'; // Start invisible
        charSpan.style.filter = 'blur(5px)';
        charSpan.style.transform = 'translateY(0px)'; // Start at final Y position
        charSpan.style.color = 'rgba(0, 255, 0, 0.3)'; // Faint green

        // Delay the start of this character's animation/reveal
        setTimeout(() => {
            // If it's a space, just make it occupy space invisibly and return
            if (finalChar === ' ') {
                charSpan.style.opacity = '0'; // Explicitly keep invisible
                charSpan.style.filter = 'none'; // No blur
                charSpan.style.transform = 'translateY(0)'; // No jiggle
                charSpan.style.color = '#00ff00'; // Final color (though invisible)
                return; // Skip cycling for spaces
            }

            // For non-space characters, apply the final visible styles and start cycling
            charSpan.style.opacity = '1';
            charSpan.style.filter = 'none';
            charSpan.style.transform = 'translateY(0)';
            charSpan.style.color = '#00ff00';
            charSpan.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7), 0 0 10px rgba(0, 255, 0, 0.5)';

            const numIncorrectCycles = charCycleCounts[index] !== undefined ? charCycleCounts[index] : 0;
            let currentCycle = 0;
            let originalContent = finalChar; // Store the correct character

            const intervalId = setInterval(() => {
                if (currentCycle < numIncorrectCycles) {
                    // Display a random character
                    charSpan.textContent = characterPool[Math.floor(Math.random() * characterPool.length)];
                    
                    // Apply temporary "jiggle" and "flicker" styles
                    charSpan.style.opacity = Math.random() * 0.5 + 0.3; // Random opacity between 0.3 and 0.8
                    charSpan.style.filter = `blur(${Math.random() * 2}px)`; // Random blur up to 2px
                    charSpan.style.transform = `translateY(${Math.random() * 6 - 3}px)`; // Random vertical jiggle between -3px and 3px
                    charSpan.style.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`; // Random color flash

                    currentCycle++;
                } else {
                    clearInterval(intervalId); // Stop random cycling
                    charSpan.textContent = originalContent; // Revert to correct character
                    // Ensure final styles are applied after cycling stops (CSS transition handles smoothness)
                    charSpan.style.opacity = '1';
                    charSpan.style.filter = 'none';
                    charSpan.style.transform = 'translateY(0)';
                    charSpan.style.color = '#00ff00';
                    charSpan.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7), 0 0 10px rgba(0, 255, 0, 0.5)';
                }
            }, 100); // 0.1 seconds per incorrect character
        }, index * 150); // 0.15 seconds delay for each character's animation start
    });
}

// Helper function to set the main background video if it's not already set
function updateMainBackgroundVideo() {
    const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
    if (mainBackgroundVideo.src !== newBackgroundSrc) {
        mainBackgroundVideo.src = newBackgroundSrc;
    }
}


// Function to manage screen transitions and background videos
function goToScreen(screenName) {
    // Determine if we are coming from the special features screen
    const isComingFromSpecialFeatures = screenContainer.classList.contains('slide-to-special-features');

    // Universal reset for special features clone's inline styles
    // This prepares it for either a new animation or to be hidden by CSS.
    specialFeaturesClone.classList.remove('show-clone');
    specialFeaturesClone.style.top = '';
    specialFeaturesClone.style.left = '';
    // Removed: specialFeaturesClone.style.transform = ''; // This line was problematic
    specialFeaturesClone.style.fontSize = '';
    specialFeaturesClone.style.letterSpacing = '';

    // Reset transition overlay: ONLY remove the 'show' class.
    // The base CSS for .transition-overlay handles opacity:0 and visibility:hidden.
    transitionOverlay.classList.remove('show');
    transitionOverlay.style.transform = 'none'; // Ensure it's full size
    transitionOverlay.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out'; // Reset transition for next use


    // Handle navigation to 'main' screen
    if (screenName === 'main') {
        // Only trigger the black box transition if coming from special features
        if (isComingFromSpecialFeatures) {
            // Step 1: Overlay Fades In (0.5s)
            transitionOverlay.classList.add('show');

            // Step 2: After overlay is fully opaque (0.5s), trigger the screen slide and other changes
            setTimeout(() => {
                // Perform screen slide
                screenContainer.classList.remove('slide-to-special-features', 'slide-to-scene');
                screenContainer.classList.add('slide-to-main');

                // Make original special features button visible
                specialFeaturesButton.style.opacity = '1';
                specialFeaturesButton.style.pointerEvents = 'auto';

                // Clear special features screen background
                specialFeaturesScreen.style.backgroundImage = '';
                sceneSelectionScreen.style.backgroundImage = ''; // Ensure scene background is cleared

                // Update main background video
                updateMainBackgroundVideo();
                // Subtitle animation is now handled only on DOMContentLoaded, not on subsequent returns to main.
                // Re-animate the subtitle when returning to main menu
                // const finalSubtitleText = subtitleShowreelElement.dataset.text;
                // const charCounts = [8, 8, 7, 0, 7, 6, 6, 5, 4, 8, 2, 2]; 
                // animateSubtitle(subtitleShowreelElement, finalSubtitleText, charCounts);


                // Step 3: Wait for the screen slide to complete (1s), then hold briefly and fade out.
                setTimeout(() => {
                    transitionOverlay.classList.remove('show'); // Start fading out
                }, 1000 + 300); // Wait for 1s slide + 300ms hold
            }, 500); // Wait 0.5s for overlay to become fully opaque
        } else {
            // If not coming from special features (e.g., initial load or from scene),
            // just perform the screen slide directly without black box.
            screenContainer.classList.remove('slide-to-special-features', 'slide-to-scene');
            screenContainer.classList.add('slide-to-main');
            sceneSelectionScreen.style.backgroundImage = ''; // Ensure scene background is cleared
            // Update main background video
            updateMainBackgroundVideo();            // Subtitle animation is now handled only on DOMContentLoaded, not on subsequent returns to main.
            // Animate subtitle on initial load as well
            // const finalSubtitleText = subtitleShowreelElement.dataset.text;
            // const charCounts = [8, 8, 7, 0, 7, 6, 6, 5, 4, 8, 2, 2];
            // animateSubtitle(subtitleShowreelElement, finalSubtitleText, charCounts);
        }
    } else if (screenName === 'scene') {
        screenContainer.classList.remove('slide-to-special-features', 'slide-to-main');
        screenContainer.classList.add('slide-to-scene');
        // Set background image for scene selection screen with a dark overlay
        sceneSelectionScreen.style.backgroundImage = `url('${videoData.sceneBackgroundImage}')`;
        sceneSelectionScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; /* Default background color (dark overlay) */
        sceneSelectionScreen.style.backgroundBlendMode = 'multiply'; /* Blend mode */

        sceneSelectionScreen.style.backgroundSize = 'cover'; // Ensure it covers
        sceneSelectionScreen.style.backgroundPosition = 'center'; // Center the image
        specialFeaturesScreen.style.backgroundImage = ''; // Clear special features background
        updateMainBackgroundVideo();
        loadChapterVideos(); // Ensure chapters are loaded
    } else if (screenName === 'specialFeatures') {
        const rect = specialFeaturesButton.getBoundingClientRect();
        specialFeaturesButton.style.opacity = '0';
        specialFeaturesButton.style.pointerEvents = 'none';
        specialFeaturesClone.textContent = specialFeaturesButton.textContent;
        specialFeaturesClone.style.top = `${rect.top}px`;
        specialFeaturesClone.style.left = `${rect.left}px`;
        // Removed: specialFeaturesClone.style.transform = ''; // This line was problematic
        specialFeaturesClone.style.fontSize = window.getComputedStyle(specialFeaturesButton).fontSize;
        specialFeaturesClone.style.padding = window.getComputedStyle(specialFeaturesButton).padding;
        specialFeaturesClone.style.lineHeight = window.getComputedStyle(specialFeaturesButton).lineHeight;
        specialFeaturesClone.style.textShadow = window.getComputedStyle(specialFeaturesButton).textShadow;
        specialFeaturesClone.style.letterSpacing = window.getComputedStyle(specialFeaturesButton).letterSpacing;
        // Removed: specialFeaturesClone.style.transform = 'scale(1)'; // Rely on CSS for initial state


        requestAnimationFrame(() => {
            specialFeaturesClone.classList.add('show-clone');
            requestAnimationFrame(() => {
                specialFeaturesClone.style.top = '100px';
                specialFeaturesClone.style.left = '50%';
                specialFeaturesClone.style.transform = 'translateX(-50%) scale(2)';
                specialFeaturesClone.style.fontSize = 'clamp(1.8rem, 5vw, 3rem)';
                specialFeaturesClone.style.letterSpacing = '5px';
            });
        });
        specialFeaturesScreen.style.backgroundImage = `url('${videoData.specialFeaturesBackgroundImage}')`;
        specialFeaturesScreen.style.backgroundSize = 'cover';
        specialFeaturesScreen.style.backgroundPosition = 'center';
        sceneSelectionScreen.style.backgroundImage = ''; // Clear scene background
        updateMainBackgroundVideo();
        setTimeout(() => {
            screenContainer.classList.remove('slide-to-main', 'slide-to-scene');
            screenContainer.classList.add('slide-to-special-features');
        }, 1000);
    }
}


// PLAY REEL button functionality
playReelButton.addEventListener('click', (e) => {
    e.preventDefault();
    videoModalIframe.src = `https://player.vimeo.com/video/${videoData.mainReelVimeoId}?autoplay=1&loop=0&autopause=1&muted=0`;
    videoModal.classList.add('show-modal');
});

// Close modal functionality
closeModalButton.addEventListener('click', () => {
    videoModal.classList.remove('show-modal');
    videoModalIframe.src = '';
});

// Close modal if clicked outside
videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        videoModal.classList.remove('show-modal');
        videoModalIframe.src = '';
    }
});

// SCENE SELECTION button functionality
sceneSelectionButton.addEventListener('click', (e) => {
    e.preventDefault();
    goToScreen('scene');
});

// SPECIAL FEATURES button functionality
specialFeaturesButton.addEventListener('click', (e) => {
    e.preventDefault();
    goToScreen('specialFeatures');
});

// BACK TO MENU button functionality from Scene Selection screen
backToMainMenuFromScenes.addEventListener('click', (e) => {
    e.preventDefault();
    goToScreen('main');
});

// BACK TO MENU button functionality from Special Features screen
backToMainMenuFromFeatures.addEventListener('click', (e) => {
    e.preventDefault();
    goToScreen('main');
});


/**
 * Helper function to deep merge properties from source to target,
 * but only if the target's property is undefined, null, or an empty string.
 * This is crucial for the 'basedOn' templating system.
 * @param {object} target The object to merge into.
 * @param {object} source The object to merge from (defaults).
 * @returns {object} The modified target object.
 */
function mergeDefaults(target, source) {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return target; // Not objects, or null, so can't merge deeply
    }

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            // Handle arrays (specifically chapters and specialFeatures arrays of objects)
            if (Array.isArray(source[key])) {
                if (!Array.isArray(target[key])) {
                    target[key] = []; // Ensure target has an array if source does
                }
                source[key].forEach((sourceItem, index) => {
                    if (typeof sourceItem === 'object' && sourceItem !== null) {
                        if (!target[key][index] || typeof target[key][index] !== 'object' || target[key][index] === null) {
                            // If target item is missing or not an object, deep copy the source item
                            target[key][index] = JSON.parse(JSON.stringify(sourceItem));
                        } else {
                            // If both are objects, recursively merge their properties
                            mergeDefaults(target[key][index], sourceItem);
                        }
                    } else {
                        // For primitive array items, only set if target's item is blank/missing
                        if (target[key][index] === undefined || target[key][index] === null || target[key][index] === '') {
                            target[key][index] = sourceItem;
                        }
                    }
                });
            } 
            // Handle nested objects (if any besides arrays)
            else if (typeof source[key] === 'object' && source[key] !== null &&
                       typeof target[key] === 'object' && target[key] !== null) {
                mergeDefaults(target[key], source[key]); // Recursively merge for nested objects
            } 
            // Handle primitive values (strings, numbers, booleans)
            else {
                // Only set if the target's value is undefined, null, or an empty string
                if (target[key] === undefined || target[key] === null || target[key] === '') {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}


/**
 * Parses a CSV string into an array of JavaScript objects.
 * Each object represents a row, with headers as keys.
 * Handles nested array structures based on dot notation in headers (e.g., 'chapter1.title').
 * Assumes a 'rowId' column exists for lookup.
 * @param {string} csvString The raw CSV content.
 * @returns {Array<object>} An array of parsed data objects, one for each row.
 */
function parseCsv(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) { // Need at least a header and one data row
        console.warn("CSV is empty or only contains headers.");
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim());
    console.log("CSV Headers:", headers); // DEBUG: Log headers

    const parsedDataRows = [];

    // Start from the first data row (index 1)
    for (let i = 1; i < lines.length; i++) {
        const dataRowValues = lines[i].split(',').map(value => value.trim());
        const rowObject = {};
        // Initialize chapters and specialFeatures arrays to ensure they are always present
        rowObject.chapters = [];
        rowObject.specialFeatures = [];

        headers.forEach((header, index) => {
            const value = dataRowValues[index];

            // Check for chapterX.property pattern
            const chapterMatch = header.match(/^chapter(\d+)\.(.+)$/);
            if (chapterMatch) {
                const chapterIndex = parseInt(chapterMatch[1], 10) - 1; // Convert to 0-based index
                const propName = chapterMatch[2];
                
                // Ensure the chapter object exists in the array
                if (!rowObject.chapters[chapterIndex]) {
                    rowObject.chapters[chapterIndex] = {};
                }
                rowObject.chapters[chapterIndex][propName] = value;
                return; // Move to next header
            }

            // Check for specialFeatureX.property pattern
            const featureMatch = header.match(/^specialFeature(\d+)\.(.+)$/);
            if (featureMatch) {
                const featureIndex = parseInt(featureMatch[1], 10) - 1; // Convert to 0-based index
                const propName = featureMatch[2];

                // Ensure the special feature object exists in the array
                if (!rowObject.specialFeatures[featureIndex]) {
                    rowObject.specialFeatures[featureIndex] = {};
                }
                rowObject.specialFeatures[featureIndex][propName] = value;
                return; // Move to next header
            }

            // For all other (flat) properties, including 'rowId' and 'basedOn'
            rowObject[header] = value;
        });

        // Filter out empty or incomplete chapters/special features if the CSV has sparse data
        rowObject.chapters = rowObject.chapters.filter(chapter => Object.keys(chapter).length > 0 && chapter.title);
        rowObject.specialFeatures = rowObject.specialFeatures.filter(feature => Object.keys(feature).length > 0 && feature.text);
        
        console.log(`Parsed Row ${i}:`, rowObject); // DEBUG: Log each parsed row object

        parsedDataRows.push(rowObject);
    }

    return parsedDataRows; // Returns an array of all data rows
}


/**
 * Asynchronously fetches data from a Google Sheet CSV and selects a specific row by ID,
 * applying 'basedOn' inheritance.
 * @returns {Promise<object|null>} A promise that resolves with the fetched and selected data, or null on error.
 */
async function fetchData() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRnDZiD0zbEjdALbE4BPJrGUvnC3jK4mK4uebn2kLjajcgCbXQsE5xBG9a0R1wxn9WJo-ogpLC3p-X0/pub?gid=1534684239&single=true&output=csv';
    let retries = 3;
    let delay = 1000; // 1 second

    const queryString = window.location.search;
    let requestedId = queryString.length > 1 ? queryString.substring(1).trim() : '1'; 
    console.log("Requested ID from URL:", requestedId); // DEBUG: Log requested ID

    while (retries > 0) {
        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log("Raw Fetched CSV data:", csvText); // DEBUG: Log raw CSV content

            // Parse ALL rows from the CSV
            const allParsedRows = parseCsv(csvText);
            console.log("All Parsed CSV Rows (before resolution):", JSON.parse(JSON.stringify(allParsedRows))); // DEBUG: Log all parsed rows
            
            // --- NEW: RESOLVE 'basedOn' DEPENDENCIES ---
            // Create a map of rowId to the original parsed row for quick lookup
            const rowIdMap = new Map();
            allParsedRows.forEach(row => {
                if (row.rowId) {
                    rowIdMap.set(row.rowId, row);
                }
            });

            // Create a deep copy of allParsedRows to apply merges without modifying originals
            // This is essential if a row is a base for multiple others.
            const resolvedRows = JSON.parse(JSON.stringify(allParsedRows));

            // Iterate through the resolved rows and apply inheritance
            // We iterate multiple times to handle chains (e.g., A based on B, B based on C)
            // A simple fixed number of passes should cover typical depth;
            // for extreme cases or circular dependencies, more robust cycle detection is needed.
            // For a few levels of inheritance, 3-5 passes are usually sufficient.
            const maxResolutionPasses = 5; 
            for (let pass = 0; pass < maxResolutionPasses; pass++) {
                let changesMadeInPass = false;
                resolvedRows.forEach(targetRow => {
                    const baseId = targetRow.basedOn;
                    if (baseId && rowIdMap.has(baseId)) { // Use rowIdMap for original base data
                        const baseRowOriginal = rowIdMap.get(baseId);
                        // Make a deep copy of the base row's *current* resolved state for merging
                        // This prevents issues if the base row itself has dependencies being resolved in this pass.
                        const baseToMerge = JSON.parse(JSON.stringify(baseRowOriginal));

                        const originalTargetRow = JSON.parse(JSON.stringify(targetRow)); // For change detection
                        mergeDefaults(targetRow, baseToMerge); // Perform the merge
                        
                        // Check if any significant changes were made to mark `changesMadeInPass` true
                        if (JSON.stringify(originalTargetRow) !== JSON.stringify(targetRow)) {
                            changesMadeInPass = true;
                        }
                    }
                });
                if (!changesMadeInPass && pass > 0) { // If no changes were made in a pass (and it's not the very first pass), we're done resolving.
                    console.log(`Resolution complete after ${pass} passes.`);
                    break; 
                }
            }
            console.log("All Parsed CSV Rows (after resolution):", JSON.parse(JSON.stringify(resolvedRows))); // DEBUG: After resolution

            let selectedData = null;

            // First, try to find the row matching the requested ID from the *resolved* rows
            if (requestedId) {
                selectedData = resolvedRows.find(row => row.rowId === requestedId);
                console.log(`Attempting to find resolved row with rowId: '${requestedId}'`); // DEBUG
            }

            // If no data was found with the requested ID, try to find the '1' row
            if (!selectedData) {
                console.log("Requested ID not found, attempting to find resolved row with rowId: '1'"); // DEBUG
                selectedData = resolvedRows.find(row => row.rowId === '1');
            }

            // If still no data found (e.g., CSV is empty, or '1' ID not present)
            if (!selectedData && resolvedRows.length > 0) {
                // Fallback to the very first data row if no specific ID is matched
                console.warn(`Requested ID '${requestedId}' not found, and '1' not found. Defaulting to first available resolved row in CSV.`);
                selectedData = resolvedRows[0];
            }

            console.log("Selected data row for use (after resolution):", selectedData); // DEBUG: Log the final selected data

            return selectedData; // Returns the selected row's data object, or null if no rows at all
        } catch (error) {
            console.error(`Error fetching data: ${error.message}. Retrying in ${delay / 1000}s...`);
            retries--;
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
    console.error("Failed to fetch data after multiple retries.");
    return null; // Return null if all retries fail
}


// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', async () => { // Made async to use await
    console.log("DOMContentLoaded fired. Initial videoData (hard-coded defaults):", JSON.parse(JSON.stringify(videoData))); // DEBUG: Initial state

    // Attempt to fetch data first
    const fetchedDataFromCSV = await fetchData(); // Rename for clarity

    if (fetchedDataFromCSV) {
        console.log("Data fetched from CSV:", JSON.parse(JSON.stringify(fetchedDataFromCSV)));

        // Create a *new* object to hold the final merged data.
        // Start with the fetched data (which might have blanks from CSV).
        // Then merge in properties from the *original hard-coded defaults*
        // only if they are blank or missing in fetchedDataFromCSV.
        let finalData = JSON.parse(JSON.stringify(fetchedDataFromCSV)); // Deep copy the fetched data
        mergeDefaults(finalData, videoData); // Merge hard-coded defaults into the fetched data if values are blank
        
        videoData = finalData; // Update the global videoData with the final merged result
        console.log("videoData updated with fetched data and defaults merged:", JSON.parse(JSON.stringify(videoData))); // DEBUG: After merge
    } else {
        console.warn("Failed to fetch data from CSV. Using ONLY hard-coded videoData defaults.");
        // No merging needed, videoData already holds the hard-coded defaults.
        console.log("Final videoData (using only defaults):", JSON.parse(JSON.stringify(videoData))); // DEBUG: If fetch failed
    }

    // Populate all data-driven content first (with default or fetched data)
    populateStaticData();
    console.log("populateStaticData() called."); // DEBUG

    // Start on the main screen. The screenContainer is initially positioned
    // so that the 'mainMenuScreen' (the second screen) is visible.
    goToScreen('main');
    console.log("goToScreen('main') called."); // DEBUG

    // Animate subtitle ONLY on initial load
    const finalSubtitleText = subtitleShowreelElement.dataset.text;
    const charCounts = [8, 8, 7, 0, 7, 6, 6, 5, 4, 8, 2, 2];
    animateSubtitle(subtitleShowreelElement, finalSubtitleText, charCounts);
    console.log("animateSubtitle() called."); // DEBUG

    // Highlight the "Play Reel" button by default on page load.
    playReelButton.classList.add('is-active');
    console.log("Play Reel button highlighted."); // DEBUG

    // Get the container for the main menu buttons.
    const mainMenuButtonContainer = mainMenuScreen.querySelector('.button-container');

    // Add a one-time event listener to the button container.
    // When the mouse first enters this area, it will remove the default highlight
    // from the "Play Reel" button, allowing natural hover states to take over.
    if (mainMenuButtonContainer) {
        mainMenuButtonContainer.addEventListener('mouseenter', () => {
            playReelButton.classList.remove('is-active');
        }, { once: true });
        console.log("mainMenuButtonContainer mouseenter listener added."); // DEBUG
    }
});
