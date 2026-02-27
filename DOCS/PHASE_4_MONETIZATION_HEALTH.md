# Phase 4: Monétisation & Santé du Système

## 📋 Vue d'ensemble

**Phase 4** complète le système d'administration en ajoutant deux nouveaux modules critiques:

1. **Gestion du Catalogue & Monétisation** - Gérer les tarifs et codes promos
2. **Santé du Système (DevOps light)** - Monitorer les logs et l'espace disque

---

## 🎯 Fonctionnalités Implémentées

### 1. Gestion du Catalogue de Services

#### Éditeur de Tarifs
- **Modification en un clic** des prix des services et formations premium
- **Recherche** par nom ou catégorie
- **Interface inline** pour passer de tarif actuel à nouveau prix
- **Exemple**: Changer "Analyse de CV" de 19.99$ → 24.99$ en quelques clics

**Endpoint**: `PUT /api/admin/services/:id/price`
```json
{
  "price": 24.99
}
```

#### Gestion des Codes Promos
- **Créer des coupons** avec réduction en pourcentage
- **Tracker les utilisations** - affiche le nombre d'utilisations
- **Supprimer des codes** - désactive le code (soft delete)
- **Format**: Code en MAJUSCULES (ex: SUMMER2024)

**Endpoints**:
- `GET /api/admin/promo-codes` - Liste les codes actifs
- `POST /api/admin/promo-codes` - Créer un nouveau code
- `DELETE /api/admin/promo-codes/:id` - Désactiver un code

```json
POST /api/admin/promo-codes
{
  "code": "SUMMER2024",
  "discount": 15,
  "description": "Offre d'été - 15% de réduction"
}
```

---

### 2. Santé du Système (DevOps Light)

#### Logs d'Erreurs
- **Affiche les 10 dernières erreurs critiques** du serveur
- **Filtrage par niveau**: Error, Warning, Info
- **Détails techniques** expandable pour chaque log
- **Auto-refresh**: Rechargement automatique chaque 5 secondes (optionnel)
- **Badges colorés** pour identifier rapidement les niveaux

**Endpoint**: `GET /api/admin/system/logs`
```json
[
  {
    "id": 1,
    "level": "error",
    "message": "Database connection failed",
    "source": "API",
    "timestamp": "2026-01-16T10:30:00Z",
    "context": {
      "errorCode": "ECONNREFUSED",
      "details": "..."
    }
  }
]
```

#### Gestion de l'Espace Disque
- **Alerte visuelle** si l'espace < 10% disponible
- **Barre de progression** avec code couleur:
  - 🟢 **Vert**: >20% disponible (Excellent)
  - 🟡 **Jaune**: 10-20% disponible (Attention)
  - 🔴 **Rouge**: <10% disponible (Critique)
- **Détail des répertoires**: Formations, Profils, Documents, DB, etc.
- **Status badge** automatique: Healthy / Warning / Critical
- **Recommandations** d'actions si espace critique

**Endpoint**: `GET /api/admin/system/disk-usage`
```json
{
  "total_gb": 45,
  "used_gb": 38.25,
  "available_gb": 6.75,
  "percentage": 85,
  "status": "warning"
}
```

---

## 🏗️ Architecture Technique

### Frontend Components

#### 1. ServiceCatalogManager.tsx (380 lignes)
```tsx
// Interfaces
interface Service {
  id: number;
  name: string;
  category: string;
  description?: string;
  price?: number;
  created_at?: string;
}

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  description: string;
  usage_count?: number;
  created_at?: string;
}

// Features
- Tabbed interface (Services & Tarifs | Codes Promos)
- Search/Filter par nom ou catégorie
- Inline price editing
- Create/Delete promo codes
- Real-time stats (usage count)
```

#### 2. SystemHealth.tsx (334 lignes)
```tsx
// Features
- Tabbed interface (Logs d'Erreurs | Espace Disque)
- Auto-refresh toggle (5s logs, 30s disque)
- Manual refresh buttons
- Error log display with expandable details
- Disk usage visualization with progress bar
- Color-coded status indicators
- Directory breakdown chart
- Action recommendations
```

### Backend Endpoints

#### Services Management (Section 11)
```typescript
GET /api/admin/services
- Retourne tous les services actifs
- Triés par catégorie et nom
- Limite: 200 résultats

PUT /api/admin/services/:id/price
- Mise à jour du prix
- Validation: price >= 0
- Timestamp updated_at automatique
```

#### Promo Codes (Section 11)
```typescript
GET /api/admin/promo-codes
- Retourne tous les codes actifs
- Avec compteur d'utilisation
- Triés par date (plus récent en premier)

POST /api/admin/promo-codes
- Création de nouveau code
- Code converti en MAJUSCULES
- Validation: discount 1-100%
- Unique constraint sur le code

DELETE /api/admin/promo-codes/:id
- Soft delete (is_active = false)
- Les codes restent en DB pour historique
```

#### System Monitoring (Section 12)
```typescript
GET /api/admin/system/logs
- 10 dernières erreurs critiques
- Niveaux: error, critical
- Tri par timestamp DESC

GET /api/admin/system/disk-usage
- Total, Utilisé, Disponible en GB
- Pourcentage utilisé
- Status: healthy | warning | critical
- Logique: <10% disponible = critical

POST /api/admin/system/logs
- Créer une entrée de log
- Utilisé pour logger les actions admin
- JSON context supporté
```

### Database Tables (Phase 4)

#### services
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### promo_codes
```sql
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount DECIMAL(5, 2) NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### system_logs
```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20),
  message TEXT NOT NULL,
  source VARCHAR(100),
  context JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Intégration dans Admin.tsx

### Nouveaux Imports
```typescript
import { ServiceCatalogManager } from "@/components/admin/ServiceCatalogManager";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { ShoppingCart, AlertTriangle } from "lucide-react";
```

### Nouveaux Tabs
```tsx
<TabsTrigger value="catalog">
  <ShoppingCart className="h-4 w-4" /> Catalogue & Promos
</TabsTrigger>

<TabsTrigger value="health">
  <AlertTriangle className="h-4 w-4" /> Santé du Système
</TabsTrigger>

<TabsContent value="catalog">
  <ServiceCatalogManager />
</TabsContent>

<TabsContent value="health">
  <SystemHealth />
</TabsContent>
```

---

## 📊 Cas d'Usage

### 1. Promotion Temporaire
```
Admin veut faire une promotion d'été
1. Va dans "Catalogue & Promos"
2. Tab "Codes Promos"
3. Remplit: Code=SUMMER2024, Discount=20%, Description="Offre spéciale"
4. Les clients peuvent utiliser le code à la checkout
5. Admin voit usage_count augmenter en temps réel
6. Après la promo, supprime le code
```

### 2. Ajustement de Tarif
```
Admin veut augmenter le prix de "Analyse de CV"
1. Va dans "Catalogue & Promos"
2. Tab "Services & Tarifs"
3. Cherche "Analyse de CV"
4. Clique "Modifier"
5. Entre nouveau prix: 24.99
6. Clique "Valider"
7. Prix mis à jour instantanément
```

### 3. Surveillance des Erreurs
```
Admin reçoit une alerte de problème
1. Va dans "Santé du Système"
2. Tab "Logs d'Erreurs"
3. Voit les 10 dernières erreurs
4. Clique sur une erreur pour voir les détails techniques
5. Analyse le contexte (stack trace, etc.)
```

### 4. Alerte Espace Disque
```
Serveur approche de la limite (< 10%)
1. Admin voit badge ROUGE dans "Santé du Système"
2. Tab "Espace Disque" affiche "CRITIQUE"
3. Voit la barre rouge à 90%+
4. Suit les recommandations:
   - Archiver vieux fichiers
   - Nettoyer uploads non utilisés
   - Augmenter espace disque
```

---

## 🧪 Testing

### Test 1: Services & Tarifs
```bash
# 1. Charger les services
GET /api/admin/services

# 2. Modifier un prix
PUT /api/admin/services/1/price
{ "price": 29.99 }

# 3. Vérifier le changement
GET /api/admin/services
```

### Test 2: Codes Promos
```bash
# 1. Créer un code promo
POST /api/admin/promo-codes
{
  "code": "TEST2024",
  "discount": 10,
  "description": "Code de test"
}

# 2. Lister les codes
GET /api/admin/promo-codes

# 3. Supprimer un code
DELETE /api/admin/promo-codes/1

# 4. Vérifier (code encore là, is_active=false)
GET /api/admin/promo-codes
```

### Test 3: System Logs
```bash
# 1. Récupérer les logs
GET /api/admin/system/logs

# 2. Créer un log test
POST /api/admin/system/logs
{
  "level": "error",
  "message": "Test error message",
  "source": "TEST",
  "context": { "test": true }
}

# 3. Vérifier que le log apparaît
GET /api/admin/system/logs
```

### Test 4: Disk Usage
```bash
# 1. Récupérer l'état du disque
GET /api/admin/system/disk-usage

# 2. Vérifier les réponses possibles
- available_gb < 4.5 (10% of 45) → status: "critical"
- available_gb < 9 (20% of 45) → status: "warning"
- available_gb >= 9 → status: "healthy"
```

---

## 🔐 Sécurité

### Authentification
- Tous les endpoints requièrent **adminAuth middleware**
- Vérifie le token JWT et le rôle admin
- 401 si token manquant ou invalide
- 403 si l'utilisateur n'est pas admin

### Validation
- **Services**: Prix >= 0
- **Promos**: 
  - Code requis et non vide
  - Discount entre 1-100%
  - Code unique (constraint unique)
  - Description optionnelle
- **Logs**: Level et Message requis

### Rate Limiting
- API limiter appliqué globalement: 120 requests/min par IP

---

## 🚀 Déploiement

### Setup Initial
```bash
# 1. Redémarrer le backend
cd backend && npm run dev

# 2. Le `/api/setup` crée automatiquement les tables:
# - services
# - promo_codes  
# - system_logs

# 3. Seeder les services (optionnel)
# INSERT INTO services (name, category, price) VALUES
# ('Analyse de CV', 'Premium', 19.99),
# ('Coaching Entretien', 'Premium', 49.99),
# ...

# 4. Frontend se connecte automatiquement
npm run dev
```

### Migration depuis Ancienne DB
```sql
-- Si vous avez une table services existante
INSERT INTO services (name, category, price, is_active, created_at, updated_at)
SELECT name, category, price, true, created_at, updated_at
FROM old_services;

-- Réinitialiser les séquences
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));
```

---

## 📈 Monitoring

### Métriques Clés
- **Service Pricing**: Nombre de modifications par jour
- **Promo Codes**: Usage count, taux de conversion
- **System Logs**: Nombre d'erreurs par jour, tendance
- **Disk Usage**: Espace disponible, vitesse de croissance

### Alertes Recommandées
```
1. Disk < 10% → Alerte CRITIQUE (email admin)
2. Disk < 20% → Alerte WARNING
3. Erreurs > 50/jour → Alerte CRITICAL
4. Promo code non utilisé > 7j → Notification
```

---

## 📝 Prochaines Améliorations Possibles

1. **Analytics Avancés**
   - Graphiques d'utilisation des promos
   - Historique des changements de prix
   - Trends des erreurs

2. **Automation**
   - Créer des codes promos schedulés
   - Ajustements de prix automatiques basés sur règles
   - Alertes email sur disque critique

3. **Backup & Restore**
   - Backup automatique des données
   - Restore des fichiers supprimés

4. **Integrations**
   - Slack notifications pour erreurs critiques
   - Datadog/NewRelic pour APM
   - S3 pour archive de logs

5. **Advanced Monitoring**
   - CPU/Memory usage
   - Database performance
   - API response times
   - User session analytics

---

## 📞 Support

Pour questions ou problèmes:
1. Vérifier les logs dans "Santé du Système"
2. Consulter l'onglet Network du Dev Tools
3. Vérifier que le backend répond sur `/api/admin/services`
4. Vérifier les permissions adminAuth

---

## ✅ Checklist de Vérification

- [ ] Composants créés (ServiceCatalogManager.tsx, SystemHealth.tsx)
- [ ] Endpoints ajoutés (Section 11 & 12 dans server.ts)
- [ ] Tables créées (services, promo_codes, system_logs)
- [ ] Admin.tsx mis à jour avec les 2 nouveaux tabs
- [ ] TypeScript compilation: 0 errors
- [ ] Backend redémarré et /api/setup exécuté
- [ ] Tests des endpoints via Postman/curl
- [ ] Frontend accessible et responsive
- [ ] Authentification admin vérifiée
- [ ] Documentation complete et à jour
