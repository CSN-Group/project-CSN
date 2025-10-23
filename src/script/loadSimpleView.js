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

    const inMeetingCheckbox = document.getElementById("speedtestToggleCheckbox");

    inMeetingCheckbox.addEventListener('change', async () => {
        await window.systemInfo.setGlobal("shouldMeasure", !inMeetingCheckbox.checked);
    });


    // Navigation buttons
    document.getElementById("advancedViewButton").addEventListener('click', () => {
        window.nav.detailedPage();
    });

    document.getElementById("historyViewButton").addEventListener('click', () => {
        window.nav.historyPage();
    });

    document.getElementById("arbetsmiljoViewButton").addEventListener('click', () => {
        window.nav.arbetsmiljoPage();
    });

    document.getElementById("settingsViewButton").addEventListener('click', () => {
        window.nav.settingsPage();
    });

    console.log('All done, Captain!');
});