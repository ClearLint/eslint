"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Flag TODO/FIXME/HACK comments that have been in the codebase too long",
      recommended: true,
      url: "https://github.com/clearlint/eslint/tree/lts/v9/@clearlint/config-ai-guardrails/rules/no-orphaned-todo.md",
    },
    schema: [
      {
        type: "object",
        properties: {
          terms: {
            type: "array",
            items: { type: "string" },
            default: ["TODO", "FIXME", "HACK", "XXX"],
          },
          allowSinceDays: {
            type: "integer",
            default: 30,
            minimum: 0,
          },
          allowInTests: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      orphanedTodo: "Orphaned {{term}} comment found. This appears to be unresolved after {{days}} days. Either resolve it or add a date reference (e.g., 'TODO(yyyy-mm-dd):').",
      todoWithoutOwner: "{{term}} comment should include an owner or issue reference. Use format: '{{term}}(username|issue#): description'",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const terms = options.terms || ["TODO", "FIXME", "HACK", "XXX"];
    const allowSinceDays = options.allowSinceDays !== undefined ? options.allowSinceDays : 30;
    const allowInTests = options.allowInTests !== undefined ? options.allowInTests : true;

    const termPattern = new RegExp(`\\b(${terms.join("|")})\\b`, "i");
    const datedPattern = /\b\d{4}[-/]\d{2}[-/]\d{2}\b/;
    const ownerPattern = /^\s*\w+\s*\(.+?\)\s*:/;
    const issuePattern = /\(#?\d+\)|issue\s+#?\d+|github\.com\/\S+\#\d+/i;
    const testFilePattern = /\.(test|spec|cy)\./;

    function isTestFile(filename) {
      return testFilePattern.test(filename || "");
    }

    function checkComment(comment) {
      const value = comment.value;
      const termMatch = value.match(termPattern);
      if (!termMatch) return;

      const term = termMatch[1].toUpperCase();

      if (allowInTests && isTestFile(context.filename || context.getFilename())) return;

      if (datedPattern.test(value)) return;
      if (ownerPattern.test(value.trim())) return;
      if (issuePattern.test(value)) return;

      if (value.includes("eslint") || value.includes("eslint-disable") || value.includes("global")) return;

      context.report({
        node: comment,
        messageId: "todoWithoutOwner",
        data: { term },
      });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        comments.forEach(checkComment);
      },
    };
  },
};
