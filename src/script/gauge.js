const opts = {
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

const target = document.getElementById('speedometer');
const gauge = new Gauge(target).setOptions(opts);

function initGauges() {
    gauge.maxValue = 100;
    gauge.setMinValue(0);
    gauge.set(0);
}

function initWifiDisplay() {
    paths = document.querySelectorAll('#wifiIconDiv path');
}

async function updateGauges(){
    const speed = await window.systemInfo.getGlobal('currentWifiStrength');
    gauge.set(speed);
}

let paths;

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
