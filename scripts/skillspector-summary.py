"""Summarize a SkillSpector JSON report: show HIGH/CRITICAL findings in files an agent
executes or obeys (SKILL.md, commands, agents, hooks, scripts); hide docs, data and
coverage notes, which in practice were all false positives. Usage:
python3 -I scripts/skillspector-summary.py <report.json> <target> [--all]
Exit 0 = no shown HIGH findings, 1 = HIGH findings or incomplete scan."""
import collections
import json
import sys

NOISE_DIRS = ("reference/", "references/", "guides/", "data/", "docs/", "examples/", "tests/", "assets/")
NOISE_NAMES = ("readme", "changelog", "license", "notice", "contributing", "code_of_conduct", "security.md", ".gitignore")
NOISE_EXT = (".csv", ".txt", ".png", ".jpg", ".svg", ".webm")


def is_noise(issue):
    if issue.get("id") == "AE1":  # "referenced artifact not fully analysed" coverage note
        return True
    path = str((issue.get("location") or {}).get("file") or "").replace("\\", "/").lower()
    name = path.rsplit("/", 1)[-1]
    return (any(f"/{d}" in f"/{path}" for d in NOISE_DIRS) or name.startswith(NOISE_NAMES)
            or name.endswith(NOISE_EXT))


def main(report, target, show_all):
    d = json.load(open(report))
    issues = d.get("issues", [])
    risk = d.get("risk_assessment", {})
    count = collections.Counter(i.get("severity") for i in issues)
    high = [i for i in issues if i.get("severity") in ("CRITICAL", "HIGH")]
    shown = high if show_all else [i for i in high if not is_noise(i)]
    print(f"SkillSpector {target}: unfiltered verdict {risk.get('recommendation')} (score {risk.get('score')}) "
          + ", ".join(f"{k} {v}" for k, v in count.most_common()))
    hidden = len(high) - len(shown)
    if hidden:
        print(f"{hidden} HIGH in docs/data hidden (usually false positives; --all shows them)")
    for i in shown[:40]:
        loc = i.get("location") or {}
        snip = " ".join(str(i.get("code_snippet") or i.get("finding") or "").split())[:140]
        print(f"- {i.get('id')} {i.get('category')} {loc.get('file')}:{loc.get('start_line')} | {snip}")
    if len(shown) > 40:
        print(f"... {len(shown) - 40} more")
    if not d.get("execution_successful", True):
        print("scan incomplete")
    return 1 if shown or not d.get("execution_successful", True) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2], "--all" in sys.argv[3:]))
