async function initSystemInfo() {
    await getPcValues();
}

async function updateSystemInfo(){

    await getPcValues();
}
// Sets all values in to respectiv place when it is called by other functions.
async function getPcValues() {
    document.getElementById("ipAddressLabel").textContent = "IP-Adress: " + await window.systemInfo.getGlobal("currentIP");
    document.getElementById("UserNameLabel").textContent = "Användarenamn: " + await window.systemInfo.getGlobal("userName");
    document.getElementById("pcNameLabel").textContent = "Dator Namn: " + await window.systemInfo.getGlobal("pcName");
    document.getElementById("pcModelLabel").textContent = "Dator Modell: " + await window.systemInfo.getGlobal("pcModel");
    document.getElementById("osVersionLabel").textContent = "OS Version: " + await window.systemInfo.getGlobal("osVersion"); 
    document.getElementById("lastRebootLabel").textContent= "Senaste Omstart: " + await window.systemInfo.getGlobal("compOnTimeHours"); 
    //document.getElementById("phoneSpan").innerHTML = await window.systemInfo.getGlobal();
    //document.getElementById("linkSpan").innerHTML = await window.systemInfo.getGlobal();

    //updates check 
    const updatesAvailable = await window.systemInfo.getGlobal('updatesAvailable');
    const isUpdateAvl = document.getElementById("updateAvLabel")

    if(updatesAvailable === null){
        isUpdateAvl.textContent = "Windows-uppdatering tillgänglig: Initierar...";
    } else if(updatesAvailable){
        isUpdateAvl.textContent = "Windows-uppdatering tillgänglig: Ja";
    } else if(!updatesAvailable){
        isUpdateAvl.textContent = "Windows-uppdatering tillgänglig: Nej";
    } else isUpdateAvl.textContent = "Upddatering: Ett fel uppstod";
}