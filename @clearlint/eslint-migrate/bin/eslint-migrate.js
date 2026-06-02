#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const { discoverConfig } = require("../lib/discover");
const { analyzeCompatibility } = require("../lib/analyze");
const { generateConfig } = require("../lib/generate");
const { generateReport } = require("../lib/report");

const command = process.argv[2];
const targetDir = process.argv[3] || process.cwd();

async function main() {
  const pkg = require("../package.json");

  if (!command || command === "--help" || command === "-h") {
    console.log(`
@clearlint/eslint-migrate v${pkg.version}
Analyze and migrate ESLint v9 configs to v10

Usage:
  eslint-migrate analyze [dir]   Analyze config compatibility
  eslint-migrate generate [dir]  Generate v10 flat config (deterministic)
  eslint-migrate report [dir]    Generate full migration report
  eslint-migrate --help          Show this help

Examples:
  eslint-migrate analyze ./src
  eslint-migrate generate ./my-project
  eslint-migrate report
`);
    process.exit(0);
  }

  const resolvedDir = path.resolve(targetDir);

  if (!fs.existsSync(resolvedDir)) {
    console.error(`Error: Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  switch (command) {
    case "analyze": {
      console.log(`\n🔍 Analyzing ESLint config in: ${resolvedDir}\n`);
      const discovery = discoverConfig(resolvedDir);
      if (!discovery.found) {
        console.log("  No ESLint configuration found.");
        process.exit(0);
      }
      console.log(`  Config type: ${discovery.type}`);
      console.log(`  Config file: ${discovery.path}\n`);

      const analysis = analyzeCompatibility(discovery);
      console.log(`  Rules analyzed: ${analysis.totalRules}`);
      console.log(`  Compatible:     ${analysis.compatible}`);
      console.log(`  Removed:        ${analysis.removed}`);
      console.log(`  Needs review:   ${analysis.needsReview}`);
      console.log(`  Unknown:        ${analysis.unknown}\n`);

      if (analysis.details.length > 0) {
        console.log("  Details:");
        for (const d of analysis.details) {
          const icon = d.status === "compatible" ? "✅" : d.status === "removed" ? "❌" : d.status === "needs-review" ? "⚠️" : "❓";
          console.log(`    ${icon} ${d.rule}: ${d.message}`);
        }
      }
      break;
    }

    case "generate": {
      console.log(`\n⚙️  Generating v10 flat config for: ${resolvedDir}\n`);
      const discovery = discoverConfig(resolvedDir);
      if (!discovery.found) {
        console.log("  No ESLint configuration found. Generating starter config...");
        const config = generateConfig(null);
        const outPath = path.join(resolvedDir, "eslint.config.js");
        fs.writeFileSync(outPath, config, "utf8");
        console.log(`  Created: ${outPath}`);
        process.exit(0);
      }

      const analysis = analyzeCompatibility(discovery);
      const config = generateConfig(analysis);
      const outPath = path.join(resolvedDir, "eslint.config.js");
      fs.writeFileSync(outPath, config, "utf8");
      console.log(`  Created: ${outPath}`);
      console.log(`  Rules preserved: ${analysis.compatible}/${analysis.totalRules}`);
      console.log(`  Rules needing manual review: ${analysis.needsReview}\n`);
      console.log("  Next steps:");
      console.log("    1. Review eslint.config.js for any rules with warnings");
      console.log("    2. Run: npx eslint . --config eslint.config.js");
      console.log("    3. Fix any remaining incompatibilities");
      break;
    }

    case "report": {
      console.log(`\n📋 Generating migration report for: ${resolvedDir}\n`);
      const discovery = discoverConfig(resolvedDir);
      if (!discovery.found) {
        console.log("  No ESLint configuration found.");
        process.exit(0);
      }

      const analysis = analyzeCompatibility(discovery);
      const report = generateReport(analysis);
      const outPath = path.join(resolvedDir, "eslint-migration-report.json");
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
      console.log(`  Report saved: ${outPath}\n`);
      console.log(`  Summary:`);
      console.log(`    Total rules:  ${report.summary.totalRules}`);
      console.log(`    Compatible:   ${report.summary.compatible}`);
      console.log(`    Removed:      ${report.summary.removed}`);
      console.log(`    Needs review: ${report.summary.needsReview}`);
      console.log(`    Unknown:      ${report.summary.unknown}`);
      console.log(`    Effort:       ${report.summary.effortEstimate}`);
      break;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      console.error("Run 'eslint-migrate --help' for usage.");
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
