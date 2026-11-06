/** Failure with an HTTP status. The error handler responds with `{ error: message }`. */
export class HttpError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'HttpError'
		this.status = status
	}
}
