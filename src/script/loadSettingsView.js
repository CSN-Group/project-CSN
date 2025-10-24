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
    
    const dataSpan = document.getElementById("dataUsedSpan");
    const dataUsed = await window.systemInfo.getGlobal('dataSavedAmount');
    
    dataSpan.innerText = (dataUsed / 1024).toFixed(0) + " KB";

    const saveDataCheckbox = document.getElementById("saveDataCheckbox");
    saveDataCheckbox.checked = !await window.systemInfo.getGlobal("shouldSaveData");

    const shouldMeasureCheckbox = document.getElementById("shouldMeasureCheckbox");
    shouldMeasureCheckbox.checked = !await window.systemInfo.getGlobal("shouldMeasure");

    const shouldRemindErgonomiCheckbox = document.getElementById("remindErgonomiCheckbox");
    shouldRemindErgonomiCheckbox.checked = await window.systemInfo.getGlobal("remindErgonomi");

    const shouldRemindSocialCheckbox = document.getElementById("remindSocialCheckbox");
    shouldRemindSocialCheckbox.checked = await window.systemInfo.getGlobal("remindSocial");

    saveDataCheckbox.addEventListener('change', async () => {
        await window.systemInfo.setGlobal("shouldSaveData", !saveDataCheckbox.checked);
    });

    shouldMeasureCheckbox.addEventListener('change', async () => {
        await window.systemInfo.setGlobal("shouldMeasure", !shouldMeasureCheckbox.checked);
    });

    shouldRemindErgonomiCheckbox.addEventListener('change', async () => {
        await window.systemInfo.setGlobal("remindErgonomi", shouldRemindErgonomiCheckbox.checked);
    });

    shouldRemindSocialCheckbox.addEventListener('change', async () => {
        await window.systemInfo.setGlobal("remindSocial", shouldRemindSocialCheckbox.checked);
    });
});