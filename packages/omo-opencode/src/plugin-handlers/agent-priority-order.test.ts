/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import {
  reorderAgentsByPriority,
  CANONICAL_CORE_AGENT_ORDER,
} from "./agent-priority-order"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("agent-priority-order", () => {
  describe("CANONICAL_CORE_AGENT_ORDER", () => {
    // given: The canonical order constant must exist and be correct

    test("exports canonical order as readonly array", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toBeDefined()
      expect(Array.isArray(CANONICAL_CORE_AGENT_ORDER)).toBe(true)
    })

    test("canonical order is exactly [odin, thor, mimir, heimdall]", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toEqual([
        "odin",
        "thor",
        "mimir",
        "heimdall",
      ])
    })

    test("canonical order length is exactly 4", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toHaveLength(4)
    })
  })

  describe("reorderAgentsByPriority", () => {
    // given: display names for all core agents
    const odin = getAgentListDisplayName("odin")
    const thor = getAgentListDisplayName("thor")
    const mimir = getAgentListDisplayName("mimir")
    const heimdall = getAgentListDisplayName("heimdall")
    const volva = getAgentDisplayName("volva")
    const bragi = getAgentDisplayName("bragi")
    const explore = getAgentDisplayName("vidar")

    describe("#given agents in random order", () => {
      test("#when all core agents present #then orders as odin→thor→mimir→heimdall", () => {
        // given: agents in reverse order
        const agents: Record<string, unknown> = {
          [heimdall]: { name: "heimdall" },
          [mimir]: { name: "mimir" },
          [thor]: { name: "thor" },
          [odin]: { name: "odin" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys[0]).toBe(odin)
        expect(keys[1]).toBe(thor)
        expect(keys[2]).toBe(mimir)
        expect(keys[3]).toBe(heimdall)
      })

      test("#when custom agent order is provided #then follows configured core ordering", () => {
        // given
        const agents: Record<string, unknown> = {
          [heimdall]: { name: "heimdall" },
          [mimir]: { name: "mimir" },
          [thor]: { name: "thor" },
          [odin]: { name: "odin" },
        }

        // when
        const result = reorderAgentsByPriority(agents, [
          "thor",
          "odin",
          "mimir",
          "heimdall",
        ])

        // then
        expect(Object.keys(result)).toEqual([thor, odin, mimir, heimdall])
      })

      test("#when custom agent order contains invalid entries #then ignores them and keeps valid/default ordering", () => {
        // given
        const agents: Record<string, unknown> = {
          [heimdall]: { name: "heimdall" },
          [mimir]: { name: "mimir" },
          [thor]: { name: "thor" },
          [odin]: { name: "odin" },
        }

        // when
        const result = reorderAgentsByPriority(agents, [
          "not-real",
          "heimdall",
          "thor",
          "heimdall",
        ])

        // then
        expect(Object.keys(result)).toEqual([heimdall, thor, odin, mimir])
      })

      test("#when core agents mixed with non-core #then core agents come first in canonical order", () => {
        // given: mixed order with non-core agents interleaved
        const agents: Record<string, unknown> = {
          [volva]: { name: "volva" },
          [heimdall]: { name: "heimdall" },
          [bragi]: { name: "bragi" },
          [mimir]: { name: "mimir" },
          [explore]: { name: "vidar" },
          [thor]: { name: "thor" },
          custom: { name: "custom" },
          [odin]: { name: "odin" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys.slice(0, 4)).toEqual([odin, thor, mimir, heimdall])
      })
    })

    describe("#given 100 random permutations", () => {
      test("#when reordered #then result is ALWAYS identical", () => {
        // given: base agent config
        const baseAgents = {
          [odin]: { name: "odin" },
          [thor]: { name: "thor" },
          [mimir]: { name: "mimir" },
          [heimdall]: { name: "heimdall" },
          [volva]: { name: "volva" },
          [bragi]: { name: "bragi" },
          custom1: { name: "custom1" },
          custom2: { name: "custom2" },
        }

        // given: shuffle function
        const shuffle = <T>(array: T[]): T[] => {
          const result = [...array]
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j], result[i]]
          }
          return result
        }

        // when: run 100 times with different key orders
        const results: string[][] = []
        for (let i = 0; i < 100; i++) {
          const shuffledKeys = shuffle(Object.keys(baseAgents))
          const shuffledAgents: Record<string, unknown> = {}
          for (const key of shuffledKeys) {
            shuffledAgents[key] = baseAgents[key]
          }
          const result = reorderAgentsByPriority(shuffledAgents)
          results.push(Object.keys(result))
        }

        // then: all results should have identical key order
        const firstResult = results[0]
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(firstResult)
        }

        // then: core agents are always first 4 in canonical order
        expect(firstResult.slice(0, 4)).toEqual([
          odin,
          thor,
          mimir,
          heimdall,
        ])
      })
    })

    describe("#given partial core agents", () => {
      test("#when only odin and heimdall present #then orders as odin→heimdall", () => {
        // given
        const agents: Record<string, unknown> = {
          [heimdall]: { name: "heimdall" },
          custom: { name: "custom" },
          [odin]: { name: "odin" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const odinIdx = keys.indexOf(odin)
        const heimdallIdx = keys.indexOf(heimdall)
        expect(odinIdx).toBeLessThan(heimdallIdx)
        expect(odinIdx).toBe(0)
      })

      test("#when only thor and mimir present #then orders as thor→mimir", () => {
        // given
        const agents: Record<string, unknown> = {
          [mimir]: { name: "mimir" },
          custom: { name: "custom" },
          [thor]: { name: "thor" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const thorIdx = keys.indexOf(thor)
        const mimirIdx = keys.indexOf(mimir)
        expect(thorIdx).toBeLessThan(mimirIdx)
        expect(thorIdx).toBe(0)
      })
    })

    describe("#given order field injection", () => {
      test("#when core agent is object #then injects order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [odin]: { name: "odin", mode: "primary" },
          [thor]: { name: "thor", mode: "primary" },
          [mimir]: { name: "mimir", mode: "primary" },
          [heimdall]: { name: "heimdall", mode: "primary" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[odin]).toEqual({ name: "odin", mode: "primary", order: 1 })
        expect(result[thor]).toEqual({ name: "thor", mode: "primary", order: 2 })
        expect(result[mimir]).toEqual({ name: "mimir", mode: "primary", order: 3 })
        expect(result[heimdall]).toEqual({ name: "heimdall", mode: "primary", order: 4 })
      })

      test("#when custom agent order is provided #then injects matching order fields", () => {
        // given
        const agents: Record<string, unknown> = {
          [odin]: { name: "odin", mode: "primary" },
          [thor]: { name: "thor", mode: "primary" },
        }

        // when
        const result = reorderAgentsByPriority(agents, ["thor", "odin"])

        // then
        expect(result[thor]).toEqual({ name: "thor", mode: "primary", order: 1 })
        expect(result[odin]).toEqual({ name: "odin", mode: "primary", order: 2 })
      })

      test("#when core agent is non-object #then leaves value unchanged", () => {
        // given
        const agents: Record<string, unknown> = {
          [odin]: "string-config",
          [heimdall]: null,
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[odin]).toBe("string-config")
        expect(result[heimdall]).toBe(null)
      })

      test("#when non-core agent #then does NOT inject order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [volva]: { name: "volva", mode: "subagent" },
          custom: { name: "custom" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[volva]).toEqual({ name: "volva", mode: "subagent" })
        expect(result.custom).toEqual({ name: "custom" })
      })
    })

    describe("#given non-core agent ordering", () => {
      test("#when multiple non-core agents #then sorted alphabetically after core agents", () => {
        // given: non-core agents in random order
        const agents: Record<string, unknown> = {
          zebra: { name: "zebra" },
          [odin]: { name: "odin" },
          apple: { name: "apple" },
          mango: { name: "mango" },
          [heimdall]: { name: "heimdall" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then: core agents first, then alphabetical
        const keys = Object.keys(result)
        expect(keys.slice(0, 2)).toEqual([odin, heimdall])
        expect(keys.slice(2)).toEqual(["apple", "mango", "zebra"])
      })
    })
  })
})
