const os = require('os');
const dgram = require('dgram');
const util = require("util");
const {exec} = require("child_process");
const execProm = util.promisify(exec);

function isInterfaceActive(ip) {
    const nets = os.networkInterfaces();
    for (const [name, addrs] of Object.entries(nets)) {
        if (addrs.some(net => net.address === ip && net.family === 'IPv4' && !net.internal)) {
            return true;
        }
    }
    return false;
}

async function updateCurrentInterface() {
    return new Promise((resolve) => {
        try {
            const socket = dgram.createSocket('udp4');

            socket.on('error', (err) => {
                console.error('Socket error in updateCurrentInterface:', err);
                socket.close();
                resolve({ address: null, name: null });
            });

            socket.connect(1337, '8.8.8.8', () => {
                let address = null;
                if (socket.address() && socket.address().address) {
                    address = socket.address().address;
                }
                socket.close();

                let name = null;

                if (address) {
                    try {
                        const nets = os.networkInterfaces();
                        for (const ifaceName of Object.keys(nets)) {
                            for (const net of nets[ifaceName]) {
                                if (net.family === 'IPv4' && net.address === address) {
                                    name = ifaceName;
                                    break;
                                }
                            }
                            if (name) break;
                        }
                    } catch (err) {
                        console.error('Error while reading network interfaces:', err);
                    }
                }

                resolve({ address, name });
            });
        } catch (err) {
            console.error('Unexpected error in updateCurrentInterface:', err);
            resolve({ address: null, name: null });
        }
    });
}

async function getInterfaceByIP(ip) {
    if (!ip) throw new Error("IP address is required.");

    const psScript = `
$results = @()
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=TRUE" | ForEach-Object {
    $adapter = $null
    try {
        $adapter = Get-CimInstance -Namespace root/StandardCimv2 -ClassName MSFT_NetAdapter -Filter "InterfaceIndex=$($_.InterfaceIndex)" -ErrorAction Stop
    } catch {
        $adapter = Get-CimInstance Win32_NetworkAdapter -Filter "InterfaceIndex=$($_.InterfaceIndex)" -ErrorAction SilentlyContinue
    }
    $ifType = $adapter.ifType
    if (-not $ifType -and $adapter.InterfaceType) { $ifType = $adapter.InterfaceType }

    foreach ($addr in $_.IPAddress) {
        if ($addr -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$') {
            $results += [PSCustomObject]@{
                Name = $adapter.NetConnectionID
                IPv4 = $addr
                IfType = $ifType
                mac = $_.MACAddress
            }
        }
    }
}
$match = $results | Where-Object { $_.IPv4 -eq '${ip}' }
if ($match) { $match | ConvertTo-Json -Compress } else { $null | ConvertTo-Json }
`;

    // Encode to base64 to safely pass multi-line script
    const psBase64 = Buffer.from(psScript, 'utf16le').toString('base64');

    const { stdout } = await execProm(`powershell -NoProfile -EncodedCommand ${psBase64}`);

    if (!stdout.trim() || stdout.trim() === "null") return null;
    return JSON.parse(stdout);
}

async function getWifiInfo() {
    try {
        const { stdout } = await execProm("netsh wlan show interfaces");
        const ssidMatch = stdout.match(/^\s*SSID\s*:\s*(.+)$/m);
        const signalMatch = stdout.match(/^\s*Signal\s*:\s*(\d+)%/m);

        if (!ssidMatch || !signalMatch) return null;

        return {
            ssid: ssidMatch[1].trim(),
            strength: parseInt(signalMatch[1], 10)
        };
    } catch (err) {
        return null;
    }
}

module.exports = {updateCurrentInterface, getInterfaceByIP, getWifiInfo, isInterfaceActive};