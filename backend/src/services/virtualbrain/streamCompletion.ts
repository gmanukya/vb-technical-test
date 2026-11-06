import { config } from '../../config'
import { getChatbotAccess, invalidateChatbotAccess } from './auth'

/**
 * POST /v1/open-completion/{id}/query.
 * The body is chunked text/plain. A 401 retries once with a fresh access token.
 */
export async function streamCompletion(query: string, signal: AbortSignal): Promise<Response> {
	const response = await requestCompletion(query, signal)
	if (response.status !== 401) {
		return response
	}

	invalidateChatbotAccess()
	return requestCompletion(query, signal)
}

async function requestCompletion(query: string, signal: AbortSignal): Promise<Response> {
	const { accessToken, chatbotId } = await getChatbotAccess()
	return fetch(`${config.chatbotApiUrl}/v1/open-completion/${chatbotId}/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ query }),
		signal,
	})
}
