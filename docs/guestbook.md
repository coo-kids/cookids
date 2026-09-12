# Livre d’or

Page `/livre-d-or`. Le serveur utilise `GITHUB_TOKEN` (jamais le navigateur).
Ce token doit avoir accès au dépôt privé `coo-kids/cookids-guest-books`, avec la permission Issues en lecture/écriture. Aucun accès aux Projects n’est nécessaire.

Configuration : `contents/guestbook.yml`. Les nouvelles issues sont du type Comments et ne sont pas publiées automatiquement. Pour approuver un avis, ajouter le label `avis-publie` à son issue. Retirer ce label pour le masquer. Seules les issues du type configuré, avec ce label et un corps au format attendu sont affichées, ouvertes ou fermées. La signature est alignée à droite sur le site ; GitHub ne garantit pas cet alignement Markdown.

Le cache mémoire expire après cinq minutes, par instance serveur. Une modification de modération peut donc rester visible jusqu’à cinq minutes ; un redémarrage vide le cache. Les pages GitHub sont toutes parcourues. Les erreurs ne sont pas mises en cache.

Protection : validation côté serveur, limites de taille, contrôle d’origine, honeypot, échappement HTML/Markdown et mentions GitHub, rendu Vue en texte uniquement. Limitation complémentaire d’une soumission par minute et par instance serveur (globale à ses visiteurs). Ce n’est pas une protection distribuée contre le spam : envisager Vercel Firewall ou un CAPTCHA si nécessaire.

Vérification après déploiement : envoyer un avis, vérifier son type et l’absence de label, puis approuver et attendre cinq minutes avant de recharger. Les tests locaux utilisent un faux dépôt : aucune issue réelle n’est créée. Si le token manque ou n’a pas les droits, la page affiche une erreur générique sans exposer de secret ; le parcours commande reste indépendant.
