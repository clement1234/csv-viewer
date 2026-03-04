#!/bin/bash
# Automatisation complète du rebase

set +e  # Ne pas arrêter sur erreur

MAX_ITERATIONS=50
iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
  iteration=$((iteration + 1))
  echo "=== Itération $iteration/$MAX_ITERATIONS ==="

  # Vérifier si le rebase est terminé
  if [ ! -d ".git/rebase-merge" ]; then
    echo "✅ Rebase terminé !"
    exit 0
  fi

  # Résoudre les conflits
  echo "Résolution des conflits..."

  # Supprimer les fichiers node_modules en conflit
  git status --short | grep '^UD\|^DU\|^DD\|^AA\|^UU' | grep 'node_modules/' | awk '{print $NF}' | xargs -r git rm -f 2>/dev/null || true

  # Résoudre settings.local.json en gardant notre version
  if git status --short | grep -q '.claude/settings.local.json'; then
    git checkout --ours .claude/settings.local.json 2>/dev/null || true
    git add .claude/settings.local.json 2>/dev/null || true
  fi

  # Ajouter tous les autres changements
  git add -A 2>/dev/null || true

  # Continuer le rebase
  echo "Continuation du rebase..."
  GIT_EDITOR=true git rebase --continue 2>&1 | tee /tmp/rebase-iteration-$iteration.log

  status=$?

  # Si le rebase est terminé avec succès
  if [ $status -eq 0 ] && [ ! -d ".git/rebase-merge" ]; then
    echo "✅ Rebase réussi !"
    exit 0
  fi

  # Pause courte avant la prochaine itération
  sleep 0.5
done

echo "❌ Nombre maximum d'itérations atteint"
exit 1
