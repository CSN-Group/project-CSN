let pingLowTresh, pingHighTresh;

// Get date
function formatDate(timestamp){
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('sv-SE');
}
//Get time
function formatTime(timestamp){
    const updTime = new Date(Number(timestamp));
    const options = {
        hour: '2-digit',
        minute: '2-digit'
    }
    return updTime.toLocaleString('sv-SE', options);
}

function setSpeedtestButtonState(currentlyTesting){
    const speedtestButton = document.getElementById("runSpeedtestButton");
    if(currentlyTesting){
        speedtestButton.innerText = "MÄTNING UTFÖRS";
        speedtestButton.style.backgroundColor = "#343434";
    } else{
        speedtestButton.innerText = "MÄT NU";
        speedtestButton.style.backgroundColor = "#707070";
    }
}

function timeSince(timestamp) {
    const now = new Date();
    const past = new Date(Number(timestamp));
    const diff = Math.floor((now - past) / 1000);
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days} dag ${hours} timme ${minutes} minuter sedan`;
    if (hours > 0) return `${hours} timme ${minutes} minuter sedan`;
    return `${minutes} minuter sedan`;
}



function isNumericTimestamp(value) {
    return (
        (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(value))) &&
        !isNaN(new Date(Number(value)).getTime())
    );
}

async function updateNetwork(){
    const connType = await window.systemInfo.getGlobal('currentConnectionType');

    const wifiText = document.getElementById("wifiText");
    const ethText = document.getElementById("ethernetText");
    const conntedBy = document.getElementById("telConnTyp");

    const ethImage = document.getElementById("ethernetIcon");

    if(connType === "WiFi"){
        await updateWifiDisplay();

        wifiText.innerText = await window.systemInfo.getGlobal("currentWifiStrength") + "%";

        ethText.innerText = "EJ ANSLUTEN";
        conntedBy.innerText = "Ditt nätverk är anslutet via Wifi!";
        ethImage.src = "img/ethernet_trans.png";
        ethImage.style.opacity = "0.3";
    } else if(connType === "Ethernet"){
        ethText.innerText = "ANSLUTEN";
        conntedBy.innerText = "Ditt nätverk är anslutet via Kabel!";
        ethText.innerHTML = "<b>ANSLUTEN</b>"

        ethImage.src = "img/greenEthernet_trans.png"
        ethImage.style.opacity = "1";

        wifiText.innerText = "EJ WIFI";

        await updateWifiDisplay();
    } else{
        await updateWifiDisplay();
        conntedBy.innerText = "Ditt nätverk är anslutet via "+ connType;

        wifiText.innerText = "EJ WIFI";

        ethText.innerText = "EJ ANSLUTEN";
        ethImage.src = "img/ethernet_trans.png"
        ethImage.style.opacity = "0.3";
    }

    const speedtestTextDOM = document.getElementById('lastUpdatedText');
    const speedtestTextValue = await window.systemInfo.getGlobal('speedtestText');
    let speedText;
   
    if(isNumericTimestamp(speedtestTextValue)) {
        const updateDate = formatDate(speedtestTextValue);
        const updateTime = formatTime(speedtestTextValue);
        const updateSince = timeSince(speedtestTextValue);
        speedText = ` ${updateDate} ${updateTime} \n ${updateSince}`;

        setSpeedtestButtonState(false);

    } else {
        speedText = speedtestTextValue;
        setSpeedtestButtonState(true);
    }

    speedtestTextDOM.innerText = speedText; 

    const downSpeed = await window.systemInfo.getGlobal("lastDownspeed");
    const upSpeed = await window.systemInfo.getGlobal("lastUpspeed");

    const downDiv = document.getElementById('downloadValue');
    const upDiv = document.getElementById('uploadValue');

    if(downSpeed > 0 && upSpeed > 0){
        downDiv.innerText = downSpeed + " Mb/s";
        upDiv.innerText = upSpeed + " Mb/s"
    } else{
        downDiv.innerText = "Testar...";
        upDiv.innerText = "Testar...";
    }

    const pingValue = document.getElementById('pingValue');
    const currentPing = await window.systemInfo.getGlobal('lastPing');
    pingValue.innerText = currentPing;

    const level = document.getElementById('ping-level');
    const percent = calculatePingWidth(currentPing);
    level.style.width = `${percent}%`

    const pingTooltip = document.getElementById("pingTooltip");

    if(currentPing < pingLowTresh){
        pingTooltip.innerHTML = "Hur lång tid det tar för en signal att<br>resa till en server och tillbaka.<br>Ping: " + currentPing + " ms<br> Denna ping är bra!";
        pingTooltip.style.border = "5px solid green";
    } else if(currentPing >= upLowTresh && currentPing < pingHighTresh){
        pingTooltip.innerHTML = "Hur lång tid det tar för en signal att<br>resa till en server och tillbaka.<br>Ping: " + currentPing + " ms<br> Denna ping kan bidra till störningar.";
        pingTooltip.style.border = "5px solid yellow";
    } else if(currentPing > pingHighTresh){
        pingTooltip.innerHTML = "Hur lång tid det tar för en signal att<br>resa till en server och tillbaka.<br>Ping: " + currentPing + " ms<br> Denna ping kan bidra till stora störningar.";
        pingTooltip.style.border = "5px solid red";
    } else if(currentPing.includes("test") || currentPing.includes("Test")){
        pingTooltip.innerHTML = "Ping: " + "-" + " ms<br> Din ping testas för tillfället...";
        pingTooltip.style.border = "5px solid grey";
    } else{
        pingTooltip.innerHTML = "currentPing: " + "-" + " ms<br> Ingen ping är förmodligen inte så bra...";
        pingTooltip.style.border = "5px solid grey";
    }
}

function calculatePingWidth(ping) {
    if(ping < pingLowTresh) return 85;
    if(ping >= pingLowTresh && ping < pingHighTresh) return 45;
    if(ping.includes("test") || ping.includes("Test") || ping === "-") return 0;
    return 15;
}

async function initNetworkInfo() {
    // Hårdkodat, ty electron är en mardröm.
    pingLowTresh = 15;
    pingHighTresh = 30;

    document.getElementById('runSpeedtestButton').addEventListener(
        'click',
        await window.systemInfo.runSpeedtest);
}