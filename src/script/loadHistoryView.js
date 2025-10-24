window.addEventListener('DOMContentLoaded', async () => {
    //init

    window.updates.onUpdateDone(async () => {
        //update
    });

    // Navigation buttons
    document.getElementById("simpleViewButton").addEventListener('click', () => {
        window.nav.simplePage();
    });

    document.getElementById("advancedViewButton").addEventListener('click', () => {
        window.nav.detailedPage();
    });

    document.getElementById("arbetsmiljoViewButton").addEventListener('click', () => {
        window.nav.arbetsmiljoPage();
    });

    document.getElementById("settingsViewButton").addEventListener('click', () => {
        window.nav.settingsPage();
    });

    initDrop();
    initHistory();
});