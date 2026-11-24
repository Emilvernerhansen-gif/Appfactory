#!/bin/sh
# SessionStart: reinstall pinned tools in fresh cloud containers (fast no-op when present).
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" && sh scripts/setup.sh >&2 || echo "setup failed; RTK inactive, commands run unfiltered" >&2
exit 0
