#!/usr/bin/env bash
# beforeShellExecution 훅: 위험한 git 명령을 차단한다.

input=$(cat)

# node 의존 없이 JSON에서 command 필드 추출
command=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [ -z "$command" ]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

# force push, hard reset, 강제 clean 차단
if printf '%s' "$command" | grep -qE 'git push(\s+[^|]*)?(\s+--force|\s+-f)|git reset\s+--hard|git clean\s+(-[a-zA-Z]*f|-fd)'; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "위험한 git 명령이 차단되었습니다. (force push, hard reset, clean -fd)",
  "agent_message": "hooks 정책에 의해 차단되었습니다. 사용자에게 안전한 대안을 제안하세요."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
