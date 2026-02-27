import { useEffect, useState } from 'react';

const texts: Record<string, any> = {
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
  const t = texts[lang] || texts.fr;
  return (
    <div className="container py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      <p className="text-muted-foreground whitespace-pre-line">{t.content}</p>
    </div>
  );
}
