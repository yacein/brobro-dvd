import { dvdLogo } from './dom.js';
import { logEvent } from './analytics.js';
import { getSiteVersionId } from './config.js';

/**
 * Creates and displays a speech bubble pointing to a target element.
 * @param {HTMLElement} targetElement The element the bubble should point to.
 * @param {string} text The text content of the bubble.
 * @param {boolean} [autoDismiss=true] Whether the bubble should remove itself after a delay.
 * @returns {HTMLElement} The created bubble element.
 */
function createSpeechBubble(targetElement, text, autoDismiss = true) {
    const targetRect = targetElement.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'easter-egg-bubble';
    bubble.textContent = text;
    document.body.appendChild(bubble);

    const bubbleWidth = bubble.offsetWidth;
    const bubbleHalfWidth = bubbleWidth / 2;
    let bubbleLeft = targetRect.left + targetRect.width / 2;
    bubbleLeft = Math.max(bubbleHalfWidth, bubbleLeft);
    bubbleLeft = Math.min(bubbleLeft, window.innerWidth - bubbleHalfWidth);
    bubble.style.left = `${bubbleLeft}px`;
    bubble.style.top = `${targetRect.top}px`;

    void bubble.offsetWidth;
    bubble.classList.add('show');

    if (autoDismiss) {
        setTimeout(() => {
            bubble.classList.remove('show');
            bubble.addEventListener('transitionend', () => bubble.remove(), { once: true });
        }, 2500); // Give enough time to read
    }

    return bubble;
}

/**
 * Initializes the bouncing DVD logo easter egg.
 */
export function initEasterEgg() {
    if (!dvdLogo) return;

    let isBouncing = false;
    let bounceHandler;
    const originalParent = dvdLogo.parentElement;
    const originalNextSibling = dvdLogo.nextElementSibling;

    dvdLogo.addEventListener('click', () => {
        if (isBouncing) {
            createSpeechBubble(dvdLogo, 'argh you caught me');

            isBouncing = false;
            dvdLogo.removeEventListener('transitionend', bounceHandler);
            dvdLogo.classList.remove('bouncing');
            dvdLogo.style.transform = '';
            dvdLogo.style.backgroundColor = '';
            dvdLogo.style.transition = '';
            originalParent.insertBefore(dvdLogo, originalNextSibling);
        } else {
            logEvent('dvd_logo_click', { versionId: getSiteVersionId() });
            isBouncing = true;
            const startRect = dvdLogo.getBoundingClientRect();
            document.body.appendChild(dvdLogo);
            dvdLogo.classList.add('bouncing');
            startBouncing(dvdLogo, startRect);
        }
    });

    /**
     * Starts the bouncing animation using performant CSS transitions.
     * @param {HTMLElement} logoElement The logo element to animate.
     * @param {DOMRect} startRect The initial position of the logo.
     */
    function startBouncing(logoElement, startRect) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
        let colorIndex = Math.floor(Math.random() * colors.length);
        logoElement.style.backgroundColor = colors[colorIndex];

        const speed = 250; // pixels per second
        const logoWidth = logoElement.offsetWidth;
        const logoHeight = logoElement.offsetHeight;

        let x = startRect.left;
        let y = startRect.top;
        logoElement.style.transform = `translate(${x}px, ${y}px)`;

        let angle = Math.random() * 2 * Math.PI;
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);

        bounceHandler = () => {
            const timeToHitX = (vx > 0) ? (window.innerWidth - logoWidth - x) / (vx * speed) : -x / (vx * speed);
            const timeToHitY = (vy > 0) ? (window.innerHeight - logoHeight - y) / (vy * speed) : -y / (vy * speed);

            const timeToCollision = Math.min(timeToHitX, timeToHitY);

            x += vx * speed * timeToCollision;
            y += vy * speed * timeToCollision;

            if (Math.abs(timeToCollision - timeToHitX) < 0.001) {
                vx *= -1;
            }
            if (Math.abs(timeToCollision - timeToHitY) < 0.001) {
                vy *= -1;
            }

            colorIndex = (colorIndex + 1) % colors.length;
            logoElement.style.backgroundColor = colors[colorIndex];

            logoElement.style.transition = `transform ${timeToCollision}s linear`;
            logoElement.style.transform = `translate(${x}px, ${y}px)`;
        };

        logoElement.addEventListener('transitionend', bounceHandler);
        setTimeout(bounceHandler, 10);
    }
}

let imagesLoaded = false;

/**
 * Loads the easter egg images on demand by swapping data-src to src.
 * This function is designed to run only once.
 */
export function loadEasterEggImages() {
    if (imagesLoaded) {
        return; // Prevent re-running
    }
    const overlayImages = document.querySelectorAll('.easter-egg-overlay[data-src]');
    overlayImages.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src'); // Clean up to prevent re-loading
    });
    imagesLoaded = true;
}

/**
 * Initializes the image click easter egg on the "About Us" page.
 */
export function initImageEasterEgg() {
    const imageWrapper = document.getElementById('yazAndHazImageWrapper');
    if (imageWrapper) {
        const graffitiOverlay = imageWrapper.querySelector('.graffiti-overlay');
        const funnyOverlay = imageWrapper.querySelector('.very-funny-overlay');
        const sarcasticOverlay = imageWrapper.querySelector('.sarcastic-overlay');
        const iKnowOverlay = imageWrapper.querySelector('.i-know-overlay');
        let clickState = 0;

        imageWrapper.addEventListener('click', () => {
            // This is a cycle of 10 distinct actions, followed by a loop.
            clickState = (clickState + 1) % 10;

            let showGraffiti = false;
            let showFunny = false;
            let showSarcastic = false;
            let showIKnow = false;

            switch (clickState) {
                case 1: showGraffiti = true; break; // Click 1: Add graffiti
                case 2: showGraffiti = true; showFunny = true; break; // Click 2: Add very-funny
                case 3: showFunny = true; break; // Click 3: Remove graffiti
                case 4: break; // Click 5: Remove sarcastic
                case 5: showSarcastic = true; break; // Click 4: Remove very-funny, add sarcastic
                case 6: break; // Click 5: Remove sarcastic
                case 7: break; // Click 5: Remove sarcastic
                case 8: showIKnow = true; break; // Click 6: Add i-know
                case 9: break; // Click 7: Remove i-know
                case 10: break; // Click 8: Do nothing (blank state before loop)
            }

            graffitiOverlay.classList.toggle('show-overlay', showGraffiti);
            funnyOverlay.classList.toggle('show-overlay', showFunny);
            sarcasticOverlay.classList.toggle('show-overlay', showSarcastic);
            iKnowOverlay.classList.toggle('show-overlay', showIKnow);
        });
    }
}

/**
 * Initializes the easter egg for the "Easter Eggs" menu button.
 */
export function initMenuEasterEgg() {
    // The button is created dynamically, so we query for it after it's been added to the DOM.
    const easterEggsButton = document.getElementById('easterEggsButton');
    if (!easterEggsButton) {
        // This might happen if the config changes. It's safe to just exit.
        return;
    }

    const messages = [
        "no, we're not telling you where they are...",
        "just click on stuff, you'll find them"
    ];
    let messageIndex = 0;
    let currentBubble = null;
    let removalTimeout = null;

    easterEggsButton.addEventListener('click', (e) => {
        e.preventDefault();

        // If a bubble from this easter egg is already active, clear it out.
        if (currentBubble) {
            currentBubble.remove();
        }
        if (removalTimeout) {
            clearTimeout(removalTimeout);
        }

        // Create a new bubble that we manage ourselves.
        const message = messages[messageIndex];
        currentBubble = createSpeechBubble(easterEggsButton, message, false); // Pass false to disable auto-dismiss

        // Set a new timer to remove this bubble.
        removalTimeout = setTimeout(() => {
            if (currentBubble) {
                currentBubble.classList.remove('show');
                currentBubble.addEventListener('transitionend', () => {
                    if (currentBubble) currentBubble.remove();
                    currentBubble = null;
                }, { once: true });
            }
        }, 2500);

        // Cycle to the next message for the next click.
        messageIndex = (messageIndex + 1) % messages.length;
    });
}

/**
 * Initializes the second image easter egg on the "About Us" page.
 */
export function initSecondImageEasterEgg() {
    const imageWrapper = document.getElementById('secondImageWrapper');
    if (imageWrapper) {
        const laurelHardyOverlay = imageWrapper.querySelector('.laurel-hardy-overlay');
        imageWrapper.addEventListener('click', () => {
            laurelHardyOverlay.classList.toggle('show-overlay');
        });
    }
}
