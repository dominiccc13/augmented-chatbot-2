const messages = document.getElementById('messages');
let displayUpdated = false;
const chatHistoryGlobal = [];
let thinkingState = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function thinking() {
    const botMsgs = document.querySelectorAll('.bot-message');
    const botMsg = botMsgs[botMsgs.length - 1];

    while (thinkingState) {
        if (botMsg.innerText === 'Thinking...') botMsg.innerText = 'Thinking';
        else botMsg.innerText += '.';
        
        await sleep(500);
    }
}

async function chat(promptValue, chatHistory) {
    try {
        const response = await fetch('/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({prompt: promptValue, history: chatHistory})  
        });

        if (!response.ok) return 'Error connecting to server.';

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        thinkingState = true;
        thinking();

        while (true) {
            const { done, value } = await reader.read();
            if (done) { thinkingState = false; break };

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

            const botMessages = document.querySelectorAll('.bot-message');
            botMessages[botMessages.length - 1].innerText = fullText;
        }

        return {response: fullText};
    } catch (error) {
        return {response: error};
    }
}
document.getElementById('chat-button').addEventListener('click', async () => {
    const prompt = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = '';
    document.getElementById('chat-input').disabled = true;
    chatHistoryGlobal.push({"role": "user", "content": prompt});
    
    const msg = document.createElement('div');
    msg.className = 'user-message';
    msg.innerText = prompt;
    messages.appendChild(msg);
    
    const bot_msg = document.createElement('div');
    bot_msg.className = 'bot-message';
    bot_msg.innerText = 'Thinking...';
    messages.appendChild(bot_msg);
    
    const response = await chat(prompt, chatHistoryGlobal.slice(-6));
    // bot_msg.innerText = response.response;
    document.getElementById('chat-input').disabled = false;
    chatHistoryGlobal.push({"role": "assistant", "content": response.response});
});
document.getElementById('chat-input').addEventListener('keydown', async (e) => {
    if (e.key == 'Enter' && !document.getElementById('chat-input').disabled) {
        e.preventDefault();
        const prompt = document.getElementById('chat-input').value;
        document.getElementById('chat-input').value = '';
        document.getElementById('chat-input').disabled = true;
        chatHistoryGlobal.push({"role": "user", "content": prompt});
        
        const msg = document.createElement('div');
        msg.className = 'user-message';
        msg.innerText = prompt;
        messages.appendChild(msg);
        
        const bot_msg = document.createElement('div');
        bot_msg.className = 'bot-message';
        bot_msg.innerText = 'Thinking...';
        messages.appendChild(bot_msg);
        
        const response = await chat(prompt, chatHistoryGlobal.slice(-6));
        // bot_msg.innerText = response.response;
        document.getElementById('chat-input').disabled = false;
        chatHistoryGlobal.push({"role": "assistant", "content": response.response});
    }
});