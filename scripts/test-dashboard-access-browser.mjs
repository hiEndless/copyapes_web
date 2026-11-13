// Isolated localhost browser acceptance, no production tokens or external requests.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const chromeBin = process.env.DASHBOARD_TEST_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const requests = []
let roles = { is_admin: false, is_partner: false }
let offline = false
let nextProcess, chrome, socket
let browserDebug = async () => ({ requests })
let nextOutput = ''
const profile = await mkdtemp(path.join(os.tmpdir(), 'copyapes-access-browser-'))
const frontend = await mkdtemp(path.join(os.tmpdir(), 'copyapes-access-frontend-'))

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Connection', 'close')

  if (req.method === 'OPTIONS') {
    res.end()

    return
  }

  requests.push(req.url)
  res.setHeader('Content-Type', 'application/json')

  if (req.url.startsWith('/api/auth/dashboard-access/')) {
    res.statusCode = offline ? 503 : 200
    res.end(JSON.stringify(offline ? { code: 1 } : { code: 0, data: roles }))
  } else {
    // Business APIs never perform writes; negative response keeps this harness data-free.
    res.end(JSON.stringify({ code: 1, error: 'local fixture' }))
  }
})

async function stop(child) {
  if (!child || !child.pid || child.exitCode !== null) return
  const exited = new Promise(resolve => child.once('exit', resolve))

  try { process.kill(-child.pid, 'SIGTERM') } catch { /* already exited */ }
  await Promise.race([exited, delay(3000)])

  if (child.exitCode === null) {
    try { process.kill(-child.pid, 'SIGKILL') } catch { /* already exited */ }
    await exited
  }
}

try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const apiOrigin = `http://127.0.0.1:${server.address().port}`

  // Reserve an ephemeral test port before starting the dedicated frontend process.
  const reservation = http.createServer()

  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
  const port = reservation.address().port

  await new Promise(resolve => reservation.close(resolve))
  const origin = `http://127.0.0.1:${port}`


  // Separate code/build directory: do not take the user's .next/dev lock or load their .env.
  for (const entry of ['src', 'messages', 'public', 'next.config.ts', 'tsconfig.json', 'package.json', 'postcss.config.mjs', 'next-env.d.ts']) {
    await cp(path.join(root, entry), path.join(frontend, entry), { recursive: true })
  }

  await symlink(path.join(root, 'node_modules'), path.join(frontend, 'node_modules'), 'dir')

  // Marketing content and font downloads are fixtures; authorization code is unchanged.
  const contentRoot = path.join(frontend, 'fixture-content')

  await mkdir(contentRoot)
  await writeFile(path.join(contentRoot, 'content_index.json'), JSON.stringify({ version: 1, default_locale: 'zh-CN', supported_locales: ['zh-CN'], content_types: ['legal', 'tutorials', 'blog'], items: {} }))

  for (const locale of ['zh-CN', 'zh-TW', 'en', 'ja', 'ko']) {
    await mkdir(path.join(contentRoot, locale, 'legal'), { recursive: true })
    for (const name of ['privacy', 'terms']) await writeFile(path.join(contentRoot, locale, 'legal', name + '.mdx'), '---\ntitle: Local fixture\nstatus: published\n---\nLocal browser test fixture.')
  }

  const fontMock = path.join(frontend, 'font-fixture.cjs')

  await writeFile(fontMock, `module.exports = new Proxy({}, {get: (_, url) => {
    const family = new URL(url).searchParams.get('family').split(':')[0];
    return "/* latin */\\n@font-face {font-family: '"+family+"';font-style: normal;font-weight: 100 900;src: url(https://fixture.invalid/font.woff2) format('woff2');}";
  }});`)

  const testEnv = { ...process.env, NEXT_PUBLIC_API_URL: apiOrigin, NEXT_TELEMETRY_DISABLED: '1',
    CONTENT_LOCAL_ROOT: contentRoot, NEXT_FONT_GOOGLE_MOCKED_RESPONSES: fontMock }

  const nextBin = path.join(root, 'node_modules/next/dist/bin/next')

  nextProcess = spawn(process.execPath, [nextBin, 'build', '--webpack'], {
    cwd: frontend, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: testEnv
  })
  for (const stream of [nextProcess.stdout, nextProcess.stderr]) stream.on('data', chunk => { nextOutput = (nextOutput + chunk).slice(-12000) })
  let buildTimer

  const built = await Promise.race([
    new Promise(resolve => nextProcess.once('exit', resolve)),
    new Promise(resolve => { buildTimer = setTimeout(() => resolve('timeout'), 240000).unref() })
  ])

  clearTimeout(buildTimer)
  assert.equal(built, 0, 'isolated production build failed: ' + nextOutput.slice(-2500))
  console.log('isolated production build passed (marketing content/fonts mocked)')
  nextOutput = ''
  nextProcess = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: frontend, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: testEnv
  })
  for (const stream of [nextProcess.stdout, nextProcess.stderr]) stream.on('data', chunk => { nextOutput = (nextOutput + chunk).slice(-12000) })

  for (let attempt = 0; !nextOutput.includes('Ready in'); attempt++) {
    assert.ok(attempt < 120 && nextProcess.exitCode === null, 'isolated Next startup failed: ' + nextOutput.slice(-2500))
    await delay(500)
  }

  console.log('isolated frontend ready')
  chrome = spawn(chromeBin, ['--headless=new', '--disable-background-networking', '--disable-extensions', '--disable-sync',
    '--no-first-run', '--disable-component-update', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { detached: true, stdio: ['ignore', 'ignore', 'pipe'] })
  let chromeOutput = ''
  let chromeError

  chrome.stderr.on('data', chunk => { chromeOutput += chunk })
  chrome.once('error', error => { chromeError = error })

  for (let attempt = 0; !chromeOutput.includes('DevTools listening on'); attempt++) {
    assert.ok(attempt < 60 && !chromeError && chrome.exitCode === null, 'isolated Chrome did not become ready')
    await delay(250)
  }

  socket = new WebSocket(chromeOutput.match(/DevTools listening on (ws:\/\/\S+)/)[1])
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let id = 0
  let sessionId
  const pending = new Map()

  const send = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
    const messageId = ++id

    const timer = setTimeout(() => {
      pending.delete(messageId)
      reject(new Error('CDP command timeout: ' + method))
    }, 90000).unref()

    pending.set(messageId, { resolve, reject, timer })
    socket.send(JSON.stringify({ id: messageId, method, params, ...(session ? { sessionId: session } : {}) }))
  })

  socket.onmessage = event => {
    const message = JSON.parse(event.data)

    if (message.id) {
      const waiter = pending.get(message.id)

      if (!waiter) return
      pending.delete(message.id)
      clearTimeout(waiter.timer)
      if (message.error) waiter.reject(new Error(message.error.message))
      else waiter.resolve(message.result)
    } else if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params
      const allowed = request.url.startsWith(origin + '/') || request.url.startsWith(apiOrigin + '/')

      void send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest',
        allowed ? { requestId } : { requestId, errorReason: 'BlockedByClient' }, message.sessionId).catch(() => {})
    }
  }

  const target = await send('Target.createTarget', { url: 'about:blank' }, null)

  sessionId = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId
  await send('Page.enable')
  await send('Network.enable')
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] })
  await send('Network.setCookie', { name: 'token', value: 'browser-fixture', url: origin })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('token', 'browser-fixture');
    localStorage.setItem('userInfo', JSON.stringify({name:'fixture', is_admin:true, is_partner:true}));
  ` })
  const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value

  browserDebug = async () => ({ requests, page: await evaluate(`({url:location.pathname,title:document.title,text:document.body?.innerText.slice(0,1600)})`), server: nextOutput.slice(-1600) })

  const waitFor = async expression => {
    for (let attempt = 0; attempt < 240; attempt++) {
      if (await evaluate(expression)) return
      await delay(250)
    }

    throw new Error('browser assertion timeout: ' + expression)
  }

  const restricted = url => /^\/api\/(admin\/|partnerset\/|coupons\/|redeems\/|withdraw\/|rebate\/)/.test(url)

  for (const route of ['/zh/dashboard/admin', '/zh/dashboard/partner/settings']) {
    const from = requests.length

    await send('Page.navigate', { url: origin + route })
    await waitFor(`document.querySelector('main [role="alert"]')?.textContent.includes('无权访问')`)
    assert.ok(requests.slice(from).some(url => url.startsWith('/api/auth/dashboard-access/')))
    assert.equal(requests.slice(from).filter(restricted).length, 0)
    console.log(`PASS forged local roles blocked, no protected request: ${route}`)
  }

  roles = { is_admin: true, is_partner: false }
  await send('Page.navigate', { url: origin + '/zh/dashboard/admin' })
  await waitFor(`document.querySelector('main')?.innerText.includes('提现审核')`)

  for (let attempt = 0; !requests.some(url => url.startsWith('/api/admin/withdraw/request/')); attempt++) {
    assert.ok(attempt < 80, 'authorized admin page did not issue its expected read')
    await delay(250)
  }

  assert.ok(requests.some(url => url.startsWith('/api/admin/withdraw/request/')))
  console.log('PASS server-confirmed admin mounts authorized page')
  roles = { is_admin: false, is_partner: false }
  await evaluate(`window.dispatchEvent(new Event('focus'))`)
  await waitFor(`document.querySelector('main [role="alert"]')?.textContent.includes('无权访问')`)
  console.log('PASS role revocation hides already opened admin page')
  offline = true
  await evaluate(`window.dispatchEvent(new Event('focus'))`)
  await waitFor(`document.querySelector('main [role="alert"]')?.textContent.includes('无权访问')`)
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('userInfo')).is_admin`), true)
  console.log('PASS access endpoint failure does not restore forged cached admin')
} catch (error) {
  console.error(JSON.stringify(await browserDebug()))
  throw error
} finally {
  if (socket) socket.close()
  await stop(chrome)
  await stop(nextProcess)
  server.closeAllConnections()
  await new Promise(resolve => server.close(resolve))
  await rm(profile, { recursive: true, force: true })
  await rm(frontend, { recursive: true, force: true })
}
