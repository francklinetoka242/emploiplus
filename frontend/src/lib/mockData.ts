/**
 * MOCK DATA - Site statique pur
 * Toutes les données sont en dur pour fonctionner sans API
 */

// ============================================================================
// UTILISATEURS
// ============================================================================
export const MOCK_CURRENT_USER = {
  id: 'user-001',
  email: 'candidate@example.com',
  role: 'candidate',
  full_name: 'Jean Dupont',
  avatar_url: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=0D8ABC&color=fff',
  user_type: 'candidate',
  is_verified: true,
  created_at: '2024-01-15',
  profile: {
    phone: '+243 123 456 789',
    location: 'Kinshasa, Democratic Republic of Congo',
    bio: 'Développeur Full Stack passionné par les technologies web modernes',
    experience_years: 5,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    portfolio_url: 'https://github.com/example',
    linkedin_url: 'https://linkedin.com/in/example',
    cv_url: 'https://example.com/cv.pdf',
  }
};

export const MOCK_ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@emploiplus-group.com',
  role: 'admin',
  full_name: 'Admin User',
  avatar_url: 'https://ui-avatars.com/api/?name=Admin&background=FF6B6B&color=fff',
  user_type: 'admin',
  is_verified: true,
  created_at: '2023-01-01',
};

// ============================================================================
// OFFRES D'EMPLOI
// ============================================================================
export const MOCK_JOBS = [
  {
    id: 'job-001',
    title: 'Développeur Full Stack React',
    company: 'Tech Solutions DRC',
    location: 'Kinshasa, DRC',
    salary_min: 1500,
    salary_max: 2500,
    salary_currency: 'USD',
    employment_type: 'CDI',
    job_category: 'Informatique',
    description: 'Nous cherchons un développeur Full Stack expérimenté pour rejoindre notre équipe. Vous travaillerez sur des projets modernes utilisant React et Node.js.',
    requirements: [
      '5+ ans d\'expérience en développement',
      'Maîtrise de React et TypeScript',
      'Expérience avec Node.js et Express',
      'Base de données PostgreSQL',
      'Git et méthodologies Agile',
    ],
    benefits: [
      'Salaire compétitif',
      'Télétravail flexible',
      'Formation continue',
      'Assurance maladie',
      'Bonus annuel',
    ],
    company_logo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D8ABC&color=fff',
    posted_date: '2024-02-20',
    deadline: '2024-03-20',
    is_active: true,
    view_count: 156,
    applicants_count: 23,
  },
  {
    id: 'job-002',
    title: 'Designer UX/UI',
    company: 'Creative Agency Congo',
    location: 'Kinshasa, DRC',
    salary_min: 1200,
    salary_max: 1800,
    salary_currency: 'USD',
    employment_type: 'CDI',
    job_category: 'Design',
    description: 'Rejoignez notre agence créative pour concevoir des interfaces utilisateur exceptionnelles et créer des expériences utilisateur mémorables.',
    requirements: [
      '3+ ans d\'expérience en UX/UI design',
      'Maîtrise de Figma et Adobe XD',
      'Portfolio solide',
      'Connaissance en design thinking',
      'Communication excellent',
    ],
    benefits: [
      'Environnement créatif',
      'Projets diversifiés',
      'Équipe talentueuse',
      'Flexibilité horaire',
    ],
    company_logo: 'https://ui-avatars.com/api/?name=Creative&background=FF6B6B&color=fff',
    posted_date: '2024-02-18',
    deadline: '2024-03-18',
    is_active: true,
    view_count: 89,
    applicants_count: 12,
  },
  {
    id: 'job-003',
    title: 'Manager Commercial',
    company: 'Business Consulting Africa',
    location: 'Kinshasa, DRC',
    salary_min: 1800,
    salary_max: 2800,
    salary_currency: 'USD',
    employment_type: 'CDI',
    job_category: 'Ventes',
    description: 'Nous recherchons un manager commercial dynamique pour développer le portefeuille clients et augmenter les ventes.',
    requirements: [
      '5+ ans d\'expérience en vente B2B ou B2C',
      'Management d\'équipe',
      'Connaissance du marché africain',
      'Excellent négociateur',
    ],
    benefits: [
      'Salaire + commission',
      'Voiture de fonction',
      'Frais de déplacement',
      'Plans d\'assurance premium',
    ],
    company_logo: 'https://ui-avatars.com/api/?name=Business&background=4ECDC4&color=fff',
    posted_date: '2024-02-15',
    deadline: '2024-03-15',
    is_active: true,
    view_count: 124,
    applicants_count: 8,
  },
];

// ============================================================================
// FORMATIONS
// ============================================================================
export const MOCK_FORMATIONS = [
  {
    id: 'formation-001',
    title: 'React et TypeScript Avancé',
    provider: 'Tech Academy',
    category: 'Informatique',
    level: 'Avancé',
    duration_hours: 40,
    price: 150,
    currency: 'USD',
    description: 'Maîtrisez React avec TypeScript et les patterns avancés pour construire des applications scalables.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
    instructor: 'Marc Expert',
    rating: 4.8,
    students_count: 234,
    modules: 12,
    certificate: true,
  },
  {
    id: 'formation-002',
    title: 'Gestion de Projet Agile',
    provider: 'Professional Institute',
    category: 'Management',
    level: 'Intermédiaire',
    duration_hours: 30,
    price: 120,
    currency: 'USD',
    description: 'Apprenez les méthodologies Agile, Scrum et Kanban pour gérer vos projets efficacement.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    instructor: 'Sophie Duprand',
    rating: 4.6,
    students_count: 189,
    modules: 10,
    certificate: true,
  },
  {
    id: 'formation-003',
    title: 'Data Analysis avec Python',
    provider: 'Data Science Hub',
    category: 'Data Science',
    level: 'Débutant',
    duration_hours: 50,
    price: 180,
    currency: 'USD',
    description: 'Débuter avec Python pour l\'analyse de données, pandas, numpy et visualisation.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=400&h=300&fit=crop',
    instructor: 'Dr. Jean Analytics',
    rating: 4.7,
    students_count: 312,
    modules: 15,
    certificate: true,
  },
];

// ============================================================================
// PUBLICATIONS / NEWSFEED
// ============================================================================
export const MOCK_PUBLICATIONS = [
  {
    id: 'pub-001',
    author_id: 'user-002',
    author: {
      id: 'user-002',
      full_name: 'Alice Martin',
      avatar_url: 'https://ui-avatars.com/api/?name=Alice+Martin&background=FF6B6B&color=fff',
      user_type: 'candidate',
      is_verified: true,
    },
    content: 'Je suis heureux d\'annoncer que j\'ai accepté un poste de Développeur Senior chez Tech Solutions! Merci à tous ceux qui m\'ont soutenu dans cette aventure. Hâte de commencer le 1er mars! 🚀',
    image_url: null,
    created_at: '2024-02-25T14:30:00Z',
    updated_at: '2024-02-25T14:30:00Z',
    likes_count: 45,
    comments_count: 8,
    is_liked_by_viewer: false,
    visibility: 'public',
    category: 'achievement',
  },
  {
    id: 'pub-002',
    author_id: 'user-003',
    author: {
      id: 'user-003',
      full_name: 'Marc Développeur',
      avatar_url: 'https://ui-avatars.com/api/?name=Marc&background=0D8ABC&color=fff',
      user_type: 'candidate',
      is_verified: true,
    },
    content: 'Conseil pour tous les développeurs junior: apprenez les bases d\'abord (HTML, CSS, JS), puis progressez vers les frameworks. La patience est la clé du succès! 💡',
    image_url: null,
    created_at: '2024-02-24T10:15:00Z',
    updated_at: '2024-02-24T10:15:00Z',
    likes_count: 62,
    comments_count: 15,
    is_liked_by_viewer: false,
    visibility: 'public',
    category: 'post',
  },
  {
    id: 'pub-003',
    author_id: 'user-004',
    author: {
      id: 'user-004',
      full_name: 'Tech Solutions HR',
      avatar_url: 'https://ui-avatars.com/api/?name=Tech&background=4ECDC4&color=fff',
      user_type: 'company',
      is_verified: true,
    },
    content: 'Nous recrutons! Nous cherchons des développeurs passionnés pour rejoindre notre équipe en croissance. Envoyez-nous votre CV! 📩',
    image_url: null,
    created_at: '2024-02-23T09:00:00Z',
    updated_at: '2024-02-23T09:00:00Z',
    likes_count: 34,
    comments_count: 12,
    is_liked_by_viewer: false,
    visibility: 'public',
    category: 'job',
  },
];

// ============================================================================
// FAQ
// ============================================================================
export const MOCK_FAQ = [
  {
    id: 'faq-001',
    question: 'Comment puis-je créer un profil?',
    answer: 'Pour créer un profil, cliquez sur "S\'inscrire" en haut de la page et remplissez le formulaire avec vos informations. Vous recevrez un email de confirmation.',
    category: 'Account',
    order: 1,
    is_active: true,
  },
  {
    id: 'faq-002',
    question: 'Comment postule-t-on à une offre d\'emploi?',
    answer: 'Naviguez jusqu\'à la page des offres d\'emploi, sélectionnez une offre, cliquez sur "Postuler" et complétez votre candidature avec votre CV et lettre de motivation.',
    category: 'Jobs',
    order: 2,
    is_active: true,
  },
  {
    id: 'faq-003',
    question: 'Les formations sont-elles certificantes?',
    answer: 'Oui, la plupart de nos formations offrent un certificat après complétion. Vérifiez les détails de chaque formation pour plus d\'informations.',
    category: 'Formations',
    order: 3,
    is_active: true,
  },
  {
    id: 'faq-004',
    question: 'Puis-je modifier mon profil après l\'inscription?',
    answer: 'Oui, vous pouvez mettre à jour votre profil à tout moment en accédant à vos paramètres de profil.',
    category: 'Account',
    order: 4,
    is_active: true,
  },
  {
    id: 'faq-005',
    question: 'Quel est le processus de vérification du compte?',
    answer: 'Après l\'inscription, un email de vérification est envoyé. Cliquez sur le lien dans l\'email pour vérifier votre compte.',
    category: 'Account',
    order: 5,
    is_active: true,
  },
];

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    user_id: 'user-001',
    type: 'job_application_status',
    title: 'Votre candidature a été examinée',
    message: 'Votre candidature pour "Développeur Full Stack React" a été examinée par Tech Solutions DRC.',
    status: 'read',
    created_at: '2024-02-20T10:00:00Z',
    data: { job_id: 'job-001' },
  },
  {
    id: 'notif-002',
    user_id: 'user-001',
    type: 'new_job_match',
    title: 'Nouvelle offre d\'emploi compatible',
    message: 'Une nouvelle offre d\'emploi correspond à votre profil: "Manager Commercial"',
    status: 'unread',
    created_at: '2024-02-24T14:30:00Z',
    data: { job_id: 'job-003' },
  },
  {
    id: 'notif-003',
    user_id: 'user-001',
    type: 'message',
    title: 'Nouveau message de Tech Solutions DRC',
    message: 'Vous avez un nouveau message d\'un recruteur.',
    status: 'unread',
    created_at: '2024-02-25T09:15:00Z',
    data: { user_id: 'user-004' },
  },
];

// ============================================================================
// STATISTIQUES / DASHBOARD
// ============================================================================
export const MOCK_DASHBOARD_STATS = {
  total_users: 3245,
  total_jobs: 156,
  total_formations: 48,
  total_publications: 2341,
  active_candidates: 1987,
  active_companies: 234,
  monthly_revenue: 8500,
  system_health: {
    status: 'healthy',
    uptime_percentage: 99.8,
    response_time_ms: 145,
    database_connections: 45,
    cache_hit_rate: 0.92,
  },
};

// ============================================================================
// SERVICES
// ============================================================================
export const MOCK_SERVICES = [
  {
    id: 'service-001',
    name: 'CV Premium',
    description: 'Création d\'un CV professionnel optimisé par nos experts',
    price: 50,
    currency: 'USD',
    category: 'CV',
    icon: 'FileText',
  },
  {
    id: 'service-002',
    name: 'Lettre de Motivation',
    description: 'Rédaction d\'une lettre de motivation personnalisée',
    price: 30,
    currency: 'USD',
    category: 'Candidature',
    icon: 'Mail',
  },
  {
    id: 'service-003',
    name: 'Coaching Entretien',
    description: 'Session de coaching pour préparer vos entretiens d\'embauche',
    price: 75,
    currency: 'USD',
    category: 'Formation',
    icon: 'Users',
  },
  {
    id: 'service-004',
    name: 'Analyse de Profil',
    description: 'Analyse complète de votre profil LinkedIn et recommandations',
    price: 25,
    currency: 'USD',
    category: 'Analyse',
    icon: 'BarChart3',
  },
];

// ============================================================================
// ENTREPRISES (POUR SEARCH)
// ============================================================================
export const MOCK_COMPANIES = [
  {
    id: 'company-001',
    name: 'Tech Solutions DRC',
    logo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D8ABC&color=fff',
    description: 'Entreprise de technologie leader en République Démocratique du Congo',
    website: 'https://techsolutions-drc.example.com',
    location: 'Kinshasa, DRC',
    employees_count: 150,
    industry: 'Informatique',
    founded_year: 2015,
    verified: true,
  },
  {
    id: 'company-002',
    name: 'Creative Agency Congo',
    logo: 'https://ui-avatars.com/api/?name=Creative&background=FF6B6B&color=fff',
    description: 'Agence créative spécialisée en design et marketing digital',
    website: 'https://creative-congo.example.com',
    location: 'Kinshasa, DRC',
    employees_count: 35,
    industry: 'Design/Marketing',
    founded_year: 2018,
    verified: true,
  },
  {
    id: 'company-003',
    name: 'Business Consulting Africa',
    logo: 'https://ui-avatars.com/api/?name=Business&background=4ECDC4&color=fff',
    description: 'Cabinet de conseil en stratégie d\'affaires et transformation digitale',
    website: 'https://consulting-africa.example.com',
    location: 'Kinshasa, DRC',
    employees_count: 200,
    industry: 'Conseil',
    founded_year: 2010,
    verified: true,
  },
];

// ============================================================================
// UTILISATEURS (pour affichage dans les listes)
// ============================================================================
export const MOCK_USERS = [
  MOCK_CURRENT_USER,
  {
    id: 'user-002',
    email: 'alice@example.com',
    full_name: 'Alice Martin',
    avatar_url: 'https://ui-avatars.com/api/?name=Alice+Martin&background=FF6B6B&color=fff',
    user_type: 'candidate',
    is_verified: true,
    created_at: '2024-01-10',
  },
  {
    id: 'user-003',
    email: 'marc@example.com',
    full_name: 'Marc Développeur',
    avatar_url: 'https://ui-avatars.com/api/?name=Marc&background=0D8ABC&color=fff',
    user_type: 'candidate',
    is_verified: true,
    created_at: '2024-01-05',
  },
  {
    id: 'user-004',
    email: 'hr@techsolutions.com',
    full_name: 'Tech Solutions HR',
    avatar_url: 'https://ui-avatars.com/api/?name=Tech&background=4ECDC4&color=fff',
    user_type: 'company',
    is_verified: true,
    created_at: '2024-01-01',
  },
];

// ============================================================================
// HELPER FUNCTION - Retarder une réponse (simuler du délai réseau)
// ============================================================================
export async function simulateNetworkDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// HELPER FUNCTION - Trouver un élément par ID
// ============================================================================
export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
