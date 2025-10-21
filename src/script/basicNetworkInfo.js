function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    return date.toLocaleString(undefined, options);
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

        wifiText.innerText = await window.systemInfo.getGlobal("currentWifiStrength");

        ethText.innerText = "EJ ANSLUTEN";
        ethImage.src = "img/ethernet_trans.png"
    } else if(connType === "Ethernet"){
        ethText.innerText = "ANSLUTEN";
        ethText.innerHTML = "<b>ANSLUTEN</b>"
        ethImage.src = "img/greenEthernet_trans.png"

        wifiText.innerText = "-";

        await updateWifiDisplay();
    } else{
        await updateWifiDisplay();

        ethText.innerText = "EJ ANSLUTEN";
        ethImage.src = "img/ethernet_trans.png"
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
    pingValue.innerText = await window.systemInfo.getGlobal('lastPing');

    /*
    const speedtestDiv = document.getElementById("speedTestInfo");

    const downSpeed = await window.systemInfo.getGlobal('lastDownspeed');
    const upSpeed = await window.systemInfo.getGlobal('lastUpspeed');
    const ping = await window.systemInfo.getGlobal('lastPing');

    if(downSpeed) speedtestDiv.innerText = "Download: " + downSpeed + " Mbit/s";
    else speedtestDiv.innerText = "Download: error"

    if(upSpeed) speedtestDiv.innerText += "\nUpload: " + upSpeed + " Mbit/s";
    else speedtestDiv.innerText += "\nUpload: error";

    if(ping) speedtestDiv.innerText += "\nPing: " + ping + " ms";
    else speedtestDiv.innerText += "\nPing: error";

     */
}


async function initNetworkInfo() {
    document.getElementById('runSpeedtestButton').addEventListener(
        'click',
        await window.systemInfo.runSpeedtest);
}