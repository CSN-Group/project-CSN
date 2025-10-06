export async function run() {   
    // Update all the text content with the obtainde value of the system
    document.getElementById("pcNameLabel").textContent = "PC Name: " + window.systemInfo.getPcName();
    document.getElementById("pcModelLabel").textContent = "PC Model: " + window.systemInfo.getPcModel();
    document.getElementById("osVersionLabel").textContent = "OS Version: " + window.systemInfo.getOsVersion();
    document.getElementById("userNameLabel").textContent = "User Name: " + window.systemInfo.getUserName();
    //document.getElementById("latestVersionLabel").textContent = "Latest Version: " + window.systemInfo.checkForWindowsUpdates();
    //
    // get avialable updates in windows 
    const systemUpdatesInfo = document.getElementById("latestVersionLabel");
    async function checkWindowsUpdates() {
      try{
        const updatesAvailable = await window.systemInfo.checkForUpdates();
        if(updatesAvailable){
              systemUpdatesInfo.innerHTML = 'Windows updates are available';
              //console.log('Windows updates are available');

            } else {
              systemUpdatesInfo.innerHTML = 'No updataes available';
              //console.log('No updataes available or check failed');

            }

      } catch (error) {
        systemUpdatesInfo.innerHTML = 'Update check failed';
        console.error('Update check error:', error);
      }         

    }
    await checkWindowsUpdates();
    
}
