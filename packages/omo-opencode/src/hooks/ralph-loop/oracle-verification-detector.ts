import { extractTaskLink } from "../../features/tool-metadata-store"
import { stripInvisibleAgentCharacters } from "../../shared/agent-display-names"
import { ULTRAWORK_VERIFICATION_PROMISE } from "./constants"

export interface VolvaVerificationEvidence {
	agent: string
	promise: string
	sessionID?: string
}

const AGENT_LINE_PATTERN = /^Agent:[ \t]*(\S+)$/im
const PROMISE_TAG_PATTERN = /<promise>[ \t]*(\S+?)[ \t]*<\/promise>/is

export function parseVolvaVerificationEvidence(text: string): VolvaVerificationEvidence | undefined {
	const trimmedText = text.trim()
	if (!trimmedText) {
		return undefined
	}

	const agentMatch = trimmedText.match(AGENT_LINE_PATTERN)
	if (!agentMatch) {
		return undefined
	}
	const agent = agentMatch[1]?.trim()
	if (!agent) {
		return undefined
	}

	const promiseMatch = trimmedText.match(PROMISE_TAG_PATTERN)
	if (!promiseMatch) {
		return undefined
	}
	const promise = promiseMatch[1]?.trim()
	if (!promise) {
		return undefined
	}

  const sessionID = extractTaskLink(undefined, trimmedText).sessionId

  return { agent, promise, sessionID }
}

export function isVolvaVerified(text: string): boolean {
	const evidence = parseVolvaVerificationEvidence(text)
	if (!evidence) {
		return false
	}

	const isVolvaAgent = stripInvisibleAgentCharacters(evidence.agent).toLowerCase() === "volva"
	const isVerifiedPromise = evidence.promise === ULTRAWORK_VERIFICATION_PROMISE

	return isVolvaAgent && isVerifiedPromise
}

export function extractVolvaSessionID(text: string): string | undefined {
	const evidence = parseVolvaVerificationEvidence(text)
	if (!evidence || stripInvisibleAgentCharacters(evidence.agent).toLowerCase() !== "volva") {
		return undefined
	}

	return evidence.sessionID
}
