# cursor-demo

RFC 5322·RFC 3696 기반 이메일 검증 모듈과 Cursor 개발 워크플로우 도구를 제공하는 데모 프로젝트입니다.

## 시작하기

```bash
npm test
node src/index.js
```

## 프로젝트 구조

| 경로 | 설명 |
|------|------|
| `src/email.js` | 이메일 추출·검증·중복 제거 API |
| `src/email.test.js` | 단위 테스트 |
| `src/index.js` | 데모 실행 진입점 |
| `.cursor/commands/prep-pr.md` | PR 준비 슬래시 커맨드 (`/prep-pr`) |
| `.cursor/skills/release-notes/` | 릴리스 노트 작성 스킬 |
| `scripts/collect_commits.{sh,ps1}` | 커밋 수집 스크립트 |

---

## 릴리스 노트

### v1.0.0 — 2026-06-22

**RFC 5322 기반 이메일 검증 모듈과 Cursor 개발 워크플로우 도구를 갖춘 첫 정식 릴리스입니다.**

> 범위: `6a7bc38`(init) → `3966300`  
> 자세한 변경 이력: [CHANGELOG.md](./CHANGELOG.md)

#### ✨ 기능

- RFC 5322 정규식 + RFC 3696 길이 제한(로컬 64자, 전체 254자) 이메일 검증 (`isValidEmail`)
- 사용자 배열에서 이메일 추출·필터링·중복 제거 (`extractEmails`, `getValidEmails`, `uniqueValidEmails`)
- Node.js 내장 테스트 러너 기반 단위 테스트 7건 — `npm test`
- PR 준비 슬래시 커맨드 `/prep-pr` — 테스트 실행, 변경 요약, 커밋 메시지·리뷰 포인트 제안
- 릴리스 노트 작성 스킬 (`.cursor/skills/release-notes/SKILL.md`)
- 커밋 수집 스크립트 — `scripts/collect_commits.sh` (Git Bash), `scripts/collect_commits.ps1` (PowerShell)
- GitHub 이슈 [#1](https://github.com/beat755-jung/Cursor_Demo/issues/1) — Cursor.AI Rules, Skills, MCP, Agent 모드 정리

#### 🐛 버그 수정

- (해당 없음)

#### 🧹 기타

- ES Module 프로젝트 구성 (`"type": "module"`, `src/index.js` 진입점)
- Cursor 코딩 규칙 추가 (`.cursor/rules/coding-style.mdc`) — 한국어 주석·JSDoc·ESM
- `.gitignore`, `README.md`, `CHANGELOG.md`, `package-lock.json` 추가
- `email.js` 모듈 분리 및 JSDoc 보강
- Windows CMD 환경을 위한 PowerShell 커밋 수집 스크립트 및 SKILL.md 실행 안내 추가

---

## API 요약

| 함수 | 설명 |
|------|------|
| `extractEmails(users)` | 사용자 배열에서 `email` 필드만 추출 |
| `isValidEmail(email)` | RFC 5322·3696 기준 형식·길이 검증 |
| `getValidEmails(users)` | 유효한 이메일만 필터링 |
| `uniqueValidEmails(users)` | 유효 이메일 중 대소문자 무시 중복 제거 |

---

## 커밋 수집 (릴리스 노트 작성용)

```powershell
# PowerShell
.\scripts\collect_commits.ps1 v1.0.0 HEAD
```

```bash
# Git Bash
bash scripts/collect_commits.sh v1.0.0 HEAD
```

## Cursor 워크플로우

| 도구 | 사용법 |
|------|--------|
| `/prep-pr` | PR 전 테스트·변경 요약·커밋 메시지 제안 |
| `release-notes` 스킬 | "릴리스 노트 작성해줘"로 CHANGELOG 형식 정리 |
