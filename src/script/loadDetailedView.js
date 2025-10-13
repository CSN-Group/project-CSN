window.addEventListener('DOMContentLoaded', async () => {

    window.updates.onUpdateDone(async () => {

    });


    const simpleButton = document.getElementById("simpleViewButton");

    simpleButton.addEventListener('click', () => {
        window.nav.simplePage();
    });

    console.log('All done, Captain!');
});


