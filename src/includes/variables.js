const globals = {
    currentIP: "No valid IP",
    currentConnectionType: "Unknown",
    compOnTimeHours: 0,
    currentlySpeedtesting: false,
    currentWifiStrength: 0,

    //last speedtest
    lastDownspeed: 0.0,
    lastUpspeed: 0.0,
    lastPing: 0
}

let shouldUpdateActionList = false;

function getGlobal(key){
    if (key in globals) {
        return globals[key];
    } else {
        throw new Error(`Global key "${key}" does not exist.`);
    }
}

function setGlobal(key, value){
    if (!(key in globals)) {
        throw new Error(`Global key "${key}" does not exist.`);
    }

    const oldValue = globals[key];
    if (oldValue !== value) {
        globals[key] = value;
        shouldUpdateActionList = true; // mark dirty
    }
}
module.exports = {globals, getGlobal, setGlobal};