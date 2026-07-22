import { describe, test, expect } from "bun:test"
import { getHeimdallPrompt } from "./agent"

const ALL_VARIANTS: Array<[string, string]> = [
  ["default", getHeimdallPrompt("anthropic/claude-sonnet-4-6")],
  ["gpt", getHeimdallPrompt("openai/gpt-5.5")],
  ["gemini", getHeimdallPrompt("google/gemini-3.1-pro")],
  ["kimi", getHeimdallPrompt("moonshotai/kimi-k2.6")],
  ["opus-4-7", getHeimdallPrompt("anthropic/claude-opus-4-7")],
]

describe("ATLAS prompt checkbox enforcement", () => {
  for (const [name, prompt] of ALL_VARIANTS) {
    describe(`${name} prompt`, () => {
      test("plan should NOT be marked (READ ONLY)", () => {
        expect(prompt).not.toMatch(/\(READ ONLY\)/)
      })

      test("plan description should include EDIT for checkboxes", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/edit.*checkbox|checkbox.*edit/)
      })

      test("boundaries should include exception for editing .omo/plans/*.md checkboxes", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/\.omo\/plans\/\*\.md/)
        expect(lowerPrompt).toMatch(/checkbox/)
      })

      test("prompt should include POST-DELEGATION RULE", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/post-delegation/)
      })

      test("prompt should include MUST NOT call a new task() before", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/must not.*call.*new.*task/)
      })

      test("prompt should NOT reference .omo/tasks/", () => {
        expect(prompt).not.toMatch(/\.omo\/tasks\//)
      })
    })
  }
})
