# ⚡ Quick Start - Système de Gestion des Documentations

## 30 secondes pour démarrer

### 1️⃣ Migration BD (30 secondes)

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend
node run-migration-004.js
```

✅ Vous devriez voir:
```
✅ Migration completed!
```

### 2️⃣ Démarrer l'application

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 3️⃣ Accéder à l'interface

1. Allez à `http://localhost:3000` (ou votre URL locale)
2. Connectez-vous en super admin
3. Allez à `/admin/documentations`
4. Cliquez **"Nouveau document"**

---

## 4️⃣ Créer votre 1er document

**Exemple simple:**

| Champ | Valeur |
|-------|--------|
| Nom | Politique de confidentialité |
| Slug | privacy |
| Type | Privacy |
| Contenu | `<h2>Nous protégeons vos données</h2><p>Votre vie privée est importante pour nous.</p>` |

Cliquez **"Créer"** ✅

### 5️⃣ Publier le document

- Dans la table, trouvez votre document
- Cliquez sur le bouton **"Brouillon"**
- Il devient **"Publié"**

### 6️⃣ Voir le résultat

- Allez à `/privacy`
- Votre document s'affiche automatiquement 🎉

---

## Types prédéfinis

Pour tirer parti de l'intégration automatique, utilisez ces slugs:

| Slug | Page |
|------|------|
| `privacy` | `/privacy` |
| `legal` | `/legal` |
| `cookies` | `/cookies` |

---

## Support

- 📚 Documentation complète: [DOCUMENTATION_MANAGEMENT_SYSTEM.md](./DOCUMENTATION_MANAGEMENT_SYSTEM.md)
- 📋 Détails techniques: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## Checklist rapide

- [ ] Migration exécutée
- [ ] Backend/Frontend démarrés
- [ ] 1 document créé
- [ ] 1 document publié
- [ ] Visible sur la page publique

✅ **Vous êtes prêt!**
