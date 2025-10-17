window.addEventListener('DOMContentLoaded', async () => {
    //inits

    window.updates.onUpdateDone(async () => {
        //updates
    });

    const simpleButton = document.getElementById("simpleViewButton");
    const docButton = document.getElementById("documentationButton");

    simpleButton.addEventListener('click', () => {
        window.nav.simplePage();
    });
    
    docButton.addEventListener('click', () => {
        const contentDiv = document.getElementById("contentDiv");
        const adminInfo = window.dbManager.getAdminInfo();
        contentDiv.innerHTML = `
        <h2>Documentation</h2>
        <p>` + adminInfo.docText + `</p>
        <p>` + adminInfo.suppNr + `</p>
        <a href=`+adminInfo.suppLink + `>Support link</a>`;
    })


    console.log('All done, Captain!');
});


