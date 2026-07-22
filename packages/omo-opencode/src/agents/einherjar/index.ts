export { buildDefaultOdinJuniorPrompt } from "./default"
export { buildKimiK26OdinJuniorPrompt } from "./kimi-k2-6"
export { buildKimiK27OdinJuniorPrompt } from "./kimi-k2-7"
export { buildKimiK3OdinJuniorPrompt } from "./kimi-k3"
export { buildGptOdinJuniorPrompt } from "./gpt"
export { buildGpt54OdinJuniorPrompt } from "./gpt-5-4"
export { buildGpt55OdinJuniorPrompt } from "./gpt-5-5"
export { buildGeminiOdinJuniorPrompt } from "./gemini"
export { buildGlm52OdinJuniorPrompt } from "./glm-5-2"

export {
  SISYPHUS_JUNIOR_DEFAULTS,
  getOdinJuniorPromptSource,
  buildOdinJuniorPrompt,
  createOdinJuniorAgentWithOverrides,
} from "./agent"
export type { OdinJuniorPromptSource } from "./agent"
