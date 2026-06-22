/**
 * RFC 5322 이메일 패턴 (emailregex.com, IP 옥텟 버그 수정).
 * @see https://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses
 */
const RFC5322_EMAIL_REGEX = new RegExp(
  '^(?:' +
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*" +
    '|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*"' +
    ')@' +
    '(?:' +
    '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?' +
    '|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])' +
    '|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\]' +
    ')$',
  'i',
);

/** RFC 5321 SMTP 최대 주소 길이 */
const MAX_EMAIL_LENGTH = 254;

/** RFC 5321 로컬 파트(@ 앞) 최대 길이 */
const MAX_LOCAL_PART_LENGTH = 64;

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
  // 배열이 아니면( null, undefined 등 ) 추출할 수 없으므로 빈 배열 반환
  if (!Array.isArray(users)) {
    return [];
  }
  // 각 사용자 객체에서 email 필드만 꺼내 새 배열로 반환
  return users.map((user) => user.email);
}

/**
 * 단일 이메일 문자열의 형식과 길이 제한을 검증한다.
 *
 * **성격:** 판별(predicate) 함수. true/false만 반환하며 데이터를 변경하지 않는다.
 * RFC 5322 정규식과 RFC 3696 길이 제한(로컬 64자, 전체 254자)을 함께 적용한다.
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
  if (trimmed.length === 0) {
    return false;
  }

  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex > MAX_LOCAL_PART_LENGTH) {
    return false;
  }
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return RFC5322_EMAIL_REGEX.test(trimmed);
}

/**
 * 사용자 배열에서 형식이 유효한 이메일만 필터링한다.
 *
 * **성격:** 추출 + 검증을 연결하는 파이프라인 함수.
 * `extractEmails` → `isValidEmail` 순으로 호출해 유효한 값만 남긴다.
 * 중복은 제거하지 않으며, 등장 순서를 유지한다.
 *
 * @param {unknown} users - `{ email?: string }` 형태 객체의 배열
 * @returns {string[]} 유효한 이메일 배열
 * @example
 * getValidEmails([
 *   { email: 'alice@example.com' },
 *   { email: 'bad' },
 * ]);
 * // => ['alice@example.com']
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}

/**
 * 유효한 이메일을 추출하고 대소문자 무시 기준으로 중복을 제거한다.
 *
 * **성격:** 집계(aggregate) 함수. `getValidEmails` 결과에 Set 기반 중복 제거를 적용한다.
 * `alice@example.com`과 `Alice@Example.com`은 동일한 주소로 취급하며,
 * 먼저 등장한 원본 문자열을 유지한다.
 *
 * @param {unknown} users - `{ email?: string }` 형태 객체의 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 배열
 * @example
 * uniqueValidEmails([
 *   { email: 'alice@example.com' },
 *   { email: 'Alice@Example.com' },
 * ]);
 * // => ['alice@example.com']
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
