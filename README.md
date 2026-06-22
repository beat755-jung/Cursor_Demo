# cursor-demo

RFC 5322·RFC 3696 기반 이메일 검증 모듈과 Cursor 개발 워크플로우 도구를 제공하는 데모 프로젝트입니다.

## 시작하기

```bash
npm test
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

## 릴리스 노트

자세한 변경 이력은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.

### v1.0.0

**RFC 5322 기반 이메일 검증 모듈과 Cursor 개발 워크플로우 도구를 갖춘 첫 정식 릴리스입니다.**

#### ✨ 기능

- RFC 5322 정규식 + RFC 3696 길이 제한 이메일 검증 (`isValidEmail`)
- 이메일 추출·필터링·중복 제거 (`extractEmails`, `getValidEmails`, `uniqueValidEmails`)
- Node.js 내장 테스트 러너 기반 테스트 7건 — `npm test`
- PR 준비 슬래시 커맨드 `/prep-pr`
- 릴리스 노트 스킬 및 커밋 수집 스크립트 (Bash / PowerShell)

#### 🐛 버그 수정

- (해당 없음)

#### 🧹 기타

- ES Module 프로젝트 구성 및 Cursor 코딩 규칙 추가
- `.gitignore`, `package-lock.json` 추가

## 커밋 수집 (릴리스 노트 작성용)

```powershell
# PowerShell
.\scripts\collect_commits.ps1 v1.0.0 HEAD
```

```bash
# Git Bash
bash scripts/collect_commits.sh v1.0.0 HEAD
```
