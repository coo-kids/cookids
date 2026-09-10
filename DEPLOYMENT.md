# Déploiement Vercel

## Chaîne CI/CD

GitHub Actions vérifie chaque pull request et chaque push sur `main` au moyen de trois jobs parallèles : build de la SPA, vérification TypeScript de la SPA et de la Function, puis tests Vitest. Chaque job installe strictement les dépendances à partir de `bun.lock`.

Une fois le dépôt GitHub connecté au projet Vercel, Vercel assure le CD :

- une preview est créée pour chaque branche et pull request ;
- un push (ou merge) sur `main` crée le déploiement de production.

La CI n'envoie aucun secret et ne déploie pas directement. Cette responsabilité reste à l'intégration GitHub de Vercel, qui publie également les statuts de déploiement dans la pull request.

## Configuration initiale de Vercel

1. Dans Vercel, importez le dépôt GitHub et conservez la racine du dépôt comme *Root Directory*.
2. Choisissez `main` comme *Production Branch*.
3. Conservez la configuration versionnée : `bunx bun@1.4.0 install --frozen-lockfile`, `bun run build` et `packages/web/dist`. La version de Bun est imposée car `bun.lock` utilise le format v2. La Function `api/orders.ts` est automatiquement servie sous `POST /api/orders`.
4. Ajoutez les variables de production, puis les variables de preview si celles-ci doivent pouvoir créer une commande : `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `RESEND_API_KEY`, `RESEND_FROM` et `ORDER_NOTIFICATION_EMAIL`.
5. Lancez un premier déploiement et testez la preview, y compris une requête `POST /api/orders`, avant de fusionner dans `main`.

Ne versionnez aucune valeur de variable d'environnement. Pour `GOOGLE_PRIVATE_KEY`, conservez les retours à la ligne de la clé dans la valeur configurée dans Vercel.

## Exploitation

Les logs de build et d'exécution de la Function sont consultables depuis le déploiement Vercel. Un revert Git de `main` déclenche un nouveau déploiement de production et constitue le mécanisme de retour arrière privilégié.
