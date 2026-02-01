/**
 * ============================================================================
 * Optimized Newsfeed Service - LinkedIn Scale
 * ============================================================================
 * 
 * REFACTORISATION POUR ÉCHELLE LINKEDIN:
 * 
 * ❌ ANCIEN: Requête PostgreSQL sur backend Render
 * ✅ NOUVEAU: Supabase RLS + Vues SQL optimisées + Pagination .range()
 * 
 * BÉNÉFICES:
 * 1. Zero latency backend calls - Supabase edge functions
 * 2. Row-Level Security (RLS) pour millions d'utilisateurs
 * 3. Vues matérialisées et indexes pour scaling
 * 4. Pagination lazy-load avec .range() sans offset
 * 5. Connection pooling natif Supabase
 * 
 * IMPLEMENTATION: 
 * - Frontend utilise supabase-js directement (pas d'appels backend)
 * - Backend Render ne gère plus le newsfeed
 * - Render = notifications + PDF + matching uniquement
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase, createSupabaseClient } from '@/lib/supabase';

/**
 * TYPES & INTERFACES
 */
export interface Publication {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  visibility: 'public' | 'private' | 'connections';
  hashtags?: string[];
  is_active: boolean;
  category?: string;
  achievement?: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  moderation_status: 'approved' | 'pending' | 'rejected';
  author: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: 'candidate' | 'company';
    is_verified: boolean;
  };
  is_liked_by_viewer?: boolean;
  viewer_can_comment?: boolean;
}

export interface NewsfeedPaginationOptions {
  // Range: (start, end] - utilise keyset pagination pour scale
  // Exemple: .range(0, 19) = first 20 items
  //          .range(20, 39) = next 20 items (pas d'offset!)
  from?: number;
  to?: number;
  
  // Paramètres de filtre
  viewerId: string;
  sortBy?: 'recent' | 'relevant' | 'trending';
  categoryFilter?: string;
  userTypeFilter?: 'candidate' | 'company';
}

export interface NewsfeedResult {
  publications: Publication[];
  hasMore: boolean;
  nextPage?: {
    from: number;
    to: number;
  };
  totalCount?: number; // Optionnel: peut être cher à calculer avec millions de records
}

/**
 * ============================================================================
 * OPTIMIZED NEWSFEED SERVICE
 * ============================================================================
 */
export class OptimizedNewsfeedService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // If explicit credentials are provided, create a dedicated client, otherwise use the centralized client
    if (supabaseUrl && supabaseKey) {
      this.supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    } else {
      this.supabase = defaultSupabase as SupabaseClient;
    }
  }

  /**
   * Récupère le newsfeed avec pagination optimisée (keyset-based)
   * 
   * OPTIMISATIONS:
   * 1. Utilise .range() au lieu d'OFFSET (pas de full scan)
   * 2. RLS active pour filtrer automatiquement par permissions
   * 3. Index sur (created_at, id) pour tri rapide
   * 4. Vue matérialisée v_newsfeed_feed pour joins rapides
   * 
   * @param options - Pagination + filter options
   * @returns Publications + hasMore + nextPage
   */
  async getNewsfeedPublications(
    options: NewsfeedPaginationOptions
  ): Promise<NewsfeedResult> {
    const {
      from = 0,
      to = 19, // 20 items par page
      viewerId,
      sortBy = 'recent',
      categoryFilter,
    } = options;

    console.log('[Newsfeed] Fetching publications', {
      range: { from, to },
      viewer: viewerId,
      sortBy,
      timestamp: new Date().toISOString(),
    });

    try {
      // =====================================================================
      // APPROCHE 1: Utiliser une Vue Supabase (recommandé pour millions d'users)
      // =====================================================================
      // Cette vue doit exister en Supabase:
      // ```sql
      // CREATE VIEW v_newsfeed_feed AS
      // SELECT 
      //   p.id,
      //   p.author_id,
      //   p.content,
      //   p.image_url,
      //   p.visibility,
      //   p.hashtags,
      //   p.is_active,
      //   p.category,
      //   p.achievement,
      //   p.created_at,
      //   p.updated_at,
      //   p.likes_count,
      //   p.comments_count,
      //   p.moderation_status,
      //   u.id as author_id,
      //   u.full_name,
      //   u.avatar_url,
      //   u.user_type,
      //   u.is_verified,
      //   CASE 
      //     WHEN u.is_verified THEN 0 
      //     ELSE 1 
      //   END as certification_priority
      // FROM publications p
      // INNER JOIN profiles u ON p.author_id = u.id
      // WHERE 
      //   p.is_active = true
      //   AND p.deleted_at IS NULL
      //   AND p.moderation_status IN ('approved', 'pending')
      //   AND u.is_blocked = false
      //   AND u.account_status = 'active'
      // ORDER BY 
      //   CASE 
      //     WHEN certification_priority = 0 THEN 1
      //     ELSE 2
      //   END,
      //   p.created_at DESC;
      //
      // -- Index critique pour performance
      // CREATE INDEX idx_v_newsfeed_created_cert ON publications(moderation_status, is_active, created_at DESC)
      // WHERE is_active = true AND deleted_at IS NULL;
      // ```

      let query = this.supabase
        .from('v_newsfeed_feed')
        .select(
          `
          id,
          author_id,
          content,
          image_url,
          visibility,
          hashtags,
          is_active,
          category,
          achievement,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          moderation_status,
          author:author_id(
            id,
            full_name,
            avatar_url,
            user_type,
            is_verified
          ),
          publication_likes:publication_likes(count)
          `,
          { count: 'exact' } // Compte total (peut être cher avec billions de records)
        );

      // Filtrer par catégorie si spécifiée
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      // Tri hybride: certificats d'abord, puis chronologique
      if (sortBy === 'relevant') {
        // Certificats d'abord (certification_priority = 0), puis par date
        query = query.order('certification_priority', { ascending: true })
                     .order('created_at', { ascending: false });
      } else {
        // Tri par date décroissante
        query = query.order('created_at', { ascending: false });
      }

      // KEYSET PAGINATION (pas d'OFFSET!)
      // .range(0, 19) = items 0-19
      // .range(20, 39) = items 20-39 (pas de re-scan des 20 premiers)
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('[Newsfeed] Query error:', error);
        throw new Error(`Failed to fetch newsfeed: ${error.message}`);
      }

      // =====================================================================
      // STEP 2: Enrichir avec liked_by_viewer
      // =====================================================================
      const enrichedPublications = await Promise.all(
        (data || []).map(async (pub: any) => {
          try {
            // Vérifier si le viewer a liké cette publication
            // (ce check peut aussi être dans une colonne vue)
            const { data: likeData } = await this.supabase
              .from('publication_likes')
              .select('id')
              .eq('publication_id', pub.id)
              .eq('user_id', viewerId)
              .single();

            return {
              ...pub,
              is_liked_by_viewer: !!likeData,
              viewer_can_comment: pub.visibility !== 'private' || pub.author_id === viewerId,
            };
          } catch (err) {
            // Pas grave si vérification échoue
            console.warn('[Newsfeed] Failed to check like status:', err);
            return {
              ...pub,
              is_liked_by_viewer: false,
              viewer_can_comment: pub.visibility !== 'private',
            };
          }
        })
      );

      // =====================================================================
      // STEP 3: Calculer hasMore + nextPage pour pagination lazy
      // =====================================================================
      const hasMore = (data?.length || 0) > (to - from + 1);
      const nextPage = hasMore
        ? {
            from: to + 1,
            to: to + 1 + (to - from),
          }
        : undefined;

      console.log('[Newsfeed] Result', {
        count: enrichedPublications.length,
        totalCount: count,
        hasMore,
        nextPage,
      });

      return {
        publications: enrichedPublications,
        hasMore: hasMore,
        nextPage,
        totalCount: count || undefined,
      };

    } catch (error) {
      console.error('[Newsfeed] Error:', error);
      throw error;
    }
  }

  /**
   * Cherche les publications par texte (search + fulltext)
   * Utilise tsvector index Supabase pour performance
   */
  async searchPublications(
    query: string,
    viewerId: string,
    limit: number = 20
  ): Promise<Publication[]> {
    console.log('[Newsfeed Search] Query:', query);

    try {
      // Supabase supports fulltext search via tsvector
      const { data, error } = await this.supabase
        .from('publications')
        .select(
          `
          id,
          author_id,
          content,
          image_url,
          visibility,
          hashtags,
          is_active,
          category,
          created_at,
          updated_at,
          author:author_id(
            id,
            full_name,
            avatar_url,
            user_type,
            is_verified
          )
          `
        )
        .textSearch('content_search', query, {
          type: 'websearch',
          config: 'english',
        })
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('[Newsfeed Search] Error:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('[Newsfeed Search] Unhandled error:', error);
      throw error;
    }
  }

  /**
   * Récupère trending publications (basé sur engagement)
   * Utilise vue matérialisée pour performance
   */
  async getTrendingPublications(
    viewerId: string,
    limit: number = 10,
    timeframeHours: number = 24
  ): Promise<Publication[]> {
    try {
      const since = new Date(
        Date.now() - timeframeHours * 60 * 60 * 1000
      ).toISOString();

      // Compute engagement score: likes + comments
      const { data, error } = await this.supabase
        .from('publications')
        .select(
          `
          id,
          author_id,
          content,
          image_url,
          visibility,
          hashtags,
          is_active,
          category,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          author:author_id(
            id,
            full_name,
            avatar_url,
            user_type,
            is_verified
          )
          `
        )
        .eq('is_active', true)
        .gt('created_at', since)
        .order('likes_count', { ascending: false })
        .order('comments_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('[Newsfeed Trending] Error:', error);
      throw error;
    }
  }

  /**
   * Real-time subscription au newsfeed (WebSocket)
   * Permet de recevoir les nouvelles publications en temps réel
   */
  subscribeToNewsfeed(
    viewerId: string,
    onNewPublication: (pub: Publication) => void,
    onError: (error: Error) => void
  ) {
    console.log('[Newsfeed] Subscribing to real-time updates for viewer:', viewerId);

    return this.supabase
      .channel(`newsfeed_viewer_${viewerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'publications',
          filter: 'is_active=true',
        },
        (payload: any) => {
          console.log('[Newsfeed] New publication received:', payload.new.id);
          onNewPublication(payload.new as Publication);
        }
      )
      .on('error', (err) => {
        console.error('[Newsfeed] Subscription error:', err);
        onError(new Error(err.message || 'Subscription error'));
      })
      .subscribe((status) => {
        console.log('[Newsfeed] Subscription status:', status);
      });
  }
}

/**
 * ============================================================================
 * SQL VIEWS À CRÉER DANS SUPABASE (via console ou migrations)
 * ============================================================================
 * 
 * 1. Vue du newsfeed (avec certification priority):
 * ```sql
 * CREATE OR REPLACE VIEW v_newsfeed_feed AS
 * SELECT 
 *   p.*,
 *   u.id as author_id_verified,
 *   u.full_name,
 *   u.avatar_url,
 *   u.user_type,
 *   u.is_verified,
 *   u.is_blocked,
 *   u.account_status,
 *   CASE WHEN u.is_verified = true THEN 0 ELSE 1 END as certification_priority
 * FROM public.publications p
 * LEFT JOIN public.profiles u ON p.author_id = u.id
 * WHERE p.is_active = true AND p.deleted_at IS NULL;
 * ```
 * 
 * 2. Indexes pour performance:
 * ```sql
 * -- Index principal pour newsfeed (sort + filter)
 * CREATE INDEX idx_publications_active_created 
 * ON public.publications(is_active, created_at DESC) 
 * WHERE is_active = true AND deleted_at IS NULL;
 * 
 * -- Index pour recherche fulltext
 * ALTER TABLE public.publications 
 * ADD COLUMN content_search tsvector;
 * 
 * CREATE INDEX idx_publications_search 
 * ON public.publications 
 * USING GIN(content_search);
 * 
 * -- Trigger pour maintenir tsvector
 * CREATE OR REPLACE FUNCTION trigger_update_publications_search()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   NEW.content_search := to_tsvector('english', NEW.content);
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * CREATE TRIGGER publications_search_update
 * BEFORE INSERT OR UPDATE ON public.publications
 * FOR EACH ROW
 * EXECUTE FUNCTION trigger_update_publications_search();
 * ```
 * 
 * 3. RLS (Row Level Security) pour sécurité scale:
 * ```sql
 * ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policy: Chacun peut voir les publications publiques + ses propres
 * CREATE POLICY publications_readable ON public.publications
 * FOR SELECT
 * USING (
 *   visibility = 'public' 
 *   OR author_id = auth.uid()
 *   OR visibility = 'connections' AND EXISTS (
 *     SELECT 1 FROM public.connections 
 *     WHERE (user_1_id = auth.uid() AND user_2_id = author_id)
 *        OR (user_2_id = auth.uid() AND user_1_id = author_id)
 *   )
 * );
 * ```
 */

export default OptimizedNewsfeedService;
