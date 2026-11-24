#!/bin/sh
# One command for the full verification gate. Compact on success; failures print in full.
# Exit: 0 all passed, 1 a check failed, 2 unit tests passed but e2e was SKIPPED (not a pass).
out=$(node --test --test-reporter=dot tests/*.test.mjs 2>&1) || { echo "unit: FAIL"; echo "$out"; exit 1; }
echo "unit: pass"
out=$(node scripts/e2e.mjs 2>&1); code=$?
echo "e2e: $out" | tail -n 40
[ $code -eq 2 ] && { echo "e2e: SKIPPED — not verified in a browser"; exit 2; }
exit $code
