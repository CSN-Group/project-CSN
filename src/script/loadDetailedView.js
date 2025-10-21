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
    const graphButton = document.getElementById("graphsButton");
    const powerPauseButton = document.getElementById("powerPauseButton");

    const innerNavButtons = document.querySelectorAll('.secondaryNavButton');
    innerNavButtons.forEach(button => {
        button.addEventListener('click', () =>{
            document.querySelector('.activeNavButton').classList.remove('activeNavButton');
            button.classList.add('activeNavButton');
        })
    })

    simpleButton.addEventListener('click', () => {
        window.nav.simplePage();
    });
    
    docButton.addEventListener('click', () => {
        const contentDiv = document.getElementById("contentDiv");
        const adminDoc = window.dbManager.getAdminDocument();
        
        contentDiv.innerHTML = `
        <div id="docDiv">
            <h2>Dokumentation</h2>
            <p>${adminDoc.docText}</p>
        <div id=docDiv">
        ` ;
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


    graphButton.addEventListener('click', () =>{
        const contentDiv = document.getElementById("contentDiv");
        contentDiv.innerHTML = `
        <div id="graphGrid">
            <div id = "timeRangeButtons">
                <div class="dropdown">
                    <button class="dropButton">Dag<img src="./img/dropdown.png"></img></button>
                    <div id="dayDropdown" class="dropdownContent"></div>       
                </div>
                <div class="dropdown">
                    <button class="dropButton">Vecka<img src="./img/dropdown.png"></button>
                    <div id="weekDropdown" class="dropdownContent"></div>       
                </div>
                <div class="dropdown">
                    <button class="dropButton">M&aring;nad<img src="./img/dropdown.png"></button>
                    <div id="monthDropdown" class="dropdownContent"></div>       
                </div> 
            </div>
            <div id = "metricButtons">
                <button id="graphWifiButton" class="graphButton">WIFI-STYRKA</button>
                <button id="graphUpspeedButton" class="graphButton">UPLADDNING</button>
                <button id="graphDownspeedButton" class="graphButton">NEDLADDNING</button>
                <button id="graphPingButton" class="graphButton">SVARSTID</button>               
                <button id="graphInterruptButton" class="graphButton">AVBROTT</button>
                <button id="graphWorktimeButton" class="graphButton">PAUSER</button>
            </div>                   
            <canvas id="historyGraph"></canvas>
        </div>
        `
        initDrop();
        initGraph();
    
    });

    powerPauseButton.addEventListener('click', () => {
        const contentDiv = document.getElementById("contentDiv");
        contentDiv.innerHTML = `
        <div id="powerDiv">
            <<img src="img/exercise.png" alt="Workout" id="exercisePic">
        </div>
        `

    })
    console.log('All done, Captain!');
});