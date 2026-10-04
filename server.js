import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use("/vendor", express.static(path.join(__dirname, "node_modules/p5/lib")));
app.use(express.static(__dirname));

const useCloud = Boolean(process.env.OPENAI_API_KEY);

const client = new OpenAI({
    apiKey: useCloud ? process.env.OPENAI_API_KEY : "ollama",
    baseURL: useCloud
        ? (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
        : (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1")
});

const modelName = useCloud
    ? (process.env.OPENAI_MODEL || "gpt-4o-mini")
    : (process.env.OLLAMA_MODEL || "qwen2.5:7b");

const hasNonEnglish = /[^\x00-\x7F]/;
const hasPreposition = /\b(at|in|on|under|inside|above|over|near|beside|into|onto|across|through|around|behind|between|from|with|by|during|to)\b/i;
const hasPersonalPronoun = /\b(i|me|my|mine|you|your|yours|he|him|his|she|her|hers|we|us|our|ours|they|them|their|theirs|someone|somebody|anyone|anybody)\b/i;

function cleanText(raw) {
    return (raw || "")
        .trim()
        .replace(/^["']|["']$/g, "")
        .split("\n")[0]
        .trim();
}

function wordCount(text) {
    return text.replace(/[.]/g, "").split(/\s+/).filter(Boolean).length;
}

function rejectionReason(text) {
    if (!text || hasNonEnglish.test(text)) return "it was not English";
    if (text.includes(",")) return "it contained a comma";
    if (wordCount(text) > 10) return "it was longer than 10 words";
    if (hasPersonalPronoun.test(text)) return "it used a personal pronoun instead of a specific profession";
    if (!hasPreposition.test(text)) return "it did not connect the phrase with a preposition";
    return "";
}

async function generateLine(prompt) {
    const response = await client.chat.completions.create({
        model: modelName,
        messages: [
            {
                role: "system",
                content: "You are a highly creative writer. Output exactly one short sentence under 10 words. No quotes, no explanations, and no commas. The sentence MUST clearly state WHO, DOING WHAT, and WHERE. WHO must be one specific profession, randomly switching between ordinary everyday jobs and highly niche or unusual professions. Never use personal pronouns such as I, you, he, she, we, or they. DOING WHAT must be an action that person would really do at the current time. WHERE must be a specific location. Always choose completely different professions and locations. Connect the time, profession, action, and place with prepositions such as at, in, on, under, or inside. Output in English only. Example: At 2:17am a night baker kneads dough in a kitchen."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 1.2,
        max_tokens: 40
    });

    return cleanText(response.choices[0].message.content);
}

app.post("/api/universe-text", async (req, res) => {
    try {
        const { prompt } = req.body;
        let text = "";
        let reason = "it did not follow the format";

        for (let attempt = 0; attempt < 3; attempt++) {
            const requestPrompt = attempt === 0
                ? prompt
                : `${prompt}\n\nYour previous answer was rejected because ${reason}. Reply with one English sentence under 10 words. Name a specific profession, never a personal pronoun. The action must fit the current time. No commas. Join the words with prepositions.`;
            text = await generateLine(requestPrompt);
            reason = rejectionReason(text);
            if (!reason) break;
            text = "";
        }

        if (!text) {
            return res.status(500).json({ error: "Model returned an invalid sentence" });
        }

        res.json({ text });
    } catch (error) {
        console.error("Model error:", error);
        res.status(500).json({
            error: "Model request failed"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
