export async function run() {
            
    const pcNameElement = document.getElementById("compInfo");
    
        pcNameElement.innerText = window.systemInfo.getPcName();

}