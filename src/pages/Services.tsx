import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import BusinessCardModal from "@/components/BusinessCardModal";
import {
  FileText,
  Briefcase,
  GraduationCap,
  PenTool,
  Code,
  Palette,
  FileCheck,
  ArrowRight,
  Mail,
  CheckCircle,
  Zap,
  Eye,
  HelpCircle,
} from "lucide-react";
import servicesImage from "@/assets/services-digital.jpg";
import Breadcrumb from "@/components/Breadcrumb";

import HeroServices from "@/components/services/HeroServices";
import SearchBar from '@/components/SearchBar';
import OptimizationCandidates from "@/components/services/OptimizationCandidates";
import OptimizationCompanies from "@/components/services/OptimizationCompanies";
import CareerTools from "@/components/services/CareerTools";
import VisualCreation from "@/components/services/VisualCreation";
import DigitalServices from "@/components/services/DigitalServices";
import { PWALayout } from "@/components/layout/PWALayout";

export default function Services() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const isCompany = role === "company";
  const [activeTab, setActiveTab] = useState<
    "optimization" | "tools" | "visual" | "digital"
  >("optimization");
  const { isVisible } = useScrollDirection(100);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    {
      id: "optimization",
      label: "Optimisation",
      icon: Zap,
      description: "Améliorer votre profil et candidature",
    },
    {
      id: "tools",
      label: "Outils",
      icon: Briefcase,
      description: "Accéder aux outils professionnels",
    },
    {
      id: "visual",
      label: "Création Visuelle",
      icon: Palette,
      description: "Créer des documents professionnels",
    },
    {
      id: "digital",
      label: "Services Numériques",
      icon: Code,
      description: "Services techniques avancés",
    },
  ];

  return (
    <PWALayout notificationCount={0} messageCount={0}>
    <div className="min-h-screen bg-white pb-24 md:pb-0">

      {/* Centered fixed search bar for Services page */}
      <div className="fixed top-4 left-0 right-0 z-40 pointer-events-none">
        <div className="container mx-auto px-4 flex justify-center pointer-events-auto">
          <div className="w-full max-w-2xl">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher services, formations..." />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-9">
       
        <div className="w-full px-4">
          {/* Navigation - Mobile only */}
          <div className="grid grid-cols-4 gap-3 mb-8 md:hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveTab(
                      item.id as
                        | "optimization"
                        | "tools"
                        | "visual"
                        | "digital"
                    )
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-slate-600"}`} />
                  <span className={`font-medium text-xs text-center ${isActive ? "text-blue-900" : "text-slate-700"}`}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar - Desktop only */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 px-2 mb-4">Services</h3>

                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          setActiveTab(
                            item.id as
                              | "optimization"
                              | "tools"
                              | "visual"
                              | "digital"
                          )
                        }
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 border border-blue-200 text-blue-900"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Help Card */}
                <Card className="p-4 mt-6 border border-slate-200 bg-white">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        Besoin d'aide ?
                      </h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Contactez-nous pour un accompagnement.
                      </p>
                      <Link to="/contact">
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Nous contacter
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 md:px-4">
              <div className="space-y-8 pb-24 md:pb-0">
                {/* Header */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {navigation.find((n) => n.id === activeTab)?.label}
                  </h2>
                  <p className="text-slate-600">
                    {navigation.find((n) => n.id === activeTab)?.description}
                  </p>
                </div>

                {/* Optimization Section */}
                {activeTab === "optimization" && (
                  <div className="animate-fadeIn">
                    {isCompany ? (
                      <OptimizationCompanies />
                    ) : (
                      <OptimizationCandidates />
                    )}
                  </div>
                )}

                {/* Tools Section */}
                {activeTab === "tools" && (
                  <div className="animate-fadeIn">
                    <CareerTools />
                  </div>
                )}

                {/* Visual Creation Section */}
                {activeTab === "visual" && (
                  <div className="animate-fadeIn">
                    <VisualCreation />
                  </div>
                )}

                {/* Digital Services Section - Only for companies */}
                {activeTab === "digital" && isCompany && (
                  <div className="animate-fadeIn">
                    <DigitalServices />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End desktop grid */}

          {/* Mobile and Tablet Content Area */}
          <div className="md:hidden block space-y-6 pb-24 px-4">
            {/* Header */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {navigation.find((n) => n.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-slate-600">
                {navigation.find((n) => n.id === activeTab)?.description}
              </p>
            </div>

            {/* Mobile Content Sections */}
            {activeTab === "optimization" && (
              <div className="animate-fadeIn">
                {isCompany ? (
                  <OptimizationCompanies />
                ) : (
                  <OptimizationCandidates />
                )}
              </div>
            )}

            {activeTab === "tools" && (
              <div className="animate-fadeIn">
                <CareerTools />
              </div>
            )}

            {activeTab === "visual" && (
              <div className="animate-fadeIn">
                <VisualCreation />
              </div>
            )}

            {activeTab === "digital" && isCompany && (
              <div className="animate-fadeIn">
                <DigitalServices />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PWALayout>
  );
}
