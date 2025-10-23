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

    document.getElementById("historyViewButton").addEventListener('click', () => {
        window.nav.historyPage();
    });

    document.getElementById("arbetsmiljoViewButton").addEventListener('click', () => {
        window.nav.arbetsmiljoPage();
    });


    const contentDiv = document.getElementById("contentDiv");

});