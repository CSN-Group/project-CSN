

function generateActionList() {
    const list = [];

    if (globals['currentIP'] !== "No valid IP") {
        list.push("You have a valid IP!");
    }

    return list;
}

function createAction(id, severity, textContent, dismissable = false, sleepTime = 0) {
    return {
        id,
        severity,
        textContent,
        sleepTime
    };
}

module.exports = {generateActionList};