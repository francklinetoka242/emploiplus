/**
 * Example: Newsfeed Page with PWA Integration
 * 
 * Cette page montre comment:
 * 1. Wrapper avec PWALayout
 * 2. Utiliser PWACard pour les cards
 * 3. Utiliser PWAModal pour les modales
 * 4. Intégrer les hooks PWA (usePWA, useOfflineStatus)
 */

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { PWALayout } from '@/components/layout/PWALayout';
import { PWACard } from '@/components/layout/PWACard';
import { PWAModal } from '@/components/layout/PWAModal';
import { usePWA, useOfflineStatus } from '@/hooks/usePWA';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: Date;
  liked: boolean;
}

export function NewsfeedExample() {
  // PWA Hooks
  const { isOnline: _isOnline } = usePWA();
  const isOffline = !useOfflineStatus();
  const { user } = useAuth();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);

  // Charger les posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
      // Fallback: afficher les posts en cache
      // ou afficher un message offline
    }
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = async () => {
    if (!selectedPost || !commentText.trim()) return;

    try {
      // Envoyer le commentaire
      await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });

      setCommentText('');
      setIsCommentModalOpen(false);

      // Recharger les posts
      loadPosts();
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <PWALayout notificationCount={notificationCount} messageCount={messageCount}>
      <div className="space-y-4">
        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg animate-slide-down">
            ⚠️ Vous êtes hors ligne. Les données affichées peuvent être obsolètes.
          </div>
        )}

        {/* Create Post Section */}
        <PWACard className="p-4">
          <div className="flex gap-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <input
              type="text"
              placeholder="Partagez une actualité..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
              disabled={isOffline}
            />
          </div>
        </PWACard>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <PWACard className="p-6 text-center text-gray-500">
              Aucune actualité pour le moment
            </PWACard>
          ) : (
            posts.map((post) => (
              <PWACard
                key={post.id}
                className="p-4"
                interactive
                onClick={() => setSelectedPost(post)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">{post.author}</p>
                      <p className="text-xs text-gray-500">
                        {post.timestamp.toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-700 mb-3">{post.content}</p>

                {/* Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center justify-between text-gray-600 text-sm border-t pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className="flex items-center gap-2 touch-target active:scale-95 transition-transform"
                  >
                    <Heart
                      size={18}
                      className={post.liked ? 'fill-red-500 text-red-500' : ''}
                    />
                    {post.likes}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                      setIsCommentModalOpen(true);
                    }}
                    className="flex items-center gap-2 touch-target active:scale-95 transition-transform"
                  >
                    <MessageCircle size={18} />
                    {post.comments}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share
                    }}
                    className="flex items-center gap-2 touch-target active:scale-95 transition-transform"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </PWACard>
            ))
          )}
        </div>
      </div>

      {/* Comment Modal */}
      <PWAModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setCommentText('');
        }}
        title={selectedPost ? `Répondre à ${selectedPost.author}` : 'Commentaire'}
      >
        {selectedPost && (
          <div className="space-y-4">
            {/* Post Preview */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">
                {selectedPost.author} a écrit:
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {selectedPost.content}
              </p>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Écrivez votre commentaire..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                rows={4}
                disabled={isOffline}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || isOffline}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 active:scale-95 transition-all"
            >
              <Send size={18} />
              Envoyer
            </button>
          </div>
        )}
      </PWAModal>
    </PWALayout>
  );
}

/**
 * Notes d'implémentation:
 * 
 * 1. PWALayout wrapper:
 *    - Passe notificationCount et messageCount
 *    - Affiche HeaderMobile, BottomNavigationBar, Drawer
 * 
 * 2. Hooks PWA:
 *    - usePWA() pour status offline, dark mode, responsive
 *    - useOfflineStatus() pour juste le status online
 * 
 * 3. PWACard:
 *    - interactive={true} pour les interactions
 *    - onClick pour navigations/selections
 *    - touch-target pour tous les boutons (44x44px)
 * 
 * 4. PWAModal:
 *    - isOpen et onClose requis
 *    - Slide-up animation automatique
 *    - Fullscreen sur mobile, centré sur desktop
 * 
 * 5. Offline handling:
 *    - Afficher un banner si isOffline
 *    - Désactiver les inputs/buttons si offline
 *    - Garder les données en cache
 * 
 * 6. Animations:
 *    - animate-slide-down pour le banner
 *    - active:scale-95 pour les boutons
 *    - transition-transform pour les interactions
 * 
 * 7. Responsive:
 *    - md:hidden pour mobile-only
 *    - md:flex pour desktop-only
 *    - Breakpoints: sm(640px) md(768px) lg(1024px)
 */
