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
		if (signal !== undefined && signal.aborted) {
			reject(abortError())
			return
		}

		const target = new URL(url)
		const payload = Buffer.from(JSON.stringify(body))
		let transport: typeof http | typeof https = https
		if (target.protocol === 'http:') {
			transport = http
		}
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
			if (signal !== undefined) {
				signal.removeEventListener('abort', onAbort)
			}

			const pairs: [string, string][] = []
			for (const [key, value] of Object.entries(incoming.headers)) {
				if (value === undefined) continue
				let values: string[]
				if (Array.isArray(value)) {
					values = value
				} else {
					values = [value]
				}
				for (const item of values) {
					pairs.push([key, item])
				}
			}

			let status = 502
			if (incoming.statusCode !== undefined) {
				status = incoming.statusCode
			}
			resolve(new Response(Readable.toWeb(incoming) as ReadableStream<Uint8Array>, {
				status,
				headers: pairs,
			}))
		})

		const onAbort = () => {
			req.destroy()
			
			if (settled) {
				return
			}

			settled = true
			reject(abortError())
		}

		if (signal !== undefined) {
			signal.addEventListener('abort', onAbort, { once: true })
		}
		
		req.on('error', (error) => {
			if (settled) {
				return
			}

			settled = true
			if (signal !== undefined) {
				signal.removeEventListener('abort', onAbort)
			}
			reject(error)
		})

		req.end(payload)
	})
}

/** A dropped chatbot stream, not a cancel from our side. */
export function isUpstreamStreamError(error: unknown): boolean {
	if (!(error instanceof Error) || error.name === 'AbortError') {
		return false
	}

	if (error.message === 'terminated') {
		return true
	}

	let code: unknown
	if ('code' in error) {
		code = error.code
	}
	if (code === 'ECONNRESET' || code === 'EPIPE' || code === 'ERR_HTTP2_STREAM_ERROR' || code === 'UND_ERR_SOCKET') {
		return true
	}

	let cause: unknown
	if ('cause' in error) {
		cause = error.cause
	}
	return cause !== undefined && cause !== error && isUpstreamStreamError(cause)
}

function abortError(): Error {
	const error = new Error('The operation was aborted')
	error.name = 'AbortError'
	return error
}
