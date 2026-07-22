/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { KIMI_TOOL_LOOP_GUARD } from "./kimi-tool-loop-guard"
import { buildKimiK26OdinPrompt } from "./odin/kimi-k2-6"
import { buildKimiK26OdinJuniorPrompt } from "./einherjar/kimi-k2-6"

// Kimi prompt builders embed the shared KIMI_TOOL_LOOP_GUARD artifact verbatim
// (odin/kimi-k2-6.ts, einherjar/kimi-k2-6.ts). Assert the real
// artifact is present, not its wording.
describe("Kimi tool-call loop guardrails", () => {
  test("#given Kimi Odin prompt #when built #then the shared tool-loop guard artifact is embedded", () => {
    const prompt = buildKimiK26OdinPrompt("opencode-go/kimi-k2.6", [])

    expect(prompt).toContain(KIMI_TOOL_LOOP_GUARD)
  })

  test("#given Kimi Einherjar prompt #when built #then the shared tool-loop guard artifact is embedded", () => {
    const prompt = buildKimiK26OdinJuniorPrompt(false)

    expect(prompt).toContain(KIMI_TOOL_LOOP_GUARD)
  })
})
