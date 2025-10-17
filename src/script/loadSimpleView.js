window.addEventListener('DOMContentLoaded', async () => {
    await initNetworkInfo();
    initActionList();
    initGauges();
    initWifiDisplay();    

    window.updates.onUpdateDone(async () => {
        await updateNetwork();
        await updateGauges();
        await updateWifiDisplay();
    });

    window.updates.onActionsUpdated(async (list) => {
        actionList = list;
        updateActionList(list);
    });

    const advancedButton = document.getElementById("advancedViewButton");

    advancedButton.addEventListener('click', () => {
        window.nav.detailedPage();
    });

    console.log('All done, Captain!');
});