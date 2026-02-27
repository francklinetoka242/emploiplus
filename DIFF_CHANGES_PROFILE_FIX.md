# 📝 DIFF COMPLET: Changements Implémentés

## Fichier 1: backend/src/server.ts (Endpoint d'Inscription)

### Changement 1: Capture des paramètres

```diff
  app.post("/api/register", async (req, res) => {
    try {
-       let { email, password, user_type = "candidate", full_name, company_name, company_address, phone, country } = req.body;
+       let { 
+           email, password, user_type = "candidate", 
+           full_name, company_name, company_address, phone, country,
+           // Candidat fields
+           city, gender, birthdate, nationality,
+           // Entreprise fields
+           representative
+       } = req.body;
```

### Changement 2: Construction dynamique du INSERT

```diff
-       const hashed = bcrypt.hashSync(password, 10);
-       const { rows } = await pool.query(`INSERT INTO users (full_name, email, password, user_type, company_name, company_address, phone, country, is_verified)
-      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false)
-      RETURNING id, full_name, email, user_type, company_name, company_address, phone, country, created_at`, [full_name || null, email, hashed, user_type, company_name || null, company_address || null, phone || null, country || null]);
+       const hashed = bcrypt.hashSync(password, 10);
+       
+       // Construire les colonnes dynamiquement selon le type d'utilisateur
+       const columns = ['full_name', 'email', 'password', 'user_type', 'country', 'is_verified'];
+       const values = [full_name || null, email, hashed, user_type, country, false];
+       let valueIndex = 6;
+       
+       if (user_type === 'candidate') {
+           if (phone) { columns.push('phone'); values.push(phone); valueIndex++; }
+           if (city) { columns.push('city'); values.push(city); valueIndex++; }
+           if (gender) { columns.push('gender'); values.push(gender); valueIndex++; }
+           if (birthdate) { columns.push('birthdate'); values.push(birthdate); valueIndex++; }
+           if (nationality) { columns.push('nationality'); values.push(nationality); valueIndex++; }
+       } else if (user_type === 'company') {
+           if (company_name) { columns.push('company_name'); values.push(company_name); valueIndex++; }
+           if (company_address) { columns.push('company_address'); values.push(company_address); valueIndex++; }
+           if (phone) { columns.push('phone'); values.push(phone); valueIndex++; }
+           if (representative) { columns.push('full_name'); values[0] = representative || company_name || null; }
+       }
+       
+       const columnList = columns.join(', ');
+       const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
+       const returnColumns = [
+           'id', 'full_name', 'email', 'user_type', 'company_name', 'company_address', 
+           'phone', 'country', 'created_at', 'city', 'gender', 'birthdate', 'nationality'
+       ].join(', ');
+       
+       const query = `INSERT INTO users (${columnList}) VALUES (${placeholders}) RETURNING ${returnColumns}`;
+       const { rows } = await pool.query(query, values);
```

---

## Fichier 2: src/pages/Register.tsx (Formulaire d'Inscription)

### Changement 1: Ajout champs au state

```diff
  // Candidat form state
  const [candidatForm, setCandidatForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    city: "",
    phone: "",
+   gender: "",
+   birthdate: "",
    password: "",
    confirmPassword: "",
  });
```

### Changement 2: Envoi des données amélioré

```diff
  const metadata: Record<string, unknown> = {
    user_type: "candidate",
    full_name: `${candidatForm.firstName} ${candidatForm.lastName}`.trim(),
    country: candidatForm.country,
  };
  if (candidatForm.phone) metadata.phone = candidatForm.phone;
  if (candidatForm.city) metadata.city = candidatForm.city;
+ if (candidatForm.gender) metadata.gender = candidatForm.gender;
+ if (candidatForm.birthdate) metadata.birthdate = candidatForm.birthdate;
```

### Changement 3: UI du formulaire

```diff
  {/* City - shown for Congo */}
  {candidatForm.country === 'congo' && (
    <div className="space-y-2">
      <Label htmlFor="city">Ville *</Label>
      <Select value={candidatForm.city} onValueChange={(value) => setCandidatForm({ ...candidatForm, city: value })}>
        <SelectTrigger className="pl-3">
          <SelectValue placeholder="Sélectionnez votre ville" />
        </SelectTrigger>
        <SelectContent>
          {CONGO_CITIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}

+ {/* Gender and Birthdate */}
+ <div className="grid gap-4 md:grid-cols-2">
+   <div className="space-y-2">
+     <Label htmlFor="gender">Genre</Label>
+     <Select value={candidatForm.gender} onValueChange={(value) => setCandidatForm({ ...candidatForm, gender: value })}>
+       <SelectTrigger>
+         <SelectValue placeholder="Sélectionner le genre" />
+       </SelectTrigger>
+       <SelectContent>
+         <SelectItem value="male">Homme</SelectItem>
+         <SelectItem value="female">Femme</SelectItem>
+         <SelectItem value="other">Autre</SelectItem>
+       </SelectContent>
+     </Select>
+   </div>
+
+   <div className="space-y-2">
+     <Label htmlFor="birthdate">Date de naissance</Label>
+     <Input
+       id="birthdate"
+       type="date"
+       value={candidatForm.birthdate}
+       onChange={(e) => setCandidatForm({ ...candidatForm, birthdate: e.target.value })}
+     />
+   </div>
+ </div>
```

---

## Fichier 3: backend/migrate-add-profile-columns.js (Migration BD)

### Nouveau fichier créé

```javascript
/**
 * Migration: Vérifier que les colonnes existent pour les données d'inscription
 * Ajoute gender, birthdate, nationality si manquantes
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Vérification des colonnes de profil utilisateur...\n');

    const columnsToAdd = [
      { name: 'gender', type: 'TEXT', comment: 'male, female, other' },
      { name: 'birthdate', type: 'DATE', comment: 'Date de naissance' },
      { name: 'nationality', type: 'TEXT', comment: 'Nationalité' }
    ];

    for (const column of columnsToAdd) {
      try {
        const checkQuery = `
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='${column.name}'
        `;
        const result = await client.query(checkQuery);

        if (result.rows.length === 0) {
          const addColumnQuery = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type};`;
          await client.query(addColumnQuery);
          console.log(`✅ Colonne ${column.name} ajoutée (${column.comment})`);
        } else {
          console.log(`⏭️  Colonne ${column.name} existe déjà`);
        }
      } catch (error) {
        console.error(`❌ Erreur ajout colonne ${column.name}:`, error.message);
      }
    }

    console.log('\n✅ Migration complète!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Erreur non gérée:', err);
  process.exit(1);
});
```

---

## Résumé des Changements

| Fichier | Type | Changements |
|---------|------|-----------|
| `backend/src/server.ts` | 🔧 Backend | Capture + sauvegarde complète de tous les champs |
| `src/pages/Register.tsx` | 🎨 Frontend | Ajout UI pour gender + birthdate |
| `backend/migrate-add-profile-columns.js` | 🗄️ Migration | Crée les colonnes manquantes |

---

## Lignes Modifiées

- `backend/src/server.ts`: ~1597 à ~1710 (120+ lignes)
- `src/pages/Register.tsx`: ~33, ~39, ~88-91, ~265-290
- `backend/migrate-add-profile-columns.js`: Nouveau fichier (55 lignes)

---

## Commande Git pour Voir les Changements

```bash
# Voir le diff
git diff backend/src/server.ts
git diff src/pages/Register.tsx

# Voir les fichiers non suivis
git status

# Commiter tout
git add .
git commit -m "Fix: Récupération complète des données d'inscription (gender, birthdate, etc.)"
```

---

## À Exécuter Après Déploiement

```bash
# Sur le serveur avec accès à la BD:
cd backend
node migrate-add-profile-columns.js
```

---

**Status:** ✅ Prêt à la revue et au merge
