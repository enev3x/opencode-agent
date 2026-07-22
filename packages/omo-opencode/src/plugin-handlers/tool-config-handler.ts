import type { OhMyOpenCodeConfig } from "../config";
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names";
import { isTaskSystemEnabled } from "../shared";

type AgentWithPermission = { permission?: Record<string, unknown> };

const TASK_DENIED_SUBAGENT_KEYS = [
  "bragi",
  "vidar",
  "volva",
  "huginn",
  "urd",
  "forseti",
] as const;

function getConfigQuestionPermission(): string | null {
  const configContent = process.env.OPENCODE_CONFIG_CONTENT;
  if (!configContent) return null;
  try {
    const parsed = JSON.parse(configContent);
    return parsed?.permission?.question ?? null;
  } catch (error) {
    if (error instanceof Error) return null;
    return null;
  }
}

function agentByKey(
  agentResult: Record<string, unknown>,
  key: string,
  pluginConfig?: OhMyOpenCodeConfig,
): AgentWithPermission | undefined {
  return (agentResult[getAgentListDisplayName(key, pluginConfig?.agents)] ?? agentResult[getAgentDisplayName(key, pluginConfig?.agents)] ?? agentResult[key]) as
    | AgentWithPermission
    | undefined;
}

function denyTaskForAgent(
  agentResult: Record<string, unknown>,
  key: string,
  pluginConfig: OhMyOpenCodeConfig,
): void {
  const agent = agentByKey(agentResult, key, pluginConfig);
  if (!agent) return;
  agent.permission = { ...agent.permission, task: "deny" };
}

export function applyToolConfig(params: {
  config: Record<string, unknown>;
  pluginConfig: OhMyOpenCodeConfig;
  agentResult: Record<string, unknown>;
}): void {
  const taskSystemEnabled = isTaskSystemEnabled(params.pluginConfig)
  const denyTodoTools = taskSystemEnabled
    ? { todowrite: "deny", todoread: "deny" }
    : {}

  const existingPermission = params.config.permission as Record<string, unknown> | undefined;
  const skillDeniedByHost = existingPermission?.skill === "deny";

  params.config.tools = {
    ...(params.config.tools as Record<string, unknown>),
    "grep_app_*": false,
    LspHover: false,
    LspCodeActions: false,
    LspCodeActionResolve: false,
    "task_*": false,
    teammate: false,
    ...(taskSystemEnabled
      ? { todowrite: false, todoread: false }
      : {}),
    ...(skillDeniedByHost
      ? { skill: false, skill_mcp: false }
      : {}),
  };

  const isCliRunMode = process.env.OPENCODE_CLI_RUN_MODE === "true";
  const configQuestionPermission = getConfigQuestionPermission();
  const isQuestionDisabledByPlugin = params.pluginConfig.disabled_tools?.includes("question") ?? false;
  const questionPermission =
    isQuestionDisabledByPlugin ? "deny" :
    configQuestionPermission === "deny" ? "deny" :
    isCliRunMode ? "deny" :
    "allow";

  for (const agentKey of TASK_DENIED_SUBAGENT_KEYS) {
    denyTaskForAgent(params.agentResult, agentKey, params.pluginConfig);
  }

  const bragi = agentByKey(params.agentResult, "bragi", params.pluginConfig);
  if (bragi) {
    bragi.permission = { ...bragi.permission, "grep_app_*": "allow" };
  }
  const looker = agentByKey(params.agentResult, "huginn", params.pluginConfig);
  if (looker) {
    looker.permission = { ...looker.permission, task: "deny", look_at: "deny" };
  }
  const heimdall = agentByKey(params.agentResult, "heimdall", params.pluginConfig);
  if (heimdall) {
    heimdall.permission = {
      ...heimdall.permission,
      task: "allow",
      call_omo_agent: "deny",
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  const odin = agentByKey(params.agentResult, "odin", params.pluginConfig);
  if (odin) {
    odin.permission = {
      ...odin.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  const thor = agentByKey(params.agentResult, "thor", params.pluginConfig);
  if (thor) {
    thor.permission = {
      ...thor.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  const mimir = agentByKey(params.agentResult, "mimir", params.pluginConfig);
  if (mimir) {
    mimir.permission = {
      ...mimir.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
      bash: "deny",
      interactive_bash: "deny",
    };
  }
  const junior = agentByKey(params.agentResult, "einherjar", params.pluginConfig);
  if (junior) {
    junior.permission = {
      ...junior.permission,
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }

  params.config.permission = {
    webfetch: "allow",
    external_directory: "allow",
    ...(params.config.permission as Record<string, unknown>),
    task: "deny",
  };
}
