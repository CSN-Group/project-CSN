window.addEventListener('DOMContentLoaded', async () => {    
    await initNetworkInfo();
    await initCompRestart();
    await initSystemInfo();
    await initGraph();
    initActionList();
    initGauges();    

    window.updates.onUpdateDone(async () => {
        await updateNetwork();
        await updateRestart();
        await updateSystemInfo();                   
    });

    window.updates.onActionsUpdated(async (list) => {
        updateActionList(list);
    });

    console.log('All done, Captain!');
});


