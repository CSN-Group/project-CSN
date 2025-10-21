async function initSystemInfo() {
    
   // Calls a function to display pc information to front end.
    getPcValues();

}

async function updateSystemInfo(){
    //let futureText = "";
   // const sysInfoDiv = document.getElementById("pcInfoDisplay");
    //

   /* futureText = "PC Name: " + await window.systemInfo.getGlobal('pcName');
    futureText += "\nIP: " + await window.systemInfo.getGlobal('currentIP');
    futureText += "\nOS: " + await window.systemInfo.getGlobal('osVersion');
    futureText += "\nModel: " + await window.systemInfo.getGlobal('pcModel');
    futureText += "\nUser: " + await window.systemInfo.getGlobal('userName');

   */

   /* const updatesAvailable = await window.systemInfo.getGlobal('updatesAvailable');

    if(updatesAvailable === null){
        futureText += "\nUpdates: Initializing...";
    } else if(updatesAvailable){
        futureText += "\nUpdates: Available";
    } else if(!updatesAvailable){
        futureText += "\nUpdates: None";
    } else futureText += "\nUpdates: Unknown";*/
    getPcValues();


    //sysInfoDiv.innerText = futureText;
}
//
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