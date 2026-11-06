import { config } from '../../config'
import { HttpError } from '../../httpError'

interface Access {
	accessToken: string
	refreshToken: string
	expiresAt: number
	chatbotId: string
}

const REFRESH_SKEW_MS = 60_000

let access: Access | null = null
let inflight: Promise<Access> | null = null

/** Bearer token and chatbot id. The API key never leaves this process. */
export function getChatbotAccess(): Promise<Access> {
	if (!config.chatbotApiKey) {
		return Promise.reject(new HttpError(500, 'Chatbot API key is not configured'))
	}

	if (access && access.expiresAt - REFRESH_SKEW_MS > Date.now()) {
		return Promise.resolve(access)
	}

	if (!inflight) {
		const previous = access
		inflight = (previous ? refreshOrExchange(previous) : exchange())
			.then(next => {
				access = next
				return next
			})
			.finally(() => {
				inflight = null
			})
	}

	return inflight
}

/** Drop the cached access token so the next call exchanges or refreshes. */
export function invalidateChatbotAccess(): void {
	access = null
}

async function refreshOrExchange(previous: Access): Promise<Access> {
	try {
		return await refresh(previous)
	} catch {
		return exchange()
	}
}

async function exchange(): Promise<Access> {
	const response = await fetch(`${config.chatbotApiUrl}/v1/auth/api-key/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ apiKey: config.chatbotApiKey }),
	})
	return readAccess(response)
}

async function refresh(previous: Access): Promise<Access> {
	const response = await fetch(`${config.chatbotApiUrl}/v1/auth/api-key/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			refreshToken: previous.refreshToken,
			chatbotId: previous.chatbotId,
		}),
	})
	return readAccess(response)
}

async function readAccess(response: Response): Promise<Access> {
	if (response.status === 401 || response.status === 403) {
		throw new HttpError(401, 'Chatbot API key was rejected')
	}
	if (!response.ok) {
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const body: unknown = await response.json()
	if (!isRecord(body)) {
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const { accessToken, refreshToken, expiresIn, chatbotId } = body
	if (
		typeof accessToken !== 'string'
		|| typeof refreshToken !== 'string'
		|| typeof chatbotId !== 'string'
		|| typeof expiresIn !== 'number'
	) {
		throw new HttpError(502, 'Battle service is unavailable')
	}

	return {
		accessToken,
		refreshToken,
		chatbotId,
		expiresAt: Date.now() + expiresIn * 1000,
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}
