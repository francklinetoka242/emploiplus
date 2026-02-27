# 🚀 IMPLÉMENTATION - OPTION C (APPROCHE HYBRIDE)

**Status:** Prêt à exécuter  
**Date:** 21 février 2026  
**Impact:** Correction requêtes, ajout colonnes, création table trainings

---

## 📋 RÉSUMÉ DE L'IMPLÉMENTATION

L'Option C corrige les divergences BD/Code en:
1. ✅ Modifiant la structure table `jobs` (ajouter colonnes manquantes)
2. ✅ Créant la table `trainings` complète
3. ✅ Complétant la table `faqs` avec timestamps
4. ✅ Gardant les colonnes "bonus" existantes

---

## 🔧 ÉTAPES D'EXÉCUTION

### ÉTAPE 1: Exécuter la Migration SQL
**Fichier:** `migrations/001_hybrid_option_c.sql`

```bash
# Connexion directe à la BD
psql -h 127.0.0.1 -U emploip01_admin -d emploiplus_db \
  -f migrations/001_hybrid_option_c.sql

# Ou via terminal interactif
psql -h 127.0.0.1 -U emploip01_admin -d emploiplus_db
\i migrations/001_hybrid_option_c.sql
```

**À vérifier après la migration:**
```sql
-- Vérifier la structure jobs
\d jobs

-- Vérifier la structure faqs
\d faqs

-- Vérifier la création trainings
\d trainings

-- Vérifier les triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table IN ('jobs', 'faqs');
```

---

### ÉTAPE 2: Réponses de la BD (EXPECTED)

Après la migration, la BD doit avoir:

#### Colonnes `jobs` attendues:
```
id, title, company, location, sector, type, salary, description, 
image_url, application_url, deadline, published, published_at, created_at,
company_id, requirements, salary_min, salary_max, job_type, 
experience_level, is_closed, updated_at
```

#### Colonnes `faqs` attendues:
```
id, question, answer, published, category, created_at, updated_at
```

#### Table `trainings` créée avec colonnes:
```
id, title, description, provider, duration, level, category, 
deadline_date, certification, cost, is_closed, created_at, updated_at
```

---

### ÉTAPE 3: Valider les Contrôleurs TypeScript

**✅ Déjà Compatibles:**

| Contrôleur | Status | Détail |
|-----------|--------|--------|
| `admin-dashboard.controller.ts` | ✅ OK | Utilise la nouvelle structure (company_id, salary_min/max, etc.) |
| `jobs.controller.ts` | ✅ OK | Utilise l'ancienne structure (company, type, salary texte) compatible BD |
| `faqs.controller.ts` | ✅ OK | Compatible avec created_at/updated_at |
| `admin-users.controller.ts` | ✅ OK | Gère users correctement |

**Pas de modification de contrôleurs nécessaire!**

---

### ÉTAPE 4: Types TypeScript

Les types doivent refléter les deux contrôleurs:

**Types Admin Dashboard (admin-dashboard.controller.ts):**

```typescript
// backend/src/types/index.ts

export interface Job {
  id: number;
  title: string;
  description: string;
  company_id?: number;        // ← Admin utilisé, FK vers users
  location?: string;
  requirements?: string;      // ← Admin utilisé
  salary_min?: number;        // ← Admin utilisé (parsing)
  salary_max?: number;        // ← Admin utilisé (parsing)
  job_type?: string;          // ← Admin utilisé (ancien: type)
  experience_level?: string;  // ← Admin utilisé
  deadline_date?: string;     // ← Admin utilisé (ancien: deadline)
  is_closed?: boolean;        // ← Admin utilisé
  created_at?: string;
  updated_at?: string;
  
  // Colonnes bonus (compatibilité avec jobs.controller.ts)
  company?: string;           // ← API publique utilisée
  type?: string;              // ← API publique utilisée
  salary?: string;            // ← API publique utilisée
  image_url?: string;         // Bonus
  application_url?: string;   // Bonus
  deadline?: string;          // Bonus (ancien)
  published?: boolean;        // Bonus
  published_at?: string;      // Bonus
  application_via_emploi?: boolean;
}

export interface Training {
  id: number;
  title: string;
  description?: string;
  provider?: string;
  duration?: string;
  level?: string;
  category?: string;
  deadline_date?: string;
  certification?: string;
  cost?: number;
  is_closed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  published?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

### ÉTAPE 5: Tests de Validation

#### Test 1: Créer une offre via Admin Panel
```bash
curl -X POST http://localhost:3001/api/admin/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "title": "Développeur React",
    "description": "Nous cherchons...",
    "requirements": "3+ ans expérience React",
    "location": "Kinshasa",
    "salary_min": 50000,
    "salary_max": 70000,
    "job_type": "CDI",
    "experience_level": "Confirmé",
    "deadline_date": "2026-03-01"
  }'

# Réponse attendue:
{
  "message": "Offre créée avec succès",
  "job": {
    "id": 1,
    "company_id": 1,
    "salary_min": 50000,
    "salary_max": 70000,
    "job_type": "CDI",
    "experience_level": "Confirmé",
    "updated_at": "2026-02-21T10:30:00Z",
    ...
  }
}
```

#### Test 2: Lister les offres via API Publique
```bash
curl http://localhost:3001/api/jobs

# Doit retourner:
{
  "data": [
    {
      "id": 1,
      "title": "Développeur React",
      "company": "TechCo", 
      "type": "CDI",
      "salary": "50000-70000",
      ...
    }
  ]
}
```

#### Test 3: Créer une Training
```bash
curl -X POST http://localhost:3001/api/admin/trainings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Formation React Avancée",
    "provider": "Coursera",
    "level": "Avancé",
    "deadline_date": "2026-03-15",
    "cost": 199.99
  }'
```

#### Test 4: Créer une FAQ
```bash
curl -X POST http://localhost:3001/api/admin/faqs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment postuler?",
    "answer": "Vous pouvez postuler en cliquant...",
    "published": true
  }'

# Doit retourner:
{
  "message": "FAQ créée avec succès",
  "faq": {
    "id": 1,
    "question": "Comment postuler?",
    "answer": "...",
    "published": true,
    "created_at": "2026-02-21T10:30:00Z",
    "updated_at": "2026-02-21T10:30:00Z"
  }
}
```

---

## 🔄 COMPATIBILITÉ DOUBLE STRUCTURE

### Admin Panel (admin-dashboard.controller.ts) utilise:
- `company_id` (numérique, FK)
- `salary_min` / `salary_max` (séparés)
- `job_type`
- `deadline_date`
- `requirements`
- `experience_level`
- `is_closed`
- `updated_at`

### API Publique (jobs.controller.ts) utilise:
- `company` (texte)
- `salary` (texte formaté "X-Y")
- `type`
- `deadline`
- `image_url`
- `application_url`
- `published`

**✅ Les deux coexistent en BD grâce aux colonnes "bonus"!**

---

## ⚠️ PIÈGES À ÉVITER

### 1. Format `salary`
Si vos données existantes ont un format personnalisé:
- `"50K-70K"` → Script SQL échouera
- `"5000-7000"` → OK
- `"50k"` → OK → Créer salary_min=50000, salary_max=50000

**Solution:** Adapter le script antes d'exécuter SUR PRODUCTION

### 2. Triggers `updated_at`
Les triggers sont créés automatiquement. Si vous faites un UPDATE sans vouloir modifier `updated_at`:
```sql
-- Le trigger va toujours modifier updated_at
UPDATE jobs SET title = 'New' WHERE id = 1;
-- ✅ Comportement attendu, donc OK
```

### 3. Company ID
Si `company_id` n'a pas de FK vers `users`, les offres peuvent être "orphelines":
```sql
-- Migration crée:
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_company_id 
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL;

-- ✅ Les offres d'une company supprimée → company_id = NULL
```

---

## 📊 CHECKLIST D'EXÉCUTION

- [ ] **Backup BD:** Créer un backup avant toute migration
  ```bash
  pg_dump -h 127.0.0.1 -U emploip01_admin emploiplus_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Exécuter migration SQL:** `001_hybrid_option_c.sql`

- [ ] **Vérifier structure:** 
  ```sql
  \d jobs
  \d faqs
  \d trainings
  SELECT * FROM information_schema.triggers WHERE event_object_schema = 'public';
  ```

- [ ] **Tester Admin Panel:** Créer/modifier offre, training, FAQ

- [ ] **Tester API Publique:** Lister offres, candidatures, etc.

- [ ] **Valider Frontend:** Vérifier les formulaires admin chargent correctement

- [ ] **Mettre en production:** (après tests complets)

---

## 🐛 TROUBLESHOOTING

### Erreur: "Column does not exist"
**Cause:** Migration SQL non exécutée  
**Solution:** Exécuter migration SQL et vérifier

### Erreur: "FOREIGN KEY constraint failed"
**Cause:** `company_id` référence un `users.id` inexistant  
**Solution:** 
```sql
-- Vérifier l'intégrité
SELECT DISTINCT company_id FROM jobs WHERE company_id IS NOT NULL;
SELECT id FROM users WHERE id IN (SELECT DISTINCT company_id FROM jobs);

-- Fix: Mettre à NULL les IDs manquants
UPDATE jobs SET company_id = NULL 
WHERE company_id NOT IN (SELECT id FROM users);
```

### Erreur: "updated_at not updating"
**Cause:** Trigger non créé ou désactivé  
**Solution:**
```sql
-- Vérifier le trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_jobs_updated_at';

-- Recréer si besoin
CREATE TRIGGER trigger_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_jobs();
```

---

## 📞 SUPPORT

Pour toute question, se référer à:
- [AUDIT_BD_CODE_DIVERGENCES.md](AUDIT_BD_CODE_DIVERGENCES.md) - Détails complets
- [migrations/001_hybrid_option_c.sql](migrations/001_hybrid_option_c.sql) - Script SQL
- Contrôleurs TypeScript dans `backend/src/controllers/`

---

**Prochaine étape:** Exécuter la migration et valider!
