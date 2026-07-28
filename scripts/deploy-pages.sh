#!/usr/bin/env bash
# Builds the static export and publishes it to the gh-pages branch.
#
# Used instead of a GitHub Actions workflow because the local gh OAuth token
# lacks the `workflow` scope (it cannot push .github/workflows/*). To switch to
# automated deploys on push, run `gh auth refresh -s workflow`, copy
# deploy/github-pages-workflow.yml to .github/workflows/deploy.yml, push it,
# and set the Pages source back to "GitHub Actions".
#
# Usage: npm run deploy:pages
set -euo pipefail

cd "$(dirname "$0")/.."
BRANCH=gh-pages
WORKTREE=".git/pages-worktree"

echo "▸ Building static export…"
GITHUB_PAGES=true npm run build

echo "▸ Preparing $BRANCH worktree…"
git worktree remove --force "$WORKTREE" 2>/dev/null || true
if git show-ref --quiet "refs/heads/$BRANCH"; then
  git worktree add -q "$WORKTREE" "$BRANCH"
else
  git worktree add -q --detach "$WORKTREE"
  git -C "$WORKTREE" checkout -q --orphan "$BRANCH"
  git -C "$WORKTREE" rm -rqf . 2>/dev/null || true
fi

echo "▸ Syncing out/ → $BRANCH…"
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R out/. "$WORKTREE"/
touch "$WORKTREE/.nojekyll"

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "▸ No changes to publish."
else
  git -C "$WORKTREE" commit -q -m "Publish static export from $(git rev-parse --short HEAD)"
  git -C "$WORKTREE" push -q origin "$BRANCH"
  echo "▸ Published."
fi

git worktree remove --force "$WORKTREE"
echo "✓ https://miketanzer.github.io/MatthewTanzer/"
