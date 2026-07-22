import { getModelCapabilities } from "@oh-my-opencode/model-core"
import type { GetModelCapabilitiesInput } from "@oh-my-opencode/model-core"

export type ModelHints = {
  modelID: string
  family?: string
  contextWindow?: number
  strengths: string[]
  strategy: string
}

const FAMILY_STRENGTHS: Record<string, string[]> = {
  gpt: ["structured tool calls", "function calling", "instruction following"],
  claude: ["extended reasoning", "long context", "thorough analysis"],
  kimi: ["long context", "tool use", "code generation"],
  gemini: ["multimodal", "long context", "fast inference"],
  glm: ["bilingual", "tool use", "reasoning"],
  grok: ["reasoning", "real-time knowledge"],
  qwen: ["bilingual", "long context", "code generation"],
  minimax: ["speed", "long context", "cost efficiency"],
  deepseek: ["reasoning", "code generation", "cost efficiency"],
}

const FAMILY_STRATEGIES: Record<string, string> = {
  gpt: "Exploit structured tool calls aggressively. Follow instructions precisely.",
  claude: "Leverage extended reasoning. Be thorough with context. Use thinking blocks for complex problems.",
  kimi: "Focus on tool-use patterns. Keep prompts clear and structured.",
  gemini: "Use multimodal capabilities when available. Be concise.",
  glm: "Use structured prompts. Bilingual context is an advantage.",
  grok: "Leverage reasoning for complex problems.",
  qwen: "Use structured prompts. Bilingual context helps.",
  minimax: "Prioritize speed. Keep prompts focused.",
  deepseek: "Leverage reasoning chains. Use structured output.",
}

function detectFamily(modelID: string): string | undefined {
  const lower = modelID.toLowerCase()
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3")) return "gpt"
  if (lower.includes("claude") || lower.includes("sonnet") || lower.includes("opus") || lower.includes("haiku")) return "claude"
  if (lower.includes("kimi")) return "kimi"
  if (lower.includes("gemini")) return "gemini"
  if (lower.includes("glm")) return "glm"
  if (lower.includes("grok")) return "grok"
  if (lower.includes("qwen")) return "qwen"
  if (lower.includes("minimax")) return "minimax"
  if (lower.includes("deepseek") || lower.includes("mimo")) return "deepseek"
  return undefined
}

export function getModelHints(
  modelID: string,
  providerID?: string,
  runtimeModel?: Record<string, unknown>,
): ModelHints {
  const caps = getModelCapabilities({
    providerID: providerID ?? "unknown",
    modelID,
    runtimeModel: runtimeModel as GetModelCapabilitiesInput["runtimeModel"],
  })

  const family = caps.family ?? detectFamily(modelID)
  const contextWindow = caps.maxOutputTokens
    ? caps.maxOutputTokens * 4 // rough estimate
    : undefined

  const strengths = [
    ...(family ? FAMILY_STRENGTHS[family] ?? [] : []),
    ...(caps.reasoning ? ["reasoning"] : []),
    ...(caps.toolCall ? ["tool calling"] : []),
    ...(caps.supportsThinking ? ["extended thinking"] : []),
  ]

  const strategy = family
    ? FAMILY_STRATEGIES[family] ?? "Use standard prompting. Adapt to model strengths."
    : "Use standard prompting. Adapt to model strengths."

  return {
    modelID,
    family,
    contextWindow,
    strengths: [...new Set(strengths)], // dedupe
    strategy,
  }
}

export function formatModelHints(hints: ModelHints): string {
  const parts = [`Model: ${hints.modelID}`]
  if (hints.family) parts.push(`Family: ${hints.family}`)
  if (hints.contextWindow) parts.push(`Context: ~${Math.round(hints.contextWindow / 1000)}k`)
  if (hints.strengths.length) parts.push(`Strengths: ${hints.strengths.join(", ")}`)
  parts.push(`Strategy: ${hints.strategy}`)
  return parts.join(" | ")
}
