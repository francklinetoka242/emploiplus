/**
 * types/newsfeed-optimized.ts
 * Types et interfaces pour l'optimisation avancée du fil d'actualité
 */

// ============================================
// TYPES - PUBLICATIONS ET COMMENTAIRES
// ============================================

export interface Publication {
  id: number;
  author_id: number;
  user_type: string;
  full_name?: string;
  company_name?: string;
  profile_image_url?: string;
  content: string;
  image_url?: string;
  category?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  liked?: boolean;
  achievement?: string;
}

export interface Comment {
  id: number;
  author_id: number;
  author_name?: string;
  author_profile_image?: string;
  author_title?: string; // Profession/poste du commentateur
  is_publication_author?: boolean; // Indique si c'est l'auteur de la publication
  content: string;
  created_at: string;
  publication_id: number;
}

export interface CommentResponse extends Comment {
  success?: boolean;
}

// ============================================
// TYPES - SIGNALEMENTS
// ============================================

export type ReportReason = 
  | "sexual"
  | "inappropriate"
  | "harassment"
  | "hateful"
  | "other";

export interface PublicationReport {
  id: number;
  publication_id: number;
  reported_by: number;
  reason: ReportReason;
  details?: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export interface ReportPayload {
  reason: ReportReason;
  details?: string;
  reported_by: number;
}

// ============================================
// TYPES - RÉACTIONS
// ============================================

export interface Reaction {
  emoji: string;
  label: string;
}

export const REACTIONS: Reaction[] = [
  { key: 'applaud', icon: 'Clap', label: "Applaudissements" },
  { key: 'like', icon: 'ThumbsUp', label: "J'aime bien" },
  { key: 'celebrate', icon: 'PartyPopper', label: "Félicitations" },
  { key: 'agree', icon: 'Handshake', label: "Accord" },
  { key: 'rocket', icon: 'Rocket', label: "Excellent" },
  { key: 'idea', icon: 'Lightbulb', label: "Idée" },
  { key: 'sparkle', icon: 'Star', label: "Magnifique" },
  { key: 'hot', icon: 'Fire', label: "C'est chaud" },
];

// ============================================
// TYPES - NOTIFICATIONS
// ============================================

export interface NotificationPayload {
  recipient_id: number;
  type: "report_notification" | "comment_notification" | "like_notification";
  title: string;
  message: string;
  related_id: number; // Publication ID
}

// ============================================
// TYPES - PROPS DE COMPOSANTS
// ============================================

export interface ReportModalProps {
  publicationId: number;
  publicationAuthorId: number;
  onReportSuccess?: () => void;
}

export interface ReactionBarProps {
  publicationId: number;
  onReactionAdded?: () => void;
}

export interface CommentsSectionProps {
  publicationId: number;
  comments: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: number) => void;
}

// ============================================
// TYPES - API RESPONSES
// ============================================

export interface LikeResponse {
  success: boolean;
  likes_count: number;
  liked: boolean;
}

export interface CommentListResponse {
  success: boolean;
  comments: Comment[];
}

export interface CreateCommentResponse {
  id: number;
  publication_id: number;
  author_id: number;
  content: string;
  created_at: string;
  author_name?: string;
  author_profile_image?: string;
  author_title?: string;
  is_publication_author?: boolean;
}

export interface CreateReportResponse {
  success: boolean;
  report: PublicationReport;
}

// ============================================
// CONSTANTS - REPORT REASONS
// ============================================

export const REPORT_REASONS = [
  { value: "sexual" as ReportReason, label: "Contenu sexuel" },
  { value: "inappropriate" as ReportReason, label: "Contenu inapproprié" },
  { value: "harassment" as ReportReason, label: "Harcèlement" },
  { value: "hateful" as ReportReason, label: "Discours haineux" },
  { value: "other" as ReportReason, label: "Autre" },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function isReactionEmoji(content: string): boolean {
  const emojiSet = new Set(REACTIONS.map((r) => r.emoji));
  return emojiSet.has(content.trim());
}

export function getReactionLabel(emoji: string): string {
  const reaction = REACTIONS.find((r) => r.emoji === emoji);
  return reaction?.label || emoji;
}
