import { createHmac, timingSafeEqual } from 'node:crypto';

/** 액세스 토큰 유효 시간 (밀리초) */
const TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * 세션 서명에 사용할 비밀키를 반환한다.
 *
 * @returns {string} HMAC 서명 키
 */
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET 환경 변수(32자 이상)가 필요합니다.');
  }

  return 'dev-only-session-secret-change-me!!';
}

/**
 * 로그인 성공 사용자용 액세스 토큰을 발급한다.
 *
 * @param {{ email: string, name: string }} user - 인증된 사용자
 * @returns {string} 서명된 토큰
 */
export function createAccessToken(user) {
  const payload = {
    sub: user.email,
    name: user.name,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');

  return `${body}.${signature}`;
}

/**
 * 액세스 토큰을 검증한다.
 *
 * @param {string} token - 검증할 토큰
 * @returns {{ valid: true, user: { email: string, name: string } } | { valid: false }}
 */
export function verifyAccessToken(token) {
  if (typeof token !== 'string') {
    return { valid: false };
  }

  const dotIndex = token.lastIndexOf('.');
  if (dotIndex <= 0) {
    return { valid: false };
  }

  const body = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return { valid: false };
    }

    return {
      valid: true,
      user: { email: payload.sub, name: payload.name },
    };
  } catch {
    return { valid: false };
  }
}
