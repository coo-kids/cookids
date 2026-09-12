# Compteur de cookies vendus

La page `/cagnotte` affiche `contents/statistics.yml`. Aucun appel GitHub ni aucune information client n'est envoyé au navigateur. Le total initial est 0 jusqu'au premier comptage.

## Configuration

Ajouter le secret Actions **COOKIDS_STATS_TOKEN** dans les paramètres du dépôt. Ne jamais placer le token dans un fichier versionné.

Le token doit pouvoir lire les issues et leurs champs dans `coo-kids/cookids-commands`, lire le projet d'organisation configuré dans `contents/boards.yml` et écrire le fichier de contenu dans `coo-kids/cookids`. Pour un PAT classique : scopes `repo`, `read:project` et `read:org`, avec accès aux dépôts concernés et autorisation SSO si nécessaire. Un token à permissions fines équivalent peut être utilisé selon les permissions disponibles pour les champs d'issue.

L'Action utilise ce token pour le commit : contrairement au `GITHUB_TOKEN` automatique, cela permet au push de déclencher les workflows de CI et l'intégration de déploiement. Les protections de branche restent applicables ; si elles interdisent ce push, il faudra adopter une publication par PR. Aucune protection n'est contournée.

## Utilisation

Après merge, ouvrir **Actions → Mettre à jour la cagnotte → Run workflow**, sélectionner **main**. L'Action lit toutes les issues (ouvertes et fermées), prend uniquement celles du projet configuré dont le champ Statut correspond à `930ece28` (« Commande terminée »), et additionne leur champ numérique `totalCookies`. Les éléments archivés sont inclus, chaque issue est comptée une seule fois, et toutes les connexions paginées sont parcourues.

Une commande terminée sans `totalCookies`, avec une valeur négative ou non entière, fait échouer le comptage sans changer le fichier. Compléter les anciennes commandes avant le premier lancement. Un échec API n'écrase pas non plus le compteur.

Si le total change, un commit sur main déclenche le déploiement. Sinon aucun commit n'est créé. Relancer l'Action remplace le total : il n'est jamais incrémenté à partir de l'ancien compteur.

Le workflow n'est pas lancé automatiquement. Le header propose un lien vers la cagnotte avec une icône tirelire, immédiatement à gauche du panier.
