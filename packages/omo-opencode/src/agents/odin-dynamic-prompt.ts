import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildOdinDynamicPromptContent } from "./odin-dynamic-prompt-builder";
import { applyGeminiFallbackOverrides } from "./odin-gemini-fallback-overrides";

export function buildDynamicOdinPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  return buildOdinDynamicPromptContent(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );
}

export function buildFallbackOdinPrompt(
  model: string,
  agents: AvailableAgent[],
  tools: AvailableTool[],
  skills: AvailableSkill[],
  categories: AvailableCategory[],
  useTaskSystem = false,
): string {
  return applyGeminiFallbackOverrides(
    model,
    buildDynamicOdinPrompt(model, agents, tools, skills, categories, useTaskSystem),
  );
}
