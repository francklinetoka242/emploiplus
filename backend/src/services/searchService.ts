// backend/src/services/searchService.ts
import { Pool } from 'pg';

/**
 * Service pour la recherche Full Text Search optimisée
 * Utilise tsvector et tsquery pour des recherches rapides
 */
export class SearchService {
  constructor(private pool: Pool) {}

  /**
   * Prépare une tsquery à partir d'une string de recherche
   * Exemple: "développeur web" -> "développeur:* & web:*"
   */
  private prepareQuery(searchText: string): string {
    // Supprimer les caractères spéciaux et diviser par espaces
    const terms = searchText
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => `${term}:*`);

    // Joindre avec & pour AND search
    return terms.join(' & ');
  }

  /**
   * Rechercher dans les offres d'emploi
   */
  async searchJobs(query: string, limit: number = 8) {
    try {
      const tsQuery = this.prepareQuery(query);
      
      const result = await this.pool.query(
        `SELECT 
          id, 
          title, 
          description, 
          company_name,
          ts_rank(search_vector, to_tsquery('french', $1)) as rank
        FROM jobs
        WHERE search_vector @@ to_tsquery('french', $1)
          AND published = true
        ORDER BY rank DESC, created_at DESC
        LIMIT $2`,
        [tsQuery, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('searchJobs error:', error);
      // Fallback sur LIKE si FTS échoue
      return this.searchJobsLike(query, limit);
    }
  }

  /**
   * Fallback: Recherche avec LIKE
   */
  private async searchJobsLike(query: string, limit: number) {
    const pattern = `%${query}%`;
    const result = await this.pool.query(
      `SELECT id, title, description, company_name
       FROM jobs
       WHERE (title ILIKE $1 OR description ILIKE $1 OR company_name ILIKE $1)
         AND published = true
       LIMIT $2`,
      [pattern, limit]
    );
    return result.rows;
  }

  /**
   * Rechercher dans les formations
   */
  async searchFormations(query: string, limit: number = 8) {
    try {
      const tsQuery = this.prepareQuery(query);
      
      const result = await this.pool.query(
        `SELECT 
          id, 
          title, 
          description, 
          category,
          ts_rank(search_vector, to_tsquery('french', $1)) as rank
        FROM formations
        WHERE search_vector @@ to_tsquery('french', $1)
          AND published = true
        ORDER BY rank DESC, created_at DESC
        LIMIT $2`,
        [tsQuery, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('searchFormations error:', error);
      // Fallback sur LIKE
      return this.searchFormationsLike(query, limit);
    }
  }

  /**
   * Fallback: Recherche formations avec LIKE
   */
  private async searchFormationsLike(query: string, limit: number) {
    const pattern = `%${query}%`;
    const result = await this.pool.query(
      `SELECT id, title, description, category
       FROM formations
       WHERE (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
         AND published = true
       LIMIT $2`,
      [pattern, limit]
    );
    return result.rows;
  }

  /**
   * Rechercher dans les utilisateurs (candidats + entreprises)
   */
  async searchUsers(query: string, limit: number = 8) {
    try {
      const tsQuery = this.prepareQuery(query);
      
      const result = await this.pool.query(
        `SELECT 
          id, 
          first_name,
          last_name,
          company_name, 
          profession,
          profile_image_url,
          user_type,
          city,
          ts_rank(search_vector, to_tsquery('french', $1)) as rank
        FROM users
        WHERE search_vector @@ to_tsquery('french', $1)
          AND is_deleted = false
        ORDER BY rank DESC, created_at DESC
        LIMIT $2`,
        [tsQuery, limit]
      );

      // Map to include a compatible `full_name` for consumers
      return result.rows.map((r: any) => ({ ...r, full_name: `${(r.first_name||'').trim()} ${(r.last_name||'').trim()}`.trim() }));
    } catch (error) {
      console.error('searchUsers error:', error);
      // Fallback sur LIKE
      return this.searchUsersLike(query, limit);
    }
  }

  /**
   * Fallback: Recherche utilisateurs avec LIKE
   */
  private async searchUsersLike(query: string, limit: number) {
    const pattern = `%${query}%`;
    const result = await this.pool.query(
      `SELECT id, first_name, last_name, company_name, profession, profile_image_url, user_type, city
       FROM users
       WHERE ((first_name || ' ' || COALESCE(last_name,'')) ILIKE $1 OR company_name ILIKE $1 OR profession ILIKE $1 OR job_title ILIKE $1)
         AND is_deleted = false
       LIMIT $2`,
      [pattern, limit]
    );

    return result.rows.map((r: any) => ({ ...r, full_name: `${(r.first_name||'').trim()} ${(r.last_name||'').trim()}`.trim() }));
  }

  /**
   * Recherche globale (jobs + formations + users)
   */
  async globalSearch(query: string, limit: number = 5) {
    const [jobs, formations, users] = await Promise.all([
      this.searchJobs(query, limit),
      this.searchFormations(query, limit),
      this.searchUsers(query, limit),
    ]);

    return {
      jobs: jobs.slice(0, limit),
      formations: formations.slice(0, limit),
      users: users.slice(0, limit),
    };
  }
}
