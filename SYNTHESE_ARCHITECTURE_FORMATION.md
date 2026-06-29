# Synthèse de l'Architecture & Structure GRC Multi-Tenant

Ce document détaille les fondements architecturaux, l'organisation hiérarchique d'entreprise et les politiques de sécurité de la plateforme Sogesti GRC.

---

## 1. Modèle d'Organisation Hiérarchique (Sogesti Org Model)

La plateforme supporte une structure d'entreprise complexe et granulaire. Chaque client (Tenant) modélise sa structure organisationnelle selon les règles d'or suivantes :

```
[Entreprise Cliente / Tenant]
       │
       └──► [Filiale 1] (Si aucune filiale, l'entreprise devient sa propre filiale)
                 │
                 └──► [Département 1]
                           │
                           └──► [Division 1]
                                     │
                                     └──► [Employé 1] ◄──► [Fonction GRC]
```

### 🏢 L'Entreprise (Tenant)
- Représente l'entité de plus haut niveau détenant le contrat de licence.
- Possède un identifiant unique de base de données, garantissant son étanchéité.

### 🏢 Les Filiales (Subsidiaries)
- Une Entreprise peut posséder une ou plusieurs filiales.
- **Règle de repli (Fallback)** : Si une entreprise ne possède pas de filiales physiques, **elle est sa propre filiale**. Toutes les opérations s'exécutent alors sous cette filiale par défaut pour préserver l'intégrité de l'arborescence.

### 📂 Les Départements (Departments)
- Chaque filiale dispose d'un ou plusieurs départements (ex. Département Financier, Département Informatique, Département Opérations).

### 🏷️ Les Divisions
- Une division est rattachée à un département spécifique (ex. Division Trésorerie rattachée au département Finance).
- Un département peut englober une ou plusieurs divisions.

### 👥 Les Employés & Fonctions
- Un employé est impérativement rattaché à une division. Une division regroupe un ou plusieurs employés.
- Chaque employé dispose d'une **Fonction** précise (ex. Risk Manager, Responsable d'Audit, Directeur Financier), définissant ses responsabilités métiers, distinctes de son rôle applicatif.

---

## 2. Étanchéité Multi-Tenant (Vercel & Supabase)

Pour répondre aux exigences de sécurité les plus strictes, Sogesti GRC applique une étanchéité physique et logique des données.

```
                  ┌──────────────────────┐
                  │   Navigateur Client  │
                  └──────────┬───────────┘
                             │ (https://tenant.sogesti-grc.com)
                             ▼
                ┌──────────────────────────┐
                │ Frontend Edge (Vercel)   │ (Routage dynamique par sous-domaine/tenant)
                └────────────┬─────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Supabase DB (Client A)│         │ Supabase DB (Client B)│ (Bases PostgreSQL physiques isolées)
│  - Risques Client A   │         │  - Risques Client B   │
│  - Utilisateurs A     │         │  - Utilisateurs B     │
└───────────────────────┘         └───────────────────────┘
```

### 1. Routage et Isolation Frontend (Vercel)
- L'application est servie par **Vercel** via des serveurs Edge. Un middleware inspecte le sous-domaine de la requête (ex. `pharmaco.sogesti-grc.com`) ou le jeton de session pour identifier l'ID unique du client (`tenant_id`).
- Le trafic est instantanément canalisé vers les configurations appropriées sans interférence possible entre clients.

### 2. Isolation de Base de Données (Supabase Database-per-Tenant)
- Contrairement aux approches "Single-Database/Shared Schema", chaque entreprise cliente dispose d'une **base de données PostgreSQL indépendante hébergée sur Supabase**.
- Cette approche garantit qu'aucune erreur de requête SQL ne peut exposer accidentellement les données d'un client à un autre. De plus, elle permet aux clients d'héberger leurs bases de données dans des régions géographiques différentes si requis par la législation (RGPD).

---

## 3. Rôles et Habilitations (RBAC)

La sécurité applicative s'appuie sur le contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control). Deux grands espaces cohabitent :

### 💻 Espace SuperAdministrateur (Console Platform)
Accessible uniquement par authentification directe depuis la page de connexion :
- **SuperAdmin Technique** : Supervise l'infrastructure, analyse les logs système et simule les plans de sauvegarde.
- **SuperAdmin Commercial** : Administre les contrats de licences, configure les quotas de risques et gère les abonnements.

### 🏢 Espace Collaborateurs Client (Espace GRC)
- **Analyste** : Droits de lecture et de saisie initiale des risques et des plans d'actions.
- **Responsable** : Droits d'évaluation, de revue des plans d'actions et de suivi opérationnel.
- **Risk Manager** : Responsable de la cotation officielle des risques, de la validation des contrôles et du paramétrage des seuils.
- **Direction** : Vue décisionnelle, approbation des tolérances de risques, signature électronique des rapports de conformité.
