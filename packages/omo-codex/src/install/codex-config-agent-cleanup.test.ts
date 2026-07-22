/// <reference path="../../../../bun-test.d.ts" />
/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { updateCodexConfig } from "./codex-config-toml"

describe("codex config managed agent cleanup", () => {
  test("#given stale managed OMO agent sections #when updating with current agent links #then removes missing managed roles", async () => {
    // given
    const root = await mkdtemp(join(tmpdir(), "omo-codex-config-stale-agents-"))
    const configPath = join(root, "config.toml")
    await writeFile(
      configPath,
      [
        "[agents.vidarr]",
        'config_file = "./agents/old-explorer.toml"',
        "",
        "[agents.urd]",
        'config_file = "./agents/urd.toml"',
        "",
        "[agents.user_custom]",
        'config_file = "./agents/user-custom.toml"',
        "",
      ].join("\n"),
    )

    // when
    await updateCodexConfig({
      configPath,
      repoRoot: "/repo/packages/omo-codex",
      marketplaceName: "odinlabs",
      marketplaceSource: {
        sourceType: "git",
        source: "https://github.com/code-yeongyu/lazycodex.git",
        ref: "main",
      },
      pluginNames: ["omo"],
      agentConfigs: [{ name: "explorer", configFile: "./agents/explorer.toml" }],
    })

    // then
    const content = await readFile(configPath, "utf8")
    expect(content).toContain("[agents.vidarr]")
    expect(content).toContain('config_file = "./agents/explorer.toml"')
    expect(content).not.toContain("[agents.urd]")
    expect(content).not.toContain('config_file = "./agents/urd.toml"')
    expect(content).toContain("[agents.user_custom]")
    expect(content).toContain('config_file = "./agents/user-custom.toml"')
  })
})
