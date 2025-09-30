export async function run() {
            
    const pcNameElement = document.getElementById("hermansRestingPlace");
    
        pcNameElement.innerText = window.systemInfo.getPcName();

}