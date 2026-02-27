/**
 * ============================================================================
 * Optimized Newsfeed Component - LinkedIn Scale
 * ============================================================================
 * 
 * ⚠️ TEMPORARILY DISABLED: This component depends on Supabase which has been
 * removed from the frontend. Will be re-enabled when backend newsfeed API is ready.
 * ============================================================================
 */

import React from 'react';
import { Card } from '@/components/ui/card';

const DashboardNewsfeedOptimized: React.FC = () => {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">Newsfeed component temporarily disabled.</p>
      <p className="text-sm text-muted-foreground mt-2">Redirecting to backend newsfeed...</p>
    </Card>
  );
};

export default DashboardNewsfeedOptimized;
    if (!user) return;

    console.log('[NewsfeedOptimized] Setting up real-time subscription');

    const channel = newsfeedService.subscribeToNewsfeed(
      user.id,
      (newPub: Publication) => {
        console.log('[NewsfeedOptimized] New publication received:', newPub.id);
        setPublications((prev) => [newPub, ...prev]);
        toast.success('Nouvelle publication!');
      },
      (error: Error) => {
        console.error('[NewsfeedOptimized] Subscription error:', error);
      }
    );

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user, newsfeedService]);

  // =========================================================================
  // RENDER
  // =========================================================================
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Veuillez vous connecter pour voir le fil d'actualité</p>
      </div>
    );
  }

  return (
    <div className="newsfeed-container max-w-2xl mx-auto py-6">
      {/* LOADING STATE */}
      {loading && publications.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      )}

      {/* PUBLICATIONS LIST */}
      {publications.length > 0 && (
        <div className="space-y-6">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} currentUserId={user.id} />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && publications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune publication pour le moment</p>
        </div>
      )}

      {/* INFINITE SCROLL TRIGGER */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {loading && <Loader2 className="animate-spin w-6 h-6" />}
        </div>
      )}

      {/* NO MORE PUBLICATIONS */}
      {!hasMore && publications.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Vous avez atteint la fin du fil d'actualité
        </div>
      )}
    </div>
  );
};

/**
 * Publication Card Component
 */
interface PublicationCardProps {
  publication: Publication;
  currentUserId: string;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  currentUserId,
}) => {
  const [liked, setLiked] = useState(publication.is_liked_by_viewer || false);
  const [likesCount, setLikesCount] = useState(publication.likes_count || 0);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

      // TODO: Implémenter l'appel API pour sauvegarder le like
      // const response = await supabase
      //   .from('publication_likes')
      //   .insert({ publication_id: publication.id, user_id: currentUserId });
    } catch (error) {
      console.error('Error liking publication:', error);
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={publication.author.avatar_url || '/default-avatar.png'}
          alt={publication.author.full_name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {publication.author.full_name}
            </h3>
            {publication.author.is_verified && (
              <span className="text-blue-500">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {new Date(publication.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <p className="text-gray-800 mb-4 leading-relaxed">
        {publication.content}
      </p>

      {/* IMAGE */}
      {publication.image_url && (
        <img
          src={publication.image_url}
          alt="Publication image"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}

      {/* HASHTAGS */}
      {publication.hashtags && publication.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {publication.hashtags.map((tag, idx) => (
            <span key={idx} className="text-blue-500 text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* FOOTER - STATS & ACTIONS */}
      <div className="border-t pt-4 flex items-center justify-between">
        <div className="flex gap-6 text-sm text-gray-500">
          <span>{likesCount} j'aime</span>
          <span>{publication.comments_count} commentaires</span>
        </div>
        <button
          onClick={handleLike}
          className={`px-4 py-2 rounded transition ${
            liked
              ? 'text-blue-500 bg-blue-50'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {liked ? '❤️ Aimé' : '🤍 Aimer'}
        </button>
      </div>
    </div>
  );
};

export default DashboardNewsfeedOptimized;
