/**
 * Animates text character by character with a digital reveal effect.
 * Each character cycles through random symbols before settling on its final form.
 * @param {HTMLElement} element The HTML element to animate (e.g., an <h2>).
 * @param {string} finalText The final text string to display.
 * @param {number[]} charCycleCounts An array specifying how many "incorrect" characters each final character should cycle through.
 */
export function animateSubtitle(element, finalText, charCycleCounts) {
    element.innerHTML = ''; // Clear any existing content
    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?`~АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

    finalText.split('').forEach((finalChar, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = (finalChar === ' ') ? '_' : finalChar;
        element.appendChild(charSpan);

        // Initial state
        charSpan.style.opacity = '0';
        charSpan.style.filter = 'blur(5px)';
        charSpan.style.transform = 'translateY(0px)';
        charSpan.style.color = 'rgba(0, 255, 0, 0.3)';

        setTimeout(() => {
            if (finalChar === ' ') {
                charSpan.style.opacity = '0';
                charSpan.style.filter = 'none';
                charSpan.style.transform = 'translateY(0)';
                charSpan.style.color = '#00ff00';
                return;
            }

            // Apply final visible styles
            charSpan.style.opacity = '1';
            charSpan.style.filter = 'none';
            charSpan.style.transform = 'translateY(0)';
            charSpan.style.color = '#00ff00';
            charSpan.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7), 0 0 10px rgba(0, 255, 0, 0.5)';

            const numIncorrectCycles = charCycleCounts[index] !== undefined ? charCycleCounts[index] : 0;
            let currentCycle = 0;
            let originalContent = finalChar;

            const intervalId = setInterval(() => {
                if (currentCycle < numIncorrectCycles) {
                    charSpan.textContent = characterPool[Math.floor(Math.random() * characterPool.length)];

                    // Apply temporary "jiggle" and "flicker" styles
                    charSpan.style.opacity = Math.random() * 0.5 + 0.3;
                    charSpan.style.filter = `blur(${Math.random() * 2}px)`;
                    charSpan.style.transform = `translateY(${Math.random() * 6 - 3}px)`;
                    charSpan.style.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

                    currentCycle++;
                } else {
                    clearInterval(intervalId);
                    charSpan.textContent = originalContent;
                    // Ensure final styles are applied
                    charSpan.style.opacity = '1';
                    charSpan.style.filter = 'none';
                    charSpan.style.transform = 'translateY(0)';
                    charSpan.style.color = '#00ff00';
                    charSpan.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.7), 0 0 10px rgba(0, 255, 0, 0.5)';
                }
            }, 100);
        }, index * 150);
    });
}