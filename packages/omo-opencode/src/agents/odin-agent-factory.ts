import type { AgentConfig } from "@opencode-ai/sdk";
import { categorizeTools } from "./dynamic-agent-prompt-builder";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-builder";
import {
  buildClaudeOdinAgentConfig,
  buildGlmOdinAgentConfig,
  buildGptOdinAgentConfig,
} from "./odin-agent-config";
import { buildFallbackOdinPrompt } from "./odin-dynamic-prompt";
import { buildClaudeFable5OdinPrompt } from "./odin/claude-fable-5";
import { buildClaudeOpus47OdinPrompt } from "./odin/claude-opus-4-7";
import { buildClaudeOpus48OdinPrompt } from "./odin/claude-opus-4-8";
import { buildGlm52OdinPrompt } from "./odin/glm-5-2";
import { buildGpt54OdinPrompt } from "./odin/gpt-5-4";
import { buildGpt55OdinPrompt } from "./odin/gpt-5-5";
import { buildKimiK26OdinPrompt } from "./odin/kimi-k2-6";
import { buildKimiK27OdinPrompt } from "./odin/kimi-k2-7";
import { buildKimiK3OdinPrompt } from "./odin/kimi-k3";
import type { AgentMode } from "./types";
import {
  isClaudeFable5Model,
  isClaudeOpus47Model,
  isClaudeOpus48Model,
  isGlmModel,
  isGpt5_5Model,
  isGpt5_6Model,
  isGptModel,
  isGptNativeOdinModel,
  isKimiK2Model,
  isKimiK27Model,
  isKimiK3Model,
} from "./types";

const MODE: AgentMode = "primary";

/**
 * Identifies which prompt body `createOdinAgent` bakes for a given model.
 * The whole Odin prompt is model-family-specific and selected here, so this
 * is the single source of truth shared with the runtime reconciler: when the TUI
 * runtime model resolves to a different family than the configured one, the baked
 * body is the wrong family and must be rebuilt (issue #5297/#5316).
 */
export type OdinPromptFamily =
  | "kimi-k3"
  | "kimi-k2-7"
  | "kimi-k2-6"
  | "gpt-5-5"
  | "gpt-5-4"
  | "claude-fable-5"
  | "claude-opus-4-8"
  | "claude-opus-4-7"
  | "glm-5-2"
  | "fallback";

export function resolveOdinPromptFamily(model: string): OdinPromptFamily {
  if (isKimiK3Model(model)) return "kimi-k3";
  if (isKimiK27Model(model)) return "kimi-k2-7";
  if (isKimiK2Model(model)) return "kimi-k2-6";
  if (isGpt5_5Model(model) || isGpt5_6Model(model)) return "gpt-5-5";
  if (isGptNativeOdinModel(model)) return "gpt-5-4";
  if (isClaudeFable5Model(model)) return "claude-fable-5";
  if (isClaudeOpus48Model(model)) return "claude-opus-4-8";
  if (isClaudeOpus47Model(model)) return "claude-opus-4-7";
  if (isGlmModel(model)) return "glm-5-2";
  return "fallback";
}

export function createOdinAgent(
  model: string,
  availableAgents?: AvailableAgent[],
  availableToolNames?: string[],
  availableSkills?: AvailableSkill[],
  availableCategories?: AvailableCategory[],
  useTaskSystem = false,
): AgentConfig {
  const tools = availableToolNames ? categorizeTools(availableToolNames) : [];
  const skills = availableSkills ?? [];
  const categories = availableCategories ?? [];
  const agents = availableAgents ?? [];

  switch (resolveOdinPromptFamily(model)) {
    case "kimi-k3":
      return buildGptOdinAgentConfig(
        MODE,
        model,
        buildKimiK3OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "kimi-k2-7":
      return buildGptOdinAgentConfig(
        MODE,
        model,
        buildKimiK27OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "kimi-k2-6":
      return buildGptOdinAgentConfig(
        MODE,
        model,
        buildKimiK26OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "gpt-5-5":
      return buildGptOdinAgentConfig(
        MODE,
        model,
        buildGpt55OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "gpt-5-4":
      return buildGptOdinAgentConfig(
        MODE,
        model,
        buildGpt54OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "claude-fable-5":
      return buildClaudeOdinAgentConfig(
        MODE,
        model,
        buildClaudeFable5OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "claude-opus-4-8":
      return buildClaudeOdinAgentConfig(
        MODE,
        model,
        buildClaudeOpus48OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "claude-opus-4-7":
      return buildClaudeOdinAgentConfig(
        MODE,
        model,
        buildClaudeOpus47OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "glm-5-2":
      return buildGlmOdinAgentConfig(
        MODE,
        model,
        buildGlm52OdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
      );
    case "fallback": {
      const prompt = buildFallbackOdinPrompt(
        model,
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      return isGptModel(model)
        ? buildGptOdinAgentConfig(MODE, model, prompt)
        : buildClaudeOdinAgentConfig(MODE, model, prompt);
    }
  }
}
createOdinAgent.mode = MODE;
