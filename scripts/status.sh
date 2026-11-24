#!/bin/sh
# Compact resume snapshot for a fresh session: branch, local changes, recent commits, saved status.
echo "branch: $(git branch --show-current)"
git status --porcelain | head -n 20
git log --oneline -n 5
[ -f docs/STATUS.md ] && sed -n '/^## Næste/,$p' docs/STATUS.md | head -n 20
command -v rtk >/dev/null 2>&1 && echo "rtk: $(rtk --version)" || echo "rtk: missing (npm run setup)"
