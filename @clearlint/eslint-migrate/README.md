# @clearlint/eslint-migrate

**Analyze and migrate ESLint v9 configs to v10.** Understand your migration cost before you commit.

## The Problem

ESLint v10 removes eslintrc format entirely. If your project uses `.eslintrc`, `.eslintrc.json`, or `package.json` `eslintConfig`, you need to:
1. Convert to flat config (`eslint.config.js`)
2. Handle removed rules
3. Adjust rule options that changed

This tool analyzes your current config and generates a v10-compatible flat config.

## Usage

```bash
npx @clearlint/eslint-migrate analyze [dir]
npx @clearlint/eslint-migrate generate [dir]
npx @clearlint/eslint-migrate report [dir]
```

### analyze — Understand your migration cost

```bash
npx @clearlint/eslint-migrate analyze ./my-project
```

Output:
```
🔍 Analyzing ESLint config in: ./my-project

  Config type: eslintrc
  Config file: .eslintrc.json

  Rules analyzed: 42
  Compatible:     38
  Removed:        3
  Needs review:   1
  Unknown:        0

  Details:
    ✅ no-eval: compatible
    ❌ callback-return: removed in v10
    ⚠️  custom-rule: needs review
```

### generate — Create a v10 flat config

```bash
npx @clearlint/eslint-migrate generate ./my-project
```

Creates `eslint.config.js` with:
- All compatible rules preserved
- Removed rules removed (commented out with migration notes)
- Unknown rules flagged for manual review

### report — Full migration report

```bash
npx @clearlint/eslint-migrate report ./my-project
```

Generates `eslint-migration-report.json` with:
- Rule-by-rule compatibility analysis
- Effort estimate (low / medium / high)
- Step-by-step recommendations

## Install

```bash
npm install --save-dev @clearlint/eslint-migrate
```

## How it works

1. **Discover** — Finds your ESLint config (eslintrc, flat, or package.json)
2. **Analyze** — Checks each rule against the v10 rule set
3. **Generate** — Creates a flat config with migration notes
4. **Report** — Produces a structured JSON report

## Migration Phases

| Phase | Description | Command |
|-------|-------------|---------|
| 1 | Config discovery | `eslint-migrate analyze` |
| 2 | Rule compatibility | (included in analyze) |
| 3 | Config generation | `eslint-migrate generate` |
| 4 | Report + effort estimate | `eslint-migrate report` |

## Caveats

- The generated config is a starting point, not a drop-in replacement
- Custom plugin rules and shareable configs are not analyzed
- Always run `npx eslint .` after migration to verify
- ESLint v10 removes approximately 15 core rules — the tool flags these

---

**Disclaimer:** This tool assists with ESLint v10 migration planning. Always verify the generated config against your project's requirements. Rule behavior may differ between v9 and v10 even for compatible rules.
