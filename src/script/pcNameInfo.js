async function initSystemInfo() {
    const restartContainer = document.getElementById("restartInfo");
    restartContainer.innerText = `Computer been running for - hours`;
}

async function updateSystemInfo(){
    let futureText = "";
    const sysInfoDiv = document.getElementById("compInfo");


    futureText = "PC Name: " + await window.systemInfo.getGlobal('pcName');
    futureText += "\nIP: " + await window.systemInfo.getGlobal('currentIP');
    futureText += "\nOS: " + await window.systemInfo.getGlobal('osVersion');
    futureText += "\nModel: " + await window.systemInfo.getGlobal('pcModel');
    futureText += "\nUser: " + await window.systemInfo.getGlobal('userName');

    sysInfoDiv.innerText = futureText;
}
