const chatContent = document.getElementById("chat-content");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// Assistant details and context
const assistantDetails = `You are Riya Sharma, an IT Learning Assistant. Your role is to explain IT and computer-related concepts in simple, easy-to-understand terms. When responding:
1. Use simple language and avoid technical jargon unless necessary
2. Provide real-world examples when possible
3. Break down complex concepts into smaller, digestible parts
4. Be friendly and encouraging
5. If you're not sure about something, be honest about it`;

// Function to create and append a message element
function createMessageElement(message, isUser = false) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.classList.add(isUser ? "user-message" : "bot-message");
    chatContent.appendChild(messageElement);
    chatContent.scrollTop = chatContent.scrollHeight;
    return messageElement;
}

// Function to show loading indicator
function showLoadingIndicator() {
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("bot-message", "loading");
    loadingElement.textContent = "Thinking";
    chatContent.appendChild(loadingElement);
    chatContent.scrollTop = chatContent.scrollHeight;
    return loadingElement;
}

// Function to fetch response from API
async function fetchResponse(userMessage) {
    try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `${assistantDetails}\nUser: ${userMessage}\nRiya Sharma:`
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== "success") {
            throw new Error("API response was not successful");
        }

        return data.text;
    } catch (error) {
        console.error("Error:", error);
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
}

// Handle form submission
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Disable input while processing
    userInput.disabled = true;
    
    // Display user message
    createMessageElement(userMessage, true);
    userInput.value = ""; // Clear input field

    // Show loading indicator
    const loadingElement = showLoadingIndicator();

    // Fetch and display bot response
    const botResponse = await fetchResponse(userMessage);
    loadingElement.remove();
    createMessageElement(botResponse);

    // Re-enable input
    userInput.disabled = false;
    userInput.focus();
});

// Handle input placeholder text
userInput.addEventListener("focus", () => {
    userInput.placeholder = "Type your message...";
});

userInput.addEventListener("blur", () => {
    userInput.placeholder = "Type your question here...";
});

// Enable enter to submit, shift+enter for new line
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
    }
}); 