import { scrypt, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { isValidEmail } from './email.js';

const scryptAsync = promisify(scrypt);

/** 비밀번호 최대 길이 (DoS 방지) */
export const MAX_PASSWORD_LENGTH = 128;

/** 타이밍 공격 완화용 더미 해시 (고정 솔트) */
const DUMMY_HASH = hashPasswordSync(
  '__timing_dummy__',
  Buffer.from('0000000000000000', 'hex'),
);

/** @type {{ email: string, name: string, passwordHash: string }[] | null} */
let demoUsers = null;

/**
 * 환경 변수에서 데모 사용자 목록을 로드한다.
 *
 * @returns {{ email: string, name: string, passwordHash: string }[]}
 */
function getDemoUsers() {
  if (demoUsers) {
    return demoUsers;
  }

  const password = process.env.DEMO_USER_PASSWORD;
  if (!password) {
    throw new Error(
      'DEMO_USER_PASSWORD 환경 변수를 설정하세요. (예: npm test 실행 시 자동 설정)',
    );
  }

  demoUsers = [
    {
      email: (process.env.DEMO_USER_EMAIL ?? 'alice@example.com').toLowerCase(),
      name: process.env.DEMO_USER_NAME ?? 'Alice',
      passwordHash: hashPasswordSync(password),
    },
  ];

  return demoUsers;
}

/**
 * 테스트용 사용자 저장소를 초기화한다.
 *
 * @internal
 */
export function resetDemoUsersForTests() {
  demoUsers = null;
}

/**
 * 비밀번호를 scrypt로 동기 해시한다. (초기화·테스트용)
 *
 * @param {string} password - 평문 비밀번호
 * @param {Buffer} [salt] - 솔트 (생략 시 랜덤 생성)
 * @returns {string} `saltHex:hashHex` 형식
 */
export function hashPasswordSync(password, salt = randomBytes(16)) {
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/** @deprecated hashPasswordSync 별칭 */
export const hashPassword = hashPasswordSync;

/**
 * 저장된 해시와 평문 비밀번호를 timing-safe 방식으로 동기 비교한다.
 *
 * @param {string} password - 평문 비밀번호
 * @param {string} stored - `hashPasswordSync` 결과 문자열
 * @returns {boolean} 일치하면 true
 */
export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, 64);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

/**
 * 저장된 해시와 평문 비밀번호를 timing-safe 방식으로 비동기 비교한다.
 *
 * @param {string} password - 평문 비밀번호
 * @param {string} stored - 해시 문자열
 * @returns {Promise<boolean>} 일치하면 true
 */
export async function verifyPasswordAsync(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  /** @type {Buffer} */
  const actual = await scryptAsync(password, salt, 64);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

/**
 * 비밀번호 입력값을 검증한다.
 *
 * @param {unknown} password - 검증할 비밀번호
 * @returns {boolean} 유효하면 true
 */
function isValidPasswordInput(password) {
  return (
    typeof password === 'string' &&
    password.length > 0 &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

/**
 * 이메일·비밀번호로 로그인을 시도한다.
 *
 * @param {unknown} email - 로그인 이메일
 * @param {unknown} password - 로그인 비밀번호
 * @returns {Promise<{ success: true, user: { email: string, name: string } } | { success: false, error: string }>}
 */
export async function login(email, password) {
  if (!isValidEmail(email) || !isValidPasswordInput(password)) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = getDemoUsers().find(
    (entry) => entry.email === normalizedEmail,
  );

  // 존재하지 않는 사용자에도 동일한 scrypt 연산을 수행해 타이밍 열거를 완화한다.
  const hashToVerify = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatches = await verifyPasswordAsync(password, hashToVerify);

  if (!user || !passwordMatches) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  return {
    success: true,
    user: { email: user.email, name: user.name },
  };
}
