"use strict";

const { RuleTester } = require("eslint");

const noHardcodedSecrets = require("../rules/no-hardcoded-secrets");
const noInsecureRandom = require("../rules/no-insecure-random");
const noOrphanedTodo = require("../rules/no-orphaned-todo");
const requireErrorBoundary = require("../rules/require-error-boundary");
const noExcessiveInlineComments = require("../rules/no-excessive-inline-comments");

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const { Linter } = require("eslint");

function testRuleWithLinter(name, rule, validCases, invalidCases) {
  console.log(`Testing ${name}...`);
  const linter = new Linter({ configType: "flat" });

  for (const item of validCases) {
    const code = typeof item === "string" ? item : item.code;
    const options = item.options || [];
    const result = linter.verify(code, {
      plugins: { test: { rules: { [name]: rule } } },
      rules: { [`test/${name}`]: ["error", ...options] },
      languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    });
    if (result.length > 0) {
      console.log(`  FAIL valid: ${code.substring(0, 60)} -> ${result[0].message}`);
      process.exit(1);
    }
  }

  for (const item of invalidCases) {
    const code = typeof item === "string" ? item : item.code;
    const options = item.options || [];
    const result = linter.verify(code, {
      plugins: { test: { rules: { [name]: rule } } },
      rules: { [`test/${name}`]: ["error", ...options] },
      languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    });
    if (result.length === 0) {
      console.log(`  FAIL invalid: ${code.substring(0, 60)} -> no errors`);
      process.exit(1);
    }
    console.log(`  OK invalid (${result.length} errors): ${code.substring(0, 60)}`);
  }

  console.log(`  PASS`);
}

testRuleWithLinter("no-hardcoded-secrets", noHardcodedSecrets, [
  "const apiKey = process.env.API_KEY;",
  "const url = 'https://example.com/api';",
  "const password = 'your_password_here';",
  "const secret = 'placeholder_value';",
  { code: "const x = 'hello-world';" },
], [
  { code: "const apiKey = 'sk-abc123def456ghi789jkl012mno345';" },
  { code: "const token = 'ghp_abc123def456ghi789jkl012mno345pqr678stu901';" },
  { code: "const AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';" },
]);

testRuleWithLinter("no-insecure-random", noInsecureRandom, [
  "const x = Math.floor(Math.random() * 100);",
  "const n = Math.random();",
], [
  { code: "function generateToken() { return Math.random().toString(36); }" },
  { code: "function createPassword() { return Math.random().toString(36); }" },
]);

testRuleWithLinter("no-orphaned-todo", noOrphanedTodo, [
  "// TODO(2026-12-01): fix this later\nconst x = 1;",
  "// FIXME(john): this is broken\nconst x = 1;",
  "// HACK: this should work (issue #42)\nconst x = 1;",
  "// normal comment\nconst x = 1;",
], [
  { code: "// TODO: fix this\nconst x = 1;" },
  { code: "// FIXME: this is broken\nconst x = 1;" },
]);

testRuleWithLinter("require-error-boundary", requireErrorBoundary, [
  "async function foo() { try { await bar(); } catch (e) {} }",
], [
  { code: "async function doFetch() { const data = await fetch('/api'); return data.json(); }" },
]);

testRuleWithLinter("no-excessive-inline-comments", noExcessiveInlineComments, [
  "const x = 1; // simple comment\nconst y = 2;\nconst z = 3;\nfoo();\nbar();",
], [
  { code: "// As an AI language model, I cannot access external resources\nconst x = 1;" },
  { code: "// I don't have access to real-time data\nconst x = 1;" },
]);

console.log("All guardrails rules tests passed!");
