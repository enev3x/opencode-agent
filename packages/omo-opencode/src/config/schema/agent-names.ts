import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "odin",
  "thor",
  "mimir",
  "volva",
  "bragi",
  "vidar",
  "huginn",
  "urd",
  "forseti",
  "heimdall",
  "einherjar",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend",
  "git-master",
  "review-work",
  "remove-ai-slops",
  "init-deep",
  "debugging",
  "security-research",
  "security-review",
  "visual-qa",
  "team-mode",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "odin",
  "thor",
  "einherjar",
  "OpenCode-Builder",
  "mimir",
  "urd",
  "forseti",
  "volva",
  "bragi",
  "vidar",
  "huginn",
  "heimdall",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
