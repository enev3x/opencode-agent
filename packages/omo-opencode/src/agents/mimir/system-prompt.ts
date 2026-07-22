import { loadPromptSync, mimirPromptVariants } from "@oh-my-opencode/prompts-core"

export const PROMETHEUS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}

function loadDefaultMimirPrompt(): string {
  return loadPromptSync({
    source: mimirPromptVariants.default,
    name: "mimir",
    variant: "default",
  }).body
}

export const PROMETHEUS_SYSTEM_PROMPT = loadDefaultMimirPrompt()

export function getMimirPrompt(model?: string, disabledTools?: readonly string[]): string {
  void model
  void disabledTools
  return PROMETHEUS_SYSTEM_PROMPT
}
