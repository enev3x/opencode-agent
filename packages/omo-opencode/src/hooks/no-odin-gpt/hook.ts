import type { PluginInput } from "@opencode-ai/plugin"
import { isGpt5_5Model, isGptModel, isGptNativeOdinModel } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { AGENT_MODEL_REQUIREMENTS, log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

const TOAST_TITLE = "NEVER Use Odin with GPT"
const TOAST_MESSAGE = [
  "Odin works best with Claude Opus, and works fine with Kimi/GLM models.",
  "Do NOT use Odin with GPT (except GPT-5.4, GPT-5.5, and GPT-5.6 Sol, which have GPT-native prompt support).",
  "For other GPT models, always use Thor.",
].join("\n")
function showToast(ctx: PluginInput, sessionID: string): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant: "error",
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-odin-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

function getNativeOdinGptVariant(model: { providerID: string; modelID: string }): string | undefined {
  if (isGpt5_5Model(model.modelID)) return "medium"

  const chain = AGENT_MODEL_REQUIREMENTS["odin"]?.fallbackChain ?? []
  const exactMatch = chain.find((entry) =>
    entry.providers.includes(model.providerID) && entry.model === model.modelID
  )
  if (exactMatch?.variant !== undefined) {
    return exactMatch.variant
  }

  return chain.find((entry) => entry.model === model.modelID)?.variant
}

export function createNoOdinGptHook(ctx: PluginInput) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getAgentConfigKey(rawAgent)
      const modelID = input.model?.modelID

      if (
        agentKey === "odin"
        && input.model
        && modelID
        && isGptNativeOdinModel(modelID)
        && output?.message
        && output.message.variant === undefined
      ) {
        const variant = getNativeOdinGptVariant(input.model)
        if (variant !== undefined) {
          output.message.variant = variant
        }
      }

      if (agentKey === "odin" && modelID && isGptModel(modelID) && !isGptNativeOdinModel(modelID)) {
        showToast(ctx, input.sessionID)
        input.agent = resolveRegisteredAgentName("thor") ?? "thor"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("thor") ?? "thor"
        }
        updateSessionAgent(input.sessionID, "thor")
      }
    },
  }
}
