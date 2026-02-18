# ✅ Checklist - Avant de Déployer

## 1. Base de Données
- [ ] Migration exécutée : `npx tsx backend/migrations/002-add-admin-profile-fields.ts`
- [ ] Colonnes ajoutées à table `admins` (verification_token, is_verified, etc.)
- [ ] Connection PostgreSQL valide
- [ ] Backup de la BD effectué

## 2. Backend
- [ ] Variables .env complètement remplies (SMTP_*, JWT_SECRET, FRONTEND_URL)
- [ ] Build sans erreurs : `npm run build`
- [ ] Dépendances installées : `npm install`
- [ ] Service nodemailer testé (email reçu)
- [ ] Routes testées avec curl/Postman

## 3. Frontend
- [ ] `.env.local` avec `VITE_API_BASE_URL=http://localhost:5000`
- [ ] Build sans erreurs : `npm run build`
- [ ] Dépendances installées : `npm install`
- [ ] Routes ajoutées à App.tsx
- [ ] Page verify-email fonctionnelle

## 4. Sécurité
- [ ] Pas de credentials en dur dans le code
- [ ] JWT_SECRET randomisé (non "emploi_connect_congo_secret_2025" en production)
- [ ] CORS correctement configuré (origin whitelist)
- [ ] Rate limiting en place
- [ ] HTTPS activé en production

## 5. Tests Manuels
- [ ] Inscription super admin → email reçu
- [ ] Clic sur lien de confirmation → redirection
- [ ] Vérification email → is_verified=true en DB
- [ ] Connexion avec super admin token → jwt généré
- [ ] Création d'admin par super admin → nouvel admin dans DB
- [ ] Tentative connexion non-vérifiée → erreur appropriée
- [ ] Tentative création admin non-authentifié → 401 Unauthorized

## 6. Documentation
- [ ] REFACTORING_MIGRATION_COMPLETE.md à jour
- [ ] Variables d'environnement documentées
- [ ] Workflow d'auth clair
- [ ] Endpoints API documentés

## 7. Cleanup (Post-Déploiement)
- [ ] Supprimer `cleanup-supabase.sh`
- [ ] Archive des fichiers Supabase orphelins
- [ ] Logs d'erreurs vérifiés
- [ ] Performance acceptable

---

## 🚀 Commandes Essentielles

```bash
# Backend
cd backend
npx tsx migrations/002-add-admin-profile-fields.ts
npm install
npm run build
npm run dev

# Frontend
npm install
npm run dev

# Test API
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","nom":"Test","prenom":"User","role":"super_admin"}'
```

---

**Status:** ✅ Refactoring Complet
**Auteur:** GitHub Copilot + Francklin Etoka
**Date:** 18 février 2026
