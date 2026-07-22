import { describe, it, expect } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentConfigKey, getAgentDisplayName, getAgentListDisplayName, normalizeAgentForPrompt, normalizeAgentForPromptKey, stripAgentListSortPrefix } from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key (new format)", () => {
    // given config key "odin"
    const configKey = "odin"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Odin - ultraworker"
    expect(result).toBe("Odin - ultraworker")
  })

  it("returns display name for uppercase config key (old format - case-insensitive)", () => {
    // given config key "Odin" (old format)
    const configKey = "Odin"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Odin - ultraworker" (case-insensitive lookup)
    expect(result).toBe("Odin - ultraworker")
  })

  it("returns original key for unknown agents (fallback)", () => {
    // given config key "custom-agent"
    const configKey = "custom-agent"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent")
  })

  it("returns display name for heimdall", () => {
    // given config key "heimdall"
    const configKey = "heimdall"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Heimdall - Plan Executor"
    expect(result).toBe("Heimdall - Plan Executor")
  })

  it("returns display name for mimir", () => {
    // given config key "mimir"
    const configKey = "mimir"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Mimir - Plan Builder"
    expect(result).toBe("Mimir - Plan Builder")
  })

  it("returns display name for einherjar", () => {
    // given config key "einherjar"
    const configKey = "einherjar"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Einherjar"
    expect(result).toBe("Einherjar")
  })

  it("returns display name for urd", () => {
    // given config key "urd"
    const configKey = "urd"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Urd - Plan Consultant"
    expect(result).toBe("Urd - Plan Consultant")
  })

  it("returns display name for forseti", () => {
    // given config key "forseti"
    const configKey = "forseti"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Forseti - Plan Critic"
    expect(result).toBe("Forseti - Plan Critic")
  })

  it("returns display name for volva", () => {
    // given config key "volva"
    const configKey = "volva"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "volva"
    expect(result).toBe("volva")
  })

  it("returns display name for bragi", () => {
    // given config key "bragi"
    const configKey = "bragi"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "bragi"
    expect(result).toBe("bragi")
  })

  it("returns display name for explore", () => {
    // given config key "vidar"
    const configKey = "vidar"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "vidar"
    expect(result).toBe("vidar")
  })

  it("returns display name for huginn", () => {
    // given config key "huginn"
    const configKey = "huginn"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "huginn"
    expect(result).toBe("huginn")
  })

  it("preserves CJK display-name overrides verbatim", () => {
    expect(getAgentDisplayName("odin", { odin: { displayName: "Odin - 主脑" } })).toBe("Odin - 主脑")
    expect(getAgentDisplayName("thor", { thor: { displayName: "헤파이스토스" } })).toBe("헤파이스토스")
    expect(getAgentDisplayName("heimdall", { heimdall: { displayName: "アトラス" } })).toBe("アトラス")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves display name to config key", () => {
    // given display name "Odin - ultraworker"
    // when getAgentConfigKey called
    // then returns "odin"
    expect(getAgentConfigKey("Odin - ultraworker")).toBe("odin")
  })

  it("resolves display name case-insensitively", () => {
    // given display name in different case
    // when getAgentConfigKey called
    // then returns "heimdall"
    expect(getAgentConfigKey("heimdall - plan executor")).toBe("heimdall")
  })

  it("resolves legacy parenthesized display names", () => {
    // given legacy parenthesized display name from old configs/sessions
    // when getAgentConfigKey called
    // then resolves to canonical config key
    expect(getAgentConfigKey("Odin (Ultraworker)")).toBe("odin")
    expect(getAgentConfigKey("Heimdall (Plan Executor)")).toBe("heimdall")
  })

  it("passes through lowercase config keys unchanged", () => {
    // given lowercase config key "mimir"
    // when getAgentConfigKey called
    // then returns "mimir"
    expect(getAgentConfigKey("mimir")).toBe("mimir")
  })

  it("returns lowercased unknown agents", () => {
    // given unknown agent name
    // when getAgentConfigKey called
    // then returns lowercased
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
  })

  it("resolves all core agent display names", () => {
    // given all core display names
    // when/then each resolves to its config key
    expect(getAgentConfigKey("Thor - Deep Agent")).toBe("thor")
    expect(getAgentConfigKey("Mimir - Plan Builder")).toBe("mimir")
    expect(getAgentConfigKey("Heimdall - Plan Executor")).toBe("heimdall")
    expect(getAgentConfigKey("Urd - Plan Consultant")).toBe("urd")
    expect(getAgentConfigKey("Forseti - Plan Critic")).toBe("forseti")
    expect(getAgentConfigKey("Einherjar")).toBe("einherjar")
  })

  it("resolves heimdall even when the UI ordering prefix is present", () => {
    expect(getAgentConfigKey(getAgentListDisplayName("heimdall"))).toBe("heimdall")
  })

  it("resolves display names even when zero-width characters are embedded", () => {
    expect(getAgentConfigKey("Odin\u200B - Ultraworker")).toBe("odin")
    expect(getAgentConfigKey("\uFEFFHeimdall - Plan Executor")).toBe("heimdall")
  })
})

describe("getAgentListDisplayName", () => {
  it("returns the canonical display name for the core agent list", () => {
    expect(getAgentListDisplayName("odin")).toBe("Odin - ultraworker")
    expect(getAgentListDisplayName("thor")).toBe("Thor - Deep Agent")
    expect(getAgentListDisplayName("mimir")).toBe("Mimir - Plan Builder")
    expect(getAgentListDisplayName("heimdall")).toBe("Heimdall - Plan Executor")
  })

  it("keeps non-core agents unchanged for list display", () => {
    expect(getAgentListDisplayName("volva")).toBe("volva")
  })

  it("is a thin alias for getAgentDisplayName", () => {
    expect(getAgentListDisplayName("odin")).toBe(getAgentDisplayName("odin"))
  })
})

describe("stripAgentListSortPrefix", () => {
  it("strips legacy zero-width sort prefixes baked into v3.14.0–v3.16.0 sessions", () => {
    expect(stripAgentListSortPrefix("\u200B\u200BThor - Deep Agent")).toBe("Thor - Deep Agent")
  })

  it("strips leading and trailing wrapper characters after sort prefix removal", () => {
    expect(stripAgentListSortPrefix("\\Thor - Deep Agent\\")).toBe("Thor - Deep Agent")
  })
})

describe("normalizeAgentForPrompt", () => {
  it("strips core UI ordering prefixes back to canonical display names", () => {
    expect(normalizeAgentForPrompt(getAgentListDisplayName("odin"))).toBe("Odin - ultraworker")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("thor"))).toBe("Thor - Deep Agent")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("mimir"))).toBe("Mimir - Plan Builder")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("heimdall"))).toBe("Heimdall - Plan Executor")
  })

  it("removes zero-width characters before returning canonical names", () => {
    expect(normalizeAgentForPrompt("Odin\u200B - Ultraworker")).toBe("Odin - ultraworker")
  })

  it("converts legacy parenthesized names to canonical display names", () => {
    expect(normalizeAgentForPrompt("Heimdall (Plan Executor)")).toBe("Heimdall - Plan Executor")
  })
})

describe("normalizeAgentForPromptKey", () => {
  it("converts built-in display names to config keys", () => {
    expect(normalizeAgentForPromptKey("Odin (Ultraworker)")).toBe("odin")
  })

  it("strips UI ordering prefixes before returning config keys", () => {
    expect(normalizeAgentForPromptKey(getAgentListDisplayName("heimdall"))).toBe("heimdall")
  })

  it("preserves custom agents", () => {
    expect(normalizeAgentForPromptKey("MyCustomAgent")).toBe("MyCustomAgent")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected agent mappings", () => {
    // given expected mappings
    const expectedMappings = {
      odin: "Odin - ultraworker",
      thor: "Thor - Deep Agent",
      mimir: "Mimir - Plan Builder",
      heimdall: "Heimdall - Plan Executor",
      "einherjar": "Einherjar",
      urd: "Urd - Plan Consultant",
      forseti: "Forseti - Plan Critic",
      athena: "Athena - Council",
      "athena-junior": "Athena-Junior - Council",
      volva: "volva",
      bragi: "bragi",
      explore: "vidar",
      "huginn": "huginn",
      "council-member": "council-member",
    }

    // when checking the constant
    // then contains all expected mappings
    expect(AGENT_DISPLAY_NAMES).toEqual(expectedMappings)
  })

  it("all display names must be HTTP-header-safe (no parentheses)", () => {
    // given all agent display names
    const httpHeaderUnsafe = /[()]/

    // when checking each display name
    for (const [, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
      // then none should contain parentheses
      expect(httpHeaderUnsafe.test(displayName)).toBe(false)
    }
  })
})
