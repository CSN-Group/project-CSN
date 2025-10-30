const OpenAI = require("openai");
const {encoding_for_model} = require("tiktoken");
const model = "gpt-4o-mini";

const enc = encoding_for_model(model);
const TOKEN_LIMIT = 16384;
const MESSAGE_LIMIT = 50;

let chatHistory = [];
let API_KEY;

function initOpenAI(KEY){
    API_KEY = KEY;
}
function resetChat() {
    chatHistory.splice(0, chatHistory.length);
}

function countTokens(messages) {
    return messages.reduce((sum, msg) => sum + enc.encode(msg.content).length, 0);
}

async function askAI(userMessage, systemData, documentData) {
    const systemPrompt = "You are a helpful technical assistant named Herman. " +
        "Keep responses brief if possible. Answer in swedish by default, UNLESS the user uses another language, " +
        "then answer in that language instead. Make sure to properly format longer answers," +
        " and don't use any emote icons." +
        "Please provide answers with additional spacing between items in lists for better readability." +
        "\n\nSystem info:\n" +
        Object.entries(systemData)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

    chatHistory.push({ role: "user", content: userMessage });

    const fullMessage = [
        { role: "system", content: systemPrompt },
        { role: "system", content: "Documentation specifically provided to the user:\n" + documentData },
        ...chatHistory
    ];

    const totalTokens = countTokens(fullMessage);

    if(chatHistory.length < MESSAGE_LIMIT && totalTokens < TOKEN_LIMIT) {
        const client = new OpenAI({apiKey: API_KEY});

        const completion = await client.chat.completions.create({
            model: model,
            messages: fullMessage,
            temperature: 0.4
        });

        const assistantMessage = completion.choices[0].message.content;
        chatHistory.push({role: "assistant", content: assistantMessage});

        return assistantMessage;
    } else {
        const errorMsg = "Token or message limit reached. Please reset the chat.";
        chatHistory.push({ role: "assistant", content: errorMsg});
        return errorMsg;
    }
}

module.exports = {initOpenAI, resetChat, askAI, chatHistory}