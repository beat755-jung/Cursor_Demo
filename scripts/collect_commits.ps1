# 사용법: collect_commits.ps1 <from-ref> <to-ref>
param(
    [string]$From = 'HEAD~20',
    [string]$To = 'HEAD'
)

git log --pretty=format:"- %s (%h)" "${From}..${To}"
