let DOMTechList;
let DOMSoftList;

let actionList = [];
function initActionList(){
    DOMTechList = document.getElementById("techActionsList");
    DOMSoftList = document.getElementById("softActionsList");
}

function getImage(imageString){
    switch (imageString){
        case "error": return "img/redGuard.png"
        default: return "img/teleIcon.png";
    }
}

function getActionItem(itemObject){
    const newItem = document.createElement("li");
    newItem.className = "actionItem";

    //ICON
    const img = document.createElement("img");
    img.className = "actionIcon";
    img.src = getImage(itemObject.severity);
    newItem.appendChild(img);

    //TEXT
    const textSpan = document.createElement("span");
    textSpan.className = "actionText";
    textSpan.textContent = itemObject.text;

    newItem.appendChild(textSpan);

    //CHECKBOX
    if(itemObject.dismissable){
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "actionCheckbox";

        newItem.appendChild(checkbox);

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                newItem.classList.add("fadeOut");

                setTimeout(() => {
                    newItem.remove();
                    window.updates.dismissAction(itemObject.id, itemObject.sleepDuration);
                }, 300);
            }
        });
    }

    return newItem;
}

function clearList(){
    DOMTechList.innerHTML = '';
    DOMSoftList.innerHTML = '';
}

function updateActionList(list){
    clearList();

    list.forEach(itemObject => {
        const DOMItem = getActionItem(itemObject);

        if(itemObject.isTechnical) DOMTechList.appendChild(DOMItem);
        else DOMSoftList.appendChild(DOMItem);
    });
}


