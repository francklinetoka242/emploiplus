/**
 * Exemple d'intégration du middleware contentFilter dans server.ts
 * À ajouter dans backend/src/server.ts
 */

// ============================================
// 1. EN HAUT DU FICHIER, AJOUTER LES IMPORTS :
// ============================================

import { contentFilterMiddleware, profanityViolationLogger } from './middleware/contentFilter.js';

// ============================================
// 2. AJOUTER LE MIDDLEWARE GLOBALEMENT (OPTIONNEL)
// ============================================

// Option A : Appliquer à toutes les routes /api/
app.use('/api/', profanityViolationLogger);

// ============================================
// 3. AJOUTER À DES ROUTES SPÉCIFIQUES (RECOMMANDÉ)
// ============================================

// Route pour créer une publication
app.post('/api/publications', 
  userAuth, 
  contentFilterMiddleware,  // ← Ajouter ici
  async (req: AuthenticatedRequest, res: Response) => {
    // ... logique existante
  }
);

// Route pour mettre à jour une publication
app.put('/api/publications/:id', 
  userAuth, 
  contentFilterMiddleware,  // ← Ajouter ici
  async (req: AuthenticatedRequest, res: Response) => {
    // ... logique existante
  }
);

// Route pour ajouter un commentaire
app.post('/api/publications/:id/comments', 
  userAuth, 
  contentFilterMiddleware,  // ← Ajouter ici
  async (req: AuthenticatedRequest, res: Response) => {
    // ... logique existante
  }
);

// Route pour mettre à jour un commentaire
app.put('/api/publications/:pubId/comments/:commentId', 
  userAuth, 
  contentFilterMiddleware,  // ← Ajouter ici
  async (req: AuthenticatedRequest, res: Response) => {
    // ... logique existante
  }
);

// ============================================
// 4. EXEMPLE COMPLET D'UNE ROUTE
// ============================================

app.post('/api/publications', 
  userAuth, 
  contentFilterMiddleware,  // Filtre d'abord le contenu
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { content, visibility, image_url, category, achievement } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Contenu vide' });
      }

      // À ce stade, le contenu est déjà filtré et validé
      // par le middleware contentFilterMiddleware

      // Insérer en base de données
      const result = await pool.query(
        'INSERT INTO publications (author_id, content, image_url, visibility, category, achievement, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
        [userId, content, image_url, visibility, category, achievement]
      );

      res.status(201).json({
        success: true,
        message: 'Publication créée avec succès',
        publication: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur création publication:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
);

// ============================================
// 5. GESTION DES ERREURS DE CONTENU BANNI
// ============================================

// Le middleware renvoie automatiquement une réponse 400 si du contenu banni est détecté
// Exemple de réponse :
/*
{
  "success": false,
  "error": "Contenu non autorisé détecté",
  "message": "En raison du respect des règles de notre communauté professionnelle, les mots ou expressions insultants, discriminatoires ou inappropriés ne sont pas tolérés.",
  "triggeredWords": ["merde", "connard"],
  "code": "BANNED_CONTENT"
}
*/

// ============================================
// 6. PERSONNALISER LE MESSAGE D'ERREUR
// ============================================

// Si vous voulez personnaliser le message, modifiez contentFilter.ts :

// Dans /backend/src/middleware/contentFilter.ts :
export const contentFilterMiddleware = (req: ExRequest, res: Response, next: NextFunction) => {
  // ... détection ...
  
  if (foundWords.length > 0) {
    // Personnaliser le message ici si nécessaire
    return res.status(400).json({
      success: false,
      error: "Contenu non autorisé détecté",
      message: "Votre message contient des termes inappropriés...", // ← Personnaliser
      triggeredWords: foundWords,
      code: "BANNED_CONTENT",
    });
  }

  next();
};

// ============================================
// 7. LOGS ET MONITORING
// ============================================

// Les violations sont automatiquement loggées via console.warn() et console.log()
// Pour les persistenter en base de données, ajouter :

const logViolation = async (userId: number, triggeredWords: string[], content: string) => {
  try {
    await pool.query(
      'INSERT INTO profanity_violations (user_id, triggered_words, content_preview, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, JSON.stringify(triggeredWords), content.substring(0, 100)]
    );
  } catch (error) {
    console.error('Erreur log violation:', error);
  }
};

// Puis modifier le middleware pour appeler cette fonction
// (voir exemple dans contentFilter.ts sous profanityViolationLogger)

// ============================================
// 8. STRUCTURE DE TABLE POUR VIOLATIONS (OPTIONNEL)
// ============================================

/*
CREATE TABLE profanity_violations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  triggered_words JSONB,
  content_preview TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_profanity_violations_user_id ON profanity_violations(user_id);
CREATE INDEX idx_profanity_violations_created_at ON profanity_violations(created_at);
*/

// ============================================
// 9. QUERY POUR MONITORER LES VIOLATIONS
// ============================================

/*
-- Violations par utilisateur
SELECT user_id, COUNT(*) as violation_count 
FROM profanity_violations 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id 
ORDER BY violation_count DESC;

-- Mots les plus détectés
SELECT 
  jsonb_array_elements(triggered_words) as word,
  COUNT(*) as frequency
FROM profanity_violations
GROUP BY word
ORDER BY frequency DESC
LIMIT 10;

-- Utilisateurs à suspendre
SELECT 
  user_id, 
  COUNT(*) as recent_violations,
  MAX(created_at) as last_violation
FROM profanity_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) >= 3;
*/

// ============================================
// 10. NOTIFIER LES ADMINS (OPTIONNEL)
// ============================================

const notifyAdminsOfViolation = async (userId: number, triggeredWords: string[]) => {
  try {
    // Envoyer une notification via WebSocket, email, ou Webhook
    console.log(`[ADMIN ALERT] User ${userId} violated content policy with words:`, triggeredWords);
    
    // Exemple avec email (nécessite configuration SMTP)
    // await sendAdminEmail(`User ${userId} attempted banned content`, triggeredWords.join(', '));
    
    // Exemple avec webhook
    // await fetch('https://your-admin-panel.com/api/violations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, triggeredWords, timestamp: new Date() })
    // });
  } catch (error) {
    console.error('Erreur notification admin:', error);
  }
};

export default {
  contentFilterMiddleware,
  profanityViolationLogger,
  logViolation,
  notifyAdminsOfViolation,
};
