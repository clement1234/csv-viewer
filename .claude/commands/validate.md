# Validation de Phase

Exécute la validation complète du projet et rapporte les résultats.

## Étapes

1. Exécuter `yarn type-check` et capturer le résultat
2. Exécuter `yarn lint` et capturer le résultat
3. Exécuter `yarn test run` et capturer le résultat
4. Exécuter `yarn test:coverage` et capturer le rapport

## Rapport

Afficher un résumé :
- ✅ ou ❌ pour chaque commande
- Nombre de tests passés/échoués
- Coverage global (% lines)
- Si tout est vert : "Phase validée, prête pour la suivante"
- Si échec : lister les erreurs à corriger
