# Plan d’implémentation — Cookids

## Décision de cadrage

La première livraison couvre une verticale locale complète : catalogue statique, panier Vue, formulaire, `POST /api/orders`, validation Ts.ED, calcul serveur, services Fake, tests Bun et build Vite. Google Sheets, Resend et les contenus/photos définitifs restent hors de cette livraison, derrière des abstractions déjà stables.

Le site est une vente privée diffusée par bouche-à-oreille. La V1 ne gère donc ni livraison, ni retrait structuré, ni date limite, ni créneaux : une commande contient uniquement les coordonnées prévues et un commentaire libre. Ces règles pourront être ajoutées plus tard comme champs de contenu et de commande, sans modifier le calcul métier actuel.

Le dépôt est actuellement vierge de code applicatif. Les fichiers `.idea/` existants ne sont pas concernés.

## Architecture cible

```text
apps/web (Vue 3 + Vite SPA) ── POST /api/orders ── api/ (Vercel Function)
          │                                         │
          └── contents/ + packages/domain + packages/infrastructure ──┘
                                                    │
                              FakeOrderRepository + FakeMailService
```

Principes non négociables :

- le navigateur transmet seulement `productId` et `quantity` ;
- `OrderService` est l’unique endroit qui résout produits, prix et total ;
- la Function reste un adaptateur HTTP ;
- le domaine ne dépend ni de Vercel, ni de Google, ni de Resend ;
- les variables sensibles restent exclusivement dans l’environnement Vercel.
- les responsabilités sont séparées : une Function HTTP adapte la requête, un service orchestre le métier, un repository persiste et un service de mail délivre ;
- aucun utilitaire réutilisable ne reste inline dans un composant, une Function ou un service : il possède un fichier nommé dans le dossier adapté ;
- chaque classe Ts.ED injectable, modèle, DTO, erreur métier et implémentation d’adaptateur dispose de son propre fichier ; les fichiers d’index éventuels ne font que réexporter.
- éviter toute duplication de règles métier, de validation, de calcul de prix, de formatage métier et de lecture de configuration : une source de vérité est extraite dès qu’un comportement est partagé ;
- appliquer ce principe sans abstraction prématurée : deux lignes de rendu très localisées ne justifient pas à elles seules un composant, un helper ou une hiérarchie supplémentaire.

### Convention de placement des fichiers

```text
packages/domain/src/
├── models/             # un fichier par modèle et par classe métier
├── dto/                # un fichier par DTO Ts.ED
├── services/           # OrderService.ts uniquement pour OrderService
├── repositories/       # contrats de persistance
├── mail/               # contrats de messagerie
├── errors/             # une erreur par fichier si elle porte un comportement/contrat propre
├── utils/              # fonctions pures, réutilisables, une par fichier
└── catalog.ts

api/
├── orders.ts            # Function Vercel
└── _orders.test.ts      # test co-localisé, ignoré par Vercel
```

Les fonctions locales très courtes qui ne servent qu’à rendre un composant peuvent rester privées ; dès qu’une fonction est réutilisée ou encode une règle métier, elle est extraite dans le module approprié. Cette règle évite l’éparpillement sans imposer artificiellement un fichier pour une simple expression de rendu.

Exemples de sources de vérité prévues : `catalog.yml` et son loader typé pour les produits/prix, les DTO pour les contraintes de l’entrée HTTP, `OrderService` pour la normalisation et les totaux, et le module de configuration pour le chargement dotenv-flow. Les composants Vue consomment ces éléments ; ils ne les recodent pas.

## Contenu et assets éditables

Le contenu ne sera pas dispersé dans les composants Vue ni dans un package technique. Créer le dossier racine `contents/` comme point d’édition unique, avec une structure lisible pour une développeuse :

```text
contents/
├── catalog.yml          # produits : id, nom, description, prix, catégorie, image, disponibilité
└── site.yml             # marque, hero, textes d’interface, coordonnées, mentions de commande

apps/web/public/images/  # seules les images optimisées et publiées
```

- Le YAML est le format source éditable ; Vite le charge côté SPA et un adaptateur Bun le charge côté backend.
- `catalog.yml` nourrit à la fois l’interface et le catalogue métier serveur : prix, noms et disponibilités n’existent qu’à un seul endroit.
- `site.yml` porte le texte affiché, évitant les chaînes métier ou éditoriales codées dans les composants. Les libellés purement techniques/accessibilité peuvent rester proches du composant lorsqu’ils ne sont pas du contenu administré.
- Les emails transactionnels et messages d’erreurs API ne sont pas externalisés en YAML dans cette version : ils restent versionnés dans leurs modules backend respectifs afin de préserver leurs contrats techniques.
- Une validation de contenu est exécutée au test/build par schémas Ts.ED + AJV : IDs uniques, prix positifs, catégories valides, chemins image locaux existants et champs obligatoires. Une modification invalide échoue avant déploiement.
- Les images actuelles sont réutilisables avec autorisation. Elles seront versionnées, optimisées pour le web et référencées par chemin ; une amélioration ou variante via génération IA sera ajoutée dans une phase ultérieure, après validation humaine de chaque visuel. Aucune génération n’est incluse dans la première milestone.

## Phase préalable — Contexte agentique et documentation de framework

Avant d’écrire le code applicatif, générer les instructions et skills versionnés dans le dépôt afin que tout agent intervenant sur Cookids applique les mêmes conventions.

1. Créer un `AGENTS.md` racine, concis, couvrant : commandes Bun autorisées, structure des workspaces, règles de dépendances, sécurité des secrets, vérifications obligatoires et limites de chaque milestone.
2. Créer des skills locaux sous `.codex/skills/`, un par technologie effectivement employée : Bun/workspaces, Vue/Vite, Vercel Functions, et Ts.ED DI/Schema. Ajouter ceux de Google Sheets et Resend seulement au moment de leurs intégrations.
3. Pour chaque framework, télécharger son `llms.txt` officiel et le conserver comme référence sourcée du skill (par exemple `references/<framework>.llms.txt`), plutôt que de recopier une documentation figée dans le `SKILL.md`.
4. Écrire un `SKILL.md` court qui explique quand le skill s’applique, les conventions propres au projet et quand consulter la référence installée. Ne pas transformer les skills en copie exhaustive de la documentation officielle.
5. Vérifier chaque skill (frontmatter, noms et absence de placeholders) puis documenter dans `AGENTS.md` comment les maintenir lorsque les dépendances montent de version.

Critères d’acceptation : le dépôt contient uniquement les skills justifiés par les dépendances retenues, leurs sources officielles sont traçables, et un agent peut comprendre comment développer, tester et déployer sans deviner les conventions locales.

## Phase 0 — Socle du monorepo

1. Créer le workspace Bun `apps/web`, les packages `packages/domain` et `packages/infrastructure`, les Functions racine `api/`, plus le dossier métier racine `contents/`.
2. Ajouter les scripts racine : `dev`, `build`, `test`, et les scripts délégués des workspaces.
3. Configurer TypeScript partagé avec les alias de workspace nécessaires, sans couplage frontend/backend superflu.
4. Installer seulement les dépendances utiles à la milestone 1 : Vue, Vite, Tailwind CSS, TypeScript, `@tsed/di`, `@tsed/schema`, `@tsed/ajv`, `@tsed/json-mapper`, un parseur YAML léger et leurs prérequis de métadonnées/validation compatibles.
5. Ajouter `vercel.json`, les protections no-index (balises HTML, `robots.txt`, header `X-Robots-Tag`) et une configuration dotenv-flow.
6. Installer `dotenv-flow` dans les packages qui chargent la configuration locale et centraliser ce chargement dans un module backend. Les tests chargent explicitement l’environnement `test` ; le frontend ne reçoit que des variables préfixées `VITE_`, jamais de secrets.
7. Versionner `.env.example`, `.env.development.example`, `.env.test.example` et `.env.production.example` sans valeur secrète ; ignorer les vrais `.env`, `.env.local`, `.env.*.local` et fichiers équivalents de dotenv-flow.
8. Faire correspondre les variables Vercel aux environnements Development, Preview et Production : dotenv-flow sert au développement et aux tests locaux, tandis que Vercel injecte les valeurs réelles en hébergement.
9. Établir la structure de dossiers ci-dessus avant les premières classes : pas de `utils.ts` fourre-tout, pas de classe injectable ou de modèle partagé dans un fichier agrégateur.

Critères d’acceptation : `bun install`, `bun run build` et `bun test` sont exécutables depuis la racine ; l’environnement local est sélectionné de façon déterministe par dotenv-flow, aucun secret réel n’est versionné et aucun secret backend ne peut entrer dans le bundle Vite.

## Phase 1 — Domaine et contrat de commande

1. Définir dans `packages/domain` : `Product`, `CartItem`, `OrderItem`, `Order`, les schémas de contenu et le port de catalogue. Le catalogue partagé provient de `contents/catalog.yml`, chargé par Vite côté SPA et par l’infrastructure Bun côté backend.
2. Créer les DTO `CreateOrder` / `CreateOrderItem` avec les décorateurs Ts.ED, les désérialiser avec `@tsed/json-mapper` puis les valider avec `@tsed/ajv` : nom requis, email valide, quantités entières entre 1 et une limite explicite, panier non vide, tailles maximales des champs libres.
3. Ajouter les abstractions `OrderRepository` et `MailService` ainsi que les implémentations en mémoire Fake.
4. Implémenter `OrderService` : validation défensive complémentaire, consolidation des lignes du panier si besoin, rejet des produits inconnus, recalcul complet des montants, génération d’un identifiant `CK-YYYYMMDD-XXXX`, persistance puis confirmation.
5. Définir des erreurs métier contrôlées et leur projection HTTP : `INVALID_ORDER` (400), `UNKNOWN_PRODUCT` (400) et `ORDER_PROCESSING_FAILED` (500, sans détail interne).

Décision à tester : si l’enregistrement réussit mais que l’email échoue, retourner une erreur contrôlée et logger l’incident ; ne jamais prétendre au client que la commande a été entièrement confirmée. L’idempotence/réessai pourra être ajouté ultérieurement au niveau HTTP sans modifier le service métier.

Critères d’acceptation : tests unitaires Bun du service couvrant tous les cas du brief, sans réseau, Vercel, Google ni Resend.

## Phase 2 — Adaptateur Vercel

1. Créer `api/orders.ts` avec une Function minimale qui lit le JSON, obtient le graphe DI Ts.ED et appelle `OrderService`.
2. Centraliser le branchement Fake dans une composition root backend : la Function ne connaît pas les détails de repository/mail.
3. Sérialiser le modèle de sortie avec `@tsed/json-mapper`, transformer les exceptions connues en JSON cohérent et logguer les erreurs non prévues côté serveur.
4. Ajouter les tests de l’adaptateur nécessaires pour le statut `201`, les erreurs de validation et l’absence de fuite de détails internes.

Critères d’acceptation : une requête locale valide reçoit `201` et un récapitulatif de commande normalisé ; les données tarifaires envoyées par le client ne peuvent pas influencer le total.

## Phase 3 — SPA de commande

1. Mettre en place l’ossature Vue : `AppHeader`, hero, grille catalogue, footer et styles globaux chauds/crème.
2. Créer `useCart.ts` avec un état réactif minimal : ajout/retrait, quantité bornée, total issu du catalogue, compteur et vidage après succès. Aucun Pinia à ce stade.
3. Implémenter `ProductGrid`, `ProductCard`, `QuantitySelector`, bouton panier, drawer et lignes panier ; viser 3/2/1 colonnes desktop/tablette/mobile.
4. Implémenter `OrderForm` avec validation ergonomique, état de soumission, prévention du double-submit et affichage des erreurs API.
5. Implémenter `OrderSuccess` avec identifiant et récapitulatif retournés par le serveur, puis vider le panier uniquement après réponse `201`.
6. Garantir les fondamentaux a11y : labels associés, focus visible, navigation clavier du drawer, contrastes, zones tactiles et annonces de statut.

Critères d’acceptation : le parcours catalogue → panier → formulaire → succès fonctionne sur mobile et desktop, avec états loading/error/success explicites.

## Phase 4 — Vérification de la milestone 1

1. Écrire/compléter les tests du domaine : commande valide, total, plusieurs produits, produit inconnu, quantité zéro/négative/trop élevée, panier vide, email invalide, format d’ID, appels repository/mail et propagation des échecs.
2. Lancer `bun test` et `bun run build` à la racine.
3. Vérifier manuellement le parcours en développement, le responsive et les en-têtes no-index.
4. Documenter le démarrage local et le fonctionnement Fake dans le README.

Sortie : une preview Vercel peut être déployée sans dépendance Google/Resend, avec une commande confirmée de manière simulée.

## Phase 5 — Intégrations après stabilisation

### Google Sheets

1. Ajouter `GoogleSheetsOrderRepository` dans l’infrastructure backend seulement.
2. Utiliser un service account et les variables `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`.
3. Écrire une ligne dans `Orders` et une par article dans `OrderItems` ; tester sur une feuille de test dédiée.
4. Remplacer le binding Fake par le binding Google uniquement dans l’environnement configuré.

### Resend

1. Ajouter `ResendMailService` avec `RESEND_API_KEY`, `RESEND_FROM` et éventuellement `ORDER_NOTIFICATION_EMAIL`.
2. Générer un email transactionnel lisible depuis le modèle `Order` normalisé.
3. Tester l’envoi vers une adresse de test, puis le basculement de configuration.

## Phase 6 — Contenu, design et livraison production

1. Inventorier le site de référence : produits, descriptions, prix, conditions de commande, coordonnées, textes et photos réutilisables.
2. Renseigner `catalog.yml` et `site.yml`, puis placer les photos optimisées (`webp`) dans `apps/web/public/images` ; supprimer les données d’exemple.
3. Affiner la direction artistique pâtisserie/fait maison et les micro-animations, sans nuire aux performances.
4. Configurer les secrets Vercel, preview puis production ; vérifier les logs Function et la non-indexation effective.
5. Effectuer une recette : commande réelle, écriture Sheets, email client, email organisateur, erreurs et affichage mobile.
6. Créer le dépôt GitHub et le projet Vercel, puis les connecter. Définir `main` comme branche de production : chaque push fusionné sur `main` déclenche automatiquement le build puis le déploiement production. Les autres branches et pull requests reçoivent une Preview Deployment isolée.
7. Protéger `main` dans GitHub : pull request obligatoire, vérifications `bun test` et `bun run build` requises avant merge. Les variables de production sont limitées à Vercel Production ; les valeurs de test/preview sont définies dans leurs environnements Vercel respectifs.

Critères d’acceptation : un commit intégré à `main` est automatiquement publié sur le domaine de production Vercel après succès du build ; aucune publication production ne dépend d’une commande manuelle locale.

## Points à décider avant les intégrations réelles

- Liste finale des produits, prix, disponibilité et limite de quantité par produit/commande.
- Nom et adresse d’expéditeur Resend vérifiés, plus l’adresse de notification organisateur.
- Structure du Google Sheet cible et partage avec le compte de service.
- Texte légal/confidentialité adapté puisque nom, email et téléphone sont collectés.
- L’inventaire définitif des produits, prix et textes du site existant avant import dans les YAML. Les images sont autorisées à la réutilisation.
