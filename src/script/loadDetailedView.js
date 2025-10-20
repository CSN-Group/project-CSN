window.addEventListener('DOMContentLoaded', async () => {
    //inits

    window.updates.onUpdateDone(async () => {
        //updates
    });

    const simpleButton = document.getElementById("simpleViewButton");
    const docButton = document.getElementById("documentationButton");
    const graphButton = document.getElementById("graphsButton");

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
    })

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
            <canvas id="historyGraph" style="width:100%;max-width:500px"></canvas>
        </div>
        `
        initDrop();
        initGraph();
    
    });
    console.log('All done, Captain!');
});