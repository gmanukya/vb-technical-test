import http from 'node:http'
import https from 'node:https'
import { Readable } from 'node:stream'

/**
 * POST JSON over HTTP/1.1 and return a web Response.
 * Node's global fetch negotiates HTTP/2 with the chatbot API, and those streams
 * are often reset with NGHTTP2_INTERNAL_ERROR while a battle is still generating.
 */
export function postJson(
	url: string,
	body: unknown,
	headers: Record<string, string>,
	signal?: AbortSignal,
): Promise<Response> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(abortError())
			return
		}

		const target = new URL(url)
		const payload = Buffer.from(JSON.stringify(body))
		const transport = target.protocol === 'http:' ? http : https
		let settled = false

		const req = transport.request(target, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Length': String(payload.length),
			},
		}, (incoming) => {
			if (settled) {
				incoming.destroy()
				return
			}
			settled = true
			signal?.removeEventListener('abort', onAbort)

			const pairs: [string, string][] = []
			for (const [key, value] of Object.entries(incoming.headers)) {
				if (value === undefined) continue
				for (const item of Array.isArray(value) ? value : [value]) {
					pairs.push([key, item])
				}
			}

			resolve(new Response(Readable.toWeb(incoming) as ReadableStream<Uint8Array>, {
				status: incoming.statusCode ?? 502,
				headers: pairs,
			}))
		})

		const onAbort = () => {
			req.destroy()
			if (settled) return
			settled = true
			reject(abortError())
		}

		signal?.addEventListener('abort', onAbort, { once: true })
		req.on('error', (error) => {
			if (settled) return
			settled = true
			signal?.removeEventListener('abort', onAbort)
			reject(error)
		})

		req.end(payload)
	})
}

/** A dropped chatbot stream, not a cancel from our side. */
export function isUpstreamStreamError(error: unknown): boolean {
	if (!(error instanceof Error) || error.name === 'AbortError') return false
	if (error.message === 'terminated') return true

	const code = 'code' in error ? error.code : undefined
	if (code === 'ECONNRESET' || code === 'EPIPE' || code === 'ERR_HTTP2_STREAM_ERROR' || code === 'UND_ERR_SOCKET') {
		return true
	}

	const cause = 'cause' in error ? error.cause : undefined
	return cause !== undefined && cause !== error && isUpstreamStreamError(cause)
}

function abortError(): Error {
	const error = new Error('The operation was aborted')
	error.name = 'AbortError'
	return error
}
