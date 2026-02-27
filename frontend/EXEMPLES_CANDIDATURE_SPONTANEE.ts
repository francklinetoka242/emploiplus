/**
 * Exemples d'Utilisation - Module Candidature Spontanée
 * 
 * Ce fichier montre comment utiliser les nouveaux composants
 * et hooks créés pour le module de candidature spontanée.
 */

// ============================================
// EXEMPLE 1 : Utilisation du Hook useProfileData
// ============================================

import { useProfileData, formatProfileForApplication } from '@/hooks/useProfileData';

function ExampleProfileData() {
  const profile = useProfileData();

  if (!profile) {
    return <div>Profil en cours de chargement...</div>;
  }

  // Accès aux données du profil
  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>Email: {profile.email}</p>
      <p>Profession: {profile.profession}</p>
      
      <h2>Expériences</h2>
      {profile.experiences.map((exp, idx) => (
        <div key={idx}>
          <h3>{exp.job_title} chez {exp.company_name}</h3>
          <p>{exp.start_date} - {exp.end_date}</p>
        </div>
      ))}
      
      <h2>Compétences</h2>
      {profile.skills.map((skill, idx) => (
        <span key={idx} className="badge">{skill.name}</span>
      ))}

      {/* Formater le profil pour envoi API */}
      <textarea value={formatProfileForApplication(profile)} />
    </div>
  );
}

// ============================================
// EXEMPLE 2 : Page Candidature Spontanée
// ============================================

import { useParams, useNavigate } from 'react-router-dom';
import {
  ApplicationOptionSelector,
  ApplicationWithProfile,
  ApplicationManual,
} from '@/components/recruitment';
import { useState, useEffect } from 'react';

export function SpontaneousApplicationExample() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [option, setOption] = useState<'profile' | 'manual' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les infos de l'entreprise
    fetch(`/api/users/${companyId}`)
      .then(res => res.json())
      .then(data => setCompany(data))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <div>Chargement...</div>;
  if (!company) return <div>Entreprise non trouvée</div>;

  const handleSuccess = () => {
    navigate(`/company/${companyId}`);
  };

  return (
    <div className="container">
      <h1>Candidature Spontanée - {company.company_name}</h1>

      {!option ? (
        // Étape 1 : Choisir l'option
        <ApplicationOptionSelector
          onSelectOption={setOption}
          loading={loading}
        />
      ) : option === 'profile' ? (
        // Étape 2A : Candidature avec profil
        <ApplicationWithProfile
          companyId={companyId!}
          companyName={company.company_name}
          onBack={() => setOption(null)}
          onSuccess={handleSuccess}
        />
      ) : (
        // Étape 2B : Candidature manuelle
        <ApplicationManual
          companyId={companyId!}
          companyName={company.company_name}
          onBack={() => setOption(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// ============================================
// EXEMPLE 3 : Utilisation du composant OptionSelector seul
// ============================================

import { ApplicationOptionSelector } from '@/components/recruitment';

function ExampleOptionSelector() {
  const handleSelectOption = (option: 'profile' | 'manual') => {
    console.log('Option sélectionnée:', option);
    // Redirection ou affichage du formulaire
  };

  return (
    <div>
      <h2>Choisissez votre méthode de candidature</h2>
      <ApplicationOptionSelector onSelectOption={handleSelectOption} />
    </div>
  );
}

// ============================================
// EXEMPLE 4 : Utilisation d'ApplicationWithProfile seul
// ============================================

import { ApplicationWithProfile } from '@/components/recruitment';

function ExampleApplicationWithProfile() {
  const companyId = '123';
  const companyName = 'Tech Corp';

  const handleBack = () => {
    console.log('Retour en arrière');
  };

  const handleSuccess = () => {
    console.log('Candidature envoyée avec succès');
    // Redirection ou notification
  };

  return (
    <ApplicationWithProfile
      companyId={companyId}
      companyName={companyName}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}

// ============================================
// EXEMPLE 5 : Utilisation d'ApplicationManual seul
// ============================================

import { ApplicationManual } from '@/components/recruitment';

function ExampleApplicationManual() {
  const companyId = '123';
  const companyName = 'Tech Corp';

  const handleBack = () => {
    console.log('Retour en arrière');
  };

  const handleSuccess = () => {
    console.log('Candidature envoyée avec succès');
    // Redirection ou notification
  };

  return (
    <ApplicationManual
      companyId={companyId}
      companyName={companyName}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}

// ============================================
// EXEMPLE 6 : Intégration dans une page existante
// ============================================

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CompanyProfileWithApplication() {
  const [showApplication, setShowApplication] = useState(false);
  const companyId = '123';

  if (showApplication) {
    return <SpontaneousApplicationExample />;
  }

  return (
    <div>
      {/* Profil de l'entreprise */}
      <Card className="p-6">
        <h1>Tech Corp</h1>
        <p>Description de l'entreprise...</p>
        
        {/* Bouton de candidature spontanée */}
        <Button
          onClick={() => setShowApplication(true)}
          className="bg-orange-500"
        >
          Candidature Spontanée
        </Button>
      </Card>
    </div>
  );
}

// ============================================
// EXEMPLE 7 : Personnalisation des styles
// ============================================

/**
 * Les composants utilisent des classes Tailwind CSS
 * 
 * Pour personnaliser les styles, vous pouvez :
 * 
 * 1. Modifier les classes directement dans les composants
 * 2. Utiliser CSS personnalisé
 * 3. Créer des variantes de composants
 * 
 * Exemples de classes utilisées :
 * - bg-orange-500 : Boutons primaires
 * - bg-blue-50 : Fond d'aperçu
 * - border-2 border-dashed : Zones d'upload
 * - text-green-600 : Confirmations
 * - text-red-500 : Erreurs
 */

// ============================================
// EXEMPLE 8 : Gestion des erreurs
// ============================================

/**
 * Les composants gèrent automatiquement les erreurs avec :
 * 
 * 1. Validations côté client
 * 2. Messages d'erreur clairs
 * 3. Notifications toast
 * 4. Feedback utilisateur
 * 
 * Pour ajouter des validations personnalisées :
 * - Modifiez les fonctions handleSubmit
 * - Ajoutez des validations avant l'envoi
 * - Affichez les erreurs avec toast.error()
 */

// ============================================
// EXEMPLE 9 : Customisation des messages
// ============================================

/**
 * Pour modifier les textes affichés, éditez les composants :
 * 
 * ApplicationOptionSelector.tsx :
 * - Titres des options
 * - Descriptions
 * 
 * ApplicationWithProfile.tsx :
 * - Labels des champs
 * - Messages de confirmation
 * 
 * ApplicationManual.tsx :
 * - Étapes du formulaire
 * - Instructions d'upload
 */

// ============================================
// EXEMPLE 10 : Tests unitaires (structure recommandée)
// ============================================

/**
 * Tests recommandés pour chaque composant :
 * 
 * ApplicationOptionSelector:
 * - Rendre les deux options
 * - Vérifier que les callbacks sont appelés au clic
 * - Tester l'état de chargement
 * 
 * ApplicationWithProfile:
 * - Charger les données du profil
 * - Afficher l'aperçu
 * - Validation du message
 * - Envoi de la candidature
 * 
 * ApplicationManual:
 * - Remplir les champs
 * - Upload de fichiers
 * - Validation des formats
 * - Validation des tailles
 * - Envoi de la candidature
 * 
 * useProfileData:
 * - Récupérer le profil
 * - Parser les données
 * - Formater pour l'API
 */

export {
  ExampleProfileData,
  SpontaneousApplicationExample,
  ExampleOptionSelector,
  ExampleApplicationWithProfile,
  ExampleApplicationManual,
  CompanyProfileWithApplication,
};
