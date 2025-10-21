window.addEventListener('DOMContentLoaded', async () => {
    //inits

    window.updates.onUpdateDone(async () => {
        //updates
    });

    const simpleButton = document.getElementById("simpleViewButton");
    const docButton = document.getElementById("documentationButton");
    const systemInfoDisp = document.getElementById("systemInfoButton");
    
    systemInfoDisp.addEventListener('click', () => {
        const displayPcInfo = document.getElementById("contentDiv");
        displayPcInfo.innerHTML = `
        <div id ="systemaInfoCont" class ="systemContent"> 
                <div id="pcInfoDisplay" class="pcInfoContent">
                    <h2>Information to Support?</h2>
                    <p>Dator Information</p>
                    <label id ="ipAddressLabel">Ip Address: Loading... </label><br>
                    <label id="UserNameLabel">User Name: Loading... </label><br>
                    <label id="pcNameLabel">Pc Name: Loading... </label><br>
                    <label id="pcModelLabel">PC Model: Loading... </label><br>
                    <label id="osVersionLabel">OS Version: Loading... </label><br>
                    <label id="updateAvLabel">Update: Loading... </label><br>
                    <h2>Last Reboot</h2>
                    <label id="lastRebootLabel">Senaste Omstart: Loading... </label><br>
                </div>
                <div id="SupportSite" class="supportContent">
                    <div id="teleLink" class="teleLinkContent">
                       <span id="phoneSpan" class= "phoneContent">Telefon Nummer: +467270001230 </span><br>
                       <span id="linkSpan" class= "linkContent">Supportlink: www.hermans.support.se </span><br>
                    </div>
                    <div id="aiSupportDisplay" class="aiSupportContent">
                        <p>This is AI support side an IMG!</p>
                    </div>
                </div>
        </div>`;
        initSystemInfo()

          window.updates.onUpdateDone(async () => {
            updateSystemInfo();
         });   
            
    });
  

    simpleButton.addEventListener('click', () => {
        window.nav.simplePage();
    });
    

    
    docButton.addEventListener('click', () => {
        const contentDiv = document.getElementById("contentDiv");
        const adminInfo = window.dbManager.getAdminInfo();
        contentDiv.innerHTML = `
        <h2>Documentation</h2>
        <p>` + adminInfo.docText + `</p>
        <p>` + adminInfo.suppNr + `</p>
        <a href=`+adminInfo.suppLink + `>Support link</a>`;
    });
   
    console.log('All done, Captain!');
})


