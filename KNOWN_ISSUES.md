# Known Issues

## TS Native Config Tests Require `--experimental-strip-types` on Node 24

**Issue:** 2 tests related to TypeScript native ESLint config loading fail on Node 24.

**Root Cause:** Node 24 sets `process.features.typescript` to `"strip"` even when `--experimental-strip-types` is not passed. Tests gate on this value but require the runtime flag to actually load `.ts` files.

**Status:** Gated with `process.execArgv.includes("--experimental-strip-types")` check. Tests only run when the flag is active.

**Impact:** Tests pass on Node 20 LTS and Node 22 (where `process.features.typescript` is `undefined` and tests are skipped). CI runs on Node 20 + 22 only, so CI is not affected. Only affects local development on Node 24.

**Affected tests:**
- `tests/lib/eslint/eslint.js` — "should load a TS config file when --experimental-strip-types is enabled" (2 occurrences)
