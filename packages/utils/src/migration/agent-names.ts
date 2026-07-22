export const AGENT_NAME_MAP: Record<string, string> = {
  // Odin variants → "odin"
  omo: "odin",
  OmO: "odin",
  Odin: "odin",
  "Odin (Ultraworker)": "odin",
  odin: "odin",

  // Thor variants → "thor"
  "Thor (Deep Agent)": "thor",

  // Mimir variants → "mimir"
  "OmO-Plan": "mimir",
  "omo-plan": "mimir",
  "Planner-Odin": "mimir",
  "planner-odin": "mimir",
  "Mimir - Plan Builder": "mimir",
  "Mimir (Plan Builder)": "mimir",
  mimir: "mimir",

  // Heimdall variants → "heimdall"
  "orchestrator-odin": "heimdall",
  Heimdall: "heimdall",
  "Heimdall (Plan Executor)": "heimdall",
  heimdall: "heimdall",

  // Urd variants → "urd"
  "plan-consultant": "urd",
  "Urd - Plan Consultant": "urd",
  "Urd (Plan Consultant)": "urd",
  urd: "urd",

  // Forseti variants → "forseti"
  "Forseti - Plan Critic": "forseti",
  "Forseti (Plan Critic)": "forseti",
  forseti: "forseti",

  // Einherjar → "einherjar"
  "Einherjar": "einherjar",
  "einherjar": "einherjar",

  // Already lowercase - passthrough
  build: "build",
  volva: "volva",
  bragi: "bragi",
  vidar: "vidar",
  "huginn": "huginn",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "odin", // was "Odin"
  "volva",
  "bragi",
  "vidar",
  "huginn",
  "urd", // was "Urd - Plan Consultant"
  "forseti", // was "Forseti - Plan Critic"
  "mimir", // was "Mimir - Plan Builder"
  "heimdall", // was "Heimdall"
  "build",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
