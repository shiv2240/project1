// src/controllers/aiController.js
import fetch from "node-fetch";

/* ---------- OpenAI / ChatGPT ---------- */
export async function chatWithOpenAI(req, res) {
  try {
    const { prompt } = req.body;
    const token = process.env.OPENAI_API_KEY;

    if (!token) return res.status(400).json({ error: "OpenAI token missing" });

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
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
      text: data.choices?.[0]?.message?.content || "[OpenAI Empty]",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* ---------- Gemini ---------- */
const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-pro-latest",
];

export async function chatWithGemini(req, res) {
  const { prompt } = req.body;
  const token = process.env.GEMINI_API_KEY;

  if (!token) return res.status(400).json({ error: "Gemini API key missing" });

  for (let model of GEMINI_MODELS) {
    try {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const body = await apiRes.text();
      let data;

      try {
        data = JSON.parse(body);
      } catch {
        // invalid JSON from Gemini, try next model
        continue;
      }

      if (data.error) {
        if (
          data.error.code === 503 ||
          data.error.status === "UNAVAILABLE" ||
          data.error.message?.includes("overloaded")
        ) {
          continue;
        }

        return res.status(500).json({ error: data.error.message });
      }

      return res.json({
        text:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "[Gemini Empty Response]",
      });
    } catch {
      // try next model
    }
  }

  res.status(500).json({ error: "All Gemini models failed" });
}

/* ---------- Perplexity ---------- */
export async function chatWithPerplexity(req, res) {
  try {
    const { prompt } = req.body;
    const token = process.env.PERPLEXITY_API_KEY;

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

    const raw = await apiRes.text();
    let json;

    try {
      json = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Invalid Perplexity JSON",
        raw,
      });
    }

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: json.error?.message || "Perplexity error",
      });
    }

    return res.json({
      text: json.choices?.[0]?.message?.content || "[Perplexity Empty]",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
