// Declare variables for DOM elements. They will be initialized after the DOM is loaded.
export let mainMenuHeroTitle, mainMenuGlitchText, mainMenuSubtitle, specialFeaturesButtonContainer,
    mainBackgroundVideo, playReelButton, sceneSelectionButton, specialFeaturesButton,
    specialFeaturesClone, videoModal, videoModalIframe, closeModalButton, screenContainer,
    mainMenuScreen, sceneSelectionScreen, specialFeaturesScreen, aboutUsScreen, makeContactScreen, paginationControls,
    telepathyButton, telepathyMessage, backToMainMenuFromScenes, backToMainMenuFromAbout, tapPrompt,
    backToMainMenuFromFeatures, backToMainMenuFromContact, sceneSelectionGrid, transitionOverlay,
    subtitleShowreelElement, loadingOverlay, displacementMap, dvdLogo, passwordScreen,
    passwordForm, passcodeInput;

/**
 * Initializes all DOM element variables. This should be called after DOMContentLoaded.
 */
export function initDom() {
    mainMenuHeroTitle = document.getElementById('mainMenuHeroTitle');
    mainMenuGlitchText = document.getElementById('mainMenuGlitchText');
    mainMenuSubtitle = document.getElementById('mainMenuSubtitle');
    specialFeaturesButtonContainer = document.getElementById('specialFeaturesButtonContainer');
    mainBackgroundVideo = document.getElementById('mainBackgroundVideo');
    playReelButton = document.getElementById('playReelButton');
    sceneSelectionButton = document.getElementById('sceneSelectionButton');
    specialFeaturesButton = document.getElementById('specialFeaturesButton');
    specialFeaturesClone = document.getElementById('specialFeaturesClone');
    videoModal = document.getElementById('videoModal');
    videoModalIframe = document.getElementById('videoModalIframe');
    closeModalButton = document.getElementById('closeModal');
    screenContainer = document.getElementById('screenContainer');
    mainMenuScreen = document.getElementById('mainMenuScreen');
    sceneSelectionScreen = document.getElementById('sceneSelectionScreen');
    specialFeaturesScreen = document.getElementById('specialFeaturesScreen');
    aboutUsScreen = document.getElementById('aboutUsScreen');
    makeContactScreen = document.getElementById('makeContactScreen');
    telepathyButton = document.getElementById('telepathyButton');
    telepathyMessage = document.getElementById('telepathyMessage');
    tapPrompt = document.getElementById('tapPrompt');
    backToMainMenuFromScenes = document.getElementById('backToMainMenuFromScenes');
    backToMainMenuFromAbout = document.getElementById('backToMainMenuFromAbout');
    backToMainMenuFromFeatures = document.getElementById('backToMainMenuFromFeatures');
    backToMainMenuFromContact = document.getElementById('backToMainMenuFromContact');
    sceneSelectionGrid = document.getElementById('sceneSelectionGrid');
    transitionOverlay = document.getElementById('transitionOverlay');
    subtitleShowreelElement = document.querySelector('.subtitle-showreel');
    loadingOverlay = document.getElementById('loadingOverlay');
    displacementMap = document.getElementById('displacementMap');
    dvdLogo = document.getElementById('dvdLogo');
    passwordScreen = document.getElementById('passwordScreen');
    passwordForm = document.getElementById('passwordForm');
    passcodeInput = document.getElementById('passcodeInput');
    paginationControls = document.getElementById('paginationControls');

}
