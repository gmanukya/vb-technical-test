import dotenv from 'dotenv'

dotenv.config()

function readPort(): number {
	const raw = process.env.PORT ?? '3002'
	const port = Number(raw)
	if (!Number.isInteger(port)) {
		throw new Error(`PORT must be a number, received "${raw}"`)
	}
	return port
}

export const config = {
	port: readPort(),
	corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
