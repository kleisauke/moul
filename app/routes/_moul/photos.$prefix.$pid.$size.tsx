import { LoaderFunction } from '@remix-run/cloudflare'
import { getSession } from '~/session'

function objectNotFound(objectName: string): Response {
	return new Response(
		`<html><body>Photo "<b>${objectName}</b>" not found</body></html>`,
		{
			status: 404,
			headers: {
				'content-type': 'text/html; charset=UTF-8',
			},
		}
	)
}

function parseRange(
	encoded: string | null
): undefined | { offset: number; length: number } {
	if (encoded === null) {
		return
	}

	const parts = encoded.split('-')
	if (parts.length !== 2) {
		throw new Error(
			'Not supported to skip specifying the beginning/ending byte at this time'
		)
	}

	return {
		offset: Number(parts[0]),
		length: Number(parts[1]) + 1 - Number(parts[0]),
	}
}

export const loader: LoaderFunction = async ({ request, params }) => {
	const { prefix, pid, size } = params
	const photoPath = `moul/photos/${prefix}/${pid}/${size}`
	const session = await getSession(request.headers.get('Cookie'))
	if (size == 'original' && !session.has('auth')) {
		return new Response('Unauthorized', { status: 401 })
	}

	if (request.method === 'GET') {
		if (typeof MOUL_BUCKET === 'undefined') {
			const file = await fetch(
				`http://localhost:3030/moul/photos/${prefix}/${pid}/${size}`,
				{
					method: 'GET',
				}
			)
			return new Response(file.body, {
				headers: { 'Content-Type': 'image/jpeg' },
			})
		}
		const range = parseRange(request.headers.get('range'))
		const object = await MOUL_BUCKET.get(photoPath, {
			range: parseRange(request.headers.get('range')),
			onlyIf: request.headers,
		})
		if (object === null) {
			return objectNotFound(photoPath)
		}

		const headers = new Headers()
		object.writeHttpMetadata(headers)
		headers.set('etag', object.httpEtag)
		const status = object.body ? (range ? 206 : 200) : 304
		return new Response(object.body, {
			headers,
			status,
		})
	}

	return new Response(`Method Not Allowed`, {
		status: 405,
	})
}
