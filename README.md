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

## Licensing

MigraDiff is **free and open source** under the MIT license.

**All features work for everyone.** No paywalls, no code restrictions, no gatekeeping.

### A Quick Story

I spent 8+ years as an engineer at Philips, supporting hospital IT systems that keep patients safe. When the VC who acquired our division let me go, I was 50+ years old in a market where age matters. Finding another job became nearly impossible. I still need to support my family and put food on the table.

That's why MigraDiff exists. I'm building tools that help you, because this is how I stay employed.

### Here's the Ask

**If you're a student, hobbyist, or open source project:** MIT license, free forever. No agreement needed.

**If you're a for-profit company using MigraDiff:** Please sign a Business License Agreement. This isn't about gatekeeping code—every feature stays free, you run it locally, nothing changes for you technically. It's about fairness: if my tool is helping you make money, help me feed my family.

You still own everything. You control your data. You access all features. We're just being transparent about how we sustain development.

I'm not asking for charity. I'm asking for fairness.

[Get a Business License](https://lateos.ai/license) | [View MIT License](LICENSE)

## License

MIT — Same as ESLint
