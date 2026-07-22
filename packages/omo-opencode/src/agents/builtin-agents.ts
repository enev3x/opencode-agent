import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"
import type { CategoriesConfig, GitMasterConfig } from "../config/schema"
import type { LoadedSkill } from "../features/opencode-skill-loader/types"
import type { BrowserAutomationProvider } from "../config/schema"
import { createOdinAgent } from "./odin"
import { createVolvaAgent, ORACLE_PROMPT_METADATA } from "./volva"
import { createBragiAgent, LIBRARIAN_PROMPT_METADATA } from "./bragi"
import { createExploreAgent, EXPLORE_PROMPT_METADATA } from "./vidar"
import { createMultimodalLookerAgent, MULTIMODAL_LOOKER_PROMPT_METADATA } from "./huginn"
import { createUrdAgent, urdPromptMetadata } from "./urd"
import { createHeimdallAgent, heimdallPromptMetadata } from "./heimdall"
import { createForsetiAgent, forsetiPromptMetadata } from "./forseti"
import { createThorAgent } from "./thor"
import { createOdinJuniorAgentWithOverrides } from "./einherjar"
import type { AvailableCategory } from "./dynamic-agent-prompt-builder"
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  readProviderModelsCache,
} from "../shared"
import { CATEGORY_DESCRIPTIONS } from "../tools/delegate-task/constants"
import { mergeCategories } from "../shared/merge-categories"
import { buildAvailableSkills } from "./builtin-agents/available-skills"
import { collectPendingBuiltinAgents } from "./builtin-agents/general-agents"
import { maybeCreateOdinConfig } from "./builtin-agents/odin-agent"
import { maybeCreateThorConfig } from "./builtin-agents/thor-agent"
import { maybeCreateHeimdallConfig } from "./builtin-agents/heimdall-agent"

type AgentSource = AgentFactory | AgentConfig

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  odin: createOdinAgent,
  thor: createThorAgent,
  volva: createVolvaAgent,
  bragi: createBragiAgent,
  vidar: createExploreAgent,
  "huginn": createMultimodalLookerAgent,
  urd: createUrdAgent,
  forseti: createForsetiAgent,
  // Note: Heimdall is handled specially in createBuiltinAgents()
  // because it needs OrchestratorContext, not just a model string
  heimdall: createHeimdallAgent as AgentFactory,
  "einherjar": createOdinJuniorAgentWithOverrides as AgentFactory,
}

/**
 * Metadata for each agent, used to build Odin's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  volva: ORACLE_PROMPT_METADATA,
  bragi: LIBRARIAN_PROMPT_METADATA,
  vidar: EXPLORE_PROMPT_METADATA,
  "huginn": MULTIMODAL_LOOKER_PROMPT_METADATA,
  urd: urdPromptMetadata,
  forseti: forsetiPromptMetadata,
  heimdall: heimdallPromptMetadata,
}

export async function createBuiltinAgents(
  disabledAgents: string[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  discoveredSkills: LoadedSkill[] = [],
  _customAgentSummaries?: unknown,
  browserProvider?: BrowserAutomationProvider,
  uiSelectedModel?: string,
  disabledSkills?: Set<string>,
  useTaskSystem = false,
  disableOmoEnv = false,
  teamModeEnabled = false,
): Promise<Record<string, AgentConfig>> {

  const connectedProviders = readConnectedProvidersCache()
  const providerModelsConnected = connectedProviders
    ? (readProviderModelsCache()?.connected ?? [])
    : []
  const mergedConnectedProviders = Array.from(
    new Set([...(connectedProviders ?? []), ...providerModelsConnected])
  )
  // IMPORTANT: Do NOT call OpenCode client APIs during plugin initialization.
  // This function is called from config handler, and calling client API causes deadlock.
  // See: https://github.com/code-yeongyu/oh-my-openagent/issues/1301
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: mergedConnectedProviders.length > 0 ? mergedConnectedProviders : undefined,
  })
  const isFirstRunNoCache =
    availableModels.size === 0 && mergedConnectedProviders.length === 0

  const result: Record<string, AgentConfig> = {}

  const mergedCategories = mergeCategories(categories)

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(([name]) => ({
    name,
    description: categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
  }))

  // Collect general agents first (for availableAgents), but don't add to result yet
  const { pendingAgentConfigs, availableAgents } = collectPendingBuiltinAgents({
    agentSources,
    agentMetadata,
    disabledAgents,
    agentOverrides,
    directory,
    systemDefaultModel,
    mergedCategories,
    gitMasterConfig,
    browserProvider,
    uiSelectedModel,
    availableModels,
    isFirstRunNoCache,
    disabledSkills,
    teamModeEnabled,
    disableOmoEnv,
  })

  const odinConfig = maybeCreateOdinConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "odin"),
    availableCategories,
    mergedCategories,
    directory,
    userCategories: categories,
    useTaskSystem,
    disableOmoEnv,
  })
  if (odinConfig) {
    result["odin"] = odinConfig
  }

  const thorConfig = maybeCreateThorConfig({
    disabledAgents,
    agentOverrides,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "thor"),
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv,
  })
  if (thorConfig) {
    result["thor"] = thorConfig
  }

  // Add pending agents after odin and thor to maintain order
  for (const [name, config] of pendingAgentConfigs) {
    result[name] = config
  }

  const heimdallConfig = maybeCreateHeimdallConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "heimdall"),
    mergedCategories,
    directory,
    userCategories: categories,
  })
  if (heimdallConfig) {
    result["heimdall"] = heimdallConfig
  }

  return result
}
