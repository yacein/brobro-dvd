import { dvdLogo, eggCounter, eggCountElement, eggTotalElement, eggProgressFill } from './dom.js';
import { logEvent } from './analytics.js';
import { getSiteVersionId } from './config.js';

// --- Easter Egg Tracking Logic ---
const easterEggClues = {
    'dvd-start': "that logo in the corner looks like it wants to move...",
    'dvd-catch': "if you set it loose, you have to catch it.",
    'about-photo-1': "who defaced our photo in the about section?",
    'about-photo-8': "okay enough of the graffiti already!",
    'menu-egg': "you're looking right at one of them" // They likely won't see this clue as clicking the button reveals it
};

const totalEggs = Object.keys(easterEggClues).length;
const foundEggs = new Set();

/**
 * Marks a specific easter egg as found and updates the UI.
 * @param {string} eggId Unique identifier for the egg.
 */
function markEggFound(eggId) {
    if (!foundEggs.has(eggId)) {
        foundEggs.add(eggId);
        updateEggCounterUI();
        // Optional: Play a small sound or visual cue here
    }
}

function updateEggCounterUI() {
    if (eggCountElement && eggTotalElement && eggProgressFill) {
        const count = foundEggs.size;
        eggCountElement.textContent = count;
        eggTotalElement.textContent = totalEggs;
        const percentage = (count / totalEggs) * 100;
        eggProgressFill.style.width = `${percentage}%`;

        // Flash the text container
        const textContainer = eggCountElement.parentElement;
        if (textContainer) {
            textContainer.classList.remove('flash');
            void textContainer.offsetWidth; // Trigger reflow to restart animation
            textContainer.classList.add('flash');
        }

        if (percentage === 100) {
            eggProgressFill.style.backgroundColor = 'var(--color-accent-green)';
            // Trigger the particle explosion when 100% is reached
            createParticleExplosion(eggProgressFill);
            // Add a class to make the counter clickable for re-triggering the effect
            if (eggCounter) {
                eggCounter.classList.add('completed');
            }
        } else if (percentage >= 75) {
            eggProgressFill.style.backgroundColor = 'var(--color-accent-yellow)';
        } else if (percentage >= 50) {
            eggProgressFill.style.backgroundColor = 'var(--color-accent-gold)';
        } else {
            eggProgressFill.style.backgroundColor = '#ffa500'; // Orange
        }
    }
}

/**
 * Initializes a click listener on the egg counter to re-trigger the explosion when full.
 */
function initEggCounterClickListener() {
    if (!eggCounter) return;

    eggCounter.addEventListener('click', () => {
        if (foundEggs.size === totalEggs) {
            createParticleExplosion(eggProgressFill);
        }
    });
}

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

    initEggCounterClickListener(); // Set up the listener for the progress bar

    let isBouncing = false;
    let bounceHandler;
    const originalParent = dvdLogo.parentElement;
    const originalNextSibling = dvdLogo.nextElementSibling;

    dvdLogo.addEventListener('click', () => {
        if (isBouncing) {
            createSpeechBubble(dvdLogo, 'argh you caught me');
            markEggFound('dvd-catch'); // Track: Caught the logo

            isBouncing = false;
            dvdLogo.removeEventListener('transitionend', bounceHandler);
            dvdLogo.classList.remove('bouncing');
            dvdLogo.style.transform = '';
            dvdLogo.style.backgroundColor = '';
            dvdLogo.style.transition = '';
            originalParent.insertBefore(dvdLogo, originalNextSibling);
        } else {
            logEvent('dvd_logo_click', { versionId: getSiteVersionId() });
            markEggFound('dvd-start'); // Track: Started the logo
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
            const timeToHitX = (vx > 0) ? (document.body.clientWidth - logoWidth - x) / (vx * speed) : -x / (vx * speed);
            const timeToHitY = (vy > 0) ? (document.body.clientHeight - logoHeight - y) / (vy * speed) : -y / (vy * speed);

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

            // Track specific clicks
            if (clickState === 1) {
                markEggFound('about-photo-1'); // Track: 1st click
            }
            if (clickState === 8) {
                markEggFound('about-photo-8'); // Track: 8th click
            }

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
 * Creates a particle explosion effect originating from a target element.
 * @param {HTMLElement} targetElement The element to use as the origin point.
 */
function createParticleExplosion(targetElement) {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const container = document.body;
    const particleCount = 40; // Increased for a bigger effect
    const colors = ['#ffa500', 'var(--color-accent-gold)', 'var(--color-accent-yellow)', 'var(--color-accent-green)'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        container.appendChild(particle);

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4; // size between 4px and 12px

        particle.style.backgroundColor = color;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Position in the center of the target
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.transform = 'translate(-50%, -50%) scale(1)';
        particle.style.opacity = '1';

        // Calculate random end position
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150 + 75; // travel 75-225px
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const endRotation = Math.random() * 720 - 360;

        // Use a small timeout to ensure the initial styles are applied before transitioning
        setTimeout(() => {
            particle.style.transform = `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(0) rotate(${endRotation}deg)`;
            particle.style.opacity = '0';
        }, 10);

        // Remove particle from the DOM after its animation is complete
        particle.addEventListener('transitionend', () => {
            particle.remove();
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

    let currentBubble = null;
    let removalTimeout = null;
    let clickCount = 0;

    easterEggsButton.addEventListener('click', (e) => {
        e.preventDefault();

        markEggFound('menu-egg'); // Track: Clicked the menu button
        clickCount++;

        // If a bubble from this easter egg is already active, clear it out.
        if (currentBubble) {
            currentBubble.remove();
        }
        if (removalTimeout) {
            clearTimeout(removalTimeout);
        }

        // Determine message based on completion status
        let message;
        if (foundEggs.size === totalEggs) {
            message = "yay! you found them all!";
            createParticleExplosion(easterEggsButton);
        } else {
            if (clickCount === 1) {
                message = "click around and you'll find them... or keep clicking here for clues if you're *really* stuck";
            } else if (clickCount === 2) {
                message = "are you sure you want the clues?";
            } else {
                // Filter out found eggs and pick a random clue
                const unfoundEggIds = Object.keys(easterEggClues).filter(id => !foundEggs.has(id));
                if (unfoundEggIds.length > 0) {
                    const randomId = unfoundEggIds[Math.floor(Math.random() * unfoundEggIds.length)];
                    message = easterEggClues[randomId];
                } else {
                    message = "keep looking!";
                }
            }
        }

        // Create a new bubble that we manage ourselves.
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
