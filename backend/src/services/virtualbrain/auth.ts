import axios from 'axios'

import { config } from '../../config'
import { HttpError } from '../../httpError'
import { isRecord } from '../../isRecord'

interface Access {
	accessToken: string
	expiresAt: number
	chatbotId: string
}

const REFRESH_SKEW_MS = 60_000

let access: Access | null = null
let inflight: Promise<Access> | null = null

/**
 * Bearer token and chatbot id. The API key never leaves this process.
 * A token is reused until 60 seconds before expiry. Concurrent callers share one exchange.
 */
export function getChatbotAccess(): Promise<Access> {
	if (!config.chatbotApiKey) {
		return Promise.reject(new HttpError(500, 'Chatbot API key is not configured'))
	}

	if (access && access.expiresAt - REFRESH_SKEW_MS > Date.now()) {
		return Promise.resolve(access)
	}

	if (!inflight) {
		inflight = exchange()
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

/** Drop the cached access token so the next call exchanges the API key again. */
export function invalidateChatbotAccess(): void {
	access = null
}

async function exchange(): Promise<Access> {
	const response = await axios.post<unknown>(
		`${config.chatbotApiUrl}/v1/auth/api-key/token`,
		{
			apiKey: config.chatbotApiKey,
		},
		{
			validateStatus: () => true,
		},
	).catch(() => {
		throw new HttpError(502, 'Battle service is unavailable')
	})

	return readAccess(response.status, response.data)
}

/** 401 and 403 mean the key was rejected. Any other failure, including a malformed body, is 502. */
function readAccess(status: number, body: unknown): Access {
	if (status === 401 || status === 403) {
		throw new HttpError(401, 'Chatbot API key was rejected')
	}

	if (status < 200 || status >= 300 || !isRecord(body)) {
		throw new HttpError(502, 'Battle service is unavailable')
	}

	const { accessToken, expiresIn, chatbotId } = body
	
	if (typeof accessToken !== 'string' || typeof chatbotId !== 'string' || typeof expiresIn !== 'number') {
		throw new HttpError(502, 'Battle service is unavailable')
	}

	return {
		accessToken,
		chatbotId,
		expiresAt: Date.now() + expiresIn * 1000,
	}
}
