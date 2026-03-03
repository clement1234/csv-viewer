#!/bin/bash
# Résolution automatique des conflits node_modules

# Supprimer tous les fichiers node_modules en conflit
git status --short | grep '^UD\|^DU\|^DD\|^AA\|^UU' | grep 'node_modules/' | awk '{print $NF}' | xargs -r git rm -f 2>/dev/null || true

# Résoudre le conflit settings.local.json en gardant notre version (HEAD)
if git status --short | grep -q '.claude/settings.local.json'; then
  git checkout --ours .claude/settings.local.json
  git add .claude/settings.local.json
fi

# Ajouter tous les autres changements
git add -A

echo "✅ Conflits résolus"
