import { z } from "zod"

export const OdinTasksConfigSchema = z.object({
  /** Absolute or relative storage path override. When set, bypasses global config dir. */
  storage_path: z.string().optional(),
  /** Force task list ID (alternative to env ULTRAWORK_TASK_LIST_ID) */
  task_list_id: z.string().optional(),
  /** Enable Claude Code path compatibility mode */
  claude_code_compat: z.boolean().default(false),
})

export const OdinConfigSchema = z.object({
  tasks: OdinTasksConfigSchema.optional(),
})

export type OdinTasksConfig = z.infer<typeof OdinTasksConfigSchema>
export type OdinConfig = z.infer<typeof OdinConfigSchema>
