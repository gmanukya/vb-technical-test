import cors from 'cors'
import express, { type ErrorRequestHandler, type Express } from 'express'
import axios from 'axios'

import { config } from './config'
import { BattleController } from './controllers/BattleController'
import { ContentController } from './controllers/ContentsController'
import { PokemonController } from './controllers/PokemonController'
import { HttpError } from './httpError'

/** Express app with the Pokémon, contents, and battle routes. `server.ts` is what listens. */
export function createApp(): Express {
	const app = express()

	app.disable('x-powered-by')

	app.use(cors({ origin: config.corsOrigin }))

	app.use(express.json({ limit: '100kb' }))

	app.use('/pokemons', PokemonController)
	app.use('/contents', ContentController)
	app.use('/battles', BattleController)
	app.get('/ping', (_req, res) => {
		res.status(200).send('pong')
	})

	app.use((_req, res) => {
		res.status(404).json({ error: 'Not found' })
	})

	const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
		if (err instanceof HttpError) {
			res.status(err.status).json({ error: err.message })
			return
		}

		if (axios.isAxiosError(err)) {
			console.error(err.message)
			res.status(502).json({ error: 'Pokemon data provider is unavailable' })
			return
		}

		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}

	app.use(errorHandler)

	return app
}
