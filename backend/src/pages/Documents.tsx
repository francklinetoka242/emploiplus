import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Calendar, Tag, Loader2 } from 'lucide-react';

const DOCUMENTATION_CATEGORIES = ['Conseil', 'Informations', 'Nouveauté', 'Communiquer', 'Challenge'];

export default function DocumentsPage() {
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documentationPosts, setDocumentationPosts] = useState<any[]>([]);
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
    }
  ];

  useEffect(() => {
    fetchDocumentationPosts();
  }, []);

  const fetchDocumentationPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documentation-posts');
      if (res.ok) {
        const data = await res.json();
        setDocumentationPosts(data || []);
      }
    } catch (err) {
      console.error('Error fetching documentation posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter legal documents
  const filteredDocs = useMemo(() => {
    if (!q) return docs;
    return docs.filter(d => `${d.title} ${d.description}`.toLowerCase().includes(q.toLowerCase()));
  }, [q, docs]);

  // Filter documentation posts
  const filteredPosts = useMemo(() => {
    let filtered = documentationPosts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (q) {
      filtered = filtered.filter(p => 
        `${p.title} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [documentationPosts, selectedCategory, q]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documentation — Code du travail & Réglementation</h1>
          <p className="text-muted-foreground">Ressources officielles et guides pratiques relatifs au droit du travail en République du Congo.</p>
        </div>
        <div className="w-full max-w-sm">
          <Input placeholder="Rechercher une documentation…" value={q} onChange={(e:any) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => (
          <Card key={d.id} className="p-4 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{d.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary font-semibold">
                    <ExternalLink className="w-4 h-4" /> Voir / Télécharger
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-4 hover:shadow-lg transition">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contribuer</h2>
              <p className="text-sm text-muted-foreground mt-1">Si vous disposez d’un document officiel à ajouter, contactez l’administrateur ou utilisez le formulaire de contact.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
