import { getChatbotAccess, invalidateChatbotAccess } from './auth'
import { postJson } from './http1'

import { config } from '../../config'
import { HttpError } from '../../httpError'

/**
 * POST /v1/open-completion/{id}/query.
 * The body is chunked text/plain. A 401 retries once with a fresh access token.
 */
export async function streamCompletion(query: string, signal: AbortSignal, sessionId?: string): Promise<Response> {
	const response = await requestCompletion(query, signal, sessionId)
	if (response.status !== 401) {
		return response
	}

	invalidateChatbotAccess()
	return requestCompletion(query, signal, sessionId)
}

async function requestCompletion(query: string, signal: AbortSignal, sessionId?: string): Promise<Response> {
	const { accessToken, chatbotId } = await getChatbotAccess()
	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json',
	}

	if (sessionId) {
		headers['x-session-id'] = sessionId
	}

	return postJson(
		`${config.chatbotApiUrl}/v1/open-completion/${chatbotId}/query`,
		{ query },
		headers,
		signal,
	)
}

/**
 * Error the client should see for a failed chatbot response.
 * @returns Null when the response succeeded.
 */
export function completionError(response: { ok: boolean, status: number }): HttpError | null {
	if (response.ok) {
		return null
	}

	if (response.status === 401) {
		return new HttpError(401, 'Chatbot API key was rejected')
	}
	
	if (response.status === 429) {
		return new HttpError(429, 'Battle service is busy. Try again in a moment.')
	}

	return new HttpError(502, 'Battle service is unavailable')
}

/** Chatbot session ids are one token of letters, digits, underscores, and hyphens. */
export function isSessionId(value: string | null): value is string {
	return value !== null && /^[\w-]+$/.test(value)
}
