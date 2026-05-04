#!/usr/bin/env bash
# Robofutures Yahoo Finance data updater
# Runs from cron, fetches fresh data, commits and pushes to trigger GitHub Pages rebuild
set -euo pipefail

cd /mnt/c/Users/Hendrik\ Steinort/robofutures_revert/Robofutures
/usr/bin/python3 scripts/update_data.py

# Only commit+push if data files actually changed
git add public/data/quotes.json public/data/history.json
if ! git diff --cached --quiet; then
  git config user.name "Robofutures Bot"
  git config user.email "bot@robofutures.dev"
  git commit -m "data: Yahoo Finance update $(date +%Y-%m-%d_%H:%M)"
  git push origin main 2>&1
  echo "✓ Pushed to main"
else
  echo "— No changes, skipping push"
fi
