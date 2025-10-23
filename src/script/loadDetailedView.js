window.addEventListener('DOMContentLoaded', async () => {
    await initSystemInfo();
    await initAIAssistant();

    window.updates.onUpdateDone(async () => {
        const pc = document.getElementById("pcInfoDisplay");
        if(pc !== null) await updateSystemInfo();
    });

    const simpleButton = document.getElementById("simpleViewButton");
    const docButton = document.getElementById("documentationButton");
    const systemInfoDisp = document.getElementById("systemInfoButton");
    const settingsButton = document.getElementById("settingsButton");
    const graphButton = document.getElementById("graphsButton");
    const powerPauseButton = document.getElementById("powerPauseButton");
    const aiAssistantButton = document.getElementById("aiAssistantButton");

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

    systemInfoDisp.addEventListener('click', async () => {
        await initSystemInfo();
        await initAIAssistant();
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
                   <label class="slidetoggle">
                       <input type="checkbox" id="saveDataCheckbox">
                       <span class="slider"></span>
                   </label>
              </div>
            
              <div class="settingsOption">
                <label for="shouldMeasureCheckbox">Mät inte kontinuerligt</label>
                <label class="slidetoggle">
                       <input type="checkbox" id="shouldMeasureCheckbox">
                       <span class="slider"></span>
                </label>
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
                   <label class="slidetoggle">
                       <input type="checkbox" id="remindErgonomiCheckbox">
                       <span class="slider"></span>
                   </label>
               </div>
            
              <div class="settingsOption">
                   <label for="remindSocialCheckbox">Påminn om social kontakt</label>
                   <label class="slidetoggle">
                       <input type="checkbox" id="remindSocialCheckbox">
                       <span class="slider"></span>
                   </label>
              </div>
           </div>
       </div> 
       `
        const dataSpan = document.getElementById("dataUsedSpan");
        const dataUsed = await window.systemInfo.getGlobal('dataSavedAmount');

        dataSpan.innerText = (dataUsed / 1024).toFixed(0) + " KB";

        const saveDataCheckbox = document.getElementById("saveDataCheckbox");
        saveDataCheckbox.checked = !await window.systemInfo.getGlobal("shouldSaveData");

        const shouldMeasureCheckbox = document.getElementById("shouldMeasureCheckbox");
        shouldMeasureCheckbox.checked = !await window.systemInfo.getGlobal("shouldMeasure");

        const shouldRemindErgonomiCheckbox = document.getElementById("remindErgonomiCheckbox");
        shouldRemindErgonomiCheckbox.checked = await window.systemInfo.getGlobal("remindErgonomi");

        const shouldRemindSocialCheckbox = document.getElementById("remindSocialCheckbox");
        shouldRemindSocialCheckbox.checked = await window.systemInfo.getGlobal("remindSocial");

        saveDataCheckbox.addEventListener('change', async () => {
            await window.systemInfo.setGlobal("shouldSaveData", !saveDataCheckbox.checked);
        });

        shouldMeasureCheckbox.addEventListener('change', async () => {
            await window.systemInfo.setGlobal("shouldMeasure", !shouldMeasureCheckbox.checked);
        });

        shouldRemindErgonomiCheckbox.addEventListener('change', async () => {
            await window.systemInfo.setGlobal("remindErgonomi", shouldRemindErgonomiCheckbox.checked);
        });

        shouldRemindSocialCheckbox.addEventListener('change', async () => {
            await window.systemInfo.setGlobal("remindSocial", shouldRemindSocialCheckbox.checked);
        });
    });


    graphButton.addEventListener('click', () =>{
        const contentDiv = document.getElementById("contentDiv");
        contentDiv.innerHTML = `
        <div id="graphGrid">
            <div id = "timeRangeButtons">
                <div class="dropdown">
                    <button class="dropButton">Dagar<img src="./img/dropdown.png"></img></button>
                    <div id="dayDropdown" class="dropdownContent"></div>       
                </div>
                <div class="dropdown">
                    <button class="dropButton">Veckor<img src="./img/dropdown.png"></button>
                    <div id="weekDropdown" class="dropdownContent"></div>       
                </div>
                <div class="dropdown">
                    <button class="dropButton">Månader<img src="./img/dropdown.png"></button>
                    <div id="monthDropdown" class="dropdownContent"></div>       
                </div> 
            </div>
            <div id = "metricButtons">
                <button id="graphWifiButton" class="graphButton">WIFI-STYRKA</button>
                <button id="graphUpspeedButton" class="graphButton">UPPLADDNING</button>
                <button id="graphDownspeedButton" class="graphButton">NEDLADDNING</button>
                <button id="graphPingButton" class="graphButton">SVARSTID</button>               
                <button id="graphInterruptButton" class="graphButton">AVBROTT</button>
                <button id="graphWorktimeButton" class="graphButton">PAUSER</button>
            </div>                   
            <canvas id="historyGraph"></canvas>
            <div id="metricInfoDiv">
                <p id="metricInfo">Till vänster kan du välja vilket mätvärde du vill ska visas i grafen!<br>
                Du kan även välja tidspann här ovan!
            </div>
        </div>
        `
        initDrop();
        initGraph();
    
    });

    powerPauseButton.addEventListener('click', () => {
        const contentDiv = document.getElementById("contentDiv");
        contentDiv.innerHTML = `
        <div id="powerDiv">
            <img src="img/exercise.png" alt="Workout" id="exercisePic">
            <p>Här kan man få tillgång till enklare träningspass och stretchövningar som
            underlättar för kontorsarbetare</p>
        </div>
        `
    });

    /*
    aiAssistantButton.addEventListener('click', () => {
        initAIAssistant();
        loadChatHistory();

        const sendBtn = document.getElementById('send-btn');
        const resetBtn = document.getElementById('reset-btn');
        const messageInput = document.getElementById('message-input');

        sendBtn.addEventListener('click', async () => {
            await sendToAI();
        });

        resetBtn.addEventListener('click', async () => {
            await resetChat();
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });
    });*/

    console.log('All done, Captain!');
});