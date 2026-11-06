import { type Request, type Response, Router } from 'express'
import { HttpError } from '../httpError'
import { fetchPokemon } from '../services/pokeapi'

const PokemonController = Router()

function parsePokemonId(raw: string): number {
	if (!/^\d+$/.test(raw)) {
		throw new HttpError(400, 'Pokemon id must be an integer from 1 to 898')
	}

	const id = Number(raw)
	if (id < 1 || id > 898) {
		throw new HttpError(400, 'Pokemon id must be an integer from 1 to 898')
	}

	return id
}

PokemonController.get(
	'/:id',
	async (req: Request, res: Response) => {
		const id = parsePokemonId(req.params.id)
		const pokemon = await fetchPokemon(id)

		return res.status(200).send({ pokemon })
	}
)

export { PokemonController }
