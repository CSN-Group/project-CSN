async function runSpeedtest() {
    const currentlySpeedtesting = getGlobal("currentlySpeedtesting");

    if(!currentlySpeedtesting) {
        setGlobal('currentlySpeedtesting', true);
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
                const downSpeed = (speedInfo.download * 8).toFixed(1);
                const upSpeed = (speedInfo.upload * 8).toFixed(1);
                const ping = speedInfo.ping.toFixed(0);

                speedtestDiv.innerText = "Download: " + downSpeed + " Mbit/s";
                speedtestDiv.innerText += "\nUpload: " + upSpeed + " Mbit/s";
                speedtestDiv.innerText += "\nPing: " + ping + " ms"

                setGlobal("lastDownspeed", downSpeed);
                setGlobal("lastUpspeed", upSpeed);
                setGlobal("lastPing", ping);

            } else {
                speedtestDiv.innerText = "Download: error";
                speedtestDiv.innerText += "\nUpload: error";
                speedtestDiv.innerText += "\nPing: error";
            }

            setGlobal('currentlySpeedtesting', false);

        } catch (err) {
            console.error("Speedtest failed:", err);

            const speedtestDiv = document.getElementById("speedTestInfo");

            speedtestDiv.innerText = "Download: error";
            speedtestDiv.innerText += "\nUpload: error";
            speedtestDiv.innerText += "\nPing: error";

            setGlobal('currentlySpeedtesting', false);
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
        }

        setGlobal("currentWifiStrength", wifiStrength);
        text += "\n" + connectionText;
    } catch (err) {
        setGlobal("currentWifiStrength", 0);
        text += "Wi-Fi strength: An error occurred.";
    }

    return text;
}

function resolveType(iface) {
    if (iface.type) return iface.type; //If type is set, trust systemInformation...
    if (/wifi|wlan|wireless/i.test(iface.iface)) return "wireless";
    if (/eth|enp|ethernet/i.test(iface.iface)) return "wired";
    if (/tun|tap|vpn/i.test(iface.iface)) return "vpn";
    return "Unknown (" + iface.iface + ")";
}

async function runNetworkInfo() {
    const infoDiv = document.getElementById("basicNetworkInfo");
    let futureInfoText = "";

    document.getElementById('runSpeedTestButton').addEventListener('click', runSpeedtest);

    const speedtestDiv = document.getElementById("speedTestInfo");

    speedtestDiv.innerText = "Download: -";
    speedtestDiv.innerText += "\nUpload: -";
    speedtestDiv.innerText += "\nPing: -";

    async function updateNetwork() {

        await (async () => {
            let iface;
            try {
                iface = await window.systemInfo.getCurrentInterface();
                console.log('iface:', iface);
            } catch (err) {
                console.error('Error calling getCurrentInterface:', err);
            }

            let currentIP = iface.address;

            if(currentIP != null) setGlobal('currentIP', currentIP);
            else setGlobal('currentIP', "No valid IP");

            futureInfoText = "IP: " + currentIP;
            futureInfoText += "\nName: " + iface.name;
        })();


        iface = await window.systemInfo.getInterfaceByIP(getGlobal('currentIP'));

        const ifaceType = resolveType(iface);

        setGlobal('currentConnectionType', ifaceType);

        futureInfoText += "\nConnection: ";

        if(ifaceType === 'ethernet' || ifaceType === 'wired') {
            futureInfoText += "Cable connected (Ethernet)"
        } else if(ifaceType === 'wifi' || ifaceType === 'wireless'){
            futureInfoText += "Wi-Fi"
        } else futureInfoText += ifaceType;

        futureInfoText += "\nInterface status: " + iface.operstate;

        futureInfoText += await updateWifi();

        infoDiv.innerText = futureInfoText;
    }

    await updateNetwork();
    setInterval(updateNetwork, 10000);
}