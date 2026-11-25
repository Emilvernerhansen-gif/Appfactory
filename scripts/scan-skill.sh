#!/bin/sh
# Static security scan of an agent skill/plugin before installing it.
# Usage: npm run scan-skill -- <dir | SKILL.md | git URL | zip>
# Installs NVIDIA SkillSpector (pinned, from its uv.lock) on first use into ~/.cache (~180 MB),
# runs it with --no-llm (no API key, nothing sent to an LLM; dependency CVE lookups may query osv.dev).
# Prints a compact summary of HIGH findings. The verdict is advisory: review each HIGH finding by hand.
# Exit: 0 no HIGH findings, 1 HIGH findings or scan error, 3 prerequisites missing.
set -eu
VERSION=v2.13.4
COMMIT=54824463814a0be01360792523ec7245a69190fc
DIR="${XDG_CACHE_HOME:-$HOME/.cache}/appfactory/skillspector-$VERSION"
BIN="$DIR/.venv/bin/skillspector"
[ $# -ge 1 ] || { echo "usage: npm run scan-skill -- <path|url>"; exit 3; }

if ! [ -x "$BIN" ]; then
  command -v uv >/dev/null || { echo "scan-skill: needs uv (https://docs.astral.sh/uv/) and Python 3.12/3.13"; exit 3; }
  PY=$(command -v python3.13 || command -v python3.12 || true)
  [ -n "$PY" ] || { echo "scan-skill: needs Python 3.12 or 3.13"; exit 3; }
  rm -rf "$DIR"; mkdir -p "$(dirname "$DIR")"
  git -c advice.detachedHead=false clone -q --depth 1 --branch "$VERSION" https://github.com/NVIDIA/SkillSpector "$DIR"
  [ "$(git -C "$DIR" rev-parse HEAD)" = "$COMMIT" ] || { echo "scan-skill: tag $VERSION does not match pinned commit"; rm -rf "$DIR"; exit 1; }
  (cd "$DIR" && uv sync --frozen --no-dev --python "$PY" -q) || { echo "scan-skill: install failed"; exit 1; }
fi

OUT=$(mktemp); trap 'rm -f "$OUT"' EXIT
"$BIN" scan "$1" --no-llm --format json --output "$OUT" >/dev/null 2>&1 || true
[ -s "$OUT" ] || { echo "scan-skill: scan produced no report for $1"; exit 1; }
python3 -I - "$OUT" "$1" <<'EOF'
import json, sys, collections
d = json.load(open(sys.argv[1])); issues = d.get("issues", [])
risk = d.get("risk_assessment", {})
count = collections.Counter(i.get("severity") for i in issues)
print(f"SkillSpector {sys.argv[2]}: {risk.get('recommendation')} (score {risk.get('score')}) "
      + ", ".join(f"{k} {v}" for k, v in count.most_common()))
high = [i for i in issues if i.get("severity") in ("CRITICAL", "HIGH")]
for i in high[:40]:
    loc = (i.get("location") or {})
    snip = " ".join(str(i.get("code_snippet") or i.get("finding") or "").split())[:140]
    print(f"- {i.get('id')} {i.get('category')} {loc.get('file')}:{loc.get('start_line')} | {snip}")
if len(high) > 40: print(f"... {len(high) - 40} more HIGH findings")
sys.exit(1 if high or not d.get("execution_successful", True) else 0)
EOF
