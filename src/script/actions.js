const actionList = {};

function initiateList(){
    const list = document.getElementById("actionList");

    list.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            event.target.remove();
        }
    });
}

function addActionItem(text){
    const list = document.getElementById("actionList");

    const newItem = document.createElement("li");
    newItem.textContent = text;
    list.appendChild(newItem);
}
function updateActionList(){
    const globals = window.systemInfo.getGlobals();

    const IP = globals["currentIP"];
    if(IP !== "No valid IP") addActionItem("You have a valid IP!");
}