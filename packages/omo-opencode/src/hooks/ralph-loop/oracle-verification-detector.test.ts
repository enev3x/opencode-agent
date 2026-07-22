/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test"
import {
	extractVolvaSessionID,
	isVolvaVerified,
	parseVolvaVerificationEvidence,
} from "./volva-verification-detector"
import { ULTRAWORK_VERIFICATION_PROMISE } from "./constants"

describe("parseVolvaVerificationEvidence", () => {
	test("#given valid volva verification text #then should parse all fields", () => {
		// #given
		const text = `Task completed.

Agent: volva

<promise>VERIFIED</promise>

<task_metadata>
session_id: ses_volva_123
</task_metadata>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("volva")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBe("ses_volva_123")
	})

	test("#given text without agent line #then should return undefined", () => {
		// #given
		const text = `<promise>VERIFIED</promise>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text without promise tag #then should return undefined", () => {
		// #given
		const text = `Agent: volva`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text with empty agent #then should return undefined", () => {
		// #given
		const text = `Agent:   

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text with empty promise #then should return undefined", () => {
		// #given
		const text = `Agent: volva

<promise>   </promise>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given text without metadata #then should parse agent and promise only", () => {
		// #given
		const text = `Agent: volva

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("volva")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBeUndefined()
	})

	test("#given text with metadata but no session_id #then should parse agent and promise only", () => {
		// #given
		const text = `Agent: volva

<promise>VERIFIED</promise>

<task_metadata>
other_field: value
</task_metadata>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("volva")
		expect(evidence?.promise).toBe("VERIFIED")
		expect(evidence?.sessionID).toBeUndefined()
	})

	test("#given empty text #then should return undefined", () => {
		// #given
		const text = ""

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given whitespace-only text #then should return undefined", () => {
		// #given
		const text = "   \n\t  "

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeUndefined()
	})

	test("#given agent with different casing #then should preserve original case", () => {
		// #given
		const text = `Agent: ORACLE

<promise>VERIFIED</promise>`

		// #when
		const evidence = parseVolvaVerificationEvidence(text)

		// #then
		expect(evidence).toBeDefined()
		expect(evidence?.agent).toBe("ORACLE")
	})
})

describe("isVolvaVerified", () => {
	test("#given valid volva verification #then should return true", () => {
		// #given
		const text = `Agent: volva

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isVolvaVerified(text)

		// #then
		expect(result).toBe(true)
	})

	test("#given non-volva agent #then should return false", () => {
		// #given
		const text = `Agent: odin

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isVolvaVerified(text)

		// #then
		expect(result).toBe(false)
	})

	test("#given wrong promise #then should return false", () => {
		// #given
		const text = `Agent: volva

<promise>DONE</promise>`

		// #when
		const result = isVolvaVerified(text)

		// #then
		expect(result).toBe(false)
	})

	test("#given volva agent with different casing #then should return true", () => {
		// #given
		const text = `Agent: ORACLE

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const result = isVolvaVerified(text)

		// #then
		expect(result).toBe(true)
	})

	test("#given empty text #then should return false", () => {
		// #given
		const text = ""

		// #when
		const result = isVolvaVerified(text)

		// #then
		expect(result).toBe(false)
	})
})

describe("extractVolvaSessionID", () => {
	test("#given valid volva verification with session_id #then should return session_id", () => {
		// #given
		const text = `Agent: volva

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_volva_123
</task_metadata>`

		// #when
		const sessionID = extractVolvaSessionID(text)

		// #then
		expect(sessionID).toBe("ses_volva_123")
	})

	test("#given valid volva verification without session_id #then should return undefined", () => {
		// #given
		const text = `Agent: volva

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>`

		// #when
		const sessionID = extractVolvaSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given non-volva agent #then should return undefined", () => {
		// #given
		const text = `Agent: odin

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_sis_123
</task_metadata>`

		// #when
		const sessionID = extractVolvaSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given non-volva agent with different casing #then should return undefined", () => {
		// #given
		const text = `Agent: SISYPHUS

<promise>${ULTRAWORK_VERIFICATION_PROMISE}</promise>

<task_metadata>
session_id: ses_sis_123
</task_metadata>`

		// #when
		const sessionID = extractVolvaSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})

	test("#given empty text #then should return undefined", () => {
		// #given
		const text = ""

		// #when
		const sessionID = extractVolvaSessionID(text)

		// #then
		expect(sessionID).toBeUndefined()
	})
})
