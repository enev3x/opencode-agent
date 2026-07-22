import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyProviderConnected } from "../../shared"
import { log } from "../../shared/logger"
import { createThorAgent, isThorSupportedModel } from "../thor"
import { applyEnvironmentContext } from "./environment-context"
import { applyCategoryOverride, mergeAgentConfig } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { applyFrontierToolSchemaPermission } from "../frontier-tool-schema-guard"

export function maybeCreateThorConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv = false,
  } = input

  if (disabledAgents.includes("thor")) return undefined

  const thorOverride = agentOverrides["thor"]
  const thorRequirement = AGENT_MODEL_REQUIREMENTS["thor"]
  const hasThorExplicitConfig = thorOverride !== undefined

  const hasRequiredProvider =
    !thorRequirement?.requiresProvider ||
    hasThorExplicitConfig ||
    isFirstRunNoCache ||
    isAnyProviderConnected(thorRequirement.requiresProvider, availableModels)

  if (!hasRequiredProvider) {
    log("[agent-registration] Agent skipped: required provider not connected", {
      agent: "thor",
      requiredProvider: thorRequirement?.requiresProvider,
    })
    return undefined
  }

  let thorResolution = applyModelResolution({
    userModel: thorOverride?.model,
    requirement: thorRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !thorOverride?.model) {
    thorResolution = getFirstFallbackModel(thorRequirement)
  }

  if (!thorResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "thor",
      configuredModel: thorOverride?.model,
    })
    return undefined
  }
  const { model: thorModel, variant: thorResolvedVariant } = thorResolution

  if (!isThorSupportedModel(thorModel)) {
    log("[agent-registration] Agent skipped: unsupported Thor model", {
      agent: "thor",
      configuredModel: thorModel,
    })
    return undefined
  }

  let thorConfig = createThorAgent(
    thorModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  thorConfig = { ...thorConfig, variant: thorResolvedVariant ?? "medium" }

  const hepOverrideCategory = (thorOverride as Record<string, unknown> | undefined)?.category as string | undefined
  if (hepOverrideCategory) {
    thorConfig = applyCategoryOverride(thorConfig, hepOverrideCategory, mergedCategories)
    if (!isThorSupportedModel(thorConfig.model)) {
      log("[agent-registration] Agent skipped: unsupported Thor category model", {
        agent: "thor",
        configuredModel: thorConfig.model,
      })
      return undefined
    }
  }

  thorConfig = applyEnvironmentContext(thorConfig, directory, { disableOmoEnv })

  if (thorOverride) {
    thorConfig = mergeAgentConfig(thorConfig, thorOverride, directory)
    if (!isThorSupportedModel(thorConfig.model)) {
      log("[agent-registration] Agent skipped: unsupported Thor override model", {
        agent: "thor",
        configuredModel: thorConfig.model,
      })
      return undefined
    }
  }

  const resolvedModel = thorConfig.model ?? ""
  thorConfig.permission = applyFrontierToolSchemaPermission(
    thorConfig.permission,
    resolvedModel,
    thorOverride?.permission,
    (thorOverride as { tools?: Record<string, boolean> } | undefined)?.tools
  )

  return thorConfig
}
