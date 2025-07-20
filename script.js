// --- DATA DEFINITION ---
const videoData = {
    mainBackgroundVimeoId: '292109430',
    // Removed sceneBackgroundVimeoId as it's replaced by an image
    mainReelVimeoId: '431751544', // Updated showreel video ID
    specialFeaturesBackgroundImage: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/d56856ff-5d6d-4d98-acfe-1ed609ef3d75/RUTH+|+festival+preview-high1.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg', // New background image for scene selection
    chapters: [
        { title: 'FASHION FILM: SON AND PARK', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/1030ca68-958a-42c1-842f-882228239462/Son+%26+Park+Campaign+Teaser+2-low.gif?content-type=image%2Fgif' },
        { title: 'COMMERCIAL: MAKE IT COUNT', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/035fa440-ae95-48c4-98dc-17844488b069/RUTH+|+festival+preview-low3.gif' },
        { title: 'DOCUMENTARY: SOMETHING', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/30eb84ab-fdd4-4304-b360-e3d6ac1700d8/An+Admin+Worker+At+The+End+Of+The+World+-+trailer-high.gif?content-type=image%2Fgif' },
        { title: 'EDUCATION: RHP', vimeoId: '292109430', thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/ad2a4236-30d9-4261-9af8-5b6166575282/Brother+Brother+Reel+2020-3-high.gif?content-type=image%2Fgif' }
    ]
};
// --- END DATA DEFINITION ---


// Get references to DOM elements
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

// Function to manage screen transitions and background videos
function goToScreen(screenName) {
    // Determine if we are coming from the special features screen
    const isComingFromSpecialFeatures = screenContainer.classList.contains('slide-to-special-features');

    // Universal reset for special features clone's inline styles
    // This prepares it for either a new animation or to be hidden by CSS.
    specialFeaturesClone.classList.remove('show-clone');
    specialFeaturesClone.style.top = '';
    specialFeaturesClone.style.left = '';
    specialFeaturesClone.style.transform = '';
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
                const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
                if (mainBackgroundVideo.src !== newBackgroundSrc) {
                    mainBackgroundVideo.src = newBackgroundSrc;
                }

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
            const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
            if (mainBackgroundVideo.src !== newBackgroundSrc) {
                mainBackgroundVideo.src = newBackgroundSrc;
            }
        }
    } else if (screenName === 'scene') {
        screenContainer.classList.remove('slide-to-special-features', 'slide-to-main');
        screenContainer.classList.add('slide-to-scene');
        // Set background image for scene selection screen with a dark overlay
        sceneSelectionScreen.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${videoData.sceneBackgroundImage}')`;
        sceneSelectionScreen.style.backgroundSize = 'cover'; // Ensure it covers
        sceneSelectionScreen.style.backgroundPosition = 'center'; // Center the image
        specialFeaturesScreen.style.backgroundImage = ''; // Clear special features background
        // Ensure the main background video continues playing behind the new scene background
        const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
        if (mainBackgroundVideo.src !== newBackgroundSrc) {
            mainBackgroundVideo.src = newBackgroundSrc;
        }
        loadChapterVideos(); // Ensure chapters are loaded
    } else if (screenName === 'specialFeatures') {
        const rect = specialFeaturesButton.getBoundingClientRect();
        specialFeaturesButton.style.opacity = '0';
        specialFeaturesButton.style.pointerEvents = 'none';
        specialFeaturesClone.textContent = specialFeaturesButton.textContent;
        specialFeaturesClone.style.top = `${rect.top}px`;
        specialFeaturesClone.style.left = `${rect.left}px`;
        specialFeaturesClone.style.transform = ''; // Reset transform for initial position
        specialFeaturesClone.style.fontSize = window.getComputedStyle(specialFeaturesButton).fontSize;
        specialFeaturesClone.style.padding = window.getComputedStyle(specialFeaturesButton).padding;
        specialFeaturesClone.style.lineHeight = window.getComputedStyle(specialFeaturesButton).lineHeight;
        specialFeaturesClone.style.textShadow = window.getComputedStyle(specialFeaturesButton).textShadow;
        specialFeaturesClone.style.letterSpacing = window.getComputedStyle(specialFeaturesButton).letterSpacing;
        specialFeaturesClone.style.transform = 'scale(1)'; // Set initial transform for animation


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
        // Ensure the main background video continues playing behind the new special features background
        const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
        if (mainBackgroundVideo.src !== newBackgroundSrc) {
            mainBackgroundVideo.src = newBackgroundSrc;
        }
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
    // Start on the main screen. The screenContainer is initially positioned
    // so that the 'mainMenuScreen' (the second screen) is visible.
    goToScreen('main');
});
