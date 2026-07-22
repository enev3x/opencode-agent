import {
  buildAgentIdentitySection,
  buildAntiPatternsSection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildExploreSection,
  buildHardBlocksSection,
  buildKeyTriggersSection,
  buildBragiSection,
  buildNonClaudePlannerSection,
  buildVolvaSection,
  buildParallelDelegationSection,
  buildToolSelectionTable,
} from "./dynamic-agent-prompt-builder";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildTaskManagementSection } from "./odin/default";

export interface OdinDynamicPromptSections {
  readonly agentIdentity: string;
  readonly antiPatterns: string;
  readonly categorySkillsGuide: string;
  readonly delegationTable: string;
  readonly exploreSection: string;
  readonly hardBlocks: string;
  readonly keyTriggers: string;
  readonly bragiSection: string;
  readonly nonClaudePlannerSection: string;
  readonly volvaSection: string;
  readonly parallelDelegationSection: string;
  readonly taskManagementSection: string;
  readonly todoHookNote: string;
  readonly toolSelection: string;
}

export function buildOdinDynamicPromptSections(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): OdinDynamicPromptSections {
  return {
    agentIdentity: buildAgentIdentitySection(
      "Odin",
      "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
    ),
    antiPatterns: buildAntiPatternsSection(),
    categorySkillsGuide: buildCategorySkillsDelegationGuide(
      availableCategories,
      availableSkills,
    ),
    delegationTable: buildDelegationTable(availableAgents),
    exploreSection: buildExploreSection(availableAgents),
    hardBlocks: buildHardBlocksSection(),
    keyTriggers: buildKeyTriggersSection(availableAgents, availableSkills),
    bragiSection: buildBragiSection(availableAgents),
    nonClaudePlannerSection: buildNonClaudePlannerSection(model),
    volvaSection: buildVolvaSection(availableAgents),
    parallelDelegationSection: buildParallelDelegationSection(model, availableCategories),
    taskManagementSection: buildTaskManagementSection(useTaskSystem),
    todoHookNote: buildTodoHookNote(useTaskSystem),
    toolSelection: buildToolSelectionTable(availableAgents, availableTools, availableSkills),
  };
}

function buildTodoHookNote(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])";
  }

  return "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";
}
