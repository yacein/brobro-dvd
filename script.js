// --- DATA DEFINITION ---
const videoData = {
    siteTitle: 'Brother Brother | The Showreel',
    mainMenuTitle: 'BROTHER BROTHER',
    mainMenuGlitchText: 'YAZ and HAZ',
    mainMenuSubtitle: 'THE SHOWREEL',
    copyrightText: '© 2025 BROTHER BROTHER. ALL RIGHTS RESERVED.',
    mainBackgroundVimeoId: '292109430',
    mainReelVimeoId: '431751544', // Updated showreel video ID
    specialFeaturesBackgroundImage: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/d56856ff-5d6d-4d98-acfe-1ed609ef3d75/RUTH+|+festival+preview-high1.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg', // New background image for scene selection
    chapters: [
        { title: 'FASHION FILM: SON AND PARK', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/1030ca68-958a-42c1-842f-882228239462/Son+%26+Park+Campaign+Teaser+2-low.gif?content-type=image%2Fgif' },
        { title: 'COMMERCIAL: MAKE IT COUNT', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/aec16f05-ed69-456a-ba1e-14d6e44ae8d1/ALEX+%28Short+film%29+Trailer-high.gif?content-type=image%2Fgif' },
        { title: 'DOCUMENTARY: SOMETHING', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/30eb84ab-fdd4-4304-b360-e3d6ac1700d8/An+Admin+Worker+At+The+End+Of+The+World+-+trailer-high.gif?content-type=image%2Fgif' },
        { title: 'EDUCATION: RHP', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/ad2a4236-30d9-4261-9af8-5b6166575282/Brother+Brother+Reel+2020-3-high.gif?content-type=image%2Fgif' }
    ],
    specialFeatures: [
        { text: 'MAKE CONTACT', url: '#' },
        { text: 'ABOUT US', url: '#' },
        { text: 'INSTAGRAM', url: 'https://www.instagram.com/brobrofilm/', target: '_blank' },
        { text: 'EASTER EGGS', url: '#' }
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
const menuButtons = document.querySelectorAll('.menu-button');
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

// Add hover sound to all menu buttons
menuButtons.forEach(button => {
    button.addEventListener('mouseenter', playBloopSound);
});

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
        button.href = item.url;
        button.className = 'menu-button';
        button.textContent = item.text;
        if (item.target) {
            button.target = item.target;
            button.rel = 'noopener noreferrer'; // Good practice for security
        }
        button.addEventListener('mouseenter', playBloopSound); // Add sound effect on hover
        specialFeaturesButtonContainer.appendChild(button);
    });
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
        thumbnailImg.src = chapter.thumbnailUrl;
        thumbnailImg.alt = `Thumbnail for ${chapter.title}`;

        videoThumbnail.appendChild(thumbnailImg);

        const chapterTitle = document.createElement('div');
        chapterTitle.classList.add('chapter-title');
        chapterTitle.textContent = chapter.title;

        chapterItem.appendChild(videoThumbnail);
        chapterItem.appendChild(chapterTitle);

        // Add click listener to open modal for chapter video
        chapterItem.addEventListener('click', () => {
            videoModalIframe.src = `https://player.vimeo.com/video/${chapter.vimeoId}?autoplay=1&loop=0&autopause=1&muted=0`;
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

// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', () => {

    // Populate all data-driven content first
    populateStaticData();

    // Start on the main screen. The screenContainer is initially positioned
    // so that the 'mainMenuScreen' (the second screen) is visible.
    goToScreen('main');

    // Animate subtitle ONLY on initial load
    const finalSubtitleText = subtitleShowreelElement.dataset.text;
    const charCounts = [8, 8, 7, 0, 7, 6, 6, 5, 4, 8, 2, 2];
    animateSubtitle(subtitleShowreelElement, finalSubtitleText, charCounts);

    // Highlight the "Play Reel" button by default on page load.
    playReelButton.classList.add('is-active');

    // Get the container for the main menu buttons.
    const mainMenuButtonContainer = mainMenuScreen.querySelector('.button-container');

    // Add a one-time event listener to the button container.
    // When the mouse first enters this area, it will remove the default highlight
    // from the "Play Reel" button, allowing natural hover states to take over.
    if (mainMenuButtonContainer) {
        mainMenuButtonContainer.addEventListener('mouseenter', () => {
            playReelButton.classList.remove('is-active');
        }, { once: true });
    }
});
