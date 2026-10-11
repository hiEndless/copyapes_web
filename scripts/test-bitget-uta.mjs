import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('all Bitget binding locales cover UTA and permissions', () => {
  for (const locale of ['zh', 'zh-TW', 'en', 'ja', 'ko']) {
    const content = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url)))
    const text = content.DashboardApi.bind.bitgetUta
    assert.ok(text.account.includes('UTA'))
    for (const permission of ['uta_mgt', 'uta_trade', 'copy_futures_order']) {
      assert.ok(text.permissions.includes(permission))
    }
  }
  const form = readFileSync(new URL('../src/app/[locale]/dashboard/api/_components/api-bind-form-step.tsx', import.meta.url), 'utf8')
  assert.ok(form.includes("formData.exchange === 'bitget'"))
  assert.ok(form.includes("t('bind.bitgetUta.account')"))
  assert.ok(form.includes("t('bind.bitgetUta.permissions')"))
})
