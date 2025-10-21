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

    const advancedButton = document.getElementById("advancedViewButton");

    advancedButton.addEventListener('click', () => {
        window.nav.detailedPage();
    });

    console.log('All done, Captain!');
});