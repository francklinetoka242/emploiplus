import React, { useState, useEffect } from 'react';
import './FAQManager.css';

export const FAQManager: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  useEffect(() => { fetchCategories(); fetchFaqs(); }, []);

  async function fetchCategories() {
    const res = await fetch('/api/admin/cms/admin/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    if (res.ok) setCategories(await res.json());
  }

  async function fetchFaqs() {
    const res = await fetch('/api/admin/cms/admin/faqs', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    if (res.ok) setFaqs(await res.json());
  }

  async function createCategory() {
    const res = await fetch('/api/admin/cms/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, body: JSON.stringify({ name: catName, slug: catSlug }) });
    if (res.ok) { setCatName(''); setCatSlug(''); fetchCategories(); }
  }

  async function createFaq() {
    const res = await fetch('/api/admin/cms/admin/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, body: JSON.stringify({ category_id: selectedCat, question, answer }) });
    if (res.ok) { setQuestion(''); setAnswer(''); fetchFaqs(); }
  }

  return (
    <div className="faq-manager">
      <h2>Gestion FAQ</h2>
      <div className="faq-columns">
        <div className="faq-col">
          <h3>Catégories</h3>
          <div className="category-list">
            {categories.map(c => <div key={c.id}>{c.name} ({c.slug})</div>)}
          </div>
          <div className="category-form">
            <input placeholder="Nom" value={catName} onChange={e => setCatName(e.target.value)} />
            <input placeholder="Slug" value={catSlug} onChange={e => setCatSlug(e.target.value)} />
            <button onClick={createCategory}>Créer</button>
          </div>
        </div>

        <div className="faq-col">
          <h3>Questions / Réponses</h3>
          <div className="faq-form">
            <select value={selectedCat ?? ''} onChange={e => setSelectedCat(e.target.value ? Number(e.target.value) : null)}>
              <option value="">-- Sélectionner catégorie --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Question" value={question} onChange={e => setQuestion(e.target.value)} />
            <textarea placeholder="Réponse" value={answer} onChange={e => setAnswer(e.target.value)} />
            <button onClick={createFaq}>Créer FAQ</button>
          </div>

          <div className="faq-list">
            {faqs.map(f => (
              <div key={f.id} className="faq-item">
                <div className="faq-q">{f.question}</div>
                <div className="faq-a">{f.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQManager;
