"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require error boundaries or try-catch for async operations and Promise chains",
      recommended: true,
      url: "https://github.com/clearlint/eslint/tree/lts/v9/@clearlint/config-ai-guardrails/rules/require-error-boundary.md",
    },
    schema: [
      {
        type: "object",
        properties: {
          checkAsyncFunctions: {
            type: "boolean",
            default: true,
          },
          checkPromises: {
            type: "boolean",
            default: true,
          },
          allowCatchMethods: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingTryCatch: "Async function '{{name}}' should have a try-catch block or error handling.",
      missingCatch: "Promise chain should have a .catch() handler or be awaited in a try-catch block.",
      missingErrorBoundary: "Component '{{name}}' should have an error boundary (componentDidCatch or getDerivedStateFromError).",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const checkAsyncFunctions = options.checkAsyncFunctions !== false;
    const checkPromises = options.checkPromises !== false;
    const allowCatchMethods = options.allowCatchMethods !== false;

    const sourceCode = context.sourceCode;

    function hasTryCatch(node) {
      const body = node.body;
      if (!body || !body.body) return false;
      return body.body.some(stmt => stmt.type === "TryStatement");
    }

    function hasCatchInParent(node) {
      let current = node.parent;
      while (current) {
        if (current.type === "TryStatement" && current.handler) return true;
        if (current.type === "FunctionDeclaration" || current.type === "FunctionExpression" || current.type === "ArrowFunctionExpression") {
          if (current.async && hasTryCatch(current)) return true;
          break;
        }
        current = current.parent;
      }
      return false;
    }

    function isInComponentDidMount(node) {
      let current = node.parent;
      while (current) {
        if (current.type === "MethodDefinition" && current.key && current.key.name === "componentDidMount") return true;
        if (current.type === "MethodDefinition" && current.key && current.key.name === "componentDidUpdate") return true;
        if (current.type === "MethodDefinition" && current.key && (current.key.name === "componentWillUnmount" || current.key.name === "useEffect")) return false;
        if (current.type === "FunctionDeclaration" || current.type === "FunctionExpression") break;
        current = current.parent;
      }
      return false;
    }

    return {
      FunctionDeclaration(node) {
        if (!checkAsyncFunctions) return;
        if (!node.async) return;
        if (!hasTryCatch(node) && !isInComponentDidMount(node)) {
          context.report({
            node,
            messageId: "missingTryCatch",
            data: { name: node.id ? node.id.name : "<anonymous>" },
          });
        }
      },

      FunctionExpression(node) {
        if (!checkAsyncFunctions) return;
        if (!node.async) return;
        if (hasTryCatch(node)) return;
        if (isInComponentDidMount(node)) return;

        const parent = node.parent;
        if (parent.type === "VariableDeclarator" && parent.id && parent.id.type === "Identifier") {
          context.report({
            node,
            messageId: "missingTryCatch",
            data: { name: parent.id.name },
          });
        } else if (parent.type === "MethodDefinition" && parent.key) {
          context.report({
            node,
            messageId: "missingTryCatch",
            data: { name: parent.key.name || "<anonymous>" },
          });
        }
      },

      CallExpression(node) {
        if (!checkPromises) return;

        const callee = node.callee;
        if (callee.type === "MemberExpression" && callee.property.name === "then") {
          const parent = node.parent;
          const grandparent = parent ? parent.parent : null;

          if (parent.type === "MemberExpression" && parent.property.name === "catch") {
            if (allowCatchMethods) return;
          }

          if (parent.type === "AwaitExpression") return;
          if (hasCatchInParent(node)) return;

          let hasCatch = false;
          let current = node;
          while (current.parent && current.parent.type === "MemberExpression" && current.parent.object === current) {
            if (current.parent.property.name === "catch") {
              hasCatch = true;
              break;
            }
            current = current.parent;
          }

          const isTopLevelThen = !hasCatch;
          if (isTopLevelThen && !hasCatchInParent(node)) {
            context.report({ node, messageId: "missingCatch" });
          }
        }
      },

      MethodDefinition(node) {
        if (node.key.name !== "render" && node.key.name !== "componentDidMount") return;
        const hasErrorBoundary = node.parent.body.some(member => {
          if (!member.key) return false;
          return member.key.name === "componentDidCatch" || member.key.name === "getDerivedStateFromError";
        });
        if (!hasErrorBoundary) {
          const classNode = node.parent.parent;
          if (classNode && classNode.id) {
            context.report({
              node: node.parent,
              messageId: "missingErrorBoundary",
              data: { name: classNode.id.name },
            });
          }
        }
      },
    };
  },
};
