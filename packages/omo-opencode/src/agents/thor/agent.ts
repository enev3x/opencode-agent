import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentMode, AgentPromptMetadata } from "../types";
import { isGpt5_5Model, isGpt5_6Model } from "../types";
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
import { categorizeTools, buildAgentIdentitySection } from "../dynamic-agent-prompt-builder";
import { getFrontierToolSchemaPermission } from "../frontier-tool-schema-guard";

import { buildThorPrompt as buildGptPrompt } from "./gpt";
import { buildThorPrompt as buildGpt54Prompt } from "./gpt-5-4";
import { buildGpt55ThorPrompt as buildGpt55Prompt } from "./gpt-5-5";
import { buildGpt56ThorPrompt as buildGpt56Prompt } from "./gpt-5-6";
import { buildThorBasePrompt } from "./base";

const MODE: AgentMode = "primary";
const GPT_5_4_RE = /^gpt-5[.-]4(?:$|[.-])/i;
const GPT_5_5_RE = /^gpt-5[.-]5(?:$|[.-])/i;

// ponytail: no model restriction — any model works. GPT variants get
// optimized prompts, everything else uses the adaptive base prompt
// with auto-injected model capability hints.
export type ThorPromptSource = "gpt-5-6" | "gpt-5-5" | "gpt-5-4" | "gpt" | "base";

function extractModelName(model: string): string {
  return model.includes("/") ? (model.split("/").pop() ?? model) : model;
}

export function getThorPromptSource(
  model?: string,
): ThorPromptSource {
  if (!model) return "base";
  if (isGpt5_6Model(model)) return "gpt-5-6";
  if (isGpt5_5Model(model)) return "gpt-5-5";
  if (GPT_5_4_RE.test(extractModelName(model))) return "gpt-5-4";
  // ponytail: non-GPT models use adaptive base prompt with capability hints
  return "base";
}

export interface ThorContext {
  model?: string;
  availableAgents?: AvailableAgent[];
  availableTools?: AvailableTool[];
  availableSkills?: AvailableSkill[];
  availableCategories?: AvailableCategory[];
  useTaskSystem?: boolean;
}

export function getThorPrompt(
  model?: string,
  useTaskSystem = false,
): string {
  return buildDynamicThorPrompt({ model, useTaskSystem });
}

function buildDynamicThorPrompt(ctx?: ThorContext): string {
  const agents = ctx?.availableAgents ?? [];
  const tools = ctx?.availableTools ?? [];
  const skills = ctx?.availableSkills ?? [];
  const categories = ctx?.availableCategories ?? [];
  const useTaskSystem = ctx?.useTaskSystem ?? false;
  const model = ctx?.model;

  const source = getThorPromptSource(model);

  let basePrompt: string;
  switch (source) {
    case "gpt-5-6":
      basePrompt = buildGpt56Prompt(agents, tools, skills, categories, useTaskSystem);
      break;
    case "gpt-5-5":
      basePrompt = buildGpt55Prompt(agents, tools, skills, categories, useTaskSystem);
      break;
    case "gpt-5-4":
      basePrompt = buildGpt54Prompt(agents, tools, skills, categories, useTaskSystem);
      break;
    case "gpt":
      basePrompt = buildGptPrompt(agents, tools, skills, categories, useTaskSystem);
      break;
    case "base":
    default:
      // Adaptive base prompt with auto-injected model capability hints
      basePrompt = buildThorBasePrompt(agents, tools, skills, categories, useTaskSystem, model);
      break;
  }

  const agentIdentity = buildAgentIdentitySection(
    "Thor",
    "Autonomous deep worker for software engineering from OhMyOpenCode",
  );

  return `${agentIdentity}\n${basePrompt}`;
}

export function createThorAgent(
  model: string,
  availableAgents?: AvailableAgent[],
  availableToolNames?: string[],
  availableSkills?: AvailableSkill[],
  availableCategories?: AvailableCategory[],
  useTaskSystem = false,
): AgentConfig {
  const tools = availableToolNames ? categorizeTools(availableToolNames) : [];

  const prompt = buildDynamicThorPrompt({
    model,
    availableAgents,
    availableTools: tools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  });

  return {
    description:
      "Autonomous Deep Worker - goal-oriented execution with GPT Codex. Explores thoroughly before acting, uses vidar/bragi agents for comprehensive context, completes tasks end-to-end. Inspired by AmpCode deep mode. (Thor - OhMyOpenCode)",
    mode: MODE,
    model,
    maxTokens: 32000,
    prompt,
    color: "#D97706",
    permission: {
      question: "allow",
      call_omo_agent: "deny",
      ...getFrontierToolSchemaPermission(model),
    } as AgentConfig["permission"],
    reasoningEffort: "medium",
  };
}
createThorAgent.mode = MODE;

export const thorPromptMetadata: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "Thor",
  triggers: [
    {
      domain: "Autonomous deep work",
      trigger: "End-to-end task completion without premature stopping",
    },
    {
      domain: "Complex implementation",
      trigger: "Multi-step implementation requiring thorough exploration",
    },
  ],
  useWhen: [
    "Task requires deep exploration before implementation",
    "User wants autonomous end-to-end completion",
    "Complex multi-file changes needed",
  ],
  avoidWhen: [
    "Simple single-step tasks",
    "Tasks requiring user confirmation at each step",
    "When orchestration across multiple agents is needed (use Heimdall)",
  ],
  keyTrigger: "Complex implementation task requiring autonomous deep work",
};
