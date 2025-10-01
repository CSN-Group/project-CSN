export async function run() {
    let div = document.getElementById("networkInfo");
    let futureDivText = "";


    async function updateNetwork() {
        await (async () => {
            const iface = await window.systemInfo.getCurrentInterface();

            let currentIP = iface.address;

            if(currentIP != null) window.systemInfo.setGlobal('currentIP', currentIP);
            else window.systemInfo.setGlobal('currentIP', "No valid IP");

            futureDivText = "IP: " + currentIP;
            futureDivText += "\nName: " + iface.name;
        })();

        let iface = await window.systemInfo.getInterfaceByIP(window.systemInfo.getGlobal('currentIP'));

        window.systemInfo.setGlobal('currentConnectionType', iface.type);

        futureDivText += "\nConnection: ";

        if(iface.type === 'ethernet' || iface.type === 'wired') {
            futureDivText += "Cable connected (Ethernet)"
        } else if(iface.type === 'wifi'){
            futureDivText += "Wi-Fi"
        } else futureDivText += iface.type;

        futureDivText += "\nInterface status: " + iface.operstate;

        div.innerText = futureDivText;
    }

    await updateNetwork();
    setInterval(updateNetwork, 10000);

}