import { proxyIncubator } from '@/lib/incubator-bff'

type RouteContext = { params: Promise<{ path: string[] }> }

async function handler(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params

  return proxyIncubator(request, path)
}

export const dynamic = 'force-dynamic'
export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
