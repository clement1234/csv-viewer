# Plan d'Exécution - CSV/Excel Viewer React

**Version:** 3.0
**Date:** Mars 2026
**Conventions et stack:** voir `CLAUDE.md`

---

## Architecture

```
csv-viewer/
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── eslint.config.js
├── vitest.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── sample.csv
│   └── config.sample.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   ├── core.types.ts
    │   ├── config.types.ts
    │   └── ui.types.ts
    ├── lib/
    │   ├── parsers/
    │   │   ├── csv-parser.ts
    │   │   └── xlsx-parser.ts
    │   ├── schema/
    │   │   ├── schema-inference.ts
    │   │   ├── config-validator.ts
    │   │   └── config-applicator.ts
    │   ├── data/
    │   │   ├── filters.ts
    │   │   ├── sorting.ts
    │   │   └── export.ts
    │   └── utils/
    │       ├── date-utils.ts
    │       ├── string-utils.ts
    │       ├── number-utils.ts
    │       └── cell-formatters.ts
    ├── components/
    │   ├── upload/
    │   │   ├── Dropzone.tsx
    │   │   ├── FilePicker.tsx
    │   │   └── SheetSelector.tsx
    │   ├── table/
    │   │   ├── DataTable.tsx
    │   │   ├── TableHeader.tsx
    │   │   ├── TableRow.tsx
    │   │   └── Pagination.tsx
    │   ├── filters/
    │   │   ├── FiltersPanel.tsx
    │   │   ├── TextFilter.tsx
    │   │   ├── CategoryFilter.tsx
    │   │   ├── DateRangeFilter.tsx
    │   │   ├── NumberRangeFilter.tsx
    │   │   └── BooleanFilter.tsx
    │   ├── ui/
    │   │   ├── Icons.tsx
    │   │   ├── Toast.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Button.tsx
    │   │   └── ColumnPicker.tsx
    │   └── stats/
    │       ├── StatsCards.tsx
    │       └── StatsPanels.tsx
    ├── hooks/
    │   ├── useAppState.ts
    │   ├── useToast.ts
    │   ├── useFilters.ts
    │   └── usePagination.ts
    └── test/
        ├── setup.ts
        ├── factories/
        │   └── data.factory.ts
        └── utils/
            └── test-utils.tsx
```

---

## Phase 0 : Infrastructure

### Phase 0.1 : Initialisation du Projet

**Objectif :** Projet Vite fonctionnel avec tous les outils configurés.

**Étapes :**

1. Créer le projet :
   ```bash
   yarn create vite csv-viewer --template react-ts
   cd csv-viewer
   ```

2. Configurer Yarn classique — `.yarnrc.yml` :
   ```yaml
   nodeLinker: node-modules
   ```

3. Installer les dépendances :
   ```bash
   # Production
   yarn add papaparse
   yarn add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

   # Dev
   yarn add -D @types/papaparse
   yarn add -D eslint typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh
   yarn add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
   yarn add -D tailwindcss @tailwindcss/vite
   ```

4. Configurer ESLint 10 — `eslint.config.js` :
   ```js
   import js from '@eslint/js';
   import tseslint from 'typescript-eslint';
   import reactHooks from 'eslint-plugin-react-hooks';
   import reactRefresh from 'eslint-plugin-react-refresh';

   export default tseslint.config(
     js.configs.recommended,
     ...tseslint.configs.strict,
     {
       files: ['src/**/*.{ts,tsx}'],
       plugins: {
         'react-hooks': reactHooks,
         'react-refresh': reactRefresh,
       },
       rules: {
         'react-hooks/rules-of-hooks': 'error',
         'react-hooks/exhaustive-deps': 'warn',
         'react-refresh/only-export-components': 'warn',
         '@typescript-eslint/explicit-function-return-type': 'warn',
         '@typescript-eslint/no-explicit-any': 'error',
         'no-console': ['warn', { allow: ['error'] }],
       },
     },
     { ignores: ['dist/**'] }
   );
   ```

5. Configurer Vitest — `vitest.config.ts` :
   ```ts
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: './src/test/setup.ts',
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         exclude: ['node_modules/', 'src/test/'],
       },
     },
   });
   ```

6. Configurer Vite — `vite.config.ts` :
   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     base: '/csv-viewer/',
   });
   ```

7. Configurer TypeScript — `tsconfig.json` :
   - `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
   - `noUnusedLocals: true`, `noUnusedParameters: true`

8. CSS — `src/index.css` :
   ```css
   @import "tailwindcss";

   @theme {
     --color-badge-green: #10b981;
     --color-badge-red: #ef4444;
     --color-badge-orange: #f59e0b;
     --color-badge-blue: #3b82f6;
     --color-badge-gray: #6b7280;
   }
   ```

9. Scripts `package.json` :
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "test": "vitest",
       "test:coverage": "vitest --coverage",
       "lint": "eslint .",
       "lint:fix": "eslint . --fix",
       "type-check": "tsc --noEmit",
       "validate": "yarn type-check && yarn lint && yarn test run"
     }
   }
   ```

10. Setup tests — `src/test/setup.ts` :
    ```ts
    import '@testing-library/jest-dom';
    ```

**Critère :** `yarn validate` passe (même avec 0 tests). `yarn dev` démarre.

---

### Phase 0.2 : Tous les Types + Test Utilities

**Objectif :** Définir TOUS les types du projet (core, config, UI) et les utilitaires de test.

> Les types sont définis ensemble dès le départ pour éviter les dépendances circulaires entre phases.

**Fichier `src/types/core.types.ts` :**

```typescript
/** Ligne de données normalisée — toutes valeurs en string */
type DataRow = Record<string, string>;

/** Ligne brute avant normalisation (parsing XLSX) */
type RawDataRow = Record<string, unknown>;

/** Types de colonnes détectables */
type ColumnDataType = 'date' | 'number' | 'boolean' | 'category' | 'multi' | 'text';

/** Schéma inféré d'une colonne */
interface InferredColumnSchema {
  columnName: string;
  detectedType: ColumnDataType;
  distinctValuesCount: number;
  emptyValuesRate: number;        // 0 à 1
  sampleValues: string[];         // 3-5 exemples
  separatorCharacter?: '|' | ',' | ';';
  possibleOptions?: string[];     // Pour category
  minValue?: number;              // Pour number
  maxValue?: number;              // Pour number
}

/** Résultat de détection de type */
interface ColumnTypeDetectionResult {
  type: ColumnDataType;
  separatorCharacter?: '|' | ',' | ';';
  possibleOptions?: string[];
  minValue?: number;
  maxValue?: number;
}
```

**Fichier `src/types/config.types.ts` :**

```typescript
type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
type BadgeVariant = 'solid' | 'outline' | 'subtle';
type LinkType = 'mailto' | 'tel' | 'url';

interface AppConfig {
  title?: string;
  subtitle?: string;
}

interface CSVConfig {
  delimiter?: string;
}

interface MatchConfig {
  expectedHeaders?: string[];
  strictMode?: boolean;
}

// Union discriminée par type
type ColumnFormatConfig =
  | { type: 'date'; inputFormat?: DateFormat; outputFormat?: DateFormat }
  | { type: 'badge'; map: Record<string, { color: string; variant: BadgeVariant }> }
  | { type: 'splitBadges'; separator: '|' | ',' | ';' }
  | { type: 'link'; linkType: LinkType };

interface ColumnsConfig {
  defaultVisible?: string[];
  labels?: Record<string, string>;
  aliases?: Record<string, string>;
  formats?: Record<string, ColumnFormatConfig>;
}

interface FiltersConfig {
  globalSearchColumns?: string[];
  dropdown?: string[];
  text?: string[];
  dateRange?: string[];
  numberRange?: string[];
  boolean?: string[];
  multiSelect?: string[];
}

type StatsCardConfig =
  | { type: 'count'; label: string }
  | { type: 'countWhere'; label: string; column: string; value: string };

type StatsPanelConfig =
  | { type: 'countByColumn'; column: string; label: string }
  | { type: 'countByYearFromDate'; column: string; label: string }
  | { type: 'countBySplitValues'; column: string; label: string };

interface StatsConfig {
  cards?: StatsCardConfig[];
  panels?: StatsPanelConfig[];
}

interface DetailModalSection {
  title: string;
  fields: string[];
}

interface DetailModalConfig {
  titleTemplate?: string;
  sections?: DetailModalSection[];
}

interface Config {
  app?: AppConfig;
  csv?: CSVConfig;
  match?: MatchConfig;
  columns?: ColumnsConfig;
  filters?: FiltersConfig;
  stats?: StatsConfig;
  detailModal?: DetailModalConfig;
}
```

**Fichier `src/types/ui.types.ts` :**

```typescript
interface GlobalSearchFilter {
  searchTerm: string;
  targetColumns: string[];
}

interface TextFilter {
  columnName: string;
  searchTerm: string;
}

interface CategoryFilter {
  columnName: string;
  selectedValues: string[];
}

interface DateRangeFilter {
  columnName: string;
  startDate: string | null;
  endDate: string | null;
}

interface NumberRangeFilter {
  columnName: string;
  minValue: number | null;
  maxValue: number | null;
}

interface BooleanFilter {
  columnName: string;
  selectedValue: 'all' | 'true' | 'false';
}

interface MultiSelectFilter {
  columnName: string;
  selectedValues: string[];
}

interface FilterState {
  globalSearch?: GlobalSearchFilter;
  textFilters: TextFilter[];
  categoryFilters: CategoryFilter[];
  dateRangeFilters: DateRangeFilter[];
  numberRangeFilters: NumberRangeFilter[];
  booleanFilters: BooleanFilter[];
  multiSelectFilters: MultiSelectFilter[];
}

interface SortState {
  columnName: string | null;
  direction: 'asc' | 'desc' | null;
}

interface PaginationState {
  currentPage: number;
  rowsPerPage: 25 | 50 | 100 | 200;
}
```

**Fichier `src/test/factories/data.factory.ts` :**

Fonctions factory :
- `createMockDataRow(overrides?)` → DataRow avec valeurs par défaut (nom, prenom, email)
- `createMockDataRowArray(count, generator?)` → Tableau de DataRows
- `createMockInferredSchema(overrides?)` → InferredColumnSchema avec défauts

**Fichier `src/test/utils/test-utils.tsx` :**

- `renderWithProviders(ui, options?)` — wrapper autour de RTL render()
- Ré-export de `@testing-library/react` et `userEvent`

**Tests :** `src/types/__tests__/core.types.test.ts` + `src/test/factories/__tests__/data.factory.test.ts`

- Vérifier que les types compilent
- Factory retourne valeurs par défaut correctes
- Override fonctionne
- Array factory respecte le count et le generator

**Critère :** ≥10 tests, `yarn validate` passe.

---

### Phase 0.3 : Utilitaires de Dates

**Fichier :** `src/lib/utils/date-utils.ts`

**Type :**
```typescript
type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
```
(Importé depuis `config.types.ts`)

**Fonctions :**

| Fonction | Signature | Description |
|---|---|---|
| `convertExcelDateToISOString` | `(date: Date \| null) → string` | Date JS → `YYYY-MM-DD` ou `''` si invalide |
| `parseDateStringToDateObject` | `(str: string, format?: DateFormat) → Date \| null` | String → Date (auto-détection format si non fourni). Valide la date (pas de 31/02). Année 1900-2100. |
| `formatDateObjectToString` | `(date: Date, format: DateFormat) → string` | Date → string formatée, zero-padded |
| `isValidDateString` | `(str: string) → boolean` | true si parsable en date valide |
| `detectDateFormatFromString` | `(str: string) → DateFormat \| null` | Auto-détection du format |

**Logique `detectDateFormatFromString` :**
- `^\d{4}[-/]\d{2}[-/]\d{2}$` → `YYYY-MM-DD`
- `^\d{2}[-/]\d{2}[-/]\d{4}$` → distinguer DD/MM vs MM/DD :
  - Premier nombre > 12 → `DD/MM/YYYY`
  - Deuxième nombre > 12 → `MM/DD/YYYY`
  - Ambigu → `DD/MM/YYYY` (défaut français)

**Tests :** `src/lib/utils/__tests__/date-utils.test.ts` — ≥20 tests couvrant :
- Conversion Excel (valide, null, undefined, invalide)
- Parsing tous formats (ISO, FR, US, avec tirets/slashes)
- Dates invalides (31/02, string vide, non-date)
- Formatage (tous formats, zero-padding)
- Détection format (tous cas, ambiguïtés)

**Critère :** ≥20 tests, coverage ≥90%.

---

### Phase 0.4 : Utilitaires de Strings

**Fichier :** `src/lib/utils/string-utils.ts`

**Fonctions :**

| Fonction | Signature | Description |
|---|---|---|
| `trimAndNormalizeString` | `(value: unknown) → string` | null/undefined→`''`, autres→String().trim() |
| `removeAccentsFromString` | `(str: string) → string` | NFD + suppression diacritiques |
| `normalizeColumnName` | `(name: string) → string` | Voir logique ci-dessous |
| `normalizeColumnNamesWithDeduplication` | `(names: string[]) → string[]` | Normalise + suffixe `_2`, `_3` si doublons |
| `detectSeparatorInString` | `(value: string) → '\|' \| ',' \| ';' \| null` | Priorité : `\|` > `,` > `;` |
| `splitStringBySeparator` | `(value: string, sep) → string[]` | Split + trim + filtrer vides |

**Logique `normalizeColumnName` :**
1. `removeAccentsFromString`
2. Lowercase
3. Trim
4. **Apostrophes → underscore** (ex: `d'inscription` → `d_inscription`)
5. Espaces/tirets → underscores
6. Supprimer caractères spéciaux (garder `a-z 0-9 _`)
7. Dédupliquer underscores consécutifs

Exemples :
- `Prénom` → `prenom`
- `Date d'inscription` → `date_d_inscription`
- `Email Address` → `email_address`
- `nom@#$%` → `nom`

**`normalizeColumnNamesWithDeduplication` :**
- Si deux colonnes normalisent au même nom → ajouter suffixe : `nom`, `nom_2`, `nom_3`

**Tests :** `src/lib/utils/__tests__/string-utils.test.ts` — ≥15 tests.

**Critère :** ≥15 tests, coverage ≥90%.

---

### Phase 0.5 : Utilitaires de Nombres

**Fichier :** `src/lib/utils/number-utils.ts`

**Fonctions :**

| Fonction | Signature | Description |
|---|---|---|
| `isStringNumeric` | `(value: string) → boolean` | Détecte format FR et EN |
| `parseStringToNumber` | `(value: string) → number \| null` | Parse selon format détecté |
| `formatNumberToString` | `(value: number, locale?: 'fr' \| 'en') → string` | Formatage via `Intl.NumberFormat` |

**Logique de détection du format numérique :**

Pour distinguer `1,000` (EN: mille) de `1,50` (FR: un virgule cinq) :
- Si contient `,` ET `.` :
  - Dernier `.` après dernière `,` → format anglais (`1,000.50`)
  - Dernière `,` après dernier `.` → format français (`1.000,50`)
- Si contient uniquement `,` :
  - **Si exactement 3 chiffres après la `,` et pas d'autre `,`** → ambigu, traiter comme FR par défaut
  - **Si plusieurs `,`** séparant des groupes de 3 → format anglais (`1,000,000`)
  - **Si 1 ou 2 chiffres après la `,`** → format français (`1,50`)
- Si contient uniquement `.` → format anglais
- Gérer espaces comme séparateurs de milliers FR (`1 000 000`)
- Gérer signe négatif en préfixe

**Tests :** `src/lib/utils/__tests__/number-utils.test.ts` — ≥15 tests.

Cas importants :
- `123` → 123
- `123.45` → 123.45 (EN)
- `123,45` → 123.45 (FR)
- `1 000 000` → 1000000 (FR milliers)
- `1,000,000.50` → 1000000.5 (EN)
- `1.000.000,50` → 1000000.5 (FR)
- `1,000` → 1000 (ambigu → défaut FR = 1.0, **MAIS si 3 chiffres après virgule unique et pas d'autre séparateur, c'est ambigu** → documenter le choix)
- `-123.45` → -123.45
- `abc` → null
- `""` → null

**Critère :** ≥15 tests, coverage ≥90%.

---

## Phase 1 : Parsing de Données

### Phase 1.1 : CSV Parser

**Fichier :** `src/lib/parsers/csv-parser.ts`

**Fonction :** `parseCSVFileToNormalizedRows(file: File, customDelimiter?: string): Promise<DataRow[]>`

**Comportement :**
- PapaParse config : `header: true`, `skipEmptyLines: true`, `dynamicTyping: false`
- `delimiter: customDelimiter || ''` (auto-detect)
- `transform` → `trimAndNormalizeString` sur chaque valeur
- `transformHeader` → `normalizeColumnName` sur chaque header
- **Utiliser `normalizeColumnNamesWithDeduplication`** sur l'ensemble des headers pour éviter les collisions
- Fichier vide ou sans données → throw Error explicite

**Tests :** `src/lib/parsers/__tests__/csv-parser.test.ts` — ≥10 tests.

Couvrir : parsing basique, trim, headers normalisés, auto-detect délimiteur (`;`, `,`, `|`), délimiteur forcé, cellules vides, fichier vide, fichier headers-only.

**Critère :** ≥10 tests, coverage ≥85%.

---

### Phase 1.2 : XLSX Parser

**Fichier :** `src/lib/parsers/xlsx-parser.ts`

**Interface :**
```typescript
interface ParseXLSXResult {
  data: DataRow[];
  availableSheetNames: string[];
}
```

**Fonctions :**
- `parseXLSXFirstSheetWithAvailableSheets(file: File): Promise<ParseXLSXResult>`
  - `XLSX.read(arrayBuffer, { type: 'array', cellDates: true })`
  - Retourne données de la 1ère feuille + liste des noms de feuilles
- `extractRowsFromSpecificSheet(file: File, sheetName: string): Promise<DataRow[]>`
  - Feuille inexistante → throw Error

**Helper privée :** `extractAndNormalizeSheetData(workbook, sheetName): DataRow[]`
- `sheet_to_json` avec `{ defval: '', raw: false }`
- Headers normalisés avec déduplication
- Dates Excel → `convertExcelDateToISOString`
- Autres valeurs → `trimAndNormalizeString`

**Tests :** `src/lib/parsers/__tests__/xlsx-parser.test.ts` — ≥12 tests.

> **Créer les XLSX de test** en utilisant SheetJS lui-même :
> ```typescript
> const workbook = XLSX.utils.book_new();
> const sheet = XLSX.utils.aoa_to_sheet([['Nom', 'Age'], ['Dupont', '30']]);
> XLSX.utils.book_append_sheet(workbook, sheet, 'Feuille1');
> const buffer = XLSX.write(workbook, { type: 'array' });
> const file = new File([buffer], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
> ```

Couvrir : parsing basique, multi-feuilles, feuille spécifique, feuille inexistante, dates Excel, cellules vides, headers normalisés, fichier vide.

**Critère :** ≥12 tests, coverage ≥85%.

---

## Phase 2 : Inférence de Schéma

### Phase 2.1 : Détection de Types de Colonnes

**Fichier :** `src/lib/schema/schema-inference.ts`

**Fonctions :**

`inferSchemaFromDataRows(data: DataRow[], sampleSize?: number = 200): InferredColumnSchema[]`
- Limiter analyse à `sampleSize` lignes
- Pour chaque colonne : extraire valeurs, calculer emptyRate, détecter type, calculer distinct, extraire exemples

`detectColumnTypeFromValues(values: string[]): ColumnTypeDetectionResult`

**Ordre de détection (premier match gagne) :**
1. **DATE** — ≥60% des valeurs non-vides sont `isValidDateString`
2. **NUMBER** — ≥70% sont `isStringNumeric` → calculer min/max
3. **BOOLEAN** — ≥80% dans `['oui','non','true','false','1','0','yes','no']` (lowercase)
4. **MULTI** — ≥40% contiennent un séparateur détecté, valeurs splittées se répètent entre lignes
5. **CATEGORY** — distinctCount ≤ 30 ET distinctCount/totalRows < 0.3
6. **TEXT** — fallback

**Helpers :**
- `calculateEmptyValuesRate(values: string[]): number`
- `extractDistinctNonEmptyValues(values: string[]): string[]`

**Tests :** `src/lib/schema/__tests__/schema-inference.test.ts` — ≥15 tests.

Couvrir : chaque type de colonne (date, number, boolean, multi, category, text), dataset vide, sampleSize respecté, emptyRate correct, distinct correct.

**Critère :** ≥15 tests, coverage ≥85%.

---

### Phase 2.2 : Configuration par Défaut depuis le Schéma

**Ajouter dans** `src/lib/schema/schema-inference.ts` :

`generateDefaultConfigFromSchema(schema: InferredColumnSchema[]): Partial<Config>`
- `columns.defaultVisible` : colonnes avec emptyRate < 0.5, triées par densité, max 10
- `filters` : générer selon types (text→text, category→dropdown, date→dateRange, number→numberRange, boolean→boolean, multi→multiSelect)
- `filters.globalSearchColumns` : colonnes text avec emptyRate < 0.3, max 5

`selectDefaultVisibleColumns(schema: InferredColumnSchema[], max?: number = 10): string[]`

**Tests :** ≥8 tests.

**Critère :** ≥8 tests, coverage ≥85%.

---

## Phase 3 : Configuration JSON

### Phase 3.1 : Validation de Configuration

**Fichier :** `src/lib/schema/config-validator.ts`

> **Pas de Zod.** Validation manuelle avec type guards TypeScript.

**Fonction :** `validateConfigAndReturnResult(rawConfig: unknown): { isValid: boolean; config?: Config; errors?: string[] }`

**Implémentation :**
- Vérifier que `rawConfig` est un objet non-null
- Pour chaque section optionnelle (`app`, `csv`, `match`, `columns`, `filters`, `stats`, `detailModal`) :
  - Vérifier types des propriétés
  - Valider unions discriminées (`ColumnFormatConfig`, `StatsCardConfig`, etc.)
  - Rejeter clés inconnues → ajouter erreur
- Messages d'erreur en français, clairs et actionnables

**Fonctions type-guard helper :**
- `isValidAppConfig(value: unknown): value is AppConfig`
- `isValidColumnsConfig(value: unknown): value is ColumnsConfig`
- `isValidFiltersConfig(value: unknown): value is FiltersConfig`
- etc.

**Tests :** `src/lib/schema/__tests__/config-validator.test.ts` — ≥12 tests.

Couvrir : config valide complète, config minimaliste, clé inconnue, type incorrect, unions discriminées valides/invalides, messages d'erreur clairs.

**Critère :** ≥12 tests, coverage ≥85%.

---

### Phase 3.2 : Application de la Configuration

**Fichier :** `src/lib/schema/config-applicator.ts`

**Fonction :** `applyConfigToSchemaAndData(config: Config, schema: InferredColumnSchema[], data: DataRow[]): { appliedConfig: Config; warnings: string[]; normalizedData: DataRow[] }`

**Comportement :**
1. **Vérifier `match.expectedHeaders`** si défini :
   - Comparer colonnes dataset vs attendues
   - ≥50% manquantes + `strictMode: true` → throw Error
   - ≥50% manquantes sans strictMode → warning
2. **Appliquer aliases** (`config.columns.aliases`) → renommer colonnes dans data
3. **Merger** config utilisateur avec config auto-générée (config utilisateur prioritaire)

`applyColumnAliasesToDataRows(data: DataRow[], aliases: Record<string, string>): DataRow[]`
- Pour chaque ligne, renommer les clés selon aliases

**Tests :** `src/lib/schema/__tests__/config-applicator.test.ts` — ≥10 tests.

Couvrir : pas de warning si colonnes OK, warning si <50% manquantes, throw si ≥50% + strict, continue si ≥50% sans strict, aliases appliqués, merge config, données non perdues.

**Critère :** ≥10 tests, coverage ≥85%.

---

## Phase 4 : Filtrage et Tri

### Phase 4.1 : Logique de Filtrage

**Fichier :** `src/lib/data/filters.ts`

**Fonction principale :** `applyAllFiltersToDataRows(data: DataRow[], filterState: FilterState, schema: InferredColumnSchema[]): DataRow[]`

Applique séquentiellement (AND logique) :

| Fonction | Logique |
|---|---|
| `applyGlobalSearchFilter` | Cherche searchTerm (case-insensitive) dans colonnes ciblées |
| `applyTextFilters` | Colonne contient searchTerm (case-insensitive) |
| `applyCategoryFilters` | Valeur dans selectedValues (OR entre valeurs) |
| `applyDateRangeFilters` | Date entre start et end (inclus), parser via `parseDateStringToDateObject` |
| `applyNumberRangeFilters` | Nombre entre min et max (inclus), parser via `parseStringToNumber` |
| `applyBooleanFilters` | `'all'` = pas de filtre, sinon normaliser et comparer |
| `applyMultiSelectFilters` | Splitter par separator du schema, intersection avec selectedValues |

**Tests :** `src/lib/data/__tests__/filters.test.ts` — ≥20 tests.

Couvrir : chaque type de filtre individuellement + combinaison AND + aucun filtre actif + cas limites (dates invalides exclues, valeurs non-numériques exclues, selectedValues vide = pas de filtre).

**Critère :** ≥20 tests, coverage ≥90%.

---

### Phase 4.2 : Logique de Tri

**Fichier :** `src/lib/data/sorting.ts`

**Fonction :** `sortDataRowsByColumn(data: DataRow[], sortState: SortState, schema: InferredColumnSchema[]): DataRow[]`

- `columnName === null` → retourner tel quel
- Tri selon type colonne :
  - **date** → comparer Date objects (invalides en fin)
  - **number** → comparer numbers (non-numériques en fin)
  - **boolean** → false < true
  - **text/category/multi** → `localeCompare`
- Respecter direction asc/desc
- **Ne pas muter** le tableau original

**Tests :** `src/lib/data/__tests__/sorting.test.ts` — ≥12 tests.

Couvrir : tri par chaque type (asc/desc), pas de tri, immutabilité, valeurs invalides en fin.

**Critère :** ≥12 tests, coverage ≥90%.

---

## Phase 5 : Export CSV

**Fichier :** `src/lib/data/export.ts`

**Fonction :** `exportDataRowsToCSVFile(data: DataRow[], filename: string, visibleColumns: string[], columnLabels?: Record<string, string>): void`

**Comportement :**
1. Filtrer colonnes visibles uniquement
2. Headers → utiliser labels si fournis, sinon nom colonne
3. Échapper guillemets (doubler `"`), entourer de `"` si contient `,` `"` ou `\n`
4. Joindre avec `\n`
5. Créer Blob (`text/csv;charset=utf-8;`), créer `<a>` temporaire, trigger download, révoquer URL

**Tests :** `src/lib/data/__tests__/export.test.ts` — ≥8 tests (mocker `<a>` et `URL.createObjectURL`).

Couvrir : export basique, colonnes visibles uniquement, labels utilisés, échappement guillemets/virgules/newlines, extension .csv.

**Critère :** ≥8 tests, coverage ≥85%.

---

## Phase 6 : Formatters de Cellules

**Fichier :** `src/lib/utils/cell-formatters.ts`

**Type :**
```typescript
type FormattedCellValue =
  | { type: 'text'; value: string }
  | { type: 'badge'; value: string; color: string; variant: BadgeVariant }
  | { type: 'chips'; values: string[] }
  | { type: 'link'; value: string; linkType: LinkType; href: string }
  | { type: 'date'; value: string; originalValue: string };
```

**Fonction :** `formatCellValueForDisplay(value: string, columnName: string, config: Config, schema: InferredColumnSchema[]): FormattedCellValue`

**Logique :**
1. Si `config.columns.formats[columnName]` défini → appliquer selon type (date→parser/formatter, badge→lookup map, splitBadges→chips, link→construire href)
2. Sinon fallback auto : date inféré→DD/MM/YYYY, multi inféré→chips, autre→text

**Tests :** `src/lib/utils/__tests__/cell-formatters.test.ts` — ≥12 tests.

**Critère :** ≥12 tests, coverage ≥85%.

---

## Phase 7 : Hooks React

### Phase 7.1 : useToast

**Fichier :** `src/hooks/useToast.ts`

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; duration?: number; }
```

- `useToast()` → `{ toasts, addToast(type, message, duration?), removeToast(id) }`
- Auto-dismiss : 4000ms (success/info), 8000ms (error/warning)
- ID unique via `crypto.randomUUID()`

**Tests :** ≥5 tests (renderHook, fake timers).

---

### Phase 7.2 : useFilters

**Fichier :** `src/hooks/useFilters.ts`

- `useFilters(initialState?)` → `{ filterState, updateFilter(type, filter), resetFilters(), activeFiltersCount }`

**Tests :** ≥5 tests.

---

### Phase 7.3 : usePagination

**Fichier :** `src/hooks/usePagination.ts`

- `usePagination(totalRows, initialRowsPerPage = 25)` → `{ currentPage, rowsPerPage, totalPages, goToPage, setRowsPerPage, nextPage, prevPage, isFirstPage, isLastPage }`
- `goToPage` clamp entre 1 et totalPages
- `setRowsPerPage` reset page à 1

**Tests :** ≥6 tests.

---

## Phase 8 : Composants UI de Base

### Phase 8.1 : Icônes SVG

**Fichier :** `src/components/ui/Icons.tsx`

Créer des composants SVG React simples (pas de librairie externe) :
- `ChevronUpIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- `CloseIcon` (X)
- `SearchIcon`
- `FilterIcon`
- `DownloadIcon`
- `EyeIcon`
- `CheckIcon`
- `AlertIcon`
- `InfoIcon`
- `UploadIcon`

Chaque icône : composant fonctionnel, props `className` et `size` (défaut 20).

Pas de tests pour ce fichier (SVG statiques).

---

### Phase 8.2 : Toast

**Fichier :** `src/components/ui/Toast.tsx`

Props : `{ toast: Toast; onClose: (id: string) => void }`

Couleurs selon type (vert/rouge/orange/bleu). Bouton close. Icônes depuis `Icons.tsx`.

**Tests :** ≥4 tests (affichage, icône, close callback, classes CSS).

---

### Phase 8.3 : Button

**Fichier :** `src/components/ui/Button.tsx`

Props étend `ButtonHTMLAttributes` : `variant ('primary'|'secondary'|'outline'|'ghost')`, `size ('sm'|'md'|'lg')`, `isLoading`, `leftIcon`, `rightIcon`.

**Tests :** ≥6 tests.

---

### Phase 8.4 : Modal

**Fichier :** `src/components/ui/Modal.tsx`

Props : `{ isOpen, onClose, title?, children, footer?, size ('sm'|'md'|'lg'|'xl') }`

Portal vers `document.body`. Backdrop blur. Close sur X, backdrop click, Escape. Focus trap. Body scrollable.

**Tests :** ≥8 tests.

---

## Phase 9 : Composants Upload

### Phase 9.1 : Dropzone

**Fichier :** `src/components/upload/Dropzone.tsx`

Props : `{ onFileSelected: (file: File) => void; acceptedFileTypes: string[]; label?: string }`

États visuels : idle, hover (dragging), error. Validation type de fichier.

**Tests :** ≥5 tests.

---

### Phase 9.2 : FilePicker

**Fichier :** `src/components/upload/FilePicker.tsx`

Props : `{ onFileSelected, acceptedFileTypes, label, buttonVariant? }`

Input file caché, bouton custom, affichage nom fichier sélectionné.

**Tests :** ≥4 tests.

---

### Phase 9.3 : SheetSelector

**Fichier :** `src/components/upload/SheetSelector.tsx`

Props : `{ sheetNames: string[]; onSheetSelected: (name: string) => void; onCancel: () => void }`

Modal avec liste radio des feuilles + boutons Charger/Annuler.

**Tests :** ≥5 tests.

---

## Phase 10 : Composants Table

### Phase 10.1 : DataTable

**Fichier :** `src/components/table/DataTable.tsx`

Props :
```typescript
{
  data: DataRow[];
  visibleColumns: string[];
  columnLabels?: Record<string, string>;
  schema: InferredColumnSchema[];
  config: Config;
  sortState: SortState;
  onSortChange: (columnName: string) => void;
  onRowClick: (row: DataRow, index: number) => void;
}
```

Table responsive (scroll horizontal mobile). Sticky header. Headers cliquables pour tri (icônes via `Icons.tsx`). Rendu cellules via `formatCellValueForDisplay`. Clic ligne → onRowClick.

**Tests :** ≥7 tests.

---

### Phase 10.2 : Pagination

**Fichier :** `src/components/table/Pagination.tsx`

Affichage "Lignes X-Y sur Z". Boutons First/Prev/Next/Last. Select rowsPerPage. Boutons désactivés aux bords.

**Tests :** ≥5 tests.

---

### Phase 10.3 : ColumnPicker

**Fichier :** `src/components/ui/ColumnPicker.tsx`

Bouton icône → popover avec checkboxes. "Tout sélectionner". Minimum 1 colonne visible.

**Tests :** ≥5 tests.

---

## Phase 11 : Composants Filtres

### Phase 11.1 : FiltersPanel

**Fichier :** `src/components/filters/FiltersPanel.tsx`

Panel collapsible. Search globale en haut. Génération dynamique des filtres selon schema+config. Badge compteur filtres actifs. Bouton reset.

**Tests :** ≥5 tests.

---

### Phase 11.2-11.6 : Filtres Individuels

| Composant | Comportement | Tests min |
|---|---|---|
| `TextFilter.tsx` | Input texte avec debounce 300ms | 4 |
| `CategoryFilter.tsx` | Multi-select checkboxes + search interne | 4 |
| `DateRangeFilter.tsx` | 2 inputs date (start/end) | 4 |
| `NumberRangeFilter.tsx` | 2 inputs number (min/max) | 4 |
| `BooleanFilter.tsx` | Toggle 3 états (all/true/false) | 4 |

Chaque composant : affichage, changement valeur → callback, reset, validation.

---

## Phase 12 : DetailModal

**Fichier :** `src/components/ui/DetailModal.tsx`

Props :
```typescript
{
  isOpen: boolean;
  row: DataRow | null;
  rowIndex: number;
  totalRows: number;
  schema: InferredColumnSchema[];
  config: Config;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}
```

Titre depuis `titleTemplate` ou première colonne. Boutons Prev/Next (désactivés aux bords). Si `config.detailModal.sections` → afficher par sections, sinon liste clé-valeur. Valeurs formatées via `formatCellValueForDisplay`.

**Tests :** ≥7 tests.

---

## Phase 13 : Composants Stats (Optionnel)

### Phase 13.1 : StatsCards

**Fichier :** `src/components/stats/StatsCards.tsx`

Cards selon `config.stats.cards`. Types : count (total), countWhere (filtré). Layout grid responsive. Calcul en `useMemo`.

**Tests :** ≥3 tests.

---

### Phase 13.2 : StatsPanels

**Fichier :** `src/components/stats/StatsPanels.tsx`

Panels selon `config.stats.panels`. Types : countByColumn, countByYearFromDate, countBySplitValues. Affichage tableau.

**Tests :** ≥3 tests.

---

## Phase 14 : App Principal et Orchestration

### Phase 14.1 : Hook useAppState

**Fichier :** `src/hooks/useAppState.ts`

> Extraire toute la logique d'état dans un hook dédié pour garder App.tsx lisible.

**État géré :**
```typescript
interface AppState {
  uploadedDataFile: File | null;
  uploadedConfigFile: File | null;
  parsedData: DataRow[];
  availableSheetNames: string[];
  selectedSheetName: string | null;
  inferredSchema: InferredColumnSchema[];
  appliedConfig: Config | null;
  configWarnings: string[];
  visibleColumns: string[];
  selectedRowIndex: number | null;
}
```

**Actions exposées :**
- `handleDataFileUpload(file: File): Promise<void>` — détecte CSV/XLSX, parse, infère schema
- `handleConfigFileUpload(file: File): Promise<void>` — valide et applique config
- `handleSheetSelection(sheetName: string): Promise<void>` — charge feuille spécifique
- `toggleColumnVisibility(columnName: string): void`
- `selectRow(index: number | null): void`
- `navigateRow(direction: 'prev' | 'next'): void`

Ce hook utilise `useFilters`, `usePagination`, `useToast` en interne.

**Tests :** ≥8 tests d'intégration (renderHook).

---

### Phase 14.2 : App.tsx

**Fichier :** `src/App.tsx`

Utilise `useAppState`. Deux écrans :

**Écran 1 — Upload :**
- Dropzone + FilePicker pour data
- FilePicker pour config (optionnel)
- Bouton "Charger" (disabled si pas de data)

**Écran 2 — Viewer :**
- Header (titre/sous-titre)
- StatsCards (si config)
- FiltersPanel (collapsible)
- Barre d'actions : ColumnPicker + bouton Export
- DataTable (données filtrées → triées → paginées via `useMemo`)
- Pagination
- DetailModal
- Container Toasts (fixed top-right)

**Optimisations :**
```typescript
const filteredData = useMemo(() => applyAllFiltersToDataRows(...), [parsedData, filterState, schema]);
const sortedData = useMemo(() => sortDataRowsByColumn(...), [filteredData, sortState, schema]);
const paginatedData = useMemo(() => sortedData.slice(start, end), [sortedData, currentPage, rowsPerPage]);
```

**Tests :** `src/__tests__/App.test.tsx` — ≥5 tests d'intégration.

Couvrir : flow CSV complet (upload→table→filtre→tri→modal), flow XLSX multi-feuilles, flow avec config, erreur fichier invalide, export CSV.

---

## Phase 15 : Styling et Responsive

### Phase 15.1 : CSS Global

Compléter `src/index.css` avec variables `@theme` et classes custom si nécessaire.

### Phase 15.2 : Responsive

| Breakpoint | Comportement |
|---|---|
| Mobile (<640px) | Table scroll horizontal, filters full-width collapsed, modal fullscreen, pagination compacte |
| Tablet (640-1024px) | Table visible, filters top, modal 80%, grid stats 2 cols |
| Desktop (>1024px) | Layout complet, filters sidebar, modal centrée max 1200px, grid stats 3-4 cols |

### Phase 15.3 : Accessibilité

- `aria-label` sur boutons icône
- Labels sur inputs
- Focus visible (ring Tailwind)
- Contraste WCAG AA
- Navigation clavier
- Focus trap dans modals
- Rôles ARIA (dialog, menu)
- Cible : Lighthouse Accessibility ≥ 90

---

## Phase 16 : Fichiers Sample

### Phase 16.1 : Sample CSV (`public/sample.csv`)

≥50 lignes, colonnes variées : texte (nom, prenom, email, ville), dates (date_inscription), nombres (age, montant), catégories (statut: actif/inactif/suspendu), booléens (newsletter: oui/non), multi (tags: tag1|tag2|tag3). Quelques cellules vides.

### Phase 16.2 : Sample Config (`public/config.sample.json`)

Config complète correspondant au sample.csv : app title, defaultVisible, labels FR, formats (dates, badges statut, splitBadges tags, mailto email), filtres, stats, detailModal avec sections.

---

## Phase 17 : Build et Déploiement

### Phase 17.1 : Optimisation Build

```bash
yarn build    # 0 erreurs
yarn preview  # Test local, vérifier console propre
```

Bundle JS < 500KB gzipped.

### Phase 17.2 : Déploiement GitHub Pages

Option A — **GitHub Actions** (recommandé, pas de `gh-pages` package) :

Créer `.github/workflows/deploy.yml` :
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

Vérifier `base` dans `vite.config.ts` correspond au nom du repo.

### Phase 17.3 : Validation Finale

```bash
yarn validate        # 0 erreurs
yarn build           # Succès
yarn test:coverage   # Coverage ≥ 80% global
```

Lighthouse : Performance ≥80, Accessibility ≥90, Best Practices ≥90.

Tests manuels : upload CSV/XLSX, config, filtres, tri, pagination, export, modal, responsive, console propre.

---

## Résumé

| Phase | Contenu | Tests min |
|---|---|---|
| 0.1 | Init projet | 0 |
| 0.2 | Types + factories | 10 |
| 0.3 | Date utils | 20 |
| 0.4 | String utils | 15 |
| 0.5 | Number utils | 15 |
| 1.1 | CSV parser | 10 |
| 1.2 | XLSX parser | 12 |
| 2.1 | Schema inference | 15 |
| 2.2 | Default config | 8 |
| 3.1 | Config validation | 12 |
| 3.2 | Config application | 10 |
| 4.1 | Filtres | 20 |
| 4.2 | Tri | 12 |
| 5 | Export CSV | 8 |
| 6 | Cell formatters | 12 |
| 7.1-7.3 | Hooks (3) | 16 |
| 8.1-8.4 | UI base (4) | 18 |
| 9.1-9.3 | Upload (3) | 14 |
| 10.1-10.3 | Table (3) | 17 |
| 11.1-11.6 | Filtres UI (6) | 25 |
| 12 | DetailModal | 7 |
| 13.1-13.2 | Stats (2) | 6 |
| 14.1-14.2 | App + state | 13 |
| 15 | Styling/responsive | 0 (manuel) |
| 16 | Samples | 0 |
| 17 | Build/deploy | 0 |
| **Total** | | **≥295 tests** |

**18 phases, ~40 sous-phases. Chaque phase validée par `yarn validate` avant passage à la suivante.**
