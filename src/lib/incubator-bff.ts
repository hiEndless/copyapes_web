import 'server-only'

const REQUEST_TIMEOUT_MS = 20_000
const MAX_BODY_BYTES = 1_048_576

const ROUTE_METHODS: Readonly<Record<string, readonly string[]>> = {
  'auth/sso/login': ['POST'],
  'api-accounts': ['GET', 'POST'],
  'campaigns': ['GET', 'POST'],
  'proxy-assignments/egress-ips': ['GET'],
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function allowedRouteMethods(path: string[]): readonly string[] | undefined {
  const exact = ROUTE_METHODS[path.join('/')]

  if (exact) return exact

  if (
    path[0] === 'rounds' &&
    UUID_PATTERN.test(path[1] || '') &&
    path.length === 5 &&
    path[2] === 'members' &&
    UUID_PATTERN.test(path[3] || '') &&
    path[4] === 'positions'
  ) {
    return ['GET']
  }

  if (path[0] === 'rounds' && UUID_PATTERN.test(path[1] || '') && path.length === 3) {
    if (path[2] === 'setup') return ['PUT']
    if (path[2] === 'start') return ['POST']
    if (path[2] === 'terminate') return ['POST']
    if (path[2] === 'leader-position') return ['GET']
  }

  if (
    path[0] === 'campaigns' &&
    UUID_PATTERN.test(path[1] || '') &&
    path.length === 3 &&
    (path[2] === 'trade-records' || path[2] === 'economics' || path[2] === 'end')
  ) {
    return path[2] === 'end' ? ['POST'] : ['GET']
  }

  if (path[0] !== 'api-accounts' || !UUID_PATTERN.test(path[1] || '')) return undefined
  if (path.length === 2) return ['PATCH', 'DELETE']
  if (path.length === 3 && path[2] === 'health-check') return ['POST']

  return undefined
}

const ALLOWED_BODY_TYPES = ['application/json', 'application/x-www-form-urlencoded']

type ExchangeResponse = {
  code?: number
  data?: { access_token?: string }
}

function requiredServerUrl(name: 'COPYAPES_API_INTERNAL_URL' | 'INCUBATOR_API_INTERNAL_URL'): string {
  const value = process.env[name]?.trim().replace(/\/$/, '')

  if (!value) throw new Error(`${name} is required`)

  return value
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

async function exchange(copyapesAuthorization: string): Promise<string> {
  const response = await fetchWithTimeout(
    `${requiredServerUrl('COPYAPES_API_INTERNAL_URL')}/api/auth/sso/incubator/exchange/`,
    { method: 'POST', headers: { Authorization: copyapesAuthorization, Accept: 'application/json' } },
  )

  if (!response.ok) throw new Error('Copyapes SSO exchange failed')
  const payload = (await response.json()) as ExchangeResponse
  const token = payload.code === 0 ? payload.data?.access_token : undefined

  if (!token) throw new Error('Copyapes SSO exchange returned no access token')

  return token
}

export async function proxyIncubator(request: Request, path: string[]): Promise<Response> {
  const authorization = request.headers.get('authorization')?.trim() || ''

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return Response.json({ detail: 'Copyapes login required' }, { status: 401 })
  }

  if (!path.length || path.some((part) => !part || part === '.' || part === '..')) {
    return Response.json({ detail: 'Invalid Incubator path' }, { status: 400 })
  }

  const allowedMethods = allowedRouteMethods(path)

  if (!allowedMethods || !allowedMethods.includes(request.method)) {
    return Response.json({ detail: 'Incubator route is not allowed' }, { status: 404 })
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const contentLength = Number(request.headers.get('content-length') || '0')

  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ detail: 'Request body too large' }, { status: 413 })
  }

  let body: ArrayBuffer | undefined

  try {
    const rawBody = hasBody ? await request.arrayBuffer() : undefined

    if (rawBody && rawBody.byteLength > MAX_BODY_BYTES) {
      return Response.json({ detail: 'Request body too large' }, { status: 413 })
    }

    body = rawBody?.byteLength ? rawBody : undefined
  } catch {
    return Response.json({ detail: 'Invalid request body' }, { status: 400 })
  }

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() || ''

  if (body && !ALLOWED_BODY_TYPES.includes(contentType)) {
    return Response.json({ detail: 'Unsupported content type' }, { status: 415 })
  }

  try {
    const incubatorToken = await exchange(authorization)
    const incubatorBase = requiredServerUrl('INCUBATOR_API_INTERNAL_URL')
    const encodedPath = path.map(encodeURIComponent).join('/')
    const targetUrl = new URL(`${incubatorBase}/api/v1/${encodedPath}`)

    targetUrl.search = new URL(request.url).search

    const headers: Record<string, string> = {
      Authorization: `Bearer ${incubatorToken}`,
      Accept: 'application/json',
    }

    if (contentType) headers['Content-Type'] = contentType

    const upstream = await fetchWithTimeout(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
    })

    const responseHeaders = new Headers()
    const upstreamContentType = upstream.headers.get('content-type')

    if (upstreamContentType) responseHeaders.set('content-type', upstreamContentType)
    responseHeaders.set('cache-control', 'no-store')

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return Response.json({ detail: 'Incubator service unavailable' }, { status: 503 })
  }
}
