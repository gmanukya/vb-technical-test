import { createServer } from 'http'

import { createApp } from './app'
import { config } from './config'

const httpServer = createServer(createApp())

httpServer.listen(config.port, () => {
	console.log('Server started on port:', config.port)
})
