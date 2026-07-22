/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { AGENT_NAME_MAP, migrateAgentNames } from "./agent-names"

describe("AGENT_NAME_MAP parenthesized aliases", () => {
  test("maps Odin (Ultraworker) to odin", () => {
    // given
    const alias = "Odin (Ultraworker)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("odin")
  })

  test("maps Thor (Deep Agent) to thor", () => {
    // given
    const alias = "Thor (Deep Agent)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("thor")
  })

  test("maps Mimir (Plan Builder) to mimir", () => {
    // given
    const alias = "Mimir (Plan Builder)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("mimir")
  })

  test("maps Heimdall (Plan Executor) to heimdall", () => {
    // given
    const alias = "Heimdall (Plan Executor)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("heimdall")
  })

  test("maps Urd (Plan Consultant) to urd", () => {
    // given
    const alias = "Urd (Plan Consultant)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("urd")
  })

  test("maps Forseti (Plan Critic) to forseti", () => {
    // given
    const alias = "Forseti (Plan Critic)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("forseti")
  })
})

describe("migrateAgentNames with parenthesized aliases", () => {
  test("migrates all parenthesized aliases to canonical names", () => {
    // given
    const legacyAgents = {
      "Odin (Ultraworker)": { model: "claude-opus-4" },
      "Thor (Deep Agent)": { model: "gpt-5.4" },
      "Mimir (Plan Builder)": { model: "claude-opus-4" },
      "Heimdall (Plan Executor)": { model: "kimi-k2.5" },
      "Urd (Plan Consultant)": { model: "claude-opus-4" },
      "Forseti (Plan Critic)": { model: "claude-opus-4" },
    }

    // when
    const { migrated, changed } = migrateAgentNames(legacyAgents)

    // then
    expect(changed).toBe(true)
    expect(migrated.odin).toEqual({ model: "claude-opus-4" })
    expect(migrated.thor).toEqual({ model: "gpt-5.4" })
    expect(migrated.mimir).toEqual({ model: "claude-opus-4" })
    expect(migrated.heimdall).toEqual({ model: "kimi-k2.5" })
    expect(migrated.urd).toEqual({ model: "claude-opus-4" })
    expect(migrated.forseti).toEqual({ model: "claude-opus-4" })
    expect(migrated["Odin (Ultraworker)"]).toBeUndefined()
    expect(migrated["Thor (Deep Agent)"]).toBeUndefined()
  })
})
