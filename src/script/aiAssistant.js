let waitingForResponse = false;
const initialMessage = "Hej! Jag är Herman Hemhjälpare. Du kan ställa dina frågor till mig. Jag känner till dina mätvärden och kan allt om dokumentationen!";

function addMessage(content, role) {
    if(role === 'system') return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'user-message' : 'assistant-message');

    msgDiv.textContent = content;

    if (role === 'assistant') {
        const avatar = document.createElement('img');
        avatar.src = 'img/herman.webp';
        avatar.alt = 'AI assistant avatar';
        avatar.style.width = '40px';
        avatar.style.height = '40px';
        avatar.classList.add('assistant-anchor');
        msgDiv.appendChild(avatar);
    }

    const messagesDiv = document.getElementById('messagesDiv');
    messagesDiv.appendChild(msgDiv);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function resetChat() {
    const result = await window.systemInfo.resetChat();
    const messagesDiv = document.getElementById('messagesDiv');
    messagesDiv.innerHTML = '';

    if(result) addMessage(initialMessage, "assistant");
}

async function loadChatHistory() {
    const history = await window.systemInfo.getChatHistory();
    const messagesDiv = document.getElementById('messagesDiv');

    addMessage(initialMessage, "assistant");

    history.forEach(msg => {
        addMessage(msg.content, msg.role);
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
        <h2>AI-ASSISTANS</h2>
        <div id="aiAssistantDiv">
            <div id="messagesDiv"></div>
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

