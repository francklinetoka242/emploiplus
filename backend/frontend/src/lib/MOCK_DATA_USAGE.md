/**
 * UTILISATION DU MOCK DATA - Guide complet
 * 
 * Chaque fois qu'un composant ou une page fait un appel API,
 * il reçoit maintenant des données en dur depuis mockData.ts
 */

// ============================================================================
// EXEMPLE 1: AFFICHER UNE LISTE DE JOBS
// ============================================================================

// AVANT (avec API):
// const [jobs, setJobs] = useState([]);
// useEffect(() => {
//   api.getJobs().then(res => setJobs(res.data));
// }, []);

// APRÈS (statique):
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

export function JobsList() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    // Cette fonction retourne maintenant du mock data au lieu d'appeller une API
    api.getJobs().then(res => setJobs(res.data));
  }, []);
  
  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          {/* Les données sont statiques mais le composant fonctionne normalement */}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXEMPLE 2: UTILISER apiFetch DIRECTEMENT
// ============================================================================

import { apiFetch } from '@/lib/headers';

async function fetchUserProfile() {
  // apiFetch() est maintenant un stub - retourne null ou []
  const result = await apiFetch('/api/profile');
  
  // result sera { data: null } car c'est un stub statique
  console.warn('[STATIC] No actual API call made');
}

// ============================================================================
// EXEMPLE 3: Les hooks CONTINUENT à FONCTIONNER
// ============================================================================

import { useQuery } from '@tanstack/react-query';

export function FormationsList() {
  // useQuery continue de fonctionner, mais il utilise apiFetch() statique
  const { data: formations, isLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: () => api.getFormations(),
  });
  
  // formations sera MOCK_FORMATIONS
  // isLoading sera false après 100-300ms
  
  return (
    <div>
      {formations?.data?.map(f => (
        <div key={f.id}>
          <h3>{f.title}</h3>
          <p>{f.price} USD</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXEMPLE 4: MODIFIER DES MOCK DATA
// ============================================================================

// Si vous voulez changer les données affichées:
// 1. Ouvrez src/lib/mockData.ts
// 2. Modifiez MOCK_JOBS, MOCK_FORMATIONS, etc.
// 3. Attendez le hot-reload (ou relancez le dev server)
// 4. Les changements s'affichent automatiquement

// Exemple: Ajouter un job
const NEW_JOB = {
  id: 'job-004',
  title: 'Mon nouvel emploi',
  company: 'Ma compagnie',
  location: 'Kinshasa',
  salary_min: 2000,
  salary_max: 3000,
  // ... autres propriétés
};

// Ajoutez le dans mockData.ts:
// export const MOCK_JOBS = [
//   ...MOCK_JOBS,  // Jobs existants
//   NEW_JOB         // Votre nouveau job
// ];

// ============================================================================
// EXEMPLE 5: CRÉER DE NOUVELLES DONNÉES
// ============================================================================

// Pour ajouter de nouvelles données (ex: formations additionnelles):

// 1. Allez dans mockData.ts
// 2. Créez un nouveau objet:

const NEW_FORMATION = {
  id: 'formation-004',
  title: 'Web Design Avancé',
  provider: 'Design Institute',
  category: 'Design',
  level: 'Avancé',
  duration_hours: 60,
  price: 200,
  currency: 'USD',
  description: 'Maîtrisez le web design moderne',
  thumbnail: 'https://images.unsplash.com/photo-...',
  instructor: 'Design Expert',
  rating: 4.9,
  students_count: 456,
  modules: 16,
  certificate: true,
};

// 3. Ajoutez-le au tableau MOCK_FORMATIONS:
// export const MOCK_FORMATIONS = [
//   ...MOCK_FORMATIONS,
//   NEW_FORMATION
// ];

// ============================================================================
// EXEMPLE 6: AJOUTER DES PUBLICATIONS (NEWSFEED)
// ============================================================================

const NEW_PUBLICATION = {
  id: 'pub-004',
  author_id: 'user-005',
  author: {
    id: 'user-005',
    full_name: 'New Author',
    avatar_url: 'https://ui-avatars.com/api/?name=New+Author',
    user_type: 'candidate',
    is_verified: true,
  },
  content: 'Mon nouveau post sur le newsfeed!',
  image_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  likes_count: 0,
  comments_count: 0,
  is_liked_by_viewer: false,
  visibility: 'public',
  category: 'post',
};

// Ajoutez dans mockData.ts:
// export const MOCK_PUBLICATIONS = [
//   ...MOCK_PUBLICATIONS,
//   NEW_PUBLICATION
// ];

// ============================================================================
// IMPORTANT: STATUT DU SITE STATIQUE
// ============================================================================

/*
Ce site est maintenant 100% STATIQUE:

✅ PAS de serveur backend requis
✅ PAS de base de données
✅ PAS d'authentification réelle
✅ PAS de persistence des données (sauf localStorage)
✅ Déployable sur n'importe quel CDN/hébergement statique

⚠️ Mais aussi:

❌ Les formulaires ne sauvegardent rien
❌ Pas de création de nouveaux contenus (sans coder)
❌ Pas de login réel
❌ Pas de recherche/filtrage dynamique
❌ Pas de synchronisation en temps réel

ASTUCE: Vous pouvez utiliser localStorage pour persister
les données entre les rechargements de page!
*/

// ============================================================================
// LOCALISATION DES DONNÉES
// ============================================================================

// Tous les mock data se trouvent dans: src/lib/mockData.ts
// Tous les endpoints se trouvent dans: src/lib/api-static.ts
// Les stubs de communication se trouvent dans: src/lib/headers.ts

// Structure des données:
// - MOCK_JOBS → Offres d'emploi
// - MOCK_FORMATIONS → Formations disponibles
// - MOCK_PUBLICATIONS → Posts du newsfeed
// - MOCK_FAQ → Questions fréquentes
// - MOCK_NOTIFICATIONS → Notifications utilisateur
// - MOCK_USERS → Utilisateurs du site
// - MOCK_SERVICES → Services offerts
// - MOCK_COMPANIES → Entreprises
// - MOCK_CURRENT_USER → Utilisateur connecté
// - MOCK_DASHBOARD_STATS → Statistiques

export default {};
