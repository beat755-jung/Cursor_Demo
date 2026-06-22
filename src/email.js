/**
 * 이메일 검증 정규식 모음.
 *
 * 웹 권장안 요약:
 * - 기본 검증: HTML Living Standard (MDN) — 브라우저 `type="email"`과 동등
 * - 빠른 형식 검사: Practical 패턴 (TrueList)
 * - RFC 5322 전체 정규식: UI Bakery — 기본값으로 쓰지 말 것(과도하게 관대·복잡)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
 * @see https://truelist.io/blog/javascript-validate-email
 * @see https://uibakery.io/regex-library/email
 */

/** RFC 5321 SMTP 최대 주소 길이 */
export const MAX_EMAIL_LENGTH = 254;

/** RFC 5321 로컬 파트(@ 앞) 최대 길이 */
export const MAX_LOCAL_PART_LENGTH = 64;

/**
 * HTML Living Standard 이메일 패턴 (MDN 권장, 브라우저 `type="email"`과 동등).
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
 */
export const HTML_EMAIL_REGEX =
  /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i;

/**
 * Practical 이메일 패턴 — 흔한 오타만 빠르게 걸러낼 때 사용.
 * @see https://truelist.io/blog/javascript-validate-email
 */
export const PRACTICAL_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * RFC 5322 준수 패턴 (UI Bakery). 기본 검증에는 권장하지 않음.
 * @see https://uibakery.io/regex-library/email
 */
export const RFC5322_EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

/**
 * 이메일 길이 제한(RFC 5321)을 검사한다.
 *
 * @param {string} email - 트림된 이메일
 * @returns {boolean} 길이가 유효하면 true
 */
function passesLengthLimits(email) {
  const atIndex = email.lastIndexOf('@');
  return (
    atIndex > 0 &&
    atIndex <= MAX_LOCAL_PART_LENGTH &&
    email.length <= MAX_EMAIL_LENGTH
  );
}

/**
 * 사용자 배열에서 이메일 필드만 추출한다.
 *
 * **성격:** 순수 추출(transform) 함수. 검증·필터링·중복 제거는 하지 않는다.
 * `undefined`, 빈 문자열, 잘못된 형식도 그대로 반환하므로
 * 이후 `isValidEmail` 또는 `getValidEmails`와 조합해 사용한다.
 *
 * @param {unknown} users - `{ email?: string }` 형태 객체의 배열
 * @returns {string[]} 추출된 이메일 배열. 입력이 배열이 아니면 빈 배열
 * @example
 * extractEmails([{ email: 'a@b.com' }, { email: 'bad' }]);
 * // => ['a@b.com', 'bad']
 */
export function extractEmails(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  return users.map((user) => user.email);
}

/**
 * 단일 이메일 문자열의 형식과 길이 제한을 검증한다.
 *
 * **성격:** 판별(predicate) 함수. true/false만 반환하며 데이터를 변경하지 않는다.
 * MDN HTML Living Standard 정규식과 RFC 5321 길이 제한을 함께 적용한다.
 * 앞뒤 공백은 자동으로 제거한 뒤 검사한다.
 *
 * @param {unknown} email - 검증할 이메일
 * @returns {boolean} 유효하면 true
 * @example
 * isValidEmail('alice@example.com'); // => true
 * isValidEmail('invalid');            // => false
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || !passesLengthLimits(trimmed)) {
    return false;
  }

  return HTML_EMAIL_REGEX.test(trimmed);
}

/**
 * RFC 5322 전체 정규식으로 이메일을 검증한다. (선택적·엄격 모드)
 *
 * UI Bakery 등에서 RFC 5322 준수 패턴은 기본 검증에 쓰지 말라고 권장한다.
 * IP 리터럴·따옴표 로컬 파트 등 특수 케이스가 필요할 때만 사용한다.
 *
 * @param {unknown} email - 검증할 이메일
 * @returns {boolean} 유효하면 true
 * @see https://uibakery.io/regex-library/email
 */
export function isValidEmailRfc5322(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || !passesLengthLimits(trimmed)) {
    return false;
  }

  return RFC5322_EMAIL_REGEX.test(trimmed);
}

/**
 * Practical 정규식으로 이메일 형식을 빠르게 검증한다.
 *
 * @param {unknown} email - 검증할 이메일
 * @returns {boolean} 유효하면 true
 * @see https://truelist.io/blog/javascript-validate-email
 */
export function isValidEmailPractical(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return PRACTICAL_EMAIL_REGEX.test(trimmed);
}

/**
 * 사용자 배열에서 형식이 유효한 이메일만 필터링한다.
 *
 * @param {unknown} users - `{ email?: string }` 형태 객체의 배열
 * @returns {string[]} 유효한 이메일 배열
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}

/**
 * 유효한 이메일을 추출하고 대소문자 무시 기준으로 중복을 제거한다.
 *
 * @param {unknown} users - `{ email?: string }` 형태 객체의 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 배열
 */
export function uniqueValidEmails(users) {
  const seen = new Set();
  const result = [];

  for (const email of getValidEmails(users)) {
    const key = email.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(email);
    }
  }

  return result;
}
