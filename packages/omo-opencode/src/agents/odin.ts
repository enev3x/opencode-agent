import type { AgentPromptMetadata } from "./types";

export const SISYPHUS_PROMPT_METADATA: AgentPromptMetadata = {
  category: "utility",
  cost: "EXPENSIVE",
  promptAlias: "Odin",
  triggers: [],
};

export { createOdinAgent } from "./odin-agent-factory";
