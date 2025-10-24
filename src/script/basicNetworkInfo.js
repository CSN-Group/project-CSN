function formatTimestamp(timestamp) {
    const date = new Date(Number(timestamp));

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    return date.toLocaleString('sv-SE', options);
}

function isNumericTimestamp(value) {
    return (
        (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(value))) &&
        !isNaN(new Date(Number(value)).getTime())
    );
}

async function updateNetwork(){
    const connType = await window.systemInfo.getGlobal('currentConnectionType');

    const wifiText = document.getElementById("wifiText");
    const ethText = document.getElementById("ethernetText");

    const ethImage = document.getElementById("ethernetIcon");

    if(connType === "WiFi"){
        await updateWifiDisplay();

        wifiText.innerText = await window.systemInfo.getGlobal("currentWifiStrength") + "%";

        ethText.innerText = "EJ ANSLUTEN";
        ethImage.src = "img/ethernet_trans.png"
        ethImage.style.opacity = "0.3";
    } else if(connType === "Ethernet"){
        ethText.innerText = "ANSLUTEN";
        ethText.innerHTML = "<b>ANSLUTEN</b>"

        ethImage.src = "img/greenEthernet_trans.png"
        ethImage.style.opacity = "1";

        wifiText.innerText = "EJ WIFI";

        await updateWifiDisplay();
    } else{
        await updateWifiDisplay();

        wifiText.innerText = "EJ WIFI";

        ethText.innerText = "EJ ANSLUTEN";
        ethImage.src = "img/ethernet_trans.png"
        ethImage.style.opacity = "0.3";
    }

    const speedtestTextDOM = document.getElementById('lastUpdatedText');
    const speedtestTextValue = await window.systemInfo.getGlobal('speedtestText');
    let speedText;

    if(isNumericTimestamp(speedtestTextValue)) speedText = formatTimestamp(speedtestTextValue);
    else speedText = speedtestTextValue;

    speedtestTextDOM.innerText = speedText;

    const downSpeed = await window.systemInfo.getGlobal("lastDownspeed");
    const upSpeed = await window.systemInfo.getGlobal("lastUpspeed");

    if(downSpeed > 0 && upSpeed > 0){
        const downDiv = document.getElementById('downloadValue');
        const upDiv = document.getElementById('uploadValue');

        downDiv.innerText = downSpeed + " Mb/s";
        upDiv.innerText = upSpeed + " Mb/s"
    }

    const pingValue = document.getElementById('pingValue');
    const currentPing = await window.systemInfo.getGlobal('lastPing');
    pingValue.innerText = currentPing;

    const level = document.getElementById('ping-level');
    const percent = calculatePingWidth(currentPing);
    level.style.width = `${percent}%`
}

function calculatePingWidth(ping) {
    const lowPingThres = 15;
    const highPingThres = 30;
    if(ping < lowPingThres) return 85;
    if(ping > lowPingThres && ping < highPingThres) return 45;
    if(ping.includes("test") || ping.includes("Test") || ping === "-") return 0;
    return 15;
}

async function initNetworkInfo() {
    document.getElementById('runSpeedtestButton').addEventListener(
        'click',
        await window.systemInfo.runSpeedtest);
}