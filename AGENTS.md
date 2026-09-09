# Cookids — instructions de contribution

## Commandes

Utiliser Bun depuis la racine : `bun install`, `bun run dev`, `bun run build`, `bun run test`.

## Architecture

- `contents/` contient les YAML métier éditables. Vite les charge côté SPA et l’infrastructure Bun les charge côté backend.
- `packages/domain` contient les modèles, schémas, DTO, règles métier et ports, sans dépendance Vercel/Google/Resend.
- `packages/infrastructure` contient les adaptateurs techniques, dont les loaders Bun des YAML métier.
- `api/` contient les Functions Vercel et leurs tests co-localisés.
- `apps/web` est la SPA Vue. Elle ne contient ni secret ni calcul de prix faisant autorité.
- La couche de style de `apps/web` utilise Tailwind CSS via son plugin Vite ; privilégier les utilitaires et tokens Tailwind aux nouvelles règles CSS globales.
- Le déploiement est automatique depuis `main` vers Vercel. La Function doit rester dans `api/`, car Vercel détecte ce dossier à la racine ; ne pas recréer `apps/api`.

## Contenu et validation

- `contents/catalog.yml` et `contents/site.yml` sont les sources éditables uniques du catalogue et des textes. Ne pas dupliquer leur contenu dans des composants ou des exports TypeScript intermédiaires.
- Les images statiques détenues par Cookids vivent dans `apps/web/public/images/` et sont référencées depuis les YAML. Une évolution par génération IA demande une validation humaine ; ne pas modifier les visuels sans demande explicite.
- La validation des YAML est exécutée dès leur chargement, côté Vite comme côté loader Bun ; il n'existe pas de script de validation séparé.
- Les schémas YAML utilisent l'API fonctionnelle Ts.ED (`s.object`, `s.string`, `s.array`, etc.) car ces données ne sont pas désérialisées par `@tsed/json-mapper`.
- Les DTO de requêtes HTTP, eux, restent des classes décorées : désérialisation par `@tsed/json-mapper`, validation par `@tsed/schema` et `@tsed/ajv`.

## Conventions

- Un fichier par classe Ts.ED injectable, modèle, DTO, erreur métier, adaptateur ou utilitaire réutilisable.
- Extraire les règles partagées ; ne pas créer d’abstraction pour du rendu local trivial. Éviter les fonctions inline quand une fonction est réutilisable : lui donner son propre fichier.
- Ne jamais accepter un prix venant du navigateur.
- Les DTO utilisent `@tsed/schema` + `@tsed/ajv` pour la validation. Employer `@tsed/json-mapper` pour désérialiser les entrées et sérialiser les réponses.
- Les `.env*` réels ne sont pas versionnés. dotenv-flow ne sert qu’en local/test ; Vercel fournit les secrets hébergés.
- Les ports abstraits (`CatalogProvider`, `OrderRepository`, `MailService`) sont configurés de manière visible dans `packages/infrastructure/config/index.ts`, avec `useClass` pour les implémentations de classes. Les services concrets injectés directement ne sont pas déclarés dans cette liste.
- Utiliser `inject(Service)` dans les propriétés des services Ts.ED. Ne pas construire de `InjectorService` ni enregistrer les providers à la main dans une factory.
- Les erreurs HTTP contrôlées étendent les exceptions de `@tsed/exceptions`. `defineHandler` capture les exceptions et retourne le format JSON public ; les services ne fabriquent jamais eux-mêmes une `Response`.
- Pour les tests avec doubles Ts.ED, utiliser `DITest.invoke()` ; ne pas instancier un service dont les dépendances reposent sur `inject()`.
- Les tests sont co-localisés avec le code testé.
- Chaque suite de tests utilise `describe`, et chaque cas de test utilise `it`.

## Frontend

- Utiliser Tailwind dans les templates. Garder `apps/web/src/styles/main.css` minimal (import et thème) ; ne pas créer de feuilles CSS de composants lorsque les utilitaires Tailwind suffisent.
- Centraliser les boutons dans `AppButton` avec variantes, tailles, focus visible et couleur de survol. Utiliser `lucide-vue-next` pour les icônes, notamment le panier.
- Le header est sticky ; son ombre n'apparaît qu'après défilement. Le bouton panier affiche seulement l'icône et un compteur lorsque celui-ci est supérieur à zéro.

## Vérification

Après toute modification fonctionnelle, lancer `bun run test` et `bun run build`.
