async function runPCName() {
    // Update all the text content with the obtainde value of the system
    document.getElementById("pcNameLabel").textContent = "PC Name: " + window.systemInfo.getPcName();
    //document.getElementById("pcModelLabel").textContent = "PC Model: " + window.systemInfo.getPcModel();
    document.getElementById("osVersionLabel").textContent = "OS Version: " + window.systemInfo.getOsVersion();
    document.getElementById("userNameLabel").textContent = "User Name: " + window.systemInfo.getUserName();
    //document.getElementById("latestVersionLabel").textContent = "Latest Version: " + window.systemInfo.checkForWindowsUpdates();
}
