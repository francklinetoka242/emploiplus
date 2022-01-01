# REACTIVATE_FEATURES.md - Guide pour réactiver Publications et other features

**Date** : 20 février 2026  
**Statut** : À exécuter après validation AUTH sur VPS

---

## ℹ️ Contexte

Le backend a été **simplifié** pour éliminer les erreurs TypeScript et permettre un déploiement auth stable.

Les fonctionnalités suivantes sont actuellement **désactivées** :
- ❌ Publications / Newsfeed
- ❌ Jobs
- ❌ WebHooks

**Prochaine étape** : Les réactiver progressivement après validation de l'auth sur le VPS.

---

## 📋 Étapes pour réactiver les publications

### Étape 1 : Restaurer le fichier publications.ts

**Source** : Récupérer depuis git history ou depuis la branche précédente

**Créer** : `backend/src/routes/publications.ts`

```bash
cd backend/src/routes/

# Option 1 : Depuis git (si le fichier était commité avant)
git checkout HEAD~1 publications.ts

# Option 2 : Copier depuis un backup
cp ../../backups/publications.ts ./publications.ts

# Option 3 : Manuelle (voir section "Code complet" plus bas)
cat > publications.ts << 'EOF'
# ... (insérer le code ci-dessous)
EOF
```

### Étape 2 : Réactiver l'import dans routes/index.ts

**Fichier** : `backend/src/routes/index.ts`

**Avant** (état actuel) :
```typescript
// DISABLED: Publications routes
// import publicationsRoutes from './publications.js';
// router.use('/publications', publicationsRoutes);
```

**Après** (réactivé) :
```typescript
import publicationsRoutes from './publications.js';
router.use('/publications', publicationsRoutes);
```

### Étape 3 : Tester la compilation

```bash
cd backend
npm run build
```

**Si erreurs TypeScript** :
- Vérifier que les types sont corrects dans publications.ts
- Utiliser `as` pour typage stricte si nécessaire
- Éviter les `any` types

### Étape 4 : Tester les routes

```bash
# Health check
curl http://localhost:5000/api/publications

# Devrait retourner un array (vide ou avec données)
```

---

## 💾 Code complet : publications.ts simplifié

Si vous devez recréer le fichier, voici une version typée correctement :

```typescript
/**
 * Publications / Newsfeed Routes - REACTIVATED VERSION
 * 
 * Handles:
 * - GET /publications - Fetch newsfeed with optional auth
 * - POST /publications - Create publication (auth required)
 * - PUT /publications/:id - Update publication (owner only)
 * - DELETE /publications/:id - Delete publication (owner only)
 * - POST /publications/:id/like - Like/Unlike publication
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import { userAuth } from '../middleware/auth.js';
import { NewsfeedService } from '../services/newsfeedService.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// Type definitions
interface DecodedToken {
  id: number;
  role?: string;
}

/**
 * GET /api/publications
 * Public endpoint - fetch newsfeed with optional authentication
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let viewerId: number | null = null;
    let viewerCompanyId: number | null = null;

    // Optional authentication
    try {
      const authHeader = (req.headers.authorization || '') as string;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
          viewerId = decoded?.id ?? null;
        }
      }
    } catch (e) {
      console.warn('Optional auth decode failed:', e instanceof Error ? e.message : String(e));
      viewerId = null;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = (req.query.sort as string) || 'relevant';

    // Get viewer info
    if (viewerId) {
      const { rows: viewerRows } = await pool.query(
        `SELECT id, company_id FROM users WHERE id = $1`,
        [viewerId]
      );
      viewerCompanyId = viewerRows?.[0]?.company_id;
    }

    // Use newsfeed service
    const newsfeedService = new NewsfeedService(pool);
    const result = await newsfeedService.getNewsfeedPublications({
      viewerId: viewerId ?? 0,
      viewerCompanyId: viewerCompanyId ?? undefined,
      limit,
      offset,
      sortBy: sortBy as 'relevant' | 'recent',
    });

    res.json({
      publications: result.publications,
      total: result.total,
      limit,
      offset,
      hasMore: result.hasMore,
    });
  } catch (err) {
    console.error('Get publications error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * POST /api/publications
 * Create publication (auth required)
 */
router.post('/', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, visibility = 'public', category = 'conseil', image_url = null } = req.body;
    const userId = req.userId;

    if (!content || !userId) {
      res.status(400).json({ success: false, message: 'Missing content or user ID' });
      return;
    }

    const newsfeedService = new NewsfeedService(pool);
    const profanityCheck = await newsfeedService.checkPublicationForProfanity(content);

    const { rows } = await pool.query(`
      INSERT INTO publications 
      (author_id, content, image_url, category, visibility, contains_unmoderated_profanity, profanity_check_status, moderation_status, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
      RETURNING *`, 
      [userId, content, image_url, category, visibility, profanityCheck.hasProfanity, profanityCheck.hasProfanity ? 'flagged' : 'checked', profanityCheck.hasProfanity ? 'pending' : 'approved']
    );

    res.json({ success: true, publication: rows[0] });
  } catch (err) {
    console.error('Create publication error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * PUT /api/publications/:id
 * Update publication (owner only)
 */
router.put('/:id', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { content, visibility } = req.body;

    const { rows: pubRows } = await pool.query(`SELECT author_id FROM publications WHERE id = $1`, [id]);
    
    if (!pubRows.length || pubRows[0].author_id !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rows } = await pool.query(`UPDATE publications SET content=$1, visibility=$2, updated_at=NOW() WHERE id=$3 RETURNING *`, [content, visibility || 'public', id]);
    
    res.json({ success: true, publication: rows[0] });
  } catch (err) {
    console.error('Update publication error:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * DELETE /api/publications/:id
 * Delete publication (owner only)
 */
router.delete('/:id', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { rows } = await pool.query(`SELECT author_id FROM publications WHERE id = $1`, [id]);
    
    if (!rows.length || rows[0].author_id !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await pool.query(`DELETE FROM publications WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete publication error:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * POST /api/publications/:id/like
 * Like/Unlike publication
 */
router.post('/:id/like', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { rows: pubRows } = await pool.query(`SELECT id FROM publications WHERE id = $1`, [id]);
    if (!pubRows.length) {
      res.status(404).json({ success: false, message: 'Publication not found' });
      return;
    }

    const { rows: likeRows } = await pool.query(`SELECT id FROM publication_likes WHERE publication_id = $1 AND user_id = $2`, [id, userId]);

    if (likeRows.length > 0) {
      await pool.query(`DELETE FROM publication_likes WHERE publication_id = $1 AND user_id = $2`, [id, userId]);
      await pool.query(`UPDATE publications SET likes_count = likes_count - 1 WHERE id = $1`, [id]);
      res.json({ success: true, liked: false });
    } else {
      await pool.query(`INSERT INTO publication_likes (publication_id, user_id, created_at) VALUES ($1, $2, NOW())`, [id, userId]);
      await pool.query(`UPDATE publications SET likes_count = likes_count + 1 WHERE id = $1`, [id]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    console.error('Like publication error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
```

---

## 🧹 Autres features à réactiver

### Jobs Routes

**Fichier** : `backend/src/routes/jobs.ts` (créer si nécessaire)

**Étapes** :
1. Créer le fichier ou récupérer depuis git
2. Importer dans `routes/index.ts` :
   ```typescript
   import jobsRoutes from './jobs.js';
   router.use('/jobs', jobsRoutes);
   ```
3. Tester : `npm run build`
4. Tester routes : `curl http://localhost:5000/api/jobs`

### WebHooks

**Fichier** : `backend/src/routes/webhooks.ts`

**Étapes** similaires aux jobs

---

## 🚦 Checklist de réactivation

Pour chaque feature à réactiver :

### Publications
- [ ] Fichier `publications.ts` crée et sans erreurs TypeScript
- [ ] Import uncommented dans `routes/index.ts`
- [ ] `npm run build` réussit
- [ ] Routes testées post-déploiement
- [ ] Logs serveur vérifié

### Jobs
- [ ] Fichier `jobs.ts` existe et compile
- [ ] Import uncommented dans `routes/index.ts`
- [ ] `npm run build` réussit
- [ ] Routes testées

### WebHooks
- [ ] Fichier `webhooks.ts` existe
- [ ] Bien typé pour éviter erreurs TypeScript
- [ ] Import dans le bon place
- [ ] Testé

---

## 🔄 Workflow de réactivation progressif

### Week 1 : Auth Stable
- ✅ Build complet
- ✅ Admin registration fonctionne
- ✅ Auth on VPS stable

### Week 2 : Réactiver Publications
- [ ] Recréer publications.ts
- [ ] Tester localement
- [ ] Déployer on VPS
- [ ] Valider

### Week 3+ : Autres features
- [ ] Jobs routes
- [ ] WebHooks
- [ ] Advanced features

---

## ⚠️ Notes importantes

1. **Ne pas tout réactiver à la fois** - Risque de bugs
2. **Tester localement d'abord** - Avant VPS
3. **Vérifier types TypeScript** - Pas de `any`
4. **Vérifier logs** - Erreurs au démarrage?
5. **Git workflow** - Commiter chaque feature

---

## 📞 Troubleshooting réactivation

### "Error: Cannot find module './publications.js'"

**Cause** : Fichier `publications.ts` n'existe pas

**Solution** :
```bash
# Vérifier
ls -la src/routes/publications.ts

# Recréer depuis code ci-dessus
```

### "TS2345: Type incompatibility"

**Cause** : Types mal alignés

**Solution** :
- Vérifier interfaces
- Ajouter des types explicites
- Utiliser `as` pour cast si nécessaire

### Routes retournent 404

**Cause** : Import oublié dans `routes/index.ts`

**Solution** :
```typescript
// Must be in routes/index.ts
import publicationsRoutes from './publications.js';
router.use('/publications', publicationsRoutes);
```

---

**Version** : 1.0  
**Prochaine révision** : Après réactivation publications  
**Responsable** : Backend Team
