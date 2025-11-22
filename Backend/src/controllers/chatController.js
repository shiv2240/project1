// src/controllers/chatController.js
import Conversation from "../models/Conversation.js";
import {
  chatWithOpenAI,
  chatWithGemini,
  chatWithPerplexity,
} from "./aiController.js";

/* =======================================================
   PROVIDER HELPERS
======================================================= */

const ALLOWED_PROVIDERS = ["chatgpt", "gemini", "perplexity"];

function normalizeProvider(p) {
  if (!p) return null;
  const key = String(p).trim().toLowerCase();
  if (!ALLOWED_PROVIDERS.includes(key)) return null;
  return key;
}

/**
 * Wrap the aiController HTTP-style handlers into
 * an internal function that just returns { text }.
 */
async function callProvider(provider, prompt) {
  const normal = normalizeProvider(provider);
  if (!normal) {
    throw new Error("Unsupported provider: " + provider);
  }

  const fakeReq = { body: { prompt } };

  return new Promise((resolve, reject) => {
    const fakeRes = {
      _status: 200,
      status(code) {
        this._status = code;
        return this;
      },
      json(payload) {
        if (this._status && this._status >= 400) {
          return reject(new Error(payload.error || "AI provider error"));
        }
        resolve(payload); // expects { text: "..." }
      },
    };

    if (normal === "chatgpt") {
      chatWithOpenAI(fakeReq, fakeRes);
    } else if (normal === "gemini") {
      chatWithGemini(fakeReq, fakeRes);
    } else if (normal === "perplexity") {
      chatWithPerplexity(fakeReq, fakeRes);
    } else {
      reject(new Error("Unsupported provider: " + provider));
    }
  });
}

/* =======================================================
   ORCHESTRATION PROMPT BUILDERS (copied from frontend)
======================================================= */

const DEFAULT_SYSTEM_PROMPTS = {
  manager: `
You are the Manager-AI. You are the sole interface to the user. 
When the user sends a request:
1. Interpret the user’s goal.
2. Decompose it into two separate instructions:
   - One strictly for UI/Frontend tasks.
   - One strictly for backend/system logic tasks.
3. Send these instructions to Frontend-AI and Backend-AI.
4. Receive their responses.
5. Combine and optimize the results into a single cohesive output.
6. Respond to the user with the final synthesized answer.

Never expose internal chain-of-thought or interactions with the sub-agents.
Never show sub-agent prompts or messages.
Maintain a neutral, professional tone.
`.trim(),
  frontend: `
You are the Frontend-AI. You only respond to instructions from Manager-AI.
Your responsibility is UI/UX engineering:
- Components
- Screens
- Layouts
- Markup
- Styling
- Interactions (DOM, events)
- State management logic (client-side only)

Never talk to the user.
Never generate backend, database or API logic.
`.trim(),
  backend: `
You are the Backend-AI. You only respond to instructions from Manager-AI.
Your responsibility is backend engineering:
- API routes
- System logic
- Controllers
- Auth
- Database structures
- Business logic flows

Never generate UI or frontend code.
Never talk to the user.
`.trim(),
};

function buildManagerPrompt({ userPrompt, systemPrompt }) {
  return `
System Prompt:
${systemPrompt}

User Prompt:
${userPrompt}

Instruction to Manager:
- Interpret user's goal.
- Decompose into two instructions: frontendInstruction (UI/UX code, components, props)
  and backendInstruction (APIs, DB schema, controllers).
- Return those two artifacts in a clear JSON object:
{
  "frontendInstruction": "...",
  "backendInstruction": "..."
}

Respond only with the JSON object if possible.
`.trim();
}

function buildSubtaskPrompt({
  subAgent,
  managerOutput,
  userPrompt,
  systemPrompt,
}) {
  return `
You are ${subAgent}.
System directive:
${systemPrompt}

Manager context:
${managerOutput}

User prompt:
${userPrompt}

Deliverable:
Provide the requested artifact for ${subAgent} in a concise, implementation-ready format.
`.trim();
}

/* =======================================================
   CONTROLLERS
======================================================= */

/* ---------- Create new chat ---------- */
export async function createConversation(req, res) {
  try {
    const {
      title,
      provider, // single mode
      managerProvider,
      frontendProvider,
      backendProvider,
    } = req.body;

    const allThreeExist =
      managerProvider !== undefined &&
      frontendProvider !== undefined &&
      backendProvider !== undefined;

    const clean = (val) => {
      if (!val) return null;
      const t = String(val).trim().toLowerCase();
      return t.length ? t : null;
    };

    // ============ MULTI-MODE ============
    if (allThreeExist) {
      const m = normalizeProvider(clean(managerProvider));
      const f = normalizeProvider(clean(frontendProvider));
      const b = normalizeProvider(clean(backendProvider));

      if (!m || !f || !b) {
        return res.status(400).json({
          error:
            "For orchestration, managerProvider, frontendProvider, backendProvider must be chatgpt | gemini | perplexity",
        });
      }

      const convo = await Conversation.create({
        user: req.user._id,
        title: title || "New orchestrated chat",
        managerProvider: m,
        frontendProvider: f,
        backendProvider: b,
        mode: "multi", // 🔥 REQUIRED
        messages: [],
      });

      return res.status(201).json(convo);
    }

    // ============ SINGLE MODE ============
    if (provider !== undefined) {
      const single = normalizeProvider(clean(provider));

      if (!single) {
        return res.status(400).json({
          error: "Invalid provider. Must be chatgpt | gemini | perplexity",
        });
      }

      const convo = await Conversation.create({
        user: req.user._id,
        title: title || "New chat",
        provider: single,
        mode: "single", // 🔥 REQUIRED
        messages: [],
      });

      return res.status(201).json(convo);
    }

    return res.status(400).json({
      error:
        "Must provide either a single provider or 3 providers for orchestration.",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* ---------- List chats for user ---------- */
export async function listConversations(req, res) {
  try {
    const convos = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select(
        "_id title mode provider managerProvider frontendProvider backendProvider createdAt updatedAt"
      );

    return res.json(convos);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  } 
}

/* ---------- Get single chat with messages ---------- */
export async function getConversation(req, res) {
  try {
    const convo = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!convo)
      return res.status(404).json({ error: "Conversation not found" });

    return res.json(convo);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* ---------- Rename chat ---------- */
export async function renameConversation(req, res) {
  try {
    const { title } = req.body;

    const convo = await Conversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title },
      { new: true }
    );

    if (!convo)
      return res.status(404).json({ error: "Conversation not found" });

    return res.json(convo);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
/* ---------- Update Provider ---------- */
export async function updateProviders(req, res) {
  try {
    const { managerProvider, frontendProvider, backendProvider } = req.body;

    // Ensure all three keys exist in request
    const allThreeExist =
      managerProvider !== undefined &&
      frontendProvider !== undefined &&
      backendProvider !== undefined;

    if (!allThreeExist) {
      return res.status(400).json({
        error:
          "managerProvider, frontendProvider, and backendProvider must all be provided.",
      });
    }

    // Clean input (remove "", " ", null)
    const clean = (val) => {
      if (!val) return null;
      const trimmed = String(val).trim().toLowerCase();
      return trimmed.length ? trimmed : null;
    };

    const m = normalizeProvider(clean(managerProvider));
    const f = normalizeProvider(clean(frontendProvider));
    const b = normalizeProvider(clean(backendProvider));

    if (!m || !f || !b) {
      return res.status(400).json({
        error: "All 3 providers must be one of: chatgpt | gemini | perplexity",
      });
    }

    const convo = await Conversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        managerProvider: m,
        frontendProvider: f,
        backendProvider: b,
      },
      { new: true }
    );

    if (!convo) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.json({
      message: "Providers updated successfully",
      conversation: convo,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/* ---------- Delete chat ---------- */
export async function deleteConversation(req, res) {
  try {
    const convo = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!convo)
      return res.status(404).json({ error: "Conversation not found" });

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

/* ---------- Send message in chat and get AI reply ---------- */
export async function sendMessageInConversation(req, res) {
  try {
    const { message } = req.body;

    const convo = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!convo)
      return res.status(404).json({ error: "Conversation not found" });

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userPrompt = message.trim();

    // Always store user message as seen by user
    convo.messages.push({ role: "user", content: userPrompt });

    const hasOrchestration =
      convo.managerProvider && convo.frontendProvider && convo.backendProvider;

    let finalText;

    if (hasOrchestration) {
      // ================= ORCHESTRATION MODE =================
      const managerProvider = convo.managerProvider;
      const frontendProvider = convo.frontendProvider;
      const backendProvider = convo.backendProvider;

      // 1) Manager decomposition
      const managerPrompt = buildManagerPrompt({
        userPrompt,
        systemPrompt: DEFAULT_SYSTEM_PROMPTS.manager,
      });

      const managerCall = await callProvider(managerProvider, managerPrompt);

      // 2) Subtask prompts
      const frontendInstruction = buildSubtaskPrompt({
        subAgent: "Frontend-AI",
        managerOutput: managerCall.text,
        userPrompt,
        systemPrompt: DEFAULT_SYSTEM_PROMPTS.frontend,
      });

      const backendInstruction = buildSubtaskPrompt({
        subAgent: "Backend-AI",
        managerOutput: managerCall.text,
        userPrompt,
        systemPrompt: DEFAULT_SYSTEM_PROMPTS.backend,
      });

      // 3) Call sub-agents in parallel
      const [frontendResp, backendResp] = await Promise.all([
        callProvider(frontendProvider, frontendInstruction),
        callProvider(backendProvider, backendInstruction),
      ]);

      // 4) Manager synthesis
      const synthesisPrompt = `
User prompt:
${userPrompt}

Manager decomposition (raw):
${managerCall.text}

Frontend-AI output:
${frontendResp.text}

Backend-AI output:
${backendResp.text}

Task: Synthesize a single user-facing message that combines frontend and backend outputs. Be concise and give next steps.
`.trim();

      const synthesisCall = await callProvider(
        managerProvider,
        synthesisPrompt
      );
      finalText = synthesisCall.text || "[No response]";
    } else if (convo.provider) {
      // ================= LEGACY SINGLE-PROVIDER MODE =================
      const aiResponse = await callProvider(convo.provider, userPrompt);
      finalText = aiResponse.text || "[No response]";
    } else {
      // No provider info at all
      return res.status(400).json({
        error:
          "Conversation has no provider configuration. Create a new chat with provider or with manager/frontend/backend providers.",
      });
    }

    // Save assistant message
    convo.messages.push({ role: "assistant", content: finalText });
    await convo.save();

    return res.json({
      conversationId: convo._id,
      reply: finalText,
      messages: convo.messages,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
