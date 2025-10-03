async function runSpeedtest() {
    const currentlySpeedtesting = window.systemInfo.getGlobal('currentlySpeedtesting');

    if(!currentlySpeedtesting) {
        window.systemInfo.setGlobal('currentlySpeedtesting', true);
        console.log("Speedtest!");
        try {
            const speedtestDiv = document.getElementById("speedTestInfo");

            speedtestDiv.innerText = "Download: testing..";
            speedtestDiv.innerText += "\nUpload: testing..";
            speedtestDiv.innerText += "\nPing: testing..";

            const result = await window.systemInfo.runSpeedtest();

            const speedInfo = {
                download: result.download.bandwidth / 1000000,
                upload: result.upload.bandwidth / 1000000,
                ping: result.ping.latency
            };

            if (speedInfo) {
                const downSpeed = (speedinfo.download * 8).toFixed(1);
                const upSpeed = (speedinfo.upload * 8).toFixed(1);
                const ping = speedInfo.ping.toFixed(0);

                speedtestDiv.innerText = "Download: " + downSpeed + " Mbit/s";
                speedtestDiv.innerText += "\nUpload: " + upSpeed + " Mbit/s";
                speedtestDiv.innerText += "\nPing: " + ping + " ms"

                window.systemInfo.setGlobal("lastDownspeed", downSpeed);
                window.systemInfo.setGlobal("lastUpspeed", upSpeed);
                window.systemInfo.setGlobal("lastPing", ping);

            } else {
                speedtestDiv.innerText = "Download: error";
                speedtestDiv.innerText += "\nUpload: error";
                speedtestDiv.innerText += "\nPing: error";
            }

            window.systemInfo.setGlobal('currentlySpeedtesting', false);
        } catch (err) {
            console.error("Speedtest failed:", err);

            const speedtestDiv = document.getElementById("speedTestInfo");

            speedtestDiv.innerText = "Download: error";
            speedtestDiv.innerText += "\nUpload: error";
            speedtestDiv.innerText += "\nPing: error";

            window.systemInfo.setGlobal('currentlySpeedtesting', false);
        }
    }
}

async function updateWifi(){
    let text = "";

    try {
        const connections = await window.systemInfo.wifiConns();
        let connectionText;
        let wifiStrength = 0;

        if(connections.length === 0) connectionText = "Wi-Fi strength: No active WiFi connection.";
        else{
            wifiStrength = connections[0].quality;
            connectionText = "Wi-Fi strength: " + wifiStrength + "%";
            console.log("WiFi: " + wifiStrength + "%");
        }

        window.systemInfo.setGlobal("currentWifiStrength", wifiStrength);
        text += "\n" + connectionText;
    } catch (err) {
        window.systemInfo.setGlobal("currentWifiStrength", 0);
        text += "Wi-Fi strength: An error occurred.";
    }

    return text;
}

export async function run() {
    const infoDiv = document.getElementById("basicNetworkInfo");
    let futureInfoText = "";

    document.getElementById('runSpeedTestButton').addEventListener('click', runSpeedtest);

    const speedtestDiv = document.getElementById("speedTestInfo");

    speedtestDiv.innerText = "Download: -";
    speedtestDiv.innerText += "\nUpload: -";
    speedtestDiv.innerText += "\nPing: -";


    async function updateNetwork() {
        await (async () => {
            const iface = await window.systemInfo.getCurrentInterface();

            let currentIP = iface.address;

            if(currentIP != null) window.systemInfo.setGlobal('currentIP', currentIP);
            else window.systemInfo.setGlobal('currentIP', "No valid IP");

            futureInfoText = "IP: " + currentIP;
            futureInfoText += "\nName: " + iface.name;
        })();

        let iface = await window.systemInfo.getInterfaceByIP(window.systemInfo.getGlobal('currentIP'));

        window.systemInfo.setGlobal('currentConnectionType', iface.type);

        futureInfoText += "\nConnection: ";

        if(iface.type === 'ethernet' || iface.type === 'wired') {
            futureInfoText += "Cable connected (Ethernet)"
        } else if(iface.type === 'wifi'){
            futureInfoText += "Wi-Fi"
        } else futureInfoText += iface.type;

        futureInfoText += "\nInterface status: " + iface.operstate;

        futureInfoText += await updateWifi();

        infoDiv.innerText = futureInfoText;
    }

    await updateNetwork();
    setInterval(updateNetwork, 5000);

}