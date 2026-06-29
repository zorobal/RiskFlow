# Manuel d'Utilisation de l'Application Sogesti GRC

Bienvenue dans le manuel d'utilisation officiel de l'application Sogesti GRC. Ce document vous guidera à travers les fonctionnalités de l'Espace SuperAdministrateur et de l'Espace Client.

---

## 🔑 1. Écran de Connexion & Redirection Automatique

L'application s'ouvre systématiquement sur l'écran d'accueil sécurisé (Portail de Connexion) :

1. **Saisie des Identifiants** : Renseignez votre adresse email professionnelle et votre mot de passe (le mot de passe d'usine initial de tous les profils de test est **`vito`**).
2. **Mécanisme de Redirection** :
   - Si vous vous connectez avec un profil **SuperAdmin** (ex. `admin@plateforme.com`), la plateforme vous oriente automatiquement vers la **Console d'Administration de la Plateforme**.
   - Si vous vous connectez avec un compte **Client** (ex. `alainpatricknkoumou@gmail.com`), la plateforme vous connecte à l'environnement GRC dédié de votre entreprise (ex. *Sogesti International S.A.*).

---

## 💻 2. Guide de l'Espace SuperAdministrateur (Console Platform)

L'Espace SuperAdministrateur est réservé aux gestionnaires de la plateforme. Il est structuré en plusieurs onglets opérationnels :

### Onglet 1 : 📊 Tableau de Bord (KPIs & Alertes)
- Permet de suivre le nombre d'entreprises clientes actives, la distribution des modules souscrits, et d'ajuster le mot de passe SuperAdmin dans la carte **Sécurité & Clé SuperAdmin**.

### Onglet 2 : 🔑 Comptes Accès Clients (Nouveau)
- Permet au SuperAdmin d'ajouter des comptes utilisateurs clients.
- Saisissez le nom, l'email, le rôle (Analyste, Responsable, Risk Manager, Direction) et l'entreprise (Tenant) associée.
- **Attribution du Mot de Passe** : Le SuperAdmin saisit un premier mot de passe temporaire pour le client. Le client pourra ensuite le changer à sa convenance depuis son espace.

### Onglet 3 : 🏢 Clients & Licences
- Activez ou prolongez les abonnements des entreprises clientes, ajustez les quotas de risques et configurez des clés d'activation.

### Onglet 4 : 📝 Logs & Audits Système
- Visualisez le journal complet et immuable des accès et interventions d'administration pour la conformité SOX / IFACI.

---

## 🏢 3. Guide de l'Espace GRC Client

Une fois connecté à l'espace GRC de votre entreprise, vous naviguez via le ruban d'applications supérieur :

### 📊 Tableau de Bord
- Consultez les indicateurs de pilotage, le taux de couverture des risques par des contrôles, et la répartition des plans d'actions.

### 🗺️ Cartographie des Risques
- Identifiez de nouveaux risques, attribuez-leur un code unique (ex. `R-101`), évaluez la probabilité et l'impact de départ, et assignez un responsable.

### ⚙️ Calcul & Évaluation (GRC Engine)
- Ajustez l'efficacité des dispositifs de contrôle interne sous forme de pourcentage (de 0% à 100%).
- La plateforme calcule automatiquement la **criticité résiduelle** en temps réel et applique un code couleur de gravité (Vert, Orange, Rouge).

### 🔲 Matrice Risques (Heatmap)
- Visualisez la grille matricielle (4x4 ou 5x5). Cliquez sur un point pour zoomer sur les risques correspondants.

### 📝 Plans d'Actions
- Configurez des plans d'atténuation pour les risques rouges ou critiques. Suivez leur progression de *Non commencé* à *Clôturé*.

### 📝 Audit Interne
- Préparez des missions d'audit interne, déclarez des constats (findings) et formulez des recommandations.

### 🛡️ Conformité & Obligations
- Évaluez l'adhérence de votre structure par rapport à des obligations réglementaires ou des référentiels (RGPD, ISO 27001).

---

## 🔑 4. Comment modifier son Mot de Passe ?

### Pour le SuperAdministrateur :
1. Accédez au Tableau de Bord SuperAdmin.
2. Repérez la section **Sécurité & Clé SuperAdmin** (colonne de droite).
3. Saisissez le nouveau mot de passe et validez. Le changement prend effet immédiatement.

### Pour un Client ou Collaborateur standard :
1. Cliquez sur votre **photo de profil** dans le coin supérieur droit de la barre de navigation.
2. Dans le menu déroulant, cliquez sur **🔑 Modifier mon mot de passe**.
3. Renseignez votre nouveau mot de passe dans le pop-up, confirmez-le, et cliquez sur **Sauvegarder**.
