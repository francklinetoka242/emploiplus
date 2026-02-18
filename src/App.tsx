// src/App.tsx
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

import Layout from "./components/Layout";

// Pages publiques
import Home from "./pages/Home";
import Services from "./pages/Services";
import Jobs from "./pages/Jobs";
import Formations from "./pages/Formations";
import FormationEnrollment from "./pages/FormationEnrollment";
import About from "./pages/About";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Candidates from "./pages/Candidates";
import Settings from "./pages/Settings";
import SettingsLayout from "./pages/SettingsLayout";
import SettingsDashboard from "./pages/settings/Dashboard";
import SettingsSecurity from "./pages/settings/Security";
import SettingsInformations from "./pages/settings/Informations";
import SettingsRecommendations from "./pages/settings/Recommendations";
import SettingsDelete from "./pages/settings/DeleteAccount";
import SettingsVerification from "./pages/settings/Verification";
import CandidateProfile from "./pages/settings/CandidateProfile";
import CandidateInformation from "./pages/settings/CandidateInformation";
import CandidatePrivacy from "./pages/settings/CandidatePrivacy";
import CompanyProfile from "./pages/settings/CompanyProfile";
import CompanyPrivacy from "./pages/settings/CompanyPrivacy";
import CompanyLocation from "./pages/settings/CompanyLocation";
import Subscription from "./pages/settings/Subscription";
import CompetenceTest from "./pages/CompetenceTest";
import Recrutement from "./pages/Recrutement";
import SearchResults from "./pages/SearchResults";
import Annuaire from "./pages/Annuaire";
import DocumentationPage from "./pages/Documentation";
import CompanyPage from "./pages/Company";
import CandidateDetailPage from "./pages/CandidateProfile";
import SpontaneousApplication from "./pages/SpontaneousApplication";
import ApplyJob from "./pages/ApplyJob";
import InterviewSimulator from "./pages/InterviewSimulator";
import Newsfeed from "./pages/Newsfeed";
import MyPublications from "./pages/MyPublications";
import PublicationReportPage from "./pages/PublicationReportPage";
import PublicationHidePage from "./pages/PublicationHidePage";
import PublicationSharePage from "./pages/PublicationSharePage";
import CompanyValidations from "./pages/CompanyValidations";
import Login from "./pages/Login";
import LoginUser from "./pages/LoginUser";
import Register from "./pages/Register";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { AuthCallback } from "./pages/AuthCallback";
import { MatchingDemo } from "./pages/MatchingDemo";
import { Connections } from "./pages/Connections";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Cookies from "./pages/Cookies";

// Services et outils
import CVGenerator from "./pages/CVGenerator";
import CVTemplates from "./pages/CVTemplates";
import LetterGenerator from "./pages/LetterGenerator";
import MotivationLetters from "./pages/MotivationLetters";
import DocumentService from "./pages/DocumentService";
import ITService from "./pages/ITService";
import SocialMediaService from "./pages/SocialMediaService";
import GraphicDesignService from "./pages/GraphicDesignService";
import RedactionDocuments from "./pages/RedactionDocuments";
import ConceptionInformatique from "./pages/ConceptionInformatique";
import GestionPlateformes from "./pages/GestionPlateformes";
import ConceptionGraphique from "./pages/ConceptionGraphique";
import ServicesNumeriques from "./pages/ServicesNumeriques";

// Service Catalogs
import RedactionServices from "./pages/services/Redaction";
import InformatiqueServices from "./pages/services/Informatique";
import DigitalServices from "./pages/services/Digital";
import GraphiqueServices from "./pages/services/Graphique";
import FlyerCreator from "./pages/services/FlyerCreator";
import FlyerGallery from "./pages/services/FlyerGallery";
import BannerCreator from "./pages/services/BannerCreator";
import BusinessCardEditor from "./pages/services/BusinessCardEditor";
import BusinessCardModels from "./pages/services/BusinessCardModels";
import PortfolioBuilder from "./pages/services/PortfolioBuilder";

// Admin
import AdminLogin from "./pages/admin/login/page";
import SuperAdminRegister from "./pages/admin/register/super-admin/page";
import ContentAdminRegister from "./pages/admin/register/content-admin/page";
import UserAdminRegister from "./pages/admin/register/user-admin/page";
import VerifySuccessPage from "./pages/admin/verify-success/page";
import VerifyEmailPage from "./pages/admin/verify-email/page";

import AdminLayout from "./pages/admin/layout";
import DashboardPage from "./pages/admin/dashboard/page";
import JobsPage from "./pages/admin/jobs/page";
import UsersPage from "./pages/admin/users/page";
import AdminsPage from "./pages/admin/admins/page";
import FormationsPage from "./pages/admin/formations/page";
import AdminFaqsPage from "./pages/admin/faqs/page";
import PublicationsAdminPage from "./pages/admin/publications/page";
import PortfoliosAdminPage from "./pages/admin/portfolios/page";
import CatalogsPage from "./pages/admin/catalogs/page";
import VerifyRequestsPage from "./pages/admin/verify-requests/page";
import Contact from "./pages/Contact";
import AdminNotificationsPage from "./pages/admin/notifications/page";
import { Messages } from "./pages/Messages";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Supabase auth state listener at app level
  const { user, session, loading } = useSupabaseAuth();

  useEffect(() => {
    // Log auth state changes for debugging
    console.log('Auth state changed:', {
      user: user?.email,
      userType: user?.user_type,
      session: !!session,
      loading
    });

    // When user logs in (session exists)
    if (session && user && !loading) {
      console.log('✅ User logged in:', user.email);
      // The routing logic in Newsfeed.tsx will handle redirects
    }

    // When user logs out (session is null and not loading)
    if (!session && !loading) {
      console.log('❌ User logged out');
      // The router will show login page
    }
  }, [session, user, loading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          {/* Routes publiques */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/emplois" element={<Jobs />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/formations/inscription" element={<FormationEnrollment />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/compte" element={<Profile />} />
            <Route path="/utilisateur/:userId" element={<UserProfile />} />
            <Route path="/parametres" element={<SettingsLayout /> }>
              <Route index element={<SettingsDashboard />} />
              <Route path="securite" element={<SettingsSecurity />} />
              <Route path="verification" element={<SettingsVerification />} />
              <Route path="recommandations" element={<SettingsRecommendations />} />
              <Route path="supprimer" element={<SettingsDelete />} />
              {/* Candidat & Entreprise - Routes consolidées */}
              <Route path="profil" element={<CandidateProfile />} />
              <Route path="informations" element={<CandidateInformation />} />
              <Route path="confidentialite-profil" element={<CandidatePrivacy />} />
              <Route path="profil-entreprise" element={<CompanyProfile />} />
              <Route path="localisation" element={<CompanyLocation />} />
              <Route path="confidentialite" element={<CompanyPrivacy />} />
              <Route path="abonnement" element={<Subscription />} />
            </Route>
            <Route path="/fil-actualite" element={<Newsfeed />} />
            <Route path="/mes-publications" element={<MyPublications />} />
            <Route path="/publication/:publicationId/report" element={<PublicationReportPage />} />
            <Route path="/publication/:publicationId/hide" element={<PublicationHidePage />} />
            <Route path="/publication/:publicationId/share" element={<PublicationSharePage />} />
            <Route path="/company/validations" element={<CompanyValidations />} />
            <Route path="/candidats" element={<Candidates />} />
            <Route path="/candidate/:candidateId" element={<CandidateDetailPage />} />
            <Route path="/spontaneous-application/:companyId" element={<SpontaneousApplication />} />
            <Route path="/recrutement" element={<Recrutement />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/annuaire" element={<Annuaire />} />
            <Route path="/documents" element={<DocumentationPage />} />
            <Route path="/company/:id" element={<CompanyPage />} />
            <Route path="/recrutement/postuler/:id" element={<ApplyJob />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/test-competence" element={<CompetenceTest />} />
            <Route path="/simulateur-entretien" element={<InterviewSimulator />} />
            <Route path="/matching-demo" element={<MatchingDemo />} />
            <Route path="/connexions" element={<Connections />} />
            <Route path="/messages" element={<Messages />} />
            
          {/* Tools et Services */}
            <Route path="/cv-generator" element={<CVGenerator />} />
            <Route path="/cv-modeles" element={<CVTemplates />} />
            <Route path="/letter-generator" element={<LetterGenerator />} />
            <Route path="/letter-modeles" element={<MotivationLetters />} />
            <Route path="/services/redaction" element={<DocumentService />} />
            <Route path="/services/informatique" element={<ITService />} />
            <Route path="/services/digital" element={<SocialMediaService />} />
            <Route path="/services/design" element={<GraphicDesignService />} />
            
            {/* Nouvelles pages de services */}
            <Route path="/services/redaction-documents" element={<RedactionDocuments />} />
            <Route path="/services/conception-informatique" element={<ConceptionInformatique />} />
            <Route path="/services/gestion-plateformes" element={<GestionPlateformes />} />
            <Route path="/services/conception-graphique" element={<ConceptionGraphique />} />
            <Route path="/services/numeriques" element={<ServicesNumeriques />} />
            
            {/* Service Catalogs */}
            <Route path="/services/redaction-pro" element={<RedactionServices />} />
            <Route path="/services/informatique-pro" element={<InformatiqueServices />} />
            <Route path="/services/digital-pro" element={<DigitalServices />} />
            <Route path="/services/graphique-pro" element={<GraphiqueServices />} />
            <Route path="/services/flyers" element={<FlyerGallery />} />
            <Route path="/services/flyer-creator" element={<FlyerCreator />} />
            <Route path="/services/banner-creator" element={<BannerCreator />} />
            <Route path="/services/business-card-editor" element={<BusinessCardEditor />} />
            <Route path="/services/business-card-models" element={<BusinessCardModels />} />
            <Route path="/services/portfolio-builder" element={<PortfolioBuilder />} />
          </Route>

          <Route path="/connexion" element={<LoginUser />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/cookies" element={<Cookies />} />



          {/* ADMIN — TOUT DANS LE LAYOUT */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="formations" element={<FormationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="verify-requests" element={<VerifyRequestsPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="publications" element={<PublicationsAdminPage />} />
            <Route path="portfolios" element={<PortfoliosAdminPage />} />
            <Route path="catalogs" element={<CatalogsPage />} />
          </Route>

          {/* Pages spéciales */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/verify-success" element={<VerifySuccessPage />} />
          <Route path="/admin/verify-email" element={<VerifyEmailPage />} />
          <Route path="/admin/register/super-admin" element={<SuperAdminRegister />} />
          <Route path="/admin/register/content-admin" element={<ContentAdminRegister />} />
          <Route path="/admin/register/user-admin" element={<UserAdminRegister />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;