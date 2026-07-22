import { describe, it, expect } from "bun:test"
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("remapAgentKeysToDisplayNames", () => {
  it("remaps known agent keys to display names", () => {
    // given agents with lowercase keys
    const agents = {
      odin: { prompt: "test", mode: "primary" },
      volva: { prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then known agents get display name keys only
    expect(result[getAgentListDisplayName("odin")]).toBeDefined()
    expect(result["volva"]).toBeDefined()
    expect(result["odin"]).toBeUndefined()
  })

  it("preserves unknown agent keys unchanged", () => {
    // given agents with a custom key
    const agents = {
      "custom-agent": { prompt: "custom" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then custom key is unchanged
    expect(result["custom-agent"]).toBeDefined()
  })

  it("remaps all core agents to display names", () => {
    // given all core agents
    const agents = {
      odin: {},
      thor: {},
      mimir: {},
      heimdall: {},
      athena: {},
      urd: {},
      forseti: {},
      "einherjar": {},
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then all get display name keys
    expect(result[getAgentListDisplayName("odin")]).toBeDefined()
    expect(result["odin"]).toBeUndefined()
    expect(result[getAgentListDisplayName("thor")]).toBeDefined()
    expect(result["thor"]).toBeUndefined()
    expect(result[getAgentListDisplayName("mimir")]).toBeDefined()
    expect(result["mimir"]).toBeUndefined()
    expect(result[getAgentListDisplayName("heimdall")]).toBeDefined()
    expect(result["heimdall"]).toBeUndefined()
    expect(result[getAgentDisplayName("athena")]).toBeDefined()
    expect(result["athena"]).toBeUndefined()
    expect(result[getAgentDisplayName("urd")]).toBeDefined()
    expect(result["urd"]).toBeUndefined()
    expect(result[getAgentDisplayName("forseti")]).toBeDefined()
    expect(result["forseti"]).toBeUndefined()
    expect(result[getAgentDisplayName("einherjar")]).toBeDefined()
    expect(result["einherjar"]).toBeUndefined()
  })

  it("does not emit both config and display keys for remapped agents", () => {
    // given one remapped agent
    const agents = {
      odin: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then only display key is emitted
    expect(Object.keys(result)).toEqual([getAgentListDisplayName("odin")])
    expect(result[getAgentListDisplayName("odin")]).toBeDefined()
    expect(result["odin"]).toBeUndefined()
  })

  it("returns runtime core agent list names in canonical order", () => {
    // given
    const result = remapAgentKeysToDisplayNames({
      heimdall: {},
      mimir: {},
      thor: {},
      odin: {},
    })

    // when
    const remappedNames = Object.keys(result)

    // then
    expect(remappedNames).toEqual([
      getAgentListDisplayName("heimdall"),
      getAgentListDisplayName("mimir"),
      getAgentListDisplayName("thor"),
      getAgentListDisplayName("odin"),
    ])
  })

  it("keeps remapped core agent name fields aligned with OpenCode list ordering", () => {
    // given agents with raw config-key names
    const agents = {
      odin: { name: "odin", prompt: "test", mode: "primary" },
      thor: { name: "thor", prompt: "test", mode: "primary" },
      mimir: { name: "mimir", prompt: "test", mode: "primary" },
      heimdall: { name: "heimdall", prompt: "test", mode: "primary" },
      volva: { name: "volva", prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then keys and names both use the same runtime-facing list names
    expect(Object.keys(result).slice(0, 4)).toEqual([
      getAgentListDisplayName("odin"),
      getAgentListDisplayName("thor"),
      getAgentListDisplayName("mimir"),
      getAgentListDisplayName("heimdall"),
    ])
    expect(result[getAgentListDisplayName("odin")]).toEqual({
      name: getAgentListDisplayName("odin"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("thor")]).toEqual({
      name: getAgentListDisplayName("thor"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("mimir")]).toEqual({
      name: getAgentListDisplayName("mimir"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("heimdall")]).toEqual({
      name: getAgentListDisplayName("heimdall"),
      prompt: "test",
      mode: "primary",
    })
    expect(result.volva).toEqual({ name: "volva", prompt: "test", mode: "subagent" })
  })

  it("backfills runtime names for core agents when builtin configs omit name", () => {
    // given builtin-style configs without name fields
    const agents = {
      odin: { prompt: "test", mode: "primary" },
      thor: { prompt: "test", mode: "primary" },
      mimir: { prompt: "test", mode: "primary" },
      heimdall: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then runtime-facing names stay aligned even when builtin configs omit name
    expect(result[getAgentListDisplayName("odin")]).toEqual({
      name: getAgentListDisplayName("odin"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("thor")]).toEqual({
      name: getAgentListDisplayName("thor"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("mimir")]).toEqual({
      name: getAgentListDisplayName("mimir"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("heimdall")]).toEqual({
      name: getAgentListDisplayName("heimdall"),
      prompt: "test",
      mode: "primary",
    })
  })

  it("emits a single literal display-name row with no ZWSP for a single core agent", () => {
    // given a single core agent input
    const agents = {
      odin: { foo: "bar" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then exactly one row is emitted under the clean literal display name
    const displayName = getAgentListDisplayName("odin")
    expect(Object.keys(result)).toEqual([displayName])
    expect(result[displayName]).toEqual({
      name: displayName,
      foo: "bar",
    })
  })

  describe("displayName i18n override (#4004)", () => {
    it("uses per-agent displayName override when set", () => {
      // given odin config with a Chinese displayName override
      const agents = {
        odin: { prompt: "test", mode: "primary" },
      }
      const overrides = {
        odin: { displayName: "总指挥" },
      }

      // when remapping with overrides
      const result = remapAgentKeysToDisplayNames(agents, overrides)

      // then the localized name is used instead of "Odin - Ultraworker"
      expect(result["总指挥"]).toBeDefined()
      expect((result["总指挥"] as Record<string, unknown>).name).toBe("总指挥")
      expect(result["Odin - Ultraworker"]).toBeUndefined()
    })

    it("falls back to hardcoded English name when displayName is not set", () => {
      // given odin config without displayName override
      const agents = {
        odin: { prompt: "test", mode: "primary" },
      }
      const overrides = {
        odin: { model: "claude-opus-4-7" },
      }

      // when remapping with overrides that have no displayName
      const result = remapAgentKeysToDisplayNames(agents, overrides)

      // then the legacy AGENT_DISPLAY_NAMES value is used
      expect(result[getAgentListDisplayName("odin")]).toBeDefined()
      expect(result["总指挥"]).toBeUndefined()
    })

    it("falls back to hardcoded English name when no overrides are passed", () => {
      // given odin config with no overrides at all
      const agents = {
        odin: { prompt: "test", mode: "primary" },
      }

      // when remapping without overrides
      const result = remapAgentKeysToDisplayNames(agents)

      // then the legacy AGENT_DISPLAY_NAMES value is used
      expect(result[getAgentListDisplayName("odin")]).toBeDefined()
    })
  })
})
