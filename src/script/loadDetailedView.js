window.addEventListener('DOMContentLoaded', async () => {
    //initSomething();
    //initSomethingElse();

    window.updates.onUpdateDone(async () => {
        //updateSomething();
        //updateSomethingElse();
    });

    const simpleButton = document.getElementById("simpleViewButton");
    const docButton = document.getElementById("documentationButton");
    const settingsButton = document.getElementById("settingsButton");

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

    settingsButton.addEventListener('click', async () => {
        const contDiv = document.getElementById("contentDiv");
        contDiv.innerHTML = `
       <div id="settingsGrid">
           <div id="settingsLeft">
               <h2>VERKTYG</h2>
               <div class="settingsOption">
                   <label for="saveDataCheckbox">Spara inte min data</label>
                   <input type="checkbox" id="saveDataCheckbox">
              </div>
            
              <div class="settingsOption">
                <label for="shouldMeasureCheckbox">Mät inte kontinuerligt</label>
                <input type="checkbox" id="shouldMeasureCheckbox">
              </div>
            
              <div class="status">
                <label>Sparad data:</label>
                <span id="dataUsedSpan">-</span>
              </div>
                
              <button id="clearDataButton">RENSA DATA</button>
           </div>
           <div id="settingsRight">
               <h2>ARBETSMILJÖ</h2>
               <div class="settingsOption">
                   <label for="remindErgonomiCheckbox">Påminn om ergonomi</label>
                   <input type="checkbox" id="remindErgonomiCheckbox">
               </div>
            
              <div class="settingsOption">
                <label for="remindSocialCheckbox">Påminn om social kontakt</label>
                <input type="checkbox" id="remindSocialCheckbox">
              </div>
           </div>
       </div> 
       `
        const saveDataCheckbox = document.getElementById("saveDataCheckbox");
        saveDataCheckbox.checked = !await window.systemInfo.getGlobal("shouldSaveData");

        const shouldMeasureCheckbox = document.getElementById("shouldMeasureCheckbox");
        shouldMeasureCheckbox.checked = !await window.systemInfo.getGlobal("shouldMeasure");

        const shouldRemindErgonomiCheckbox = document.getElementById("remindErgonomiCheckbox");
        shouldRemindErgonomiCheckbox.checked = await window.systemInfo.getGlobal("remindErgonomi");

        const shouldRemindSocialCheckbox = document.getElementById("remindSocialCheckbox");
        shouldRemindSocialCheckbox.checked = await window.systemInfo.getGlobal("remindSocial");

        document.getElementById("saveDataCheckbox").addEventListener('change', async () => {
            await window.systemInfo.setGlobal("shouldSaveData", !saveDataCheckbox.checked);
        });

        document.getElementById("shouldMeasureCheckbox").addEventListener('change', async () => {
            await window.systemInfo.setGlobal("shouldMeasure", !shouldMeasureCheckbox.checked);
        });

        document.getElementById("remindErgonomiCheckbox").addEventListener('change', async () => {
            await window.systemInfo.setGlobal("remindErgonomi", shouldRemindErgonomiCheckbox.checked);
        });

        document.getElementById("remindSocialCheckbox").addEventListener('change', async () => {
            await window.systemInfo.setGlobal("remindSocial", shouldRemindSocialCheckbox.checked);
        });
    });


    console.log('All done, Captain!');
});


