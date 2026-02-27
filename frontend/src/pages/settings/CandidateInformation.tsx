import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, FileText, BookOpen } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import { uploadFile } from '@/lib/upload';

export default function CandidateInformation() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [contractType, setContractType] = useState("");
  const [availability, setAvailability] = useState("");
  const [salary, setSalary] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Diplômes
  const [diplomas, setDiplomas] = useState<Array<{id?: string; diploma: string; year: string; school: string}>>([]);
  const [addingDiploma, setAddingDiploma] = useState(false);
  const [newDiploma, setNewDiploma] = useState({ diploma: "", year: "", school: "" });
  
  // Prétentions salariales avec sélection
  const salaryOptions = ["200.000", "300.000", "400.000", "500.000", "800.000", "1.000.000"];
  
  // Upload de documents
  const [selectedDocType, setSelectedDocType] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savedCVs, setSavedCVs] = useState<any[]>([]);
  const [savedLetters, setSavedLetters] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documents, setDocuments] = useState<Record<string, any>>({
    cv: { url: "", uploadDate: "" },
    recommendation: { url: "", uploadDate: "" },
    diploma: { url: "", uploadDate: "" },
    certificate: { url: "", uploadDate: "" },
    identity: { url: "", uploadDate: "", emissionDate: "", expirationDate: "" },
    nui: { url: "", uploadDate: "" },
    passport: { url: "", uploadDate: "", emissionDate: "", expirationDate: "" }
  });

  const docTypes = [
    { value: "cv", label: "CV" },
    { value: "recommendation", label: "Lettres de recommandation" },
    { value: "diploma", label: "Diplômes" },
    { value: "certificate", label: "Certificats" },
    { value: "identity", label: "Pièce d'identité (CNI)" },
    { value: "nui", label: "NUI (Numéro d'identification unique)" },
    { value: "passport", label: "Passeport" }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setContractType(typeof data.contract_type === 'string' ? data.contract_type : "");
      setAvailability(typeof data.availability === 'string' ? data.availability : "");
      setSalary(typeof data.salary_expectation === 'string' ? data.salary_expectation : "");
      setDiplomas(data.diplomas || []);
      setDocuments(data.documents || {
        cv: { url: "", uploadDate: "" },
        recommendation: { url: "", uploadDate: "" },
        diploma: { url: "", uploadDate: "" },
        certificate: { url: "", uploadDate: "" },
        identity: { url: "", uploadDate: "", emissionDate: "", expirationDate: "" },
        nui: { url: "", uploadDate: "" },
        passport: { url: "", uploadDate: "", emissionDate: "", expirationDate: "" }
      });
      
      // Fetch saved CVs and letters
      await fetchSavedDocuments();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      
      // Fetch CVs
      const cvRes = await fetch("/api/user-documents?doc_type=cv", { headers });
      if (cvRes.ok) {
        const cvData = await cvRes.json();
        setSavedCVs(Array.isArray(cvData) ? cvData : []);
      }
      
      // Fetch Letters
      const letterRes = await fetch("/api/user-documents?doc_type=cover_letter", { headers });
      if (letterRes.ok) {
        const letterData = await letterRes.json();
        setSavedLetters(Array.isArray(letterData) ? letterData : []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des documents créés:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedDocType) {
      toast.error("Veuillez sélectionner un type de document");
      return;
    }

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    setUploadingDoc(true);
    try {
      const token = localStorage.getItem('token');
      const documentUrl = await uploadFile(file, token, 'documents');

      // Mettre à jour les documents localement
      const updatedDocs = { ...documents, [selectedDocType]: documentUrl };
      setDocuments(updatedDocs);

      // Sauvegarder dans la base de données
      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ documents: updatedDocs }),
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde du document');
      
      const docLabel = docTypes.find(d => d.value === selectedDocType)?.label || selectedDocType;
      toast.success(`${docLabel} téléchargé avec succès`);
      setSelectedDocType("");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du téléchargement du document");
    } finally {
      setUploadingDoc(false);
      // Reset input
      const fileInput = document.getElementById('doc-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleRemoveDocument = async (docType: string) => {
    try {
      const updatedDocs = { ...documents };
      updatedDocs[docType] = { url: "", uploadDate: "", emissionDate: "", expirationDate: "" };
      setDocuments(updatedDocs);

      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ documents: updatedDocs }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');
      const docLabel = docTypes.find(d => d.value === docType)?.label || docType;
      toast.success(`${docLabel} supprimé`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression du document");
    }
  };

  // Gestion des diplômes
  const handleAddDiploma = async () => {
    if (!newDiploma.diploma || !newDiploma.year || !newDiploma.school) {
      toast.error("Veuillez remplir tous les champs du diplôme");
      return;
    }

    const updatedDiplomas = [...diplomas, { ...newDiploma, id: Date.now().toString() }];
    setDiplomas(updatedDiplomas);
    
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ diplomas: updatedDiplomas }),
      });
      toast.success("Diplôme ajouté");
      setNewDiploma({ diploma: "", year: "", school: "" });
      setAddingDiploma(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de l'ajout du diplôme");
    }
  };

  const handleRemoveDiploma = async (id: string | undefined) => {
    const updatedDiplomas = diplomas.filter(d => d.id !== id);
    setDiplomas(updatedDiplomas);
    
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ diplomas: updatedDiplomas }),
      });
      toast.success("Diplôme supprimé");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression du diplôme");
    }
  };

  // Vérification des pièces expirées
  const isDocumentExpired = (docType: string): boolean => {
    const doc = documents[docType];
    if (!doc?.expirationDate) return false;
    const expirationDate = new Date(doc.expirationDate);
    return expirationDate < new Date();
  };

  // Gestion des prétentions salariales
  const handleSalaryChange = (value: string) => {
    setSalary(value);
  };

  const handleSalaryIncrement = () => {
    const currentIndex = salaryOptions.indexOf(salary);
    if (currentIndex < salaryOptions.length - 1) {
      setSalary(salaryOptions[currentIndex + 1]);
    }
  };

  const handleSalaryDecrement = () => {
    const currentIndex = salaryOptions.indexOf(salary);
    if (currentIndex > 0) {
      setSalary(salaryOptions[currentIndex - 1]);
    }
  };

  const handleSaveSection = async (section: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const body: Record<string, unknown> = {};
      
      if (section === 'preferences') {
        body.contract_type = contractType;
        body.availability = availability;
        body.salary_expectation = salary;
      }

      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditingSection(null);
      toast.success("Section mise à jour");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Mes informations</h2>

      <div className="space-y-8">
        {/* SECTION 0: Mes CV et Lettres de Motivation Créés */}
        {(savedCVs.length > 0 || savedLetters.length > 0) && (
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span> Mes documents créés
            </h3>
            
            <div className="grid gap-4">
              {/* CVs */}
              {savedCVs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> CVs ({savedCVs.length})
                  </h4>
                  <div className="space-y-2">
                    {savedCVs.map((cv) => (
                      <div key={cv.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-blue-900">{cv.title || `CV ${cv.id}`}</p>
                          <p className="text-xs text-gray-500">
                            Créé le {cv.created_at ? new Date(cv.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                        {cv.storage_url && (
                          <a 
                            href={cv.storage_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Voir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Lettres de Motivation */}
              {savedLetters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Lettres de Motivation ({savedLetters.length})
                  </h4>
                  <div className="space-y-2">
                    {savedLetters.map((letter) => (
                      <div key={letter.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-blue-900">{letter.title || `Lettre ${letter.id}`}</p>
                          <p className="text-xs text-gray-500">
                            Créée le {letter.created_at ? new Date(letter.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                        {letter.storage_url && (
                          <a 
                            href={letter.storage_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Voir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 1: Parcours - Diplômes */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📚 Mes Diplômes</h3>
            {!addingDiploma && (
              <Button size="sm" onClick={() => setAddingDiploma(true)} className="bg-blue-600 hover:bg-blue-700">
                + Ajouter un diplôme
              </Button>
            )}
          </div>

          {/* Formulaire d'ajout de diplôme */}
          {addingDiploma && (
            <div className="space-y-3 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="diplomaType">Type de diplôme</Label>
                <Input
                  id="diplomaType"
                  placeholder="Ex: Bac+5 Informatique, Master en Gestion"
                  value={newDiploma.diploma}
                  onChange={(e) => setNewDiploma({ ...newDiploma, diploma: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diplomaYear">Année d'obtention</Label>
                <Input
                  id="diplomaYear"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  placeholder="Ex: 2023"
                  value={newDiploma.year}
                  onChange={(e) => setNewDiploma({ ...newDiploma, year: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diplomaSchool">École / Université</Label>
                <Input
                  id="diplomaSchool"
                  placeholder="Ex: Université de Brazzaville"
                  value={newDiploma.school}
                  onChange={(e) => setNewDiploma({ ...newDiploma, school: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddDiploma} className="flex-1 bg-green-600 hover:bg-green-700">
                  ✓ Ajouter
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setAddingDiploma(false);
                  setNewDiploma({ diploma: "", year: "", school: "" });
                }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Liste des diplômes */}
          {diplomas.length > 0 ? (
            <div className="space-y-2">
              {diplomas.map((dip) => (
                <div key={dip.id} className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{dip.diploma}</p>
                    <p className="text-xs text-gray-600">{dip.school} • {dip.year}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveDiploma(dip.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                  >
                    🗑️
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucun diplôme ajouté. Cliquez sur "+ Ajouter un diplôme" pour en ajouter.</p>
          )}
        </div>

        {/* SECTION 1.5: Gestion des Documents */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">📄 Télécharger vos documents</h3>
          
          <div className="space-y-4">
            {/* Sélection du type de document */}
            <div className="space-y-2">
              <Label htmlFor="docType">Type de document à télécharger</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType} disabled={uploadingDoc}>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Sélectionner le type de document..." />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((doc) => (
                    <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Champs de dates pour certains documents */}
            {(selectedDocType === 'identity' || selectedDocType === 'passport') && (
              <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900">Informations sur le document</p>
                
                <div className="space-y-2">
                  <Label htmlFor="emissionDate">Date d'émission</Label>
                  <Input
                    id="emissionDate"
                    type="date"
                    onChange={(e) => {
                      const doc = documents[selectedDocType] || {};
                      documents[selectedDocType] = { ...doc, emissionDate: e.target.value };
                      setDocuments({ ...documents });
                    }}
                    value={documents[selectedDocType]?.emissionDate || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Date d'expiration</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    onChange={(e) => {
                      const doc = documents[selectedDocType] || {};
                      documents[selectedDocType] = { ...doc, expirationDate: e.target.value };
                      setDocuments({ ...documents });
                    }}
                    value={documents[selectedDocType]?.expirationDate || ""}
                  />
                </div>

                {isDocumentExpired(selectedDocType) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ⚠️ Votre {docTypes.find(d => d.value === selectedDocType)?.label.toLowerCase() || 'document'} est expirée. Veuillez choisir une pièce valide.
                  </div>
                )}
              </div>
            )}

            {/* Input de fichier */}
            {selectedDocType && (
              <div className="space-y-2">
                <Label htmlFor="doc-upload">Choisir un fichier PDF</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="doc-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDoc}
                    className="flex-1"
                  />
                  <Button
                    disabled={uploadingDoc || !selectedDocType}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingDoc ? 'Upload...' : 'Upload'}
                  </Button>
                </div>
              </div>
            )}

            {/* Affichage des documents téléchargés */}
            {Object.keys(documents).some(key => documents[key]) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Documents téléchargés ✓</h4>
                <div className="space-y-2">
                  {docTypes.map((doc) => (
                    documents[doc.value] && (
                      <div key={doc.value} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm font-medium text-green-700">{doc.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.value)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Supprimer
                        </Button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Préférences de Recherche - Affichage dynamique */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Préférences de Recherche</h3>
            {editingSection !== 'preferences' ? (
              <Button size="sm" variant="outline" onClick={() => setEditingSection('preferences')}>Modifier</Button>
            ) : (
              <div className="space-x-2">
                <Button size="sm" onClick={() => handleSaveSection('preferences')} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingSection(null)}>Annuler</Button>
              </div>
            )}
          </div>

          {/* Type de contrat */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="contractType">Type de contrat recherché</Label>
            <Select value={contractType} onValueChange={setContractType} disabled={editingSection !== 'preferences'}>
              <SelectTrigger id="contractType">
                <SelectValue placeholder="Sélectionner un type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Prestation">Prestation</SelectItem>
              </SelectContent>
            </Select>
            {editingSection !== 'preferences' && contractType && (
              <p className="text-xs text-muted-foreground">Contrat : {contractType}</p>
            )}
          </div>

          {/* Disponibilité */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="availability">Disponibilité</Label>
            <Select value={availability} onValueChange={setAvailability} disabled={editingSection !== 'preferences'}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Sélectionner votre disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediate">Immédiate</SelectItem>
                <SelectItem value="WithNotice">Avec préavis</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
            {editingSection !== 'preferences' && availability && (
              <p className="text-xs text-muted-foreground">Disponible : {availability}</p>
            )}
          </div>

          {/* Prétentions salariales */}
          <div className="space-y-3">
            <Label>Prétentions salariales (optionnel)</Label>
            <p className="text-sm text-muted-foreground">Cette information vous aide à filtrer les offres correspondant à vos attentes.</p>
            
            {editingSection === 'preferences' ? (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                {/* Sélecteur des salaires prédéfinis */}
                <div className="space-y-2">
                  <Label htmlFor="salary-select" className="text-sm">Choisir parmi les salaires proposés:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {salaryOptions.map((option) => (
                      <Button
                        key={option}
                        variant={salary === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSalaryChange(option)}
                        className={salary === option ? "bg-blue-600" : ""}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Boutons +/- */}
                {salary && (
                  <div className="space-y-2">
                    <Label className="text-sm">Ajuster:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSalaryDecrement}
                        disabled={salaryOptions.indexOf(salary) === 0}
                      >
                        ➖ Moins
                      </Button>
                      <span className="flex-1 text-center font-semibold text-lg">{salary} CFA</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSalaryIncrement}
                        disabled={salaryOptions.indexOf(salary) === salaryOptions.length - 1}
                      >
                        ➕ Plus
                      </Button>
                    </div>
                  </div>
                )}

                {/* Champ personnalisé */}
                <div className="space-y-2">
                  <Label htmlFor="salary-custom" className="text-sm">Ou entrez votre propre salaire:</Label>
                  <Input
                    id="salary-custom"
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Ex: 750 000 CFA"
                    className="text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                {salary ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-700">Salaire attendu : {salary} CFA</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucun salaire défini</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
