/**
 * First `{...}` in `text`, counted by brace depth.
 * Braces inside strings still count. An unfinished object returns null.
 * @returns The object source, or null when none is balanced.
 */
export function firstJsonObject(text: string): string | null {
	const start = text.indexOf('{')
	if (start < 0) return null

	let depth = 0
	for (let index = start; index < text.length; index += 1) {
		const char = text[index]
		if (char === '{') depth += 1
		else if (char === '}') {
			depth -= 1
			if (depth === 0) return text.slice(start, index + 1)
		}
	}

	return null
}
