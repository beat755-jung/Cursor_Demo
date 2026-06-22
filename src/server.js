import { createServer } from 'node:http';
import { login } from './auth.js';
import { createAccessToken } from './token.js';
import { createRateLimiter } from './rateLimit.js';

/** 요청 본문 최대 크기 (바이트) */
const MAX_BODY_BYTES = 4096;

/** 요청 본문 읽기 타임아웃 (밀리초) */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * HTTP 요청 본문을 JSON으로 파싱한다.
 *
 * @param {import('node:http').IncomingMessage} req - HTTP 요청
 * @returns {Promise<unknown>} 파싱된 JSON 객체
 */
async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];
    let totalLength = 0;

    const timer = setTimeout(() => {
      req.destroy();
      reject(new Error('REQUEST_TIMEOUT'));
    }, REQUEST_TIMEOUT_MS);

    req.on('data', (chunk) => {
      totalLength += chunk.length;
      if (totalLength > MAX_BODY_BYTES) {
        clearTimeout(timer);
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      clearTimeout(timer);
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * JSON 응답을 전송한다.
 *
 * @param {import('node:http').ServerResponse} res - HTTP 응답
 * @param {number} statusCode - HTTP 상태 코드
 * @param {unknown} body - 응답 본문
 */
function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

/**
 * 클라이언트 IP를 추출한다.
 *
 * @param {import('node:http').IncomingMessage} req - HTTP 요청
 * @returns {string} 클라이언트 IP
 */
function getClientIp(req) {
  return req.socket.remoteAddress ?? 'unknown';
}

/**
 * 로그인 API HTTP 서버를 생성한다.
 *
 * @param {object} [options] - 서버 옵션
 * @param {ReturnType<typeof createRateLimiter>} [options.rateLimiter] - rate limiter
 * @returns {import('node:http').Server} HTTP 서버 인스턴스
 */
export function createLoginServer(options = {}) {
  const rateLimiter = options.rateLimiter ?? createRateLimiter();

  return createServer(async (req, res) => {
    req.setTimeout(REQUEST_TIMEOUT_MS);

    if (req.method !== 'POST' || req.url !== '/api/login') {
      sendJson(res, 404, { error: 'NOT_FOUND' });
      return;
    }

    const clientIp = getClientIp(req);
    if (rateLimiter.isBlocked(clientIp)) {
      sendJson(res, 429, { error: 'TOO_MANY_REQUESTS' });
      return;
    }

    try {
      const body = await readJsonBody(req);
      const result = await login(body?.email, body?.password);

      if (!result.success) {
        rateLimiter.recordFailure(clientIp);
        sendJson(res, 401, { error: result.error });
        return;
      }

      rateLimiter.reset(clientIp);
      const accessToken = createAccessToken(result.user);

      sendJson(res, 200, {
        message: 'LOGIN_SUCCESS',
        user: result.user,
        accessToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(res, 413, { error: 'PAYLOAD_TOO_LARGE' });
        return;
      }

      if (error instanceof Error && error.message === 'REQUEST_TIMEOUT') {
        sendJson(res, 408, { error: 'REQUEST_TIMEOUT' });
        return;
      }

      sendJson(res, 400, { error: 'INVALID_JSON' });
    }
  });
}

/**
 * 로그인 API 서버를 지정 호스트·포트에서 시작한다.
 *
 * @param {number} [port=3000] - 수신 포트
 * @param {string} [host='127.0.0.1'] - 바인딩 호스트
 * @returns {import('node:http').Server} 시작된 서버
 */
export function startLoginServer(port = 3000, host = process.env.HOST ?? '127.0.0.1') {
  const server = createLoginServer();
  server.listen(port, host);
  return server;
}

// 직접 실행 시 서버 시작
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST ?? '127.0.0.1';
  startLoginServer(port, host);
  console.log(`로그인 API 서버 실행 중: http://${host}:${port}/api/login`);
}
