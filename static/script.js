const messages = document.getElementById('messages');
const conversation = document.getElementById('conversation');
let displayUpdated = false;

const chatHistoryGlobal = [];

async function chat(promptValue, chatHistory) {
    try {
        const response = await fetch('/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({prompt: promptValue, history: chatHistory})  
        });
        const data = await response.json();

        if (!response.ok) {
            return {response: data.detail || 'An error occurred.'};
        }

        return data;
    } catch (error) {
        return {response: 'Could not connect to the server. Please try again later.'};
    }
}
document.getElementById('chat-button').addEventListener('click', async () => {
    if (!displayUpdated) {
        conversation.style.display = 'block';
    }

    const prompt = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = '';
    chatHistoryGlobal.push({"role": "user", "content": prompt});
    
    const msg = document.createElement('div');
    msg.className = 'user-message';
    msg.innerText = prompt;
    messages.appendChild(msg);
    
    const bot_msg = document.createElement('div');
    bot_msg.className = 'bot-message';
    bot_msg.innerText = 'Thinking...';
    messages.appendChild(bot_msg);
    
    const response = await chat(prompt, chatHistoryGlobal.slice(-10));
    bot_msg.innerText = response.response;
    chatHistoryGlobal.push({"role": "assistant", "content": response.response});
});
document.getElementById('chat-input').addEventListener('keydown', async (e) => {
    if (e.key == 'Enter') {
        if (!displayUpdated) {
            conversation.style.display = 'block';
        }
        
        e.preventDefault();
        const prompt = document.getElementById('chat-input').value;
        document.getElementById('chat-input').value = '';
        chatHistoryGlobal.push({"role": "user", "content": prompt});
        
        const msg = document.createElement('div');
        msg.className = 'user-message';
        msg.innerText = prompt;
        messages.appendChild(msg);
        
        const bot_msg = document.createElement('div');
        bot_msg.className = 'bot-message';
        bot_msg.innerText = 'Thinking...';
        messages.appendChild(bot_msg);
        
        const response = await chat(prompt, chatHistoryGlobal.slice(-10));
        bot_msg.innerText = response.response;
        chatHistoryGlobal.push({"role": "assistant", "content": response.response});
    }
});