import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'

import { markdownFilename, pokemonToMarkdown } from './markdown'

import { LAST_DEX_ID, POKEAPI_CONCURRENCY } from '../../dex'
import { fetchPokemon } from '../pokeapi'

/** One Pokémon the export could not write. */
export interface ExportFailure {
	id: number
	error: string
}

/** Result of writing the national dex to disk. */
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

	const limit = pLimit(POKEAPI_CONCURRENCY)
	const failed: ExportFailure[] = []
	let written = 0
	const ids = Array.from({ length: LAST_DEX_ID }, (_, index) => {
		return index + 1
	})

	await Promise.all(ids.map((id) => {
		return limit(async () => {
			try {
				const pokemon = await fetchPokemon(id)
				await writeFile(path.join(destination, markdownFilename(pokemon)), pokemonToMarkdown(pokemon), 'utf8')
				written += 1
			} catch (error) {
				let message = 'Export failed'

				if (error instanceof Error) {
					message = error.message
				}

				failed.push({
					id,
					error: message,
				})
			}
		})
	}))

	failed.sort((a, b) => {
		return a.id - b.id
	})
	
	return { dir: destination, written, failed }
}
