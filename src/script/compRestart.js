
function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs}h ${mins}m ${secs}s`;
}

export async function run() {
            
    const restartContainer = document.getElementById("restartInfo");

    async function updateUptime() {
        restartContainer.innerText = formatTime(window.systemInfo.getStartTime());
    }

    await updateUptime();
    setInterval(updateUptime, 1000);
}

