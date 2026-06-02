# 5 Security Mistakes Every AI Coding Agent Makes (and How to Catch Them)

AI coding assistants write code fast — but they also write code with predictable, dangerous patterns. After reviewing thousands of AI-generated JavaScript files, here are the five most common security mistakes we see, and how to catch them automatically.

## 1. Hardcoded secrets in source

**What AI agents do:** When asked to generate API integration code, AI models often fabricate realistic-looking API keys or leave placeholder tokens directly in the code.

```js
// ❌ AI-generated
const apiKey = 'sk-abc123def456ghi789jkl012mno345';
const config = { token: 'ghp_abc123def456ghi789jkl012mno345' };
```

**Why it happens:** Language models are trained to produce complete, runnable examples. They don't know whether an API key is real or fake — and they optimize for "this looks correct" over "this is secure."

**The fix:** Enforce a lint rule that scans string literals for known secret patterns (API keys, tokens, private keys) and blocks suspicious variable name + value combinations.

```js
// ✅ Human-reviewed
const apiKey = process.env.API_KEY;
const config = { token: process.env.GH_TOKEN };
```

## 2. Insecure random for security operations

**What AI agents do:** AI models frequently use `Math.random()` for generating tokens, passwords, and initialization vectors — contexts where cryptographic randomness is required.

```js
// ❌ AI-generated
function generateToken() {
  return Math.random().toString(36).substring(2);
}
function resetPassword() {
  const tempPw = Math.random().toString(36).substring(2, 10);
}
```

**Why it happens:** `Math.random()` is the most common random function in JavaScript tutorials and training data. AI models default to it without understanding the security implications.

**The fix:** Flag `Math.random()` when it appears inside functions with security-related names (token, password, key, secret, etc.) and suggest `crypto.randomBytes()` instead.

```js
// ✅ Human-reviewed
import crypto from 'node:crypto';
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
```

## 3. Orphaned TODO comments

**What AI agents do:** AI models insert TODO and FIXME comments as placeholders during code generation, often without any ownership or tracking reference.

```js
// ❌ AI-generated
function processPayment(amount) {
  // TODO: add validation
  // FIXME: handle edge cases
  return { status: 'ok' };
}
```

**Why it happens:** AI training data contains TODO comments as examples of "code that needs work." The model reproduces this pattern without understanding that TODOs are tracking debt, not documentation.

**The fix:** Require all TODO/FIXME/HACK comments to include either a date reference or an owner/issue reference.

```js
// ✅ Human-reviewed
function processPayment(amount) {
  // TODO(2026-07-01): add validation (issue #142)
  // FIXME(jdoe): handle edge cases
  return { status: 'ok' };
}
```

## 4. Missing error boundaries in async code

**What AI agents do:** AI-generated code frequently creates async functions and Promise chains without proper error handling.

```js
// ❌ AI-generated
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
}

fetch('/api/config')
  .then(res => res.json())
  .then(config => applyConfig(config));
```

**Why it happens:** AI models are trained on clean, idealized examples that omit error handling for brevity. They produce code that works "in the happy path" but fails silently in production.

**The fix:** Require try-catch blocks for async functions and `.catch()` handlers for Promise chains.

```js
// ✅ Human-reviewed
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

## 5. AI boilerplate comments

**What AI agents do:** AI models insert verbose, explanatory comments that describe what the code does in plain English — a pattern that's useful for learning but noise in production code.

```js
// ❌ AI-generated
// As an AI language model, I cannot access external resources
// Let me know if you need any clarification on this implementation
```

**Why it happens:** AI assistants are trained to be helpful and explanatory. These patterns are embedded in their response format and leak into generated code.

**The fix:** Detect and flag comments containing common AI boilerplate phrases, and enforce a reasonable comment-to-code ratio.

## Catch all of these automatically

These five patterns are easy to miss in code review but trivial to catch with automated linting. The `@clearlint/config-ai-guardrails` package bundles all five checks into a single ESLint config.

```bash
npm install --save-dev @clearlint/config-ai-guardrails
```

```js
// eslint.config.js
import aiGuardrails from '@clearlint/config-ai-guardrails';
export default [
  aiGuardrails.configs.recommended,
];
```

It also enables 20+ curated ESLint core rules (no-eval, complexity, max-depth, etc.) for defense in depth.

**The goal isn't to eliminate AI-generated code — it's to catch the patterns AI agents consistently get wrong.**

---

*Disclaimer: This config helps detect common code quality and security issues. It does not guarantee security or compliance. Your team determines what constitutes acceptable code practices for your organization.*
