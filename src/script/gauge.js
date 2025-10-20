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

    downSpeedometer.set(mapSpeedToGauge(downspeed, 8, 20));
    upSpeedometer.set(mapSpeedToGauge(upspeed, 4, 10));
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

    // ✅ Never let the gauge go above 98 (for visual breathing room)
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

    if(wifiStr > 90){
        level = 4;
        color = 2;
    } else if(wifiStr > 70){
        level = 3;
        color = 1;
    } else if(wifiStr > 50){
        level = 2
        color = 1
    } else if(wifiStr > 30){
        level = 1;
        color = 1;
    } else{
        level = 1;
        color = 4;
    }
    setWifiBars(level);
    setWifiColor(color);

    const tooltip = document.getElementById("wifiTooltip");
    tooltip.innerText = "Wifi strength: " + wifiStr + "% är jättebra/jättedåligt";
}
