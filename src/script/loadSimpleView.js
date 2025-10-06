window.addEventListener('DOMContentLoaded', async () => {
    await runNetworkInfo();
    await runCompRestart();
    await runPCName();

    console.log('All done, Captain!');
});


