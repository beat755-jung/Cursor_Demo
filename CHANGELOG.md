# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 참고하며,
버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [1.0.0] - 2026-06-22

**RFC 5322 기반 이메일 검증 모듈과 Cursor 개발 워크플로우 도구를 갖춘 첫 정식 릴리스입니다.**

> 범위: `6a7bc38`(init) → `6e9f22d`

### ✨ 기능

- RFC 5322 정규식 + RFC 3696 길이 제한(로컬 64자, 전체 254자) 이메일 검증 (`isValidEmail`)
- 사용자 배열에서 이메일 추출·필터링·중복 제거 (`extractEmails`, `getValidEmails`, `uniqueValidEmails`)
- Node.js 내장 테스트 러너 기반 단위 테스트 7건 (`npm test`)
- PR 준비 슬래시 커맨드 `/prep-pr` — 테스트 실행, 변경 요약, 커밋 메시지·리뷰 포인트 제안
- 릴리스 노트 작성 스킬 (`.cursor/skills/release-notes/SKILL.md`)
- 커밋 수집 스크립트 — `scripts/collect_commits.sh` (Git Bash), `scripts/collect_commits.ps1` (PowerShell)
- GitHub 이슈 [#1](https://github.com/beat755-jung/Cursor_Demo/issues/1) — Cursor.AI Rules, Skills, MCP, Agent 모드 정리

### 🐛 버그 수정

- (해당 없음)

### 🧹 기타

- ES Module 프로젝트 구성 (`"type": "module"`, `src/index.js` 진입점)
- Cursor 코딩 규칙 추가 (`.cursor/rules/coding-style.mdc`) — 한국어 주석·JSDoc·ESM
- `.gitignore`, `README.md`, `package-lock.json` 추가
- `email.js` 모듈 분리 및 JSDoc 보강
- Windows CMD 환경을 위한 PowerShell 커밋 수집 스크립트 및 SKILL.md 실행 안내 추가

[1.0.0]: https://github.com/beat755-jung/Cursor_Demo/compare/6a7bc38...6e9f22d
