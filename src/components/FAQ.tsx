import { useEffect, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  display_order?: number;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/faqs');
        if (!res.ok) return setFaqs([]);
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load faqs', e);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group by category
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, f) => {
    const cat = f.category || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  if (loading) return <div>Chargement des FAQ...</div>;
  if (faqs.length === 0) return <div>Aucune FAQ pour le moment.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Questions fréquentes</h2>
      {Object.keys(grouped).map((category) => (
        <Card key={category} className="mb-6 p-4">
          <h3 className="font-semibold mb-3">{category}</h3>
          <Accordion type="single" collapsible>
            {grouped[category]
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((f) => (
                <AccordionItem key={f.id} value={String(f.id)}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: String(f.answer) }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </Card>
      ))}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";

interface FAQItem {
  id: number | string;
  question: string;
  answer: string;
  created_at?: string;
}

export default function FAQ({ compact = false }: { compact?: boolean }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<'emploi' | 'visuel'>('emploi');

  useEffect(() => {
    let mounted = true;
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setFaqs(Array.isArray(data) ? data : []);
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

  const { emploiFaqs, visuelFaqs } = useMemo(() => {
    const emploi: FAQItem[] = [];
    const visuel: FAQItem[] = [];
    faqs.forEach((f) => {
      if (isVisual(f)) visuel.push(f);
      else emploi.push(f);
    });
    return { emploiFaqs: emploi, visuelFaqs: visuel };
  }, [faqs]);

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
        <div className="flex gap-2 bg-transparent rounded-md p-1 border border-gray-100 justify-center">
          <button
            className={`px-3 py-2 rounded-md text-sm font-medium ${active === 'emploi' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActive('emploi')}
            aria-pressed={active === 'emploi'}
          >
            Aide à l'Emploi
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm font-medium ${active === 'visuel' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActive('visuel')}
            aria-pressed={active === 'visuel'}
          >
            Outils de Création Visuelle
          </button>
        </div>

        {active === 'emploi' ? renderList(emploiFaqs) : renderList(visuelFaqs)}
      </div>
    </div>
  );
}
