import assert from 'node:assert/strict'
import test from 'node:test'

import { canCreateOrStart, parseStudioAccess } from '../src/lib/incubator-studio-access.ts'

test('Studio VIP access matrix keeps new operations fail-closed', () => {
  for (const [status, allowed] of [
    ['ACTIVE', true],
    ['NOT_ENFORCED', true],
    ['INACTIVE', false],
    ['UNAVAILABLE', false]
  ]) {
    assert.equal(parseStudioAccess({ status, can_create_or_start: allowed }), status)
    assert.equal(canCreateOrStart(status), allowed)
  }

  assert.equal(canCreateOrStart(null), false)
})

test('malformed and contradictory access responses never grant permission', () => {
  for (const payload of [
    null,
    {},
    { status: 'ACTIVE', can_create_or_start: false },
    { status: 'INACTIVE', can_create_or_start: true },
    { status: 'UNKNOWN', can_create_or_start: true }
  ]) {
    assert.throws(() => parseStudioAccess(payload), /studio_access_response_invalid/)
  }
})
