"use strict";

const path = require("path");
const fs = require("fs");

const CONFIG_FILES = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.yaml",
  ".eslintrc.yml",
  ".eslintrc.json",
  ".eslintrc",
];

const PACKAGE_JSON_CONFIG = "eslintConfig";

function tryReadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return { content, parsed: true };
  } catch {
    return null;
  }
}

function tryReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * Discover ESLint config in a directory.
 * Returns config type, path, content, and format detection.
 */
function discoverConfig(dir) {
  const resolvedDir = path.resolve(dir);

  for (const file of CONFIG_FILES) {
    const filePath = path.join(resolvedDir, file);
    if (fs.existsSync(filePath)) {
      const content = tryReadFile(filePath);
      const isFlat = file.startsWith("eslint.config.");
      const type = file.startsWith(".eslintrc") ? "eslintrc" : isFlat ? "flat" : "unknown";
      return {
        found: true,
        type,
        path: filePath,
        filename: file,
        content,
        dir: resolvedDir,
      };
    }
  }

  const pkgPath = path.join(resolvedDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg[PACKAGE_JSON_CONFIG]) {
        return {
          found: true,
          type: "eslintrc",
          path: pkgPath,
          filename: "package.json",
          content: JSON.stringify(pkg[PACKAGE_JSON_CONFIG], null, 2),
          dir: resolvedDir,
        };
      }
    } catch {
      // invalid JSON
    }
  }

  return { found: false, type: null, path: null, filename: null, content: null, dir: resolvedDir };
}

module.exports = { discoverConfig, CONFIG_FILES };
