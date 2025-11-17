export function buildManagerPrompt({ userPrompt, systemPrompt }) {
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
`;
}

export function buildSubtaskPrompt({ subAgent, managerOutput, userPrompt, systemPrompt }) {
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
`;
}
