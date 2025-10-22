let waitingForResponse = false;

function addMessage(content, role) {
    if(role === 'system') return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'user-message' : 'assistant-message');

    msgDiv.textContent = content;

    const messagesDiv = document.getElementById('messagesDiv');
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function resetChat() {
    const result = await window.systemInfo.resetChat();

    if(result) {
        const messagesDiv = document.getElementById('messagesDiv');
        messagesDiv.innerHTML = '';
    }
}

async function loadChatHistory() {
    const history = await window.systemInfo.getChatHistory();
    const messagesDiv = document.getElementById('messagesDiv');

    messagesDiv.innerHTML = '';

    history.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', msg.role === 'user' ? 'user-message' : 'assistant-message');
        msgDiv.textContent = msg.content;
        messagesDiv.appendChild(msgDiv);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendToAI() {
    const messageInput = document.getElementById('message-input');

    const text = messageInput.value.trim();
    if (!text || waitingForResponse) return;

    addMessage(text, 'user');
    messageInput.value = '';

    waitingForResponse = true;
    const reply = await window.systemInfo.askAI(text);
    waitingForResponse = false;

    addMessage(reply, 'assistant');
}

function initAIAssistant() {
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.innerHTML = `
        <div id="aiAssistantDiv">
            <div id="messagesDiv">
                <div class="message user-message">Hi there!</div>
                <div class="message assistant-message">Hello! How can I help you today? Also this is a very very very very very very very very very very very very very very very long message.</div>
                <div class="message user-message">Can you tell me a short joke?  Also this is a very very very very very very very very very very very very very very very long message.</div>
                <div class="message assistant-message">Why did the computer go to the doctor? Because it caught a virus!</div>
            </div>
            <div id="input-row">
                <input type="text" id="message-input" placeholder="Type a message..." />
                <button id="send-btn">Send</button>
                <button id="reset-btn">Reset</button>
            </div>
        </div>
        `
}

