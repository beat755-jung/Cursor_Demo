import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLoginServer } from './server.js';
import { createRateLimiter } from './rateLimit.js';
import { createAccessToken, verifyAccessToken } from './token.js';

/**
 * 사용 가능한 포트를 찾아 서버를 시작한다.
 *
 * @param {object} [options] - createLoginServer 옵션
 * @returns {Promise<{ server: import('node:http').Server, port: number }>}
 */
async function startTestServer(options = {}) {
  const server = createLoginServer(options);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return { server, port };
}

test('POST /api/login은 유효한 자격 증명으로 200과 accessToken을 반환한다', async () => {
  const { server, port } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123',
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, 'LOGIN_SUCCESS');
    assert.equal(body.user.email, 'alice@example.com');
    assert.ok(typeof body.accessToken === 'string');

    const verified = verifyAccessToken(body.accessToken);
    assert.equal(verified.valid, true);
  } finally {
    server.close();
  }
});

test('POST /api/login은 잘못된 자격 증명으로 401을 반환한다', async () => {
  const { server, port } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'wrong',
      }),
    });

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error, 'INVALID_CREDENTIALS');
  } finally {
    server.close();
  }
});

test('POST /api/login 외 경로는 404를 반환한다', async () => {
  const { server, port } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/other`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 404);
  } finally {
    server.close();
  }
});

test('연속 로그인 실패 시 429 TOO_MANY_REQUESTS를 반환한다', async () => {
  const rateLimiter = createRateLimiter({ maxAttempts: 3, lockMs: 60_000 });
  const { server, port } = await startTestServer({ rateLimiter });

  try {
    for (let i = 0; i < 3; i += 1) {
      await fetch(`http://127.0.0.1:${port}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com', password: 'wrong' }),
      });
    }

    const blocked = await fetch(`http://127.0.0.1:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', password: 'wrong' }),
    });

    assert.equal(blocked.status, 429);
    const body = await blocked.json();
    assert.equal(body.error, 'TOO_MANY_REQUESTS');
  } finally {
    server.close();
  }
});

test('createAccessToken과 verifyAccessToken이 토큰을 검증한다', () => {
  const token = createAccessToken({ email: 'alice@example.com', name: 'Alice' });
  const result = verifyAccessToken(token);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.user.email, 'alice@example.com');
  }
});
