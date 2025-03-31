const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Initialize Gemini API with your API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Store user sessions for chatbot (in-memory for simplicity; use a database in production)
const sessions = {};

// System instruction to prepend to the user's first message
const systemInstruction = 'You are a compassionate therapist specializing in meditation, yoga, and mental health therapy. Provide helpful, concise, and empathetic answers to user questions about meditation techniques, yoga practices, stress management, mindfulness, and other therapy-related topics. Avoid giving medical advice and encourage users to consult professionals for serious concerns.';

// Chatbot route
app.post('/api/chatbot', async (req, res) => {
    const { message, sessionId } = req.body;

    try {
        // Initialize chat session if it doesn't exist
        if (!sessions[sessionId]) {
            // Start the chat with an empty history
            sessions[sessionId] = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 150, // Limit response length for concise answers
                    temperature: 0.7, // Moderate creativity for thoughtful responses
                }
            });

            // Prepend the system instruction to the first user message
            const initialMessage = `${systemInstruction}\n\nUser: ${message}`;
            const chat = sessions[sessionId];
            const result = await chat.sendMessage(initialMessage);
            const response = await result.response;
            const text = response.text();

            res.json({ reply: text });
        } else {
            // For subsequent messages, send the user message directly
            const chat = sessions[sessionId];
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            res.json({ reply: text });
        }
    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ reply: 'Sorry, I encountered an error. Please try again later.' });
    }
});

// Mock meditation scripts (for fallback)
const fallbackScripts = {
    breathing: "Close your eyes. Take a deep breath in through your nose for 4 seconds. Hold it for 4 seconds. Exhale slowly through your mouth for 4 seconds. Feel your chest rise and fall. Repeat and let tension melt away.",
    bodyscan: "Sit comfortably. Start with your feet, notice any sensations. Move your attention to your legs, relax them. Shift to your back, let it soften. Now your arms, release any tightness. Finally, your head, feel calm spread over you.",
    gratitude: "Think of one thing you’re grateful for today. Picture it clearly. Feel warmth in your heart as you hold it in mind. Now think of a person you appreciate. Send them silent thanks. Let positivity fill you."
};

// Root route
app.get('/', (req, res) => {
    res.send('Mindfulness Meditation Server is running! Use /meditate?type=<type> to get meditation scripts.');
});

// Meditation endpoint
app.get('/api/meditate', async (req, res) => {
    const meditationType = req.query.type?.toLowerCase();

    if (!["breathing", "bodyscan", "gratitude"].includes(meditationType)) {
        return res.status(400).json({ error: "Invalid meditation type" });
    }

    let instructions = "";

    try {
        // Define the prompt
        const prompt = `You are a mindfulness coach. Generate a 5-minute ${meditationType} meditation script. Use short, calming sentences. Focus on a soothing tone. Example: "Close your eyes. Take a deep breath in. Hold for 4 seconds. Exhale slowly."`;

        // Call Hugging Face Inference API with DistilGPT2
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/distilgpt2',
            {
                inputs: prompt,
                parameters: {
                    max_length: 200, // Slightly longer for a 5-minute script
                    temperature: 0.6, // Lower temperature for more focused, calming output
                    top_p: 0.85, // Slightly tighter nucleus sampling for coherence
                    do_sample: true, // Enable sampling for varied output
                    num_return_sequences: 1 // Generate one script
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the generated text
        instructions = response.data[0].generated_text.trim();

        // Clean up the output by removing the prompt
        if (instructions.startsWith(prompt)) {
            instructions = instructions.substring(prompt.length).trim();
        }

        // Ensure the script ends cleanly
        if (!instructions.endsWith('.')) {
            instructions += '.';
        }
    } catch (error) {
        console.error(`Hugging Face API error for ${meditationType}:`, error.response?.data || error.message);
        instructions = fallbackScripts[meditationType] || "Take a deep breath in for 4 seconds, hold for 4, exhale for 4. Repeat and relax."; // Fallback with default if meditationType not found
    }

    res.json({ instructions });
});

// Export the app for Vercel
module.exports = app;