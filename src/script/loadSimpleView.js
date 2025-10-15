window.addEventListener('DOMContentLoaded', async () => {
    await initNetworkInfo();
    await initCompRestart();
    await initSystemInfo();
    await initGraph();
    initActionList();
    initGauges();
    initWifiDisplay();    

    window.updates.onUpdateDone(async () => {
        await updateNetwork();
        await updateRestart();
        await updateSystemInfo();
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


