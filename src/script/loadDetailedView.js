window.addEventListener('DOMContentLoaded', async () => {
    //inits


    window.updates.onUpdateDone(async () => {
        //updates
    });


    const simpleButton = document.getElementById("simpleViewButton");

    simpleButton.addEventListener('click', () => {
        window.nav.simplePage();
    });

    console.log('All done, Captain!');
});


