/**
 * IP 기반 로그인 rate limiter를 생성한다.
 *
 * @param {object} [options] - 설정
 * @param {number} [options.maxAttempts=5] - 잠금 전 최대 실패 횟수
 * @param {number} [options.lockMs=900000] - 잠금 시간 (기본 15분)
 * @returns {{ isBlocked: (key: string) => boolean, recordFailure: (key: string) => void, reset: (key: string) => void }}
 */
export function createRateLimiter(options = {}) {
  const maxAttempts = options.maxAttempts ?? 5;
  const lockMs = options.lockMs ?? 15 * 60 * 1000;

  /** @type {Map<string, { failures: number, lockedUntil: number }>} */
  const records = new Map();

  /**
   * @param {string} key - 클라이언트 식별자 (IP 등)
   * @returns {boolean} 차단 중이면 true
   */
  function isBlocked(key) {
    const record = records.get(key);
    if (!record) {
      return false;
    }

    if (record.lockedUntil > Date.now()) {
      return true;
    }

    if (record.lockedUntil > 0 && record.lockedUntil <= Date.now()) {
      records.delete(key);
    }

    return false;
  }

  /**
   * @param {string} key - 클라이언트 식별자
   */
  function recordFailure(key) {
    const now = Date.now();
    const record = records.get(key) ?? { failures: 0, lockedUntil: 0 };

    record.failures += 1;
    if (record.failures >= maxAttempts) {
      record.lockedUntil = now + lockMs;
      record.failures = 0;
    }

    records.set(key, record);
  }

  /**
   * @param {string} key - 클라이언트 식별자
   */
  function reset(key) {
    records.delete(key);
  }

  return { isBlocked, recordFailure, reset };
}
