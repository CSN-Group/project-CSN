const OpenAI = require("openai");

let chatHistory = [];
const API_KEY = "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";
const MESSAGE_LIMIT = 100;

function resetChat() {
    chatHistory.splice(0, chatHistory.length);
}

async function askAI(userMessage, systemData, documentData) {
    const systemPrompt =
        "You are a helpful technical assistant named Herman. Keep responses brief.\n\nSystem info:\n" +
        Object.entries(systemData)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

    chatHistory.push({ role: "user", content: userMessage });

    const fullMessage = [
        { role: "system", content: systemPrompt },
        { role: "system", content: "Documentation specifically provided to the user:\n" + documentData },
        ...chatHistory
    ];

    if(chatHistory.length < MESSAGE_LIMIT) {
        const client = new OpenAI({apiKey: API_KEY});

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: fullMessage,
            temperature: 0.4
        });

        const assistantMessage = completion.choices[0].message.content;
        chatHistory.push({role: "assistant", content: assistantMessage});

        return assistantMessage;
    } else {
        const errorMsg = "Message limit reached. Please reset the chat.";
        chatHistory.push({ role: "assistant", content: errorMsg});
        return errorMsg;
    }
}

module.exports = {resetChat, askAI, chatHistory}