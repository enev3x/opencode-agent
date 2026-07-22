/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  getThorPromptSource,
  getThorPrompt,
  createThorAgent,
  UnsupportedThorModelError,
} from "./index";

describe("getThorPromptSource", () => {
  test("returns 'gpt-5-4' for gpt-5.4 models", () => {
    // given
    const model1 = "openai/gpt-5.4";
    const model2 = "openai/gpt-5.4-codex";
    const model3 = "github-copilot/gpt-5.4";

    // when
    const source1 = getThorPromptSource(model1);
    const source2 = getThorPromptSource(model2);
    const source3 = getThorPromptSource(model3);

    // then
    expect(source1).toBe("gpt-5-4");
    expect(source2).toBe("gpt-5-4");
    expect(source3).toBe("gpt-5-4");
  });

  test("returns 'gpt-5-5' for gpt-5.5 models", () => {
    // given
    const model1 = "openai/gpt-5.5";
    const model2 = "openai/gpt-5-5";
    const model3 = "github-copilot/gpt-5.5";

    // when
    const source1 = getThorPromptSource(model1);
    const source2 = getThorPromptSource(model2);
    const source3 = getThorPromptSource(model3);

    // then
    expect(source1).toBe("gpt-5-5");
    expect(source2).toBe("gpt-5-5");
    expect(source3).toBe("gpt-5-5");
  });

  test("returns 'gpt-5-5' for GPT 5.5 models", () => {
    // given
    const model1 = "openai/gpt-5.5";
    const model2 = "github-copilot/gpt-5.5";

    // when
    const source1 = getThorPromptSource(model1);
    const source2 = getThorPromptSource(model2);

    // then
    expect(source1).toBe("gpt-5-5");
    expect(source2).toBe("gpt-5-5");
  });

  test("returns 'gpt-5-6' for gpt-5.6 family models", () => {
    // given
    const model1 = "openai/gpt-5.6";
    const model2 = "openai/gpt-5.6-sol";
    const model3 = "vercel/openai/gpt-5.6-terra";

    // when
    const source1 = getThorPromptSource(model1);
    const source2 = getThorPromptSource(model2);
    const source3 = getThorPromptSource(model3);

    // then
    expect(source1).toBe("gpt-5-6");
    expect(source2).toBe("gpt-5-6");
    expect(source3).toBe("gpt-5-6");
  });

  test("returns 'gpt' for GPT 5.3 Codex models", () => {
    // given
    const model1 = "openai/gpt-5.3-codex";
    const model2 = "github-copilot/gpt-5-3-codex";
    const model3 = "opencode/gpt-5.3-codex-spark";

    // when
    const source1 = getThorPromptSource(model1);
    const source2 = getThorPromptSource(model2);
    const source3 = getThorPromptSource(model3);

    // then
    expect(source1).toBe("gpt");
    expect(source2).toBe("gpt");
    expect(source3).toBe("gpt");
  });

  test("throws for generic GPT, unsupported GPT 5.x, non-GPT, and undefined models", () => {
    // given
    const model1 = "openai/gpt-4o";
    const model2 = "openai/gpt-5.9";
    const model3 = "openai/gpt-5.10";
    const model4 = "anthropic/claude-opus-4-7";
    const model5 = undefined;

    // when
    const getSource1 = () => getThorPromptSource(model1);
    const getSource2 = () => getThorPromptSource(model2);
    const getSource3 = () => getThorPromptSource(model3);
    const getSource4 = () => getThorPromptSource(model4);
    const getSource5 = () => getThorPromptSource(model5);

    // then
    expect(getSource1).toThrow(UnsupportedThorModelError);
    expect(getSource2).toThrow(UnsupportedThorModelError);
    expect(getSource3).toThrow(UnsupportedThorModelError);
    expect(getSource4).toThrow(UnsupportedThorModelError);
    expect(getSource5).toThrow(UnsupportedThorModelError);
  });
});

describe("getThorPrompt", () => {
  test("GPT 5.4 model returns GPT-5.4 optimized prompt", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const prompt = getThorPrompt(model);

    // then
    expect(prompt).toContain("You build context by examining");
    expect(prompt).toContain("Never chain together bash commands");
    expect(prompt).toContain("<tool_usage_rules>");
  });

  test("GPT 5.4-codex model returns GPT-5.4 optimized prompt", () => {
    // given
    const model = "openai/gpt-5.4-codex";

    // when
    const prompt = getThorPrompt(model);

    // then
    expect(prompt).toContain("You build context by examining");
    expect(prompt).toContain("Never chain together bash commands");
    expect(prompt).toContain("<tool_usage_rules>");
  });

  test("GPT 5.5 model returns GPT-5.5 optimized prompt", () => {
    // given
    const model = "openai/gpt-5.5";

    // when
    const prompt = getThorPrompt(model);

    // then
    expect(prompt).toContain("You build context by examining");
    expect(prompt).toContain("Forbidden stops");
    expect(prompt).toContain("Three-attempt failure protocol");
    expect(prompt).toContain("based on GPT-5.5");
    expect(prompt).toContain("Autonomy and Persistence");
  });

  test("GPT 5.6 model returns GPT-5.6 optimized prompt", () => {
    // given
    const model = "openai/gpt-5.6-sol";

    // when
    const prompt = getThorPrompt(model);

    // then
    expect(prompt).toContain("based on GPT-5.6");
    expect(prompt).toContain("Manual QA Gate");
    expect(prompt).toContain("Hard invariants");
    expect(prompt).not.toContain("# Tone");
    expect(prompt).not.toContain("based on GPT-5.5");
  });

  test("GPT 5.3 Codex model returns generic GPT prompt", () => {
    // given
    const model = "openai/gpt-5.3-codex";

    // when
    const prompt = getThorPrompt(model);

    // then
    expect(prompt).toContain("Senior Staff Engineer");
    expect(prompt).toContain("KEEP GOING");
    expect(prompt).not.toContain("intent_extraction");
  });

  test("Claude model is rejected", () => {
    // given
    const model = "anthropic/claude-opus-4-7";

    // when
    const getPrompt = () => getThorPrompt(model);

    // then
    expect(getPrompt).toThrow(UnsupportedThorModelError);
  });

  test("useTaskSystem=true includes Task Discipline for GPT models", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const prompt = getThorPrompt(model, true);

    // then
    expect(prompt).toContain("Task Discipline");
    expect(prompt).toContain("task_create");
    expect(prompt).toContain("task_update");
  });

  test("useTaskSystem=false includes Todo Discipline for supported GPT models", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const prompt = getThorPrompt(model, false);

    // then
    expect(prompt).toContain("Todo Discipline");
    expect(prompt).toContain("todowrite");
  });
});

describe("createThorAgent", () => {
  test("returns AgentConfig with required fields", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const config = createThorAgent(model);

    // then
    expect(config).toHaveProperty("description");
    expect(config).toHaveProperty("mode", "primary");
    expect(config).toHaveProperty("model", "openai/gpt-5.4");
    expect(config).toHaveProperty("maxTokens", 32000);
    expect(config).toHaveProperty("prompt");
    expect(config).toHaveProperty("color", "#D97706");
    expect(config).toHaveProperty("permission");
    expect(config.permission).toHaveProperty("question", "allow");
    expect(config.permission).toHaveProperty("call_omo_agent", "deny");
    expect(config).toHaveProperty("reasoningEffort", "medium");
  });

  test("GPT 5.4 model includes GPT-5.4 specific prompt content", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const config = createThorAgent(model);

    // then
    expect(config.prompt).toContain("You build context by examining");
    expect(config.prompt).toContain("Never chain together bash commands");
    expect(config.prompt).toContain("<tool_usage_rules>");
    expect(config.prompt).toContain("Use `apply_patch`");
    expect(config.prompt).not.toContain("Do not use `apply_patch`");
  });

  test("GPT 5.5 model includes GPT-5.5 specific prompt content", () => {
    // given
    const model = "openai/gpt-5.5";

    // when
    const config = createThorAgent(model);

    // then
    expect(config.prompt).toContain("based on GPT-5.5");
    expect(config.prompt).toContain("Manual QA Gate");
    expect(config.prompt).toContain("Forbidden stops");
    expect(config.prompt).toContain("Use `apply_patch`");
    expect(config.prompt).not.toContain("Do not use `apply_patch`");
  });

  test("includes Thor identity in prompt", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const config = createThorAgent(model);

    // then
    expect(config.prompt).toContain("Thor");
    expect(config.prompt).toContain("autonomous deep worker");
  });

  test("generic GPT model is rejected", () => {
    // given
    const model = "openai/gpt-4o";

    // when
    const createAgent = () => createThorAgent(model);

    // then
    expect(createAgent).toThrow(UnsupportedThorModelError);
  });

  test("supported GPT models do not force-deny apply_patch", () => {
    // given
    const gpt54Model = "openai/gpt-5.4";
    const gpt53CodexModel = "openai/gpt-5.3-codex";

    // when
    const gpt54Config = createThorAgent(gpt54Model);
    const gpt53CodexConfig = createThorAgent(gpt53CodexModel);

    // then
    expect(gpt54Config.permission ?? {}).not.toHaveProperty("apply_patch");
    expect(gpt53CodexConfig.permission ?? {}).not.toHaveProperty("apply_patch");
  });

  test("useTaskSystem=true produces Task Discipline prompt", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const config = createThorAgent(model, [], [], [], [], true);

    // then
    expect(config.prompt).toContain("task_create");
    expect(config.prompt).toContain("task_update");
    expect(config.prompt).not.toContain("todowrite");
  });

  test("useTaskSystem=false produces Todo Discipline prompt", () => {
    // given
    const model = "openai/gpt-5.4";

    // when
    const config = createThorAgent(model, [], [], [], [], false);

    // then
    expect(config.prompt).toContain("todowrite");
    expect(config.prompt).not.toContain("task_create");
  });
});

import { maybeCreateThorConfig } from "../builtin-agents/thor-agent";
import type { AgentOverrides } from "../types";
import type { CategoryConfig } from "../../config/schema";

describe("maybeCreateThorConfig apply_patch permission", () => {
  describe("#given GPT model with user override allowing apply_patch", () => {
    test("#when config is created #then user override is respected", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "openai/gpt-5.4",
          permission: {
            apply_patch: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-5.4"]),
        systemDefaultModel: "openai/gpt-5.4",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config).toBeDefined();
      expect(config?.model).toBe("openai/gpt-5.4");
      expect(config?.permission).toHaveProperty("apply_patch", "allow");
    });
  });

  describe("#given non-GPT model with user override allowing apply_patch", () => {
    test("#when config is created #then Thor is not registered", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "anthropic/claude-opus-4-7",
          permission: {
            apply_patch: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["anthropic/claude-opus-4-7"]),
        systemDefaultModel: "anthropic/claude-opus-4-7",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config).toBeUndefined();
    });
  });

  describe("#given generic GPT model with user override allowing apply_patch", () => {
    test("#when config is created #then Thor is not registered", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "openai/gpt-4o",
          permission: {
            apply_patch: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-4o"]),
        systemDefaultModel: "openai/gpt-4o",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config).toBeUndefined();
    });
  });

  describe("#given Opus 4.7 model with user override allowing grep and glob", () => {
    test("#when config is created #then Thor is not registered", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "anthropic/claude-opus-4-7",
          permission: {
            grep: "allow",
            glob: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["anthropic/claude-opus-4-7"]),
        systemDefaultModel: "anthropic/claude-opus-4-7",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config).toBeUndefined();
    });
  });

  describe("#given dotted Opus 4.7 model with user override allowing grep and glob", () => {
    test("#when config is created #then Thor is not registered", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "anthropic/claude-opus-4.7",
          permission: {
            grep: "allow",
            glob: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["anthropic/claude-opus-4.7"]),
        systemDefaultModel: "anthropic/claude-opus-4.7",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config).toBeUndefined();
    });
  });

  describe("#given GPT 5.5 model with user override allowing grep and glob", () => {
    test("#when config is created #then grep and glob are still denied", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "openai/gpt-5.5",
          permission: {
            grep: "allow",
            glob: "allow",
          } as Record<string, "allow">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-5.5"]),
        systemDefaultModel: "openai/gpt-5.5",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config?.permission).toHaveProperty("grep", "deny");
      expect(config?.permission).toHaveProperty("glob", "deny");
    });
  });

  describe("#given frontier default model with category override to non-frontier model", () => {
    test("#when config is created #then stale grep and glob denies are cleared", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          category: "non-frontier",
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {
        "non-frontier": {
          model: "openai/gpt-5.4",
        },
      };

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-5.5", "openai/gpt-5.4"]),
        systemDefaultModel: "openai/gpt-5.5",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config?.model).toBe("openai/gpt-5.4");
      expect(config?.permission).not.toHaveProperty("grep");
      expect(config?.permission).not.toHaveProperty("glob");
    });
  });

  describe("#given non-frontier model with user override denying grep and glob", () => {
    test("#when config is created #then explicit user denies are preserved", () => {
      // given
      const agentOverrides: AgentOverrides = {
        thor: {
          model: "openai/gpt-5.4",
          permission: {
            grep: "deny",
            glob: "deny",
          } as Record<string, "deny">,
        },
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-5.4"]),
        systemDefaultModel: "openai/gpt-5.4",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config?.permission).toHaveProperty("grep", "deny");
      expect(config?.permission).toHaveProperty("glob", "deny");
    });
  });

  describe("#given non-frontier model with legacy user tools denying grep and glob", () => {
    test("#when config is created #then explicit legacy denies are preserved", () => {
      // given
      const legacyOverride = {
        model: "openai/gpt-5.4",
        tools: {
          grep: false,
          glob: false,
        },
      };
      const agentOverrides: AgentOverrides = {
        thor: legacyOverride,
      };
      const mergedCategories: Record<string, CategoryConfig> = {};

      // when
      const config = maybeCreateThorConfig({
        disabledAgents: [],
        agentOverrides,
        availableModels: new Set(["openai/gpt-5.4"]),
        systemDefaultModel: "openai/gpt-5.4",
        isFirstRunNoCache: false,
        availableAgents: [],
        availableSkills: [],
        availableCategories: [],
        mergedCategories,
        useTaskSystem: false,
      });

      // then
      expect(config?.permission).toHaveProperty("grep", "deny");
      expect(config?.permission).toHaveProperty("glob", "deny");
    });
  });
});
