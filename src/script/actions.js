const DOMList = document.getElementById("actionList");
function initiateList(){
    DOMList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            event.target.remove();
        }
    });
}

function addActionItem(text){
    const newItem = document.createElement("li");
    newItem.textContent = text;
    DOMList.appendChild(newItem);
}

function clearList(){
    DOMList.innerHTML = '';
}

function updateActionList(){
    clearList();

    const IP = globals["currentIP"];
    if(IP !== "No valid IP") addActionItem("You have a valid IP!");
    if(globals["currentConnectionType"] !== "wired") addActionItem("Anslut kabel fo hevede");
}


