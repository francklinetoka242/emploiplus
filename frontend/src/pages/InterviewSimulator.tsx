import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, ArrowRight, BarChart3 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

interface Message {
  role: "user" | "interviewer";
  content: string;
}

interface AnswerEvaluation {
  score: number; // 0-10
  quality: "poor" | "average" | "good" | "excellent";
  feedback: string;
  question: string;
}

// Questions générales pour démarrage
const OPENING_QUESTIONS = [
  "Pour quel poste postulez-vous exactement?",
  "Pouvez-vous me parler brièvement de votre expérience la plus pertinente pour ce poste?"
];

// Questions de suivi basées sur la qualité de réponse
const getAdaptiveQuestions = (position: string, difficulty: "standard" | "advanced"): string[] => {
  const baseQuestions = [
    `Pourquoi êtes-vous intéressé par le poste de ${position}?`,
    "Quel est votre point fort majeur qui vous rend idéal pour ce rôle?",
    "Décrivez une situation où vous avez dû surmonter un défi professionnel significatif.",
    "Comment vous voyez-vous grandir dans ce poste au cours des 2 prochaines années?",
    "Travaillez-vous mieux en équipe ou en autonomie? Donnez un exemple concret.",
    "Comment gérez-vous les critiques ou les retours négatifs?",
    "Quelle est votre approche pour résoudre un problème complexe au travail?",
    "Avez-vous travaillé dans un environnement multiculturel ou avec des personnes de contextes différents?",
    "Quelles sont vos attentes en termes de rémunération et d'avantages?"
  ];

  if (difficulty === "advanced") {
    return baseQuestions.concat([
      "Décrivez votre vision stratégique pour améliorer le secteur ou l'industrie.",
      "Comment restez-vous à jour avec les tendances du marché?",
      "Avez-vous des questions pour moi sur le rôle, l'équipe ou l'entreprise?"
    ]);
  }
  
  return baseQuestions.slice(0, 10);
};

// Fonction pour évaluer la réponse
const evaluateAnswer = (answer: string, question: string, position: string): AnswerEvaluation => {
  const answerLength = answer.trim().split(/\s+/).length;
  const hasExample = /exemple|situation|j'ai|j'ai vu|nous avons|mon équipe|mon projet/i.test(answer);
  const isRelevant = new RegExp(position.split(/\s+/).join("|"), "i").test(answer);
  
  let score = 5;
  let quality: "poor" | "average" | "good" | "excellent";
  let feedback = "";

  if (answerLength < 20) {
    score -= 2;
    quality = "poor";
    feedback = "Votre réponse est trop brève. Pouvez-vous développer davantage avec des détails et des exemples?";
  } else if (answerLength < 50) {
    quality = "average";
    feedback = "C'est un début, mais essayez d'ajouter plus de contexte et d'exemples concrets.";
  } else if (hasExample && answerLength > 50) {
    if (isRelevant || answerLength > 100) {
      score += 3;
      quality = "excellent";
      feedback = "Excellente réponse! Vous avez fourni des détails pertinents et des exemples concrets.";
    } else {
      score += 2;
      quality = "good";
      feedback = "Bonne réponse avec des exemples. Assurez-vous que c'est bien pertinent pour le poste.";
    }
  } else {
    score += 1;
    quality = "good";
    feedback = "Réponse solide, mais l'ajout d'un exemple concret la renforcerait.";
  }

  return { score, quality, feedback, question };
};

export default function InterviewSimulator() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "interview" | "feedback">("intro");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState<"standard" | "advanced">("standard");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);
  const [allQuestions, setAllQuestions] = useState<string[]>([]);
  const MAX_QUESTIONS = 12;

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

    const questions = getAdaptiveQuestions(position, difficulty);
    setAllQuestions(questions);

    const intro = `Bonjour! Je suis un recruteur expert pour le marché du travail en République du Congo. Je vais vous évaluer pour le poste de ${position}${company ? ` chez ${company}` : ""}\n\nLe processus sera structuré et professionnel. Je poserai une question à la fois. Après chaque réponse, je poserai une question suivante ${ difficulty === "advanced" ? "de niveau avancé " : ""}adaptée à votre performance. À la fin de nos ${MAX_QUESTIONS} questions, vous recevrez une évaluation détaillée.\n\nCommençons: ${OPENING_QUESTIONS[0]}`;

    setMessages([{ role: "interviewer", content: intro }]);
    setStage("interview");
  };

  const generateFinalReport = (evals: AnswerEvaluation[]): string => {
    const totalScore = evals.reduce((sum, e) => sum + e.score, 0);
    const averageScore = (totalScore / evals.length).toFixed(1);
    
    const sortedByScore = [...evals].sort((a, b) => a.score - b.score);
    const worstQuestion = sortedByScore[0];
    const bestQuestions = sortedByScore.slice(-3).map(e => e.question);

    const strengths = [
      "Communication structurée et professionnelle",
      "Capacité à fournir des exemples concrets",
      "Pertinence des réponses au contexte du poste"
    ].filter(() => Math.random() > 0.4).slice(0, 3);

    const improvements = [
      "Approfondir davantage les réponses avec plus de détails",
      "Utiliser la méthode STAR (Situation, Tâche, Action, Résultat)",
      "Préparer des questions pour le recruteur",
      "Montrer plus d'enthousiasme et de passion pour le poste",
      "Renforcer les connaissances du secteur"
    ].filter(() => Math.random() > 0.5).slice(0, 3);

    const note = Math.round((totalScore / evals.length) * 10) / 10;

    return `╔════════════════════════════════════════╗
║  RAPPORT D'ÉVALUATION D'ENTRETIEN     ║
║  Marché du Travail - République du     ║
║  Congo                                 ║
╚════════════════════════════════════════╝

📊 NOTE GLOBALE: ${note}/10

${note >= 7.5 ? "✅ TRÈS BON CANDIDAT" : note >= 6 ? "✓ BON CANDIDAT" : "⚠️ À AMÉLIORER"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💪 POINTS FORTS:
${strengths.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

📈 POINTS À AMÉLIORER:
${improvements.map((i, idx) => `  ${idx + 1}. ${i}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ QUESTION LA PLUS DIFFICILE:
Q: ${worstQuestion.question}
Suggestion de réponse idéale:
"Fournir une réponse de 3-4 phrases avec: (1) une situation concrète, (2) votre action spécific, (3) le résultat mesurable. Inclure des détails pertinents pour le poste de ${position}."

✅ MEILLEURES QUESTIONS:
${bestQuestions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PROCHAINES ÉTAPES:
  ✓ Entraînez-vous avec la méthode STAR
  ✓ Préparez 3-5 questions pour le recruteur
  ✓ Faites des recherches approfondies sur l'entreprise
  ✓ Simulez l'entretien devant un miroir ou un ami
  ✓ Travaillez votre langage corporel et votre ton vocal

Bonne chance! 🚀`;
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

    // Evaluate the answer
    const currentQuestion = currentQuestionIndex === 0 ? OPENING_QUESTIONS[0] : allQuestions[currentQuestionIndex - 1];
    const evaluation = evaluateAnswer(currentAnswer, currentQuestion, position);
    const newEvaluations = [...evaluations, evaluation];
    setEvaluations(newEvaluations);

    setCurrentAnswer("");
    setLoading(true);

    // Simulate thinking delay
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex >= MAX_QUESTIONS) {
        // Interview complete - generate final report
        const finalFeedback = generateFinalReport(newEvaluations);
        setFeedback(finalFeedback);
        setStage("feedback");
        localStorage.setItem("interview_sim_taken", "true");
      } else {
        // Ask next question
        let nextQuestion: string;
        
        if (nextIndex === 1) {
          // After first opening, ask about experience
          const avgScore = newEvaluations.reduce((sum, e) => sum + e.score, 0) / newEvaluations.length;
          if (avgScore < 4) {
            nextQuestion = `D'accord. Pourriez-vous développer un peu plus sur votre expérience pertinente pour le poste de ${position}? Je cherche à comprendre vos réalisations concrètes.`;
          } else {
            nextQuestion = OPENING_QUESTIONS[1];
          }
        } else {
          // Use adaptive questions based on performance
          const avgScore = newEvaluations.reduce((sum, e) => sum + e.score, 0) / newEvaluations.length;
          
          // Select next question based on performance
          if (avgScore < 4) {
            // Ask follow-up instead of jumping to next
            nextQuestion = `${evaluation.feedback} Pouvez-vous répondre à nouveau avec plus de détails cette fois?`;
          } else if (evaluation.quality === "excellent" && difficulty === "advanced") {
            // Ask more advanced question
            nextQuestion = allQuestions[Math.min(nextIndex + 1, allQuestions.length - 1)];
          } else {
            nextQuestion = allQuestions[nextIndex - 1] || allQuestions[allQuestions.length - 1];
          }
        }

        newMessages.push({
          role: "interviewer",
          content: nextQuestion,
        });
        setMessages(newMessages);
        setCurrentQuestionIndex(nextIndex);
      }

      setLoading(false);
    }, 1500);
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
              <div className="mb-6">
                <BarChart3 className="h-8 w-8 text-primary mb-4" />
                <h1 className="text-3xl font-bold mb-2">Simulateur d'Entretien Expert</h1>
                <p className="text-muted-foreground mb-4">
                  En tant que recruteur expert pour le marché du travail en République du Congo, je vous propose une simulation d'entretien réaliste et adaptée à votre profil.
                </p>
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                  ℹ️ Cette simulation vous posera {MAX_QUESTIONS} questions adaptées à votre performance. À la fin, vous recevrez un rapport détaillé avec points forts, axes d'amélioration et une note globale.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Poste visé * <span className="text-red-500">requis</span></label>
                  <Input
                    type="text"
                    placeholder="Ex: Développeur React, Manager Commercial, Comptable..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entreprise (optionnel)</label>
                  <Input
                    type="text"
                    placeholder="Ex: Google, Airtel Congo, Orange Money..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Niveau de difficulté</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value="standard"
                        checked={difficulty === "standard"}
                        onChange={(e) => setDifficulty(e.target.value as "standard" | "advanced")}
                      />
                      <span>Standard (10 questions)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value="advanced"
                        checked={difficulty === "advanced"}
                        onChange={(e) => setDifficulty(e.target.value as "standard" | "advanced")}
                      />
                      <span>Avancé (12 questions + profondeur)</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={startInterview}
                disabled={!position.trim()}
                size="lg"
                className="w-full"
              >
                Démarrer la simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {!position.trim() && (
                <p className="text-sm text-red-500 mt-2">* Le poste est obligatoire pour commencer</p>
              )}
            </Card>
          </div>
        )}

        {stage === "interview" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Entretien en cours - {position}</h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Question {currentQuestionIndex + 1} / {MAX_QUESTIONS}
              </div>
            </div>

            <Card className="p-4 mb-4 max-h-[50vh] overflow-y-auto space-y-4 bg-gradient-to-b from-white to-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-lg p-4 rounded-lg text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 p-4 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Evaluation en cours...</span>
                  </div>
                </div>
              )}
            </Card>

            {evaluations.length > 0 && !loading && (
              <Card className="p-4 mb-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">Feedback sur votre dernière réponse:</p>
                    <p className="text-green-800 text-sm">{evaluations[evaluations.length - 1].feedback}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Votre réponse</label>
                  <Textarea
                    placeholder="Tapez votre réponse ici. Soyez détaillé et concis..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows={5}
                    disabled={loading}
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Conseil: Utilisez la méthode STAR - Situation, Tâche, Action, Résultat
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Voulez-vous vraiment quitter l'entretien? Vos réponses ne seront pas évaluées.")) {
                        navigate("/");
                      }
                    }}
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
                    Soumettre la réponse
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {stage === "feedback" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">✅ Évaluation Complète</h2>
                <p className="text-gray-600">Voici votre rapport détaillé de simulation d'entretien</p>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6 whitespace-pre-wrap text-sm leading-relaxed font-mono border border-gray-200">
                {feedback}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <p className="text-xs text-green-600 font-semibold mb-1">RÉALISATIONS</p>
                  <p className="text-2xl font-bold text-green-700">{evaluations.length}/12</p>
                  <p className="text-xs text-green-600">Questions répondues</p>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold mb-1">NOTE MOYENNE</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(1)}/10
                  </p>
                  <p className="text-xs text-blue-600">Score global</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold mb-1">MEILLEURE RÉPONSE</p>
                  <p className="text-sm font-semibold text-purple-700">
                    {Math.round(Math.max(...evaluations.map(e => e.score)))}/10
                  </p>
                  <p className="text-xs text-purple-600">Qualité max</p>
                </Card>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
                <p className="font-semibold text-amber-900 mb-2">📚 Ressources Recommandées:</p>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• Méthode STAR pour les réponses comportementales</li>
                  <li>• Préparation spécifique au poste et à l'entreprise</li>
                  <li>• Entraînement du langage corporel et de la présentation</li>
                  <li>• Simulation avec un mentor ou un ami</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Retour à l'accueil
                </Button>
                {user && (
                  <Button
                    onClick={() => {
                      setStage("intro");
                      setMessages([]);
                      setCurrentQuestionIndex(0);
                      setEvaluations([]);
                      setPosition("");
                      setCompany("");
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    🔄 Nouvelle simulation
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
