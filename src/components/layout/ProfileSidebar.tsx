// src/components/layout/ProfileSidebar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DiscreetModeCard from "@/components/DiscreetModeCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

export function ProfileSidebar() {
  const { user } = useAuth();
  const { role, isCandidate, isCompany, isAdmin } = useUserRole(user);
  const [stats, setStats] = useState<ProfileStats>({
    verified: false,
    subscription: false,
    applicationsCount: 0,
    profileViewsWeek: 3,
    profileViewsTotal: 12,
    jobsCount: 0,
  });

  if (!user) return null;

  return (
    <Card className="p-6 border-0 shadow-md sticky top-24 h-fit">
      {/* Photo et infos de base */}
      <div className="text-center mb-6">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
          <AvatarFallback className="text-2xl font-bold">
            {(user?.full_name || user?.company_name || "")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg">{user?.full_name || user?.company_name}</h3>
        <p className="text-sm text-muted-foreground">
          {isCandidate ? "Candidat" : isCompany ? "Entreprise" : "Administrateur"}
        </p>
        {isCandidate && user?.profession && (
          <p className="text-xs text-primary font-semibold mt-1">💼 {user.profession}</p>
        )}
      </div>

      {/* Score de complétude (si candidat) */}
      {isCandidate && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Profil Complet</span>
            <span className="text-lg font-bold text-primary">42%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
              style={{ width: "42%" }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Complétez votre profil pour augmenter vos chances</p>
        </div>
      )}

      {/* Statistiques de visites du profil */}
      {(isCandidate || isCompany) && (
        <div className="mb-6 p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-xs mb-3 text-blue-900 flex items-center gap-2">
            📊 Visites du profil
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-800">Cette semaine</span>
              <span className="font-bold text-sm text-blue-600">{stats.profileViewsWeek || 0}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full" 
                style={{ width: `${Math.min((stats.profileViewsWeek || 0) * 10, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-blue-200">
              <span className="text-xs text-blue-700">Total</span>
              <span className="font-semibold text-xs text-blue-600">{stats.profileViewsTotal || 0}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 italic">💡 Améliore ton profil!</p>
        </div>
      )}

      {/* Mode Recherche Discrète */}
      {isCandidate && (
        <div className="mb-6">
          <DiscreetModeCard userType={role} company={user?.company_name} companyId={user?.company_id} />
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="border-t pt-4 mb-4">
        <div className="space-y-2">
          {isCandidate && (
            <>
              <Link to="/parametres/verification" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Statut</span>
                <span className={`font-semibold ${stats.verified ? "text-green-600" : "text-red-600"}`}>
                  {stats.verified ? "✓ Vérifié" : "✗ Non vérifié"}
                </span>
              </Link>
              <Link to="/parametres/abonnement" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Abonnement</span>
                <span className={`font-semibold ${stats.subscription ? "text-green-600" : "text-gray-600"}`}>
                  {stats.subscription ? "Actif" : "Inactif"}
                </span>
              </Link>
              <Link to="/candidatures" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Candidatures</span>
                <span className="font-semibold text-primary">{stats.applicationsCount}</span>
              </Link>
            </>
          )}
          {isCompany && (
            <>
              <Link to="/parametres/verification" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Statut</span>
                <span className={`font-semibold ${stats.verified ? "text-green-600" : "text-red-600"}`}>
                  {stats.verified ? "✓ Vérifié" : "✗ Non vérifié"}
                </span>
              </Link>
              <Link to="/parametres/abonnement" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Abonnement</span>
                <span className={`font-semibold ${stats.subscription ? "text-green-600" : "text-gray-600"}`}>
                  {stats.subscription ? "Actif" : "Inactif"}
                </span>
              </Link>
              <Link to="/emplois" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Offres</span>
                <span className="font-semibold text-primary">{stats.jobsCount || 0}</span>
              </Link>
              <Link to="/candidatures" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                <span className="text-muted-foreground">Candidatures</span>
                <span className="font-semibold text-primary">{stats.applicationsCount}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Documents */}
      {isCandidate && (
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link to="/parametres/profil">
            <FileText className="h-4 w-4 mr-2" />
            Mes documents
          </Link>
        </Button>
      )}

      {/* Settings */}
      <Button asChild variant="ghost" className="w-full mt-4" size="sm">
        <Link to="/parametres">⚙️ Paramètres</Link>
      </Button>
    </Card>
  );
}
