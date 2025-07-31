import { videoData, bloopSound } from './config.js';
import { loadEasterEggImages } from './easter-egg.js';
import { logEvent } from './analytics.js';
import * as dom from './dom.js';

let siteVersionId = '1'; // Will be updated with the ID from the URL

/**
 * Constructs a Vimeo player URL, correctly handling IDs with existing query parameters.
 * It supports IDs in the format 'VIDEO_ID', 'VIDEO_ID?h=HASH', or 'VIDEO_ID/HASH'.
 * @param {string} vimeoId The Vimeo video ID.
 * @param {string} params The query parameters to append (e.g., "autoplay=1&muted=0").
 * @returns {string} The full Vimeo player URL.
 */
function buildVimeoUrl(vimeoId, params) {
    // Handle the 'ID/HASH' format by converting it to 'ID?h=HASH'
    let processedVimeoId = vimeoId.includes('/') ? vimeoId.replace('/', '?h=') : vimeoId;

    const baseUrl = `https://player.vimeo.com/video/${processedVimeoId}`;
    // If the processed ID already has a query string, use '&' to append more params.
    // Otherwise, use '?' to start a new query string.
    const separator = processedVimeoId.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params}`;
}

/**
 * Sets the site version ID based on the URL query string.
 * @param {string} id The version ID.
 */
export function setSiteVersionId(id) {
    siteVersionId = id;
}

// Function to play sound effect
function playBloopSound() {
    bloopSound.currentTime = 0;
    bloopSound.play().catch(e => console.error("Error playing sound:", e));
}

// Function to attach interaction sounds to all menu buttons
export function attachInteractionSounds() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const eventType = isTouchDevice ? 'click' : 'mouseenter';

    // Select only the buttons on the main menu screen to apply the sound effect.
    document.querySelectorAll('#mainMenuScreen .menu-button').forEach(button => {
        // It's good practice to remove listeners before adding them to prevent duplicates.
        button.removeEventListener('mouseenter', playBloopSound);
        button.removeEventListener('click', playBloopSound);
        button.addEventListener(eventType, playBloopSound);
    });
}

// Function to populate static data from the videoData object
export function populateStaticData() {
    document.title = videoData.siteTitle;
    dom.mainMenuHeroTitle.textContent = videoData.mainMenuTitle;
    dom.mainMenuGlitchText.dataset.text = videoData.mainMenuGlitchText;
    dom.mainMenuSubtitle.dataset.text = videoData.mainMenuSubtitle;

    document.querySelectorAll('.copyright-text').forEach(el => {
        el.innerHTML = videoData.copyrightText;
    });

    dom.specialFeaturesButtonContainer.innerHTML = '';
    videoData.specialFeatures.forEach(item => {
        const button = document.createElement('a');
        button.href = item.url || '#';
        button.className = 'menu-button';
        button.textContent = item.text;
        if (item.target) {
            button.target = item.target;
            button.rel = 'noopener noreferrer';
        }
        if (item.text === 'Easter Eggs') {
            button.id = 'easterEggsButton'; // Assign an ID for the easter egg
        }
        if (item.text === 'About Us') {
            button.href = '#';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                loadEasterEggImages(); // Load images on demand before showing the page
                document.body.classList.add('about-us-active');
            });
        } else if (item.type === 'internal' && item.targetScreen) {
            button.href = '#';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.targetScreen === 'contact') {
                    logEvent('make_contact_click');
                    document.body.classList.add('contact-active');
                } else {
                    goToScreen(item.targetScreen);
                }
            });
        }
        dom.specialFeaturesButtonContainer.appendChild(button);
    });
    attachInteractionSounds();
}

// Function to dynamically load chapter videos
export function loadChapterVideos() {
    dom.sceneSelectionGrid.innerHTML = '';
    videoData.chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.classList.add('chapter-video-item');

        const videoThumbnail = document.createElement('div');
        videoThumbnail.classList.add('video-thumbnail');

        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = chapter.thumbnailUrl || 'https://placehold.co/1280x720/000000/FFFFFF?text=No+Image';
        thumbnailImg.alt = `Thumbnail for ${chapter.title || 'Untitled Chapter'}`;

        videoThumbnail.appendChild(thumbnailImg);

        const chapterTitle = document.createElement('div');
        chapterTitle.classList.add('chapter-title');
        chapterTitle.textContent = chapter.title || 'Untitled Chapter';

        chapterItem.appendChild(videoThumbnail);
        chapterItem.appendChild(chapterTitle);

        chapterItem.addEventListener('click', () => {
            const vimeoId = chapter.vimeoId || videoData.mainBackgroundVimeoId;
            logEvent('chapter_click', { title: chapter.title, vimeoId: vimeoId });
            dom.videoModalIframe.src = buildVimeoUrl(vimeoId, 'autoplay=1&loop=0&autopause=1&muted=0');
            dom.videoModal.classList.add('show-modal');
        });

        dom.sceneSelectionGrid.appendChild(chapterItem);
    });
}

// Helper function to set the main background video if it's not already set
function updateMainBackgroundVideo() {
    const newBackgroundSrc = buildVimeoUrl(videoData.mainBackgroundVimeoId, 'background=1&autoplay=1&loop=1&autopause=0&muted=1');
    if (dom.mainBackgroundVideo.src !== newBackgroundSrc) {
        dom.mainBackgroundVideo.src = newBackgroundSrc;
    }
}

// Function to manage screen transitions and background videos
export function goToScreen(screenName) {
    const isComingFromSpecialFeatures = dom.screenContainer.classList.contains('slide-to-special-features');

    dom.transitionOverlay.classList.remove('show');
    dom.transitionOverlay.style.transform = 'none';
    dom.transitionOverlay.style.transition = 'opacity 0.5s ease-out, visibility 0.5s ease-out';

    if (screenName === 'main') {
        if (isComingFromSpecialFeatures) {
            // 1. Start fading in the transition GIF.
            dom.transitionOverlay.classList.add('show');

            // 2. After the GIF has faded in (500ms)...
            setTimeout(() => {
                // 3. Instantly hide the clone element and reset its styles.
                dom.specialFeaturesClone.classList.remove('show-clone', 'is-animating'); // Remove animation/visibility classes
                dom.specialFeaturesClone.style.transition = 'none'; // Temporarily disable any transitions
                // Reset all styles for the next time it's used.
                dom.specialFeaturesClone.style.top = '';
                dom.specialFeaturesClone.style.left = '';
                dom.specialFeaturesClone.style.width = '';
                dom.specialFeaturesClone.style.height = '';
                dom.specialFeaturesClone.style.fontSize = '';
                dom.specialFeaturesClone.style.letterSpacing = '';
                dom.specialFeaturesClone.style.transform = '';
                // 4. Start sliding the screen container back to the main menu.
                dom.screenContainer.classList.remove('slide-to-special-features', 'slide-to-scene');
                dom.screenContainer.classList.add('slide-to-main');

                // Reset other elements
                dom.specialFeaturesButton.style.opacity = '1';
                dom.specialFeaturesButton.style.pointerEvents = 'auto';
                dom.specialFeaturesScreen.style.backgroundImage = '';
                dom.sceneSelectionScreen.style.backgroundImage = '';
                updateMainBackgroundVideo();

                // 5. After a delay, fade out the GIF and restore the clone's transition property.
                setTimeout(() => {
                    dom.transitionOverlay.classList.remove('show');
                    // Use a small timeout to ensure this happens after any potential reflow.
                    requestAnimationFrame(() => dom.specialFeaturesClone.style.transition = '');
                }, 1000); // Wait 1 second (during the 1.2s slide)
            }, 500);
        } else {
            // This handles transitions from other screens (like 'scene') to 'main'.
            dom.screenContainer.classList.remove('slide-to-special-features', 'slide-to-scene');
            dom.screenContainer.classList.add('slide-to-main');
            dom.sceneSelectionScreen.style.backgroundImage = '';
            updateMainBackgroundVideo();
        }
    } else if (screenName === 'scene') {
        dom.screenContainer.classList.remove('slide-to-special-features', 'slide-to-main');
        dom.screenContainer.classList.add('slide-to-scene');
        dom.sceneSelectionScreen.style.backgroundImage = `url('${videoData.sceneBackgroundImage}')`;
        dom.sceneSelectionScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        dom.sceneSelectionScreen.style.backgroundBlendMode = 'multiply';
        dom.sceneSelectionScreen.style.backgroundSize = 'cover';
        dom.sceneSelectionScreen.style.backgroundPosition = 'center';
        dom.specialFeaturesScreen.style.backgroundImage = '';
        updateMainBackgroundVideo();
        loadChapterVideos();
    } else if (screenName === 'specialFeatures') {
        // --- New, more robust positioning logic ---
        // 1. To get a perfect match, we measure the text content of the button directly,
        // ignoring the ::before pseudo-element (the square icon) and complex padding.
        const button = dom.specialFeaturesButton;
        // Find the text node, ignoring other child elements/nodes like whitespace.
        const textNode = Array.from(button.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');

        if (!textNode) {
            console.error("Could not find the text node in the Special Features button. Aborting animation.");
            return; // Exit if the button's text can't be found.
        }

        // Temporarily wrap the text node in a span to measure it.
        const tempSpan = document.createElement('span');
        button.replaceChild(tempSpan, textNode);
        tempSpan.appendChild(textNode);
        const textRect = tempSpan.getBoundingClientRect(); // This gives us the PRECISE position of the text.
        // Restore the original button structure immediately.
        button.replaceChild(textNode, tempSpan);

        // 2. Make the original button invisible.
        dom.specialFeaturesButton.style.opacity = '0';
        dom.specialFeaturesButton.style.pointerEvents = 'none';

        // 3. Set up the clone to be an exact replica of the button's initial state and position.
        dom.specialFeaturesClone.textContent = dom.specialFeaturesButton.textContent;
        dom.specialFeaturesClone.style.top = `${textRect.top}px`;
        dom.specialFeaturesClone.style.width = `${textRect.width}px`;
        dom.specialFeaturesClone.style.height = `${textRect.height}px`;
        dom.specialFeaturesClone.style.fontSize = window.getComputedStyle(dom.specialFeaturesButton).fontSize;
        dom.specialFeaturesClone.style.textShadow = window.getComputedStyle(dom.specialFeaturesButton).textShadow;
        dom.specialFeaturesClone.style.letterSpacing = window.getComputedStyle(dom.specialFeaturesButton).letterSpacing;
        dom.specialFeaturesClone.style.color = 'var(--color-accent-yellow)';

        // NEW: Match the text alignment of the original button, which changes on mobile.
        const isMobileForClone = window.innerWidth <= 768;
        dom.specialFeaturesClone.style.justifyContent = isMobileForClone ? 'flex-end' : 'center';

        dom.specialFeaturesClone.style.left = '50%';
        const initialXOffset = textRect.left - (window.innerWidth / 2);
        dom.specialFeaturesClone.style.transform = `translateX(${initialXOffset}px) scale(1)`;

        // 4. Now, make the clone instantly visible. It will appear perfectly over the original button.
        dom.specialFeaturesClone.classList.add('show-clone');

        // 5. In the next frame, enable transitions and apply the final animation styles.
        requestAnimationFrame(() => {
            dom.specialFeaturesClone.classList.add('is-animating'); // Enable transitions
            const isMobile = window.innerWidth <= 768;
            // Animate to the final state.
            dom.specialFeaturesClone.style.top = isMobile ? '15vh' : '100px';
            dom.specialFeaturesClone.style.transform = isMobile ? 'translateX(-50%) scale(1.2)' : 'translateX(-50%) scale(2)';
            dom.specialFeaturesClone.style.fontSize = 'clamp(1.8rem, 5vw, 3rem)';
            dom.specialFeaturesClone.style.letterSpacing = isMobile ? '3px' : '5px';
            dom.specialFeaturesClone.style.width = ''; // Unset width/height to allow natural growth
            dom.specialFeaturesClone.style.height = '';
        });

        // 6. Set the new background image for the destination screen.
        dom.specialFeaturesScreen.style.backgroundImage = `url('${videoData.specialFeaturesBackgroundImage}')`;
        dom.specialFeaturesScreen.style.backgroundSize = 'cover';
        dom.specialFeaturesScreen.style.backgroundPosition = 'center';
        dom.sceneSelectionScreen.style.backgroundImage = '';
        updateMainBackgroundVideo();
        setTimeout(() => {
            // 7. A moment after the clone animation starts, begin the screen scroll.
            dom.screenContainer.classList.remove('slide-to-main', 'slide-to-scene');
            dom.screenContainer.classList.add('slide-to-special-features');
        }, 200); // Start scroll 200ms after clone animation begins.
    }
}

function resetTelepathyButton() {
    dom.telepathyButton.innerHTML = "Click here to communicate <br>telepathically with the brothers";
    dom.telepathyButton.classList.remove('needs-confirmation');
    dom.telepathyButton.style.visibility = 'visible';
}

export function initEventListeners() {
    dom.playReelButton.addEventListener('click', (e) => {
        e.preventDefault();
        logEvent('play_reel_click', { vimeoId: videoData.mainReelVimeoId });
        dom.videoModalIframe.src = buildVimeoUrl(videoData.mainReelVimeoId, 'autoplay=1&loop=0&autopause=1&muted=0');
        dom.videoModal.classList.add('show-modal');
    });

    dom.closeModalButton.addEventListener('click', () => {
        dom.videoModal.classList.remove('show-modal');
        dom.videoModalIframe.src = '';
    });

    dom.videoModal.addEventListener('click', (e) => {
        if (e.target === dom.videoModal) {
            dom.videoModal.classList.remove('show-modal');
            dom.videoModalIframe.src = '';
        }
    });

    dom.sceneSelectionButton.addEventListener('click', (e) => { e.preventDefault(); goToScreen('scene'); });
    dom.specialFeaturesButton.addEventListener('click', (e) => {
        e.preventDefault();
        logEvent('special_features_click');
        goToScreen('specialFeatures');
    });

    dom.telepathyButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (dom.telepathyButton.classList.contains('needs-confirmation')) {
            // Log the event and include the versionId so the server can send the email.
            logEvent('telepathic_contact', { versionId: siteVersionId });
            if (dom.makeContactScreen.classList.contains('wavy-active')) return;

            // Hide the button immediately upon confirmation to prevent it from being visible during the animation.
            dom.telepathyButton.style.visibility = 'hidden';

            dom.makeContactScreen.classList.add('wavy-active');
            const duration = 2000;
            const maxScale = 50;
            let startTime = null;
            function animateWave(currentTime) {
                if (!startTime) startTime = currentTime;
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const scale = maxScale * Math.sin(progress * Math.PI);
                dom.displacementMap.setAttribute('scale', scale);
                if (progress < 1) {
                    requestAnimationFrame(animateWave);
                } else {
                    dom.displacementMap.setAttribute('scale', 0);
                    dom.makeContactScreen.classList.remove('wavy-active');
                    dom.telepathyMessage.classList.add('show'); // Show the confirmation message
                    setTimeout(() => {
                        dom.telepathyMessage.classList.remove('show');
                        setTimeout(() => {
                            document.body.classList.remove('contact-active');
                            resetTelepathyButton();
                        }, 500);
                    }, 5000);
                }
            }
            requestAnimationFrame(animateWave);
        } else {
            dom.telepathyButton.textContent = 'Are you sure?';
            dom.telepathyButton.classList.add('needs-confirmation');
        }
    });

    dom.backToMainMenuFromScenes.addEventListener('click', (e) => { e.preventDefault(); goToScreen('main'); });
    dom.backToMainMenuFromAbout.addEventListener('click', (e) => { e.preventDefault(); document.body.classList.remove('about-us-active'); });
    dom.backToMainMenuFromContact.addEventListener('click', (e) => { e.preventDefault(); document.body.classList.remove('contact-active'); resetTelepathyButton(); });
    dom.backToMainMenuFromFeatures.addEventListener('click', (e) => { e.preventDefault(); goToScreen('main'); });
}