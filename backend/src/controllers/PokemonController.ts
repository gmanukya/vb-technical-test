import { type Request, type Response, Router } from 'express'
import { parsePokemonId } from '../parsePokemonId'
import { fetchPokemon, getPokemonList } from '../services/pokeapi'

/** `GET /pokemons` returns the card list. `GET /pokemons/:id` returns one Markdown record. */
const PokemonController = Router()

PokemonController.get('/', async (_req: Request, res: Response) => {
	const pokemons = await getPokemonList()
	return res.status(200).send({ pokemons })
})

PokemonController.get(
	'/:id',
	async (req: Request, res: Response) => {
		const id = parsePokemonId(req.params.id)
		const pokemon = await fetchPokemon(id)

		return res.status(200).send({ pokemon })
	}
)

export { PokemonController }
