/**
 * ============================================================================
 * Newsfeed Service
 * ============================================================================
 * 
 * Service centralisant toute la logique de tri, filtrage et sécurité
 * du fil d'actualité (newsfeed):
 * 
 * 1. TRI HYBRIDE: Chronologie + Priorité Certification
 * 2. FILTRAGE DE SÉCURITÉ: Anti-profanité, statut du compte, discreet mode
 * 3. OPTIMISATION: Requêtes optimisées au niveau base de données
 * 4. AUDIT: Logging des filtres appliqués
 */

import { Pool } from 'pg';
import type { PoolClient } from 'pg';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface Publication {
  id: number;
  author_id: number;
  content: string;
  image_url?: string;
  visibility: string;
  hashtags?: string[];
  is_active: boolean;
  category?: string;
  achievement?: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  moderation_status: string;
  full_name?: string;
  company_name?: string;
  profile_image_url?: string;
  user_type?: string;
  author_company_id?: number;
  is_certified?: boolean;
  discreet_mode_enabled?: boolean;
  account_status?: string;
  job_title?: string;
  certification_priority?: number;
  is_blocked?: boolean;
  is_deleted?: boolean;
}

export interface NewsfeedQueryOptions {
  viewerId: number;
  viewerCompanyId?: number;
  limit: number;
  offset: number;
  sortBy?: 'recent' | 'relevant'; // 'relevant' = with certification boost
}

export interface NewsfeedFilterResult {
  publications: Publication[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  filtersSummary: {
    totalQueried: number;
    blockedByProfanity: number;
    blockedByAccountStatus: number;
    maskedByDiscreetMode: number;
    hiddenByPrivacy: number;
  };
}

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  foundWords: string[];
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// NEWSFEED SERVICE CLASS
// ============================================================================

export class NewsfeedService {
  constructor(private pool: Pool) {}

  /**
   * Récupère les publications du fil d'actualité avec tous les filtres appliqués
   * Logique:
   * 1. Récupère les publications triées (recent ou relevant)
   * 2. Vérifie le statut du compte de l'auteur (pas bloqué/suspendu)
   * 3. Exclut le contenu avec profanité non modérée
   * 4. Applique la logique de discreet mode (anonymisation)
   * 5. Filtre par visibilité et permissions
   */
  async getNewsfeedPublications(
    options: NewsfeedQueryOptions
  ): Promise<NewsfeedFilterResult> {
    const client = await this.pool.connect();
    
    try {
      const filtersSummary = {
        totalQueried: 0,
        blockedByProfanity: 0,
        blockedByAccountStatus: 0,
        maskedByDiscreetMode: 0,
        hiddenByPrivacy: 0,
      };

      // ======================================================================
      // ÉTAPE 1: Récupérer les publications (AVEC TRI HYBRIDE)
      // ======================================================================
      const sortOrder = this.buildSortOrder(options.sortBy);
      const baseQuery = `
        SELECT 
          p.id,
          p.author_id,
          p.content,
          p.image_url,
          p.visibility,
          p.hashtags,
          p.is_active,
          p.category,
          p.achievement,
          p.created_at,
          p.updated_at,
          p.likes_count,
          p.comments_count,
          p.moderation_status,
          p.contains_unmoderated_profanity,
          u.first_name,
          u.last_name,
          u.company_name,
          u.profile_image_url,
          u.user_type,
          u.company_id as author_company_id,
          u.is_verified,
          u.discreet_mode_enabled,
          u.is_blocked,
          u.is_deleted,
          u.job_title,
          CASE WHEN u.is_verified = true THEN 0 ELSE 1 END as certification_priority
        FROM publications p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE 
          p.is_active = true 
          AND p.deleted_at IS NULL
          ${sortOrder}
        LIMIT $1
        OFFSET $2
      `;

      const queryResult = await client.query(baseQuery, [
        options.limit + 50, // Fetch extra for filtering
        options.offset,
      ]);

      filtersSummary.totalQueried = queryResult.rows.length;

      // ======================================================================
      // ÉTAPE 2 & 3: FILTRER & APPLIQUER RÈGLES DE SÉCURITÉ
      // ======================================================================
      const filteredPublications: Publication[] = [];

      for (const pub of queryResult.rows) {
        // FILTRE 1: Vérifier le statut du compte de l'auteur
        const authorIsActive = this.isAuthorAccountActive(pub);
        if (!authorIsActive) {
          filtersSummary.blockedByAccountStatus++;
          
          // Log to audit table
          await this.logPublicationFilter(
            client,
            pub.id,
            'blocked_author',
            options.viewerId
          );
          continue;
        }

        // FILTRE 2: Vérifier la profanité non modérée
        if (pub.contains_unmoderated_profanity === true) {
          filtersSummary.blockedByProfanity++;
          
          await this.logPublicationFilter(
            client,
            pub.id,
            'unmoderated_profanity',
            options.viewerId
          );
          continue;
        }

        // FILTRE 3: Appliquer la logique de Discreet Mode
        const discreetModeResult = this.applyDiscreetModeLogic(
          pub,
          options.viewerId,
          options.viewerCompanyId
        );

        if (discreetModeResult.isHidden) {
          filtersSummary.maskedByDiscreetMode++;
          
          await this.logPublicationFilter(
            client,
            pub.id,
            'discreet_mode',
            options.viewerId
          );
          continue;
        }

        // FILTRE 4: Appliquer le masquage par discreet mode (anonymisation)
        if (discreetModeResult.shouldMask) {
          pub.first_name = 'Utilisateur';
          pub.last_name = 'anonyme';
          pub.full_name = 'Utilisateur anonyme';
          pub.profile_image_url = null;
          pub.user_type = 'candidate'; // Ne pas révéler le type d'utilisateur
          filtersSummary.maskedByDiscreetMode++;
        }

        // FILTRE 5: Vérifier les permissions de visibilité
        if (!this.hasVisibilityPermission(pub, options.viewerId)) {
          filtersSummary.hiddenByPrivacy++;
          
          await this.logPublicationFilter(
            client,
            pub.id,
            'privacy_settings',
            options.viewerId
          );
          continue;
        }

        // Publication passe tous les filtres
        filteredPublications.push(pub);

        if (filteredPublications.length >= options.limit) {
          break;
        }
      }

      // ======================================================================
      // ÉTAPE 4: COMPTER LE TOTAL RÉEL (pour pagination)
      // ======================================================================
      const countResult = await this.countTotalPublications(client, options);
      const total = countResult.count;

      return {
        publications: filteredPublications.slice(0, options.limit),
        total,
        limit: options.limit,
        offset: options.offset,
        hasMore: options.offset + options.limit < total,
        filtersSummary,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Vérifie que le compte de l'auteur est actif et non suspendu
   */
  private isAuthorAccountActive(publication: Publication): boolean {
    // L'auteur ne doit pas être:
    // 1. Bloqué (is_blocked = true)
    // 2. Supprimé (is_deleted = true)

    if (publication.is_blocked === true) {
      return false;
    }

    if (publication.is_deleted === true) {
      return false;
    }

    return true;
  }

  /**
   * Applique la logique de Discreet Mode
   * Si l'auteur a activé le discreet mode ET que le viewer est de la même entreprise:
   * - SOIT: Masquer complètement la publication (isHidden = true)
   * - SOIT: Anonymiser l'activité (shouldMask = true)
   * 
   * Configuration basée sur les règles métier:
   * - Si viewer == author: Affiche normalement
   * - Si viewer de même entreprise: Masquer ou anonymiser
   * - Si viewer d'autre entreprise: Affiche normalement
   */
  private applyDiscreetModeLogic(
    publication: Publication,
    viewerId: number,
    viewerCompanyId?: number
  ): { isHidden: boolean; shouldMask: boolean } {
    // Si l'auteur n'a pas le discreet mode activé
    if (publication.discreet_mode_enabled !== true) {
      return { isHidden: false, shouldMask: false };
    }

    // Si le viewer est l'auteur, afficher normalement
    if (publication.author_id === viewerId) {
      return { isHidden: false, shouldMask: false };
    }

    // Si l'auteur n'a pas d'entreprise associée (candidate freelance)
    if (!publication.author_company_id) {
      return { isHidden: false, shouldMask: false };
    }

    // Si le viewer n'a pas d'entreprise (candidate freelance)
    if (!viewerCompanyId) {
      return { isHidden: false, shouldMask: false };
    }

    // Si le viewer est de la MÊME entreprise que l'auteur
    if (viewerCompanyId === publication.author_company_id) {
      // OPTION 1: Masquer complètement la publication
      // return { isHidden: true, shouldMask: false };

      // OPTION 2: Anonymiser la publication (plus fluide pour l'UX)
      return { isHidden: false, shouldMask: true };
    }

    // Viewer d'une autre entreprise: afficher normalement
    return { isHidden: false, shouldMask: false };
  }

  /**
   * Vérifie les permissions de visibilité
   */
  private hasVisibilityPermission(
    publication: Publication,
    viewerId: number
  ): boolean {
    // Logique de visibilité:
    // - 'public': Visible par tous
    // - 'private': Visible uniquement par l'auteur
    // - 'connections': Visible par connections (à implémenter selon vos règles)

    switch (publication.visibility) {
      case 'public':
        return true;
      case 'private':
        return publication.author_id === viewerId;
      case 'connections':
        // À implémenter selon votre logique de connexions
        return publication.author_id === viewerId;
      default:
        return true; // Par défaut, public
    }
  }

  /**
   * Construit l'ordre de tri avec règles hybrides
   */
  private buildSortOrder(sortBy?: string): string {
    if (sortBy === 'recent') {
      // Tri chronologique pur: plus récent d'abord
      return `ORDER BY p.created_at DESC`;
    }

    // Tri 'relevant' (défaut): Certification boost + Chronologie
    // Priorité aux publications des comptes certifiés, puis par date récente
    return `
      ORDER BY 
        CASE WHEN u.is_certified = true THEN 0 ELSE 1 END ASC,
        p.created_at DESC
    `;
  }

  /**
   * Compte le total de publications après filtrage
   */
  private async countTotalPublications(
    client: PoolClient,
    options: NewsfeedQueryOptions
  ): Promise<{ count: number }> {
    const countQuery = `
      SELECT COUNT(*) as count
      FROM publications p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 
        p.is_active = true 
        AND p.deleted_at IS NULL
        AND p.contains_unmoderated_profanity = false
        AND u.is_blocked = false
        AND u.is_deleted = false
    `;

    const result = await client.query(countQuery);
    return result.rows[0];
  }

  /**
   * Log une publication filtrée pour audit
   */
  private async logPublicationFilter(
    client: PoolClient,
    publicationId: number,
    filterReason: string,
    viewerId: number
  ): Promise<void> {
    try {
      await client.query(
        `INSERT INTO publication_visibility_log 
         (publication_id, filter_reason, viewer_user_id, created_at) 
         VALUES ($1, $2, $3, NOW())`,
        [publicationId, filterReason, viewerId]
      );
    } catch (error) {
      console.error('Error logging publication filter:', error);
      // Ne pas bloquer le flux si le logging échoue
    }
  }

  /**
   * Vérifie si une publication contient de la profanité
   * Cette fonction est appelée lors de la création/modification d'une publication
   */
  async checkPublicationForProfanity(
    content: string
  ): Promise<ProfanityCheckResult> {
    try {
      // Récupérer les mots interdits actifs de la base de données
      const result = await this.pool.query(
        `SELECT word, severity FROM banned_words_backend WHERE is_active = true`
      );

      const bannedWords = result.rows;
      const foundWords: Array<{ word: string; severity: string }> = [];

      // Normaliser le contenu (accents, casse, caractères spéciaux)
      const normalizedContent = this.normalizeText(content);

      // Chercher chaque mot interdit
      for (const bannedWord of bannedWords) {
        const wordRegex = new RegExp(`\\b${bannedWord.word}\\b`, 'gi');
        if (wordRegex.test(normalizedContent)) {
          foundWords.push(bannedWord);
        }
      }

      if (foundWords.length === 0) {
        return {
          hasProfanity: false,
          foundWords: [],
          severity: 'low',
        };
      }

      // Déterminer la sévérité maximale
      const maxSeverity = this.getMaxSeverity(
        foundWords.map((w) => w.severity)
      );

      return {
        hasProfanity: true,
        foundWords: foundWords.map((w) => w.word),
        severity: maxSeverity,
      };
    } catch (error) {
      console.error('Error checking publication for profanity:', error);
      // En cas d'erreur, considérer comme sûr
      return {
        hasProfanity: false,
        foundWords: [],
        severity: 'low',
      };
    }
  }

  /**
   * Normalise le texte pour la détection de profanité
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûü]/g, 'u')
      .replace(/[î]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[œ]/g, 'oe')
      .replace(/[æ]/g, 'ae');
  }

  /**
   * Détermine la sévérité maximale
   */
  private getMaxSeverity(
    severities: string[]
  ): 'low' | 'medium' | 'high' {
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Marquer une publication comme ayant passé la vérification de profanité
   */
  async markProfanityCheckComplete(
    publicationId: number,
    hasProfanity: boolean,
    foundWords?: string[]
  ): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE publications 
         SET 
          profanity_check_status = $1,
          contains_unmoderated_profanity = $2,
          moderation_status = CASE WHEN $2 = true THEN 'pending' ELSE 'approved' END
         WHERE id = $3`,
        [hasProfanity ? 'flagged' : 'checked', hasProfanity, publicationId]
      );

      // Si profanité trouvée, créer un enregistrement dans profanity_violations
      if (hasProfanity && foundWords && foundWords.length > 0) {
        const pubResult = await this.pool.query(
          `SELECT author_id FROM publications WHERE id = $1`,
          [publicationId]
        );

        if (pubResult.rows.length > 0) {
          await this.pool.query(
            `INSERT INTO profanity_violations 
             (publication_id, user_id, violation_type, flagged_words, status) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (publication_id) DO UPDATE
             SET flagged_words = $4, updated_at = NOW()`,
            [
              publicationId,
              pubResult.rows[0].author_id,
              'banned_words',
              foundWords,
              'pending',
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error marking profanity check complete:', error);
    }
  }

  /**
   * Récupère les statistiques des filtres appliqués pour le jour
   */
  async getDailyFilterStatistics(): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        filter_reason,
        COUNT(*) as count,
        COUNT(DISTINCT publication_id) as unique_publications,
        COUNT(DISTINCT viewer_user_id) as unique_viewers
      FROM publication_visibility_log
      WHERE created_at >= NOW() - INTERVAL '1 day'
      GROUP BY filter_reason
      ORDER BY count DESC
    `);

    return result.rows;
  }
}

export default NewsfeedService;
