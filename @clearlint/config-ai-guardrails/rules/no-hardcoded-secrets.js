"use strict";

const { findSecretsInLiteral, isSuspiciousVariableName } = require("../lib/secret-patterns");

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow hardcoded secrets, API keys, tokens, and credentials",
      recommended: true,
      url: "https://github.com/clearlint/eslint/tree/lts/v9/@clearlint/config-ai-guardrails/rules/no-hardcoded-secrets.md",
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
          placeholderPattern: {
            type: "string",
            default: "^(your_|example_|placeholder|test_)",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      secretFound: "Potential {{type}} hardcoded in source code. Move to environment variables or a secrets manager.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowList = (options.allow || []).map(s => s.toLowerCase());
    const placeholderRe = new RegExp(options.placeholderPattern || "^(your_|example_|placeholder|test_)", "i");

    function isAllowed(value) {
      if (!value || typeof value !== "string") return false;
      if (placeholderRe.test(value)) return true;
      return allowList.some(allowed => value.toLowerCase().includes(allowed));
    }

    function checkLiteral(node, value) {
      if (!value || typeof value !== "string") return;
      if (isAllowed(value)) return;

      const findings = findSecretsInLiteral(value);
      for (const finding of findings) {
        context.report({
          node,
          messageId: "secretFound",
          data: { type: finding.type },
        });
      }
    }

    function checkVariableDeclarator(node) {
      if (!node.id || !node.init) return;
      if (node.id.type !== "Identifier") return;
      if (!isSuspiciousVariableName(node.id.name)) return;

      if (node.init.type === "Literal") {
        checkLiteral(node.init, node.init.value);
      } else if (node.init.type === "TemplateLiteral") {
        const quasis = node.init.quasis;
        if (quasis.length === 1 && quasis[0].type === "TemplateElement") {
          checkLiteral(node.init, quasis[0].value.raw);
        }
      }
    }

    function checkAssignmentExpression(node) {
      if (node.left.type !== "MemberExpression" && node.left.type !== "Identifier") return;
      const name = node.left.type === "Identifier" ? node.left.name : node.left.property.name;
      if (!name || typeof name !== "string") return;
      if (!isSuspiciousVariableName(name)) return;

      if (node.right.type === "Literal") {
        checkLiteral(node.right, node.right.value);
      }
    }

    function checkProperty(node) {
      if (node.computed) return;
      const keyName = node.key.name || node.key.value;
      if (!keyName || !isSuspiciousVariableName(keyName)) return;

      if (node.value.type === "Literal") {
        checkLiteral(node.value, node.value.value);
      }
    }

    return {
      VariableDeclarator: checkVariableDeclarator,
      AssignmentExpression: checkAssignmentExpression,
      Property: checkProperty,
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression") return;
        const prop = node.callee.property;
        if (!prop || prop.name !== "setHeader" && prop.name !== "set") return;
        if (node.arguments.length < 2) return;
        const headerName = node.arguments[0];
        if (headerName.type !== "Literal") return;
        const headerValue = headerName.value;
        if (typeof headerValue !== "string") return;
        if (/authorization|auth|x-api-key|bearer/i.test(headerValue)) {
          const valueArg = node.arguments[1];
          if (valueArg && valueArg.type === "Literal") {
            checkLiteral(valueArg, valueArg.value);
          }
        }
      },
    };
  },
};
