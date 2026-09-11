# Plan d’implémentation — Cookids

## Décision de cadrage

Le site Cookids reste une SPA Vue servie par Vercel. À chaque commande valide, l’API `POST /api/orders` calcule le panier côté serveur puis crée une issue dans le dépôt dédié [coo-kids/cookids-commands](https://github.com/coo-kids/cookids-commands). Cette issue devient la source de vérité opérationnelle : elle est affectée à `syline`, ajoutée au projet GitHub « Commands tracking », typée « Commands » et placée dans « Commande en attente de validation ».

Le navigateur ne transmet jamais un prix, un total, un libellé produit ou une configuration GitHub. Il transmet les coordonnées, le lieu, la date souhaitée et les lignes `{ productId, quantity }`. `OrderService` résout les produits, recalcule le total et applique les règles de livraison avant toute écriture distante. Le numéro GitHub de l’issue créée (`issue.number`) est la référence de suivi communiquée au client ; l’identifiant interne `CK-…` peut rester technique mais n’est pas la référence client.

Google Sheets sort du périmètre de cette livraison. GitHub est le suivi opérationnel et Gmail SMTP est le canal des emails transactionnels : confirmation après création réussie, puis notifications d’étape dans une phase ultérieure. Les ports `OrderRepository` et `MailService` sont conservés afin d’isoler le domaine de GitHub et Gmail, et de rendre les tests unitaires déterministes.

## État constaté de l’implémentation (11 septembre 2026)

Les éléments suivants sont effectivement réalisés dans le dépôt.

- [x] SPA Vue avec catalogue, panier, tunnel de commande, états de soumission et écran de succès.
- [x] Function `POST /api/orders`, DTO Ts.ED, calcul serveur des produits/prix/totaux et réponse `201` ; les totaux sont exprimés en euros (`total`).
- [x] Ports `OrderRepository` et `MailService`, ainsi que leurs doubles `FakeOrderRepository` et `FakeMailService` pour les tests.
- [x] Chargement et validation des contenus `catalog.yml` et `site.yml` côté frontend et backend.
- [x] Tests unitaires co-localisés pour le domaine, l’infrastructure, la Function et les composables déjà présents.
- [x] Nouveaux champs `firstName`, `lastName`, `phoneNumber`, `deliveryLocation` et `targetDeliveryDate` dans le DTO, les modèles, l’API et le formulaire ; les anciens champs `name`, `phone` et `comment` ne sont plus utilisés pour les commandes.
- [x] Repository GitHub, projet « Commands tracking », numéro d’issue de suivi et client GitHub configuré.
- [x] `GmailMailService` réel et email de confirmation contenant le numéro d’issue.
- [x] Vérifications de la base : le 11 septembre 2026, la suite de tests, le contrôle de types et le build passent. Le build signale seulement un avertissement non bloquant pour un bundle JavaScript supérieur à 500 kB.

## Architecture cible

```text
apps/web (Vue + Vite)
  └── POST /api/orders ── api/orders.ts (adaptateur Vercel)
                              └── OrderService (domaine)
                                  ├── CatalogProvider ← contents/catalog.yml
                                  ├── DeliveryConfiguration ← contents/site.yml
                                  └── OrderRepository ← GitHubOrderRepository
                                  ├── MailService ← GmailMailService
                                  └── issue cookids-commands → récupère `issue.number`
                                        └── projet « Commands tracking » → email Gmail de confirmation
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

| Champ API / domaine                           | Obligatoire       | Destination GitHub                                |
|-----------------------------------------------|-------------------|---------------------------------------------------|
| `lastName`                                    | non               | champ « Last name »                               |
| `firstName`                                   | oui               | champ « First name »                              |
| `email`                                       | oui, email valide | champ « Email »                                   |
| `phoneNumber`                                 | non               | champ « Phone number »                            |
| `deliveryLocation`                            | oui               | champ « Location delivery »                       |
| `targetDeliveryDate`                          | à confirmer       | champ date « Target date »                        |
| `items`                                       | oui, non vide     | description Markdown                              |
| `totalPrice` calculé (`EUR`, non en centimes) | —                 | champ « Total price »                             |
| `githubIssueNumber` généré par GitHub         | —                 | référence de suivi dans la réponse API et l’email |

Les noms entre guillemets sont les noms visibles sur le projet d’après la configuration fournie ; leur résolution technique se fait par ID GitHub, jamais par saisie navigateur. `totalPrice` est un nombre en euros, de devise fixe `EUR`, sans conversion en centimes, et est envoyé une seule fois au format monétaire attendu par « Total price ». Les rendus GitHub et Gmail utilisent le format français (`fr-FR`, `EUR`).

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

Le schéma `SiteContentSchema` valide des identifiants uniques, des libellés, des dates ISO valides et l’absence de dates dupliquées. Le frontend consomme la même configuration pour sa liste déroulante et ses dates proposées ; le backend la relit via un provider Node.js typé et refuse toute valeur hors configuration.

Règle métier : pour `rosa-parks` et `saint-lazare`, la date saisie doit appartenir à `fixedDeliveryDates`. Le plan prévoit un `InvalidTargetDeliveryDateError` traduit en `400 INVALID_TARGET_DELIVERY_DATE`. Pour tous les autres lieux, la date reste libre et est sélectionnée au moyen d’un datepicker.

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

- [x] Remplacer les anciens champs `name` et `phone` par `firstName`, `lastName` et `phoneNumber` dans les DTO, modèles, réponses API et tests. Le champ libre `comment` a été retiré ; le total est calculé côté serveur en euros.
- [x] Ajouter `deliveryLocation` (identifiant de configuration) et `targetDeliveryDate` au DTO et au modèle. Les entrées sont validées par `@tsed/ajv` puis désérialisées par `@tsed/json-mapper` avec `useAlias: false`.
- [x] Charger les lieux et dates fixes depuis la configuration éditable, côté Vite et via un provider Node.js backend typé.
- [x] Faire dépendre `OrderService` de la configuration de livraison : il rejette les lieux inconnus, les dates non autorisées et les produits inconnus, et recalcule les montants.
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

| Produit         | Quantité | Prix unitaire | Sous-total |
|-----------------|---------:|--------------:|-----------:|
| Cookie chocolat |        2 |        3,50 € |     7,00 € |

**Total : 7,00 €**
```

Critères d’acceptation : avec un dépôt/projet de test, une commande crée une unique issue affectée à `syline`, de type « Commands », liée à « Commands tracking », avec tous les champs attendus, le statut initial et un corps Markdown conforme. Les tests unitaires emploient un faux client GitHub ; un test d’intégration protégé par variables d’environnement est exécuté uniquement contre le projet de test.

## Phase 2 bis — Confirmation et suivi email via Gmail SMTP

- [x] Conserver le port `MailService`, son contrat `sendOrderConfirmation(order)` et un double de test.
- [x] Créer `GmailMailService` dans l’infrastructure backend. Son unique responsabilité initiale est `sendOrderConfirmation(order)`.
- [ ] Après la persistance GitHub réussie et la récupération de `issue.number`, `OrderService` déclenche l’email de confirmation vers l’adresse normalisée du client. L’email comprend explicitement le numéro GitHub de suivi, le récapitulatif Markdown/HTML du panier, le total calculé et les informations de livraison utiles ; il ne contient aucun autre identifiant GitHub interne.
- [ ] Configurer `GMAIL_USER` et `GMAIL_APP_PASSWORD` dans Vercel. `GMAIL_APP_PASSWORD` est un mot de passe d'application Gmail créé après activation de la validation en deux étapes ; aucun domaine personnalisé n'est requis. Ajouter les clés fictives correspondantes dans `.env.example`, sans secret.
- [ ] Tester le rendu, le destinataire et les erreurs avec un double `MailService`, puis réaliser un test d’intégration vers une adresse de test autorisée.
- [ ] Feature ultérieure — Déclencher les emails d’étape depuis les changements de statut GitHub. Elle nécessitera un webhook GitHub vérifié, une correspondance statut → modèle Gmail et une stratégie d’idempotence afin de ne jamais envoyer deux fois le même message.

Règle de cohérence initiale : formulaire valide → issue GitHub créée et configurée → récupération de `issue.number` → tentative d’envoi Gmail. Si l’email échoue après la création GitHub, l’API conserve la commande et la confirme au client ; l’incident est journalisé sans donnée personnelle. La reprise manuelle ou automatisée de l’envoi est une étape distincte à décider.

Critères d’acceptation : aucune tentative de confirmation n’est envoyée sans issue GitHub créée ; une commande complète entraîne une seule tentative Gmail avec le numéro GitHub exact et le total serveur exact ; une erreur Gmail ne bloque pas le tunnel de commande et ne divulgue pas de détail technique au client.

## Phase 3 — Adaptateur Vercel et interface

- [x] Brancher `GitHubOrderRepository` et `GmailMailService` dans `packages/infrastructure/config/index.ts` pour les environnements configurés. Garder des doubles uniquement pour les tests isolés, jamais comme comportement de production.
- [x] Adapter l’API de commande pour sérialiser la commande normalisée, avec le numéro d’issue GitHub comme référence et sans donnée GitHub interne.
- [x] Mettre à jour `OrderForm` : prénom requis, nom/téléphone facultatifs, email requis, liste déroulante de lieux et sélection de date adaptée au lieu ; le backend reste l’autorité.
- [x] Conserver le panier, l’état de soumission, la prévention du double-submit, l’accessibilité et le vidage du panier uniquement après `201`.

Critères d’acceptation : le parcours catalogue → panier → coordonnées/livraison → succès crée exactement une issue GitHub complète. Une requête invalide retourne une erreur exploitable et aucun ticket partiellement configuré n’est considéré comme une commande confirmée.

## Phase 3 bis — Boîtes de cookies (issue #5)

- [x] Définir le conditionnement dans la source unique `contents/catalog.yml` : la quantité représente un nombre de boîtes, chaque boîte contient 12 cookies, coûte 12,00 € et porte le libellé « la boîte de 12 ».
- [x] Conserver les financiers comme produit distinct vendu par lots de 10 ; aucune règle de quantité transversale n’est appliquée.
- [x] Propager le libellé d’unité résolu au serveur dans le panier, les récapitulatifs, l’email de confirmation et le corps Markdown de l’issue GitHub.
- [x] Couvrir le calcul des boîtes, la sérialisation de l’unité et les rendus GitHub et Gmail associés.

## Phase 4 — Vérification et livraison

- [ ] Compléter les tests de schémas Ts.ED (`compile(...).toMatchInlineSnapshot()`), du domaine, du formateur Markdown, du repository GitHub simulé, du mailer Gmail simulé et de la Function.
- [x] Lancer `pnpm run test` puis `pnpm run build` à la racine.
- [ ] Faire une recette sur un projet GitHub de test et une adresse Gmail de test : permissions du token, assignee, type, projet, statut, valeurs des champs, total monétaire, description, destinataire et absence de données sensibles dans les logs.
- [ ] Configurer les secrets Vercel pour Development, Preview et Production ; vérifier que le token GitHub et le mot de passe d'application Gmail ne sont jamais exposés dans le bundle Vite.
- [ ] Mettre à jour le README : démarrage local, variables requises, création du projet GitHub de test et procédure de rotation du token.

## Décisions à confirmer avant implémentation

- `targetDeliveryDate` est-il obligatoire pour tous les lieux ? Si non, pour lesquels et quelle valeur doit être envoyée au champ GitHub lorsqu’il est absent ?
- [x] Pour les lieux autres que Rosa Parks et Saint-Lazare : la date est libre et sélectionnée avec un datepicker.
- La liste complète des lieux doit-elle être définie immédiatement dans `site.yml` ? Quels sont leurs identifiants et libellés exacts ?
- Le champ libre historique « Un mot pour Syline ? » doit-il être supprimé, conservé dans l’issue, ou déplacé dans un champ GitHub ?
- Confirmez-vous les noms exacts des champs GitHub visibles (« First name », « Last name », « Location delivery », etc.), le nom exact de l’option de statut et le format souhaité du titre d’issue ?
- Le projet « Commands tracking » est-il un GitHub Project d’organisation `coo-kids` et acceptez-vous un GitHub App/jeton finement restreint dédié à son écriture ?
- Quelle adresse Gmail d’expédition est validée, et quel contenu exact doit figurer dans l’email de confirmation ?
- [ ] Feature ultérieure — Définir les statuts GitHub qui déclenchent les emails d’étape, leurs modèles Gmail et leur stratégie d’idempotence.
- [ ] Ajouter les textes confidentialité/RGPD : finalité de collecte, durée de conservation, droits de la personne, contact et lien vers la politique applicable avant la soumission du formulaire.
