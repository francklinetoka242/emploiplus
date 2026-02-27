import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Calendar, Tag, Loader2, Heart, MessageCircle } from 'lucide-react';

const DOCUMENTATION_CATEGORIES = ['Conseil', 'Informations', 'Nouveauté', 'Communiquer', 'Challenge'];

export default function DocumentationPage() {
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Static legal documents
  const docs = [
    {
      id: 'code-travail-congo',
      title: 'Code du travail - République du Congo (version officielle)',
      description: "Texte officiel du Code du travail appliqué en République du Congo.",
      url: 'https://www.legislation-congo.cg/code-du-travail.pdf'
    },
    {
      id: 'reglementation-emploi',
      title: "Règlementation du travail et sécurité sociale",
      description: 'Réglementations et bonnes pratiques liées à l\'emploi et la sécurité des travailleurs au Congo.',
      url: 'https://www.legislation-congo.cg/reglementation-emploi.pdf'
    },
    {
      id: 'contrat-travail',
      title: "Guide de rédaction d'un contrat de travail",
      description: 'Modèle et conseils pour rédiger un contrat de travail conforme à la législation congolaise.',
      url: 'https://www.legislation-congo.cg/contrat-travail.pdf'
    }
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Charger les notifications du site comme articles d'actualité
      const res = await fetch('/api/site-notifications');
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter legal documents
  const filteredDocs = useMemo(() => {
    if (!q) return docs;
    return docs.filter(d => `${d.title} ${d.description}`.toLowerCase().includes(q.toLowerCase()));
  }, [q, docs]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (q) {
      filtered = filtered.filter(a => 
        `${a.title} ${a.description || ''}`.toLowerCase().includes(q.toLowerCase())
      );
    }

    return filtered;
  }, [articles, selectedCategory, q]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Documentation & Actualités</h1>
          <p className="text-gray-600">Ressources officielles, guides pratiques et actualités de l'emploi en République du Congo.</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input 
            placeholder="Rechercher une documentation ou un article…" 
            value={q} 
            onChange={(e:any) => setQ(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Legal Documents Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">📋 Documents & Ressources officielles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(d => (
              <Card key={d.id} className="p-4 hover:shadow-lg transition border-l-4 border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{d.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{d.description}</p>
                    <div className="mt-3">
                      <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80">
                        <ExternalLink className="w-4 h-4" /> Voir / Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Articles & News Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📰 Actualités & Articles</h2>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Tous
            </Button>
            {DOCUMENTATION_CATEGORIES.map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Articles Feed */}
          <div className="space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <Card key={article.id} className="p-6 hover:shadow-lg transition border-l-4 border-blue-500/30">
                  <div className="flex gap-6">
                    {/* Article content */}
                    <div className="flex-1">
                      {/* Tags */}
                      {article.category && (
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-3 h-3 text-gray-500" />
                          <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-1 rounded-full">
                            {article.category}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>

                      {/* Description */}
                      {article.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                      )}

                      {/* Date & Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.created_at)}
                        </div>
                        {article.likes_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {article.likes_count}
                          </div>
                        )}
                        {article.comments_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {article.comments_count}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {loading ? 'Chargement des articles...' : 'Aucun article trouvé pour votre recherche.'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
