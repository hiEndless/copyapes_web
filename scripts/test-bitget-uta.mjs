import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('all Bitget binding locales use a short nontechnical account notice', () => {
  for (const locale of ['zh', 'zh-TW', 'en', 'ja', 'ko']) {
    const content = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url)))
    const text = content.DashboardApi.bind.bitgetUta
    assert.ok(text.account.length > 0)
    assert.ok(text.account.length < 240)
    assert.equal(text.permissions, undefined)
    for (const token of ['UTA', 'uta_mgt', 'uta_trade', 'copy_futures_order']) {
      assert.ok(!text.account.includes(token))
    }
    if (locale === 'zh') assert.equal(text.account, 'Bitget仅支持统一账户模式，经典模式账户会在添加API时自动升级。升级完成后，请再次添加API的统一账户管理权限')
  }
  const form = readFileSync(new URL('../src/app/[locale]/dashboard/api/_components/api-bind-form-step.tsx', import.meta.url), 'utf8')
  assert.ok(form.includes("formData.exchange === 'bitget'"))
  assert.ok(form.includes("t('bind.bitgetUta.account')"))
  assert.ok(!form.includes("t('bind.bitgetUta.permissions')"))
})
