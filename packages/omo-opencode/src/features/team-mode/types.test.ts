import { describe, expect, test } from "bun:test"
import {
  AGENT_ELIGIBILITY_REGISTRY,
  CategoryMemberSchema,
  MemberSchema,
  parseMember,
  SubagentMemberSchema,
  TeamSpecSchema,
} from "./types"

describe("team-mode types", () => {
  test("member category branch parses and narrows", () => {
    // given
    const member = { kind: "category", name: "m1", category: "deep", prompt: "impl X" }

    // when
    const result = MemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toMatchObject(member)
      expect(result.data).toMatchObject({ kind: "category", category: "deep" })
    }
  })

  test("both kinds rejected", () => {
    // given
    const member = {
      kind: "category",
      name: "m1",
      category: "deep",
      subagent_type: "odin",
      prompt: "impl X",
    }

    // when
    const result = MemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(false)
  })

  test("parseMember emits exact both kinds error", () => {
    // given
    const member = {
      name: "m1",
      kind: "category",
      category: "deep",
      subagent_type: "odin",
      prompt: "impl X",
    }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' specifies both 'category' and 'subagent_type'. Must specify exactly one via 'kind' discriminator.",
      )
    }
  })

  test("parseMember emits exact missing kind error", () => {
    // given
    const member = { name: "m1" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' missing 'kind' discriminator. Specify either {kind:'category', category, prompt} or {kind:'subagent_type', subagent_type}.",
      )
    }
  })

  test("parseMember emits exact category missing prompt error", () => {
    // given
    const member = { name: "m1", kind: "category", category: "deep" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' uses category 'deep' but is missing required 'prompt' field. Category members must supply a task prompt.",
      )
    }
  })

  test("parseMember emits exact unknown subagent error", () => {
    // given
    const member = { name: "m1", kind: "subagent_type", subagent_type: "foobar" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Unknown subagent_type 'foobar'. Available ELIGIBLE agents: odin, heimdall, einherjar, thor (if D-36 applied). Use delegate-task for read-only agents like volva, bragi, explore, urd, forseti, huginn.",
      )
    }
  })

  test("parseMember rejects hard-reject subagent types with exact messages", () => {
    // given
    const cases = [
      [
        "volva",
        "Agent 'volva' is read-only (cannot write files). Team members must write to mailbox inbox files. Use delegate-task with subagent_type: 'volva' for read-only analysis instead.",
      ],
      [
        "bragi",
        "Agent 'bragi' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for research queries instead.",
      ],
      [
        "vidar",
        "Agent 'vidar' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for codebase exploration instead.",
      ],
      [
        "huginn",
        "Agent 'huginn' has read-only tool access (only 'read' allowed). Cannot write to mailbox as team member.",
      ],
      [
        "urd",
        "Agent 'urd' is read-only (pre-planning consultant). Cannot write to mailbox as team member. Use delegate-task for pre-planning analysis instead.",
      ],
      [
        "forseti",
        "Agent 'forseti' is read-only (plan reviewer). Cannot write to mailbox as team member. Use delegate-task for plan review instead.",
      ],
      [
        "mimir",
        "Agent 'mimir' is plan-mode-only; can only write to .omo/*.md (enforced by mimirMdOnly hook). Cannot write to team mailbox. Use delegate-task with subagent_type: 'plan' instead.",
      ],
    ] as const

    // when
    for (const [subagentType, expectedMessage] of cases) {
      // then
      expect(() =>
        parseMember({ kind: "subagent_type", name: "x", subagent_type: subagentType }),
      ).toThrow(expectedMessage)
    }
  })

  test("parseMember returns valid category member", () => {
    // given
    const member = { name: "m1", kind: "category", category: "deep", prompt: "impl X" }

    // when
    const result = parseMember(member)

    // then
    expect(result).toMatchObject(member)
  })

  test("parseMember returns valid subagent member", () => {
    // given
    const member = { name: "m1", kind: "subagent_type", subagent_type: "odin" }

    // when
    const result = parseMember(member)

    // then
    expect(result).toMatchObject(member)
  })

  test("parseMember returns parsed thor and heimdall subagent members", () => {
    // given
    const thorMember = { name: "m1", kind: "subagent_type", subagent_type: "thor" }
    const heimdallMember = { name: "m1", kind: "subagent_type", subagent_type: "heimdall" }

    // when
    const thorResult = parseMember(thorMember)
    const heimdallResult = parseMember(heimdallMember)

    // then
    expect(thorResult).toMatchObject(thorMember)
    expect(heimdallResult).toMatchObject(heimdallMember)
  })

  test("category requires prompt", () => {
    // given
    const member = { kind: "category", name: "m1", category: "deep" }

    // when
    const result = CategoryMemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(false)
  })

  test("team spec defaults version when omitted", () => {
    // given
    const teamSpec = { name: "solo-team", members: [{ kind: "category", name: "solo", category: "deep", prompt: "implement the assigned work" }] }

    // when
    const result = TeamSpecSchema.parse(teamSpec)

    // then
    expect(result.version).toBe(1)
    expect(result.leadAgentId).toBe("solo")
  })

  test("team spec defaults createdAt from Date.now when omitted", () => {
    // given
    const originalDateNow = Date.now
    Date.now = () => 123_456_789
    const teamSpec = { name: "solo-team", members: [{ kind: "category", name: "solo", category: "deep", prompt: "implement the assigned work" }] }

    try {
      // when
      const result = TeamSpecSchema.parse(teamSpec)

      // then
      expect(result.createdAt).toBe(123_456_789)
    } finally {
      Date.now = originalDateNow
    }
  })

  test("team spec rejects multi-member configs without a lead hint", () => {
    // given
    const teamSpec = {
      name: "pair-team",
      members: [
        { kind: "category", name: "m1", category: "deep", prompt: "implement the assigned work" },
        { kind: "category", name: "m2", category: "quick", prompt: "review the assigned work" },
      ],
    }

    // when
    const result = TeamSpecSchema.safeParse(teamSpec)

    // then
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ["leadAgentId"],
        message: "leadAgentId required (or write a `lead: {...}` field, or mark one member with `isLead: true`)",
      }))
    }
  })

  test("eligibility registry shape", () => {
    // given
    const entries = Object.entries(AGENT_ELIGIBILITY_REGISTRY)

    // when
    const verdictCounts = entries.reduce(
      (counts, [, value]) => {
        counts[value.verdict] += 1
        return counts
      },
      { eligible: 0, conditional: 0, "hard-reject": 0 },
    )

    // then
    expect(entries).toHaveLength(11)
    expect(verdictCounts).toEqual({ eligible: 3, conditional: 1, "hard-reject": 7 })
    expect(AGENT_ELIGIBILITY_REGISTRY.thor.rejectionMessage).toBe(
      "Agent 'thor' lacks teammate permission. Either apply D-36 (add teammate: \"allow\" in tool-config-handler.ts) or use subagent_type: \"odin\" instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.volva.rejectionMessage).toBe(
      "Agent 'volva' is read-only (cannot write files). Team members must write to mailbox inbox files. Use delegate-task with subagent_type: 'volva' for read-only analysis instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.bragi.rejectionMessage).toBe(
      "Agent 'bragi' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for research queries instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.vidar.rejectionMessage).toBe(
      "Agent 'vidar' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for codebase exploration instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY["huginn"].rejectionMessage).toBe(
      "Agent 'huginn' has read-only tool access (only 'read' allowed). Cannot write to mailbox as team member.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.urd.rejectionMessage).toBe(
      "Agent 'urd' is read-only (pre-planning consultant). Cannot write to mailbox as team member. Use delegate-task for pre-planning analysis instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.forseti.rejectionMessage).toBe(
      "Agent 'forseti' is read-only (plan reviewer). Cannot write to mailbox as team member. Use delegate-task for plan review instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.mimir.rejectionMessage).toBe(
      "Agent 'mimir' is plan-mode-only; can only write to .omo/*.md (enforced by mimirMdOnly hook). Cannot write to team mailbox. Use delegate-task with subagent_type: 'plan' instead.",
    )
    expect(CategoryMemberSchema).toBeDefined()
    expect(SubagentMemberSchema).toBeDefined()
  })
})
