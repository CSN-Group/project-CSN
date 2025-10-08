
function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        //const mins = Math.floor((seconds % 3600) / 60);
        //const secs = Math.floor(seconds % 60);
        return hrs//`${hrs}h ${mins}m ${secs}s`;
}

async function runCompRestart() {
    const restartContainer = document.getElementById("restartInfo");
  
    async function updateUptime() {
        const runTimeHrs = formatTime(window.systemInfo.getStartTime());
        setGlobal("compOnTimeHours", runTimeHrs);
        restartContainer.innerText = `Computer been running for ${runTimeHrs} hours`;
    }

    await updateUptime();
    setInterval(updateUptime, 10000); // Completely unnecessary to update this? Only when starting the app?

}

