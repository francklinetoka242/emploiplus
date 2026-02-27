import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { ApplicationOptionSelector } from "@/components/recruitment/ApplicationOptionSelector";
import { ApplicationWithProfile } from "@/components/recruitment/ApplicationWithProfile";
import { ApplicationManual } from "@/components/recruitment/ApplicationManual";
import { ApplicationConfirmation } from "@/components/recruitment/ApplicationConfirmation";

interface Company {
  id: string;
  company_name: string;
  [key: string]: unknown;
}

export default function SpontaneousApplicationPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [option, setOption] = useState<"profile" | "manual" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let mounted = true;
    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/users/${companyId}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setCompany(data);
        }
      } catch (err) {
        console.error("Error fetching company:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCompany();
    return () => { mounted = false; };
  }, [companyId]);

  const handleSuccess = () => {
    setShowConfirmation(true);
    // Auto-dismiss and navigate after 5 seconds
    setTimeout(() => {
      navigate(`/company/${companyId}`);
    }, 5000);
  };

  const handleBack = () => {
    setOption(null);
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-12 max-w-2xl mx-auto">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Entreprise non trouvée</p>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl mx-auto">
      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <ApplicationConfirmation
          companyName={company.company_name}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => {
            if (option) {
              handleBack();
            } else {
              navigate(-1);
            }
          }}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {option ? "Changer d'option" : "Retour"}
        </button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidature Spontanée</h1>
          <p className="text-gray-600">
            Postulez à l'entreprise <span className="font-semibold">{company.company_name}</span>
          </p>
        </div>
      </div>

      {/* Options selector or form */}
      {!option ? (
        <ApplicationOptionSelector 
          onSelectOption={setOption}
          loading={loading}
        />
      ) : option === "profile" ? (
        <ApplicationWithProfile
          companyId={companyId || ""}
          companyName={company.company_name}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      ) : (
        <ApplicationManual
          companyId={companyId || ""}
          companyName={company.company_name}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
