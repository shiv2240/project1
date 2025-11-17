const BASE = "http://localhost:3000/api";

/* -------------- MANAGER / FRONTEND / BACKEND ROUTING ---------------- */
export async function callChatGPT({ prompt, token }) {
  return proxy(`${BASE}/chatgpt`, { prompt, token }, "ChatGPT");
}

export async function callGemini({ prompt, token }) {
  return proxy(`${BASE}/gemini`, { prompt, token }, "Gemini");
}

export async function callPerplexity({ prompt, token }) {
  return proxy(`${BASE}/perplexity`, { prompt, token }, "Perplexity");
}

/* -------------- SHARED PROXY HANDLER ---------------- */
async function proxy(url, body, label) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return { text: `[${label} error] ${json.error}` };
    }

    return { text: json.text };
  } catch (err) {
    return { text: `[${label} exception] ${err.message}` };
  }
}
