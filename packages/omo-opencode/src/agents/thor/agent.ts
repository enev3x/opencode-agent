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

const MODE: AgentMode = "primary";
const GPT_5_3_CODEX_RE = /^gpt-5[.-]3-codex(?:$|[.-])/i;
const GPT_5_4_RE = /^gpt-5[.-]4(?:$|[.-])/i;
const GPT_5_5_RE = /^gpt-5[.-]5(?:$|[.-])/i;
const GPT_5_6_RE = /^gpt-5[.-]6(?:$|[.-])/i;

export type ThorPromptSource = "gpt-5-6" | "gpt-5-5" | "gpt-5-4" | "gpt";

export class UnsupportedThorModelError extends Error {
  readonly model: string | undefined;

  constructor(model: string | undefined) {
    super(
      `Thor only supports GPT-5.3 Codex, GPT-5.4, GPT-5.5, and GPT-5.6 models; received ${model ?? "no model"}.`,
    );
    this.name = "UnsupportedThorModelError";
    this.model = model;
  }
}

function extractModelName(model: string): string {
  return model.includes("/") ? (model.split("/").pop() ?? model) : model;
}

export function isThorSupportedModel(model: string | undefined): boolean {
  if (!model) return false;
  const modelName = extractModelName(model);
  return (
    GPT_5_3_CODEX_RE.test(modelName) ||
    GPT_5_4_RE.test(modelName) ||
    GPT_5_5_RE.test(modelName) ||
    GPT_5_6_RE.test(modelName)
  );
}

function assertThorSupportedModel(model: string | undefined): void {
  if (!isThorSupportedModel(model)) {
    throw new UnsupportedThorModelError(model);
  }
}

export function getThorPromptSource(
  model?: string,
): ThorPromptSource {
  assertThorSupportedModel(model);
  if (model && isGpt5_6Model(model)) {
    return "gpt-5-6";
  }
  if (model && isGpt5_5Model(model)) {
    return "gpt-5-5";
  }
  if (model && GPT_5_4_RE.test(extractModelName(model))) {
    return "gpt-5-4";
  }
  return "gpt";
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
      basePrompt = buildGpt56Prompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
    case "gpt-5-5":
      basePrompt = buildGpt55Prompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
    case "gpt-5-4":
      basePrompt = buildGpt54Prompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
    case "gpt":
    default:
      basePrompt = buildGptPrompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
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
