window.addEventListener('DOMContentLoaded', async () => {
    await initSystemInfo();
    await initAIAssistant();

    window.updates.onUpdateDone(async () => {
        const pc = document.getElementById("pcInfoDisplay");
        if(pc !== null) await updateSystemInfo();
    });
    
    const docButton = document.getElementById("documentationButton");
    const systemInfoDisp = document.getElementById("systemInfoButton");
    const settingsButton = document.getElementById("settingsButton");        

    const innerNavButtons = document.querySelectorAll('.secondaryNavButton');
    innerNavButtons.forEach(button => {
        button.addEventListener('click', () =>{
            document.querySelector('.activeNavButton').classList.remove('activeNavButton');
            button.classList.add('activeNavButton');
        })
    })

    // Navigation buttons
    document.getElementById("simpleViewButton").addEventListener('click', () => {
        window.nav.simplePage();
    });

    document.getElementById("historyViewButton").addEventListener('click', () => {
        window.nav.historyPage();
    });

    document.getElementById("arbetsmiljoViewButton").addEventListener('click', () => {
        window.nav.arbetsmiljoPage();
    });

    document.getElementById("settingsViewButton").addEventListener('click', () => {
        window.nav.settingsPage();
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
            <h2>DOKUMENTATION</h2>
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