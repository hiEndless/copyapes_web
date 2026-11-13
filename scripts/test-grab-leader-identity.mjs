import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import test from 'node:test'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const contractRoot = process.env.COPYAPES_CONTRACT_ROOT || path.resolve(root, '../contracts')
const contract = JSON.parse(fs.readFileSync(path.join(contractRoot, 'mappings/grab_leader_identity_v1.json')))

function evaluate(source, context = {}) {
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  const sandbox = { exports, module: { exports }, URL, ...context }

  vm.runInNewContext(output, sandbox)

  return sandbox.module.exports
}

const identity = evaluate(read('src/lib/grab-leader-identity.ts'))
const parser = evaluate(read('src/app/[locale]/dashboard/add_task/_lib/trader-url.ts'))
const pageFile = 'src/app/[locale]/dashboard/grab/page.tsx'
const sheetFile = 'src/app/[locale]/dashboard/grab/_components/grab-task-config-sheet.tsx'

// Execute the real TSX handler bodies with isolated UI/HTTP boundaries.
function handler(file, name, context) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let arrow

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) arrow = node.initializer
    ts.forEachChild(node, visit)
  }

  visit(source)
  assert.ok(arrow, `${name} exists`)

  return evaluate(`module.exports = ${arrow.getText(source)}`, { ...identity, ...parser, ...context })
}

test('frontend patterns and examples match the canonical contract', () => {
  assert.equal(identity.OKX_UNIQUE_NAME_PATTERN, contract.exchanges['1'].pattern)
  assert.equal(identity.BINANCE_UNIQUE_NAME_PATTERN, contract.exchanges['2'].pattern)

  for (const [exchange, rule] of Object.entries(contract.exchanges)) {
    for (const id of rule.valid) assert.equal(identity.normalizeGrabLeaderId(` \t${id}\n`, Number(exchange)), id)
    for (const id of rule.invalid) assert.equal(identity.normalizeGrabLeaderId(id, Number(exchange)), null)
  }

  assert.equal(identity.normalizeGrabLeaderId(3887627985594221568, 2), null)
})

test('grab page validates both direct IDs and parsed profile URLs', () => {
  const cases = [
    ['okx', 'https://www.okx.com/zh-hans/copy-trading/account/025D6231931319C0?tab=swap', '025D6231931319C0'],
    ['binance', 'https://www.binance.com/en/copy-trading/lead-details/3887627985594221568', '3887627985594221568'],
    ['okx', 'https://www.okx.com/copy-trading/copy-position-detail?copyRelId=1234567890123456789', 'invalid'],
    ['binance', 'https://www.binance.com/copy-trading/lead-details/not-a-number', 'invalid'],
    ['okx', '025d6231931319c0', '025d6231931319c0'],
    ['okx', '025D6231931319C0-1', 'invalid'],
    ['binance', '3887627985594221568-1', 'invalid']
  ]

  for (const [exchange, traderUrl, expected] of cases) {
    let actual

    handler(pageFile, 'handleParseUrl', { traderUrl, exchange, invalidTraderUrlText: 'invalid',
      selectExchangeFirstText: 'select', setUniqueName: value => { actual = value } })()
    assert.equal(actual, expected)
  }

  assert.ok(read(pageFile).includes('!normalizeGrabLeaderId(uniqueName,'))
})

test('config sheet rejects bypassed invalid IDs before querying and submitting', async () => {
  for (const [exchange, rule] of Object.entries(contract.exchanges)) {
    const platform = exchange === '1' ? 'okx' : 'binance'

    for (const traderId of rule.invalid) {
      const errors = []
      const forbidden = () => assert.fail('invalid ID reached HTTP or form processing')

      const context = { traderId, platform, t: key => key, setMsg: value => errors.push(value),
        getLeaderInfo: forbidden, createGrabTask: forbidden, validateForm: forbidden,
        setIsLoading: forbidden, setIsFetchingData: forbidden, toast: { error: value => errors.push(value) } }

      await handler(sheetFile, 'fetchTraderData', context)()
      await handler(sheetFile, 'handleSubmit', context)()
      assert.ok(errors.length >= 1)
    }
  }
})

test('valid config queries and submits exact normalized string IDs', async () => {
  for (const [exchange, rule] of Object.entries(contract.exchanges)) {
    for (const id of rule.valid) {
      const calls = []

      const context = { traderId: ` ${id} `, platform: exchange === '1' ? 'okx' : 'binance',
        t: key => key, setMsg: () => {}, setIsFetchingData: () => {}, setIsLoading: () => {},
        getLeaderInfo: async body => { calls.push(body);

 return { code: 1, error: 'fixture' } },
        createGrabTask: async body => { calls.push(body);

 return { code: 1, error: 'fixture' } },
        validateForm: () => true, followType: '1', nickname: 'fixture', traderName: 'fixture',
        investAmount: '10', costPerOrder: '1', toast: { error: () => {} } }

      await handler(sheetFile, 'fetchTraderData', context)()
      await handler(sheetFile, 'handleSubmit', context)()
      assert.equal(calls.length, 2)

      for (const body of calls) {
        assert.equal(body.uniqueName, id)
        assert.equal(body.exchange, Number(exchange))
      }
    }
  }
})

test('API functions enforce the same boundary for programmatic callers', async () => {
  const calls = []

  const api = evaluate(read('src/api/task.ts'), { require: name => {
    if (name === '../lib/grab-leader-identity') return identity
    assert.equal(name, './request')

    return { request: async (url, options) => { calls.push({ url, options });

 return { code: 0 } } }
  } })

  for (const [exchange, rule] of Object.entries(contract.exchanges)) {
    for (const id of rule.invalid) {
      for (const method of [api.getLeaderInfo, api.createGrabTask]) {
        await assert.rejects(method({ uniqueName: id, exchange: Number(exchange) }), /Invalid grab trader ID/)
      }
    }

    assert.equal(calls.length, 0)
  }

  for (const method of [api.getLeaderInfo, api.createGrabTask]) {
    await method({ uniqueName: ' 3887627985594221568 ', exchange: 2 })
    assert.equal(calls.at(-1).options.body.uniqueName, '3887627985594221568')
  }
})
