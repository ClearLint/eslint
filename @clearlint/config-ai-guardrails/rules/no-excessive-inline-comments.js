"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow excessive inline comments that suggest AI-generated code or redundant explanations",
      recommended: true,
      url: "https://github.com/clearlint/eslint/tree/lts/v9/@clearlint/config-ai-guardrails/rules/no-excessive-inline-comments.md",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxLineComments: {
            type: "integer",
            default: 3,
            minimum: 1,
          },
          maxCommentRatio: {
            type: "number",
            default: 0.3,
            minimum: 0,
            maximum: 1,
          },
          checkAIPatterns: {
            type: "boolean",
            default: true,
          },
          ignorePattern: {
            type: "string",
            default: "",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyLineComments: "File has too many line comments ({{actual}}). Maximum allowed is {{max}}.",
      tooHighCommentRatio: "Comment-to-code ratio is {{ratio}}%. Maximum allowed is {{maxRatio}}%.",
      aiGeneratedComment: "Comment appears to be AI-generated: '{{text}}'. Consider removing or rewriting.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const maxLineComments = options.maxLineComments || 3;
    const maxCommentRatio = options.maxCommentRatio || 0.3;
    const checkAIPatterns = options.checkAIPatterns !== false;
    const ignorePattern = options.ignorePattern ? new RegExp(options.ignorePattern, "u") : null;

    const AI_COMMENT_PATTERNS = [
      /\b(as an AI|I'm an AI|as a language model|as an LLM)\b/i,
      /\b(I don't have (access|the ability|personal|real-?time))\b/i,
      /\b(my (knowledge|training|cutoff|knowledge cutoff))\b/i,
      /\b(I cannot (access|browse|fetch|visit|surf))\b/i,
      /\b(I'm (here to|designed to|programmed to))\b/i,
      /\b(As an AI (assistant|language model|model))\b/i,
      /\b(Let me (know if|clarify|explain|expand))\b.{0,60}$/i,
    ];

    function isLineComment(comment) {
      return comment.type === "Line";
    }

    function isAIGenerated(text) {
      return AI_COMMENT_PATTERNS.some(pattern => pattern.test(text));
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        const lineComments = comments.filter(isLineComment);
        const totalLines = sourceCode.lines.length;
        const codeLines = sourceCode.lines.filter(line => line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("*")).length;

        if (lineComments.length > maxLineComments) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: "tooManyLineComments",
            data: { actual: lineComments.length, max: maxLineComments },
          });
        }

        if (codeLines > 0) {
          const totalCommentLines = comments.length;
          const ratio = totalCommentLines / (codeLines + totalCommentLines);
          if (ratio > maxCommentRatio) {
            context.report({
              loc: { line: 1, column: 0 },
              messageId: "tooHighCommentRatio",
              data: {
                ratio: Math.round(ratio * 100),
                maxRatio: Math.round(maxCommentRatio * 100),
              },
            });
          }
        }

        if (checkAIPatterns) {
          for (const comment of comments) {
            if (ignorePattern && ignorePattern.test(comment.value)) continue;
            if (isAIGenerated(comment.value)) {
              const text = comment.value.trim().substring(0, 60);
              context.report({
                node: comment,
                messageId: "aiGeneratedComment",
                data: { text },
              });
            }
          }
        }
      },
    };
  },
};
