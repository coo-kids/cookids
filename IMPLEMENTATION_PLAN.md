# Plan d’implémentation — Cookids

## Décision de cadrage

Le site Cookids reste une SPA Vue servie par Vercel. À chaque commande valide, l’API `POST /api/orders` calcule le panier côté serveur puis crée une issue dans le dépôt dédié [coo-kids/cookids-commands](https://github.com/coo-kids/cookids-commands). Cette issue devient la source de vérité opérationnelle : elle est affectée à `syline`, ajoutée au projet GitHub « Commands tracking », typée « Commands » et placée dans « Commande en attente de validation ».

Le navigateur ne transmet jamais un prix, un total, un libellé produit ou une configuration GitHub. Il transmet les coordonnées, le lieu, la date souhaitée et les lignes `{ productId, quantity }`. `OrderService` résout les produits, recalcule le total et applique les règles de livraison avant toute écriture distante. Le numéro GitHub de l’issue créée (`issue.number`) est la référence de suivi communiquée au client ; l’identifiant interne `CK-…` peut rester technique mais n’est pas la référence client.

Google Sheets sort du périmètre de cette livraison. GitHub est le suivi opérationnel et Resend reste le canal des emails transactionnels : confirmation après création réussie, puis notifications d’étape dans une phase ultérieure. Les ports `OrderRepository` et `MailService` sont conservés afin d’isoler le domaine de GitHub et Resend, et de rendre les tests unitaires déterministes.

## État constaté de l’implémentation (9 septembre 2026)

Les éléments suivants existent déjà et constituent la base à faire évoluer ; ils ne couvrent pas encore le suivi GitHub ni les nouvelles informations de livraison.

- [x] SPA Vue avec catalogue, panier, tunnel de commande, états de soumission et écran de succès.
- [x] Function `POST /api/orders`, DTO Ts.ED, calcul serveur des produits/prix/totaux et réponse `201` ; l’implémentation actuelle utilise encore des montants internes `totalCents`.
- [x] Ports `OrderRepository` et `MailService`, ainsi que leurs doubles `FakeOrderRepository` et `FakeMailService` pour les tests.
- [x] Chargement et validation des contenus `catalog.yml` et `site.yml` côté frontend et backend.
- [x] Tests unitaires co-localisés pour le domaine, l’infrastructure, la Function et les composables déjà présents.
- [ ] Nouveaux champs `firstName`, `lastName`, `phoneNumber`, `deliveryLocation` et `targetDeliveryDate` : le code utilise encore `name`, `phone` et `comment`.
- [ ] Repository GitHub, projet « Commands tracking », numéro d’issue de suivi et client GitHub configuré.
- [ ] `ResendMailService` réel et email de confirmation contenant le numéro d’issue.
- [x] Vérifications de la base : le 9 septembre 2026, `bun run test` passe (21 fichiers, 32 tests) et `bun run build` passe. Le build signale seulement un avertissement non bloquant pour un bundle JavaScript supérieur à 500 kB.

## Architecture cible

```text
apps/web (Vue + Vite)
  └── POST /api/orders ── api/orders.ts (adaptateur Vercel)
                              └── OrderService (domaine)
                                  ├── CatalogProvider ← contents/catalog.yml
                                  ├── DeliveryConfiguration ← contents/site.yml
                                  └── OrderRepository ← GitHubOrderRepository
                                  ├── MailService ← ResendMailService
                                  └── issue cookids-commands → récupère `issue.number`
                                        └── projet « Commands tracking » → email Resend de confirmation
```

Principes non négociables :

- le calcul des prix, le total, les libellés du panier et la validation de la date sont exclusivement côté serveur ;
- `api/orders.ts` reste un adaptateur HTTP fin ; `OrderService` orchestre le métier et `GitHubOrderRepository` persiste une commande déjà normalisée ;
- le domaine ne dépend ni de Vercel ni de GitHub ;
- le token GitHub et les identifiants techniques sont des secrets Vercel, jamais des variables `VITE_` ;
- `contents/catalog.yml` et `contents/site.yml` restent les sources éditables uniques ; aucun lieu ou créneau ne doit être dupliqué dans un composant ou dans l’adaptateur GitHub ;
- chaque classe injectable, modèle, DTO, erreur métier et adaptateur réutilisable possède son fichier propre ;
- les exceptions contrôlées sont traduites en JSON public par `defineHandler` ; les services ne construisent pas de `Response`.

## Données de commande et règles de livraison

### Entrée HTTP et modèle métier

Faire évoluer `CreateOrder`, `OrderCustomer` et `Order` autour des champs suivants :

| Champ API / domaine | Obligatoire | Destination GitHub |
| --- | --- | --- |
| `lastName` | non | champ « Last name » |
| `firstName` | oui | champ « First name » |
| `email` | oui, email valide | champ « Email » |
| `phoneNumber` | non | champ « Phone number » |
| `deliveryLocation` | oui | champ « Location delivery » |
| `targetDeliveryDate` | à confirmer | champ date « Target date » |
| `items` | oui, non vide | description Markdown |
| `totalPrice` calculé (`EUR`, non en centimes) | — | champ « Total price » |
| `githubIssueNumber` généré par GitHub | — | référence de suivi dans la réponse API et l’email |

Les noms entre guillemets sont les noms visibles sur le projet d’après la configuration fournie ; leur résolution technique se fait par ID GitHub, jamais par saisie navigateur. `totalPrice` est un nombre en euros, de devise fixe `EUR`, sans conversion en centimes, et est envoyé une seule fois au format monétaire attendu par « Total price ». Les rendus GitHub et Resend utilisent le format français (`fr-FR`, `EUR`).

`contents/site.yml` devient la source de vérité de :

```yaml
deliveryLocations:
  - id: rosa-parks
    label: Rosa Parks
    fixedDeliveryDates: [] # dates ISO YYYY-MM-DD éditables à renseigner
  - id: saint-lazare
    label: Saint-Lazare
    fixedDeliveryDates: []
```

Le schéma `SiteContentSchema` valide des identifiants uniques, des libellés, des dates ISO valides et l’absence de dates dupliquées. Le frontend consomme la même configuration pour sa liste déroulante et ses dates proposées ; le backend la relit via un provider Bun typé et refuse toute valeur hors configuration.

Règle métier : pour `rosa-parks` et `saint-lazare`, la date saisie doit appartenir à `fixedDeliveryDates`. Le plan prévoit un `InvalidTargetDeliveryDateError` traduit en `400 INVALID_TARGET_DELIVERY_DATE`. Le comportement pour les autres lieux reste à confirmer avant implémentation.

## Convention de placement

```text
packages/domain/src/
├── dto/CreateOrder.ts
├── dto/CreateOrderItem.ts
├── errors/InvalidTargetDeliveryDateError.ts
├── errors/OrderValidationError.ts
├── models/Order.ts
├── models/OrderCustomer.ts
├── repositories/OrderRepository.ts
├── services/OrderService.ts
└── utils/

packages/infrastructure/src/
├── config/GitHubOrderRepositorySettings.ts
├── content/BunSiteContentProvider.ts
├── github/GitHubClient.ts
├── github/GitHubProjectMetadataResolver.ts
├── github/formatOrderIssueBody.ts
└── repositories/GitHubOrderRepository.ts

api/
├── orders.ts
└── orders.test.ts
```

Un seul module formate le corps Markdown de l’issue afin que les tests verrouillent le rendu envoyé à GitHub.

## Phase 1 — Contrat, contenu et domaine

- [ ] Remplacer les anciens champs `name` et `phone` par `firstName`, `lastName` et `phoneNumber` dans les DTO, modèles, réponses API et tests. Remplacer aussi `totalCents` par `totalPrice` (`EUR`, non en centimes). Décider explicitement du devenir du champ libre `comment`, absent du nouveau brief.
- [ ] Ajouter `deliveryLocation` (identifiant de configuration) et `targetDeliveryDate` au DTO et au modèle. Désérialiser avec `@tsed/json-mapper`, puis valider avec `@tsed/ajv` : prénom, email, longueurs maximales, panier non vide et quantités entières bornées.
- [ ] Étendre `site.yml` et `SiteContentSchema` avec les lieux et dates fixes ; les charger côté Vite et via un provider Bun backend typé.
- [ ] Faire dépendre `OrderService` de la configuration de livraison. Il rejette les lieux inconnus et les dates non autorisées, consolide les lignes si nécessaire, refuse les produits inconnus et recalcule complètement les montants.
- [x] Conserver `OrderRepository.save(order)` comme frontière de persistance et `MailService.sendOrderConfirmation(order)` comme frontière de messagerie. Des doubles existent déjà pour les tests isolés.
- [ ] Ajouter les erreurs contrôlées : `INVALID_ORDER` (400), `UNKNOWN_PRODUCT` (400), `INVALID_DELIVERY_LOCATION` (400), `INVALID_TARGET_DELIVERY_DATE` (400), `ORDER_PROCESSING_FAILED` (500 sans détail interne) et, si nécessaire, `ORDER_CONFIRMATION_FAILED` (500 sans détail interne).

Critères d’acceptation : les tests du domaine couvrent la normalisation des coordonnées, les lieux inconnus, chaque date fixe invalide/valide, les produits inconnus, les quantités invalides et l’impossibilité d’influencer le prix depuis le navigateur.

## Phase 2 — Repository GitHub et sécurité

- [ ] Créer `GitHubOrderRepository`, implémentation de `OrderRepository`, fondée sur l’API GitHub (client officiel ou appels HTTP encapsulés). Elle reçoit seulement un `Order` normalisé et retourne la référence créée, dont `githubIssueNumber`.
- [ ] Créer l’issue dans `coo-kids/cookids-commands` avec un titre déterministe, par défaut `Commande <id> — <firstName> <lastName>` (à valider), l’assignee `syline`, le type « Commands » et le corps Markdown ci-dessous.
- [ ] Ajouter l’issue au projet « Commands tracking », puis définir : « First name », « Last name », « Email », « Phone number », « Location delivery », « Target date », « Total price » et le statut « Commande en attente de validation ». Les node IDs du projet, des champs, des options et du type sont résolus au démarrage/déploiement et validés explicitement ; aucune valeur magique n’est mise dans le code métier.
- [ ] Centraliser `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_COMMANDS_REPOSITORY`, `GITHUB_COMMANDS_PROJECT_ID`, ainsi que les ID de champ/type/option si ces derniers sont configurés. Fournir seulement des valeurs fictives dans `.env.example`.
- [ ] Créer un GitHub App ou fine-grained PAT dédié, limité au dépôt `cookids-commands` et au projet d’organisation nécessaire, avec les droits minimaux de création d’issues, affectation, lecture/écriture du projet et modification de ses champs. Le stocker seulement dans Vercel (Development, Preview, Production).
- [ ] En cas d’échec GitHub, ne pas confirmer la commande au client : logger sans données personnelles ni token, retourner `500 ORDER_PROCESSING_FAILED`. Préparer le repository pour accepter ultérieurement une clé d’idempotence HTTP ; ne pas créer de retry automatique ici.

Le corps d’issue est rendu exclusivement en Markdown et inclut les lignes du panier et le total calculé :

```md
## Commande CK-YYYYMMDD-XXXX

| Produit | Quantité | Prix unitaire | Sous-total |
| --- | ---: | ---: | ---: |
| Cookie chocolat | 2 | 3,50 € | 7,00 € |

**Total : 7,00 €**
```

Critères d’acceptation : avec un dépôt/projet de test, une commande crée une unique issue affectée à `syline`, de type « Commands », liée à « Commands tracking », avec tous les champs attendus, le statut initial et un corps Markdown conforme. Les tests unitaires emploient un faux client GitHub ; un test d’intégration protégé par variables d’environnement est exécuté uniquement contre le projet de test.

## Phase 2 bis — Confirmation et suivi email via Resend

- [x] Conserver le port `MailService`, son contrat `sendOrderConfirmation(order)` et un double de test.
- [ ] Créer `ResendMailService` dans l’infrastructure backend. Son unique responsabilité initiale est `sendOrderConfirmation(order)`.
- [ ] Après la persistance GitHub réussie et la récupération de `issue.number`, `OrderService` déclenche l’email de confirmation vers l’adresse normalisée du client. L’email comprend explicitement le numéro GitHub de suivi, le récapitulatif Markdown/HTML du panier, le total calculé et les informations de livraison utiles ; il ne contient aucun autre identifiant GitHub interne.
- [ ] Configurer `RESEND_API_KEY` et `RESEND_FROM` dans Vercel, avec une adresse d’expéditeur/domaine vérifié. Ajouter les clés fictives correspondantes dans `.env.example`, sans secret.
- [ ] Tester le rendu, le destinataire et les erreurs avec un double `MailService`, puis réaliser un test d’intégration vers une adresse de test autorisée.
- [ ] Préparer, sans l’implémenter dans cette livraison, le déclenchement d’emails d’étape depuis les changements de statut GitHub. Cette évolution nécessitera un webhook GitHub vérifié, une correspondance statut → modèle Resend et une stratégie d’idempotence afin de ne jamais envoyer deux fois le même message.

Règle de cohérence initiale : formulaire valide → issue GitHub créée et configurée → récupération de `issue.number` → envoi Resend. Si l’email échoue après la création GitHub, l’API retourne une erreur contrôlée et journalise l’incident sans donnée personnelle ; elle ne prétend pas au client que la confirmation a été délivrée. La reprise manuelle ou automatisée de l’envoi est une étape distincte à décider.

Critères d’acceptation : aucune confirmation n’est envoyée sans issue GitHub créée ; une commande complète entraîne une seule confirmation Resend avec le numéro GitHub exact et le total serveur exact ; les erreurs Resend ne divulguent pas de détail technique au client.

## Phase 3 — Adaptateur Vercel et interface

- [ ] Brancher `GitHubOrderRepository` et `ResendMailService` dans `packages/infrastructure/config/index.ts` pour les environnements configurés. Garder des doubles uniquement pour les tests isolés, jamais comme comportement de production.
- [ ] Adapter `api/orders.ts` pour sérialiser la commande normalisée, avec `githubIssueNumber` comme référence de suivi, et projeter toutes les erreurs contrôlées. La réponse `201` ne contient pas de node ID, URL privée, token ou autre donnée GitHub interne.
- [ ] Mettre à jour `OrderForm` : prénom requis, nom/téléphone facultatifs, email requis, liste déroulante alimentée par `site.yml` et sélection de date adaptée au lieu. Afficher une erreur utile avant envoi lorsque la date n’est pas sélectionnable ; le backend reste l’autorité.
- [x] Conserver le panier, l’état de soumission, la prévention du double-submit, l’accessibilité et le vidage du panier uniquement après `201`.

Critères d’acceptation : le parcours catalogue → panier → coordonnées/livraison → succès crée exactement une issue GitHub complète. Une requête invalide retourne une erreur exploitable et aucun ticket partiellement configuré n’est considéré comme une commande confirmée.

## Phase 4 — Vérification et livraison

- [ ] Compléter les tests de schémas Ts.ED (`compile(...).toMatchInlineSnapshot()`), du domaine, du formateur Markdown, du repository GitHub simulé, du mailer Resend simulé et de la Function.
- [x] Lancer `bun run test` puis `bun run build` à la racine.
- [ ] Faire une recette sur un projet GitHub de test et une adresse Resend de test : permissions du token, assignee, type, projet, statut, valeurs des champs, total monétaire, description, destinataire et absence de données sensibles dans les logs.
- [ ] Configurer les secrets Vercel pour Development, Preview et Production ; vérifier que le token GitHub et la clé Resend ne sont jamais exposés dans le bundle Vite.
- [ ] Mettre à jour le README : démarrage local, variables requises, création du projet GitHub de test et procédure de rotation du token.

## Décisions à confirmer avant implémentation

- `targetDeliveryDate` est-il obligatoire pour tous les lieux ? Si non, pour lesquels et quelle valeur doit être envoyée au champ GitHub lorsqu’il est absent ?
- Pour les lieux autres que Rosa Parks et Saint-Lazare : la date est-elle libre, facultative, ou encadrée par une autre règle ?
- La liste complète des lieux doit-elle être définie immédiatement dans `site.yml` ? Quels sont leurs identifiants et libellés exacts ?
- Le champ libre historique « Un mot pour Syline ? » doit-il être supprimé, conservé dans l’issue, ou déplacé dans un champ GitHub ?
- Confirmez-vous les noms exacts des champs GitHub visibles (« First name », « Last name », « Location delivery », etc.), le nom exact de l’option de statut et le format souhaité du titre d’issue ?
- Le projet « Commands tracking » est-il un GitHub Project d’organisation `coo-kids` et acceptez-vous un GitHub App/jeton finement restreint dédié à son écriture ?
- Quelle adresse/domaine d’expédition Resend est validé, et quel contenu exact doit figurer dans l’email de confirmation ?
- Les emails d’étape doivent-ils être déclenchés automatiquement dès la première version, et quels statuts GitHub doivent envoyer quel message ?
