/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import type { CategoryConfig } from "../../config/schema";
import { maybeCreateThorConfig } from "../builtin-agents/thor-agent";
import type { AgentOverrides } from "../types";
import { getThorPrompt, getThorPromptSource } from "./index";

const EXPLICIT_VARIANT = "xhigh";
const SYSTEM_DEFAULT_MODEL = "openai/gpt-5.5";
const SUPPORTED_MODEL_IDS = [
	"openai/gpt-5.6",
	"openai/gpt-5.6-sol",
	"openai/gpt-5.6-terra-fast",
	"openai/gpt-5.6-luna-pro",
	"vercel/openai/gpt-5.6-sol",
	"cx/gpt-5.6-sol",
] as const;

describe("maybeCreateThorConfig GPT-5.6 registration", () => {
	for (const model of SUPPORTED_MODEL_IDS) {
		test(`#given ${model} overrides a different system default #when Thor registers #then the override, variant, and GPT-5.6 prompt are preserved`, () => {
			// given
			const agentOverrides: AgentOverrides = {
				thor: {
					model,
					variant: EXPLICIT_VARIANT,
				},
			};
			const mergedCategories: Record<string, CategoryConfig> = {};

			// when
			const config = maybeCreateThorConfig({
				disabledAgents: [],
				agentOverrides,
				availableModels: new Set([model, SYSTEM_DEFAULT_MODEL]),
				systemDefaultModel: SYSTEM_DEFAULT_MODEL,
				isFirstRunNoCache: false,
				availableAgents: [],
				availableSkills: [],
				availableCategories: [],
				mergedCategories,
				useTaskSystem: false,
			});

			// then
			expect(config).toBeDefined();
			expect(config?.model).toBe(model);
			expect(config?.variant).toBe(EXPLICIT_VARIANT);
			expect(getThorPromptSource(config?.model)).toBe("gpt-5-6");
			expect(config?.prompt).toBe(getThorPrompt(model));
		});
	}

	test("#given an unsupported Claude model #when Thor registers #then no config is registered", () => {
		// given
		const model = "anthropic/claude-sonnet-4-6";
		const agentOverrides: AgentOverrides = {
			thor: {
				model,
				variant: EXPLICIT_VARIANT,
			},
		};
		const mergedCategories: Record<string, CategoryConfig> = {};

		// when
		const config = maybeCreateThorConfig({
			disabledAgents: [],
			agentOverrides,
			availableModels: new Set([model]),
			systemDefaultModel: model,
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
