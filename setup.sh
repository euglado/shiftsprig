#!/usr/bin/env bash
set -eu
cd -- "$(dirname -- "$0")"
npm ci --ignore-scripts
npm run build
node scripts/setup.mjs
