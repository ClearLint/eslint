# ClearLint

> Security-patched ESLint v9 with audit-assisting reports.

**ClearLint** is a maintained fork of ESLint v9 that provides security patches after ESLint's August 6, 2026 end-of-life.

## Features

- ✅ **Drop-in replacement** for ESLint v9 — install and use exactly like the original
- ✅ **Security patches** — backported fixes for vulnerabilities after v9 EOL
- ✅ **AI guardrails config** — catch common mistakes in AI-generated code
- ✅ **Migration assistance** — free CLI tool to understand your v10 migration cost
- ✅ **Audit-assisting reports** — structured JSON mapping code scans to security frameworks

## Install

```bash
npm install @clearlint/eslint --legacy-peer-deps
npm install --save-dev @clearlint/config-ai-guardrails
npm install --save-dev @clearlint/eslint-migrate
```

## Usage

```bash
npx eslint .
npx eslint-migrate analyze
```

## Companion Tools

ClearLint integrates with two specialized tools to enhance your v9 maintenance:

### 1. AI Guardrails Config (`@clearlint/config-ai-guardrails`)

A curated ESLint config that catches security mistakes in AI-generated code.

**Install:**
```bash
npm install --save-dev @clearlint/config-ai-guardrails
```

**Use in `.eslintrc.js`:**
```js
module.exports = {
  extends: ['@clearlint/config-ai-guardrails']
};
```

**What it catches:**
- Hardcoded API keys, tokens, and secrets
- Insecure random number generation
- Missing error boundaries (React)
- Excessive inline comments (sign of generated code)
- Orphaned TODO comments

**Why:** AI agents often generate code with security blind spots. This config catches them before code review.

### 2. Migration CLI (`@clearlint/eslint-migrate`)

A free tool that analyzes your ESLint v9 config and estimates the cost of migrating to v10.

**Install:**
```bash
npm install --save-dev @clearlint/eslint-migrate
```

**Run:**
```bash
npx eslint-migrate analyze
```

**Output:**
- List of ESLint rules removed in v10
- List of plugins that need updating
- Estimated migration effort (hours)
- Generated v10 flat config (optional)

**Why:** ESLint v10 removes eslintrc entirely. This tool tells you exactly what will break before you migrate, so you can decide: migrate now, stay on v9 (ClearLint), or upgrade later.

---

## Quick Start

1. **Use ClearLint as drop-in replacement:**
```bash
   npm install @clearlint/eslint --legacy-peer-deps
   npx eslint .
```

2. **Add AI guardrails (recommended):**
```bash
   npm install --save-dev @clearlint/config-ai-guardrails
   # Update .eslintrc.js: extends: ['@clearlint/config-ai-guardrails']
```

3. **Plan your v10 migration:**
```bash
   npm install --save-dev @clearlint/eslint-migrate
   npx eslint-migrate analyze
```

---

## Pricing

- **Community**: Free (patches + best-effort support)
- **Team**: $400/mo (email support, SLA)
- **Business**: $1K/mo (priority CVEs, compliance evidence)

Learn more at https://clearlint.org

## About

ClearLint is an independent fork of ESLint v9.x. Not affiliated with or endorsed by ESLint or OpenJS Foundation.

## License

MIT — Same as ESLint
