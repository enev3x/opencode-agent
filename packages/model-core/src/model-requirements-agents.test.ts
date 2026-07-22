import { describe, expect, test } from "bun:test"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("AGENT_MODEL_REQUIREMENTS", () => {
  test("volva has gpt-5.6-sol xhigh as primary", () => {
    // given
    const volva = AGENT_MODEL_REQUIREMENTS["volva"]

    // when
    const primary = volva.fallbackChain[0]

    // then
    expect(volva.fallbackChain).toBeArray()
    expect(volva.fallbackChain.length).toBeGreaterThan(0)
    expect(primary).toEqual({
      providers: ["openai", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "xhigh",
    })
    expect(volva.fallbackChain[1]).toEqual({
      providers: ["github-copilot"],
      model: "gpt-5.6-sol",
      variant: "high",
    })
  })

  test("odin keeps opus primary before Kimi K3, gpt-5.6-sol, GLM, and big-pickle fallbacks", () => {
    // given
    const odin = AGENT_MODEL_REQUIREMENTS["odin"]

    // when
    const [primary, second, solFallback, fourth, last] = odin.fallbackChain

    // then
    expect(odin.fallbackChain).toHaveLength(5)
    expect(odin.requiresAnyModel).toBe(true)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-opus-4-8",
      variant: "max",
    })
    expect(second).toEqual({
      providers: [
        "opencode-go",
        "kimi-for-coding",
        "moonshotai",
        "opencode",
        "vercel",
        "bailian-coding-plan",
        "moonshotai-cn",
        "firmware",
        "ollama-cloud",
        "aihubmix",
      ],
      model: "kimi-k3",
    })
    expect(solFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "medium",
    })
    expect(fourth?.providers[0]).toBe("zai-coding-plan")
    expect(fourth?.model).toBe("glm-5")
    expect(last?.providers[0]).toBe("opencode")
    expect(last?.model).toBe("big-pickle")
  })

  test("bragi keeps fast OpenAI primary before qwen, minimax, haiku, and nano fallbacks", () => {
    // given
    const bragi = AGENT_MODEL_REQUIREMENTS["bragi"]

    // when
    const [primary, second, third, fourth, fifth, sixth, seventh, eighth] =
      bragi.fallbackChain

    // then
    expect(bragi.fallbackChain).toHaveLength(8)
    expect(primary).toEqual({ providers: ["openai"], model: "gpt-5.4-mini-fast" })
    expect(second?.providers).toContain("opencode-go")
    expect(second?.providers).toContain("bailian-coding-plan")
    expect(second?.model).toBe("qwen3.5-plus")
    expect(third).toEqual({ providers: ["vercel"], model: "minimax-m2.7-highspeed" })
    expect(fourth?.providers).toContain("opencode-go")
    expect(fourth?.model).toBe("minimax-m3")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.providers).toContain("opencode-go")
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(seventh?.providers).toContain("anthropic")
    expect(seventh?.model).toBe("claude-haiku-4-5")
    expect(eighth?.providers).toContain("openai")
    expect(eighth?.model).toBe("gpt-5.4-nano")
  })

  test("explore keeps fast OpenAI primary before qwen, minimax, haiku, and nano fallbacks", () => {
    // given
    const explore = AGENT_MODEL_REQUIREMENTS["vidar"]

    // when
    const [primary, second, third, fourth, fifth, sixth, seventh, eighth] = explore.fallbackChain

    // then
    expect(explore.fallbackChain).toHaveLength(8)
    expect(primary).toEqual({ providers: ["openai"], model: "gpt-5.4-mini-fast" })
    expect(second?.providers).toContain("opencode-go")
    expect(second?.providers).toContain("bailian-coding-plan")
    expect(second?.model).toBe("qwen3.5-plus")
    expect(third).toEqual({ providers: ["vercel"], model: "minimax-m2.7-highspeed" })
    expect(fourth?.providers).toContain("opencode-go")
    expect(fourth?.model).toBe("minimax-m3")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.providers).toContain("opencode-go")
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(seventh?.providers).toContain("anthropic")
    expect(seventh?.model).toBe("claude-haiku-4-5")
    expect(eighth?.providers).toContain("openai")
    expect(eighth?.model).toBe("gpt-5.4-nano")
  })

  test("huginn keeps vision-capable fallback order", () => {
    // given
    const multimodalLooker = AGENT_MODEL_REQUIREMENTS["huginn"]

    // when
    const [primary, secondary, tertiary, last] = multimodalLooker.fallbackChain

    // then
    expect(multimodalLooker.fallbackChain).toHaveLength(4)
    expect(primary).toEqual({
      providers: ["openai", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "low",
    })
    expect(secondary).toEqual({ providers: ["opencode-go", "vercel"], model: "kimi-k3" })
    expect(tertiary?.model).toBe("glm-4.6v")
    expect(last).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5-nano",
    })
  })

  test("mimir keeps claude-opus-4-8 primary before gpt-5.6-sol high", () => {
    // given
    const mimir = AGENT_MODEL_REQUIREMENTS["mimir"]

    // when
    const [primary, gptFallback] = mimir.fallbackChain

    // then
    expect(mimir.fallbackChain.length).toBeGreaterThan(1)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-opus-4-8",
      variant: "max",
    })
    expect(gptFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "high",
    })
  })

  test("urd has sonnet primary, opus fallback, and gpt-5.6-sol medium fallback", () => {
    // given
    const urd = AGENT_MODEL_REQUIREMENTS["urd"]

    // when
    const primary = urd.fallbackChain[0]
    const opusFallback = urd.fallbackChain[1]
    const openAiFallback = urd.fallbackChain.find((entry) => entry.providers.includes("openai"))

    // then
    expect(urd.fallbackChain.length).toBeGreaterThan(1)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-sonnet-4-6",
    })
    expect(opusFallback?.model).toBe("claude-opus-4-8")
    expect(opusFallback?.variant).toBe("max")
    expect(urd.fallbackChain.at(-1)).toEqual({ providers: ["kimi-for-coding"], model: "kimi-k3" })
    expect(openAiFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "medium",
    })
  })

  test("forseti keeps native gpt-5.6-terra high before gpt-5.6-sol xhigh", () => {
    // given
    const forseti = AGENT_MODEL_REQUIREMENTS["forseti"]

    // when
    const [primary, copilot, solFallback, copilotSolFallback, opusFallback] = forseti.fallbackChain

    // then
    expect(forseti.fallbackChain.length).toBeGreaterThan(1)
    expect(primary).toEqual({
      providers: ["openai", "vercel"],
      model: "gpt-5.6-terra",
      variant: "high",
    })
    expect(copilot).toEqual({
      providers: ["github-copilot"],
      model: "gpt-5.6-terra",
      variant: "high",
    })
    expect(solFallback).toEqual({
      providers: ["openai", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "xhigh",
    })
    expect(copilotSolFallback).toEqual({
      providers: ["github-copilot"],
      model: "gpt-5.6-sol",
      variant: "high",
    })
    expect(opusFallback).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-opus-4-8",
      variant: "max",
    })
  })

  test("heimdall keeps sonnet, kimi, gpt-5.6-sol, and minimax fallback order", () => {
    // given
    const heimdall = AGENT_MODEL_REQUIREMENTS["heimdall"]

    // when
    const [primary, secondary, solFallback, fourth, fifth, sixth] = heimdall.fallbackChain

    // then
    expect(heimdall.fallbackChain).toHaveLength(6)
    expect(primary?.model).toBe("claude-sonnet-4-6")
    expect(primary?.providers[0]).toBe("anthropic")
    expect(secondary?.model).toBe("kimi-k3")
    expect(secondary?.providers[0]).toBe("opencode-go")
    expect(solFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.6-sol",
      variant: "medium",
    })
    expect(fourth?.model).toBe("minimax-m3")
    expect(fourth?.providers[0]).toBe("opencode-go")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(sixth?.providers[0]).toBe("opencode-go")
  })

  test("einherjar keeps sonnet, Kimi, minimax, and big-pickle fallbacks", () => {
    // given
    const odinJunior = AGENT_MODEL_REQUIREMENTS["einherjar"]

    // when
    const modelIDs = odinJunior.fallbackChain.map((entry) => entry.model)

    // then
    expect(modelIDs).toEqual([
      "claude-sonnet-4-6",
      "kimi-k3",
      "gpt-5.6-sol",
      "minimax-m3",
      "MiniMax-M3",
      "minimax-m2.7",
      "big-pickle",
    ])
    expect(modelIDs).not.toContain("gpt-5.5")
  })

  test("thor supports openai, github-copilot, opencode, and vercel providers", () => {
    // given
    const thor = AGENT_MODEL_REQUIREMENTS["thor"]

    // when / then
    expect(thor.requiresProvider).toEqual([
      "openai",
      "github-copilot",
      "opencode",
      "vercel",
    ])
    expect(thor.requiresProvider).not.toContain("venice")
    expect(thor.fallbackChain[0]?.providers).not.toContain("venice")
    expect(thor.requiresModel).toBeUndefined()
    expect(thor.requiresAnyModel).toBe(true)
  })

  test("thor has one merged gpt-5.6-sol medium rung", () => {
    // given
    const thor = AGENT_MODEL_REQUIREMENTS["thor"]

    // when
    const [primary] = thor.fallbackChain

    // then
    expect(thor.fallbackChain).toHaveLength(1)
    expect(primary).toEqual({
      providers: ["openai", "github-copilot", "vercel", "opencode"],
      model: "gpt-5.6-sol",
      variant: "medium",
    })
  })
})
