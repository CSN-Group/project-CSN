let DOMTechList;
let DOMSoftList;

let actionList = [];
function initActionList(){
    DOMTechList = document.getElementById("techActionsList");
    DOMSoftList = document.getElementById("softActionsList");
}

function getImage(imageString){
    switch (imageString){
        case "notice":
            return "img/blueGuard.png";
        case "light-error":
            return "img/yellowGuard.png";
        case "error":
            return "img/redGuard.png";
        case "check":
            return "img/check.png"
        case "break":
            return "img/fikaIcon.png"
        default:
             return "img/testIcon.png";
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
                if(itemObject.id === "social"){
                    changeSocialStatus();
                }

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

async function changeSocialStatus(){
    if(await window.systemInfo.getGlobal('socialCheck')){
        window.systemInfo.setGlobal('socialCheck', false);
    }
    else{
        window.systemInfo.setGlobal('socialCheck', true);
    }
}


