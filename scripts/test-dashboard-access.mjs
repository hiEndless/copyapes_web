import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'

const require = createRequire(import.meta.url)
const React = require('react')

const ts = require('typescript')
const { renderToString } = require('react-dom/server')

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

function evaluate(source, dependencies = {}) {
  const exports = {}

  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX
  } }).outputText

  vm.runInNewContext(output, { exports, module: { exports }, require: name => dependencies[name] || require(name) })

  return exports
}

const policy = evaluate(read('src/lib/dashboard-access.ts'))

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })

  return { promise, resolve }
}

test('all locale and direct privileged routes are covered without blocking ordinary invite pages', () => {
  for (const locale of ['', '/en', '/zh', '/zh-TW', '/ja', '/ko']) {
    assert.equal(policy.dashboardRoleForPath(`${locale}/dashboard/admin`), 'is_admin')
    assert.equal(policy.dashboardRoleForPath(`${locale}/dashboard/partner/settings`), 'is_partner')
    assert.equal(policy.dashboardRoleForPath(`${locale}/dashboard/invite`), null)
    assert.equal(policy.dashboardRoleForPath(`${locale}/dashboard/admin-other`), null)
  }
})

test('only successful server booleans grant roles; cached-looking/malformed payloads fail closed', () => {
  for (const response of [null, {}, { code: 1003, data: { is_admin: true } }, { code: '0', data: { is_admin: true } }]) {
    assert.equal(policy.dashboardRolesFromResponse(response), null)
  }

  assert.equal(policy.dashboardRolesFromResponse({ code: 0, data: { is_admin: 'true', is_partner: 1 } }).is_admin, false)
  assert.equal(policy.dashboardRolesFromResponse({ code: 0, data: { is_admin: 'true', is_partner: 1 } }).is_partner, false)
})

test('role denial, network failure and invalidation discard previous grants', async () => {
  const store = policy.createDashboardAccessStore()

  await store.verify('admin-session', async () => ({ code: 0, data: { is_admin: true } }))
  assert.equal(store.getSnapshot().roles.is_admin, true)
  const pending = deferred()
  const loading = store.verify('regular-session', () => pending.promise)

  assert.equal(store.getSnapshot().status, 'checking')
  assert.equal(store.getSnapshot().roles.is_admin, false)
  pending.resolve({ code: 0, data: { is_admin: false } })
  await loading
  assert.equal(store.getSnapshot().roles.is_admin, false)
  await store.verify('offline', async () => { throw new Error('offline fixture') })
  assert.equal(store.getSnapshot().status, 'denied')
  store.invalidate()
  assert.equal(store.getSnapshot().roles.is_admin, false)
})

test('late admin replies cannot override a logout, account switch or later revocation', async () => {
  for (const invalidateOnly of [true, false]) {
    const store = policy.createDashboardAccessStore()
    const slowAdmin = deferred()
    const old = store.verify('old-admin', () => slowAdmin.promise)

    store.invalidate()
    if (!invalidateOnly) await store.verify('new-user', async () => ({ code: 0, data: { is_admin: false } }))
    slowAdmin.resolve({ code: 0, data: { is_admin: true, is_partner: true } })
    await old
    assert.equal(store.getSnapshot().roles.is_admin, false)
    assert.equal(store.getSnapshot().roles.is_partner, false)
  }
})

test('actual route guard never mounts protected children while checking, denied or unprivileged', () => {
  let path = '/zh/dashboard/admin'
  let snapshot = policy.EMPTY_DASHBOARD_ACCESS
  let mounted = 0

  const components = evaluate(read('src/components/dashboard/dashboard-access-provider.tsx'), {
    react: { ...React, useContext: () => snapshot },
    'next/navigation': { usePathname: () => path },
    'next-intl': { useTranslations: () => key => key },
    '@/api/request': { request: () => assert.fail('render must not issue a request') },
    '@/lib/dashboard-access': policy
  })

  const Secret = () => { mounted++;

 return React.createElement('div', null, 'private fixture') }

  const render = () => renderToString(React.createElement(components.DashboardRouteGuard, null, React.createElement(Secret)))

  assert.ok(!render().includes('private fixture'))

  for (const status of ['denied', 'ready']) {
    snapshot = { identity: 'fixture', status, roles: { is_admin: false, is_partner: false } }
    assert.ok(!render().includes('private fixture'))
  }

  assert.equal(mounted, 0)
  snapshot = { identity: 'fixture', status: 'ready', roles: { is_admin: true, is_partner: false } }
  assert.ok(render().includes('private fixture'))
  path = '/zh/dashboard/partner/settings'
  assert.ok(!render().includes('private fixture'))
  snapshot.roles.is_partner = true
  assert.ok(render().includes('private fixture'))
})

test('shell and profile role visibility use verified context, with shared route guarding and refresh hooks', () => {
  const shell = read('src/app/[locale]/dashboard/dashboard-shell.tsx')
  const dropdown = read('src/components/shadcn-studio/blocks/dashboard/dropdown-profile.tsx')
  const provider = read('src/components/dashboard/dashboard-access-provider.tsx')

  assert.ok(shell.includes('<DashboardAccessProvider>'))
  assert.ok(shell.includes('<DashboardRouteGuard>{children}</DashboardRouteGuard>'))

  for (const source of [shell, dropdown]) {
    assert.ok(source.includes('useDashboardAccess()'))
    assert.ok(!/userInfo\??\.is_(admin|partner)/.test(source))
  }

  assert.ok(provider.includes("cache: 'no-store'"))
  assert.ok(provider.includes('snapshot.identity === identity'))
  for (const event of ['focus', 'storage', 'userInfoUpdated']) assert.ok(provider.includes(`addEventListener('${event}'`))
})
