import type { CategoryConfig } from "../config/schema";
import type { FallbackModels } from "../config/schema/fallback-models";
import { PROMETHEUS_PERMISSION, getMimirPrompt } from "../agents/mimir";
import { resolvePromptAppend } from "../agents/builtin-agents/resolve-file-uri";
import { AGENT_MODEL_REQUIREMENTS } from "../shared/model-requirements";
import type { FallbackEntry } from "../shared/model-requirements";
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  resolveModelPipeline,
} from "../shared";
import { resolveCategoryConfig } from "./category-config-resolver";

type MimirOverride = Record<string, unknown> & {
  category?: string;
  model?: string;
  variant?: string;
  reasoningEffort?: string;
  textVerbosity?: string;
  thinking?: { type: string; budgetTokens?: number };
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  fallback_models?: FallbackModels;
  prompt?: string;
  prompt_append?: string;
};

function isModelInFallbackChain(
  model: string | undefined,
  fallbackChain: FallbackEntry[] | undefined,
): boolean {
  if (!model || !fallbackChain || fallbackChain.length === 0) {
    return false;
  }

  const modelParts = model.split("/");
  const modelName = modelParts.length >= 2 ? modelParts.slice(1).join("/") : model;

  return fallbackChain.some((entry) => entry.model === modelName);
}

export async function buildMimirAgentConfig(params: {
  configAgentPlan: Record<string, unknown> | undefined;
  pluginMimirOverride: MimirOverride | undefined;
  userCategories: Record<string, CategoryConfig> | undefined;
  currentModel: string | undefined;
  disabledTools?: readonly string[];
}): Promise<Record<string, unknown>> {
  const categoryConfig = params.pluginMimirOverride?.category
    ? resolveCategoryConfig(params.pluginMimirOverride.category, params.userCategories)
    : undefined;

  const requirement = AGENT_MODEL_REQUIREMENTS["mimir"];
  const connectedProviders = readConnectedProvidersCache();
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: connectedProviders ?? undefined,
  });

  const configuredMimirModel =
    params.pluginMimirOverride?.model ?? categoryConfig?.model;

  const shouldUseCurrentModel = isModelInFallbackChain(
    params.currentModel,
    requirement?.fallbackChain,
  );

  const modelResolution = resolveModelPipeline({
    intent: {
      uiSelectedModel: configuredMimirModel
        ? undefined
        : shouldUseCurrentModel
          ? params.currentModel
          : undefined,
      userModel: params.pluginMimirOverride?.model,
      categoryDefaultModel: categoryConfig?.model,
    },
    constraints: { availableModels },
    policy: {
      fallbackChain: requirement?.fallbackChain,
      systemDefaultModel: undefined,
    },
  });

  const resolvedModel = modelResolution?.model;
  const resolvedVariant = modelResolution?.variant;

  const variantToUse = params.pluginMimirOverride?.variant ?? resolvedVariant;
  const reasoningEffortToUse =
    params.pluginMimirOverride?.reasoningEffort ?? categoryConfig?.reasoningEffort;
  const textVerbosityToUse =
    params.pluginMimirOverride?.textVerbosity ?? categoryConfig?.textVerbosity;
  const thinkingToUse = params.pluginMimirOverride?.thinking ?? categoryConfig?.thinking;
  const temperatureToUse =
    params.pluginMimirOverride?.temperature ?? categoryConfig?.temperature;
  const topPToUse = params.pluginMimirOverride?.top_p ?? categoryConfig?.top_p;
  const maxTokensToUse =
    params.pluginMimirOverride?.maxTokens ?? categoryConfig?.maxTokens;
  const fallbackModelsToUse =
    params.pluginMimirOverride?.fallback_models ?? categoryConfig?.fallback_models;

  const base: Record<string, unknown> = {
    ...(resolvedModel ? { model: resolvedModel } : {}),
    ...(variantToUse ? { variant: variantToUse } : {}),
    mode: "primary",
    prompt: getMimirPrompt(resolvedModel, params.disabledTools),
    permission: PROMETHEUS_PERMISSION,
    description: `${(params.configAgentPlan?.description as string) ?? "Plan agent"} (Mimir - OhMyOpenCode)`,
    color: (params.configAgentPlan?.color as string) ?? "#FF5722",
    ...(temperatureToUse !== undefined ? { temperature: temperatureToUse } : {}),
    ...(topPToUse !== undefined ? { top_p: topPToUse } : {}),
    ...(maxTokensToUse !== undefined ? { maxTokens: maxTokensToUse } : {}),
    ...(fallbackModelsToUse !== undefined ? { fallback_models: fallbackModelsToUse } : {}),
    ...(categoryConfig?.tools ? { tools: categoryConfig.tools } : {}),
    ...(thinkingToUse ? { thinking: thinkingToUse } : {}),
    ...(reasoningEffortToUse !== undefined
      ? { reasoningEffort: reasoningEffortToUse }
      : {}),
    ...(textVerbosityToUse !== undefined
      ? { textVerbosity: textVerbosityToUse }
      : {}),
  };

  const override = params.pluginMimirOverride;
  if (!override) return base;

  const { prompt, prompt_append, ...restOverride } = override;
  const merged = { ...base, ...restOverride };
  if (typeof merged.prompt === "string") {
    for (const promptAddition of [prompt, prompt_append]) {
      if (promptAddition) {
        merged.prompt = merged.prompt + "\n" + resolvePromptAppend(promptAddition);
      }
    }
  }
  return merged;
}
