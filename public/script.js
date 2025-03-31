// Welcome user
const username = localStorage.getItem("username") || "Guest";
document.getElementById("welcome-message").textContent = `Welcome, ${username}!`;

// Reapply the welcome message animation (from previous fix)
document.getElementById("welcome-message").classList.remove("animate__animated", "animate__fadeInDown");
document.getElementById("welcome-message").classList.add("animate__animated", "animate__fadeInDown");

// Initialize total meditation time from localStorage
let totalMeditationTime = parseInt(localStorage.getItem("totalMeditationTime")) || 0;
document.getElementById("total-time").textContent = totalMeditationTime;

// Logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("totalMeditationTime"); // Reset on logout
    window.location.href = "/login.html"; // Redirect to login page after logout
});

// Meditation functionality
let timer; // Store the timer globally
let currentUtterance;
let elapsedSeconds = 0;
const backgroundMusic = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");

// Set initial music volume
backgroundMusic.volume = 0.2; // Low volume

// Add event listener for music toggle
musicToggle.addEventListener("change", () => {
    if (musicToggle.checked) {
        backgroundMusic.play().catch(error => {
            console.error("Error playing music:", error);
        });
    } else {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset to start
    }
});

document.getElementById("start-btn").addEventListener("click", startMeditation);
document.getElementById("stop-btn").addEventListener("click", stopMeditation);

async function startMeditation() {
    const type = document.getElementById("meditation-type").value;
    const instructionsDiv = document.getElementById("instructions");
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const elapsedTimeDisplay = document.getElementById("elapsed-time");

    startBtn.disabled = true;
    stopBtn.style.display = "inline-block"; // Show the stop button

    // Reset elapsed time
    elapsedSeconds = 0;
    elapsedTimeDisplay.textContent = elapsedSeconds;

    // Play background music if toggled on
    if (musicToggle.checked) {
        backgroundMusic.play().catch(error => {
            console.error("Error playing music:", error);
        });
    }

    let instructions;
    try {
        const response = await fetch(`/meditate?type=${type}`); // Use relative path
        const data = await response.json();
        instructions = data.instructions;
    } catch (error) {
        instructions = `Take a deep breath in for 4 seconds, hold for 4, exhale for 4. Repeat and relax.`;
        console.error("Error fetching script:", error);
    }

    const steps = instructions.split(". ").filter(step => step.trim());
    let stepIndex = 0;

    instructionsDiv.textContent = steps[stepIndex];
    speak(steps[stepIndex]);

    let timeLeft = 300; // 5 minutes
    timer = setInterval(async () => {
        timeLeft--;
        elapsedSeconds++; // Increment elapsed seconds
        elapsedTimeDisplay.textContent = elapsedSeconds; // Update display

        if (timeLeft % 30 === 0 && stepIndex < steps.length - 1) {
            stepIndex++;
            instructionsDiv.textContent = steps[stepIndex];
            speak(steps[stepIndex]);
        }

        if (timeLeft <= 0) {
            endSession();
        }
    }, 1000);
}

function stopMeditation() {
    endSession();
}

function endSession() {
    const instructionsDiv = document.getElementById("instructions");
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const elapsedTimeDisplay = document.getElementById("elapsed-time");

    clearInterval(timer); // Stop the timer
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    backgroundMusic.pause(); // Stop the music
    backgroundMusic.currentTime = 0; // Reset music to the start

    // Update total meditation time
    totalMeditationTime += elapsedSeconds;
    localStorage.setItem("totalMeditationTime", totalMeditationTime);
    document.getElementById("total-time").textContent = totalMeditationTime;

    instructionsDiv.textContent = "Session complete! Take a moment to relax.";
    speak("Session complete!");
    startBtn.disabled = false;
    stopBtn.style.display = "none"; // Hide the stop button
    elapsedTimeDisplay.textContent = elapsedSeconds; // Final elapsed time
}

function speak(text) {
    window.speechSynthesis.cancel(); // Cancel previous speech
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.volume = 1.0; // Max volume
    currentUtterance.rate = 0.9; // Calm delivery
    currentUtterance.pitch = 1.0; // Default pitch
    window.speechSynthesis.speak(currentUtterance);
}

// Chatbot functionality
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");
const sessionId = Date.now().toString(); // Unique session ID for each page load

function addMessage(content, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = content;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll to bottom
}

chatbotSend.addEventListener("click", async () => {
    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, "user-message");
    chatbotInput.value = ""; // Clear input

    // Send message to backend
    try {
        const response = await fetch("/chatbot", { // Use relative path
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, sessionId })
        });
        const data = await response.json();
        addMessage(data.reply, "bot-message");
    } catch (error) {
        addMessage("Sorry, I couldn't connect to the server. Please try again.", "bot-message");
        console.error("Error with chatbot:", error);
    }
});

// Allow sending message with Enter key
chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        chatbotSend.click();
    }
});