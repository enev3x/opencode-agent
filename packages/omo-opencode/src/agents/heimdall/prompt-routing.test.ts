import { describe, test, expect } from "bun:test"
import { getHeimdallPromptSource } from "./agent"

describe("getHeimdallPromptSource routes each model family to its dedicated variant", () => {
  test("GPT models route to gpt", () => {
    expect(getHeimdallPromptSource("openai/gpt-5.5")).toBe("gpt")
    expect(getHeimdallPromptSource("openai/gpt-5.4")).toBe("gpt")
    expect(getHeimdallPromptSource("github-copilot/gpt-5.5")).toBe("gpt")
  })

  test("Gemini models route to gemini", () => {
    expect(getHeimdallPromptSource("google/gemini-3.1-pro")).toBe("gemini")
    expect(getHeimdallPromptSource("google-vertex/gemini-2.5-flash")).toBe("gemini")
    expect(getHeimdallPromptSource("github-copilot/gemini-2.0-pro")).toBe("gemini")
  })

  test("Kimi K2.x models route to kimi", () => {
    expect(getHeimdallPromptSource("moonshotai/kimi-k2.6")).toBe("kimi")
    expect(getHeimdallPromptSource("kimi-for-coding/k2p6")).toBe("kimi")
    expect(getHeimdallPromptSource("opencode-go/kimi-k2.5")).toBe("kimi")
  })

  test("Kimi K3 routes to its own variant, ahead of K2.7 and generic kimi", () => {
    expect(getHeimdallPromptSource("opencode-go/kimi-k3")).toBe("kimi-k3")
    expect(getHeimdallPromptSource("kimi-for-coding/k3p1")).toBe("kimi-k3")
  })

  test("Kimi K2.7 routes to its own variant, ahead of generic kimi", () => {
    expect(getHeimdallPromptSource("opencode-go/kimi-k2.7")).toBe("kimi-k2-7")
    expect(getHeimdallPromptSource("kimi-for-coding/k2p7")).toBe("kimi-k2-7")
  })

  test("Claude Opus 4.7 routes to opus-4-7", () => {
    expect(getHeimdallPromptSource("anthropic/claude-opus-4-7")).toBe("opus-4-7")
    expect(getHeimdallPromptSource("github-copilot/claude-opus-4.7")).toBe("opus-4-7")
  })

  test("Claude 4.6 family (opus-4-6, sonnet-4-6, haiku-4-5) routes to default", () => {
    expect(getHeimdallPromptSource("anthropic/claude-opus-4-6")).toBe("default")
    expect(getHeimdallPromptSource("anthropic/claude-sonnet-4-6")).toBe("default")
    expect(getHeimdallPromptSource("anthropic/claude-haiku-4-5")).toBe("default")
  })

  test("GLM models route to glm", () => {
    expect(getHeimdallPromptSource("zai-coding-plan/glm-5.1")).toBe("glm")
    expect(getHeimdallPromptSource("zai/glm-5.2")).toBe("glm")
  })

  test("undefined model falls through to default", () => {
    expect(getHeimdallPromptSource(undefined)).toBe("default")
  })

  test("unrecognized model falls through to default", () => {
    expect(getHeimdallPromptSource("opencode-go/big-pickle")).toBe("default")
  })

  test("GPT detection takes priority over Claude family naming", () => {
    expect(getHeimdallPromptSource("openai/gpt-claude-something")).toBe("gpt")
  })

  test("Gemini detection precedes Kimi when both could match", () => {
    expect(getHeimdallPromptSource("google/gemini-3.1-pro")).toBe("gemini")
  })
})
