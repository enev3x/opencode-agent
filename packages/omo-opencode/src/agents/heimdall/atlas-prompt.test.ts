import { describe, test, expect } from "bun:test"
import { getHeimdallPrompt } from "./agent"

const ALL_VARIANTS: Array<[string, string]> = [
  ["default", getHeimdallPrompt("anthropic/claude-sonnet-4-6")],
  ["gpt", getHeimdallPrompt("openai/gpt-5.5")],
  ["gemini", getHeimdallPrompt("google/gemini-3.1-pro")],
  ["kimi", getHeimdallPrompt("moonshotai/kimi-k2.6")],
  ["kimi-k2-7", getHeimdallPrompt("opencode-go/kimi-k2.7")],
  ["kimi-k3", getHeimdallPrompt("opencode-go/kimi-k3")],
  ["opus-4-7", getHeimdallPrompt("anthropic/claude-opus-4-7")],
]

describe("Heimdall prompts boulder-completion response", () => {
  test("all variants document the boulder-complete nudge response", () => {
    for (const [name, prompt] of ALL_VARIANTS) {
      expect(prompt, `${name}: missing boulder_completion_response section`).toContain("<boulder_completion_response>")
      expect(prompt, `${name}: missing BOULDER COMPLETE recognition phrase`).toContain("BOULDER COMPLETE")
      expect(prompt, `${name}: missing TOTAL ELAPSED summary field`).toContain("TOTAL ELAPSED")
      expect(prompt, `${name}: missing PER-TASK ELAPSED summary field`).toContain("PER-TASK ELAPSED")
    }
  })
})
