import { useEffect, useState } from 'react';

const texts: Record<string, any> = {
  fr: {
    title: 'Politique de confidentialité',
    content: `Chez Emploi+, nous respectons votre vie privée. Nous collectons uniquement les données nécessaires pour fournir nos services : nom, email, CVs et documents que vous choisissez de sauvegarder. Nous ne vendons pas vos données. Les fichiers générés sont stockés sur notre serveur et accessibles via votre compte.`
  },
  en: {
    title: 'Privacy Policy',
    content: `At Emploi+, we respect your privacy. We collect only the data necessary to provide our services: name, email, CVs and documents you choose to save. We do not sell your data. Generated files are stored on our server and accessible via your account.`
  },
  ln: {
    title: 'Politique ya boboto ya ndako',
    content: `Na Emploi+, tozali kosepela te na kosomba ba données na yo. Tozali kolanda kaka ba informations oyo ezali na ntina mpo na kosala site: kombo, email, CV na factures oyo ozali kolanda. Tozali kolanda biloko te.`
  }
};

export default function Privacy(){
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
