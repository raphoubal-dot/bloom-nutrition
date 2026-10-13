# Bloom 🌸 — relais de recherche Open Food Facts

**Pourquoi ?** Safari peut bloquer les requêtes directes vers Open Food Facts (CORS). Le site Bloom reste hébergé sur GitHub Pages ; ce Cloudflare Worker fournit une passerelle HTTPS pour la recherche de produits.

Le relais ne reçoit que les **mots recherchés**, jamais le profil, le poids, le journal ni les recettes. Aucune clé API personnelle ne doit être placée dans le code.

## Installation depuis GitHub (sans Mac)

1. Connecte-toi à [Cloudflare](https://dash.cloudflare.com/) et ouvre **Workers & Pages**.
2. Choisis **Create application** puis **Import a repository**.
3. Connecte ton compte GitHub et sélectionne **`raphoubal-dot/bloom-nutrition`**.
4. Dans la configuration du Worker, choisis comme **Root directory : `search-service`**, et la branche **`main`**.
5. Vérifie la commande de déploiement **`npx wrangler deploy`**. La configuration [`wrangler.toml`](./wrangler.toml) définit le fichier JavaScript à déployer.
6. Sélectionne **Save and Deploy**. Après publication, Cloudflare affichera une adresse HTTPS terminant par `workers.dev`.
7. Teste cette adresse avec `/health` ajouté à la fin : le texte doit contenir `"status":"ok"`.
8. Dans Bloom, ouvre **Réglages → Recherche Open Food Facts**, colle l'adresse du Worker (sans `/health`) et appuie sur **Enregistrer l'adresse → Tester la connexion**.

Si Cloudflare demande un site web « Pages » plutôt qu'un Worker, reviens en arrière et sélectionne la création d'un **Worker**.

## Routes

- `GET /health` : diagnostic.
- `GET /search?q=skyr&mode=suggest` : suggestions, Search-a-licious uniquement.
- `GET /search?q=skyr&mode=search` : recherche explicite, avec service historique en secours.

La mise en cache côté Cloudflare réduit les requêtes répétées. Les API d'Open Food Facts ont des limites et peuvent être temporairement indisponibles. Le relais améliore les problèmes de navigateur, mais ne garantit pas la disponibilité d'Open Food Facts.

Ce dossier ne remplace pas l'application principale dans `index.html`. Les données privées restent uniquement dans le stockage local Safari.
