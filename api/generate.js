/**
 * Vercel serverless function.
 * Deployed automatically at: /api/generate
 *
 * Holds the AI provider's API key via Vercel Environment Variables
 * (Project Settings -> Environment Variables) — never exposed to the browser.
 */

const PROVIDER = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
const API_KEY = process.env.AI_API_KEY || "";

async function callAnthropic(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic API error (${res.status})`);
  const block = (data.content || []).find((b) => b.type === "text");
  return block ? block.text.trim() : "";
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return text.trim();
}

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI API error (${res.status})`);
  return (data?.choices?.[0]?.message?.content || "").trim();
}

async function generateText(prompt) {
  if (!API_KEY) {
    throw new Error("Server has no API key configured. Set AI_API_KEY in Vercel Project Settings -> Environment Variables.");
  }
  if (PROVIDER === "gemini") return callGemini(prompt);
  if (PROVIDER === "openai") return callOpenAI(prompt);
  return callAnthropic(prompt);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' in request body." });
      return;
    }
    const text = await generateText(prompt);
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
};
