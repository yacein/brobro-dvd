// --- DATA DEFINITION (DEFAULT VALUES) ---
export let videoData = {
    siteTitle: 'Brother Brother | The Showreel',
    mainMenuTitle: 'BROTHER BROTHER',
    mainMenuGlitchText: 'YAZ and HAZ',
    mainMenuSubtitle: 'THE SHOWREEL',
    copyrightText: '© 2025 BROTHER BROTHER. ALL RIGHTS RESERVED.',
    mainBackgroundVimeoId: '292109430',
    mainReelVimeoId: '431751544',
    specialFeaturesBackgroundImage: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/d56856ff-5d6d-4d98-acfe-1ed609ef3d75/RUTH+|+festival+preview-high1.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg',
    chapters: [
        { title: 'FASHION FILM: SON AND PARK', vimeoId: '292109430',
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/1030ca68-958a-42c1-842f-882228239462/Son+%26+Park+Campaign+Teaser+2-low.gif?content-type=image%2Fgif' },
        { title: 'COMMERCIAL: MAKE IT COUNT', vimeoId: '292109430',
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/aec16f05-ed69-456a-ba1e-14d6e44ae8d1/ALEX+%28Short+film%29+Trailer-high.gif?content-type=image%2Fgif' },
        { title: 'DOCUMENTARY: SOMETHING', vimeoId: '292109430',
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/30eb84ab-fdd4-4304-b360-e3d6ac1700d8/An+Admin+Worker+At+The+End+Of+The+World+-+trailer-high.gif?content-type=image%2Fgif' },
        { title: 'EDUCATION: RHP', vimeoId: '292109430',
          thumbnailUrl: 'https://images.squarespace-cdn.com/content/62c2b737a32928605d35b9dd/ad2a4236-30d9-4261-9af8-5b6166575282/Brother+Brother+Reel+2020-3-high.gif?content-type=image%2Fgif' }
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