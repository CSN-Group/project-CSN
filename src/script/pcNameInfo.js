export async function run() {   
    // Update all the text content with the obtainde value of the system
    document.getElementById("pcNameLabel").textContent = "PC Name: " + window.systemInfo.getPcName();
    document.getElementById("pcModelLabel").textContent = "PC Model: " + window.systemInfo.getPcModel();
    document.getElementById("osVersionLabel").textContent = "OS Version: " + window.systemInfo.getOsVersion();
    document.getElementById("userNameLabel").textContent = "User Name: " + window.systemInfo.getUserName();
    document.getElementById("latestVersionLabel").textContent = "Latest Version: " + window.systemInfo.checkForWindowsUpdates();
    //
    // get avialable updates in windows 
    async function checkWindowsUpdates() {
        if (window.windowsUpdateAPI) {
            const updatesAvailable = await window.windowsUpdateAPI.checkForUpdates();
            return updatesAvailable;
        }
        return false;
    }

    function showUpdateMessage() {
        const updateDiv = document.getElementById('compInfo');
        updateDiv.innerHTML = `
        <div style="padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; margin: 10px;">
        <p>Windows updates are available and ready to install.</p>
        <button onclick="require('electron').shell.openExternal('ms-settings:windowsupdate')">
        Install Updates
        </button>
        </div>
  ` ;
  document.body.prepend(updateDiv);
}
 async function initUpdateCheck() {
  const updatesAvailable = await checkWindowsUpdates();
  if (updatesAvailable) {
    showUpdateMessage();
  }
}

}