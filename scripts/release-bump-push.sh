#!/usr/bin/env bash
# Bump patch, commit chore(release): vX.Y.Z e push origin main (repo hostlogic-site).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: hostlogic-site não é um repositório git." >&2
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [ "$BRANCH" != "main" ]; then
  echo "Aviso: branch atual é '$BRANCH' (esperado: main). Continuando mesmo assim." >&2
fi

npm run release:bump-patch
VERSION="$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")"

git add package.json package-lock.json
if git diff --cached --quiet; then
  echo "Nada a commitar após o bump."
  exit 0
fi

git commit -m "chore(release): v${VERSION}"
echo "Commit criado: chore(release): v${VERSION}"

git push origin HEAD
echo "Push concluído para origin ($(git branch --show-current))."
