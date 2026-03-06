import { useEffect, useState } from 'react';
import { DocumentPageViewer } from '@/components/DocumentPageViewer';

const fallbackTexts: Record<string, any> = {
  fr: {
    title: 'Gestion des cookies',
    content: `Nous utilisons des cookies pour améliorer l'expérience utilisateur. Vous pouvez accepter ou refuser les cookies non essentiels. Les cookies essentiels sont nécessaires pour le fonctionnement du site.`
  },
  en: {
    title: 'Cookie Management',
    content: `We use cookies to improve the user experience. You can accept or refuse non-essential cookies. Essential cookies are necessary for the site's operation.`
  },
  ln: {
    title: 'Bokebi ya cookies',
    content: `Tozali kosalela cookies mpo na kosilisa expérience ya mokili. Okoki kokota to kozalisa cookies oyo ezali te elementaire.`
  }
};

export default function Cookies(){
  const [lang, setLang] = useState<string>('fr');
  useEffect(()=>{ setLang(localStorage.getItem('lang') || 'fr'); }, []);
  
  const fallback = fallbackTexts[lang] || fallbackTexts.fr;
  
  return (
    <DocumentPageViewer
      slug="cookies"
      fallbackTitle={fallback.title}
      fallbackContent={fallback.content}
    />
  );
}
