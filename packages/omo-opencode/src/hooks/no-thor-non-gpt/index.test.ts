/// <reference types="bun-types" />

import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoThorNonGptHook } from "./index"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"

const HEPHAESTUS_DISPLAY = getAgentDisplayName("thor")
const SISYPHUS_DISPLAY = getAgentDisplayName("odin")

function createOutput() {
  return {
    message: {} as { agent?: string; [key: string]: unknown },
    parts: [],
  }
}

describe("no-thor-non-gpt hook", () => {
  test("shows toast on every chat.message when thor uses non-gpt model", async () => {
    // given - thor with claude model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoThorNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: HEPHAESTUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: HEPHAESTUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output2)

    // then - toast is shown and agent is switched to odin
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("odin")
    expect(output2.message.agent).toBe("odin")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Thor with Non-GPT",
        message: expect.stringContaining("Thor is trash without GPT."),
        variant: "error",
      },
    })
  })

  test("shows warning and does not switch agent when allow_non_gpt_model is enabled", async () => {
    // given - thor with claude model and opt-out enabled
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoThorNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }), {
      allowNonGptModel: true,
    })

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_opt_out",
      agent: HEPHAESTUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - warning toast is shown but agent is not switched
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBeUndefined()
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Thor with Non-GPT",
        variant: "warning",
      },
    })
  })

  test("does not show toast when thor uses gpt model", async () => {
    // given - thor with gpt model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoThorNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: HEPHAESTUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.5" },
    }, output)

    // then - no toast, agent unchanged
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-thor agent", async () => {
    // given - odin with claude model (non-gpt)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoThorNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: SISYPHUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved as thor
    _resetForTesting()
    updateSessionAgent("ses_4", HEPHAESTUS_DISPLAY)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoThorNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - toast shown via session-agent fallback, switched to odin
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("odin")
  })
})
