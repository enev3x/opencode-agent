import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS } from "../../shared"
import { log } from "../../shared/logger"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution } from "./model-resolution"
import { createHeimdallAgent } from "../heimdall"

export function maybeCreateHeimdallConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories,
  } = input

  if (disabledAgents.includes("heimdall")) return undefined

  const orchestratorOverride = agentOverrides["heimdall"]
  const heimdallRequirement = AGENT_MODEL_REQUIREMENTS["heimdall"]

  let heimdallResolution = applyModelResolution({
    uiSelectedModel: orchestratorOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: orchestratorOverride?.model,
    requirement: heimdallRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (!heimdallResolution && orchestratorOverride?.model) {
    // User explicitly configured a model but resolution failed (e.g., cold cache, no system default).
    // Honor the user's choice directly instead of dropping Heimdall entirely.
    heimdallResolution = { model: orchestratorOverride.model, provenance: "override" as const }
  }

  if (!heimdallResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "heimdall",
      configuredModel: orchestratorOverride?.model,
    })
    return undefined
  }
  const { model: heimdallModel, variant: heimdallResolvedVariant } = heimdallResolution

  let orchestratorConfig = createHeimdallAgent({
    model: heimdallModel,
    availableAgents,
    availableSkills,
    userCategories,
  })

  if (heimdallResolvedVariant) {
    orchestratorConfig = { ...orchestratorConfig, variant: heimdallResolvedVariant }
  }

  orchestratorConfig = applyOverrides(orchestratorConfig, orchestratorOverride, mergedCategories, directory)

  return orchestratorConfig
}
