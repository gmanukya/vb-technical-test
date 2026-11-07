import { Readable } from 'node:stream'

/** A reply that stops producing bytes is considered complete after one second. */
export const CHATBOT_STREAM_IDLE_MS = 1_000

interface ReadTextStreamOptions {
	idleMs: number
	isDone?: (text: string) => boolean
	onChunk?: (chunk: string) => void | Promise<void>
}

/**
 * Read plain text until the source ends, a caller-defined completion condition is met,
 * or no bytes arrive within `idleMs`. The source is always closed before returning.
 */
export async function readTextStream(stream: Readable, options: ReadTextStreamOptions): Promise<string> {
	const decoder = new TextDecoder()
	const isDone = options.isDone ?? (() => false)
	const onChunk = options.onChunk ?? (() => {})
	let text = ''
	let timer: ReturnType<typeof setTimeout> | undefined
	let stopped = false

	const stop = () => {
		stopped = true
		stream.destroy()
	}
	const resetIdleTimer = () => {
		clearTimeout(timer)
		timer = setTimeout(stop, options.idleMs)
	}

	try {
		for await (const value of stream) {
			clearTimeout(timer)
			const chunk = decoder.decode(value, { stream: true })
			text += chunk
			await onChunk(chunk)

			if (isDone(text)) {
				break
			}
			resetIdleTimer()
		}
	} catch (error) {
		if (!stopped) {
			throw error
		}
	} finally {
		clearTimeout(timer)
		stop()
	}

	const tail = decoder.decode()
	if (tail) {
		await onChunk(tail)
	}
	return text + tail
}
