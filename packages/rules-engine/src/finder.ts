import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { GLOBAL_DISTANCE, OPENCODE_USER_RULE_DIRS, PROJECT_RULE_FILES, PROJECT_RULE_SUBDIRS, USER_RULE_DIR } from "./constants";
import { sortCandidates } from "./ordering";
import { findRuleFilesRecursive, safeRealpathSync } from "./scanner";
import type { DirectoryScanEntry, FindRuleFilesOptions, RuleFileCandidate, RuleScanCache, RuleSource } from "./types";

export type OdinRuleDeprecationLogger = (
  message: string,
  meta: { event: string; path: string },
) => void;

const noopOdinRuleDeprecationLogger: OdinRuleDeprecationLogger = () => {};

const SISYPHUS_DEPRECATION_MESSAGE = "[rules] .odin/rules is deprecated and will be removed in v4.3.0; migrate to .omo/rules";
const SISYPHUS_LEGACY_RULE_SOURCES: ReadonlySet<RuleSource> = new Set([".odin/rules", "~/.odin/rules"]);
const warnedOdinRuleDirectories = new Set<string>();
let logOdinRuleDeprecation: OdinRuleDeprecationLogger = noopOdinRuleDeprecationLogger;

export function setOdinRuleDeprecationLogger(logger: OdinRuleDeprecationLogger): void {
  logOdinRuleDeprecation = logger;
}

export function findRuleFiles(
  projectRoot: string | null,
  homeDir: string,
  currentFile: string,
  options?: FindRuleFilesOptions,
  cache?: RuleScanCache,
): RuleFileCandidate[] {
  const startDir = dirname(resolve(currentFile));
  const skipClaudeUserRules = options?.skipClaudeUserRules ?? false;
  const effectiveProjectRoot = resolveEffectiveProjectRoot(
    projectRoot,
    options?.workspaceDirectory,
    startDir,
  );
  const cacheKey = [projectRoot ?? "", effectiveProjectRoot, startDir, skipClaudeUserRules ? "1" : "0"].join(
    "\0",
  );
  const cached = cache?.get(cacheKey);
  if (cached) return [...cached];
  const candidates: RuleFileCandidate[] = [];
  const seenRealPaths = new Set<string>();
  addProjectRuleCandidates(effectiveProjectRoot, startDir, candidates, seenRealPaths, cache);
  addProjectSingleFileCandidates(effectiveProjectRoot, candidates, seenRealPaths);
  addUserRuleCandidates(homeDir || homedir(), skipClaudeUserRules, candidates, seenRealPaths, cache);
  const sorted = sortCandidates(candidates);
  cache?.set(cacheKey, sorted);
  return sorted;
}

function resolveEffectiveProjectRoot(
  projectRoot: string | null,
  workspaceDirectory: string | undefined,
  startDir: string,
): string {
  if (projectRoot) return projectRoot;
  if (!workspaceDirectory) return startDir;
  const workspaceRoot = resolve(workspaceDirectory);
  return isSameOrChildPath(startDir, workspaceRoot) ? workspaceRoot : startDir;
}

function addProjectRuleCandidates(
  projectRoot: string,
  startDir: string,
  candidates: RuleFileCandidate[],
  seenRealPaths: Set<string>,
  cache: RuleScanCache | undefined,
): void {
  const projectRootRealPath = safeRealpathSync(projectRoot);
  let currentDir = startDir;
  let distance = 0;
  while (true) {
    for (const [parent, subdir] of PROJECT_RULE_SUBDIRS) {
      const source = `${parent}/${subdir}` as RuleSource;
      const ruleDir = join(currentDir, parent, subdir);
      for (const entry of scanDirectoryWithCache(ruleDir, cache, projectRootRealPath)) {
        if (seenRealPaths.has(entry.realPath)) continue;
        seenRealPaths.add(entry.realPath);
        warnOdinRuleDeprecation(source, entry.path);
        candidates.push({
          path: entry.path,
          realPath: entry.realPath,
          source,
          isGlobal: false,
          distance,
          relativePath: normalizePath(relative(projectRoot, entry.path)),
        });
      }
    }
    if (currentDir === projectRoot) break;
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir || !isSameOrChildPath(parentDir, projectRoot)) break;
    currentDir = parentDir;
    distance += 1;
  }
}

function addProjectSingleFileCandidates(
  projectRoot: string,
  candidates: RuleFileCandidate[],
  seenRealPaths: Set<string>,
): void {
  const projectRootRealPath = safeRealpathSync(projectRoot);
  for (const ruleFile of PROJECT_RULE_FILES) {
    const filePath = join(projectRoot, ruleFile);
    const realPath = validFileRealPath(filePath, projectRootRealPath);
    if (realPath === null || seenRealPaths.has(realPath)) continue;
    seenRealPaths.add(realPath);
    candidates.push({
      path: filePath,
      realPath,
      source: ruleFile as RuleSource,
      isGlobal: false,
      distance: 0,
      isSingleFile: true,
      relativePath: normalizePath(ruleFile),
    });
  }
}

function addUserRuleCandidates(
  homeDir: string,
  skipClaudeUserRules: boolean,
  candidates: RuleFileCandidate[],
  seenRealPaths: Set<string>,
  cache: RuleScanCache | undefined,
): void {
  const userRuleDirs: Array<readonly [string, RuleSource]> = OPENCODE_USER_RULE_DIRS.map((dir) => [join(homeDir, dir), `~/${dir}` as RuleSource]);
  if (!skipClaudeUserRules) userRuleDirs.push([join(homeDir, USER_RULE_DIR), "~/.claude/rules"]);
  for (const [userRuleDir, source] of userRuleDirs) {
    for (const entry of scanDirectoryWithCache(userRuleDir, cache)) {
      if (seenRealPaths.has(entry.realPath)) continue;
      seenRealPaths.add(entry.realPath);
      warnOdinRuleDeprecation(source, entry.path);
      candidates.push({
        path: entry.path,
        realPath: entry.realPath,
        source,
        isGlobal: true,
        distance: GLOBAL_DISTANCE,
        relativePath: normalizePath(relative(homeDir, entry.path)),
      });
    }
  }
}

function scanDirectoryWithCache(dir: string, cache: RuleScanCache | undefined, boundaryRealPath?: string): readonly DirectoryScanEntry[] {
  const cached = cache?.getDirScan(dir);
  if (cached) return cached;
  const entries: DirectoryScanEntry[] = [];
  findRuleFilesRecursive(dir, entries, new Set<string>(), boundaryRealPath);
  cache?.setDirScan(dir, entries);
  return entries;
}

function warnOdinRuleDeprecation(source: RuleSource, path: string): void {
  if (!SISYPHUS_LEGACY_RULE_SOURCES.has(source)) return;
  const warningKey = dirname(path);
  if (warnedOdinRuleDirectories.has(warningKey)) return;
  warnedOdinRuleDirectories.add(warningKey);
  logOdinRuleDeprecation(SISYPHUS_DEPRECATION_MESSAGE, {
    event: "rules-odin-deprecated",
    path,
  });
}

export function _setOdinRuleDeprecationLoggerForTesting(logger: OdinRuleDeprecationLogger): void {
  logOdinRuleDeprecation = logger;
}

export function _resetOdinRuleDeprecationWarningStateForTesting(): void {
  warnedOdinRuleDirectories.clear();
  logOdinRuleDeprecation = noopOdinRuleDeprecationLogger;
}

function validFileRealPath(filePath: string, boundaryRealPath?: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    if (!statSync(filePath).isFile()) return null;
    const realPath = safeRealpathSync(filePath);
    if (boundaryRealPath !== undefined && !isSameOrChildPath(realPath, boundaryRealPath)) return null;
    return realPath;
  } catch {
    return null;
  }
}

function isSameOrChildPath(childPath: string, parentPath: string): boolean {
  const relativePath = relative(parentPath, childPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}
