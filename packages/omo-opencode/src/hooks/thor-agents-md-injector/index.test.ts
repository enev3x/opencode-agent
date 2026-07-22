/// <reference types="bun-types" />

import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, test } from "bun:test"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"
import { createThorAgentsMdInjectorHook } from "./index"

const HEPHAESTUS_DISPLAY = getAgentDisplayName("thor")
const SISYPHUS_DISPLAY = getAgentDisplayName("odin")

let temporaryDirectory = ""

function createOutput(text = "Implement the thing") {
  return {
    message: {},
    parts: [{ type: "text", text }],
  }
}

describe("thor agents md injector hook", () => {
  afterEach(() => {
    if (temporaryDirectory.length > 0) {
      rmSync(temporaryDirectory, { recursive: true, force: true })
      temporaryDirectory = ""
    }
  })

  test("injects project AGENTS.md into the first Thor user message", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "thor-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Always force-load this rule.")
    const hook = createThorAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_hep",
      agent: HEPHAESTUS_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toContain(`[Directory Context: ${realpathSync(join(temporaryDirectory, "AGENTS.md"))}]`)
    expect(output.parts[0]?.text).toContain("Always force-load this rule.")
    expect(output.parts[0]?.text).toEndWith("Implement the thing")
  })

  test("does not inject AGENTS.md for non-Thor agents", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "thor-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Thor-only rule.")
    const hook = createThorAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_sis",
      agent: SISYPHUS_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toBe("Implement the thing")
  })

  test("does not inject when an earlier hook switched Thor to another agent", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "thor-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Should not be injected.")
    const hook = createThorAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()
    output.message.agent = "odin"

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_switched",
      agent: HEPHAESTUS_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toBe("Implement the thing")
  })

  test("injects AGENTS.md once per Thor session", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "thor-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Inject me once.")
    const hook = createThorAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const firstOutput = createOutput("First")
    const secondOutput = createOutput("Second")

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_once",
      agent: HEPHAESTUS_DISPLAY,
    }, firstOutput)
    await hook["chat.message"]?.({
      sessionID: "ses_once",
      agent: HEPHAESTUS_DISPLAY,
    }, secondOutput)

    // then
    expect(firstOutput.parts[0]?.text).toContain("Inject me once.")
    expect(secondOutput.parts[0]?.text).toBe("Second")
  })
})
