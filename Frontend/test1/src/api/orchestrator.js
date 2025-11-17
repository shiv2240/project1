/**
 * orchestrator.js
 *
 * Uses providerAdapters and user-provided tokens to orchestrate:
 * user -> Manager -> Frontend & Backend -> Manager(synthesis).
 *
 * This client-side orchestrator uses the adapters above. In production,
 * move orchestration to a secure backend (recommended).
 */

import { callChatGPT, callGemini, callPerplexity } from "./providerAdapters";
import { buildManagerPrompt, buildSubtaskPrompt } from "../utils/schema";
function chooseAdapter(providerName = "", role = "sub") {
  const key = providerName.trim().toLowerCase();

  // Manager-AI must be strong (NO Perplexity)
  if (role === "manager") {
    if (key.includes("gemini") || key.includes("google")) return callGemini;
    return callChatGPT; // fallback
  }

  // Sub-agents (frontend/backend) → allow all
  if (key.includes("chat") || key.includes("openai")) return callChatGPT;
  if (key.includes("gemini") || key.includes("google")) return callGemini;
  if (key.includes("perplex") || key.includes("sonar")) return callPerplexity;

  return callChatGPT;
}



export async function orchestrateMessage({
  userPrompt,
  providersConfig,
  systemPrompts,
}) {
  // providersConfig: { manager: { name, token }, frontend: {...}, backend: {...} }
  const managerProvider = providersConfig.manager?.name || "ChatGPT";
  const managerToken = providersConfig.manager?.token;

  // 1) Build manager prompt asking for decomposition
  const managerPrompt = buildManagerPrompt({
    userPrompt,
    systemPrompt: systemPrompts.manager,
  });

  // 2) Call Manager provider to get decomposition (frontendInstruction/backendInstruction)
  const managerAdapter = chooseAdapter(managerProvider);
  const managerCall = await managerAdapter({
    prompt: managerPrompt,
    token: managerToken,
  });

  // NOTE: production Manager should return strict JSON. Here we create subtask prompts.
  const frontendInstruction = buildSubtaskPrompt({
    subAgent: "Frontend-AI",
    managerOutput: managerCall.text,
    userPrompt,
    systemPrompt: systemPrompts.frontend,
  });

  const backendInstruction = buildSubtaskPrompt({
    subAgent: "Backend-AI",
    managerOutput: managerCall.text,
    userPrompt,
    systemPrompt: systemPrompts.backend,
  });

  // 3) Call sub-agents
  const frontendProvider = providersConfig.frontend?.name || "ChatGPT";
  const frontendToken = providersConfig.frontend?.token;
  const backendProvider = providersConfig.backend?.name || "ChatGPT";
  const backendToken = providersConfig.backend?.token;

  const frontendAdapter = chooseAdapter(frontendProvider);
  const backendAdapter = chooseAdapter(backendProvider);

  const [frontendResp, backendResp] = await Promise.all([
    frontendAdapter({ prompt: frontendInstruction, token: frontendToken }),
    backendAdapter({ prompt: backendInstruction, token: backendToken }),
  ]);

  // 4) Manager synthesizes final response
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
`;

  const synthesisCall = await managerAdapter({
    prompt: synthesisPrompt,
    token: managerToken,
  });

  return {
    userPrompt,
    managerPrompt,
    frontendInstruction,
    backendInstruction,
    frontendResponse: frontendResp.text,
    backendResponse: backendResp.text,
    finalResponse: synthesisCall.text,
  };
}
