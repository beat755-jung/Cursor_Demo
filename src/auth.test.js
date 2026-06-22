import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPasswordSync,
  verifyPassword,
  verifyPasswordAsync,
  login,
  resetDemoUsersForTests,
  MAX_PASSWORD_LENGTH,
} from './auth.js';

test('hashPasswordSync와 verifyPassword가 일치하는 비밀번호를 검증한다', () => {
  const stored = hashPasswordSync('secret');
  assert.equal(verifyPassword('secret', stored), true);
  assert.equal(verifyPassword('wrong', stored), false);
});

test('verifyPasswordAsync가 비밀번호를 비동기 검증한다', async () => {
  const stored = hashPasswordSync('secret');
  assert.equal(await verifyPasswordAsync('secret', stored), true);
  assert.equal(await verifyPasswordAsync('wrong', stored), false);
});

test('login은 유효한 자격 증명으로 성공한다', async () => {
  resetDemoUsersForTests();
  const result = await login('alice@example.com', 'password123');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.user.email, 'alice@example.com');
    assert.equal(result.user.name, 'Alice');
  }
});

test('login은 잘못된 비밀번호를 거부한다', async () => {
  const result = await login('alice@example.com', 'wrong-password');
  assert.deepEqual(result, { success: false, error: 'INVALID_CREDENTIALS' });
});

test('login은 잘못된 이메일 형식을 거부한다', async () => {
  const result = await login('not-an-email', 'password123');
  assert.deepEqual(result, { success: false, error: 'INVALID_CREDENTIALS' });
});

test('login은 빈 비밀번호를 거부한다', async () => {
  const result = await login('alice@example.com', '');
  assert.deepEqual(result, { success: false, error: 'INVALID_CREDENTIALS' });
});

test('login은 최대 길이를 초과한 비밀번호를 거부한다', async () => {
  const tooLong = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
  const result = await login('alice@example.com', tooLong);
  assert.deepEqual(result, { success: false, error: 'INVALID_CREDENTIALS' });
});

test('login은 존재하지 않는 이메일도 동일한 INVALID_CREDENTIALS를 반환한다', async () => {
  const result = await login('unknown@example.com', 'password123');
  assert.deepEqual(result, { success: false, error: 'INVALID_CREDENTIALS' });
});
