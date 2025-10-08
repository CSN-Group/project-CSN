const opts = {
    angle: 0.15,             // arc angle
    lineWidth: 0.44,         // thickness
    radiusScale: 1.0,
    pointer: {
        length: 0.6,
        strokeWidth: 0.035,
        color: '#000'
    },
    limitMax: false,
    limitMin: false,
    highDpiSupport: true
};

const target = document.getElementById('speedometer');
const gauge = new Gauge(target).setOptions(opts);

function initGauges() {
    gauge.maxValue = 100;
    gauge.setMinValue(0);
    gauge.set(0); // initial value
}

async function updateGauges(){
    console.log("Updating comp restart info...");
    const restartContainer = document.getElementById("restartInfo");

    const runTimeHrs = formatTime(await window.systemInfo.getGlobal("compOnTimeHours"));
    restartContainer.innerText = `Computer been running for ${runTimeHrs} hours`;
}

// Example update
setInterval(() => {
    const speed = Math.floor(Math.random() * 100);
    gauge.set(speed);
}, 1000);
