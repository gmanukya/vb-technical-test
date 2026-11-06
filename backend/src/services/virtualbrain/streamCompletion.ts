import { config } from '../../config'
import { getChatbotAccess, invalidateChatbotAccess } from './auth'
import { postJson } from './http1'

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
	if (sessionId) headers['x-session-id'] = sessionId

	return postJson(
		`${config.chatbotApiUrl}/v1/open-completion/${chatbotId}/query`,
		{ query },
		headers,
		signal,
	)
}
