import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { loadSystemPrompt } from './utils/loadSystemPrompt.js';
import { setGlobalDispatcher, Agent } from 'undici';

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

setGlobalDispatcher(new Agent({
    connectTimeout: 60000
}));


const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.get('/', (req, res) => {
    res.json({ message: 'CLI Agent server is running' });
});

const PORT = process.env.PORT || 3000;

app.post('/analyze', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    try {
        const systemPrompt = await loadSystemPrompt();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}
            User Request: ${prompt}`,
              config: {
                thinkingConfig: {
                    thinkingBudget: 0
                }
            }
        });
        console.log('response', response)

        const reply = response.text.trim();

        const parsedReply = JSON.parse(reply);

        res.json(parsedReply);

    } catch (err) {
        if (err.status === 429) {
            return res.status(429).json({
                command: "QUOTA_EXCEEDED",
                message: "עברת את מכסת השימוש במודל. נסי שוב בעוד דקה או החליפי מודל."
            });
        }

        console.error('FULL ERROR:');
        console.error(err);

        return res.status(500).json({
            command: "SERVER_ERROR",
            message: "אירעה שגיאה בשרת. נסי שוב בעוד מספר רגעים."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});