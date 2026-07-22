import type { AgentConfig } from "@opencode-ai/sdk";
import { getFrontierToolSchemaPermission } from "./frontier-tool-schema-guard";
import { buildClaudeThinkingConfig } from "./types";
import type { AgentMode } from "./types";

const SISYPHUS_DESCRIPTION =
  "Powerful AI orchestrator. Plans obsessively with todos, assesses search complexity before exploration, delegates strategically via category+skills combinations. Uses explore for internal code (parallel-friendly), bragi for external docs. (Odin - OhMyOpenCode)";

function buildOdinPermission(model: string): AgentConfig["permission"] {
  return {
    question: "allow",
    call_omo_agent: "deny",
    ...getFrontierToolSchemaPermission(model),
  } as AgentConfig["permission"];
}

function buildBaseOdinAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    description: SISYPHUS_DESCRIPTION,
    mode,
    model,
    maxTokens: 64000,
    prompt,
    color: "#00CED1",
    permission: buildOdinPermission(model),
  };
}

export function buildGptOdinAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseOdinAgentConfig(mode, model, prompt),
    reasoningEffort: "medium",
  };
}

export function buildGlmOdinAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return buildBaseOdinAgentConfig(mode, model, prompt);
}

export function buildClaudeOdinAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseOdinAgentConfig(mode, model, prompt),
    ...buildClaudeThinkingConfig(model),
  };
}
