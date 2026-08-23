#!/usr/bin/env bash
# validate_contract.sh — Lint the OpenAPI contract with Spectral
#
# Usage:
#   bash scripts/validate_contract.sh
#
# Prerequisites:
#   npm install -g @stoplight/spectral-cli
#
# Exits with code 0 on success, non-zero on lint errors.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT="${SCRIPT_DIR}/../contracts/openapi.yaml"

echo "DeliverFlow — OpenAPI Contract Validation"
echo "========================================="
echo "Contract: ${CONTRACT}"
echo ""

if ! command -v spectral &> /dev/null; then
  echo "✗  Spectral not found. Install it:"
  echo "   npm install -g @stoplight/spectral-cli"
  exit 1
fi

spectral lint "${CONTRACT}" \
  --ruleset https://unpkg.com/@stoplight/spectral-owasp-ruleset/dist/ruleset.mjs \
  --format pretty

echo ""
echo "✓  Contract validation passed."
