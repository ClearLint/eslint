# Why Migrating from ESLint v9 to v10 Is Harder Than You Think

ESLint v10 is coming, and if your project uses eslintrc format, the migration is more involved than a simple version bump.

## The big change: eslintrc is gone

ESLint v10 removes support for `.eslintrc`, `.eslintrc.json`, `.eslintrc.yaml`, `.eslintrc.js`, and `package.json` `eslintConfig`. The only supported format is flat config (`eslint.config.js`).

If you're using eslintrc today (and most projects still are), here's what you're facing:

## 1. Config structure is completely different

**Before (eslintrc):**
```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    "no-eval": "error",
    "complexity": ["warn", 10]
  },
  "env": { "browser": true, "node": true }
}
```

**After (flat config):**
```js
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  react.configs.recommended,
  {
    rules: {
      "no-eval": "error",
      "complexity": ["warn", 10],
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
```

The `env` block is gone. `extends` is gone. Plugins are imported as ES modules. It's not a mechanical 1:1 translation — you need to understand the new config model.

## 2. Removed rules will break your build

Several core rules were removed in v10. If you use any of these, your lint step will fail after upgrading:

- `callback-return` — Use callback pattern detection instead
- `global-require` — Now handled by import/no-dynamic-require
- `no-catch-shadow` — Caught by no-shadow in modern JS
- `handle-callback-err` — Use optional chaining or try-catch
- `no-mixed-requires` — Handled by import/order
- `no-sync` — Manually review sync I/O usage
- `no-process-exit` — Use process.on('exit') instead
- `no-process-env` — Consider structured config

**The problem:** Most teams don't know which of these rules they're using. The migration error message won't tell you what to replace them with — just that the rule doesn't exist.

## 3. Plugin compatibility is uncertain

Not all ESLint plugins have been updated for flat config. Before migrating, you need to verify that every plugin in your config supports:

- Flat config format (exporting a `configs` object)
- ES module imports (if your config uses ESM)
- v10 rule compatibility (some rules changed behavior)

Popular plugins like `eslint-plugin-react`, `eslint-plugin-import`, and `eslint-plugin-jsx-a11y` have added flat config support, but many community plugins haven't.

## 4. Shareable configs work differently

In eslintrc, you could extend a shareable config with a string:

```json
{ "extends": ["airbnb"] }
```

In flat config, shareable configs are JavaScript objects that you import and spread into your array:

```js
import airbnb from "eslint-config-airbnb";
export default [...airbnb, { /* overrides */ }];
```

Each shareable config may export a single config object, an array of configs, or a function. There's no consistent pattern yet.

## How to prepare for v10

### Step 1: Audit your current config

Run a compatibility analysis to understand which of your rules are affected:

```bash
npx @clearlint/eslint-migrate analyze
```

This scans your `.eslintrc` and reports:
- How many rules are compatible
- Which rules were removed in v10
- Which rules need manual review

### Step 2: Generate a starter flat config

```bash
npx @clearlint/eslint-migrate generate
```

This creates an `eslint.config.js` with your compatible rules preserved and removed rules flagged for review.

### Step 3: Plan your migration effort

The migration takes anywhere from a few hours (simple configs with only core rules) to several days (complex configs with many plugins and custom rules). Run the report command to get an effort estimate:

```bash
npx @clearlint/eslint-migrate report
```

## The timeline

- **Now**: Audit your config and understand the migration scope
- **Before Aug 6**: Test the migration on a branch
- **After Aug 6**: ESLint v9 stops receiving patches

If you're not ready to migrate by August, ClearLint provides continued security patches for ESLint v9. No config changes required.

## Summary

| Factor | Impact |
|--------|--------|
| eslintrc removal | Forces flat config conversion for all projects |
| Rule removals | ~20 rules removed; your config may break |
| Plugin updates | Verify each plugin supports flat config |
| Shareable configs | New import/spread model |
| Migration effort | Hours to days depending on config complexity |

The migration is doable, but it's not a "bump the version and go" change. Start planning now.

---

*The `@clearlint/eslint-migrate` CLI tool is free and open source. It helps you understand your migration scope before committing to the upgrade. Run `npx @clearlint/eslint-migrate --help` to get started.*
