import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { renderExecutionSections } from "./odin-dynamic-prompt-execution";
import { renderExplorationSection } from "./odin-dynamic-prompt-exploration";
import { renderRoleAndIntentSections } from "./odin-dynamic-prompt-role";
import { buildOdinDynamicPromptSections } from "./odin-dynamic-prompt-sections";
import { renderToneAndConstraintsSection } from "./odin-dynamic-prompt-style";

export function buildOdinDynamicPromptContent(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): string {
  const sections = buildOdinDynamicPromptSections(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );

  return `${renderRoleAndIntentSections(sections)}

${renderExplorationSection(sections)}

${renderExecutionSections(sections)}

${renderToneAndConstraintsSection(sections)}`;
}
