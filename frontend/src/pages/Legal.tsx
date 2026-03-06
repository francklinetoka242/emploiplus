import { useEffect, useState } from 'react';
import { DocumentPageViewer } from '@/components/DocumentPageViewer';

const fallbackTexts: Record<string, any> = {
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
  
  const fallback = fallbackTexts[lang] || fallbackTexts.fr;
  
  return (
    <DocumentPageViewer
      slug="legal"
      fallbackTitle={fallback.title}
      fallbackContent={fallback.content}
    />
  );
}
