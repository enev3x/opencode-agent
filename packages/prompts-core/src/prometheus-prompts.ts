import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/mimir/default.md"

export const mimirPromptVariants = {
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/mimir/default.md",
  },
} satisfies VariantTable
