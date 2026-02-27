# 📋 Checkliste de vérification — Emploi Connect Congo

Ce document vous permet de vérifier que tous les changements ont été implémentés correctement.

---

## ✅ Pages Jobs et Formations

### Page Jobs (`/emplois`)
- [ ] En-tête simplifié : "Offres d'emploi" + "Plus de X offres disponibles au Congo"
- [ ] Pas de doublon "Offres d'emploi" et "0 offre disponible"
- [ ] Composant de recherche visible (JobSearch)
- [ ] Grille d'offres affichée
- [ ] **Section CTA en bas avant footer** avec :
  - [ ] Titre "Offres recommandées"
  - [ ] Si connecté : affichage des recommandations (filtrées par profession/skills)
  - [ ] Si pas connecté : boutons "Se connecter" et "Créer un compte"

### Page Formations (`/formations`)
- [ ] En-tête simplifié : "Nos Formations Professionnelles" (sans redondance)
- [ ] Sous-titre : "Boostez votre carrière..." + "Plus de X formations disponibles au Congo"
- [ ] Composant de recherche visible (FormationSearch)
- [ ] Grille de formations affichée

---

## ✅ Templates CV et Lettre

### CV Generator (`/cv-generator`)
- [ ] **3 templates visibles pour invité** : Blanc, Bleu, Orange
- [ ] **5 templates visibles si connecté** : + Rouge, Jaune
- [ ] Sélection de template fonctionne
- [ ] Aperçu affiche le style du template sélectionné :
  - [ ] Blanc : fond blanc simple avec ombre légère
  - [ ] Bleu : gradient bleu dégradé
  - [ ] Orange : gradient orange dégradé
  - [ ] Rouge : gradient rouge avec bordure gauche rouge
  - [ ] Jaune : gradient jaune avec bordure top jaune

### Letter Generator (`/lettre-generator`)
- [ ] **3 templates visibles pour invité** : Blanc, Bleu, Orange
- [ ] **5 templates visibles si connecté** : + Rouge, Jaune
- [ ] Mêmes styles et comportements que CV

---

## ✅ Footer

### Canaux de Communication
- [ ] Section "Canaux de Communication" visible dans le footer
- [ ] 4 liens disponibles :
  - [ ] WhatsApp (icône MessageCircle, couleur verte)
  - [ ] Facebook (icône Facebook, couleur bleue)
  - [ ] LinkedIn (icône Linkedin, couleur bleu foncé)
  - [ ] Journal de l'emploi (icône Briefcase, couleur orange)
- [ ] Les liens s'ouvrent dans un nouvel onglet (target="_blank")

### Footer général
- [ ] Section "Liens rapides" (Offres d'emploi, Formations, Nos services, À propos)
- [ ] Section "Contact" (adresse, email, téléphone)
- [ ] Sélecteur de langue (Français, English, Lingala)
- [ ] Liens légaux (Privacy, Mentions légales, Gestion des cookies)

---

## ✅ Header et Authentification

### Menu utilisateur
- [ ] Icône utilisateur visible en haut à droite (quand connecté)
- [ ] Clic sur l'icône affiche un menu dropdown
- [ ] Menu contient : "Paramètres" et "Déconnexion"
- [ ] "Paramètres" redirige vers `/parametres`
- [ ] "Déconnexion" déconnecte et redirige vers `/`

### Erreurs JavaScript
- [ ] **Aucune erreur** "ReferenceError: UserIcon is not defined"
- [ ] **Aucun avertissement** React Router Future Flag dans la console

---

## ✅ Admin Sidebar

### Scrolling et Layout
- [ ] Sidebar visible à gauche de la page admin
- [ ] Header (Admin Panel + rôle) reste au top
- [ ] Footer (Déconnexion) reste au bas
- [ ] Section menu au milieu est **indépendamment scrollable**
- [ ] Tous les boutons du menu sont accessibles même si la liste est longue
- [ ] Sur petits écrans, scroller le sidebar n'affect pas le contenu principal

### Boutons de menu
- [ ] Tableau de bord
- [ ] (Super admin) Créer Admin, Administrateurs
- [ ] (Super admin ou admin_offres) Offres d'emploi, Formations
- [ ] (Super admin ou admin_users) Utilisateurs
- [ ] (Autorisé) FAQ

---

## ✅ Documents PDF et Sauvegarde

### CV / Lettre Generator
- [ ] Bouton "Télécharger PDF" génère un PDF côté client
- [ ] Bouton "Télécharger Word" génère un fichier .doc
- [ ] Bouton "Enregistrer dans mon compte" (si connecté) :
  - [ ] Génère un PDF
  - [ ] Upload le PDF vers `/api/upload`
  - [ ] Crée une entrée `user_documents` en BD
  - [ ] Affiche un message de succès
  - [ ] Notifie `Settings` via événement

### Paramètres (`/parametres`)
- [ ] Section "Documents" liste les CVs et lettres sauvegardés
- [ ] Chaque document a :
  - [ ] Titre
  - [ ] Type (CV ou Lettre)
  - [ ] Date de création
  - [ ] Boutons "Télécharger" et "Supprimer"
- [ ] "Télécharger" ouvre le PDF depuis `/uploads/`
- [ ] "Supprimer" supprime du serveur et de la BD

---

## ✅ Quotas et Limites

### Invités (non connectés)
- [ ] Max 2 CVs en brouillon (localStorage)
- [ ] Max 2 Lettres en brouillon (localStorage)
- [ ] Les brouillons disparaissent quand on quitte le site
- [ ] Bouton "Créer un compte" suggéré

### Utilisateurs connectés
- [ ] CVs illimités en brouillon
- [ ] Lettres illimitées en brouillon
- [ ] Max 2 CVs sauvegardés dans le compte
- [ ] Max 2 Lettres sauvegardées dans le compte
- [ ] Max ~10 créations par mois par type (limité serveur)

---

## ✅ Comptes de test

### Invité (pas de compte)
- URL : http://localhost:3000
- Actions : créer CV/lettre (max 2), exporter PDF/Word (pas de sauvegarde)

### Candidat
- Email : `jean@example.com`
- Mot de passe : `user123`
- Actions : tous les flux CV/lettre, profil, recommandations, settings

### Admin (Contenu)
- Email : `contenu@emploi.cg`
- Mot de passe : `contenu123`
- Actions : gérer publications, portfolios, etc.

### Super Admin
- Email : `admin@emploi.cg`
- Mot de passe : `admin123`
- Actions : tout (admin, utilisateurs, offres, formations, etc.)

---

## 📝 Commandes de démarrage

```bash
# Terminal 1 : Backend
cd backend
npx tsx src/server.ts
# Écoute sur http://localhost:5000

# Terminal 2 : Frontend
npm run dev
# Écoute sur http://localhost:3000

# (Optionnel) Réinitialiser la BD
cd backend
npx tsx init-db.ts
```

---

## 🔍 Endroits clés à tester

1. **Accueil** → `/`
2. **Offres d'emploi** → `/emplois` (vérifie CTA en bas)
3. **Formations** → `/formations` (vérifie en-têtes simplifiés)
4. **CV Generator** → `/cv-generator` (vérifie templates 3/5)
5. **Lettre Generator** → `/lettre-generator` (vérifie templates 3/5)
6. **Paramètres** → `/parametres` (après login)
7. **Admin Dashboard** → `/admin` (vérifie sidebar scrolling)
8. **Footer** → En bas de toute page (vérifie canaux)

---

## ❌ Problèmes courants et solutions

| Problème | Cause probable | Solution |
|----------|-----------------|----------|
| "UserIcon is not defined" | Import manquant | ✅ Corrigé dans Header.tsx |
| React Router warnings | Future flags manquants | ✅ Corrigé dans App.tsx |
| Sidebar overflow | Flexbox non appliqué | ✅ Corrigé dans Sidebar.tsx |
| PDF ne se génère pas | html2pdf.js manquant | Vérifier package.json (déjà inclus) |
| Upload échoue | Token ou endpoint invalide | Vérifier `/api/upload` sur backend |
| Recommandations vides | Pas de matching profil/skills | Vérifier que les offres contiennent "profession" en title/desc |

---

✅ **Utilisez cette checklist pour validation complète avant déploiement en production.**
