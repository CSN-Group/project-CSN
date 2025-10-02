export async function run() {   
    // Update all the text content
    document.getElementById("pcNameLabel").textContent = "PC Name: " + window.systemInfo.getPcName();
    document.getElementById("pcModelLabel").textContent = "PC Model: " + window.systemInfo.getPcModel();
    document.getElementById("osVersionLabel").textContent = "OS Version: " + window.systemInfo.getOsVersion();
    document.getElementById("userNameLabel").textContent = "User Name: " + window.systemInfo.getUserName();
}