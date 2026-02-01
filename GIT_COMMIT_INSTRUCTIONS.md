# Commit Message

```
Fix: Correction du fil d'actualité et des photos de profil sur Vercel

PROBLÈMES RÉSOLUS:
- Erreur "Erreur lors du chargement des publications" sur Vercel
- Photos de profil ne s'affichent plus

CAUSE:
- Les appels API utilisaient des URLs relatives (/api/publications)
- Sur Vercel (domaine séparé du backend), cela tentait d'accéder à 
  vercel-app.com au lieu de emploiplus-backend.onrender.com

SOLUTION:
- Création de buildApiUrl() dans src/lib/headers.ts
- Utilise VITE_API_BASE_URL pour construire l'URL complète
- Mise à jour de 24+ appels fetch() pour utiliser buildApiUrl()
- Amélioration des messages d'erreur

FICHIERS MODIFIÉS:
- src/lib/headers.ts (+ buildApiUrl & getApiBaseUrl)
- src/pages/Newsfeed.tsx (13 appels fetch)
- src/components/DashboardNewsfeed.tsx (2 appels)
- src/components/DiscreetModeCard.tsx (2 appels)
- src/components/Header.tsx (2 appels)
- src/components/Publications.tsx (1 appel)
- src/components/NotificationDropdown.tsx (1 appel)

VÉRIFICATION:
✓ Build Vite réussi (3484 modules)
✓ Pas d'erreurs de compilation
✓ Variable VITE_API_BASE_URL configurée dans .env.production

INSTRUCTION VERCEL:
Assurez-vous que `VITE_API_BASE_URL=https://your-production-api.example.com`
est configurée dans les variables d'environnement Vercel (ou utilisez Supabase directement).

TESTS:
npm run build    # ✓ Réussi
npm run dev      # À tester localement

BREAKING CHANGES: Aucun

Closes: Erreur publications Vercel
```

## Commandes Git

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

# Vérifier l'état
git status

# Ajouter les modifications
git add .

# Commit avec le message
git commit -m "Fix: Correction du fil d'actualité et des photos de profil sur Vercel

- Création de buildApiUrl() pour gérer l'API sur Vercel
- Mise à jour de 24+ appels fetch() avec buildApiUrl()
- Amélioration des messages d'erreur
- Variable VITE_API_BASE_URL utilisée correctement

Fichiers modifiés: 7
Build: ✓ Réussi"

# Push vers la branche
git push

# Ou si vous préférez voir les changements d'abord:
git diff --name-only
```

## Résultat Attendu

Après le push:
- ✓ Vercel détectera les changements
- ✓ Redéploiement automatique déclenchera
- ✓ Le fil d'actualité fonctionnera
- ✓ Les photos de profil s'afficheront
