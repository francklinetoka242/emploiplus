import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';

export default function VerificationPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [hasCompanyDocs, setHasCompanyDocs] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchDocs();
     
  }, [user]);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/user-documents', { headers: authHeaders() });
      if (!res.ok) return;
      const docs = await res.json();
      setHasIdentity(docs.some((d: any) => d.doc_type === 'identity'));
      setHasCompanyDocs(docs.some((d: any) => ['rccm', 'guarantor_identity'].includes(d.doc_type)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestVerification = async () => {
    if (!user) return;
    // If candidate and no identity, redirect to informations
    if (user.user_type !== 'company' && !hasIdentity) {
      navigate('/parametres/informations?returnTo=verification');
      return;
    }
    // If company and missing docs
    if (user.user_type === 'company' && !hasCompanyDocs) {
      navigate('/parametres/informations?returnTo=verification');
      return;
    }

    setLoading(true);
    try {
      const requested_name = user.user_type === 'company' ? user.company_name || user.full_name : user.full_name;
      const res = await fetch('/api/verify-request', {
        method: 'POST',
        headers: authHeaders('application/json'),
        body: JSON.stringify({ requested_name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Erreur');
      toast.success('Demande de vérification envoyée.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-6">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Vérification du compte</h1>
      <Card className="p-6">
        <p className="mb-4">La vérification permet d'obtenir un badge certifié. Conditions :</p>
        <ul className="list-disc pl-6 mb-4 text-sm text-muted-foreground">
          <li>Fournir une pièce d'identité valide (pour les candidats).</li>
          <li>Pour les entreprises : fournir le RCCM et la pièce d'identité du garant.</li>
          <li>Numéro de téléphone obligatoire sur le profil.</li>
        </ul>
        <p className="mb-4 text-sm text-muted-foreground">Délai de traitement : généralement 24–72 heures ouvrées.</p>

        <div className="flex items-center gap-3">
          <Button onClick={handleRequestVerification} disabled={loading}>
            {loading ? 'Envoi...' : 'Demander la vérification'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/parametres/informations')}>
            Gérer mes documents
          </Button>
        </div>
      </Card>
    </div>
  );
}
