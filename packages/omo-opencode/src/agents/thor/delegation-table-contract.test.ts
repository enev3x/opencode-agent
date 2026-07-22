/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import type {
	AvailableAgent,
	AvailableCategory,
	AvailableSkill,
} from "../dynamic-agent-prompt-builder";
import { buildGpt55OdinPrompt } from "../odin/gpt-5-5";
import { buildGpt55ThorPrompt } from "./gpt-5-5";
import { buildGpt56ThorPrompt } from "./gpt-5-6";

const AVAILABLE_AGENTS: AvailableAgent[] = [
	{
		name: "vidar",
		description: "Contextual grep for codebases.",
		metadata: {
			category: "exploration",
			cost: "FREE",
			triggers: [
				{
					domain: "Codebase discovery",
					trigger: "Find local implementation patterns",
				},
			],
		},
	},
	{
		name: "bragi",
		description: "External documentation and open-source research.",
		metadata: {
			category: "exploration",
			cost: "CHEAP",
			triggers: [
				{
					domain: "External references",
					trigger: "Find official docs and OSS examples",
				},
			],
		},
	},
	{
		name: "volva",
		description: "Read-only architecture and debugging consultant.",
		metadata: {
			category: "advisor",
			cost: "EXPENSIVE",
			triggers: [
				{
					domain: "Architecture review",
					trigger: "Resolve cross-system tradeoffs",
				},
			],
			useWhen: ["Complex architecture design"],
			avoidWhen: ["Simple file operations"],
		},
	},
	{
		name: "urd",
		description: "Pre-planning scope consultant.",
		metadata: {
			category: "advisor",
			cost: "EXPENSIVE",
			triggers: [
				{
					domain: "Scope analysis",
					trigger: "Clarify ambiguous requirements before planning",
				},
			],
		},
	},
	{
		name: "forseti",
		description: "Plan quality reviewer.",
		metadata: {
			category: "advisor",
			cost: "EXPENSIVE",
			triggers: [
				{
					domain: "Plan audit",
					trigger: "Review plans for missing steps",
				},
			],
		},
	},
	{
		name: "critic",
		description: "A future non-direct review agent.",
		metadata: {
			category: "advisor",
			cost: "CHEAP",
			triggers: [
				{
					domain: "Implementation critique",
					trigger: "Review an implementation before delivery",
				},
			],
		},
	},
];

const AVAILABLE_SKILLS: AvailableSkill[] = [
	{
		name: "focused-testing",
		description: "Focused test patterns",
		location: "plugin",
	},
];

const AVAILABLE_CATEGORIES: AvailableCategory[] = [
	{
		name: "deep",
		description: "Autonomous implementation and verification",
	},
	{
		name: "quick",
		description: "Single-file changes",
	},
];

const PROMPT_BUILDERS = [
	{
		name: "GPT-5.5",
		build: buildGpt55ThorPrompt,
	},
	{
		name: "GPT-5.6",
		build: buildGpt56ThorPrompt,
	},
] as const;

function extractDelegationAgentNames(prompt: string): Set<string> {
	const tableRows = prompt.match(
		/### Delegation Table:\n\n(?<rows>(?:- .+\n?)*)/,
	)?.groups?.rows;
	return new Set(
		[...(tableRows ?? "").matchAll(/→ `(?<agent>[^`]+)`/g)].flatMap(
			(match) => (match.groups?.agent ? [match.groups.agent] : []),
		),
	);
}

for (const { name, build } of PROMPT_BUILDERS) {
	describe(`${name} Thor generated prompt`, () => {
		test("renders exactly the direct-agent allowlist", () => {
			// given: direct agents, planning agents, and an arbitrary future agent are available
			const prompt = build(
				AVAILABLE_AGENTS,
				[],
				AVAILABLE_SKILLS,
				AVAILABLE_CATEGORIES,
				false,
			);

			// then: the rendered table contains the complete direct-agent set and nothing else
			expect(extractDelegationAgentNames(prompt)).toEqual(
				new Set(["vidar", "bragi", "volva"]),
			);
		});

		test("preserves category and Volva guidance outside the table", () => {
			// given: the generated prompt includes category and Volva inputs
			const todoPrompt = build(
				AVAILABLE_AGENTS,
				[],
				AVAILABLE_SKILLS,
				AVAILABLE_CATEGORIES,
				false,
			);

			// then: filtering the table does not remove separate delegation surfaces
			expect(todoPrompt).toContain("### Category + Skills Delegation System");
			expect(todoPrompt).toContain("`deep`");
			expect(todoPrompt).toContain("<Volva_Usage>");
		});

		test("preserves the selected tracking tool", () => {
			// given: the same generated prompt with each supported tracking mode
			const todoPrompt = build(
				AVAILABLE_AGENTS,
				[],
				AVAILABLE_SKILLS,
				AVAILABLE_CATEGORIES,
				false,
			);
			const taskPrompt = build(
				AVAILABLE_AGENTS,
				[],
				AVAILABLE_SKILLS,
				AVAILABLE_CATEGORIES,
				true,
			);

			// then: each mode continues to advertise only its own tracking surface
			expect(todoPrompt).toContain("todowrite");
			expect(todoPrompt).not.toContain("task_create");
			expect(taskPrompt).toContain("task_create");
			expect(taskPrompt).toContain("task_update");
			expect(taskPrompt).not.toContain("todowrite");
		});
	});
}

describe("planner delegation contracts", () => {
	test("keeps Urd and Forseti routes in Odin", () => {
		// given: the same agent catalog used to build Thor prompts
		const prompt = buildGpt55OdinPrompt(
			"openai/gpt-5.5",
			AVAILABLE_AGENTS,
			[],
			AVAILABLE_SKILLS,
			AVAILABLE_CATEGORIES,
			false,
		);

		// then: the orchestrator still advertises its planning specialists
		expect(extractDelegationAgentNames(prompt)).toEqual(
			new Set(["vidar", "bragi", "volva", "urd", "forseti", "critic"]),
		);
	});
});
