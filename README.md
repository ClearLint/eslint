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

## Pricing

- **Community**: Free (patches + best-effort support)
- **Team**: $400/mo (email support, SLA)
- **Business**: $1K/mo (priority CVEs, compliance evidence)

Learn more at https://clearlint.org

## About

ClearLint is an independent fork of ESLint v9.x. Not affiliated with or endorsed by ESLint or OpenJS Foundation.

## License

MIT — Same as ESLint
