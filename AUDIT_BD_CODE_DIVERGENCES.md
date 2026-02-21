# 📋 AUDIT: DIVERGENCES BASE DE DONNÉES vs CODE

**Date:** 21 février 2026  
**Générée par:** Comparaison entre la BD réelle et les contrôleurs admin

---

## 📊 RÉSUMÉ EXÉCUTIF

| Status | Élément | Détail |
|--------|---------|--------|
| ✅ OK | `users` | Tous les champs correspondent |
| ⚠️ DIVERGENCES | `admins` | Manquent permissions individuelles |
| ❌ CRITIQUES | `jobs` | 7 colonnes divergentes |
| ⚠️ DIVERGENCES | `faqs` | Manquent `created_at`, `updated_at`, `category` |
| ❌ MANQUANTE | `trainings` | Table n'existe pas en BD |
| ⚠️ USAGE | Autres tables | Utilisées par le code mais non gérées par admin panel |

---

## 1️⃣ TABLE: `users` ✅ SYNCHRONIZED

### État: CORRECT
La table `users` est **correctement synchronisée** avec le code.

| Colonne BD | Type BD | Attendu par Code | Status |
|-----------|---------|-----------------|--------|
| `id` | integer | ✅ | ✅ |
| `email` | text | ✅ | ✅ |
| `password` | text | ✅ | ✅ |
| `first_name` | text | ✅ | ✅ |
| `last_name` | text | ✅ | ✅ |
| `user_type` | text | ✅ | ✅ |
| `phone` | text | ✅ | ✅ |
| `profession` | text | ✅ | ✅ |
| `company_name` | text | ✅ | ✅ |
| `skills` | jsonb | ✅ | ✅ |
| `experience_years` | integer | ✅ | ✅ |
| `profile_image_url` | text | ✅ | ✅ |
| `is_verified` | boolean | ✅ | ✅ |
| `is_blocked` | boolean | ✅ | ✅ |
| `is_deleted` | boolean | ✅ | ✅ |
| `created_at` | timestamp | ✅ | ✅ |
| `updated_at` | timestamp | ✅ | ✅ |

### ✨ Bonus (Champs BD non utilisés par code actuellement):
- `company_address`
- `job_title`
- `diploma`
- `deletion_requested_at`
- `deletion_scheduled_at`

---

## 2️⃣ TABLE: `admins` ⚠️ PARTIELLEMENT SYNCHRONIZED

### État: OK avec LIMITATIONS

Le code traite correctement l'authentification des admins, mais **manquent les permissions granulaires**.

#### ✅ Champs OK:
| Colonne | Type | Utilisé | Status |
|---------|------|---------|--------|
| `id` | integer | Oui | ✅ |
| `email` | varchar(255) | Oui | ✅ |
| `password` | text | Oui | ✅ |
| `first_name` | varchar(100) | Oui | ✅ |
| `last_name` | varchar(100) | Oui | ✅ |
| `phone` | varchar(20) | Non | ✅ |
| `country` | varchar(100) | Non | ✅ |
| `city` | varchar(100) | Non | ✅ |
| `birth_date` | date | Non | ✅ |
| `avatar_url` | text | Non | ✅ |
| `role` | varchar(50) | Oui | ✅ |
| `is_verified` | boolean | Oui | ✅ |
| `verification_token` | text | Oui | ✅ |
| `created_at` | timestamp | Non | ✅ |

#### ❌ Permissions Manquantes:

**Code attend un système RBAC avec permissions:**
```typescript
// Attendu par types/index.ts (AdminUser):
- perm_manage_users
- perm_manage_roles
- perm_edit_content
- perm_publish_content
- perm_view_audit_logs
- perm_manage_services
- perm_manage_faq
- perm_manage_settings
- perm_manage_catalog
```

**BD offre:**
```sql
perm_manage_users
perm_manage_roles
perm_edit_content
perm_publish_content
perm_view_audit_logs
perm_manage_services
perm_manage_faq
perm_manage_settings
perm_manage_catalog
```

✅ **BONNE NOUVELLE: Toutes les permissions existent en BD!**

---

## 3️⃣ TABLE: `jobs` ❌ CRITIQUES DIVERGENCES

### État: 7 INCOMPATIBILITÉS MAJEURES

Le code admin-dashboard utilise une structure **DIFFÉRENTE** de la BD réelle.

### Comparaison Détaillée:

| BD Réelle | Type BD | Code Admin Attend | Type Attendu | Divergence |
|-----------|---------|------------------|------------|-----------|
| `id` | integer | `id` | number | ✅ |
| `title` | text | `title` | string | ✅ |
| `company` | text | `company_id` | number | ❌ TYPE |
| `location` | text | `location` | string | ✅ |
| `sector` | text | ❌ Pas demandé | - | ⚠️ |
| `type` | text | `job_type` | string | ❌ NOM |
| `salary` | text | `salary_min` + `salary_max` | number + number | ❌ STRUCTURE |
| `description` | text | `description` | string | ✅ |
| `image_url` | text | ❌ Pas demandé | - | ⚠️ |
| `application_url` | text | ❌ Pas demandé | - | ⚠️ |
| `deadline` | timestamp | `deadline_date` | string | ❌ NOM |
| `published` | boolean | ❌ Pas demandé | - | ⚠️ |
| `published_at` | timestamp | ❌ Pas demandé | - | ⚠️ |
| `created_at` | timestamp | ✅ (auto) | timestamp | ✅ |
| ❌ N/A | - | `company_id` | number | ❌ MANQUANT |
| ❌ N/A | - | `requirements` | string | ❌ MANQUANT |
| ❌ N/A | - | `salary_min` | number | ❌ MANQUANT |
| ❌ N/A | - | `salary_max` | number | ❌ MANQUANT |
| ❌ N/A | - | `job_type` | string | ❌ MANQUANT |
| ❌ N/A | - | `experience_level` | string | ❌ MANQUANT |
| ❌ N/A | - | `is_closed` | boolean | ❌ MANQUANT |
| ❌ N/A | - | `updated_at` | timestamp | ❌ MANQUANT |

### 🚨 Problèmes Majeurs:

1. **`company` vs `company_id`**: BD stocke le nom, code attend l'ID
2. **`salary`**: BD = texte unique, code = min/max (2 colonnes)
3. **`type` vs `job_type`**: Noms différents
4. **`deadline` vs `deadline_date`**: Noms différents
5. **Colonnes manquantes en BD**: `requirements`, `salary_min`, `salary_max`, `experience_level`, `is_closed`
6. **Colonnes en trop en BD**: `sector`, `image_url`, `application_url`, `published`, `published_at`

---

## 4️⃣ TABLE: `faqs` ⚠️ PARTIELLEMENT SYNCHRONIZED

### État: PRINCIPALEMENT CORRECT mais MANQUES

| Colonne BD | Type BD | Code Attend | Status |
|-----------|---------|------------|--------|
| `id` | bigint | ✅ | ✅ |
| `question` | text | ✅ | ✅ |
| `answer` | text | ✅ | ✅ |
| `published` | boolean | ✅ | ✅ |
| `category` | text | ❌ Non utilisé | ⚠️ |
| ❌ N/A | - | `created_at` | ❌ MANQUANT |
| ❌ N/A | - | `updated_at` | ❌ MANQUANT |

### ⚠️ Point Important:

Le contrôleur `admin-dashboard.controller.ts` **insère** `created_at` et `updated_at` avec NOW():
```typescript
INSERT INTO faqs (question, answer, published, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
```

**Mais la BD n'a pas ces colonnes!** → Cette partie ÉCHOUERA en production.

---

## 5️⃣ TABLE: `trainings` ❌ N'EXISTE PAS

### État: CRITIQUE - TABLE MANQUANTE

Le code admin-dashboard essaie de créer/modifier une table `trainings`:

```typescript
INSERT INTO trainings (title, description, provider, duration, level, category, 
                       deadline_date, certification, cost, ...)
```

**MAIS:** Cette table n'existe pas en BD.

### Colonnes Attendues:
```
- id (integer, PK)
- title (text)
- description (text)
- provider (text)
- duration (text)
- level (text)
- category (text)
- deadline_date (timestamp)
- certification (text)
- cost (numeric/text)
- is_closed (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 6️⃣ AUTRES TABLES UTILISÉES PAR LE CODE

### Tables Détectées mais Non Gérées par Admin Panel:

| Table | Utilisée Par | Statut |
|-------|-------------|--------|
| `notifications` | messaging, newsfeed | ⚠️ Référence externe |
| `service_catalogs` | admin-users.controller | Gérée en code, inconnue BD |
| `services` | admin-users.controller | Gérée en code, inconnue BD |
| `service_ratings` | admin-users.controller | Gérée en code, inconnue BD |
| `promotion_badges` | admin-users.controller | Gérée en code, inconnue BD |
| `webhook_logs` | jobWebhook.ts | Gérée en code, inconnue BD |
| `audit_logs` | adminAuth.ts | Gérée en code, inconnue BD |

---

## 📋 CONCLUSIONS & RECOMMANDATIONS

### 🟢 DÉCISIONS À PRENDRE:

#### Option A: Adapter la BD à la logique du code
**Avantages:**
- Le code fonctionne sans modification
- Structure RBAC complète pour admins
- Formulaires admin cohérents

**Changements nécessaires:**
1. ✏️ Renommer `jobs.type` → `job_type`
2. ✏️ Renommer `jobs.deadline` → `deadline_date`
3. ➕ Ajouter `jobs.company_id` (integer, FK)
4. ➕ Ajouter `jobs.requirements` (text)
5. ➕ Scinder `jobs.salary` → `salary_min` + `salary_max`
6. ➕ Ajouter `jobs.experience_level` (text)
7. ➕ Ajouter `jobs.is_closed` (boolean)
8. ➕ Ajouter `jobs.updated_at` (timestamp)
9. ➕ Supprimer `jobs.sector`, `image_url`, `application_url`, `published`, `published_at`
10. ➕ Créer table `trainings` complète
11. ➕ Ajouter `faqs.created_at` et `updated_at` (timestamp)
12. ➕ Créer tables manquantes pour services/catalogs

#### Option B: Adapter le code à la BD existante
**Avantages:**
- Pas de migration BD
- Moins de risque d'erreur

**Changements nécessaires:**
1. Modifier `admin-dashboard.controller.ts` pour utiliser `company` au lieu de `company_id`
2. Parser `jobs.salary` (texte) au lieu de min/max
3. Utiliser `type` au lieu de `job_type`
4. Utiliser `deadline` au lieu de `deadline_date`
5. Désactiver la gestion des `trainings` en admin panel
6. Enlever `created_at`/`updated_at` des INSERT faqs
7. Recréer tous les formulaires admin

#### Option C: Approche Hybride
1. ✅ Corriger les divergences `jobs` (Option A - partielle)
2. ✅ Créer table `trainings` pour la complétude
3. ✅ Ajouter `created_at`/`updated_at` aux `faqs`
4. ✅ Garder les champs "bonus" en BD (`sector`, `image_url`, etc.)

---

## 🔧 IMPACT PAR MODULE

### Admin Dashboard
| Fonction | Status | Note |
|----------|--------|------|
| Gestion Jobs | ❌ CASSE | divergences `company_id`, `salary`, `type`, etc. |
| Gestion Trainings | ❌ CASSE | table n'existe pas |
| Gestion FAQs | ⚠️ PARTIELLEMENT | `created_at`/`updated_at` manquent |
| Gestion Users | ✅ OK | |

### Admin Users
| Fonction | Status | Note |
|----------|--------|------|
| Lister Users | ✅ OK | |
| Bloquer/Débloquer | ✅ OK | |
| Gestion Catalogues | ⚠️ ? | tables `service_catalogs` non trouvées en BD |

---

## 📎 FICHIERS À ANALYSER/MODIFIER

### Contrôleurs Affectés:
- `/backend/src/controllers/admin-dashboard.controller.ts` (CRÍTICO)
- `/backend/src/controllers/admin-users.controller.ts` (services, catalogues)
- `/backend/src/controllers/jobs.controller.ts` 
- `/backend/src/controllers/faqs.controller.ts`

### Types TypeScript Affectés:
- `/backend/src/types/index.ts`
- `/src/hooks/useProfileData.ts`
- `/src/hooks/useUserRole.ts`

### Routes Affectées:
- `/backend/src/routes/auth.ts`

---

## ✅ PROCHAINES ÉTAPES RECOMMANDÉES

1. **Choisir une stratégie** (A, B ou C)
2. **Générer un script de migration BD** (si Option A/C)
3. **Tester END-2-END** les formulaires admin
4. **Valider API endpoints** retournent les bons champs
5. **Synchroniser Frontend** avec les types corrects

---

**Généré par:** Audit automatisé  
**À faire:** Validation manuelle + Tests intégration
