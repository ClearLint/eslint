"use strict";

const noHardcodedSecrets = require("./rules/no-hardcoded-secrets");
const noInsecureRandom = require("./rules/no-insecure-random");
const noOrphanedTodo = require("./rules/no-orphaned-todo");
const requireErrorBoundary = require("./rules/require-error-boundary");
const noExcessiveInlineComments = require("./rules/no-excessive-inline-comments");

const recommended = {
  name: "@clearlint/config-ai-guardrails/recommended",
  plugins: {
    "@clearlint/ai-guardrails": {
      rules: {
        "no-hardcoded-secrets": noHardcodedSecrets,
        "no-insecure-random": noInsecureRandom,
        "no-orphaned-todo": noOrphanedTodo,
        "require-error-boundary": requireErrorBoundary,
        "no-excessive-inline-comments": noExcessiveInlineComments,
      },
    },
  },
  rules: {
    "@clearlint/ai-guardrails/no-hardcoded-secrets": "error",
    "@clearlint/ai-guardrails/no-insecure-random": "error",
    "@clearlint/ai-guardrails/no-orphaned-todo": "warn",
    "@clearlint/ai-guardrails/require-error-boundary": "warn",
    "@clearlint/ai-guardrails/no-excessive-inline-comments": "warn",

    "max-lines-per-function": ["warn", 50],
    "complexity": ["warn", 10],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-param-reassign": "warn",
    "max-depth": ["warn", 4],
    "max-nested-callbacks": ["warn", 3],
    "no-throw-literal": "error",
    "no-promise-executor-return": "error",
    "no-async-promise-executor": "error",
    "no-constant-binary-expression": "error",
    "no-constructor-return": "error",
    "no-duplicate-imports": "error",
    "no-self-compare": "error",
    "no-template-curly-in-string": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-unsafe-optional-chaining": "error",
    "require-atomic-updates": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
  },
};

const all = {
  name: "@clearlint/config-ai-guardrails/all",
  plugins: {
    "@clearlint/ai-guardrails": {
      rules: {
        "no-hardcoded-secrets": noHardcodedSecrets,
        "no-insecure-random": noInsecureRandom,
        "no-orphaned-todo": noOrphanedTodo,
        "require-error-boundary": requireErrorBoundary,
        "no-excessive-inline-comments": noExcessiveInlineComments,
      },
    },
  },
  rules: Object.assign({}, recommended.rules, {
    "@clearlint/ai-guardrails/no-hardcoded-secrets": "error",
    "@clearlint/ai-guardrails/no-insecure-random": "error",
    "@clearlint/ai-guardrails/no-orphaned-todo": "error",
    "@clearlint/ai-guardrails/require-error-boundary": "error",
    "@clearlint/ai-guardrails/no-excessive-inline-comments": "error",

    "no-alert": "error",
    "no-console": "off",
    "no-debugger": "error",
    "no-empty": "error",
    "no-eq-null": "error",
    "no-extra-boolean-cast": "error",
    "no-implicit-coercion": "error",
    "no-undef": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-var": "error",
    "prefer-const": "error",
    "no-new-wrappers": "error",
    "no-proto": "error",
  }),
};

module.exports = {
  configs: {
    recommended,
    all,
  },
  rules: {
    "no-hardcoded-secrets": noHardcodedSecrets,
    "no-insecure-random": noInsecureRandom,
    "no-orphaned-todo": noOrphanedTodo,
    "require-error-boundary": requireErrorBoundary,
    "no-excessive-inline-comments": noExcessiveInlineComments,
  },
};
