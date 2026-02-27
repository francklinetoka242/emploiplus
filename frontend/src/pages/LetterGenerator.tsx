import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import html2pdf from "html2pdf.js";

interface LetterData {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderLocation: string;
  companyName: string;
  companyLocation: string;
  hireDate: string;
  hireName: string;
  position: string;
  letterContent: string;
  template: "white" | "blue" | "orange" | "red" | "yellow";
}

const DEMO_TEMPLATES = [
  { id: "white", name: "Classique Blanc", color: "from-gray-50 to-white", icon: "📄", desc: "Simplicité et professionnel" },
  { id: "blue", name: "Bleu Professionnel", color: "from-blue-500 to-blue-700", icon: "💼", desc: "Modern et confiant" },
  { id: "orange", name: "Orange Dynamique", color: "from-orange-500 to-orange-700", icon: "⚡", desc: "Énergique et créatif" },
  { id: "red", name: "Rouge Impactant", color: "from-red-500 to-red-700", icon: "❤️", desc: "Affirmer votre passion" },
  { id: "yellow", name: "Jaune Optimiste", color: "from-yellow-500 to-yellow-600", icon: "✨", desc: "Chaleureux et optimiste" },
];

export default function LetterGenerator() {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [isLoggedIn] = useState(!!localStorage.getItem("token"));
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userLetters");
    if (saved) {
      setLetters(JSON.parse(saved));
    }
  }, []);

  // Persist letters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userLetters", JSON.stringify(letters));
  }, [letters]);

  const createNewLetter = (template: "white" | "blue" | "orange" | "red" | "yellow" = "white") => {
    const maxLetters = isLoggedIn ? Infinity : 2;
    if (letters.length >= maxLetters) {
      toast.error(`Limite atteinte: ${maxLetters} lettres maximum`);
      return;
    }

    const newLetter: LetterData = {
      id: Date.now().toString(),
      senderName: "",
      senderEmail: "",
      senderPhone: "",
      senderLocation: "",
      companyName: "",
      companyLocation: "",
      hireDate: "",
      hireName: "",
      position: "",
      letterContent: "",
      template,
    };

    setLetters([...letters, newLetter]);
    setSelectedLetter(newLetter);
  };

  const updateLetter = (updates: Partial<LetterData>) => {
    if (!selectedLetter) return;
    const updated = { ...selectedLetter, ...updates };
    setSelectedLetter(updated);
    setLetters(letters.map((l) => (l.id === selectedLetter.id ? updated : l)));
  };

  const deleteLetter = (id: string) => {
    setLetters(letters.filter((l) => l.id !== id));
    if (selectedLetter?.id === id) {
      setSelectedLetter(null);
    }
    toast.success("Lettre supprimée");
  };

  const exportPDF = () => {
    if (!selectedLetter) return;
    const element = document.getElementById("letter-preview");
    if (!element) return;

    const options = {
      margin: 15,
      filename: `Lettre_${selectedLetter.senderName || "lettre"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(options).from(element).save();
    toast.success("PDF généré avec succès");
  };

  // export preview as Word (.doc)
  const exportWord = () => {
    if (!selectedLetter) return;
    const element = document.getElementById("letter-preview");
    if (!element) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${element.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLetter.senderName || "lettre"}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Document Word généré");
  };

  const saveToAccount = async () => {
    if (!selectedLetter) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Veuillez vous connecter pour enregistrer la lettre");
      return;
    }

    try {
      const element = document.getElementById("letter-preview");
      if (!element) throw new Error("Aperçu introuvable");

      const options = {
        margin: 15,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      } as Record<string, unknown>;

      type JsPdfLike = { output: (mode: string) => Blob };

      const pdfPromise: Promise<JsPdfLike> = new Promise((resolve, reject) => {
        try {
          html2pdf()
            .set(options)
            .from(element)
            .toPdf()
            .get("pdf")
            .then((pdf: unknown) => resolve(pdf as JsPdfLike))
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      });

      const pdf = await pdfPromise;
      const blob: Blob = pdf.output("blob");

      const blobToBase64 = (b: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1] || "";
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(b);
      });

      // Upload PDF via helper
      const file = new File([blob], `${selectedLetter.senderName || 'letter'}.pdf`, { type: 'application/pdf' });
      const storage_url = await uploadFile(file, token, 'documents');

      const res = await fetch("/api/user-documents", {
        method: "POST",
        headers: authHeaders('application/json'),
        body: JSON.stringify({
          doc_type: "letter",
          title: selectedLetter.companyName || `Lettre - ${new Date().toLocaleDateString()}`,
          metadata: selectedLetter,
          storage_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur serveur");
      toast.success("Lettre enregistrée dans votre compte");
      window.dispatchEvent(new Event('user-documents-updated'));
    } catch (err) {
      console.error(err);
      const message = typeof err === "object" && err !== null && "message" in err
        ? String((err as Record<string, unknown>).message)
        : String(err);
      toast.error(message || "Impossible d'enregistrer la lettre");
    }
  };

  const LetterPreview = ({ letter }: { letter: LetterData }) => (
    <div
      id="letter-preview"
      className={`bg-white p-12 max-w-4xl mx-auto min-h-screen flex flex-col ${
        letter.template === "white"
          ? "shadow-lg border"
          : letter.template === "blue"
            ? "shadow-2xl bg-gradient-to-br from-blue-50 to-white"
            : letter.template === "orange"
              ? "shadow-2xl bg-gradient-to-br from-orange-50 to-white"
              : letter.template === "red"
                ? "shadow-2xl bg-gradient-to-br from-red-50 to-white border-l-8 border-red-500"
                : "shadow-2xl bg-gradient-to-br from-yellow-50 to-white border-t-4 border-yellow-500"
      }`}
    >
      {/* En-tête expéditeur */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{letter.senderName}</h2>
        <div className="flex flex-wrap gap-6 mt-2 text-sm text-gray-600">
          {letter.senderEmail && <span>{letter.senderEmail}</span>}
          {letter.senderPhone && <span>{letter.senderPhone}</span>}
          {letter.senderLocation && <span>{letter.senderLocation}</span>}
        </div>
      </div>

      {/* Lieu et date */}
      <div className="mb-12">
        <p className="text-gray-700">
          {letter.senderLocation}, {letter.hireDate}
        </p>
      </div>

      {/* Destinataire */}
      <div className="mb-8">
        <p className="text-gray-700">
          {letter.hireName}
          <br />
          {letter.companyName}
          <br />
          {letter.companyLocation}
        </p>
      </div>

      {/* Objet */}
      <div className="mb-8">
        <p className="font-bold text-gray-900">
          Objet : Candidature pour le poste de {letter.position}
        </p>
      </div>

      {/* Corps */}
      <div className="flex-1 mb-8">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {letter.letterContent}
        </p>
      </div>

      {/* Fermeture */}
      <div className="pt-8">
        <p className="text-gray-700 mb-12">Cordialement,</p>
        <p className="text-gray-700">{letter.senderName}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Générateur de lettres de motivation</h1>
          <p className="text-muted-foreground mt-1">
            {isLoggedIn ? (
              "Créez vos lettres illimitées — vous pouvez les enregistrer et exporter."
            ) : (
              <>
                {`Créez jusqu'à 2 lettres (${letters.length}/2)`}
                <span className="block mt-1">Pour créer plus de CVs et lettres, créez un compte.</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <Button asChild className="mr-2">
            <a href="/cv-generator">Aller au créateur de CV</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Créer nouvelle lettre */}
            <Card className="p-6 mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Mes Modèles de Lettre</h3>
                <span className="text-2xl">✉️</span>
              </div>
              <div className="space-y-2 mb-4">
                {DEMO_TEMPLATES.filter((t) => {
                  if (isLoggedIn) return true;
                  return ["white", "blue", "orange"].includes(t.id);
                }).map((template: any) => (
                  <div
                    key={template.id}
                    className="p-3 border border-primary/10 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition cursor-pointer group"
                    onClick={() =>
                      createNewLetter(template.id as "white" | "blue" | "orange" | "red" | "yellow")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl group-hover:scale-110 transition">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm group-hover:text-primary transition">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.desc}</p>
                      </div>
                      <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full border-primary/30 hover:border-primary">
                <a href="/letter-modeles">Voir tous les modèles →</a>
              </Button>
            </Card>

            {/* Mes lettres */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Mes lettres</h3>
              {letters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune lettre créée</p>
              ) : (
                <div className="space-y-3">
                  {letters.map((letter) => (
                    <Card
                      key={letter.id}
                      className={`p-4 cursor-pointer transition ${
                        selectedLetter?.id === letter.id
                          ? "border-blue-500 border-2 bg-blue-50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedLetter(letter)}
                    >
                      <p className="font-medium text-sm truncate">
                        {letter.companyName || "Sans titre"}
                      </p>
                      <p className="text-xs text-muted-foreground">{letter.template}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          {selectedLetter ? (
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Éditer la lettre</h2>

                {/* Infos expéditeur */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Vos informations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Votre nom"
                      value={selectedLetter.senderName}
                      onChange={(e) => updateLetter({ senderName: e.target.value })}
                    />
                    <Input
                      type="email"
                      placeholder="Votre email"
                      value={selectedLetter.senderEmail}
                      onChange={(e) => updateLetter({ senderEmail: e.target.value })}
                    />
                    <Input
                      placeholder="Votre téléphone"
                      value={selectedLetter.senderPhone}
                      onChange={(e) => updateLetter({ senderPhone: e.target.value })}
                    />
                    <Input
                      placeholder="Votre lieu"
                      value={selectedLetter.senderLocation}
                      onChange={(e) => updateLetter({ senderLocation: e.target.value })}
                    />
                  </div>
                </div>

                {/* Infos destinataire */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Destinataire</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nom du recruteur"
                      value={selectedLetter.hireName}
                      onChange={(e) => updateLetter({ hireName: e.target.value })}
                    />
                    <Input
                      placeholder="Nom de l'entreprise"
                      value={selectedLetter.companyName}
                      onChange={(e) => updateLetter({ companyName: e.target.value })}
                    />
                    <Input
                      placeholder="Lieu de l'entreprise"
                      value={selectedLetter.companyLocation}
                      onChange={(e) => updateLetter({ companyLocation: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={selectedLetter.hireDate}
                      onChange={(e) => updateLetter({ hireDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Poste */}
                <div className="mb-8">
                  <Label>Poste recherché</Label>
                  <Input
                    placeholder="Développeur, Designer, etc."
                    value={selectedLetter.position}
                    onChange={(e) => updateLetter({ position: e.target.value })}
                  />
                </div>

                {/* Contenu */}
                <div className="mb-8">
                  <Label>Contenu de la lettre</Label>
                  <Textarea
                    placeholder="Écrivez votre lettre ici..."
                    value={selectedLetter.letterContent}
                    onChange={(e) => updateLetter({ letterContent: e.target.value })}
                    rows={15}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Masquer" : "Afficher"} l'aperçu
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={exportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={exportWord}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger Word
                  </Button>
                  {isLoggedIn && (
                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={saveToAccount}>
                      Enregistrer dans mon compte
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteLetter(selectedLetter.id);
                      setShowPreview(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center min-h-[400px]">
              <Card className="p-12 text-center w-full">
                <p className="text-muted-foreground text-lg mb-4">
                  Sélectionnez une lettre ou créez-en une nouvelle
                </p>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => createNewLetter("white")}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer ma première lettre
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Aperçu */}
        {showPreview && selectedLetter && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Aperçu de votre lettre</h2>
            <LetterPreview letter={selectedLetter} />
          </div>
        )}
      </div>
    </div>
  );
}
