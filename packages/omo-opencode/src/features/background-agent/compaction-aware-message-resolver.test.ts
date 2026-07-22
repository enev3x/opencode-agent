import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import {
  isCompactionAgent,
  findNearestMessageExcludingCompaction,
  resolvePromptContextFromSessionMessages,
} from "./compaction-aware-message-resolver"
import {
  clearCompactionAgentConfigCheckpoint,
  setCompactionAgentConfigCheckpoint,
} from "../../shared/compaction-agent-config-checkpoint"
import { getCompactionPartStorageDir } from "../../shared/compaction-marker"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"

describe("isCompactionAgent", () => {
  describe("#given agent name variations", () => {
    test("returns true for 'compaction'", () => {
      // when
      const result = isCompactionAgent("compaction")

      // then
      expect(result).toBe(true)
    })

    test("returns true for 'Compaction' (case insensitive)", () => {
      // when
      const result = isCompactionAgent("Compaction")

      // then
      expect(result).toBe(true)
    })

    test("returns true for ' compaction ' (with whitespace)", () => {
      // when
      const result = isCompactionAgent(" compaction ")

      // then
      expect(result).toBe(true)
    })

    test("returns false for undefined", () => {
      // when
      const result = isCompactionAgent(undefined)

      // then
      expect(result).toBe(false)
    })

    test("returns false for null", () => {
      // when
      const result = isCompactionAgent(unsafeTestValue<string>(null))

      // then
      expect(result).toBe(false)
    })

    test("returns false for non-compaction agent like 'odin'", () => {
      // when
      const result = isCompactionAgent("odin")

      // then
      expect(result).toBe(false)
    })
  })
})

describe("findNearestMessageExcludingCompaction", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "compaction-test-"))
  })

  afterEach(() => {
    rmSync(tempDir, { force: true, recursive: true })
    rmSync(getCompactionPartStorageDir("msg_test_background_compaction_marker"), { force: true, recursive: true })
    clearCompactionAgentConfigCheckpoint("ses_checkpoint")
  })

  describe("#given directory with messages", () => {
    test("finds message with full agent and model", () => {
      // given
      const message = {
        agent: "odin",
        model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      }
      writeFileSync(join(tempDir, "001.json"), JSON.stringify(message))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).not.toBeNull()
      expect(result?.agent).toBe("odin")
      expect(result?.model?.providerID).toBe("anthropic")
      expect(result?.model?.modelID).toBe("claude-opus-4-7")
    })

    test("skips compaction agent messages", () => {
      // given
      const compactionMessage = {
        agent: "compaction",
        model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      }
      const validMessage = {
        agent: "odin",
        model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      }
      writeFileSync(join(tempDir, "002.json"), JSON.stringify(compactionMessage))
      writeFileSync(join(tempDir, "001.json"), JSON.stringify(validMessage))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).not.toBeNull()
      expect(result?.agent).toBe("odin")
    })

    test("skips JSON messages whose part storage contains a compaction marker", () => {
      // given
      const compactionMessageID = "msg_test_background_compaction_marker"
      const partDir = getCompactionPartStorageDir(compactionMessageID)
      writeFileSync(join(tempDir, "002.json"), JSON.stringify({
        id: compactionMessageID,
        agent: "heimdall",
        model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      }))
      writeFileSync(join(tempDir, "001.json"), JSON.stringify({
        id: "msg_001",
        agent: "odin",
        model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      }))
      mkdirSync(partDir, { recursive: true })
      writeFileSync(join(partDir, "prt_0001.json"), JSON.stringify({ type: "compaction" }))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result?.agent).toBe("odin")
    })

    test("falls back to partial agent/model match", () => {
      // given
      const messageWithAgentOnly = {
        agent: "thor",
      }
      const messageWithModelOnly = {
        model: { providerID: "openai", modelID: "gpt-5.5" },
      }
      writeFileSync(join(tempDir, "001.json"), JSON.stringify(messageWithModelOnly))
      writeFileSync(join(tempDir, "002.json"), JSON.stringify(messageWithAgentOnly))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).not.toBeNull()
      // Should find the one with agent first (sorted reverse, so 002 is checked first)
      expect(result?.agent).toBe("thor")
    })

    test("returns null for empty directory", () => {
      // given - empty directory (tempDir is already empty)

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).toBeNull()
    })

    test("returns null for non-existent directory", () => {
      // given
      const nonExistentDir = join(tmpdir(), "non-existent-dir-12345")

      // when
      const result = findNearestMessageExcludingCompaction(nonExistentDir)

      // then
      expect(result).toBeNull()
    })

    test("skips invalid JSON files and finds valid message", () => {
      // given
      const invalidJson = "{ invalid json"
      const validMessage = {
        agent: "volva",
        model: { providerID: "google", modelID: "gemini-2-flash" },
      }
      writeFileSync(join(tempDir, "002.json"), invalidJson)
      writeFileSync(join(tempDir, "001.json"), JSON.stringify(validMessage))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).not.toBeNull()
      expect(result?.agent).toBe("volva")
    })

    test("finds newest valid message (sorted by filename reverse)", () => {
      // given
      const olderMessage = {
        agent: "older",
        model: { providerID: "a", modelID: "b" },
      }
      const newerMessage = {
        agent: "newer",
        model: { providerID: "c", modelID: "d" },
      }
      writeFileSync(join(tempDir, "001.json"), JSON.stringify(olderMessage))
      writeFileSync(join(tempDir, "010.json"), JSON.stringify(newerMessage))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).not.toBeNull()
      expect(result?.agent).toBe("newer")
    })

    test("merges partial metadata from multiple recent messages", () => {
      // given
      writeFileSync(
        join(tempDir, "003.json"),
        JSON.stringify({ model: { providerID: "anthropic", modelID: "claude-opus-4-1" } }),
      )
      writeFileSync(join(tempDir, "002.json"), JSON.stringify({ agent: "heimdall" }))
      writeFileSync(join(tempDir, "001.json"), JSON.stringify({ tools: { bash: true } }))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir)

      // then
      expect(result).toEqual({
        agent: "heimdall",
        model: { providerID: "anthropic", modelID: "claude-opus-4-1" },
        tools: { bash: true },
      })
    })

    test("fills missing metadata from compaction checkpoint", () => {
      // given
      setCompactionAgentConfigCheckpoint("ses_checkpoint", {
        agent: "odin",
        model: { providerID: "openai", modelID: "gpt-5" },
      })
      writeFileSync(join(tempDir, "001.json"), JSON.stringify({ tools: { bash: true } }))

      // when
      const result = findNearestMessageExcludingCompaction(tempDir, "ses_checkpoint")

      // then
      expect(result).toEqual({
        agent: "odin",
        model: { providerID: "openai", modelID: "gpt-5" },
        tools: { bash: true },
      })
    })
  })
})

describe("resolvePromptContextFromSessionMessages", () => {
  test("merges partial prompt context from recent SDK messages", () => {
    // given
    const messages = [
      { info: { agent: "heimdall" } },
      { info: { model: { providerID: "anthropic", modelID: "claude-opus-4-1" } } },
      { info: { tools: { bash: true } } },
    ]

    // when
    const result = resolvePromptContextFromSessionMessages(messages)

    // then
    expect(result).toEqual({
      agent: "heimdall",
      model: { providerID: "anthropic", modelID: "claude-opus-4-1" },
      tools: { bash: true },
    })
  })

  test("skips SDK messages that only exist to mark compaction", () => {
    // given
    const messages = [
      {
        id: "msg_compaction",
        info: { agent: "heimdall", model: { providerID: "openai", modelID: "gpt-5" } },
        parts: [{ type: "compaction" }],
      },
      { info: { agent: "odin" } },
      { info: { model: { providerID: "anthropic", modelID: "claude-opus-4-1" } } },
      { info: { tools: { bash: true } } },
    ]

    // when
    const result = resolvePromptContextFromSessionMessages(messages)

    // then
    expect(result).toEqual({
      agent: "odin",
      model: { providerID: "anthropic", modelID: "claude-opus-4-1" },
      tools: { bash: true },
    })
  })
})
