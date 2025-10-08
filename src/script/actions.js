const DOMList = document.getElementById("actionList");
function initActionList(){
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

function updateActionList(list){
    clearList();

    list.forEach(item => {
        addActionItem(item);
    });
}


