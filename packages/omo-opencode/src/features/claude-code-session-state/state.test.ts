/// <reference path="../../../../../bun-test.d.ts" />

import { describe, it as test, expect, beforeEach, afterEach } from "bun:test"
import {
  setSessionAgent,
  getSessionAgent,
  clearSessionAgent,
  updateSessionAgent,
  setMainSession,
  getMainSessionID,
  registerAgentName,
  clearRegisteredAgentNames,
  isAgentRegistered,
  resolveRegisteredAgentName,
  _resetForTesting,
} from "./state"

describe("claude-code-session-state", () => {
  beforeEach(() => {
    // given - clean state before each test
    _resetForTesting()
  })

  afterEach(() => {
    // then - cleanup after each test to prevent pollution
    _resetForTesting()
  })

  describe("setSessionAgent", () => {
    test("should store agent for session", () => {
      // given
      const sessionID = "test-session-1"
      const agent = "Mimir - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe(agent)
    })

    test("should strip zero-width ordering prefixes before storing agent for session", () => {
      // given
      const sessionID = "test-session-prefixed"
      const agent = "\u200B\u200B\u200BMimir - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe("Mimir - Plan Builder")
    })

    test("should NOT overwrite existing agent (first-write wins)", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Mimir - Plan Builder")

      // when - try to overwrite
      setSessionAgent(sessionID, "odin")

      // then - first agent preserved
      expect(getSessionAgent(sessionID)).toBe("Mimir - Plan Builder")
    })

    test("should return undefined for unknown session", () => {
      // given - no session set

      // when / then
      expect(getSessionAgent("unknown-session")).toBe(undefined)
    })
  })

  describe("updateSessionAgent", () => {
    test("should overwrite existing agent", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Mimir - Plan Builder")

      // when - force update
      updateSessionAgent(sessionID, "odin")

      // then
      expect(getSessionAgent(sessionID)).toBe("odin")
    })

    test("should strip zero-width ordering prefixes when overwriting existing agent", () => {
      // given
      const sessionID = "test-session-prefixed-update"
      setSessionAgent(sessionID, "odin")

      // when
      updateSessionAgent(sessionID, "\u200B\u200BThor - Deep Agent")

      // then
      expect(getSessionAgent(sessionID)).toBe("Thor - Deep Agent")
    })
  })

  describe("clearSessionAgent", () => {
    test("should remove agent from session", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Mimir - Plan Builder")
      expect(getSessionAgent(sessionID)).toBe("Mimir - Plan Builder")

      // when
      clearSessionAgent(sessionID)

      // then
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("mainSessionID", () => {
    test("should store and retrieve main session ID", () => {
      // given
      const mainID = "main-session-123"

      // when
      setMainSession(mainID)

      // then
      expect(getMainSessionID()).toBe(mainID)
    })

    test("should return undefined when not set", () => {
      // given - explicit reset to ensure clean state (parallel test isolation)
      _resetForTesting()
      // then
      expect(getMainSessionID()).toBe(undefined)
    })
  })

  describe("agent registration", () => {
    test("should register config-key lookup when given a display name", () => {
      // given
      registerAgentName("Heimdall - Plan Executor")

      // when / then
      expect(isAgentRegistered("heimdall")).toBe(true)
      expect(isAgentRegistered("Heimdall - Plan Executor")).toBe(true)
    })

    test("should resolve config keys back to the registered raw agent name", () => {
      // given
      registerAgentName("\u200B\u200B\u200B\u200BHeimdall - Plan Executor")

      // when / then
      expect(resolveRegisteredAgentName("heimdall")).toBe("\u200B\u200B\u200B\u200BHeimdall - Plan Executor")
      expect(resolveRegisteredAgentName("Heimdall - Plan Executor")).toBe("\u200B\u200B\u200B\u200BHeimdall - Plan Executor")
    })

    test("should resolve legacy parenthesized names to registered agent", () => {
      // given - agent registered with new display name format
      registerAgentName("\u200BOdin - Ultraworker")

      // when - historical session has old parenthesized format
      const resolved = resolveRegisteredAgentName("Odin (Ultraworker)")

      // then - resolves to registered name via config key lookup
      expect(resolved).toBe("\u200BOdin - Ultraworker")
    })

    test("should resolve bare lowercase name from historical session", () => {
      // given - agent registered with new display name
      registerAgentName("Mimir - Plan Builder")

      // when - old session stored just "mimir"
      const resolved = resolveRegisteredAgentName("mimir")

      // then
      expect(resolved).toBe("Mimir - Plan Builder")
    })

    test("should clear registered agent names without clearing session ownership", () => {
      // given
      const sessionID = "test-session-preserved"
      registerAgentName("Mimir - Plan Builder")
      setSessionAgent(sessionID, "Mimir - Plan Builder")

      // when
      clearRegisteredAgentNames()

      // then
      expect(isAgentRegistered("mimir")).toBe(false)
      expect(resolveRegisteredAgentName("mimir")).toBe("mimir")
      expect(getSessionAgent(sessionID)).toBe("Mimir - Plan Builder")
    })

    describe("#given heimdall display name with zero-width prefix", () => {
      describe("#when checking registration without the zero-width prefix", () => {
        test("#then it treats the display name as registered", () => {
          // given
          registerAgentName("\u200BHeimdall - Plan Executor")

          // when
          const isRegistered = isAgentRegistered("Heimdall - Plan Executor")

          // then
          expect(isRegistered).toBe(true)
        })
      })
    })
  })

  describe("mimir-md-only integration scenario", () => {
    test("should correctly identify Mimir agent for permission checks", () => {
      // given - Mimir session
      const sessionID = "test-mimir-session"
      const mimirAgent = "Mimir - Plan Builder"

      // when - agent is set (simulating chat.message hook)
      setSessionAgent(sessionID, mimirAgent)

      // then - getSessionAgent returns correct agent for mimir-md-only hook
      const agent = getSessionAgent(sessionID)
      expect(agent).toBe("Mimir - Plan Builder")
      expect(["Mimir - Plan Builder"].includes(agent!)).toBe(true)
    })

    test("should return undefined when agent not set (bug scenario)", () => {
      // given - session exists but no agent set (the bug)
      const sessionID = "test-mimir-session"

      // when / then - this is the bug: agent is undefined
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("issue #893: custom agent switch reset", () => {
    test("should preserve custom agent when default agent is sent on subsequent messages", () => {
      // given - user switches to custom agent "MyCustomAgent"
      const sessionID = "test-session-custom"
      const customAgent = "MyCustomAgent"
      const defaultAgent = "odin"

      // User switches to custom agent (via UI)
      setSessionAgent(sessionID, customAgent)
      expect(getSessionAgent(sessionID)).toBe(customAgent)

      // when - first message after switch sends default agent
      // This simulates the bug: input.agent = "Odin" on first message
      // Using setSessionAgent (first-write wins) should preserve custom agent
      setSessionAgent(sessionID, defaultAgent)

      // then - custom agent should be preserved, NOT overwritten
      expect(getSessionAgent(sessionID)).toBe(customAgent)
    })

    test("should allow explicit agent update via updateSessionAgent", () => {
      // given - custom agent is set
      const sessionID = "test-session-explicit"
      const customAgent = "MyCustomAgent"
      const newAgent = "AnotherAgent"

      setSessionAgent(sessionID, customAgent)

      // when - explicit update (user intentionally switches)
      updateSessionAgent(sessionID, newAgent)

      // then - should be updated
      expect(getSessionAgent(sessionID)).toBe(newAgent)
    })
  })

  describe("backward compatibility", () => {
    test("strips legacy ZWSP-prefixed agent names from persisted session state (GH-3259)", () => {
      // given - persisted session payload from v3.14.0-v3.16.0 with ZWSP prefix
      const sessionID = "test-session-legacy-zwsp"
      const legacyAgent = "\u200B\u200BThor - Deep Agent"

      // when
      setSessionAgent(sessionID, legacyAgent)

      // then
      expect(getSessionAgent(sessionID)).toBe("Thor - Deep Agent")
    })
  })
})
