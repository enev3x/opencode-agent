import { describe, expect, test } from "bun:test"

import { createOdinAgent } from "./odin"
import { createThorAgent, UnsupportedThorModelError } from "./thor"
import { maybeCreateThorConfig } from "./builtin-agents/thor-agent"
import { buildOdinJuniorPrompt } from "./einherjar"
import type { AgentOverrides } from "./types"
import type { CategoryConfig } from "../config/schema"

const GPT_APPLY_PATCH_PHRASE = "Use `apply_patch` for file edits"
const GPT_ONLY_FILE_TOOL_PHRASE = "only file-editing tool available here"

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1
}

describe("GPT apply_patch prompt guidance", () => {
  test("#given GPT-5.5 Odin #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const agent = createOdinAgent(model)

    // then
    expect(countOccurrences(agent.prompt ?? "", GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given GPT-5.5 Einherjar #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const prompt = buildOdinJuniorPrompt(model, false)

    // then
    expect(countOccurrences(prompt, GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given GPT-5.5 Thor #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const agent = createThorAgent(model)

    // then
    expect(countOccurrences(agent.prompt ?? "", GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given non-GPT Odin variants #when rendering prompts #then GPT-only apply_patch guidance is absent", () => {
    // given
    const models = [
      "opencode-go/kimi-k2.7",
      "moonshotai/kimi-k2.6",
      "anthropic/claude-opus-4-8",
    ]

    for (const model of models) {
      // when
      const agent = createOdinAgent(model)

      // then
      expect(agent.prompt).not.toContain(GPT_APPLY_PATCH_PHRASE)
      expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
    }
  })

  test("#given non-GPT Thor variants #when rendering prompts #then Thor is rejected", () => {
    // given
    const models = [
      "opencode-go/qwen3.7-plus",
      "opencode-go/qwen3.7PLUS",
      "qwen3.7PLUS",
      "bailian-coding-plan/qwen3.7PLUS",
      "Qwen3.7PLUS",
      "opencode-go/qwen3.5-plus",
    ]

    for (const model of models) {
      // when
      const createAgent = () => createThorAgent(model)

      // then
      expect(createAgent).toThrow(UnsupportedThorModelError)
    }
  })

  test("#given non-GPT Thor override #when plugin config creates the agent #then Thor is not registered", () => {
    // given
    const agentOverrides: AgentOverrides = {
      thor: {
        model: "opencode-go/qwen3.7PLUS",
      },
    }
    const mergedCategories: Record<string, CategoryConfig> = {}

    // when
    const config = maybeCreateThorConfig({
      disabledAgents: [],
      agentOverrides,
      availableModels: new Set(["opencode-go/qwen3.7PLUS"]),
      systemDefaultModel: "opencode-go/qwen3.7PLUS",
      isFirstRunNoCache: false,
      availableAgents: [],
      availableSkills: [],
      availableCategories: [],
      mergedCategories,
      useTaskSystem: false,
    })

    // then
    expect(config).toBeUndefined()
  })
})
