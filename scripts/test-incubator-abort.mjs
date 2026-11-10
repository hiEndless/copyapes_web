import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function bff() {
  const calls = []
  const module = { exports: {} }
  const source = fs.readFileSync(new URL('../src/lib/incubator-bff.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: name => { assert.equal(name, 'server-only'); return {} },
    process: { env: { COPYAPES_API_INTERNAL_URL: 'http://copyapes.test', INCUBATOR_API_INTERNAL_URL: 'http://incubator.test' } },
    Request, Response, Headers, URL, AbortController, setTimeout, clearTimeout,
    fetch: async (url, init) => {
      calls.push({ url, init })
      return calls.length === 1
        ? Response.json({ code: 0, data: { access_token: 'fixture-sso' } })
        : Response.json({ status: 'CANCELLING' })
    }
  })
  return { proxy: module.exports.proxyIncubator, calls }
}

const id = '00000000-0000-4000-8000-000000000008'
test('abort forwards only authenticated POST with explicit risk confirmation', async () => {
  const { proxy, calls } = bff()
  const body = { request_id: id, acknowledge_unmanaged_positions: true }
  const response = await proxy(new Request('https://front.test/api/incubator/campaigns/' + id + '/abort', {
    method: 'POST', headers: { Authorization: 'Bearer fixture-login', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }), ['campaigns', id, 'abort'])
  assert.equal(response.status, 200)
  assert.equal(calls.length, 2)
  assert.equal(calls[1].url, `http://incubator.test/api/v1/campaigns/${id}/abort`)
  assert.deepEqual(JSON.parse(new TextDecoder().decode(calls[1].init.body)), body)
})

test('GET, invalid project IDs and unauthenticated calls never reach upstream', async () => {
  for (const [method, campaignId, authenticated, expected] of [
    ['GET', id, true, 404], ['POST', 'invalid', true, 404], ['POST', id, false, 401]
  ]) {
    const { proxy, calls } = bff()
    const response = await proxy(new Request('https://front.test/api/incubator/abort', {
      method, headers: authenticated ? { Authorization: 'Bearer fixture-login' } : {}
    }), ['campaigns', campaignId, 'abort'])
    assert.equal(response.status, expected)
    assert.equal(calls.length, 0)
  }
})
