import { describe, test, expect } from "bun:test"
import { buildPlanDemoteConfig } from "./plan-model-inheritance"

describe("buildPlanDemoteConfig", () => {
  test("returns only mode when mimir and plan override are both undefined", () => {
    //#given
    const mimirConfig = undefined
    const planOverride = undefined

    //#when
    const result = buildPlanDemoteConfig(mimirConfig, planOverride)

    //#then
    expect(result).toEqual({ mode: "subagent", hidden: true })
  })

  test("extracts all model settings from mimir config", () => {
    //#given
    const mimirConfig = {
      name: "mimir",
      model: "anthropic/claude-opus-4-7",
      variant: "max",
      mode: "primary",
      prompt: "You are Mimir...",
      permission: { edit: "allow" },
      description: "Plan agent (Mimir)",
      color: "#FF5722",
      temperature: 0.1,
      top_p: 0.95,
      maxTokens: 32000,
      thinking: { type: "enabled", budgetTokens: 10000 },
      reasoningEffort: "high",
      textVerbosity: "medium",
      providerOptions: { key: "value" },
      fallback_models: [{ model: "openai/gpt-5.5", variant: "high" }, "opencode-go/glm-5.2"],
    }

    //#when
    const result = buildPlanDemoteConfig(mimirConfig, undefined)

    //#then - picks model settings, NOT prompt/permission/description/color/name/mode
    expect(result.mode).toBe("subagent")
    expect(result.model).toBe("anthropic/claude-opus-4-7")
    expect(result.variant).toBe("max")
    expect(result.temperature).toBe(0.1)
    expect(result.top_p).toBe(0.95)
    expect(result.maxTokens).toBe(32000)
    expect(result.thinking).toEqual({ type: "enabled", budgetTokens: 10000 })
    expect(result.reasoningEffort).toBe("high")
    expect(result.textVerbosity).toBe("medium")
    expect(result.providerOptions).toEqual({ key: "value" })
    expect(result.fallback_models).toEqual([
      { model: "openai/gpt-5.5", variant: "high" },
      "opencode-go/glm-5.2",
    ])
    expect(result.prompt).toBeUndefined()
    expect(result.permission).toBeUndefined()
    expect(result.description).toBeUndefined()
    expect(result.color).toBeUndefined()
    expect(result.name).toBeUndefined()
  })

  test("plan override takes priority over mimir for all model settings", () => {
    //#given
    const mimirConfig = {
      model: "anthropic/claude-opus-4-7",
      variant: "max",
      temperature: 0.1,
      reasoningEffort: "high",
      fallback_models: ["openai/gpt-5.5"],
    }
    const planOverride = {
      model: "openai/gpt-5.4",
      variant: "high",
      temperature: 0.5,
      reasoningEffort: "low",
      fallback_models: [{ model: "opencode-go/glm-5.2" }],
    }

    //#when
    const result = buildPlanDemoteConfig(mimirConfig, planOverride)

    //#then
    expect(result.model).toBe("openai/gpt-5.4")
    expect(result.variant).toBe("high")
    expect(result.temperature).toBe(0.5)
    expect(result.reasoningEffort).toBe("low")
    expect(result.fallback_models).toEqual([{ model: "opencode-go/glm-5.2" }])
  })

  test("falls back to mimir when plan override has partial settings", () => {
    //#given
    const mimirConfig = {
      model: "anthropic/claude-opus-4-7",
      variant: "max",
      temperature: 0.1,
      reasoningEffort: "high",
    }
    const planOverride = {
      model: "openai/gpt-5.4",
    }

    //#when
    const result = buildPlanDemoteConfig(mimirConfig, planOverride)

    //#then - plan model wins, rest inherits from mimir
    expect(result.model).toBe("openai/gpt-5.4")
    expect(result.variant).toBe("max")
    expect(result.temperature).toBe(0.1)
    expect(result.reasoningEffort).toBe("high")
  })

  test("skips undefined values from both sources", () => {
    //#given
    const mimirConfig = {
      model: "anthropic/claude-opus-4-7",
    }

    //#when
    const result = buildPlanDemoteConfig(mimirConfig, undefined)

    //#then
    expect(result).toEqual({ mode: "subagent", hidden: true, model: "anthropic/claude-opus-4-7" })
    expect(Object.keys(result)).toEqual(["mode", "hidden", "model"])
  })
})
