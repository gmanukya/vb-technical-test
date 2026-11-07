import dotenv from 'dotenv'

dotenv.config()

/** `PORT` from the environment, or 3002. Throws when the value is not an integer. */
function readPort(): number {
	const raw = envValue('PORT', '3002')
	const port = Number(raw)

	if (!Number.isInteger(port)) {
		throw new Error(`PORT must be a number, received "${raw}"`)
	}

	return port
}

function envValue(name: string, fallback: string): string {
	const value = process.env[name]
	
	if (value === undefined) {
		return fallback
	}

	return value
}

/** Values read from the environment at startup. `chatbotApiKey` is empty until Fight is configured. */
export const config = {
	port: readPort(),
	exportDir: envValue('EXPORT_DIR', './exports/pokemons'),
	chatbotApiUrl: envValue('VB_API_URL', 'https://chatbot-api.getvirtualbrain.com'),
	chatbotApiKey: envValue('VB_API_KEY', ''),
}
