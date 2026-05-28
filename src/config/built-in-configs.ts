import type { Config } from '../types/config.types.ts';

export interface BuiltInConfig {
  name: string;
  config: Config;
}

export const BUILT_IN_CONFIGS: BuiltInConfig[] = [
  {
    name: 'VA-communauté',
    config: {
      app: {
        title: 'Gestion des Membres',
        subtitle: 'Base de données des membres de l\'association',
      },
      columns: {
        defaultVisible: [
          'id_du_contact',
          'nom',
          'prenom',
          'age',
          'statut_adherent',
          'region',
          'departement',
          'secteurgroupe_avancees',
          'session_amour_et_engagement',
          'session_aimer_dans_la_duree',
        ],
        labels: {
          age: 'Âge',
          activites: 'Activités',
        },
        computed: {
          age: {
            type: 'ageFromDate',
            sourceColumn: 'date_de_naissance',
            dateFormat: 'YYYY-MM-DD',
          },
        },
        formats: {
          date_inscription: {
            type: 'date',
            inputFormat: 'YYYY-MM-DD',
            outputFormat: 'DD/MM/YYYY',
          },
          statut: {
            type: 'badge',
            map: {
              actif: { color: '#10b981', variant: 'solid' },
              inactif: { color: '#ef4444', variant: 'solid' },
              suspendu: { color: '#f59e0b', variant: 'outline' },
            },
          },
          tags: {
            type: 'splitBadges',
            separator: '|',
          },
          email: {
            type: 'link',
            linkType: 'mailto',
          },
        },
      },
      filters: {
        globalSearchColumns: ['id_du_contact', 'nom', 'prenom', 'email', 'ville'],
        text: ['nom', 'prenom'],
        dropdown: ['statut', 'ville', 'activites'],
        dateRange: ['date_inscription'],
        numberRange: ['age'],
        boolean: [],
      },
      stats: {
        cards: [
          { type: 'count', label: 'Total membres' },
          { type: 'countWhere', label: 'Adhérent', column: 'statut_adherent', value: 'Adhérent' },
          { type: 'countWhere', label: 'Non adhérent', column: 'statut_adherent', value: 'Non adhérent' },
          { type: 'countWhere', label: 'Ancien adhérent', column: 'statut_adherent', value: 'Ancien adhérent' },
        ],
        panels: [
          { type: 'numericStats', column: 'age', label: 'Statistiques d\'âge', unit: 'ans' },
          { type: 'countByColumn', column: 'statut', label: 'Répartition par statut' },
          { type: 'countByColumn', column: 'categorie_de_membre', label: 'typologie' },
          { type: 'countByColumn', column: 'statut_adherent', label: 'Statut Adhésion' },
          { type: 'countByColumn', column: 'activites', label: 'Activités' },
          { type: 'countByColumn', column: 'missions_nationales', label: 'missions nationale' },
          { type: 'countByColumn', column: 'missions_regionales', label: 'missions région' },
          { type: 'countByColumn', column: 'missions_de_secteur', label: 'missions secteur' },
          { type: 'countByColumn', column: 'adherent_actif', label: 'Adhérent Actif' },
          { type: 'countByColumn', column: 'region', label: 'région' },
          { type: 'countByColumn', column: 'secteurgroupe_avancees', label: 'secteur' },
          { type: 'countByYearFromDate', column: 'date_de_creation', label: 'Inscriptions par année' },
          { type: 'countByYearFromDate', column: 'session_aimer_dans_la_duree', label: 'AD par année' },
          { type: 'countByYearFromDate', column: 'session_amour_et_engagement', label: 'AE par année' },
        ],
      },
      detailModal: {
        titleTemplate: '{{prenom}} {{nom}}',
        sections: [
          {
            title: 'Informations personnelles',
            fields: ['nom', 'prenom', 'email', 'ville', 'age'],
          },
          {
            title: 'Adhésion',
            fields: ['date_inscription', 'statut', 'newsletter'],
          },
          {
            title: 'Compétences',
            fields: ['tags'],
          },
        ],
      },
    },
  },
  {
    name: 'Gestion des membres',
    config: {
      app: {
        title: 'Gestion des Membres',
        subtitle: 'Base de données des membres de l\'association',
      },
      columns: {
        defaultVisible: ['nom', 'prenom', 'email', 'ville', 'statut', 'tags'],
        labels: {
          nom: 'Nom',
          prenom: 'Prénom',
          email: 'Email',
          ville: 'Ville',
          date_inscription: 'Date d\'inscription',
          age: 'Âge',
          montant: 'Montant (€)',
          statut: 'Statut',
          newsletter: 'Newsletter',
          tags: 'Technologies',
        },
        formats: {
          date_inscription: {
            type: 'date',
            inputFormat: 'YYYY-MM-DD',
            outputFormat: 'DD/MM/YYYY',
          },
          statut: {
            type: 'badge',
            map: {
              actif: { color: '#10b981', variant: 'solid' },
              inactif: { color: '#ef4444', variant: 'solid' },
              suspendu: { color: '#f59e0b', variant: 'outline' },
            },
          },
          tags: {
            type: 'splitBadges',
            separator: '|',
          },
          email: {
            type: 'link',
            linkType: 'mailto',
          },
        },
      },
      filters: {
        globalSearchColumns: ['nom', 'prenom', 'email', 'ville'],
        text: ['nom', 'prenom'],
        dropdown: ['statut', 'ville'],
        dateRange: ['date_inscription'],
        numberRange: ['age', 'montant'],
        boolean: ['newsletter'],
      },
      stats: {
        cards: [
          { type: 'count', label: 'Total membres' },
          { type: 'countWhere', label: 'Membres actifs', column: 'statut', value: 'actif' },
          { type: 'countWhere', label: 'Inscrits newsletter', column: 'newsletter', value: 'oui' },
        ],
        panels: [
          { type: 'countByColumn', column: 'statut', label: 'Répartition par statut' },
          { type: 'countByColumn', column: 'ville', label: 'Répartition par ville' },
          { type: 'countByYearFromDate', column: 'date_inscription', label: 'Inscriptions par année' },
          { type: 'countBySplitValues', column: 'tags', label: 'Technologies utilisées' },
        ],
      },
      detailModal: {
        titleTemplate: '{{prenom}} {{nom}}',
        sections: [
          {
            title: 'Informations personnelles',
            fields: ['nom', 'prenom', 'email', 'ville', 'age'],
          },
          {
            title: 'Adhésion',
            fields: ['date_inscription', 'statut', 'montant', 'newsletter'],
          },
          {
            title: 'Compétences',
            fields: ['tags'],
          },
        ],
      },
    },
  },
];
