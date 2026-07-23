import type { ModelRequirement } from "./model-requirement-types"

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  odin: {
    fallbackChain: [
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      {
        providers: [
          "opencode-go",
          "kimi-for-coding",
          "moonshotai",
          "opencode",
          "vercel",
          "bailian-coding-plan",
          "moonshotai-cn",
          "firmware",
          "ollama-cloud",
          "aihubmix",
        ],
        model: "kimi-k3",
      },
      { providers: ["openai", "github-copilot", "opencode", "vercel"], model: "gpt-5.6-sol", variant: "medium" },
      { providers: ["zai-coding-plan", "opencode", "bailian-coding-plan", "vercel"], model: "glm-5" },
      { providers: ["opencode"], model: "deepseek-v4-flash" },
    ],
    requiresAnyModel: true,
  },
  thor: {
    fallbackChain: [
      {
        providers: ["openai", "github-copilot", "vercel", "opencode"],
        model: "gpt-5.6-sol",
        variant: "medium",
      },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-sonnet-4-6",
      },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      {
        providers: ["openai", "github-copilot", "vercel", "opencode"],
        model: "gpt-5.4",
        variant: "medium",
      },
      {
        providers: ["opencode-go", "vercel"],
        model: "kimi-k3",
      },
      { providers: ["opencode"], model: "deepseek-v4-flash" },
    ],
    requiresAnyModel: true,
  },
  volva: {
    fallbackChain: [
      {
        providers: ["openai", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "xhigh",
      },
      {
        providers: ["github-copilot"],
        model: "gpt-5.6-sol",
        variant: "high",
      },
      {
        providers: ["google", "github-copilot", "opencode", "vercel"],
        model: "gemini-3.1-pro",
        variant: "high",
      },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      { providers: ["opencode-go", "vercel"], model: "glm-5.2" },
    ],
  },
  bragi: {
    fallbackChain: [
      { providers: ["openai"], model: "gpt-5.4-mini-fast" },
      { providers: ["opencode-go", "bailian-coding-plan"], model: "qwen3.5-plus" },
      { providers: ["vercel"], model: "minimax-m2.7-highspeed" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m3" },
      { providers: ["minimax-coding-plan", "minimax-cn-coding-plan"], model: "MiniMax-M3" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m2.7" },
      { providers: ["anthropic", "github-copilot", "vercel"], model: "claude-haiku-4-5" },
      { providers: ["openai", "vercel"], model: "gpt-5.4-nano" },
    ],
  },
  vidar: {
    fallbackChain: [
      { providers: ["openai"], model: "gpt-5.4-mini-fast" },
      { providers: ["opencode-go", "bailian-coding-plan"], model: "qwen3.5-plus" },
      { providers: ["vercel"], model: "minimax-m2.7-highspeed" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m3" },
      { providers: ["minimax-coding-plan", "minimax-cn-coding-plan"], model: "MiniMax-M3" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m2.7" },
      { providers: ["anthropic", "github-copilot", "vercel"], model: "claude-haiku-4-5" },
      { providers: ["openai", "vercel"], model: "gpt-5.4-nano" },
    ],
  },
  "huginn": {
    fallbackChain: [
      { providers: ["openai", "opencode", "vercel"], model: "gpt-5.6-sol", variant: "low" },
      { providers: ["opencode-go", "vercel"], model: "kimi-k3" },
      { providers: ["zai-coding-plan", "vercel"], model: "glm-4.6v" },
      { providers: ["openai", "github-copilot", "opencode", "vercel"], model: "gpt-5-nano" },
    ],
  },
  mimir: {
    fallbackChain: [
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      {
        providers: ["openai", "github-copilot", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "high",
      },
      { providers: ["opencode-go", "vercel"], model: "glm-5.2" },
      {
        providers: ["google", "github-copilot", "opencode", "vercel"],
        model: "gemini-3.1-pro",
      },
    ],
  },
  urd: {
    fallbackChain: [
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-sonnet-4-6",
      },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      {
        providers: ["openai", "github-copilot", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "medium",
      },
      { providers: ["opencode-go", "vercel"], model: "glm-5.2" },
      { providers: ["kimi-for-coding"], model: "kimi-k3" },
    ],
  },
  forseti: {
    fallbackChain: [
      {
        providers: ["openai", "vercel"],
        model: "gpt-5.6-terra",
        variant: "high",
      },
      {
        providers: ["github-copilot"],
        model: "gpt-5.6-terra",
        variant: "high",
      },
      {
        providers: ["openai", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "xhigh",
      },
      {
        providers: ["github-copilot"],
        model: "gpt-5.6-sol",
        variant: "high",
      },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      {
        providers: ["google", "github-copilot", "opencode", "vercel"],
        model: "gemini-3.1-pro",
        variant: "high",
      },
      { providers: ["opencode-go", "vercel"], model: "glm-5.2" },
    ],
  },
  heimdall: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode", "vercel"], model: "claude-sonnet-4-6" },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      { providers: ["opencode-go", "vercel"], model: "kimi-k3" },
      {
        providers: ["openai", "github-copilot", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "medium",
      },
      {
        providers: ["openai", "github-copilot", "vercel", "opencode"],
        model: "gpt-5.4",
        variant: "medium",
      },
      { providers: ["opencode-go", "vercel"], model: "minimax-m3" },
      { providers: ["minimax-coding-plan", "minimax-cn-coding-plan"], model: "MiniMax-M3" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m2.7" },
      { providers: ["opencode"], model: "deepseek-v4-flash" },
    ],
  },
  "einherjar": {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode", "vercel"], model: "claude-sonnet-4-6" },
      {
        providers: ["anthropic", "github-copilot", "opencode", "vercel"],
        model: "claude-opus-4-8",
        variant: "max",
      },
      { providers: ["opencode-go", "vercel"], model: "kimi-k3" },
      {
        providers: ["openai", "github-copilot", "opencode", "vercel"],
        model: "gpt-5.6-sol",
        variant: "medium",
      },
      {
        providers: ["openai", "github-copilot", "vercel", "opencode"],
        model: "gpt-5.4",
        variant: "medium",
      },
      { providers: ["opencode-go", "vercel"], model: "minimax-m3" },
      { providers: ["minimax-coding-plan", "minimax-cn-coding-plan"], model: "MiniMax-M3" },
      { providers: ["opencode-go", "vercel"], model: "minimax-m2.7" },
      { providers: ["opencode"], model: "deepseek-v4-flash" },
    ],
  },
};
