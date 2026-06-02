"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");

const { discoverConfig } = require("../lib/discover");
const { analyzeCompatibility } = require("../lib/analyze");
const { generateConfig } = require("../lib/generate");
const { generateReport } = require("../lib/report");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

// ---- Test discover ----

(function testDiscover() {
  console.log("\nTesting discover.js...");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "eslint-migrate-test-"));
  const pkgPath = path.join(tmpDir, "package.json");
  fs.writeFileSync(pkgPath, JSON.stringify({ eslintConfig: { rules: { "no-eval": "error" } } }, null, 2));

  const result = discoverConfig(tmpDir);
  assert(result.found === true, "Discovers package.json eslintConfig");
  assert(result.type === "eslintrc", "Identifies as eslintrc type");

  const rcPath = path.join(tmpDir, ".eslintrc.json");
  fs.writeFileSync(rcPath, JSON.stringify({ rules: { "no-console": "off" } }, null, 2));

  const result2 = discoverConfig(tmpDir);
  assert(result2.filename === ".eslintrc.json", "Prefers .eslintrc.json over package.json");

  const noConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), "eslint-migrate-no-config-"));
  const result3 = discoverConfig(noConfigDir);
  assert(result3.found === false, "Returns not found when no config");

  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.rmSync(noConfigDir, { recursive: true, force: true });
})();

// ---- Test analyze ----

(function testAnalyze() {
  console.log("\nTesting analyze.js...");

  const discovery = {
    found: true,
    type: "eslintrc",
    path: "/fake/.eslintrc.json",
    filename: ".eslintrc.json",
    content: JSON.stringify({ rules: { "no-eval": "error", "no-catch-shadow": "error", "callback-return": "error" } }),
    dir: "/fake",
  };

  const result = analyzeCompatibility(discovery);
  assert(result.totalRules > 0, "Extracts rules from config");
  assert(result.removed > 0, "Detects removed rules (no-catch-shadow, callback-return)");
  assert(result.compatible > 0, "Detects compatible rules (no-eval)");

  const noConfig = { found: false, type: null, path: null, filename: null, content: null, dir: "/fake" };
  const result2 = analyzeCompatibility(noConfig);
  assert(result2.totalRules === 0, "Returns empty analysis when no config found");
})();

// ---- Test generate ----

(function testGenerate() {
  console.log("\nTesting generate.js...");

  const analysis = {
    totalRules: 3,
    compatible: 1,
    removed: 1,
    needsReview: 0,
    unknown: 1,
    effort: "low",
    details: [
      { rule: "no-eval", status: "compatible", config: "error" },
      { rule: "callback-return", status: "removed", config: "error" },
      { rule: "custom-rule", status: "unknown", config: "warn" },
    ],
  };

  const config = generateConfig(analysis);
  assert(config.includes("no-eval"), "Includes compatible rules");
  assert(config.includes("callback-return") === false, "Excludes removed rules (but may include as comment)");
  assert(config.includes("REVIEW"), "Includes review markers for unknown rules");

  const starterConfig = generateConfig(null);
  assert(starterConfig.includes("eslint.config.js") === false, "Starter config has no migration header");
  assert(starterConfig.includes("@eslint/js"), "Starter config imports @eslint/js");
})();

// ---- Test report ----

(function testReport() {
  console.log("\nTesting report.js...");

  const analysis = {
    totalRules: 3,
    compatible: 1,
    removed: 1,
    needsReview: 0,
    unknown: 1,
    effort: "medium",
    details: [
      { rule: "no-eval", status: "compatible", config: "error" },
      { rule: "callback-return", status: "removed", config: "error", message: "Was removed in v10" },
      { rule: "custom-rule", status: "unknown", config: "warn", message: "Not found in v10" },
    ],
  };

  const report = generateReport(analysis);
  assert(report.summary.totalRules === 3, "Report includes total rules");
  assert(report.summary.effortEstimate !== undefined, "Report includes effort estimate");
  assert(report.recommendations.length > 0, "Report includes recommendations");
  assert(report.details.removed.count === 1, "Report lists removed rules");
})();

// ---- Summary ----

console.log(`\n${"=".repeat(40)}`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
