# 📊 CSV/Excel Viewer

![React](https://img.shields.io/badge/React-19.x-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-586%20passing-success)
![Coverage](https://img.shields.io/badge/Coverage-81%25+-green)

> Application web moderne pour visualiser, filtrer et analyser des fichiers CSV et Excel directement dans le navigateur.

**🔗 [Demo Live](https://clement1234.github.io/csv-viewer/)**

---

## ✨ Fonctionnalités

### 📂 Import & Parsing
- **Drag & Drop** ou sélection de fichiers CSV et Excel (.xlsx)
- Parsing robuste avec **PapaParse** (CSV) et **SheetJS** (Excel)
- Sélection de feuilles pour les fichiers Excel multi-onglets
- Détection automatique de l'encodage et des délimiteurs

### 🔍 Analyse & Visualisation
- **Inférence automatique du schéma** (types de colonnes : texte, nombre, date, booléen, catégorie)
- Affichage tabulaire avec **pagination** et **tri** multi-colonnes
- **Statistiques en temps réel** :
  - Lignes totales / filtrées
  - Plages min/max pour les nombres
  - Distribution des catégories
  - Valeurs manquantes

### ⚡ Filtrage Avancé
- **5 types de filtres** adaptés au type de colonne :
  - **Texte** : recherche avec debounce
  - **Catégorie** : multi-sélection
  - **Nombres** : plages (min/max)
  - **Dates** : plages avec calendrier
  - **Booléen** : Vrai/Faux/Tous
- Combinaison de filtres (AND/OR configurable)
- Badge de comptage des filtres actifs

### 🎨 Personnalisation
- **Configuration JSON** optionnelle pour :
  - Renommer les colonnes
  - Définir les types manuellement
  - Masquer des colonnes
  - Spécifier les formats de dates
- **Sélecteur de colonnes** (afficher/masquer dynamiquement)
- Thème moderne avec **Tailwind CSS v4**

### 💾 Export
- Export CSV des données filtrées
- Préservation du formatage et des types

---

## 🚀 Installation

### Prérequis
- **Node.js** 18+ et **Yarn** 1.22+

### Étapes

```bash
# Cloner le repo
git clone https://github.com/clement1234/csv-viewer.git
cd csv-viewer

# Installer les dépendances
yarn install

# Lancer le serveur de développement
yarn dev
```

L'application sera disponible sur **http://localhost:5173**

---

## 📖 Usage

### 1. Importer un fichier
- Glisser-déposer un fichier CSV/Excel sur la zone de drop
- Ou cliquer pour ouvrir le sélecteur de fichiers

### 2. Sélectionner une feuille (Excel uniquement)
- Si le fichier contient plusieurs feuilles, choisir celle à visualiser

### 3. Filtrer et analyser
- Utiliser le panneau de filtres (icône entonnoir)
- Sélectionner/désélectionner des colonnes (icône colonnes)
- Cliquer sur les en-têtes pour trier

### 4. Exporter
- Cliquer sur "Exporter CSV" pour télécharger les données filtrées

### Configuration avancée (optionnel)

Créer un fichier `config.json` :

```json
{
  "columns": {
    "nom": {
      "displayName": "Nom Complet",
      "type": "text",
      "visible": true
    },
    "age": {
      "type": "number"
    },
    "date_inscription": {
      "type": "date",
      "dateFormat": "DD/MM/YYYY"
    }
  }
}
```

Puis l'uploader avec le fichier CSV/Excel.

---

## 🛠️ Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `yarn dev` | Démarre le serveur de développement (Vite) |
| `yarn build` | Build de production (TypeScript + Vite) |
| `yarn preview` | Prévisualise le build de production |
| `yarn test` | Lance les tests en mode watch |
| `yarn test run` | Lance les tests une fois |
| `yarn test:coverage` | Tests + rapport de couverture |
| `yarn lint` | Vérifie le code (ESLint) |
| `yarn lint:fix` | Corrige les erreurs ESLint auto-fixables |
| `yarn type-check` | Vérification TypeScript (`tsc --noEmit`) |
| `yarn validate` | **Validation complète** (type-check + lint + tests) |

**⚠️ `yarn validate` doit passer à 100% avant chaque commit.**

---

## 🏗️ Stack Technique

| Outil | Version | Rôle |
|-------|---------|------|
| **React** | 19.x | Framework UI |
| **TypeScript** | 5.9 | Typage statique (strict mode) |
| **Vite** | 7.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Styling (via `@tailwindcss/vite`) |
| **PapaParse** | 5.x | Parsing CSV |
| **SheetJS** | 0.20.3 | Parsing Excel (.xlsx) |
| **Vitest** | 4.x | Tests unitaires & intégration |
| **Testing Library** | 16.x | Tests composants React |
| **ESLint** | 10.x | Linter (flat config) |

**Aucune autre dépendance** (pas de Lodash, Zod, Prettier, etc.)

---

## 📁 Architecture

```
src/
├── types/              # Définitions TypeScript
│   ├── core.types.ts   # Types de données (Row, Column, Schema...)
│   ├── config.types.ts # Configuration JSON
│   └── ui.types.ts     # Props des composants
├── lib/
│   ├── parsers/        # CSV & Excel parsers
│   ├── schema/         # Inférence de types & validation config
│   ├── data/           # Filtrage, tri, export
│   └── utils/          # Utilitaires (dates, strings, numbers, formatters)
├── components/
│   ├── upload/         # Dropzone, FilePicker, SheetSelector
│   ├── table/          # DataTable, Pagination, ColumnPicker
│   ├── filters/        # FiltersPanel + 5 types de filtres
│   ├── ui/             # Icons, Toast, Modal, Button
│   └── stats/          # Cartes de statistiques
├── hooks/              # useAppState, useToast, useFilters, usePagination
└── test/               # Setup Vitest, factories, utils
```

---

## 🧪 Tests

Le projet suit une méthodologie **TDD stricte** avec **344 tests** :

- **Couverture minimale** : 80% par phase
- **Approche** : RED → GREEN → REFACTOR
- **Tests** :
  - Unitaires (parsers, filtres, utils)
  - Intégration (hooks, composants)
  - E2E (workflows utilisateur complets)

```bash
# Lancer les tests en watch mode
yarn test

# Tests une fois + rapport
yarn test run

# Avec couverture
yarn test:coverage
```

---

## 🚢 Déploiement

Le projet est déployé automatiquement sur **GitHub Pages** via GitHub Actions.

### Workflow CI/CD

```yaml
# .github/workflows/deploy.yml
- yarn install
- yarn validate  # Type-check + lint + tests
- yarn build
- Upload artifact (dist/)
- Deploy to GitHub Pages
```

### Configuration requise

1. **GitHub Pages** : Source = "GitHub Actions"
2. **`vite.config.ts`** : `base: '/csv-viewer/'`
3. **`.nojekyll`** : Empêche Jekyll de traiter les fichiers

**URL de production** : https://clement1234.github.io/csv-viewer/

---

## 🧹 Conventions de Code

### Clean Code

- **Fonctions** : Verbes explicites, max 50 lignes, une responsabilité
  - ✅ `parseCSVFileToNormalizedRows`
  - ❌ `parse`, `getData`
- **Variables** : Descriptives et contextuelles
  - ✅ `filteredRowsForCurrentPage`
  - ❌ `data`, `temp`
- **Commentaires** : Expliquer le POURQUOI, jamais le quoi

### ESLint Strict Mode

- ❌ `any` interdit (`no-explicit-any: error`)
- ❌ Non-null assertions (`!`) interdits
- ❌ Variables inutilisées (même `_` préfixées)
- ✅ 0 erreurs, 0 warnings

---

## 📝 License

MIT © 2026 Clement B

---

## 🤝 Contribution

Les contributions sont bienvenues ! Merci de :

1. **Fork** le projet
2. Créer une branche : `git checkout -b feature/ma-feature`
3. **Valider** : `yarn validate` (doit passer)
4. Commit : `git commit -m "feat: ma super feature"`
5. Push : `git push origin feature/ma-feature`
6. Ouvrir une **Pull Request**

### Guidelines

- Respecter les conventions de code (voir `CLAUDE.md`)
- Ajouter des tests (coverage ≥ 80%)
- Documenter les nouvelles fonctionnalités
- Suivre l'approche TDD (RED → GREEN → REFACTOR)

---

**Fait avec ❤️ et [Claude Code](https://claude.com/claude-code)**
