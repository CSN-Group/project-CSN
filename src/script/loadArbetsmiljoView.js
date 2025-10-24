window.addEventListener('DOMContentLoaded', async () => {
    //init
    initRPause();

    const innerNavButtons = document.querySelectorAll('.secondaryNavButton');
    innerNavButtons.forEach(button => {
        button.addEventListener('click', () =>{
            document.querySelector('.activeNavButton').classList.remove('activeNavButton');
            button.classList.add('activeNavButton');
        })
    })

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
        <div id="workTimeGrid">
            <h2>ARBETSTID</h2>                        
            <div id = "dayButtons"><h3>Välj dag:</h3></div>                   
            <canvas id="historyGraph"></canvas>
            <div id="metricInfoDiv">
                <p id="metricInfo">Här kan du se vilka tider du har jobbat aktivt, och när du tagit rast.</p>
            </div>
        </div>`
        initWorkGraph();
    })
    
    motionButton.addEventListener('click', () =>{
        initRPause();
    })
});

function initRPause(){
    contentDiv.innerHTML = `
        <div id="powerDiv">
            <img src="img/exercise.png" alt="Workout" id="exercisePic">
            <p>Här kan man få tillgång till enklare träningspass och stretchövningar som
            underlättar för kontorsarbetare</p>
        </div>`
}

              //  <button id="graphWifiButton" class="graphButton">WIFI-STYRKA</button>
              //  <button id="graphUpspeedButton" class="graphButton">UPPLADDNING</button>
              //  <button id="graphDownspeedButton" class="graphButton">NEDLADDNING</button>
              //  <button id="graphPingButton" class="graphButton">SVARSTID</button>               
              //  <button id="graphInterruptButton" class="graphButton">AVBROTT</button>