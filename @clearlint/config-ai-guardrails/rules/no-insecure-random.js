"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow insecure random number generation (Math.random) for security-critical contexts",
      recommended: true,
      url: "https://github.com/clearlint/eslint/tree/lts/v9/@clearlint/config-ai-guardrails/rules/no-insecure-random.md",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedMathRandom: "Use crypto.randomBytes() or crypto.getRandomValues() instead of Math.random() for security-sensitive operations.",
      unexpectedMathRandomInInit: "Math.random() should not be used for initialization vectors, keys, or tokens. Use crypto.randomBytes() instead.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowFns = (options.allow || []).map(fn => fn.toLowerCase());
    const mode = options.mode || "security-context";

    function getEnclosingFunctionName(node) {
      let current = node;
      while (current) {
        current = current.parent;
        if (!current) return null;
        if (current.type === "FunctionDeclaration" && current.id) {
          return current.id.name;
        }
        if (current.type === "Property" && current.parent && current.parent.type === "ObjectExpression") {
          const key = current.key;
          if (key && (key.type === "Identifier" || key.type === "Literal")) {
            return key.name || key.value;
          }
        }
        if (current.type === "MethodDefinition" && current.key) {
          return current.key.name || current.key.value;
        }
        if (current.type === "ArrowFunctionExpression" || current.type === "FunctionExpression") {
          const parent = current.parent;
          if (parent && parent.type === "VariableDeclarator" && parent.id) {
            return parent.id.name;
          }
          if (parent && parent.type === "AssignmentExpression" && parent.left.type === "Identifier") {
            return parent.left.name;
          }
          return null;
        }
        if (current.type === "Program") return null;
      }
      return null;
    }

    function isSecuritySensitive(name) {
      if (!name) return false;
      const securityKeywords = [
        "password", "token", "key", "secret", "hash", "encrypt", "decrypt",
        "salt", "iv", "nonce", "auth", "signature", "hmac", "cipher",
        "uuid", "guid", "otp", "mfa", "2fa", "verification",
      ];
      return securityKeywords.some(kw => name.toLowerCase().includes(kw));
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (callee.object.type !== "Identifier" || callee.object.name !== "Math") return;
        if (callee.property.type !== "Identifier" || callee.property.name !== "random") return;

        const fnName = getEnclosingFunctionName(node);
        if (fnName && allowFns.includes(fnName.toLowerCase())) return;

        if (isSecuritySensitive(fnName)) {
          context.report({
            node,
            messageId: "unexpectedMathRandomInInit",
          });
        } else if (mode === "all") {
          context.report({
            node,
            messageId: "unexpectedMathRandom",
          });
        }
      },
    };
  },
};
