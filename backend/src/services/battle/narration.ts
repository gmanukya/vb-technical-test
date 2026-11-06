import { firstJsonObject } from './jsonObject'

/** Join two narration pieces with a blank line. An empty side is dropped. */
export function joinNarration(left: string, right: string): string {
	if (!left) return right
	if (!right) return left
	return `${left.replace(/\s+$/, '')}\n\n${right.replace(/^\s+/, '')}`
}

/**
 * Prose around the first JSON object. An unfinished object, and a markdown fence around it, stay off the panel.
 * Bold markers are removed.
 */
export function narrationWithoutMoveJson(full: string): string {
	return present(visibleNarration(full))
}

/**
 * Forward the prose before the move JSON. The JSON stays on the server so it can be parsed.
 */
export async function readNarration(
	response: globalThis.Response,
	onText: (visible: string) => void,
): Promise<{ text: string, narration: string }> {
	if (!response.body) {
		const text = await response.text()
		const narration = narrationWithoutMoveJson(text)
		if (narration) onText(narration)
		return { text, narration }
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let full = ''
	let shown = ''

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			full += decoder.decode(value, { stream: true })
			shown = emitNarration(full, shown, onText)
		}
	} catch (error) {
		await reader.cancel().catch(() => {
			return undefined
		})
		throw error
	}

	full += decoder.decode()
	shown = emitNarration(full, shown, onText)
	return { text: full, narration: shown }
}

function emitNarration(full: string, shown: string, onText: (visible: string) => void): string {
	const visible = narrationWithoutMoveJson(full)
	if (visible !== shown) onText(visible)
	return visible
}

function visibleNarration(full: string): string {
	const start = full.indexOf('{')
	if (start < 0) return full.replace(/\s*```(?:json|JSON)?\s*$/, '')

	const json = firstJsonObject(full.slice(start))
	const before = stripOpeningFence(full.slice(0, start))
	if (!json) return before

	const after = stripClosingFence(full.slice(start + json.length))
	if (!before) return after
	if (!after) return before
	return `${before}\n${after}`
}

function present(text: string): string {
	return text.replace(/\*\*/g, '')
}

function stripOpeningFence(before: string): string {
	return before.replace(/\s*```(?:json|JSON)?\s*$/, '').replace(/\s+$/, '')
}

function stripClosingFence(after: string): string {
	return after.replace(/^\s*```/, '').replace(/^\s+/, '')
}
