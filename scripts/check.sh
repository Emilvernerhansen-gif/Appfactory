#!/bin/sh
# One command for the full verification gate. Compact on success; failures print in full.
# Exit: 0 all passed, 1 a check failed, 2 unit tests passed but e2e was SKIPPED (not a pass).
out=$(node --test --test-reporter=dot tests/*.test.mjs 2>&1) || { echo "unit: FAIL"; echo "$out"; exit 1; }
echo "unit: pass"
out=$(node scripts/e2e.mjs 2>&1); code=$?
echo "e2e: $out" | tail -n 40
[ $code -eq 2 ] && { echo "e2e: SKIPPED — not verified in a browser"; exit 2; }
[ $code -ne 0 ] && exit $code
for t in apps/*/e2e.mjs; do
  [ -f "$t" ] || continue
  out=$(node "$t" 2>&1); c=$?; echo "$(dirname "$t" | cut -d/ -f2): $out" | tail -n 40
  [ $c -eq 2 ] && { echo "SKIPPED — not verified in a browser"; exit 2; }
  [ $c -ne 0 ] && exit $c
done
exit 0
