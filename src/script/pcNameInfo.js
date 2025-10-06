export async function run() {   
    // Update all the text content with the obtainde value of the system
    
    const pcNameInfoLabel =document.getElementById("pcNameLabel");
    const pcModelInfoLabel = document.getElementById("pcModelLabel");
    const osVersionInfoLabel = document.getElementById("osVersionLabel");
    const userNameInfoLabel = document.getElementById("userNameLabel");
    
  try {
      //obtain the system information in to a constant vairable.
      const pcNameInfo = window.systemInfo.getPcName();
      const pcModelInfo = window.systemInfo.getPcModel();
      const osVersionInfo = window.systemInfo.getOsVersion();
      const userNameInfo = window.systemInfo.getUserName();
      
      pcNameInfoLabel.textContent = "Pc Name: " + pcNameInfo;
      pcModelInfoLabel.textContent = "Pc Model: " + pcModelInfo;
      osVersionInfoLabel.textContent = "Os Version: " + osVersionInfo;
      userNameInfoLabel.textContent = "User Name: " + userNameInfo;
      
  } catch (error) {
      console.error("Error loading system info:", error);
      // Show user-friendly error messages
      pcNameInfoLabel.textContent = "Pc Name: Unable to load";
      pcModelInfoLabel.textContent = "Pc Model: Unable to load ";
      osVersionInfoLabel.textContent = "Os Version: Unable to load";
      userNameInfoLabel.textContent = "User Name: Unable to load";
  } 
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
