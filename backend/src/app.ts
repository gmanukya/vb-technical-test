import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import axios from 'axios'
import { createServer } from 'http'

import { config } from './config'
import { BattleController } from './controllers/BattleController'
import { ContentController } from './controllers/ContentsController'
import { PokemonController } from './controllers/PokemonController'
import { HttpError } from './httpError'

const app = express()

app.disable('x-powered-by')
const httpServer = createServer(app)

app.use(cors({
	origin: config.corsOrigin,
	exposedHeaders: ['x-session-id'],
}))

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.use('/pokemons', PokemonController)
app.use('/contents', ContentController)
app.use('/battles', BattleController)
app.get('/ping', (_req, res) => res.status(200).send('pong'))

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

httpServer.listen(config.port, () => {
	console.log('Server started on port:', config.port)
})
