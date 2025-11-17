import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/* ========================================================
   OPENAI / CHATGPT
======================================================== */
app.post("/api/chatgpt", async (req, res) => {
  try {
    const { prompt, token } = req.body;
    if (!token) return res.status(400).json({ error: "OpenAI token missing" });

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    const body = await apiRes.text();
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON returned from OpenAI",
        raw: body,
      });
    }

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: data.error?.message || "OpenAI error",
      });
    }

    return res.json({
      text: data.choices?.[0]?.message?.content || "[OpenAI Empty Response]",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/* ========================================================
   GEMINI
======================================================== */

const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-pro-latest",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
];

app.post("/api/gemini", async (req, res) => {
  const { prompt, token } = req.body;
  if (!token) return res.status(400).json({ error: "Gemini token missing" });

  for (let model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${token}`;

      const apiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const body = await apiRes.text();
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        continue;
      }

      if (data.error) {
        if (
          data.error.code === 503 ||
          data.error.status === "UNAVAILABLE" ||
          data.error.message?.includes("overloaded")
        )
          continue;

        return res.status(400).json({ error: data.error.message });
      }

      return res.json({
        text:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "[Gemini Empty Response]",
      });
    } catch {}
  }

  return res.status(500).json({ error: "All Gemini models failed." });
});

/* ========================================================
   PERPLEXITY — FIXED FOREVER
======================================================== */
app.post("/api/perplexity", async (req, res) => {
  try {
    const { prompt, token } = req.body;
    if (!token)
      return res.status(400).json({ error: "Perplexity token missing" });

    const apiRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const body = await apiRes.text();
    let data;

    try {
      data = JSON.parse(body);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON returned from Perplexity",
        raw: body,
      });
    }

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: data.error?.message || "Unknown Perplexity error",
        raw: data,
      });
    }

    return res.json({
      text: data.choices?.[0]?.message?.content || "[Perplexity Empty]",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/* ========================================================
   START SERVER
======================================================== */
app.listen(3000, () => {
  console.log("🚀 Backend running at http://localhost:3000");
});
