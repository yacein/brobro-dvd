// --- DATA DEFINITION (DEFAULT VALUES) ---
export let videoData = {
    siteTitle: 'Brother Brother | The Showreel',
    mainMenuTitle: 'YAZ & HAZ',
    mainMenuGlitchText: 'DIRECTING DUO',
    mainMenuSubtitle: 'THE SHOWREEL',
    copyrightText: '© 1996 BROTHER BROTHER. ALL RIGHTS RESERVED.',
    mainBackgroundVimeoId: '292109430',
    mainBackgroundOverlayColor: 'rgba(0, 0, 0, 0.5)',
    mainReelVimeoId: '1169812685/d5e26b828a',
    specialFeaturesBackgroundImage: 'assets/gifs/ruth-window-bg.gif',
    sceneBackgroundImage: 'assets/MakeItCount-bucket.jpg',
    chapters: [
        { title: 'SUMUP - Make it Count', vimeoId: '1017849814',
          thumbnailUrl: 'assets/gifs/make-it-count-thumbnail.gif' },
        { title: 'DATASNIPPERS - Sandcastles', vimeoId: '1105915041?h=7eb0001144',
          thumbnailUrl: 'assets/gifs/datasnipper-thumbnail.gif' },
        { title: 'PVCASE - What Would You Do', vimeoId: '1106051275/2656e0296f',
          thumbnailUrl: 'assets/gifs/pvcase-thumbnail.gif' },
        { title: 'TENABLE - Never Take It Off', vimeoId: '1169563007/ddf88646be',
          thumbnailUrl: 'assets/gifs/NTIO_Runners.gif' },
        { title: 'SIEMENS - Smart Kitchen', vimeoId: '856359531',
          thumbnailUrl: 'assets/gifs/siemens-thumbnail.gif' },
        { title: 'RHP - Great Things Happen At Home', vimeoId: '364814788',
          thumbnailUrl: 'assets/gifs/RHP_Great-Things-Happen-At-Home.gif' },
        { title: 'JWMARRIOT - Global Luxury', vimeoId: '1165646364/fcfffa0960',
          thumbnailUrl: 'assets/gifs/JW-Marriott-Agency-Cut-low.gif' },
        { title: 'IC!BERLIN - Berlin Style', vimeoId: '638649165',
          thumbnailUrl: 'assets/gifs/IC-Berlin_Style-Made-in-Germany-low.gif' }
    ],
    pagination: [  
      { name: "Comedy & Tech" },
      { name: "Fashion & Luxury" }
    ],
    specialFeatures: [
        { text: 'Make Contact', type: 'internal', targetScreen: 'contact' },
        { text: 'About Us' },
        { text: 'Instagram',
          url: 'https://www.instagram.com/brobrofilm/', target: '_blank' },
        { text: 'Easter Eggs', url: '#' }
    ],
    telepathyMessage: [
        'A faint message echoes in your mind: "We hear you, mortal. Seek us in the void."',
        'You will hear from the brothers in the next couple of days.',
        "Assuming it's not a bank holiday or something because the void doesn't have access to a calendar."
    ],
};

// We need a way to update the config from main.js after fetching data
export function updateVideoData(newData) {
    videoData = newData;
}

// Placeholder for sound effect
export const bloopSound = new Audio('assets/click.aac');
bloopSound.volume = 0.3; // Set volume to 30% (0.0 is silent, 1.0 is full)

// --- GLOBAL STATE ---
export let siteVersionId = '1';

export function setSiteVersionId(id) {
    siteVersionId = id;
}

export function getSiteVersionId() {
    return siteVersionId;
}