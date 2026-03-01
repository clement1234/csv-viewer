# Implémentation d'une Phase (TDD)

Implémente une phase du `execution-plan.md` en suivant le workflow TDD strict.

## Argument

Le numéro de phase à implémenter (ex: `0.3`, `1.1`, `4.2`).

## Workflow

1. **Lire** la section correspondante dans `execution-plan.md`
2. **Lire** `CLAUDE.md` pour les conventions
3. **Créer les fichiers de test** d'abord (RED)
   - Tous les cas listés dans le plan
   - Vérifier que les tests échouent (import errors = OK à ce stade)
4. **Implémenter** le code source (GREEN)
   - Code minimal pour faire passer les tests
   - Respecter les signatures exactes du plan
   - Respecter les conventions de nommage CLAUDE.md
5. **Refactorer** si nécessaire (REFACTOR)
6. **Valider** avec `yarn validate`
   - Si échec → corriger et re-valider
   - Si succès → phase terminée

## Règles

- Ne JAMAIS passer à l'implémentation sans avoir écrit les tests
- Ne JAMAIS passer à la phase suivante si `yarn validate` échoue
- Respecter le coverage minimum de 80%
- Pas de `any`, pas de `console.log`
- Commentaires POURQUOI uniquement
