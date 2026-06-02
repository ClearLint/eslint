"use strict";

/**
 * Known removed rules in ESLint v10.
 * Source: ESLint v10 migration guide
 */
const REMOVED_RULES = new Set([
  "callback-return",
  "global-require",
  "handle-callback-err",
  "id-blacklist",
  "indent-legacy",
  "lines-around-directive",
  "newline-after-var",
  "newline-before-return",
  "no-arrow-condition",
  "no-catch-shadow",
  "no-confusing-arrow",
  "no-div-regex",
  "no-empty-class",
  "no-empty-label",
  "no-empty-character-class",
  "no-floating-decimal",
  "no-global-assign",
  "no-inner-declarations",
  "no-invalid-regexp",
  "no-irregular-whitespace",
  "no-mixed-requires",
  "no-native-reassign",
  "no-negated-in-lhs",
  "no-negated-condition",
  "no-new-require",
  "no-path-concat",
  "no-process-exit",
  "no-process-env",
  "no-restricted-modules",
  "no-sync",
  "no-spaced-func",
  "no-unsafe-negation",
  "no-unsafe-optional-chaining",
  "no-useless-call",
  "no-void",
  "no-warning-comments",
  "prefer-reflect",
  "require-jsdoc",
  "valid-jsdoc",
  "no-duplicate-imports",
]);

const FLAT_CONFIG_REMOVED_RULES = new Set([
  "global-require",
  "no-mixed-requires",
  "no-new-require",
  "no-path-concat",
  "no-process-exit",
  "no-process-env",
  "no-sync",
  "callback-return",
  "handle-callback-err",
]);

/**
 * Known rule renames/mappings from eslintrc names to flat config scope.
 */
const RULE_RENAMES = {
  "no-extra-parens": "no-extra-parens",
};

/**
 * Analyze compatibility of an eslint config against v10.
 */
function analyzeCompatibility(discovery) {
  if (!discovery.found) {
    return { totalRules: 0, compatible: 0, removed: 0, needsReview: 0, unknown: 0, details: [], effort: "none" };
  }

  const rules = extractRules(discovery);
  const details = [];

  for (const [rule, config] of Object.entries(rules)) {
    const status = getRuleStatus(rule);
    let message;

    switch (status) {
      case "compatible":
        message = `Rule '${rule}' is available in v10. No changes needed.`;
        break;
      case "removed":
        message = `Rule '${rule}' was removed in v10. Find an alternative or remove it.`;
        break;
      case "needs-review":
        message = `Rule '${rule}' may need adjustment for v10 flat config format.`;
        break;
      default:
        message = `Rule '${rule}' not found in v10 rule set. Verify manually.`;
        break;
    }

    details.push({ rule, status, config, message });
  }

  const totalRules = details.length;
  const compatible = details.filter(d => d.status === "compatible").length;
  const removed = details.filter(d => d.status === "removed").length;
  const needsReview = details.filter(d => d.status === "needs-review").length;
  const unknown = details.filter(d => d.status === "unknown").length;

  let effort = "low";
  const impactScore = removed * 3 + needsReview * 1.5 + unknown * 2;
  if (impactScore > 20) effort = "high";
  else if (impactScore > 10) effort = "medium";

  return { totalRules, compatible, removed, needsReview, unknown, details, effort };
}

/**
 * Extract rules from discovery config.
 */
function extractRules(discovery) {
  const rules = {};

  if (discovery.type === "eslintrc") {
    if (discovery.filename.endsWith(".json") || discovery.filename === "package.json") {
      try {
        let config;
        if (discovery.filename === "package.json") {
          const pkg = JSON.parse(discovery.content);
          config = pkg.eslintConfig || {};
        } else {
          config = JSON.parse(discovery.content);
        }
        if (config.rules) {
          for (const [key, val] of Object.entries(config.rules)) {
            rules[key] = val;
          }
        }
      } catch {
        // fall back to regex parsing
      }
    }

    if (Object.keys(rules).length === 0) {
      const content = discovery.content || "";
      const ruleRegex = /['"]?([a-z0-9-]+(?:\/[a-z0-9-]+)*)['"]?\s*:/gi;
      let match;
      while ((match = ruleRegex.exec(content)) !== null) {
        const rule = match[1];
        if (rule === "rules" || rule === "extends" || rule === "plugins" || rule === "env" || rule === "parserOptions" || rule === "settings") continue;
        if (rule.length > 3 && rule.length < 80 && !rule.startsWith("//") && !rule.startsWith("/*")) {
          rules[rule] = null;
        }
      }
    }
  }

  return rules;
}

function getRuleStatus(rule) {
  if (REMOVED_RULES.has(rule)) return "removed";
  if (FLAT_CONFIG_REMOVED_RULES.has(rule)) return "removed";
  if (RULE_RENAMES[rule]) return "needs-review";
  return "compatible";
}

module.exports = { analyzeCompatibility };
