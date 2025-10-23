let waitingForResponse = false;
let aiInitialized = false;

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

    console.log("Chat reset:", result);

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

function attachAIListeners(){
    const sendBtn = document.getElementById('send-btn');
    const resetBtn = document.getElementById('reset-btn');
    const messageInput = document.getElementById('message-input');

    sendBtn.addEventListener('click', async () => {
        await sendToAI();
    });

    resetBtn.addEventListener('click', async () => {
        await resetChat();
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) sendBtn.click();
    });
}

async function initAIAssistant() {
    const contentDiv = document.getElementById("aiSupportDisplay");
    contentDiv.innerHTML = `
        <h2>AI-assistans</h2>
        <div id="aiAssistantDiv">
            <div id="messagesDiv">
            </div>
            <div id="input-row">
                <input type="text" id="message-input" placeholder="Ställ en fråga..." />
                <button id="send-btn">Send</button>
                <button id="reset-btn">Reset</button>
            </div>
        </div>
        `;

    await loadChatHistory();
    attachAIListeners();
}

