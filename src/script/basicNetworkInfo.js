async function updateNetwork(){
    const infoDiv = document.getElementById("basicNetworkInfo");

    let futureText = "";

    futureText = "Connection: " + await window.systemInfo.getGlobal('currentConnectionType');
    futureText += "\nWiFi Strength: " + await window.systemInfo.getGlobal('currentWifiStrength') + "%";

    infoDiv.innerText = futureText;

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
}


async function initNetworkInfo() {
    const infoDiv = document.getElementById("basicNetworkInfo");
    let futureInfoText = "";

    document.getElementById('runSpeedTestButton').addEventListener(
        'click',
        await window.systemInfo.runSpeedtest);

    const speedtestDiv = document.getElementById("speedTestInfo");

    speedtestDiv.innerText = "Download: -";
    speedtestDiv.innerText += "\nUpload: -";
    speedtestDiv.innerText += "\nPing: -";
}