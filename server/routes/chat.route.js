import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js';
dotenv.config();

const chatRouter = express.Router();

const SYSTEM_PROMPT = `
You are a compassionate mental wellness assistant. Follow these guidelines:
1. Practice active listening and reflection
2. Never diagnose or give medical advice
3. Help users explore their feelings
4. Suggest grounding techniques when needed
5. For crisis situations, gently suggest professional help
6. Keep responses under 3 sentences
7. Always respond in a warm, non-judgmental tone
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history in memory (for production, use Redis or database)
const conversationHistory = {};

chatRouter.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId.toString();

    // Initialize conversation if it doesn't exist
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];
    }

    // Add user message to history
    conversationHistory[userId].push({ role: 'user', content: message });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Free tier compatible
      messages: conversationHistory[userId],
      temperature: 0.7,
      max_tokens: 150
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to history
    conversationHistory[userId].push({ role: 'assistant', content: aiResponse });

    // Limit conversation history to last 10 messages to manage token usage
    if (conversationHistory[userId].length > 10) {
      conversationHistory[userId] = [
        conversationHistory[userId][0], // Keep system prompt
        ...conversationHistory[userId].slice(-9) // Keep last 9 exchanges
      ];
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing your message' });
  }
});

// Endpoint to clear conversation history
chatRouter.delete('/', auth, (req, res) => {
  const userId = req.user._id.toString();
  delete conversationHistory[userId];
  res.json({ message: 'Conversation history cleared' });
});

export default chatRouter;