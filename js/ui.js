import { videoData, bloopSound } from './config.js';
import * as dom from './dom.js';

let siteVersionId = '1'; // Will be updated with the ID from the URL

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

    document.querySelectorAll('.menu-button').forEach(button => {
        button.removeEventListener('mouseenter', playBloopSound);
        button.removeEventListener('click', playBloopSound);
    });
    document.querySelectorAll('.menu-button').forEach(button => {
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
        if (item.text === 'About Us') {
            button.href = '#';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.add('about-us-active');
            });
        } else if (item.type === 'internal' && item.targetScreen) {
            button.href = '#';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.targetScreen === 'contact') {
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
            dom.videoModalIframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=0&autopause=1&muted=0`;
            dom.videoModal.classList.add('show-modal');
        });

        dom.sceneSelectionGrid.appendChild(chapterItem);
    });
}

// Helper function to set the main background video if it's not already set
function updateMainBackgroundVideo() {
    const newBackgroundSrc = `https://player.vimeo.com/video/${videoData.mainBackgroundVimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`;
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
                dom.specialFeaturesClone.style.transition = 'none'; // Disable transition for instant change
                dom.specialFeaturesClone.classList.remove('show-clone');
                dom.specialFeaturesClone.style.top = '';
                dom.specialFeaturesClone.style.left = '';
                dom.specialFeaturesClone.style.fontSize = '';
                dom.specialFeaturesClone.style.letterSpacing = '';

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
                    setTimeout(() => dom.specialFeaturesClone.style.transition = '', 50);
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
        const rect = dom.specialFeaturesButton.getBoundingClientRect();
        dom.specialFeaturesButton.style.opacity = '0';
        dom.specialFeaturesButton.style.pointerEvents = 'none';
        dom.specialFeaturesClone.textContent = dom.specialFeaturesButton.textContent;
        dom.specialFeaturesClone.style.top = `${rect.top}px`;
        dom.specialFeaturesClone.style.left = `${rect.left}px`;
        dom.specialFeaturesClone.style.fontSize = window.getComputedStyle(dom.specialFeaturesButton).fontSize;
        dom.specialFeaturesClone.style.padding = window.getComputedStyle(dom.specialFeaturesButton).padding;
        dom.specialFeaturesClone.style.lineHeight = window.getComputedStyle(dom.specialFeaturesButton).lineHeight;
        dom.specialFeaturesClone.style.textShadow = window.getComputedStyle(dom.specialFeaturesButton).textShadow;
        dom.specialFeaturesClone.style.letterSpacing = window.getComputedStyle(dom.specialFeaturesButton).letterSpacing;

        requestAnimationFrame(() => {
            dom.specialFeaturesClone.classList.add('show-clone');
            requestAnimationFrame(() => {
                dom.specialFeaturesClone.style.top = '100px';
                dom.specialFeaturesClone.style.left = '50%';
                dom.specialFeaturesClone.style.transform = 'translateX(-50%) scale(2)';
                dom.specialFeaturesClone.style.fontSize = 'clamp(1.8rem, 5vw, 3rem)';
                dom.specialFeaturesClone.style.letterSpacing = '5px';
            });
        });
        dom.specialFeaturesScreen.style.backgroundImage = `url('${videoData.specialFeaturesBackgroundImage}')`;
        dom.specialFeaturesScreen.style.backgroundSize = 'cover';
        dom.specialFeaturesScreen.style.backgroundPosition = 'center';
        dom.sceneSelectionScreen.style.backgroundImage = '';

        updateMainBackgroundVideo();
        setTimeout(() => {
            dom.screenContainer.classList.remove('slide-to-main', 'slide-to-scene');
            dom.screenContainer.classList.add('slide-to-special-features');
        }, 1000);
    }
}

async function sendTelepathyNotification(versionId) {
    const notificationUrl = '/notify.php';
    try {
        const formData = new FormData();
        formData.append('versionId', versionId);
        const response = await fetch(notificationUrl, { method: 'POST', body: formData });
        if (!response.ok) {
            console.error(`Notification server responded with status: ${response.status}`);
        } else {
            console.log("Notification sent successfully.");
        }
    } catch (error) {
        console.error('Failed to send telepathy notification:', error);
    }
}

function resetTelepathyButton() {
    dom.telepathyButton.textContent = "Click here to communicate telepathically with the brothers";
    dom.telepathyButton.classList.remove('needs-confirmation');
}

export function initEventListeners() {
    dom.playReelButton.addEventListener('click', (e) => {
        e.preventDefault();
        dom.videoModalIframe.src = `https://player.vimeo.com/video/${videoData.mainReelVimeoId}?autoplay=1&loop=0&autopause=1&muted=0`;
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
    dom.specialFeaturesButton.addEventListener('click', (e) => { e.preventDefault(); goToScreen('specialFeatures'); });

    dom.telepathyButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (dom.telepathyButton.classList.contains('needs-confirmation')) {
            if (dom.makeContactScreen.classList.contains('wavy-active')) return;
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
                    dom.telepathyMessage.classList.add('show');
                    sendTelepathyNotification(siteVersionId);
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