#!/usr/bin/env bash
# afterFileEdit 훅: 파일 편집 이벤트를 감사 로그에 기록한다.
set -euo pipefail

input=$(cat)
log_file="$(dirname "$0")/audit.log"
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

printf '%s %s\n' "$timestamp" "$input" >> "$log_file"

exit 0
