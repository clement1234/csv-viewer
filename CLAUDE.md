# CSV/Excel Viewer - Contexte Projet

## Stack Technique

| Outil | Version | Notes |
|---|---|---|
| React | 19.x | |
| TypeScript | 5.9.x | strict mode |
| Vite | 7.x | |
| Tailwind CSS | 4.x | Via `@tailwindcss/vite`, config en CSS uniquement |
| ESLint | 10.x | Flat config (`eslint.config.js`) |
| Vitest | 4.x | + jsdom |
| Testing Library | 16.x | @testing-library/react + jest-dom + user-event |
| papaparse | 5.x | Parsing CSV |
| xlsx | 0.20.3 | **Installer depuis CDN SheetJS, PAS npm** |

**Aucune autre librairie autorisée sans accord explicite.**

## Dépendances (liste exhaustive)

**Production:** `papaparse`, `xlsx` (CDN)
**Dev:** `@types/papaparse`, `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `tailwindcss`, `@tailwindcss/vite`

**PAS de:** zod, lucide-react, prettier, gh-pages, @vitest/ui, eslint-plugin-prettier

## Commandes

```bash
yarn dev           # Serveur dev
yarn build         # Build production (tsc + vite build)
yarn test run      # Tous les tests une fois
yarn test          # Tests en watch mode
yarn test:coverage # Tests + rapport coverage
yarn lint          # ESLint (0 erreurs, 0 warnings)
yarn lint:fix      # ESLint avec auto-fix
yarn type-check    # tsc --noEmit (0 erreurs)
yarn validate      # type-check + lint + test run (doit passer à chaque fin de phase)
```

## Conventions de Nommage (Clean Code)

### Fonctions
- Verbes explicites décrivant l'action
- ✅ `parseCSVFileToNormalizedRows`, `detectColumnTypeFromValues`, `applyFiltersToDataRows`
- ❌ `parse`, `getData`, `process`
- Max 50 lignes, une seule responsabilité

### Variables
- Descriptives et contextuelles
- ✅ `filteredRowsForCurrentPage`, `inferredColumnSchema`, `visibleColumnNames`
- ❌ `data`, `rows`, `d`, `temp`

### Commentaires
- Expliquer le **POURQUOI**, jamais le quoi
- ✅ `// Set pour garantir l'unicité des valeurs détectées lors de l'inférence`
- ❌ `// Créer un Set`

### Fichiers
- kebab-case pour les fichiers: `csv-parser.ts`, `date-utils.ts`
- PascalCase pour les composants React: `DataTable.tsx`, `FiltersPanel.tsx`
- Tests dans `__tests__/` à côté du fichier: `csv-parser.ts` → `__tests__/csv-parser.test.ts`

## Workflow TDD

Chaque phase suit ce cycle :

1. **RED** - Écrire les tests d'abord. Ils doivent échouer.
2. **GREEN** - Implémenter le code minimal pour que les tests passent.
3. **REFACTOR** - Nettoyer le code sans changer le comportement.
4. **VALIDATE** - Exécuter `yarn validate` (doit réussir à 100%).

**Une phase n'est PAS terminée tant que `yarn validate` échoue.**

## Critères de Qualité

- `@typescript-eslint/no-explicit-any`: **error** (jamais de `any`)
- `no-console`: **warn** (sauf `console.error`)
- Coverage minimum: **80%** par phase
- 0 erreurs TypeScript, 0 warnings ESLint
- Pas de TODO/placeholder dans le code livré

## Icônes

Pas de librairie d'icônes. Utiliser des SVG inline simples dans un fichier `src/components/ui/Icons.tsx` qui exporte des composants SVG React légers.

## Tailwind CSS v4

- **Pas de** `tailwind.config.js`
- **Pas de** `postcss.config.js`
- Plugin Vite: `@tailwindcss/vite` dans `vite.config.ts`
- CSS: `@import "tailwindcss"` dans `src/index.css`
- Customisation via `@theme { }` dans le CSS

## Validation Config JSON

Pas de Zod. Validation manuelle avec des fonctions TypeScript type-guard et messages d'erreur explicites.

## SheetJS (xlsx)

**IMPORTANT:** La version npm (`xlsx` sur npmjs) est obsolète (0.18.5). Installer depuis le CDN :
```bash
yarn add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

## Plan d'Exécution

Le fichier `execution-plan.md` contient les spécifications détaillées de chaque phase.
Référence obligatoire avant d'implémenter une phase.
