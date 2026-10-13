# Bloom — service de recherche optionnel

Le site Bloom reste hébergé sur GitHub Pages. Ce petit **Cloudflare Worker** interroge Open Food Facts côté serveur afin d'éviter les problèmes CORS de Safari. Il accepte uniquement les recherches de produits. Il ne reçoit jamais le profil, le journal, le poids ou les macros de l'utilisateur.

## Mise en ligne

1. Crée un compte sur [Cloudflare](https://dash.cloudflare.com/sign-up) ou connecte-toi.
2. Ouvre **Workers & Pages → Create → Worker** et crée un Worker nommé `bloom-food-search`.
3. Ouvre **Edit code**, remplace le code de démonstration par celui de [search-worker.js](./search-worker.js).
4. Clique sur **Deploy**.
5. Teste `https://TON-WORKER.workers.dev/health` : la réponse doit contenir `"status":"ok"`.
6. Copie l'URL `https://TON-WORKER.workers.dev` puis donne-la dans notre conversation ChatGPT pour que nous puissions la configurer dans Bloom.

Cette connexion est facultative : les fonctions locales de Bloom restent accessibles sans elle.

## Fonctionnement

- `GET /search?q=skyr&mode=suggest` : suggestions, Search-a-licious uniquement.
- `GET /search?q=skyr&mode=search` : recherche explicite ; la recherche historique est utilisée uniquement en secours.
- Mise en cache des recherches 15 minutes sur Cloudflare, pour limiter les requêtes à Open Food Facts.
- Origine autorisée : `https://raphoubal-dot.github.io`.
- Aucune clé API, aucun compte utilisateur, aucune donnée personnelle envoyée à Open Food Facts hormis le nom du produit recherché.

Open Food Facts impose des limites de requêtes et peut être indisponible. Ne considérez pas les informations nutritionnelles collaboratives comme vérifiées sans contrôle de l'étiquette.
