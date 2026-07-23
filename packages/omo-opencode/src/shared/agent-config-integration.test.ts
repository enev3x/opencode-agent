import { describe, test, expect } from "bun:test"
import { migrateAgentNames } from "./migration"
import { getAgentDisplayName } from "./agent-display-names"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("Agent Config Integration", () => {
  describe("Old format config migration", () => {
    test("migrates old format agent keys to lowercase", () => {
      // given - config with old format keys
      const oldConfig = {
        Odin: { model: "anthropic/claude-opus-4-7" },
        Heimdall: { model: "anthropic/claude-opus-4-7" },
        "Mimir - Plan Builder": { model: "anthropic/claude-opus-4-7" },
        "Urd - Plan Consultant": { model: "anthropic/claude-sonnet-4-6" },
        "Forseti - Plan Critic": { model: "anthropic/claude-sonnet-4-6" },
      }

      // when - migration is applied
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("odin")
      expect(result.migrated).toHaveProperty("heimdall")
      expect(result.migrated).toHaveProperty("mimir")
      expect(result.migrated).toHaveProperty("urd")
      expect(result.migrated).toHaveProperty("forseti")

      // then - old keys are removed
      expect(result.migrated).not.toHaveProperty("Odin")
      expect(result.migrated).not.toHaveProperty("Heimdall")
      expect(result.migrated).not.toHaveProperty("Mimir - Plan Builder")
      expect(result.migrated).not.toHaveProperty("Urd - Plan Consultant")
      expect(result.migrated).not.toHaveProperty("Forseti - Plan Critic")

      // then - values are preserved
      expect(result.migrated.odin).toEqual({ model: "anthropic/claude-opus-4-7" })
      expect(result.migrated.heimdall).toEqual({ model: "anthropic/claude-opus-4-7" })
      expect(result.migrated.mimir).toEqual({ model: "anthropic/claude-opus-4-7" })
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })

    test("preserves already lowercase keys", () => {
      // given - config with lowercase keys
      const config = {
        odin: { model: "anthropic/claude-opus-4-7" },
        volva: { model: "openai/gpt-5.4" },
        bragi: { model: "opencode/deepseek-v4-flash" },
      }

      // when - migration is applied
      const result = migrateAgentNames(config)

      // then - keys remain unchanged
      expect(result.migrated).toEqual(config)
      
      // then - changed flag is false
      expect(result.changed).toBe(false)
    })

    test("handles mixed case config", () => {
      // given - config with mixed old and new format
      const mixedConfig = {
        Odin: { model: "anthropic/claude-opus-4-7" },
        volva: { model: "openai/gpt-5.4" },
        "Mimir - Plan Builder": { model: "anthropic/claude-opus-4-7" },
        bragi: { model: "opencode/deepseek-v4-flash" },
      }

      // when - migration is applied
      const result = migrateAgentNames(mixedConfig)

      // then - all keys are lowercase
      expect(result.migrated).toHaveProperty("odin")
      expect(result.migrated).toHaveProperty("volva")
      expect(result.migrated).toHaveProperty("mimir")
      expect(result.migrated).toHaveProperty("bragi")
      expect(Object.keys(result.migrated).every((key) => key === key.toLowerCase())).toBe(true)
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })
  })

  describe("Display name resolution", () => {
    test("returns correct display names for all builtin agents", () => {
      // given - lowercase config keys
      const agents = ["odin", "thor", "mimir", "heimdall", "urd", "forseti", "volva", "bragi", "vidar", "huginn"]

      // when - display names are requested
      const displayNames = agents.map((agent) => getAgentDisplayName(agent))

      // then - display names are correct
      expect(displayNames).toContain("Odin - ultraworker")
      expect(displayNames).toContain("Thor - Deep Agent")
      expect(displayNames).toContain("Mimir - Plan Builder")
      expect(displayNames).toContain("Heimdall - Plan Executor")
      expect(displayNames).toContain("Urd - Plan Consultant")
      expect(displayNames).toContain("Forseti - Plan Critic")
      expect(displayNames).toContain("volva")
      expect(displayNames).toContain("bragi")
      expect(displayNames).toContain("vidar")
      expect(displayNames).toContain("huginn")
    })

    test("handles lowercase keys case-insensitively", () => {
      // given - various case formats of lowercase keys
      const keys = ["Odin", "Heimdall", "SISYPHUS", "heimdall", "mimir", "PROMETHEUS"]

      // when - display names are requested
      const displayNames = keys.map((key) => getAgentDisplayName(key))

      // then - correct display names are returned
      expect(displayNames[0]).toBe("Odin - ultraworker")
      expect(displayNames[1]).toBe("Heimdall - Plan Executor")
      expect(displayNames[2]).toBe("Odin - ultraworker")
      expect(displayNames[3]).toBe("Heimdall - Plan Executor")
      expect(displayNames[4]).toBe("Mimir - Plan Builder")
      expect(displayNames[5]).toBe("Mimir - Plan Builder")
    })

    test("returns original key for unknown agents", () => {
      // given - unknown agent key
      const unknownKey = "custom-agent"

      // when - display name is requested
      const displayName = getAgentDisplayName(unknownKey)

      // then - original key is returned
      expect(displayName).toBe(unknownKey)
    })
  })

  describe("Model requirements integration", () => {
    test("all model requirements use lowercase keys", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking key format
      const allLowercase = agentKeys.every((key) => key === key.toLowerCase())

      // then - all keys are lowercase
      expect(allLowercase).toBe(true)
    })

    test("model requirements include all builtin agents", () => {
      // given - expected builtin agents
      const expectedAgents = ["odin", "thor", "mimir", "heimdall", "urd", "forseti", "volva", "bragi", "vidar", "huginn"]

      // when - checking AGENT_MODEL_REQUIREMENTS
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // then - all expected agents are present
      for (const agent of expectedAgents) {
        expect(agentKeys).toContain(agent)
      }
    })

    test("no uppercase keys in model requirements", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking for uppercase keys
      const uppercaseKeys = agentKeys.filter((key) => key !== key.toLowerCase())

      // then - no uppercase keys exist
      expect(uppercaseKeys).toEqual([])
    })
  })

  describe("End-to-end config flow", () => {
    test("old config migrates and displays correctly", () => {
      // given - old format config
      const oldConfig = {
        Odin: { model: "anthropic/claude-opus-4-7", temperature: 0.1 },
        "Mimir - Plan Builder": { model: "anthropic/claude-opus-4-7" },
      }

      // when - config is migrated
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("odin")
      expect(result.migrated).toHaveProperty("mimir")

      // when - display names are retrieved
      const odinDisplay = getAgentDisplayName("odin")
      const mimirDisplay = getAgentDisplayName("mimir")

      // then - display names are correct
      expect(odinDisplay).toBe("Odin - ultraworker")
      expect(mimirDisplay).toBe("Mimir - Plan Builder")

      // then - config values are preserved
      expect(result.migrated.odin).toEqual({ model: "anthropic/claude-opus-4-7", temperature: 0.1 })
      expect(result.migrated.mimir).toEqual({ model: "anthropic/claude-opus-4-7" })
    })

    test("new config works without migration", () => {
      // given - new format config (already lowercase)
      const newConfig = {
        odin: { model: "anthropic/claude-opus-4-7" },
        heimdall: { model: "anthropic/claude-opus-4-7" },
      }

      // when - migration is applied (should be no-op)
      const result = migrateAgentNames(newConfig)

      // then - config is unchanged
      expect(result.migrated).toEqual(newConfig)
      
      // then - changed flag is false
      expect(result.changed).toBe(false)

      // when - display names are retrieved
      const odinDisplay = getAgentDisplayName("odin")
      const heimdallDisplay = getAgentDisplayName("heimdall")

      // then - display names are correct
      expect(odinDisplay).toBe("Odin - ultraworker")
      expect(heimdallDisplay).toBe("Heimdall - Plan Executor")
    })
  })
})
