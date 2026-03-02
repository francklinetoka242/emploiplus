/**
 * PUBLIC FAQ PAGE
 * Display FAQ items on public website with search and category filtering
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search, Mail } from 'lucide-react';
import { usePublicFAQItems, getFAQCategories, formatFAQCategory } from '@/hooks/useFAQ';

/**
 * Accordion component for displaying FAQ items
 */
function FAQAccordion({ faqs }: { faqs: any[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">Aucune FAQ trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition"
        >
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
          >
            <span className="text-left font-medium text-slate-900 flex-1">
              {faq.question}
            </span>
            <div
              className={`flex-shrink-0 transform transition ${
                openId === faq.id ? 'rotate-180' : ''
              }`}
            >
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </button>
          {openId === faq.id && (
            <div className="px-6 py-4 bg-white border-t border-slate-200">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQPublicPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch public FAQs
  const faqQuery = usePublicFAQItems({
    category: selectedCategory || undefined,
  });

  const allFAQs = faqQuery.data || [];
  const isLoading = faqQuery.isLoading;

  // Filter by search term
  const filteredFAQs = allFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get available categories from current FAQs
  const availableCategories = Array.from(new Set(allFAQs.map((faq) => faq.category)));

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Questions Fréquemment Posées
          </h1>
          <p className="text-lg text-indigo-100 mb-8">
            Trouvez les réponses à vos questions les plus courantes
          </p>

          {/* SEARCH BAR */}
          <div className="relative shadow-lg">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CATEGORY TABS */}
        {availableCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                Toutes les catégories
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  }`}
                >
                  {formatFAQCategory(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Chargement des FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <Card className="p-12 bg-white border border-slate-200 text-center">
            <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune réponse trouvée
            </h3>
            <p className="text-slate-600 mb-6">
              Nous n'avons pas trouvé de réponse à votre question. Essayez une autre recherche
              ou contactez notre support.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Mail className="h-4 w-4" />
              Nous contacter
            </Button>
          </Card>
        ) : (
          <div>
            <div className="mb-6 text-sm text-slate-600">
              {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} trouvée
              {filteredFAQs.length !== 1 ? 's' : ''}
            </div>
            <FAQAccordion faqs={filteredFAQs} />
          </div>
        )}

        {/* CONTACT SECTION */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Vous n'avez pas trouvé votre réponse?
            </h3>
            <p className="text-slate-600 mb-6">
              Notre équipe de support est disponible 24/7 pour vous aider
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Mail className="h-4 w-4" />
              Envoyer un message de support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
