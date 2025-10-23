function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');

    return `${year}-${month}-${day} kl. ${hour}`;
}

async function initSystemInfo() {
    const displayPcInfo = document.getElementById("contentDiv");
    displayPcInfo.innerHTML = `
        <div id ="systemaInfoCont" class ="systemContent"> 
                <div id="pcInfoDisplay">
                    <h2>Systeminformation</h2>
                    <br>
                    <label id ="ipAddressLabel">IP-adress: Laddar... </label><br>
                    <label id="UserNameLabel">Användarnamn: Laddar... </label><br>
                    <label id="pcNameLabel">Datornamn: Laddar... </label><br>
                    <label id="pcModelLabel">Datormodell: Laddar... </label><br>
                    <label id="osVersionLabel">OS-version: Laddar... </label><br>
                    <label id="updateAvLabel">Uppdatering till Windows: Laddar... </label><br>
                    <label id="lastRebootDateLabel">Senaste omstarten: Laddar...</label><br>
                    <label id="lastRebootLabel">Timmar sedan omstart: Laddar... </label><br>
                </div>
                <div id="teleLink">
                   <h2>Kontakt / Support</h2>
                   <div id="phoneDiv">
                       <img src="./img/teleIcon.png" width="24px" height="24px"">
                       <span id="phoneSpan" class= "phoneContent">Telefonnummer: +467270001230 </span>
                   </div>
                   <div id="linkDiv">
                       <img src="./img/webLinkIcon.png" width="24px" height="24px"">
                       <span id="linkSpan" class= "linkContent">Hemsida: www.hermans.support.se </span> 
                   </div>
                </div>
                <div id="aiSupportDisplay">
                </div>
        </div>`;
    await getPcValues();
}

async function updateSystemInfo(){
    await getPcValues();
}

async function getPcValues() {
    document.getElementById("ipAddressLabel").textContent = "IP-adress: " + await window.systemInfo.getGlobal("currentIP");
    document.getElementById("UserNameLabel").textContent = "Användarnamn: " + await window.systemInfo.getGlobal("userName");
    document.getElementById("pcNameLabel").textContent = "Datornamn: " + await window.systemInfo.getGlobal("pcName");
    document.getElementById("pcModelLabel").textContent = "Datormodell: " + await window.systemInfo.getGlobal("pcModel");
    document.getElementById("osVersionLabel").textContent = "OS-version: " + await window.systemInfo.getGlobal("osVersion");

    const timeSinceRestart = await window.systemInfo.getGlobal("compOnTimeHours");

    document.getElementById("lastRebootDateLabel").textContent = "Senaste omstarten: " +
        formatTimestamp(Date.now() - (timeSinceRestart * 60 * 60 * 1000));


    document.getElementById("lastRebootLabel").textContent =
        "Timmar sedan omstart: " + timeSinceRestart + " timmar.";
    const suppInfo = await window.dbManager.getAdminSupportInfo();
    document.getElementById("phoneSpan").innerText = "Telefonnummer: " + suppInfo.suppNr;
    document.getElementById("linkSpan").innerHTML = "Hemsida: " +
        "<a href=\"" + suppInfo.suppLink + "\" id='supportLink'>" + suppInfo.suppLink + "</a>";

    const supportLink = document.getElementById('supportLink');

    supportLink.addEventListener('click', (event) => {
        event.preventDefault();
        const url = supportLink.getAttribute('href');
        window.nav.openExternalLink(url);
    });

    //updates check 
    const updatesAvailable = await window.systemInfo.getGlobal('updatesAvailable');
    const isUpdateAvl = document.getElementById("updateAvLabel")

    if(updatesAvailable === null){
        isUpdateAvl.textContent = "Uppdatering till Windows: Initierar...";
    } else if(updatesAvailable){
        isUpdateAvl.textContent = "Uppdatering till Windows: Uppdatering(ar) finns tillgängliga";
    } else if(!updatesAvailable){
        isUpdateAvl.textContent = "Uppdatering till Windows: Inga uppdateringar tillgängliga";
    } else isUpdateAvl.textContent = "Uppdatering till Windows: Ett fel uppstod (Error)";

}