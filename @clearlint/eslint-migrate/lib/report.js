"use strict";

/**
 * Generate a structured migration report.
 */
function generateReport(analysis) {
  const effortLabels = {
    low: "Low (hours)",
    medium: "Medium (1-2 days)",
    high: "High (3+ days)",
  };

  const compatPct = analysis.totalRules > 0
    ? Math.round((analysis.compatible / analysis.totalRules) * 100)
    : 0;

  const removedRules = analysis.details.filter(d => d.status === "removed");
  const reviewRules = analysis.details.filter(d => d.status === "needs-review" || d.status === "unknown");

  return {
    toolName: "@clearlint/eslint-migrate",
    toolVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    summary: {
      totalRules: analysis.totalRules,
      compatible: analysis.compatible,
      removed: analysis.removed,
      needsReview: analysis.needsReview,
      unknown: analysis.unknown,
      compatibilityPercentage: compatPct,
      effortEstimate: effortLabels[analysis.effort] || "Unknown",
    },
    details: {
      compatible: {
        count: analysis.compatible,
        rules: analysis.details
          .filter(d => d.status === "compatible")
          .map(d => ({ rule: d.rule })),
      },
      removed: {
        count: analysis.removed,
        rules: removedRules.map(d => ({
          rule: d.rule,
          message: d.message,
          action: "Remove or replace with v10 equivalent",
        })),
      },
      needsReview: {
        count: reviewRules.length,
        rules: reviewRules.map(d => ({
          rule: d.rule,
          message: d.message,
          action: "Verify manually in v10 documentation",
        })),
      },
    },
    recommendations: buildRecommendations(analysis),
  };
}

function buildRecommendations(analysis) {
  const recs = [];

  if (analysis.removed > 0) {
    recs.push({
      priority: "high",
      action: `Replace ${analysis.removed} removed rule(s) with v10 alternatives`,
      details: "These rules no longer exist in ESLint v10. Check the v10 migration guide for recommended alternatives.",
    });
  }

  if (analysis.needsReview > 0 || analysis.unknown > 0) {
    recs.push({
      priority: "medium",
      action: `Review ${analysis.needsReview + analysis.unknown} rule(s) for v10 compatibility`,
      details: "These rules may have different behavior or options in v10. Verify against the v10 documentation.",
    });
  }

  if (analysis.type === "eslintrc") {
    recs.push({
      priority: "required",
      action: "Migrate from eslintrc to flat config",
      details: "ESLint v10 only supports flat config (eslint.config.js). Your current .eslintrc format must be converted.",
    });
  }

  recs.push({
    priority: "info",
    action: "Run your test suite after migration",
    details: "After applying the migration, run 'npx eslint .' and fix any new errors or warnings.",
  });

  return recs;
}

module.exports = { generateReport };
