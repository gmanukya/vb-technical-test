import { type Request, type Response, Router } from 'express'
import { config } from '../config'
import { parsePokemonId } from '../parsePokemonId'
import { exportAllPokemon } from '../services/exportMarkdown'
import { markdownFilename, pokemonToMarkdown } from '../services/markdown'
import { fetchPokemon } from '../services/pokeapi'

const ContentController = Router()

/**
 * Write every Pokémon as a Markdown file under EXPORT_DIR.
 * Registered before `/:pokemonId` so "all" is not parsed as an id.
 */
ContentController.get('/all', async (_req: Request, res: Response) => {
	const summary = await exportAllPokemon(config.exportDir)
	return res.status(200).json(summary)
})

/** One Pokémon as a Markdown file download. */
ContentController.get('/:pokemonId', async (req: Request, res: Response) => {
	const id = parsePokemonId(req.params.pokemonId)
	const pokemon = await fetchPokemon(id)
	const filename = markdownFilename(pokemon)

	res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
	res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
	return res.status(200).send(pokemonToMarkdown(pokemon))
})

export { ContentController }
