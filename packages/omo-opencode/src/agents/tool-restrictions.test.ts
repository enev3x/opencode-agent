/// <reference types="bun-types" />

import { describe, test, expect } from "bun:test"
import { createVolvaAgent } from "./volva"
import { createBragiAgent } from "./bragi"
import { createExploreAgent } from "./vidar"
import { createForsetiAgent } from "./forseti"
import { createUrdAgent } from "./urd"
import { createHeimdallAgent } from "./heimdall"
import { createOdinAgent } from "./odin"
import { createThorAgent } from "./thor"
import { getAgentToolRestrictions } from "../shared/agent-tool-restrictions"

const TEST_MODEL = "anthropic/claude-sonnet-4-5"
const TEAM_TOOL_NAMES = [
  "team_create",
  "team_delete",
  "team_shutdown_request",
  "team_approve_shutdown",
  "team_reject_shutdown",
  "team_send_message",
  "team_task_create",
  "team_task_list",
  "team_task_update",
  "team_task_get",
  "team_status",
  "team_list",
] as const

describe("read-only agent tool restrictions", () => {
  const FILE_WRITE_TOOLS = ["write", "edit", "apply_patch"]

  test("denies team tools for every delegated subagent prompt", () => {
    // given
    const restrictedAgentNames = [
      "vidar",
      "bragi",
      "volva",
      "urd",
      "forseti",
      "huginn",
      "einherjar",
      "custom-worker",
    ]

    // when
    const restrictions = restrictedAgentNames.map((agentName) => getAgentToolRestrictions(agentName))

    // then
    for (const restriction of restrictions) {
      for (const toolName of TEAM_TOOL_NAMES) {
        expect(restriction[toolName]).toBe(false)
      }
    }
  })

  test("allows team tools for team member prompt restrictions", () => {
    // given
    const teamMemberAgentName = "einherjar"

    // when
    const restrictions = getAgentToolRestrictions(teamMemberAgentName, { includeTeamToolDenylist: false })

    // then
    for (const toolName of TEAM_TOOL_NAMES) {
      expect(restrictions[toolName]).toBeUndefined()
    }
    expect(restrictions.task).toBe(false)
  })

  describe("Volva", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createVolvaAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("denies task but allows call_omo_agent for research", () => {
      // given
      const agent = createVolvaAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      expect(permission["task"]).toBe("deny")
      expect(permission["call_omo_agent"]).toBeUndefined()
    })
  })

  describe("Bragi", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createBragiAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Explore", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createExploreAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Forseti", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createForsetiAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("allows task delegation while remaining ineligible for team membership", () => {
      // given
      const agent = createForsetiAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>
      const sessionRestrictions = getAgentToolRestrictions("forseti")

      // then
      expect(permission["task"]).toBeUndefined()
      expect(sessionRestrictions["task"]).toBeUndefined()
    })
  })

  describe("Urd", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createUrdAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("allows task delegation while remaining ineligible for team membership", () => {
      // given
      const agent = createUrdAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>
      const sessionRestrictions = getAgentToolRestrictions("urd")

      // then
      expect(permission["task"]).toBeUndefined()
      expect(sessionRestrictions["task"]).toBeUndefined()
    })
  })

  describe("Heimdall", () => {
    test("allows delegation tools for orchestration", () => {
      // given
      const agent = createHeimdallAgent({ model: TEST_MODEL })

      // when
      const permission = (agent.permission ?? {}) as Record<string, string>

      // then
      expect(permission["task"]).toBeUndefined()
      expect(permission["call_omo_agent"]).toBeUndefined()
    })
  })

  describe("Odin GPT variants", () => {
    test("does not force-deny apply_patch for GPT or Claude models", () => {
      // given
      const gpt54Agent = createOdinAgent("openai/gpt-5.4")
      const gptGenericAgent = createOdinAgent("openai/gpt-5.5")
      const claudeAgent = createOdinAgent(TEST_MODEL)

      // when
      const gpt54Permission = (gpt54Agent.permission ?? {}) as Record<string, string>
      const gptGenericPermission = (gptGenericAgent.permission ?? {}) as Record<string, string>
      const claudePermission = (claudeAgent.permission ?? {}) as Record<string, string>

      // then
      expect(gpt54Permission["apply_patch"]).toBeUndefined()
      expect(gptGenericPermission["apply_patch"]).toBeUndefined()
      expect(claudePermission["apply_patch"]).toBeUndefined()
    })
  })

  describe("Odin and Thor frontier tool schema restrictions", () => {
    test("deny grep and glob for Opus 4.7 and GPT 5.5 models", () => {
      // given
      const frontierAgents = [
        createOdinAgent("anthropic/claude-opus-4-7"),
        createOdinAgent("anthropic/claude-opus-4.7"),
        createOdinAgent("openai/gpt-5.5"),
        createThorAgent("openai/gpt-5.5"),
      ]

      // when
      const permissions = frontierAgents.map(
        (agent) => (agent.permission ?? {}) as Record<string, string>,
      )

      // then
      for (const permission of permissions) {
        expect(permission.grep).toBe("deny")
        expect(permission.glob).toBe("deny")
      }
    })

    test("keeps grep and glob available for other models", () => {
      // given
      const otherAgents = [
        createOdinAgent("anthropic/claude-sonnet-4-5"),
        createOdinAgent("openai/gpt-5.4"),
        createThorAgent("openai/gpt-5.4"),
      ]

      // when
      const permissions = otherAgents.map(
        (agent) => (agent.permission ?? {}) as Record<string, string>,
      )

      // then
      for (const permission of permissions) {
        expect(permission.grep).toBeUndefined()
        expect(permission.glob).toBeUndefined()
      }
    })
  })
})
