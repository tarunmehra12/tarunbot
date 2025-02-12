// Chat Elements
const chatContent = document.getElementById('chat-content');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');
const suggestionsContainer = document.querySelector('.suggestions-container');

// Set initial chat container height
function adjustChatContainerHeight() {
    const windowHeight = window.innerHeight;
    const inputContainer = document.querySelector('.input-container');
    const mainHeader = document.querySelector('.main-header');
    const headerHeight = mainHeader ? mainHeader.offsetHeight : 0;
    const inputHeight = inputContainer ? inputContainer.offsetHeight : 0;
    const chatHeight = windowHeight - headerHeight - inputHeight - 40; // 40px for padding
    chatContent.style.height = `${chatHeight}px`;
    chatContent.style.maxHeight = `${chatHeight}px`;
}

// Call on load and resize
window.addEventListener('load', adjustChatContainerHeight);
window.addEventListener('resize', adjustChatContainerHeight);

// Function to scroll to bottom smoothly
function scrollToBottom() {
    const scrollHeight = chatContent.scrollHeight;
    chatContent.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
    });
}

// Assistant details/prompt
const assistantDetails = `You are Tarun's AI Assistant, an IT Learning Assistant 🤖. Your role is to help users understand IT and computer concepts. When responding:
1. 📚 Use simple language and avoid technical jargon unless necessary
2. 🌟 Provide real-world examples
3. 🔍 Break down complex topics into smaller parts
4. 🎯 Be friendly and encouraging
5. 💡 Focus on practical applications
6. 📝 Give step-by-step explanations
7. 🎨 Use analogies to explain technical concepts
8. ✨ Be honest if you're not sure about something

Always format important concepts as headings using markdown (e.g., "# Main Topic", "## Subtopic").
Use emojis to make the content more engaging and easier to scan.
Structure responses with clear sections and bullet points.`;

// Function to create and append a message
function createMessage(text, isUser = false) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Split text into paragraphs and handle markdown/formatting
    const paragraphs = text.split('\n');
    paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
            const p = document.createElement('p');
            
            // Handle markdown headings
            if (paragraph.startsWith('# ')) {
                const h1 = document.createElement('h1');
                h1.textContent = paragraph.substring(2);
                messageContent.appendChild(h1);
            } else if (paragraph.startsWith('## ')) {
                const h2 = document.createElement('h2');
                h2.textContent = paragraph.substring(3);
                messageContent.appendChild(h2);
            } else if (paragraph.startsWith('### ')) {
                const h3 = document.createElement('h3');
                h3.textContent = paragraph.substring(4);
                messageContent.appendChild(h3);
            } else {
                p.textContent = paragraph;
                messageContent.appendChild(p);
            }
            
            // Add spacing between paragraphs
            if (index < paragraphs.length - 1) {
                messageContent.appendChild(document.createElement('br'));
            }
        }
    });
    
    messageDiv.appendChild(messageContent);
    messageGroup.appendChild(messageDiv);
    chatContent.appendChild(messageGroup);
    
    // Scroll to bottom with animation
    scrollToBottom();
}

// Function to get response from API
async function getAIResponse(userMessage) {
    try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `${assistantDetails}\nUser: ${userMessage}\nAssistant: Let me help you understand this.`
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.status === "success" && data.text) {
            // Clean up the response text
            let cleanResponse = data.text;
            // Remove any "Assistant:" or similar prefixes
            cleanResponse = cleanResponse.replace(/^(Assistant|Tarun|AI):\s*/i, '');
            return cleanResponse;
        } else {
            return "I apologize, but I'm having trouble processing your request. Please try again.";
        }
    } catch (error) {
        console.error('Error:', error);
        return 'I apologize, but I encountered an error. Please try again later.';
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Disable input while processing
    const submitButton = chatForm.querySelector('button');
    submitButton.disabled = true;
    userInput.disabled = true;
    
    // Display user message
    createMessage(message, true);
    userInput.value = '';
    
    // Hide suggestions permanently
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.remove(); // Completely remove from DOM
    }
    
    try {
        // Show typing indicator
        const typingGroup = document.createElement('div');
        typingGroup.className = 'message-group';
        typingGroup.innerHTML = `
            <div class="bot-message">
                <div class="message-content typing-indicator">
                    Thinking...
                </div>
            </div>
        `;
        chatContent.appendChild(typingGroup);
        scrollToBottom();
        
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator
        chatContent.removeChild(typingGroup);
        
        // Display AI response
        createMessage(response, false);
        
    } catch (error) {
        console.error('Error:', error);
        createMessage('I apologize, but I encountered an error. Please try again.', false);
    } finally {
        // Re-enable input
        submitButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
});

// Handle suggestion card clicks
document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', async () => {
        const prompt = card.getAttribute('data-prompt');
        if (!prompt) return;
        
        userInput.value = prompt;
        userInput.focus();
        
        // Automatically submit the form
        chatForm.dispatchEvent(new Event('submit'));
    });
});

// Add typing indicator styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .typing-indicator {
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .typing-indicator::after {
        content: "...";
        animation: typing 1.5s infinite;
    }
    @keyframes typing {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
    }
`;
document.head.appendChild(styleSheet);

// Add additional styles for better text formatting
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .message-content p {
        margin: 0;
        padding: 0;
        line-height: 1.5;
    }
    .message-content br {
        display: block;
        margin: 8px 0;
        content: "";
    }
    .message-content h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 1.5rem 0 1rem;
        color: var(--accent-primary);
        font-family: 'Outfit', sans-serif;
    }
    .message-content h2 {
        font-size: 1.4rem;
        font-weight: 600;
        margin: 1.2rem 0 0.8rem;
        color: var(--text-primary);
        font-family: 'Outfit', sans-serif;
    }
    .message-content h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 1rem 0 0.6rem;
        color: var(--text-primary);
        font-family: 'Outfit', sans-serif;
    }
    .chat-content {
        overflow-y: auto;
        scroll-behavior: smooth;
        padding: 20px;
        scrollbar-width: thin;
        scrollbar-color: var(--text-secondary) transparent;
    }
    .chat-content::-webkit-scrollbar {
        width: 6px;
    }
    .chat-content::-webkit-scrollbar-track {
        background: transparent;
    }
    .chat-content::-webkit-scrollbar-thumb {
        background-color: var(--text-secondary);
        border-radius: 3px;
    }
    .message-group {
        margin-bottom: 16px;
    }
    .message-content {
        max-width: 85%;
        word-wrap: break-word;
    }
    .message-content ul, .message-content ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }
    .message-content li {
        margin: 0.3rem 0;
    }
    .message-content strong {
        color: var(--accent-primary);
        font-weight: 600;
    }
`;
document.head.appendChild(additionalStyles);
