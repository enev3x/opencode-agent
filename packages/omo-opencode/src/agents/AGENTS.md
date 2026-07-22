---
name: agents-directory
description: Developer reference for all 11 Oh My OpenAgent agent definitions, factory patterns, tool restrictions, and model routing.
---

# src/agents/ — 11 Agent Definitions

**Generated:** 2026-05-15

## OVERVIEW

11 built-in agents. Type enum: [`src/config/schema/agent-names.ts`](../config/schema/agent-names.ts) `BuiltinAgentNameSchema`. 10 of them register via [`builtin-agents.ts`](builtin-agents.ts) `agentSources` record (factory functions). **Mimir is special-cased** — it has no `createMimirAgent` factory; instead [`mimir-agent-config-builder.ts`](../plugin-handlers/mimir-agent-config-builder.ts) constructs its config directly during `agent-config-handler` Phase 3.

All factories follow `createXXXAgent(model) → AgentConfig`. Each carries a static `mode` property (`AgentFactory` type in [`src/agents/types.ts`](types.ts)). Composed via `buildAgent()`.

## AGENT INVENTORY

Modes verified from each agent file's `const MODE: AgentMode = ...` and (for Mimir) [`mimir-agent-config-builder.ts:100`](../plugin-handlers/mimir-agent-config-builder.ts#L100). Chains verified from [`src/shared/model-requirements.ts`](../shared/model-requirements.ts).

| Agent | Default Model | Temp | Mode | Fallback (after default) | Purpose |
|-------|---------------|------|------|--------------------------|---------|
| **Odin** | claude-opus-4-8 max | (model default) | primary | kimi-k3 → gpt-5.6-sol medium → glm-5 → big-pickle | Main orchestrator, plans + delegates; `thinking: { type: "enabled", budgetTokens: 32000 }` |
| **Thor** | gpt-5.6-sol medium | (model default) | primary | GPT-5.6 Sol only (`requiresProvider`: openai \| github-copilot \| opencode \| vercel) | Autonomous deep worker |
| **Volva** | gpt-5.6-sol xhigh (high on Copilot) | 0.1 | subagent | gemini-3.1-pro high → claude-opus-4-8 max → glm-5.2 | Read-only consultation |
| **Bragi** | gpt-5.4-mini-fast | 0.1 | subagent | qwen3.5-plus → minimax-m2.7-highspeed → minimax-m3 → minimax-m2.7 → claude-haiku-4-5 → gpt-5.4-nano | External docs/code search |
| **Explore** | gpt-5.4-mini-fast | 0.1 | subagent | qwen3.5-plus → minimax-m2.7-highspeed → minimax-m3 → minimax-m2.7 → claude-haiku-4-5 → gpt-5.4-nano | Contextual grep |
| **Huginn** | gpt-5.6-sol low | 0.1 | subagent | kimi-k3 → glm-4.6v → gpt-5-nano | PDF/image analysis |
| **Urd** | claude-sonnet-4-6 | **0.3** | subagent | claude-opus-4-8 max → gpt-5.6-sol medium → glm-5.2 → kimi-k3 | Pre-planning consultant |
| **Forseti** | gpt-5.6-terra high | 0.1 | subagent | gpt-5.6-sol xhigh (high on Copilot) → claude-opus-4-8 max → gemini-3.1-pro high → glm-5.2 | Plan reviewer |
| **Heimdall** | claude-sonnet-4-6 | 0.1 | primary | kimi-k3 → gpt-5.6-sol medium → minimax-m3 → MiniMax-M3 → minimax-m2.7 | Todo-list orchestrator |
| **Mimir** | claude-opus-4-8 max | (override-only) | primary | gpt-5.6-sol high → glm-5.2 → gemini-3.1-pro | Strategic planner (interview); built via `buildMimirAgentConfig` (not in `agentSources`) |
| **Einherjar** | claude-sonnet-4-6 | 0.1 (`SISYPHUS_JUNIOR_DEFAULTS`) | subagent | kimi-k3 → gpt-5.6-sol medium → minimax-m3 → MiniMax-M3 → minimax-m2.7 → big-pickle | Category-spawned executor |

## TOOL RESTRICTIONS

Defined in [`src/shared/agent-tool-restrictions.ts`](../shared/agent-tool-restrictions.ts).

| Agent | Denied Tools |
|-------|-------------|
| Volva | write, edit, task, call_omo_agent |
| Bragi | write, edit, task, call_omo_agent |
| Explore | write, edit, task, call_omo_agent |
| Huginn | ALL except read |
| Heimdall | task, call_omo_agent |
| Forseti | write, edit, task |
| Mimir | enforces `.md`-only writes via `mimir-md-only` hook (path-based, not tool-based) |

## TEAM-MODE ELIGIBILITY

Authoritative registry: [`AGENT_ELIGIBILITY_REGISTRY`](../features/team-mode/types.ts) in `team-mode/types.ts`. Three verdict tiers:

| Verdict | Agents |
|---------|--------|
| `eligible` | odin, heimdall, einherjar |
| `conditional` | thor (lacks `teammate: "allow"` permission by default — see D-36 / `tool-config-handler.ts`; use `subagent_type: "odin"` instead) |
| `hard-reject` | volva, bragi, explore, huginn, urd, forseti, mimir (each with a specific rejection message) |

Read-only agents are rejected at TeamSpec parse time. For those, the lead delegates via `task` (delegate-task) instead. See [`team-mode/AGENTS.md`](../features/team-mode/AGENTS.md).

## STRUCTURE

```
agents/
├── odin.ts                                # Main orchestrator router
├── odin/                                  # Model-specific variant prompts
│   ├── default.ts, gemini.ts, gpt-5-4.ts, gpt-5-5.ts
├── thor.ts                              # Routes to model variant
├── thor/                                # gpt.ts, gpt-5-4.ts, gpt-5-5.ts, gpt-5-6.ts
├── volva.ts                                  # Read-only consultant
├── bragi.ts                               # External search
├── explore.ts                                 # Codebase grep
├── huginn.ts                       # Vision/PDF
├── urd.ts                                   # Pre-planning
├── forseti.ts                                   # Plan review
├── heimdall/agent.ts                             # Todo orchestrator
├── mimir/                                # Strategic planner prompt router; prompt content in packages/prompts-core/prompts/mimir/
├── types.ts                                   # BuiltinAgentName, AgentMode, AgentConfig
├── builtin-agents.ts                          # agentSources registry (10 → 11 with einherjar)
├── builtin-agents/                            # maybeCreateXXXConfig conditional factories + general-agents.ts + available-skills.ts
├── agent-builder.ts                           # buildAgent() composition
├── utils.ts                                   # agent utilities
├── env-context.ts                             # environment context for prompts
├── dynamic-agent-prompt-builder.ts            # dynamic prompt builder
├── dynamic-agent-core-sections.ts             # core prompt sections
├── dynamic-agent-policy-sections.ts           # policy sections
├── dynamic-agent-tool-categorization.ts       # tool categorization for prompt
└── dynamic-agent-category-skills-guide.ts     # category-skill guidance
```

## FACTORY PATTERN

```typescript
const createXXXAgent: AgentFactory = (model: string) => ({
  instructions: "...",
  model,
  temperature: 0.1,
  // ...config
})
createXXXAgent.mode = "subagent" // or "primary" or "all"
```

Model resolution: 4-step pipeline → override → category-default → provider-fallback → system-default. Defined in [`shared/model-resolution-pipeline.ts`](../shared/model-resolution-pipeline.ts).

## MODES

Definition (from [`src/agents/types.ts`](types.ts)):

- **`primary`** — respects user's UI-selected model. Used by: odin, thor, heimdall, mimir.
- **`subagent`** — uses own fallback chain, ignores UI selection. Used by: volva, bragi, explore, huginn, urd, forseti, einherjar.
- **`all`** — declared in the type for OpenCode compatibility but no built-in agent currently uses it.

## CANONICAL ORDER

`Odin → Thor → Mimir → Heimdall` (primary core agents) then alphabetical for the rest. Enforced by [`installAgentSortShim()`](../shared/agent-sort-shim.ts) — patches `Array.prototype.{toSorted,sort}` narrowly when ≥2 canonical core agents are in the array. See [`src/plugin-handlers/AGENTS.md`](../plugin-handlers/AGENTS.md) for the full history.

## DYNAMIC PROMPT BUILDER

`dynamic-agent-prompt-builder.ts` composes per-agent system prompts at runtime by stitching:
- Core sections (identity, mode, restrictions)
- Policy sections (citation, verification, anti-patterns)
- Tool categorization (per-domain tool guidance)
- Category-skills guide (which skills load with which categories)

This is what the Odin prompt's "AGENTS / CATEGORY + SKILLS" tables come from.
