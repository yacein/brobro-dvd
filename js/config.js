// --- DATA DEFINITION (DEFAULT VALUES) ---
export let videoData = {
    siteTitle: 'Brother Brother | The Showreel',
    mainMenuTitle: 'BROTHER BROTHER',
    mainMenuGlitchText: 'YAZ and HAZ',
    mainMenuSubtitle: 'THE SHOWREEL',
    copyrightText: '© 2025 BROTHER BROTHER. ALL RIGHTS RESERVED.',
    mainBackgroundVimeoId: '292109430',
    mainReelVimeoId: '1105829365/0f8376e14b',
    specialFeaturesBackgroundImage: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/d56856ff-5d6d-4d98-acfe-1ed609ef3d75/RUTH+|+festival+preview-high1.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg',
    chapters: [
        { title: 'SUMUP - Make it Count', vimeoId: '1017849814',
          thumbnailUrl: 'assets/make-it-count-thumbnail.gif' },
        { title: 'DATASNIPPERS - Sandcastles', vimeoId: '1105915041?h=7eb0001144',
          thumbnailUrl: 'assets/datasnipper-thumbnail.gif' },
        { title: 'PVCASE - What Would You Do', vimeoId: '1106051275/2656e0296f',
          thumbnailUrl: 'assets/pvcase-thumbnail.gif' },
        { title: 'SIEMENS - Smart Kitchen', vimeoId: '856359531',
          thumbnailUrl: 'assets/siemens-thumbnail.gif' },
    ],
    specialFeatures: [
        { text: 'Make Contact', type: 'internal', targetScreen: 'contact' },
        { text: 'About Us' },
        { text: 'Instagram',
          url: 'https://www.instagram.com/brobrofilm/', target: '_blank' },
        { text: 'Easter Eggs', url: '#' }
    ]
};

// We need a way to update the config from main.js after fetching data
export function updateVideoData(newData) {
    videoData = newData;
}

// Placeholder for sound effect
export const bloopSound = new Audio('https://www.soundjay.com/buttons/button-1.mp3');
bloopSound.volume = 0.3; // Set volume to 30% (0.0 is silent, 1.0 is full)

// --- GLOBAL STATE ---
export let siteVersionId = '1';

export function setSiteVersionId(id) {
    siteVersionId = id;
}

export function getSiteVersionId() {
    return siteVersionId;
}