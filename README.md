# Cookids

Cookids est une boutique de pâtisseries solidaires. Les gourmandises du mois sont proposées en ligne et les bénéfices soutiennent des projets pédagogiques.

L’application comprend une vitrine Vue, un panier, un tunnel de commande et une API qui recalcule systématiquement les prix côté serveur.

## Stack

- [Node.js](https://nodejs.org/) et [pnpm](https://pnpm.io/) workspaces pour le monorepo
- Vue 3, Vite et Tailwind CSS pour la SPA
- Vercel Functions pour l’API HTTP
- Ts.ED, AJV et `@tsed/json-mapper` pour le domaine et la validation
- Vitest pour les tests

## Démarrer en local

Prérequis : Node.js 22 ou supérieur et pnpm 11 (la CI utilise Node.js 24).

```sh
pnpm install
pnpm run dev
```

Vite affiche l’URL locale une fois le serveur démarré.

## Flux de commande

| Commande                | Rôle                                  |
|-------------------------|---------------------------------------|
| `pnpm run dev`           | Démarre la SPA en développement.      |
| `pnpm run typecheck`     | Vérifie les types TypeScript et Vue.  |
| `pnpm run test`          | Exécute l’ensemble des tests Vitest.  |
| `pnpm run test:watch`    | Lance les tests en mode surveillance. |
| `pnpm run test:coverage` | Génère le rapport de couverture.      |
| `pnpm run build`         | Produit la SPA dans `packages/web/dist`.  |

## Architecture

```text
apps/web/                  SPA Vue 3 (Vite + Tailwind)
api/                       Functions Vercel, dont POST /api/orders
contents/                  Sources éditables du catalogue et des textes (YAML)
packages/domain/           Modèles, DTO, validation, règles métier et ports
packages/infrastructure/   Chargement YAML, configuration et adaptateurs techniques
```

Les fichiers `contents/catalog.yml` et `contents/site.yml` sont les sources de vérité du catalogue et des textes. Ils sont validés à leur chargement dans la SPA comme dans l’infrastructure backend. Les images référencées par le catalogue sont dans `packages/web/public/images/`.

## Commandes

Le navigateur envoie seulement les produits et quantités sélectionnés. L’API `POST /api/orders` valide l’entrée, relit le catalogue côté serveur, regroupe les lignes identiques et recalcule chaque prix et total. Un prix fourni par le navigateur n’est jamais accepté.

À ce stade, les adaptateurs de persistance et d’envoi d’e-mail fournis par le projet sont des implémentations factices (`FakeOrderRepository` et `FakeMailService`). Une commande est donc validée et traitée en mémoire, mais n’est pas encore enregistrée dans Google Sheets ni envoyée par e-mail.

Exemple de requête :

```sh
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Camille Dupont",
    "email": "camille@example.com",
    "items": [{ "productId": "cookie-cafe-noix", "quantity": 2 }]
  }'
```

Pour exécuter cette Function localement, utilisez un environnement compatible Vercel (par exemple la CLI Vercel) en parallèle de la SPA Vite.

## Variables d’environnement

Les fichiers d’exemple listent les variables prévues pour les intégrations de production :

```sh
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
RESEND_API_KEY=
RESEND_FROM=
ORDER_NOTIFICATION_EMAIL=
```

Copiez `.env.example` vers `.env.local` pour votre environnement local, sans jamais versionner de secrets. Les clés qui commenceraient par `VITE_` seraient exposées au navigateur : n’y placez aucune donnée sensible.

## Déploiement

Le dépôt est configuré pour Vercel :

- installation : `pnpm install --frozen-lockfile` ;
- build : `pnpm run build` ;
- sortie SPA : `packages/web/dist` ;
- API : `api/orders.ts`, servie sous `POST /api/orders`.

Importez le dépôt dans Vercel en conservant la racine du projet, puis configurez les secrets de production dans les variables d’environnement Vercel. La configuration détaillée est disponible dans [DEPLOYMENT.md](DEPLOYMENT.md).

## Contribution

Avant toute proposition de changement fonctionnel, exécutez :

```sh
pnpm run test
pnpm run build
```

Les conventions de contribution et les règles d’architecture sont décrites dans [AGENTS.md](AGENTS.md).
