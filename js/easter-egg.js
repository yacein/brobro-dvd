import { dvdLogo } from './dom.js';

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
            const logoRect = dvdLogo.getBoundingClientRect();
            const bubble = document.createElement('div');
            bubble.className = 'easter-egg-bubble';
            bubble.textContent = 'argh you caught me';
            document.body.appendChild(bubble);

            // Get the bubble's dimensions now that it's in the DOM (but invisible)
            const bubbleWidth = bubble.offsetWidth;
            const bubbleHalfWidth = bubbleWidth / 2;

            // Calculate the ideal horizontal center for the bubble (centered on the logo)
            let bubbleLeft = logoRect.left + logoRect.width / 2;

            // Clamp the bubble's horizontal position to keep it within the viewport
            bubbleLeft = Math.max(bubbleHalfWidth, bubbleLeft); // Prevent it from going off the left edge
            bubbleLeft = Math.min(bubbleLeft, window.innerWidth - bubbleHalfWidth); // Prevent it from going off the right edge

            // Apply the constrained position
            bubble.style.left = `${bubbleLeft}px`;
            bubble.style.top = `${logoRect.top}px`;

            void bubble.offsetWidth;

            bubble.classList.add('show');

            setTimeout(() => {
                bubble.classList.remove('show');
                bubble.addEventListener('transitionend', () => bubble.remove(), { once: true });
            }, 2000);

            isBouncing = false;
            dvdLogo.removeEventListener('transitionend', bounceHandler);
            dvdLogo.classList.remove('bouncing');
            dvdLogo.style.transform = '';
            dvdLogo.style.backgroundColor = '';
            dvdLogo.style.transition = '';
            originalParent.insertBefore(dvdLogo, originalNextSibling);
        } else {
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