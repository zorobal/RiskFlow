# Sogesti GRC - Plateforme Multi-Tenant

Sogesti GRC est une suite logicielle d'Entreprise de premier plan conçue pour la gestion des Risques, des Audits Internes et de la Conformité Réglementaire. Dotée d'une architecture multi-tenant robuste, elle garantit une étanchéité absolue des données clients tout en offrant une expérience utilisateur fluide et hautement personnalisable inspirée des standards de l'industrie (Odoo).

## 🚀 Fonctionnalités Clés

- **Authentification & Redirection Dynamique** : Une page de connexion centralisée redirigeant instantanément les utilisateurs (SuperAdmin et comptes clients) vers leurs espaces dédiés.
- **Portail SuperAdministrateur** : 
  - Gestion des contrats, licences et facturation clients.
  - Provisionnement de bases de données indépendantes et étanches.
  - Création de comptes d'accès clients avec identifiants et mots de passe personnalisables.
  - Journal d'audit système unifié et immuable.
  - Simulation de plans de secours (MFA, sauvegardes, restauration).
- **Espace Client GRC (Multi-Tenant)** :
  - **Tableau de Bord** : Indicateurs de pilotage, KRI (Key Risk Indicators) et métriques clés.
  - **Cartographie des Risques** : Identification, évaluation et cotation des risques.
  - **Calcul & Évaluation** : Automatisation des formules de calcul de criticité brute, efficacité des contrôles et criticité résiduelle.
  - **Matrice des Risques (Heatmap)** : Représentation visuelle interactive en 4x4 ou 5x5.
  - **Plans d'Actions** : Suivi rigoureux des mesures d'atténuation.
  - **Audit Interne** : Pilotage des missions d'audit et suivi des recommandations.
  - **Conformité & Obligations** : Suivi des référentiels (ISO 27001, RGPD, COSO) et déclaration d'incidents.
  - **Rapports & Audit Trail** : Génération de synthèses PDF/Excel de conformité et traçabilité complète des logs.

## 🛠️ Stack Technique & Architecture de Déploiement

- **Frontend** : React 18+ orchestré avec Vite et typé en TypeScript.
- **Styling** : Tailwind CSS pour une interface moderne, réactive et à haute densité d'information.
- **Micro-Animations** : `motion` pour des transitions fluides et un retour d'expérience optimal.
- **Déploiement Frontend** : Conçu pour être hébergé sur **Vercel** pour des performances mondiales optimales (Edge).
- **Base de Données** : Conçu pour utiliser **Supabase (PostgreSQL)** avec une architecture "Database-per-Tenant" (une base physique distincte et étanche par client).

## 💻 Démarrage en Développement

1. Installez les dépendances du projet :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

3. Ouvrez l'application dans votre navigateur : [http://localhost:3000](http://localhost:3000)

## 📁 Fichiers d'Architecture et de Documentation Associés

Pour en savoir plus sur les aspects mathématiques, structurels ou pratiques de la plateforme, veuillez vous référer aux fichiers suivants :
- `SYNTHESE_ARCHITECTURE_FORMATION.md` : Guide complet sur l'organisation hiérarchique et l'étanchéité multi-tenant.
- `CALCULS_DES_FORMULES_UTILISEES.md` : Détail des calculs de risques bruts, résiduels et efficacité des contrôles.
- `MANUEL_D_UTILISATION_DE_LAPPLICATION.md` : Guide pas-à-pas pour les administrateurs et utilisateurs finaux.
