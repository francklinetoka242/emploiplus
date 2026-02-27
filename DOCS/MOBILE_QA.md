# QA Mobile — CV Editor & Simulateur d'entretien

But: fournir une checklist claire pour tester la fluidité et l'accessibilité mobile en Afrique centrale (réseaux et appareils modestes).

## Points à vérifier (prioritaires)

- Breakpoints à tester : 360×800 (mobile small), 375×812, 412×915, 768×1024 (tablette).
- Performances réseau : tester en throttling `Slow 3G` et `Fast 3G` dans l'onglet Network.

### CV Editor (`src/pages/CVGenerator.tsx`)
- Layout adaptatif : la colonne latérale doit passer en dessus / dessous sur petits écrans.
- Touch targets : boutons principaux (`Créer`, `Enregistrer`, `Télécharger`, `Supprimer`) ≥ 44×44 CSS px.
- Form fields : inputs et textareas en `width: 100%`, marges verticales suffisantes pour saisie au doigt.
- Aperçu PDF : vérifier que l'aperçu charge et que l'export PDF fonctionne depuis un mobile (ou émulation).
- Scroll : la zone d'édition et l'aperçu doivent scroller correctement sans chevauchement.
- Sauvegarde locale : vérifier que `localStorage` conserve les CV et que l'import/export fonctionne.
- Actions en colonne : sur mobile, les actions doivent être empilées (stack) et pleine largeur.

### Simulateur d'entretien (`src/pages/InterviewSimulator.tsx`)
- Conversation : bulles lisibles, largeur limitée pour faciliter lecture (max-width raisonnable).
- Zone de messages : scrollable, hauteur limitée (ex. `max-h-[60vh]`) pour éviter overflow total.
- Input & boutons : textarea et boutons empilés sur mobile, gros boutons primaires visibles au pouce.
- Feedback final : zones de texte en `whitespace-pre-wrap` pour conserver retours formatés.

## Accessibilité
- Contraste : vérifier contraste texte/fond sur bulles et boutons (outil Lighthouse / axe).
- Focus : navigation clavier et focus visible (utile pour accessibilité sur mobile avec aides).
- Labels : tous les champs ont un label ou `aria-label` clair.

## Tests rapides (émulateur Chrome)
1. Ouvrir `http://localhost:5173` (ou `npm run dev`).
2. Ouvrir DevTools → Toggle device toolbar → choisir un mobile (iPhone 12 ou similar).
3. Activer Network throttling (`Fast 3G`) et CPU throttling si besoin.
4. Ouvrir `/cv-generator` : créer, éditer, exporter, supprimer — vérifier comportements.
5. Ouvrir `/interview-simulator` : démarrer simulation, répondre, vérifier scroll, feedback.

## Recommandations de code rapides
- Utiliser utilitaires Tailwind : `w-full`, `min-h-[...]`, `max-h-[60vh]`, `sm:flex-row`, `flex-col`.
- Privilégier `p-4 sm:p-8` plutôt que `p-12` fixe.
- Boutons : `py-3 px-4 rounded-md text-center w-full sm:w-auto` pour mobile-friendly.
- Eviter `h-96` fixe pour containers conversation — préférer `max-h-[60vh]` + `overflow-y-auto`.

## Commandes pour vérifier localement

- Installer dépendances (si nécessaire):
```bash
npm install
```

- Lancer le frontend (Vite):
```bash
npm run dev
# open http://localhost:5173
```

- Lancer le backend (depuis `backend/`):
```bash
cd backend
# si le backend utilise tsx
npm install
npm run dev # ou node server.js selon configuration
```

- Lint / type-check rapide:
```bash
npm run lint
npx tsc --noEmit
```

## Notes / Limitations
- Les tests sur vrais appareils Android (faible RAM/CPU) sont recommandés — émulation n'est pas parfaite.
- L'export PDF via `html2pdf.js` peut se comporter différemment sur mobile; si problème, proposer téléchargement côté serveur.

---
Merci — si vous voulez, j'ajoute des tests Playwright simples pour automatiser ces vérifications sur émulation mobile.