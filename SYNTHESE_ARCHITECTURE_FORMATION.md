# Synthèse de l'Architecture & Structure GRC Multi-Tenant

Ce document détaille les fondements architecturaux, le modèle d'organisation d'entreprise, la gestion du cycle de vie des exercices annuels et les politiques d'habilitation de la plateforme Sogesti GRC.

---

## 1. Modèle d'Organisation Hiérarchique (Sogesti Org Model)

La plateforme supporte une structure d'entreprise arborescente et granulaire. Chaque client (Tenant) modélise son organisation selon la hiérarchie suivante :

```
[Entreprise Cliente / Tenant]
       │
       └──► [Filiale 1] (Si aucune filiale, l'entreprise devient sa propre filiale par défaut)
                 │
                 └──► [Département 1]
                           │
                           └──► [Division 1]
                                     │
                                     └──► [Employé 1] ◄──► [Fonction GRC]
```

### 🏢 L'Entreprise Cliente (Tenant)
- Représente l'entité juridique de haut niveau détenant le contrat de licence.
- Possède un identifiant de tenant unique (`tenant_id`) garantissant son étanchéité logique et physique.

### 🏢 Les Filiales (Subsidiaries)
- Une Entreprise peut comporter une ou plusieurs filiales (ex: *Sogesti France*, *Sogesti Afrique*).
- **Règle de repli (Fallback)** : Si une entreprise ne déclare pas de filiale distincte, **elle constitue sa propre filiale par défaut**.

### 📂 Les Départements (Departments)
- Chaque filiale regroupe un ou plusieurs départements (ex: *Département Informatique*, *Département Finance*, *Département Qualité*).

### 🏷️ Les Divisions
- Une division est rattachée à un département spécifique (ex: *Division Sécurité Système* rattachée au département *Informatique*).

### 👥 Les Employés & Fonctions GRC
- Un employé est rattaché à une division spécifique.
- Chaque employé se voit attribuer une **Fonction Métier** (ex: *Risk Manager*, *Analyste Sécurité*, *Responsable d'Audit*, *Directeur Général*), qui détermine son périmètre d'action.

---

## 2. Gestion du Cycle de Vie des Exercices Annuels (Sessions & Exercices)

Pour permettre une traçabilité pluriannuelle et des comparatifs d'exposition dans le temps, la plateforme gère les **Sessions d'Exercice Annuel** :

```
┌─────────────────────────────────────────────────────────────┐
│                   SESSION D'EXERCICE ANNUEL                 │
│   (ex: Exercice Fiscal 2026 - Du 01/01/2026 au 31/12/2026)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    [ Statut : Ouverte ]            [ Statut : Clôturée ]
   - Saisie des risques            - Verrouillage immuable
   - Évaluation IFACI / Mitigée    - Bilan annuel consolidé
   - Mises à jour des plans        - Consultation / Archivage
```

- **Sessions Ouvertes** : Permettent l'évaluation continue, la mise à jour des fiches de risques et la planification des actions de remédiation.
- **Clôture Officielle d'Exercice** : Effectuée par l'Administrateur de l'Entreprise ou la Direction Générale. La clôture génère un bilan annuel consolidé et verrouille l'historique de l'exercice.
- **Filtrage Pluriannuel** : Le Tableau de Bord et la Cartographie permettent de basculer instantanément d'un exercice à l'autre (ex: 2025 vs 2026) pour analyser l'évolution du profil de risque.

---

## 3. Étanchéité Multi-Tenant (Vercel & Supabase)

Sogesti GRC applique un modèle d'isolation strict à deux niveaux :

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

1. **Isolation Frontend (Vercel Edge)** : Le middleware identifie le tenant via le sous-domaine ou le jeton de session.
2. **Database-per-Tenant (Supabase)** : Chaque client dispose d'une base PostgreSQL dédiée, éliminant tout risque de fuite inter-entreprises.

---

## 4. Matrice des Rôles et Habilitations (RBAC)

La plateforme définit 5 grands profils d'utilisateurs :

| Rôle | Périmètre & Droits Principaux |
| :--- | :--- |
| **SuperAdmin (Console)** | Supervise l'infrastructure globale, gère les abonnements des entreprises clientes, attribue les comptes accès clients, simule le MFA et les sauvegardes. |
| **Administrateur Entreprise Client** | Administre la structure interne du tenant : gestion des utilisateurs, rôles, divisions, création et clôture officielle des sessions d'exercice annuel. |
| **Risk Manager** | Pilote la cartographie des risques, choisit les méthodologies (IFACI / Mitigée), valide les cotations et assigne les plans d'actions. |
| **Analyste (Terrain)** | Saisit les fiches d'incidents, déclare les déviations de conformité et met à jour l'avancement des actions correctives. |
| **Direction Générale & Auditeur Chef** | Consulte le tableau de bord exécutif, valide les rapports d'exposition, examine les constats d'audits et signe la clôture annuelle. |

---

## 5. Scénarios de Démonstration Interactive

Le module de démonstration interactive propose 4 scénarios guidés avec cas pratiques pas-à-pas :

1. **Scénario 1 : Administrateur de l'Entreprise Client** (Habilitations, organisation, sessions et clôture d'exercice).
2. **Scénario 2 : Risk Manager de Sogesti S.A.** (Cotation IFACI 4x4 $F \times I \times M$, plans de mitigation, filtres d'exercice fiscal).
3. **Scénario 3 : Analyste d'AeroTech (Terrain)** (Formule mitigée soustraite $P \times I - M$ sur grille 5x5, incidents de calibrage).
4. **Scénario 4 : Direction Générale & Auditeur Chef** (Constats d'audits internes, liasse de reporting et approbation stratégique).
