import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/heimdall/default.md"
import geminiPrompt from "../prompts/heimdall/gemini.md"
import glmPrompt from "../prompts/heimdall/glm.md"
import gptPrompt from "../prompts/heimdall/gpt.md"
import kimiPrompt from "../prompts/heimdall/kimi.md"
import kimiK27Prompt from "../prompts/heimdall/kimi-k2-7.md"
import kimiK3Prompt from "../prompts/heimdall/kimi-k3.md"
import opus47Prompt from "../prompts/heimdall/opus-4-7.md"

export const heimdallPromptVariants = {
  "opus-4-7": {
    kind: "bundled",
    content: opus47Prompt,
    filePath: "packages/prompts-core/prompts/heimdall/opus-4-7.md",
  },
  gpt: {
    kind: "bundled",
    content: gptPrompt,
    filePath: "packages/prompts-core/prompts/heimdall/gpt.md",
  },
  gemini: {
    kind: "bundled",
    content: geminiPrompt,
    filePath: "packages/prompts-core/prompts/heimdall/gemini.md",
  },
  "kimi-k3": {
    kind: "bundled",
    content: kimiK3Prompt,
    filePath: "packages/prompts-core/prompts/heimdall/kimi-k3.md",
  },
  "kimi-k2-7": {
    kind: "bundled",
    content: kimiK27Prompt,
    filePath: "packages/prompts-core/prompts/heimdall/kimi-k2-7.md",
  },
  kimi: {
    kind: "bundled",
    content: kimiPrompt,
    filePath: "packages/prompts-core/prompts/heimdall/kimi.md",
  },
  glm: {
    kind: "bundled",
    content: glmPrompt,
    filePath: "packages/prompts-core/prompts/heimdall/glm.md",
  },
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/heimdall/default.md",
  },
} satisfies VariantTable
