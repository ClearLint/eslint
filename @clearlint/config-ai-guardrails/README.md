# @clearlint/config-ai-guardrails

**AI-safe linting config** — Catches common mistakes AI coding agents make in generated JavaScript/TypeScript code.

## The Problem

AI coding assistants are incredibly productive — but they produce code with distinctive failure patterns:

- **Hardcoded secrets**: API keys, tokens, and passwords embedded directly in source
- **Insecure randomness**: `Math.random()` for tokens, keys, or initialization vectors
- **Orphaned TODOs**: Unresolved placeholder comments from AI templates
- **Missing error handling**: Async operations without try-catch or Promise chains without `.catch()`
- **AI boilerplate noise**: Excessive inline comments that explain obvious code

This config detects all of these automatically.

## Usage

```bash
npm install --save-dev @clearlint/config-ai-guardrails
```

### Flat config (eslint.config.js)

```js
import aiGuardrails from "@clearlint/config-ai-guardrails";

export default [
  aiGuardrails.configs.recommended,
  // your other configs...
];
```

### eslintrc

```json
{
  "extends": ["plugin:@clearlint/ai-guardrails/recommended"],
  "plugins": ["@clearlint/ai-guardrails"]
}
```

## Rules

### Custom Rules

| Rule | Description | Default Severity |
|------|-------------|-----------------|
| `no-hardcoded-secrets` | Detects API keys, tokens, passwords, and credentials hardcoded in source | error |
| `no-insecure-random` | Flags `Math.random()` in security-sensitive contexts (tokens, passwords, keys) | error |
| `no-orphaned-todo` | Requires TODO/FIXME/HACK comments to include a date or owner reference | warn |
| `require-error-boundary` | Requires try-catch for async functions and .catch() for Promise chains | warn |
| `no-excessive-inline-comments` | Flags AI-generated comment patterns and excessive comment-to-code ratio | warn |

### Curated Core Rules

The config also enables these ESLint core rules at recommended levels:

- `max-lines-per-function` (50 lines)
- `complexity` (max 10)
- `no-eval`, `no-implied-eval`, `no-new-func`
- `no-param-reassign`
- `max-depth`, `max-nested-callbacks`
- `no-throw-literal`
- `no-promise-executor-return`, `no-async-promise-executor`
- `no-constant-binary-expression`, `no-constructor-return`
- `no-duplicate-imports`, `no-self-compare`
- `no-template-curly-in-string`, `no-unmodified-loop-condition`
- `no-unreachable-loop`, `no-unsafe-optional-chaining`
- `require-atomic-updates`, `use-isnan`, `valid-typeof`

## Before / After Examples

### ❌ Before (AI-generated)

```js
// Generate a random API key for the user
const apiKey = Math.random().toString(36).substring(2, 15);
// TODO: integrate with email service
```

### ✅ After (human-reviewed)

```js
import crypto from "node:crypto";

const apiKey = crypto.randomBytes(32).toString("hex");
// TODO(2026-07-01): integrate with email service (issue #42)
```

## Using with eslint-plugin-security

For additional security scanning, install the optional dependency:

```bash
npm install --save-dev eslint-plugin-security
```

Then add it to your config:

```js
import security from "eslint-plugin-security";

export default [
  aiGuardrails.configs.recommended,
  security.configs.recommended,
];
```

---

**Disclaimer:** This config helps detect common code quality and security issues. It does not guarantee security or compliance. Your team and security reviewers determine what constitutes acceptable code practices for your organization.
