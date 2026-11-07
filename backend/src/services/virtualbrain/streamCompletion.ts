import { Readable } from 'node:stream'
import axios from 'axios'

import { getChatbotAccess, invalidateChatbotAccess } from './auth'

import { config } from '../../config'
import { HttpError } from '../../httpError'

/** A chatbot reply. `stream` is plain text. `sessionId` is set when the API sent one. */
export interface ChatbotStream {
	status: number
	sessionId: string | null
	stream: Readable
}

/**
 * POST /v1/open-completion/{id}/query.
 * The body is chunked text/plain. A 401 retries once with a fresh access token.
 */
export async function streamCompletion(query: string, signal: AbortSignal, sessionId?: string): Promise<ChatbotStream> {
	const first = await requestCompletion(query, signal, sessionId)
	if (first.status !== 401) {
		return first
	}

	first.stream.destroy()
	invalidateChatbotAccess()
	return requestCompletion(query, signal, sessionId)
}

async function requestCompletion(query: string, signal: AbortSignal, sessionId?: string): Promise<ChatbotStream> {
	const { accessToken, chatbotId } = await getChatbotAccess()
	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		'Content-Type': 'application/json',
	}
	if (sessionId) {
		headers['x-session-id'] = sessionId
	}

	try {
		const response = await axios.post<Readable>(
			`${config.chatbotApiUrl}/v1/open-completion/${chatbotId}/query`,
			{ query },
			{
				headers,
				responseType: 'stream',
				signal,
				validateStatus: () => true,
			},
		)
		return {
			status: response.status,
			sessionId: sessionHeader(response.headers['x-session-id']),
			stream: response.data,
		}
	} catch (error) {
		if (signal.aborted) {
			throw error
		}
		throw new HttpError(502, 'Battle service is unavailable')
	}
}

/**
 * Error the client should see for a failed chatbot response.
 * @returns Null when the response succeeded.
 */
export function completionError(status: number): HttpError | null {
	if (status >= 200 && status < 300) {
		return null
	}

	if (status === 401) {
		return new HttpError(401, 'Chatbot API key was rejected')
	}

	if (status === 429) {
		return new HttpError(429, 'Battle service is busy. Try again in a moment.')
	}

	return new HttpError(502, 'Battle service is unavailable')
}

/** Chatbot session ids are one token of letters, digits, underscores, and hyphens. */
export function isSessionId(value: string | null): value is string {
	return value !== null && /^[\w-]+$/.test(value)
}

function sessionHeader(value: unknown): string | null {
	let raw: string | undefined

	if (typeof value === 'string') {
		raw = value
	} else if (Array.isArray(value) && typeof value[0] === 'string') {
		raw = value[0]
	}

	if (raw !== undefined && isSessionId(raw)) {
		return raw
	}
	
	return null
}
