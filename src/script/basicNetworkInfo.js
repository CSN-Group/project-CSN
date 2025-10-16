async function updateNetwork(){
    const connType = await window.systemInfo.getGlobal('currentConnectionType');
    const wifiStr = await window.systemInfo.getGlobal('currentWifiStrength');

    const wifiText = document.getElementById('wifiText');
    wifiText.innerText = wifiStr;
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