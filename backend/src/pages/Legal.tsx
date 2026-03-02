import { useEffect, useState } from 'react';

const texts: Record<string, any> = {
  fr: {
    title: 'Mentions légales',
    content: `Emploi+ — Plateforme d'emploi et formation.
Société: EmploiPlus SARL
Siège: Brazzaville, République du Congo
Contact: contact@emploiplus-group.com`
  },
  en: {
    title: 'Legal Notice',
    content: `Emploi+ — Job and training platform.
Company: EmploiPlus SARL
Headquarters: Brazzaville, Republic of Congo
Contact: contact@emploiplus-group.com`
  },
  ln: {
    title: 'Makambo ya mibeko',
    content: `Emploi+ — Plateforme ya misala.
Kompani: EmploiPlus SARL
Ekipi: Brazzaville
Contact: contact@emploiplus-group.com`
  }
};

export default function Legal(){
  const [lang, setLang] = useState<string>('fr');
  useEffect(()=>{ setLang(localStorage.getItem('lang') || 'fr'); }, []);
  const t = texts[lang] || texts.fr;
  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      <pre className="text-muted-foreground whitespace-pre-line">{t.content}</pre>
    </div>
  );
}
