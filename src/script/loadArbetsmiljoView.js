window.addEventListener('DOMContentLoaded', async () => {
    //init

    window.updates.onUpdateDone(async () => {
        //update
    });

    // Navigation buttons
    document.getElementById("simpleViewButton").addEventListener('click', () => {
        window.nav.simplePage();
    });

    document.getElementById("advancedViewButton").addEventListener('click', () => {
        window.nav.detailedPage();
    });

    document.getElementById("historyViewButton").addEventListener('click', () => {
        window.nav.historyPage();
    });

    document.getElementById("settingsViewButton").addEventListener('click', () => {
        window.nav.settingsPage();
    });

    const contentDiv = document.getElementById("contentDiv");
    const graphButton = document.getElementById("graphsButton");
    const motionButton = document.getElementById("powerPauseButton");

    graphButton.addEventListener('click', () => {
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
                <button id="graphWorktimeButton" class="graphButton">PAUSER</button>
            </div>                   
            <canvas id="historyGraph"></canvas>
            <div id="metricInfoDiv">
                <p id="metricInfo">Till vänster kan du välja vilket mätvärde du vill ska visas i grafen!<br>
                Du kan även välja tidspann här ovan!
            </div>
        </div>
    </div> `
    })
    
    motionButton.addEventListener('click', () =>{
        
    })
});

              //  <button id="graphWifiButton" class="graphButton">WIFI-STYRKA</button>
              //  <button id="graphUpspeedButton" class="graphButton">UPPLADDNING</button>
              //  <button id="graphDownspeedButton" class="graphButton">NEDLADDNING</button>
              //  <button id="graphPingButton" class="graphButton">SVARSTID</button>               
              //  <button id="graphInterruptButton" class="graphButton">AVBROTT</button>