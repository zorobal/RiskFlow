# Formules et Algorithmes de Calcul GRC

Ce document décrit en détail les équations mathématiques et logiques implémentées au sein de la plateforme Sogesti GRC pour évaluer et cartographier les risques d'entreprise.

---

## 1. Criticité Brute du Risque (Gross Risk Score)

La criticité brute évalue l'exposition d'un risque sans considérer l'effet réducteur d'éventuels dispositifs de contrôle interne.

### Formule :
$$\text{Criticité Brute} (C_B) = \text{Probabilité} (P) \times \text{Impact} (I)$$

- **Probabilité ($P$)** : Note entière de 1 à $N$ évaluant la fréquence de survenance du risque.
- **Impact ($I$)** : Note entière de 1 à $N$ évaluant la sévérité financière, opérationnelle ou réputationnelle.
- **Taille de la Matrice ($N$)** : Égale à **4** (échelle 4x4) ou **5** (échelle 5x5) selon la configuration choisie par l'entreprise ou configurée par le SuperAdmin.

### Exemples de bornes de Criticité Brute ($C_B$) :
- Matrice 4x4 : $C_B \in [1, 16]$
- Matrice 5x5 : $C_B \in [1, 25]$

---

## 2. Efficacité des Contrôles (Control Effectiveness)

Pour chaque risque, un ou plusieurs contrôles peuvent être rattachés. Chaque contrôle dispose d'une note d'efficacité individuelle.

### Formule de calcul d'Efficacité Globale ($E_C$) :
Si plusieurs contrôles sont affectés à un risque, l'efficacité combinée est calculée selon l'algorithme suivant :

$$E_C = \min \left( 100\%, \sum_{k=1}^{M} E_k \right) \quad \text{ou} \quad E_C = 1 - \prod_{k=1}^{M} (1 - E_k)$$

Dans l'implémentation standardisée de notre plateforme GRC :
- Les contrôles sont agrégés par moyenne pondérée ou représentés par l'évaluation du contrôle le plus fort.
- L'efficacité globale $E_C$ est exprimée sous forme de pourcentage : $E_C \in [0\%, 100\%]$.

---

## 3. Criticité Résiduelle (Net / Residual Risk Score)

La criticité résiduelle mesure l'exposition réelle restante après l'application des contrôles internes opérationnels.

### Formule Standard :
$$\text{Criticité Résiduelle} (C_R) = \text{Criticité Brute} (C_B) \times \left(1 - \frac{E_C}{100}\right)$$

*Pour des raisons d'affichage sur la matrice cartographique, le score de criticité résiduelle est arrondi à l'entier le plus proche.*

### Impact sur les Coordonnées Matricielles :
La criticité résiduelle est également projetée graphiquement sur la Heatmap. L'algorithme calcule les coordonnées résiduelles ajustées ($P_{\text{net}}, I_{\text{net}}$) basées sur l'atténuation du risque :

1. **Réduction d'Impact ($I_{\text{net}}$)** : $I_{\text{net}} = \max \left( 1, \text{round} \left( I \times \left(1 - \frac{E_C}{100} \times F_{\text{impact}} \right) \right) \right)$
2. **Réduction de Probabilité ($P_{\text{net}}$)** : $P_{\text{net}} = \max \left( 1, \text{round} \left( P \times \left(1 - \frac{E_C}{100} \times F_{\text{freq}} \right) \right) \right)$

*(Où $F_{\text{impact}}$ et $F_{\text{freq}}$ sont les facteurs d'atténuation configurés dans le module d'administration du client).*

---

## 4. Seuils d'Alerte et Niveaux de Gravité

Les risques (bruts ou résiduels) sont catégorisés en 3 niveaux d'alerte selon des plages de scores bien définies :

### Pour une Matrice 4x4 :
- **🟢 Risque Faible (Vert)** : Score $C_B \text{ ou } C_R \in [1, 4]$
- **🟡 Risque Modéré (Orange)** : Score $C_B \text{ ou } C_R \in [5, 9]$
- **🔴 Risque Élevé (Rouge)** : Score $C_B \text{ ou } C_R \in [10, 16]$ (Nécessite une relance automatique et un plan d'action d'atténuation immédiat).

### Pour une Matrice 5x5 :
- **🟢 Risque Faible (Vert)** : Score $C_B \text{ ou } C_R \in [1, 6]$
- **🟡 Risque Modéré (Orange)** : Score $C_B \text{ ou } C_R \in [7, 14]$
- **🔴 Risque Élevé (Rouge)** : Score $C_B \text{ ou } C_R \in [15, 25]$
