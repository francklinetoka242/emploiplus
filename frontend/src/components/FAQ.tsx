import { useEffect, useMemo, useState } from "react";

interface FAQItem {
  id: number | string;
  question: string;
  answer: string;
  is_published?: boolean;
  category?: string;
  created_at?: string;
}

export default function FAQ({ compact = false }: { compact?: boolean }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Général');

  useEffect(() => {
    let mounted = true;
    fetch("/api/faq")
      .then((r) => r.json())
      .then((response) => {
        if (!mounted) return;
        const allFaqs = Array.isArray(response.data) ? response.data : [];
        // Filter only published FAQs
        const publishedFaqs = allFaqs.filter(faq => faq.is_published === true);
        setFaqs(publishedFaqs);
      })
      .catch((err) => console.error("Failed to load faqs", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const isVisual = (f: FAQItem) => {
    const txt = `${f.question} ${f.answer}`.toLowerCase();
    const keywords = ['cv', 'lettre', 'template', 'modèle', 'modele', 'design', 'portfolio', 'visuel', 'image', 'photo', 'maquette', 'graphique', 'logo', 'template', 'éditeur', 'éditeur'];
    return keywords.some((k) => txt.includes(k));
  };

  // Group FAQs by their actual database categories
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQItem[]> = {};
    faqs.forEach((f) => {
      const category = f.category || 'Général';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(f);
    });
    return grouped;
  }, [faqs]);

  const categories = Object.keys(faqsByCategory);

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  if (loading) return <p className="text-muted-foreground">Chargement des FAQ...</p>;
  if (!faqs || faqs.length === 0) return <p className="text-muted-foreground">Aucune FAQ disponible.</p>;

  const renderList = (list: FAQItem[]) => (
    <div className="space-y-3 mt-4">
      {list.map((f) => (
        <details key={f.id} className="bg-white p-4 rounded-lg shadow-sm">
          <summary className="cursor-pointer font-medium">{f.question}</summary>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{f.answer}</div>
        </details>
      ))}
      {list.length === 0 && <p className="text-muted-foreground">Aucune question dans cette catégorie.</p>}
    </div>
  );

  return (
    <div className={`space-y-6 flex flex-col items-center w-full`}>
      <h2 className="text-3xl font-bold text-center">FAQ (Foire aux Questions)</h2>
      <div className={`${compact ? 'max-w-3xl' : 'max-w-3xl'} w-full`}>
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 bg-transparent rounded-md p-1 border border-gray-100 justify-center mb-6">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List for Active Category */}
        {renderList(faqsByCategory[activeCategory] || [])}
      </div>
    </div>
  );
}
