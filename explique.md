## Problème détecté — double `/api`

- **Fichier source fautif :** src/pages/admin/verify-email/page.tsx
- **Symptôme :** les requêtes aboutissent en `/api/api/admin/verify-email` en production.

### Pourquoi
- Le projet utilise `buildApiUrl()` (src/lib/headers.ts) qui construit une URL finale contenant exactement un segment `/api` lorsqu'une `VITE_API_URL` de production est configurée.
- Dans `src/pages/admin/verify-email/page.tsx` l'appel utilise `buildApiUrl(`/api/admin/verify-email?token=...`)` — c'est-à-dire qu'on passe explicitement `/api/...` au helper.
- Selon la configuration (`VITE_API_URL` ou `VITE_API_BASE_URL`) et selon la façon dont les routes/proxy sont déployés, cela peut conduire à la concaténation de deux segments `/api` (par exemple si la base contient déjà `/api` ou si d'autres concaténations ajoutent `/api`).

### Preuves trouvées
- `buildApiUrl()` est défini dans : [src/lib/headers.ts](src/lib/headers.ts#L1-L20)
- L'appel fautif est ici : [src/pages/admin/verify-email/page.tsx](src/pages/admin/verify-email/page.tsx#L27)
- Variables d'environnement observées : [.env](.env#L1) contient `VITE_API_URL=https://emploiplus-group.com` (vérifier `.env.production` sur le serveur)

### Correctif recommandé
Remplacer l'appel existant qui inclut `/api` par un chemin sans `/api` :

Code actuel (fautif) — extrait :
```ts
const response = await fetch(buildApiUrl(`/api/admin/verify-email?token=${token}`), {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
```

Code corrigé :
```ts
const response = await fetch(buildApiUrl(`/admin/verify-email?token=${token}`), {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
```

Raison : `buildApiUrl()` ajoute déjà le segment `/api` côté base lorsqu'une base externe est configurée; lui passer `/admin/...` évite toute duplication.

### Remarques supplémentaires
- Beaucoup d'appels dans le projet utilisent `buildApiUrl('/api/...')` et la fonction a été écrite pour tolérer les deux formes (avec ou sans `/api`). Toutefois, pour éviter toute ambiguïté et prévenir les erreurs liées aux valeurs de `VITE_API_URL` en production, je recommande de :
  - Normaliser l'usage : passer les chemins sans le préfixe `/api` à `buildApiUrl()` (ex. `/admin/login`, `/publications`).
  - Vérifier la valeur de `VITE_API_URL` sur l'environnement de production (ou `VITE_API_BASE_URL`) et s'assurer qu'elle n'inclut pas un `/api` final — si elle l'inclut, corriger la variable d'environnement ou améliorer la normalisation côté `getApiBaseUrl()`.

### Fichiers à vérifier/mettre à jour
- `src/pages/admin/verify-email/page.tsx` — corriger comme ci-dessus. Voir [src/pages/admin/verify-email/page.tsx](src/pages/admin/verify-email/page.tsx#L1-L94)
- `src/lib/headers.ts` — responsable de la construction des URLs (optionnel : renforcer la normalisation). Voir [src/lib/headers.ts](src/lib/headers.ts#L1-L40)
- `.env.production` (sur le serveur) — vérifier la valeur de `VITE_API_URL` / `VITE_API_BASE_URL`.

Si tu veux, j'applique le correctif directement dans `src/pages/admin/verify-email/page.tsx` et je lance une rapide recherche pour remplacer les usages équivalents.
