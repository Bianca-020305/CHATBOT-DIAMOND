// =========================
// CONFIGURATION
// =========================
let _config = {
    openAI_apikey: "", 
    openAI_api: "https://api.openai.com/v1/responses",
    openAI_model: "gpt-4o-mini",
    ai_instruction: `
        You are a friend who give advice.
    `,
    response_id: ""
};

// =========================
// SEND MESSAGE
// =========================
async function sendOpenAIRequest(text) {

    let requestBody = {
        model: _config.openAI_model,
        input: text,
        instructions: _config.ai_instruction,
        previous_response_id: _config.response_id
    };

    if (_config.response_id.length === 0) {
        requestBody = {
            model: _config.openAI_model,
            input: text,
            instructions: _config.ai_instruction
        };
    }

    try {
        const response = await fetch(_config.openAI_api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${_config.openAI_apikey}`
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        let output = data.output[0].content[0].text;
        _config.response_id = data.id;

        return output;

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
}

// =========================
// UI ELEMENTS
// =========================
const inputBox = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const messageArea = document.getElementById("messages");

// =========================
// ADD MESSAGE
// =========================
function addMessage(sender, html) {
    const div = document.createElement("div");
    div.className = sender === "user" ? "msg me" : "msg bot"; 
    div.innerHTML = html;
    messageArea.appendChild(div);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// =========================
// HANDLE SEND
// =========================
async function handleSend() {
    let text = inputBox.textContent.trim(); // FIXED

    if (text === "") return;

    addMessage("user", `<p>${text}</p>`);

    inputBox.textContent = ""; // clear input

    addMessage("bot", `<p><em>Typing...</em></p>`);

    try {
        const reply = await sendOpenAIRequest(text);
        messageArea.lastChild.innerHTML = reply;

    } catch {
        messageArea.lastChild.innerHTML = `<p>Error processing message.</p>`;
    }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener("click", handleSend);

inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
    }
});
