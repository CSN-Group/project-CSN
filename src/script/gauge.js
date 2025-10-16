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


function initGauges() {
    /*
    upSpeedometerDOM = document.getElementById('upSpeedometer');
    upSpeedometer = new Gauge(upSpeedometerDOM).setOptions(gaugeOptions);

    downSpeedometerDOM = document.getElementById('downSpeedometer');
    downSpeedometer = new Gauge(downSpeedometerDOM).setOptions(gaugeOptions);

    upSpeedometer.maxValue = 100;
    //upSpeedometer.setMinValue(0);
    upSpeedometer.minValue = 0;
    upSpeedometer.set(0);

    downSpeedometer.maxValue = 100;
    downSpeedometer.minValue = 0;
    downSpeedometer.set(0);
     */
}


async function updateGauges(){
    /*
    const downspeed = await window.systemInfo.getGlobal('lastDownspeed');
    const upspeed = await window.systemInfo.getGlobal('lastUpspeed');

    downSpeedometer.set(downspeed);
    upSpeedometer.set(upspeed);
     */
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
    const colors = ['#d32f2f', '#f57c00', '#388e3c', '#707070'];
    const color = colors[level] || '#ccc';
    paths.forEach(p => (p.style.stroke = color));
}

let currentLevel = 0;
let currentColor = 0;

async function updateWifiDisplay(level, color) {
    setWifiBars(currentLevel);
    setWifiColor(currentColor);

    if (currentLevel === 4) {
        currentLevel = 0;
        if (currentColor === 3) {
            currentColor = 0;
        } else currentColor++;
    } else currentLevel++;

    const tooltip = document.getElementById("wifiTooltip");
    const wifiStr = await window.systemInfo.getGlobal("currentWifiStrength");
    tooltip.innerText = "Wifi strength: " + wifiStr + "% är jättebra/jättedåligt";
}
