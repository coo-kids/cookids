# Cookids — instructions de contribution

## Commandes

Utiliser Bun depuis la racine : `bun install`, `bun run dev`, `bun run build`, `bun test`.

## Architecture

- `contents/` contient les YAML métier éditables. Vite les charge côté SPA et l’infrastructure Bun les charge côté backend.
- `packages/domain` contient les modèles, schémas, DTO, règles métier et ports, sans dépendance Vercel/Google/Resend.
- `packages/infrastructure` contient les adaptateurs techniques, dont les loaders Bun des YAML métier.
- `api/` contient les Functions Vercel et leurs tests co-localisés, préfixés par `_` pour ne pas être déployés comme routes.
- `apps/web` est la SPA Vue. Elle ne contient ni secret ni calcul de prix faisant autorité.
- La couche de style de `apps/web` utilise Tailwind CSS via son plugin Vite ; privilégier les utilitaires et tokens Tailwind aux nouvelles règles CSS globales.

## Conventions

- Un fichier par classe Ts.ED injectable, modèle, DTO, erreur métier, adaptateur ou utilitaire réutilisable.
- Extraire les règles partagées ; ne pas créer d’abstraction pour du rendu local trivial.
- Ne jamais accepter un prix venant du navigateur.
- Les DTO utilisent `@tsed/schema` + `@tsed/ajv` pour la validation. Employer `@tsed/json-mapper` pour désérialiser les entrées et sérialiser les réponses.
- Les `.env*` réels ne sont pas versionnés. dotenv-flow ne sert qu’en local/test ; Vercel fournit les secrets hébergés.

## Vérification

Après toute modification fonctionnelle, lancer `bun test` et `bun run build`.
