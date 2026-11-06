import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'
import { fetchPokemon } from './pokeapi'
import { markdownFilename, pokemonToMarkdown } from './markdown'

const POKEMON_COUNT = 898
const EXPORT_CONCURRENCY = 8

export interface ExportFailure {
	id: number
	error: string
}

export interface ExportSummary {
	dir: string
	written: number
	failed: ExportFailure[]
}

/**
 * Write ids 1–898 as Markdown files. Existing files are overwritten.
 * One failure is recorded and the rest of the export continues.
 */
export async function exportAllPokemon(dir: string): Promise<ExportSummary> {
	const destination = path.resolve(dir)
	await mkdir(destination, { recursive: true })

	const limit = pLimit(EXPORT_CONCURRENCY)
	const failed: ExportFailure[] = []
	let written = 0
	const ids = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1)

	await Promise.all(ids.map(id => limit(async () => {
		try {
			const pokemon = await fetchPokemon(id)
			await writeFile(path.join(destination, markdownFilename(pokemon)), pokemonToMarkdown(pokemon), 'utf8')
			written += 1
		} catch (error) {
			failed.push({
				id,
				error: error instanceof Error ? error.message : 'Export failed',
			})
		}
	})))

	failed.sort((a, b) => a.id - b.id)
	return { dir: destination, written, failed }
}
