"use strict";

const SECRET_PATTERNS = [
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi, type: "API Key" },
  { pattern: /(?:secret|token|password|passwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi, type: "Secret/Token" },
  { pattern: /(?:bearer|auth|access_token|refresh_token)\s*[:=]\s*['"][^'"]{8,}['"]/gi, type: "Auth Token" },
  { pattern: /ghp_[A-Za-z0-9_]{36,}/g, type: "GitHub Token" },
  { pattern: /gho_[A-Za-z0-9_]{36,}/g, type: "GitHub OAuth Token" },
  { pattern: /sk-[A-Za-z0-9_]{20,}/g, type: "OpenAI API Key" },
  { pattern: /AKIA[0-9A-Z]{16}/g, type: "AWS Access Key" },
  { pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, type: "Private Key" },
  { pattern: /xox[baprs]-[A-Za-z0-9\-]{24,}/g, type: "Slack Token" },
  { pattern: /SG\.[A-Za-z0-9_\-]{22,}\.[A-Za-z0-9_\-]{43,}/g, type: "SendGrid API Key" },
  { pattern: /pk_live_[A-Za-z0-9]{24,}/g, type: "Stripe Live Key" },
  { pattern: /sk_live_[A-Za-z0-9]{24,}/g, type: "Stripe Secret Key" },
];

const SUSPICIOUS_VARIABLE_NAMES = [
  /^secret/i,
  /^token/i,
  /^password/i,
  /^passwd/i,
  /^api[_-]?key/i,
  /^auth/i,
  /^credential/i,
  /^private[_-]?key/i,
  /^aws[_-]?/i,
  /^access[_-]?key/i,
  /^secret[_-]?key/i,
];

function findSecretsInLiteral(text) {
  const findings = [];
  for (const entry of SECRET_PATTERNS) {
    const regex = new RegExp(entry.pattern.source, entry.pattern.flags.includes("g") ? entry.pattern.flags : entry.pattern.flags + "g");
    const matches = text.matchAll(regex);
    for (const match of matches) {
      findings.push({ type: entry.type, match: match[0].substring(0, 12) + "..." });
    }
  }
  return findings;
}

function isSuspiciousVariableName(name) {
  return SUSPICIOUS_VARIABLE_NAMES.some(re => re.test(name));
}

module.exports = {
  SECRET_PATTERNS,
  SUSPICIOUS_VARIABLE_NAMES,
  findSecretsInLiteral,
  isSuspiciousVariableName,
};
