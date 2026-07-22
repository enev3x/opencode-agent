import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyFallbackModelAvailable } from "../../shared"
import { log } from "../../shared/logger"
import { applyEnvironmentContext } from "./environment-context"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { createOdinAgent } from "../odin"
import { applyFrontierToolSchemaPermission } from "../frontier-tool-schema-guard"
import { setOdinRuntimePromptContext } from "../odin-runtime-prompt-reconciler"

export function maybeCreateOdinConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
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

  const odinOverride = agentOverrides["odin"]
  const odinRequirement = AGENT_MODEL_REQUIREMENTS["odin"]
  const hasOdinExplicitConfig = odinOverride !== undefined
  const meetsOdinAnyModelRequirement =
    !odinRequirement?.requiresAnyModel ||
    hasOdinExplicitConfig ||
    isFirstRunNoCache ||
    isAnyFallbackModelAvailable(odinRequirement.fallbackChain, availableModels)

  if (!disabledAgents.includes("odin") && !meetsOdinAnyModelRequirement) {
    log("[agent-registration] Agent skipped: no model in fallback chain is available", {
      agent: "odin",
    })
  }
  if (disabledAgents.includes("odin") || !meetsOdinAnyModelRequirement) return undefined

  let odinResolution = applyModelResolution({
    uiSelectedModel: odinOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: odinOverride?.model,
    requirement: odinRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !odinOverride?.model && !uiSelectedModel) {
    odinResolution = getFirstFallbackModel(odinRequirement)
  }

  if (!odinResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "odin",
      configuredModel: odinOverride?.model,
    })
    return undefined
  }
  const { model: odinModel, variant: odinResolvedVariant } = odinResolution

  let odinConfig = createOdinAgent(
    odinModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  if (odinResolvedVariant) {
    odinConfig = { ...odinConfig, variant: odinResolvedVariant }
  }

  odinConfig = applyOverrides(odinConfig, odinOverride, mergedCategories, directory)

  const resolvedModel = odinConfig.model ?? ""
  odinConfig.permission = applyFrontierToolSchemaPermission(
    odinConfig.permission,
    resolvedModel,
    odinOverride?.permission,
    (odinOverride as { tools?: Record<string, boolean> } | undefined)?.tools
  )

  odinConfig = applyEnvironmentContext(odinConfig, directory, {
    disableOmoEnv,
  })

  // The body above is baked from the *configured* model. If the user switches to
  // a different model family in the TUI, the system-transform hook rebuilds the
  // prompt for the runtime model using this captured pipeline (issue #5297/#5316).
  setOdinRuntimePromptContext({
    configuredModel: odinModel,
    bakedPrompt: odinConfig.prompt ?? "",
    rebuildPromptForModel: (runtimeModel: string): string => {
      let rebuilt = createOdinAgent(
        runtimeModel,
        availableAgents,
        undefined,
        availableSkills,
        availableCategories,
        useTaskSystem
      )
      rebuilt = applyOverrides(rebuilt, odinOverride, mergedCategories, directory)
      rebuilt = applyEnvironmentContext(rebuilt, directory, { disableOmoEnv })
      return rebuilt.prompt ?? ""
    },
  })

  return odinConfig
}
