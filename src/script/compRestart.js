function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        //const mins = Math.floor((seconds % 3600) / 60);
        //const secs = Math.floor(seconds % 60);
        return hrs//`${hrs}h ${mins}m ${secs}s`;
}

async function initCompRestart() {
    const restartContainer = document.getElementById("restartInfo");
    restartContainer.innerText = `Computer been running for - hours`;
}

async function updateRestart(){
    const restartContainer = document.getElementById("restartInfo");

    const runTimeHrs = formatTime(await window.systemInfo.getGlobal("compOnTimeHours"));
    restartContainer.innerText = `Computer been running for ${runTimeHrs} hours`;
}


        
