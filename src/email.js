/**
 * HTML5/WHATWG 이메일 입력 검증 패턴.
 * RFC 5322 전체 정규식은 수천 자에 달해 유지보수가 어렵고 실무에서 권장되지 않는다.
 * 브라우저 `type="email"`과 동일한 실용적 부분집합을 사용한다.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
 * @see https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** RFC 5321 SMTP 최대 주소 길이 */
const MAX_EMAIL_LENGTH = 254;

/**
 * 사용자 배열에서 각 사용자의 `email` 필드만 꺼내 문자열 배열로 반환한다.
 *
 * 형식 검증은 하지 않으며, `undefined`나 빈 문자열도 그대로 포함한다.
 * `getValidEmails`와 함께 쓸 때는 먼저 이 함수로 추출한 뒤 검증하는 패턴을 사용한다.
 *
 * @param {unknown} users - `{ email: string }` 형태 객체의 배열
 * @returns {string[]} 추출된 이메일 배열. 입력이 배열이 아니면 빈 배열
 * @example
 * extractEmails([{ email: 'a@b.com' }, { email: 'c@d.com' }]);
 * // => ['a@b.com', 'c@d.com']
 */
export function extractEmails(users) {
  if (!Array.isArray(users)) {
    return [];
  }
  return users.map((user) => user.email);
}

/**
 * 단일 이메일 문자열이 올바른 주소 형식인지 검사한다.
 *
 * HTML5/WHATWG 권장 정규식으로 형식을 확인하고, 앞뒤 공백을 제거한 뒤
 * RFC 5321 SMTP 최대 길이(254자)를 넘지 않는지도 함께 검사한다.
 * 문자열이 아닌 값, 빈 문자열, 공백만 있는 문자열은 모두 유효하지 않다고 판단한다.
 *
 * @param {unknown} email - 검사할 이메일
 * @returns {boolean} 유효하면 true, 그렇지 않으면 false
 * @example
 * isValidEmail('john@example.com'); // => true
 * isValidEmail('invalid');          // => false
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return EMAIL_REGEX.test(trimmed);
}

/**
 * 사용자 배열에서 형식이 유효한 이메일 주소만 골라 반환한다.
 *
 * `extractEmails`로 이메일을 추출한 뒤 `isValidEmail`로 걸러낸다.
 * 잘못된 형식, 빈 값, `undefined` 등은 결과에서 제외된다.
 *
 * @param {unknown} users - `{ email: string }` 형태 객체의 배열
 * @returns {string[]} 유효한 이메일만 담은 배열
 * @example
 * getValidEmails([
 *   { email: 'john@example.com' },
 *   { email: 'not-an-email' },
 * ]);
 * // => ['john@example.com']
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}

/**
 * 이메일 문자열을 비교·저장에 쓰기 좋은 형태로 정규화한다.
 *
 * 앞뒤 공백을 제거하고 전체를 소문자로 변환한다.
 * 형식 검증은 하지 않으며, 문자열이 아니거나 빈 값이면 null을 반환한다.
 *
 * @param {unknown} email - 정규화할 이메일
 * @returns {string|null} 정규화된 이메일. 정규화할 수 없으면 null
 * @example
 * normalizeEmail('  John@Example.COM  '); // => 'john@example.com'
 * normalizeEmail('');                     // => null
 */
export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.toLowerCase();
}
