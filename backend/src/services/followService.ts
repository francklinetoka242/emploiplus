// backend/src/services/followService.ts
/**
 * Follow Service - Gère les relations de suivi entre utilisateurs
 * Support pour suggestions IA basées sur le match score
 */

import { pool } from '../config/database.js';
import { calculateMatchScore } from './matchingService.js';

// Types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Block {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_image_url?: string;
  bio?: string;
  profession?: string;
  user_type: string;
  company_name?: string;
  skills?: string[];
  experience_years?: number;
}

export interface Suggestion {
  user: UserProfile;
  matchScore: number;
  commonSkills: string[];
  reason: string;
  isFollowing: boolean;
}

export interface NetworkStats {
  followerCount: number;
  followingCount: number;
  followerIds: number[];
  followingIds: number[];
}

export interface NetworkActivity {
  id: string;
  type: 'follow' | 'publication' | 'job_posted';
  actor: UserProfile;
  action: string;
  timestamp: string;
  target?: string;
}

// Follow a user
export async function followUser(
  follower_id: number,
  following_id: number
): Promise<Follow> {
  // Check if already following
  const existing = await pool.query(
    'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
    [follower_id, following_id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Check if blocked
  const blocked = await pool.query(
    'SELECT * FROM blocks WHERE (user_id = $1 AND blocked_user_id = $2) OR (user_id = $2 AND blocked_user_id = $1)',
    [follower_id, following_id]
  );

  if (blocked.rows.length > 0) {
    throw new Error('Cannot follow blocked user');
  }

  // Create follow relationship
  const result = await pool.query(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     RETURNING *`,
    [follower_id, following_id]
  );

  return result.rows[0];
}

// Unfollow a user
export async function unfollowUser(
  follower_id: number,
  following_id: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [follower_id, following_id]
  );

  return result.rowCount > 0;
}

// Get followers count and list
export async function getFollowers(user_id: string): Promise<NetworkStats> {
  const followersResult = await pool.query(
    'SELECT follower_id FROM follows WHERE following_id = $1 ORDER BY created_at DESC',
    [user_id]
  );

  const followingResult = await pool.query(
    'SELECT following_id FROM follows WHERE follower_id = $1 ORDER BY created_at DESC',
    [user_id]
  );

  return {
    followerCount: followersResult.rows.length,
    followingCount: followingResult.rows.length,
    followerIds: followersResult.rows.map((r) => r.follower_id),
    followingIds: followingResult.rows.map((r) => r.following_id),
  };
}

// Get suggestions based on match score
export async function getSuggestions(
  user_id: number,
  limit: number = 10
): Promise<Suggestion[]> {
  try {
    // Get user profile
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, profile_image_url, bio, profession, user_type, company_name, skills, experience_years FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return [];
    }

    const currentUser = userResult.rows[0];
    const currentUserSkills = currentUser.skills || [];

    // Get all users except current user and already following
    const followingResult = await pool.query(
      'SELECT following_id FROM follows WHERE follower_id = $1',
      [user_id]
    );
    const followingIds = followingResult.rows.map((r) => r.following_id);
    const blockedResult = await pool.query(
      'SELECT blocked_user_id FROM blocks WHERE user_id = $1',
      [user_id]
    );
    const blockedIds = blockedResult.rows.map((r) => r.blocked_user_id);

    const allUsersResult = await pool.query(
      `SELECT id, first_name, last_name, profile_image_url, bio, profession, user_type, company_name, skills, experience_years
       FROM users
       WHERE id != $1 AND is_deleted = false AND is_blocked = false
       ORDER BY created_at DESC
       LIMIT 50`,
      [user_id]
    );

    // Calculate match score for each user and filter
    const suggestions: Suggestion[] = [];

    for (const candidate of allUsersResult.rows) {
      // Skip already following and blocked
      if (followingIds.includes(candidate.id) || blockedIds.includes(candidate.id)) {
        continue;
      }

      // Calculate match score using matching service
      let matchScore = 0;
      const candidateSkills = candidate.skills || [];
      const commonSkills: string[] = [];

      // Simple skill matching
      if (Array.isArray(currentUserSkills) && Array.isArray(candidateSkills)) {
        const currentSet = new Set(
          currentUserSkills.map((s: any) => (typeof s === 'string' ? s.toLowerCase() : ''))
        );
        const candidateSet = new Set(
          candidateSkills.map((s: any) => (typeof s === 'string' ? s.toLowerCase() : ''))
        );

        // Find common skills
        for (const skill of currentSet) {
          if (skill && candidateSet.has(skill)) {
            commonSkills.push(skill);
          }
        }

        // Calculate score: 50% common skills + 50% user type match
        const skillScore = Math.min(100, (commonSkills.length / Math.max(currentSet.size, 1)) * 100);
        const typeMatch = currentUser.user_type === candidate.user_type ? 50 : 20;
        matchScore = Math.round((skillScore * 0.5 + typeMatch) / 1.5);
      }

      // Only include if match score > 30%
      if (matchScore > 30) {
        const reason =
          commonSkills.length > 0
            ? `${commonSkills.length} compétence(s) commune(s)`
            : 'Profil similaire';

        suggestions.push({
          user: {
            id: candidate.id,
            first_name: candidate.first_name,
            last_name: candidate.last_name,
            full_name: `${(candidate.first_name||'').trim()} ${(candidate.last_name||'').trim()}`.trim(),
            profile_image_url: candidate.profile_image_url,
            bio: candidate.bio,
            profession: candidate.profession,
            user_type: candidate.user_type,
            company_name: candidate.company_name,
            skills: candidateSkills,
            experience_years: candidate.experience_years,
          },
          matchScore,
          commonSkills,
          reason,
          isFollowing: false,
        });
      }
    }

    // Sort by match score descending and limit
    return suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
}

// Get network activity
export async function getNetworkActivity(
  user_id: string,
  limit: number = 20
): Promise<NetworkActivity[]> {
  try {
    // Get following list
    const followingResult = await pool.query(
      'SELECT following_id FROM follows WHERE follower_id = $1',
      [user_id]
    );
    const followingIds = followingResult.rows.map((r) => r.following_id);

    if (followingIds.length === 0) {
      return [];
    }

    // Get recent activities from followed users
    const placeholders = followingIds.map((_, i) => `$${i + 1}`).join(',');

    // Publications from followed users
    const publicationsResult = await pool.query(
      `SELECT 
        'publication' as type,
        p.id::text,
        p.author_id,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        u.profession,
        u.user_type,
        p.content,
        p.created_at as timestamp
       FROM publications p
       JOIN users u ON p.author_id = u.id
       WHERE p.author_id IN (${placeholders}) AND p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT ${limit}`,
      followingIds
    );

    const activities: NetworkActivity[] = publicationsResult.rows.map((row) => ({
      id: row.id,
      type: row.type,
      actor: {
        id: row.author_id,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: `${(row.first_name||'').trim()} ${(row.last_name||'').trim()}`.trim(),
        profile_image_url: row.profile_image_url,
        profession: row.profession,
        user_type: row.user_type,
      },
      action: `a publié: "${row.content?.substring(0, 100) || 'Publication'}${row.content?.length > 100 ? '...' : ''}"`,
      timestamp: row.timestamp,
    }));

    return activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting network activity:', error);
    return [];
  }
}

// Block a user
export async function blockUser(
  user_id: string,
  blocked_user_id: string
): Promise<Block> {
  // Check if already blocked
  const existing = await pool.query(
    'SELECT * FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
    [user_id, blocked_user_id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Remove follow relationships
  await pool.query(
    'DELETE FROM follows WHERE (follower_id = $1 AND following_id = $2) OR (follower_id = $2 AND following_id = $1)',
    [user_id, blocked_user_id]
  );

  // Create block
  const result = await pool.query(
    `INSERT INTO blocks (user_id, blocked_user_id, created_at)
     VALUES ($1, $2, NOW())
     RETURNING *`,
    [user_id, blocked_user_id]
  );

  return result.rows[0];
}

// Unblock a user
export async function unblockUser(
  user_id: string,
  blocked_user_id: string
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
    [user_id, blocked_user_id]
  );

  return result.rowCount > 0;
}

// Check if following
export async function isFollowing(
  follower_id: string,
  following_id: string
): Promise<boolean> {
  const result = await pool.query(
    'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
    [follower_id, following_id]
  );

  return result.rows.length > 0;
}

// Get followed users
export async function getFollowingUsers(user_id: string): Promise<UserProfile[]> {
  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.profile_image_url, u.bio, u.profession, u.user_type, u.company_name, u.skills, u.experience_years
     FROM users u
     INNER JOIN follows f ON u.id = f.following_id
     WHERE f.follower_id = $1 AND u.is_deleted = false
     ORDER BY f.created_at DESC`,
    [user_id]
  );

  return result.rows.map((r: any) => ({
    ...r,
    full_name: `${(r.first_name || '').trim()} ${(r.last_name || '').trim()}`.trim()
  }));
}

// Get follower users
export async function getFollowerUsers(user_id: string): Promise<UserProfile[]> {
  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.profile_image_url, u.bio, u.profession, u.user_type, u.company_name, u.skills, u.experience_years
     FROM users u
     INNER JOIN follows f ON u.id = f.follower_id
     WHERE f.following_id = $1 AND u.is_deleted = false
     ORDER BY f.created_at DESC`,
    [user_id]
  );

  return result.rows.map((r: any) => ({
    ...r,
    full_name: `${(r.first_name || '').trim()} ${(r.last_name || '').trim()}`.trim()
  }));
}
