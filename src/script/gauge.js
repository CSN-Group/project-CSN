const gaugeOptions = {
    angle: 0.0,             // arc angle
    lineWidth: 1.0,         // thickness
    radiusScale: 0.8,
    pointer: {
        length: 0.6,
        strokeWidth: 0.035,
        color: '#000'
    },
    limitMax: false,
    limitMin: false,
    highDpiSupport: true,
    staticZones: [
        { strokeStyle: "#d64430", min: 0,   max: 33 },
        { strokeStyle: "#eadb73", min: 33,  max: 67 },
        { strokeStyle: "#64e45b", min: 67, max: 100 }
    ]
};

let upSpeedometerDOM;
let upSpeedometer;

let downSpeedometerDOM;
let downSpeedometer;

let downHighTresh, downLowTresh;
let upHighTresh, upLowTresh;

let wifiHighTresh, wifiLowTresh;

async function initGauges() {
    // Hårdkodat, ty electron är en mardröm.
    downHighTresh = 30;
    downLowTresh = 10;

    upHighTresh = 15;
    upLowTresh = 5;

    wifiHighTresh = 90;
    wifiLowTresh = 70;

    //Tänkt lösning, men buggar
    /*
    downHighTresh = await window.systemInfo.getGlobal('downHighTresh');
    downLowTresh = await window.systemInfo.getGlobal('downHighTresh');

    upHighTresh = await window.systemInfo.getGlobal('upHighTresh');
    upLowTresh = await window.systemInfo.getGlobal('upLowTresh');

    wifiHighTresh = await window.systemInfo.getGlobal('wifiHighTresh');
    wifiLowTresh = await window.systemInfo.getGlobal('wifiLowTresh');
     */

    upSpeedometerDOM = document.getElementById('upSpeedometer');
    upSpeedometer = new Gauge(upSpeedometerDOM).setOptions(gaugeOptions);

    downSpeedometerDOM = document.getElementById('downSpeedometer');
    downSpeedometer = new Gauge(downSpeedometerDOM).setOptions(gaugeOptions);

    upSpeedometer.maxValue = 100;
    upSpeedometer.minValue = 0;
    upSpeedometer.set(0);

    downSpeedometer.maxValue = 100;
    downSpeedometer.minValue = 0;
    downSpeedometer.set(0);
}


async function updateGauges(){
    const downspeed = await window.systemInfo.getGlobal('lastDownspeed');
    const upspeed = await window.systemInfo.getGlobal('lastUpspeed');

    downSpeedometer.set(mapSpeedToGauge(downspeed, downLowTresh, downHighTresh));
    upSpeedometer.set(mapSpeedToGauge(upspeed, upLowTresh, upHighTresh));

    const dTooltip = document.getElementById("downTooltip");
    if(downspeed > downHighTresh){
        dTooltip.innerHTML = "Hur snabbt data hämtas från internet till datorn.<br>Nedladdningshastighet: " + downspeed + " Mbps<br> Denna hastighet räcker till det mesta!";
        dTooltip.style.border = "5px solid green";
    } else if(downspeed > downLowTresh){
        dTooltip.innerHTML = "Hur snabbt data hämtas från internet till datorn.<br>Nedladdningshastighet: " + downspeed + " Mbps<br> Denna hastighet räcker till samtal med ljud.";
        dTooltip.style.border = "5px solid yellow";
    } else if(downspeed > 0){
        dTooltip.innerHTML = "Hur snabbt data hämtas från internet till datorn.<br>Nedladdningshastighet: " + downspeed + " Mbps<br> Denna hastighet är för låg för många ändamål.";
        dTooltip.style.border = "5px solid red";
    } else if(downspeed.includes("test") || downspeed.includes("Test")){
        dTooltip.innerHTML = "Nedladdningshastighet: " + "-" + " Mbps<br> Nedladdningshastigheten testas för tillfället.";
        dTooltip.style.border = "5px solid grey";
    } else{
        dTooltip.innerHTML = "Nedladdningshastighet: " + "-" + " Mbps<br> Ingen nedladdningshastighet finns.";
        dTooltip.style.border = "5px solid grey";
    }

    const uTooltip = document.getElementById("upTooltip");
    if(upspeed > upHighTresh){
        uTooltip.innerHTML = "Hur snabbt data skickas från datorn till internet.<br>Uppladdningsshastighet: " + upspeed + " Mbps<br> Denna hastighet räcker till det mesta!";
        uTooltip.style.border = "5px solid green";
    } else if(upspeed > upLowTresh){
        uTooltip.innerHTML = "Hur snabbt data skickas från datorn till internet.<br>Uppladdningsshastighet: " + upspeed + " Mbps<br> Denna hastighet räcker till samtal med ljud.";
        uTooltip.style.border = "5px solid yellow";
    } else if(upspeed > 0){
        uTooltip.innerHTML = "Hur snabbt data skickas från datorn till internet.<br>Uppladdningsshastighet: " + upspeed + " Mbps<br> Denna hastighet är för låg för många ändamål.";
        uTooltip.style.border = "5px solid red";
    } else if(upspeed.includes("test") || upspeed.includes("Test")){
        uTooltip.innerHTML = "Uppladdningsshastighet: " + "-" + " Mbps<br> Uppladdningshastigheten testas för tillfället.";
        uTooltip.style.border = "5px solid grey";
    } else{
        uTooltip.innerHTML = "Uppladdningsshastighet: " + "-" + " Mbps<br> Ingen uppladdningshastighet finns.";
        uTooltip.style.border = "5px solid grey";
    }
}

function mapSpeedToGauge(speed, lowTier, midTier) {
    if (speed <= 0) return 0;

    let gaugeValue;

    if (speed <= lowTier) {
        gaugeValue = (speed / lowTier) * 33;
    } else if (speed <= midTier) {
        const ratio = (speed - lowTier) / (midTier - lowTier);
        gaugeValue = 33 + ratio * (67 - 33);
    } else {
        const capped = Math.min(speed, 100);
        const ratio = (capped - midTier) / (100 - midTier);
        gaugeValue = 67 + ratio * (100 - 67);
    }

    //Högst 98%, så det inte ser ut som att nålen går "över"
    return Math.min(gaugeValue, 98);
}

let paths;

function initWifiDisplay() {
    paths = document.querySelectorAll('#wifiIconDiv path');
}

function setWifiBars(level) {
    paths.forEach((p, i) => {
        p.style.opacity = i < level ? 1 : 0.2;
    });
}

function setWifiColor(level) {
    const colors = ['#d32f2f', '#ffd11b', '#388e3c', '#515151'];
    const color = colors[level] || '#ccc';
    paths.forEach(p => (p.style.stroke = color));
}

async function updateWifiDisplay() {
    const wifiStr = await window.systemInfo.getGlobal('currentWifiStrength');

    let level, color;

    if(wifiStr >= 90){
        level = 4;
        color = 2;
    } else if(wifiStr >= 70){
        level = 3;
        color = 1;
    } else if(wifiStr >= 50){
        level = 2
        color = 1
    } else if(wifiStr >= 30){
        level = 1;
        color = 1;
    } else{
        level = 4;
        color = 4;
    }
    setWifiBars(level);
    setWifiColor(color);

    const currConnType = await window.systemInfo.getGlobal('currentConnectionType');

    const tooltip = document.getElementById("wifiTooltip");
    if(currConnType === "WiFi") {
        if (wifiStr >= wifiHighTresh) {
            tooltip.innerText = wifiStr + " % WiFi-styrka är bra!";
            tooltip.style.border = "5px solid green";
        } else if (wifiStr >= wifiLowTresh) {
            tooltip.innerText = wifiStr + " % WiFi-styrka kan bidra till mindre störningar.";
            tooltip.style.border = "5px solid yellow";
        } else if (wifiStr > 0) {
            tooltip.innerText = wifiStr + " % WiFi-styrka kan bidra till stora störningar.";
            tooltip.style.border = "5px solid red";
        } else{
            tooltip.innerText = wifiStr + " % WiFi-styrka - det saknas anslutning.";
            tooltip.style.border = "5px solid grey";
        }
    } else {
        tooltip.innerText = "WiFi används inte för tillfället.";
        tooltip.style.border = "5px solid grey";
    }
}
