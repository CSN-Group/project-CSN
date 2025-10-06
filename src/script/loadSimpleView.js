window.addEventListener('DOMContentLoaded', async () => {
    initiateList();
    await runNetworkInfo();
    await runCompRestart();
    await runPCName();

    console.log('All done, Captain!');
});


