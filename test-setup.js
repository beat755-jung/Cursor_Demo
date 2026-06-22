/** 테스트 실행 전 공통 환경 변수 설정 */
process.env.DEMO_USER_PASSWORD ??= 'password123';
process.env.SESSION_SECRET ??= 'test-secret-minimum-32-characters-long';
