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

interface FeedbackData {
  strengths: string[];
  improvements: string[];
  score: number;
}

// fallback questions used when AI is unavailable
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

// simple circular progress SVG component
const ScoreCircle = ({ percentage, size = 120, strokeWidth = 12 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="mx-auto">
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : '#f59e0b'}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="text-xl font-bold text-gray-800"
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default function InterviewSimulator() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "interview" | "feedback">("intro");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [severity, setSeverity] = useState<'Sympa'|'Neutre'|'Très exigeant'>('Neutre');
  const [messages, setMessages] = useState<Message[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  useEffect(() => {
    const testTaken = localStorage.getItem("interview_sim_taken");
    if (testTaken && !user) {
      toast.warning("Vous avez déjà utilisé votre essai gratuit. Connectez-vous pour plus de simulations.");
    }
  }, [user]);

  const startInterview = async () => {
    if (!position.trim()) {
      toast.error("Veuillez entrer le poste visé");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, severity })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length) {
        setInterviewQuestions(data.questions);
        setMessages([{ role: 'interviewer', content: data.questions[0] }]);
        setCurrentQuestionIndex(0);
        setStage('interview');
      } else {
        // fallback to builtin list
        const first = INTERVIEW_QUESTIONS[0];
        setInterviewQuestions(INTERVIEW_QUESTIONS.slice(0, 5));
        setMessages([{ role: 'interviewer', content: first }]);
        setStage('interview');
      }
    } catch (err) {
      console.error('startInterview error', err);
      toast.error("Impossible de démarrer la simulation (mode offline).");
      // fallback similar
      const first = INTERVIEW_QUESTIONS[0];
      setInterviewQuestions(INTERVIEW_QUESTIONS.slice(0, 5));
      setMessages([{ role: 'interviewer', content: first }]);
      setStage('interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Veuillez fournir une réponse");
      return;
    }

    const userMsg: Message = { role: 'user', content: currentAnswer };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setCurrentAnswer('');
    setLoading(true);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= interviewQuestions.length) {
      // finished - request feedback from server
      try {
        const res = await fetch('/api/ai/interview-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: interviewQuestions, answers: newMessages.filter(m => m.role === 'user').map(m => m.content) })
        });
        const data = await res.json();
        if (data.success) {
          setFeedbackData({
            strengths: data.strengths || [],
            improvements: data.improvements || [],
            score: data.score || 0
          });
        }
      } catch (err) {
        console.error('feedback fetch error', err);
      }

      setStage('feedback');
      localStorage.setItem('interview_sim_taken', 'true');
      setLoading(false);
    } else {
      // ask next interview question
      const nextQuestion = interviewQuestions[nextIndex] || INTERVIEW_QUESTIONS[nextIndex];
      setMessages([...newMessages, { role: 'interviewer', content: nextQuestion }]);
      setCurrentQuestionIndex(nextIndex);
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

                <div>
                  <label className="block text-sm font-medium mb-2">Sévérité du recruteur</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                  >
                    <option>Sympa</option>
                    <option>Neutre</option>
                    <option>Très exigeant</option>
                  </select>
                </div>
              </div>

              <Button onClick={startInterview} className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Démarrage...</>
                ) : (
                  <>
                    Commencer la simulation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}

        {stage === "interview" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-4 mb-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto space-y-4">
              <p className="text-xs text-muted-foreground mb-2">
                Question {currentQuestionIndex + 1} / {interviewQuestions.length || INTERVIEW_QUESTIONS.length}
              </p>

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

            </Card>
          </div>
        )}

        {stage === "feedback" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Analyse de votre entretien</h2>

              {feedbackData ? (
                <>
                  <div className="mb-6">
                    <ScoreCircle percentage={feedbackData.score} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">Points forts</h3>
                      <ul className="list-disc list-inside text-sm">
                        {feedbackData.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Points à améliorer</h3>
                      <ul className="list-disc list-inside text-sm">
                        {feedbackData.improvements.map((i, idx) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {feedbackData.score >= 80 && (
                    <Button
                      className="mb-6"
                      onClick={() => {
                        const text = `Certificat de réussite - Score : ${feedbackData.score}%`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `certificat-entretien-${Date.now()}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Télécharger mon certificat de réussite
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-700">Analyse indisponible.</p>
              )}

              <div className="flex gap-3 mt-6 flex-col sm:flex-row">
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
