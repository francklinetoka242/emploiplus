import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Mic, Send, ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

interface Message {
  role: "user" | "interviewer";
  content: string;
}

const INTERVIEW_QUESTIONS = [
  "Parlez-moi de votre expérience professionnelle.",
  "Quels sont vos points forts?",
  "Quels sont vos points faibles?",
  "Pourquoi êtes-vous intéressé par ce poste?",
  "Où vous voyez-vous dans 5 ans?",
  "Comment travaillez-vous en équipe?",
  "Décrivez une situation difficile au travail et comment vous l'avez gérée.",
  "Avez-vous des questions pour moi?",
];

export default function InterviewSimulator() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "interview" | "feedback">("intro");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [roleType, setRoleType] = useState("Technique");
  const [difficulty, setDifficulty] = useState<"standard"|"advanced">("standard");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const testTaken = localStorage.getItem("interview_sim_taken");
    if (testTaken && !user) {
      toast.warning("Vous avez déjà utilisé votre essai gratuit. Connectez-vous pour plus de simulations.");
    }
  }, [user]);

  const startInterview = () => {
    if (!position.trim()) {
      toast.error("Veuillez entrer le poste visé");
      return;
    }
    // customize initial questions based on roleType/difficulty
    let intro = `Bonjour! Je suis votre interviewer. Vous postulez pour le poste de ${position}${company ? ` chez ${company}` : ""}.`;
    if(roleType==='Technique') intro += ' Nous allons couvrir des questions techniques et comportementales.';
    if(difficulty==='advanced') intro += ' Niveau avancé: attendez-vous à des questions de profondeur.';
    setMessages([
      {
        role: "interviewer",
        content: `${intro} ${INTERVIEW_QUESTIONS[0]}`,
      },
    ]);
    setStage("interview");
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Veuillez fournir une réponse");
      return;
    }

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: currentAnswer },
    ];
    setMessages(newMessages);
    setCurrentAnswer("");
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex >= INTERVIEW_QUESTIONS.length) {
        // Interview is complete
        const mockFeedback = `Excellente simulation d'entretien!\n\nRésumé de la performance:\n- Communication: Très bon\n- Pertinence des réponses: Bon\n- Structure (STAR): À améliorer\n- Confiance: Bon\n\nConseils personnalisés:\n1) Répondez avec la méthode STAR (Situation, Tâche, Action, Résultat).\n2) Ajoutez un exemple mesurable pour chaque compétence.\n3) Préparez 3 questions à poser à la fin.\n\nVous pouvez relancer la simulation en sélectionnant un niveau différent pour augmenter la difficulté.`;

        setFeedback(mockFeedback);
        setStage("feedback");
        localStorage.setItem("interview_sim_taken", "true");
      } else {
        // Ask next question
        const nextQuestion = INTERVIEW_QUESTIONS[nextIndex];
        newMessages.push({
          role: "interviewer",
          content: nextQuestion,
        });
        setMessages(newMessages);
        setCurrentQuestionIndex(nextIndex);
      }

      setLoading(false);
    }, 1000);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Accueil", to: "/" },
              { label: "Simulateur d'entretien" },
            ]}
          />
        </div>
      </section>

      <div className="container py-8 flex-1">
        {stage === "intro" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h1 className="text-3xl font-bold mb-4">Simulateur d'entretien</h1>
              <p className="text-muted-foreground mb-6">
                Pratiquez pour vos entretiens d'embauche avec un simulateur interactif.
                {!user && " Vous avez droit à 1 essai gratuit."}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Poste visé *</label>
                  <Input
                    type="text"
                    placeholder="Ex: Développeur React"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entreprise (optionnel)</label>
                  <Input
                    type="text"
                    placeholder="Ex: Google, Meta, etc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={startInterview} className="w-full">
                Commencer la simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        )}

        {stage === "interview" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-4 mb-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-4 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </Card>
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Votre réponse
                  </label>
                  <Textarea
                    placeholder="Tapez votre réponse ici..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full sm:flex-1"
                    disabled={loading}
                  >
                    Quitter
                  </Button>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={loading || !currentAnswer.trim()}
                    className="w-full sm:flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Question {currentQuestionIndex + 1} / {INTERVIEW_QUESTIONS.length}
              </p>
            </Card>
          </div>
        )}

        {stage === "feedback" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Votre retour</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 whitespace-pre-wrap text-sm leading-relaxed">
                {feedback}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-semibold mb-2">Prochaines étapes:</p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>✓ Pratiquez les réponses comportementales (STAR)</li>
                  <li>✓ Préparez des questions pertinentes</li>
                  <li>✓ Faites des recherches sur l'entreprise</li>
                  <li>✓ Entraînez-vous devant un miroir ou un ami</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Retour à l'accueil
                </Button>
                {user && (
                  <Button
                    onClick={() => setStage("intro")}
                    className="flex-1"
                  >
                    Nouvelle simulation
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
