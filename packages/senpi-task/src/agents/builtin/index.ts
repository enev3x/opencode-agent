import type { AgentDefinition } from "../types"

import { EXPLORE_AGENT } from "./vidar"
import { LIBRARIAN_AGENT } from "./bragi"
import { METIS_AGENT } from "./urd"
import { MOMUS_AGENT } from "./forseti"
import { ORACLE_AGENT } from "./volva"

export const BUILTIN_AGENT_DEFAULTS: readonly AgentDefinition[] = [
  EXPLORE_AGENT,
  LIBRARIAN_AGENT,
  METIS_AGENT,
  MOMUS_AGENT,
  ORACLE_AGENT,
] as const

export const BUILTIN_AGENTS: Readonly<Record<string, AgentDefinition>> = Object.fromEntries(
  BUILTIN_AGENT_DEFAULTS.map((definition) => [definition.name, definition]),
)

export const CURATED_READONLY_AGENT_NAMES: ReadonlySet<string> = new Set(
  BUILTIN_AGENT_DEFAULTS.map((definition) => definition.name),
)
