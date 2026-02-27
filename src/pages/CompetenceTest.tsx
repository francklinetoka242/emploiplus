import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct_answer: number;
  category: string;
  domain?: string;
}

interface Result {
  correct: number;
  total: number;
  percentage: number;
  category: string;
}

const COMPETENCE_CATEGORIES = [
  { value: "it", label: "Informatique / Développement", color: "bg-yellow-100" },
  { value: "design", label: "Design / Création", color: "bg-pink-100" },
  { value: "management", label: "Gestion & Projet", color: "bg-purple-100" },
  { value: "communication", label: "Communication & Soft Skills", color: "bg-green-100" },
  { value: "marketing", label: "Marketing / Ventes", color: "bg-orange-100" },
];

const SAMPLE_QUESTIONS: Question[] = [
  { id: 1, text: "Qu'est-ce qu'une closure en JavaScript?", options: ["Une boucle qui ferme automatiquement","Une fonction qui a accès aux variables de sa portée parent","Un type de donnée primitive","Une méthode pour fermer les connexions réseau"], correct_answer: 1, category: "it", domain: "Développement" },
  { id: 2, text: "Quelle est la différence entre 'let' et 'var'?", options: ["Aucune différence","let est global, var est local","let a une portée de bloc, var a une portée fonctionnelle","var est obsolète"], correct_answer: 2, category: "it", domain: "Développement" },
  { id: 3, text: "Qu'est-ce qu'une API RESTful?", options: ["Un langage de programmation","Un style d'architecture pour les services web","Une base de données","Un framework front-end"], correct_answer: 1, category: "it", domain: "Architecture" },

  { id: 10, text: "Quel est le rôle principal d'une maquette (mockup)?", options: ["Tester le backend","Visualiser l'interface utilisateur","Optimiser la base de données","Écrire du code"], correct_answer: 1, category: "design", domain: "UI/UX" },
  { id: 11, text: "Quel format est adapté pour un logo vectoriel?", options: ["PNG","JPG","SVG","GIF"], correct_answer: 2, category: "design", domain: "Graphisme" },

  { id: 20, text: "En Agile, que décrit un 'sprint'?", options: ["Une période courte de développement","Un rapport de bugs","Un outil de design","Une réunion de recrutement"], correct_answer: 0, category: "management", domain: "Agile" },
  { id: 21, text: "Quel est l'objectif d'une réunion de rétrospective?", options: ["Évaluer la performance individuelle","Améliorer le processus d'équipe","Planifier les congés","Vérifier le design"], correct_answer: 1, category: "management", domain: "Processus" },

  { id: 30, text: "Quelle est la caractéristique d'un feedback constructif?", options: ["Vague et général","Spécifique et axé sur l'amélioration","Public et humiliant","Retardé de plusieurs mois"], correct_answer: 1, category: "communication", domain: "Soft Skills" },
  { id: 31, text: "Quel canal est préférable pour une information urgente?", options: ["Email","Message instantané","Lettre recommandée","Affichage papier"], correct_answer: 1, category: "communication", domain: "Canaux" },

  { id: 40, text: "Qu'est-ce que le SEO?", options: ["Optimisation pour les moteurs de recherche","Un type de publicité payante","Un format d'image","Un CMS"], correct_answer: 0, category: "marketing", domain: "Digital" },
  { id: 41, text: "Quelle métrique suit-on pour mesurer le taux de conversion?", options: ["Nombre de visiteurs","Taux de clics","Pourcentage d'actions désirées par visite","Taille de la page"], correct_answer: 2, category: "marketing", domain: "Analytics" },
];

export default function CompetenceTest() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"select" | "test" | "results">("select");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already taken the free test
    const testTaken = localStorage.getItem("competence_test_taken");
    if (testTaken && !user) {
      // allow opening interface but disable submitting another free attempt
      toast.warning("Vous avez déjà utilisé votre essai gratuit. Connectez-vous pour débloquer plus d'essais.");
    }
  }, [user, navigate]);

  const startTest = (category: string) => {
    const categoryQuestions = SAMPLE_QUESTIONS.filter((q) => q.category === category);
    setSelectedCategory(category);
    setQuestions(categoryQuestions);
    setAnswers(new Array(categoryQuestions.length).fill(-1));
    setCurrentQuestion(0);
    setStage("test");
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    const q = questions[currentQuestion];
    const correct = q && optionIndex === q.correct_answer;
    setLastAnswerCorrect(!!correct);
    setShowAnswerFeedback(true);

    // Auto-advance after short feedback delay
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setShowAnswerFeedback(false);
        setLastAnswerCorrect(null);
        setCurrentQuestion((c) => c + 1);
      }, 700);
    }
  };

  const submitTest = () => {
    const testTaken = localStorage.getItem("competence_test_taken");
    if (testTaken && !user) {
      toast.error("Essai gratuit déjà utilisé — connectez-vous pour un nouveau test.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correct_answer) {
          correct++;
        }
      });

      const percentage = Math.round((correct / questions.length) * 100);
      const categoryLabel = COMPETENCE_CATEGORIES.find((c) => c.value === selectedCategory)?.label || selectedCategory;

      setResult({
        correct,
        total: questions.length,
        percentage,
        category: categoryLabel || "",
      });

      // Mark test as taken for non-authenticated users
      if (!user) {
        localStorage.setItem("competence_test_taken", "true");
      }

      setStage("results");
      setLoading(false);
      toast.success("Test complété!");
    }, 500);
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
              { label: "Test de compétence" },
            ]}
          />
        </div>
      </section>

      <div className="container py-8 flex-1">
        {stage === "select" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Test de compétence</h1>
            <p className="text-muted-foreground mb-8">
              Sélectionnez une catégorie pour commencer votre test gratuit.
              {!user && " Vous avez droit à 1 essai gratuit."}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {COMPETENCE_CATEGORIES.map((cat) => (
                <Card key={cat.value} className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${cat.color}`}>
                  <h3 className="text-lg font-semibold mb-2">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    5 questions pour tester vos connaissances
                  </p>
                  <Button onClick={() => startTest(cat.value)} className="w-full">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {stage === "test" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    Question {currentQuestion + 1}/{questions.length}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {showAnswerFeedback && lastAnswerCorrect !== null && (
                <div className={`p-3 rounded mb-4 ${lastAnswerCorrect ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {lastAnswerCorrect ? 'Bonne réponse — continuez !' : `Réponse incorrecte. La bonne réponse: ${questions[currentQuestion].options[questions[currentQuestion].correct_answer]}`}
                </div>
              )}

              <h3 className="text-xl font-semibold mb-6">{questions[currentQuestion]?.text}</h3>

              <div className="space-y-3 mb-6">
                {questions[currentQuestion]?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-lg text-left transition-colors border-2 ${
                      answers[currentQuestion] === idx
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    className="flex-1"
                  >
                    Précédent
                  </Button>
                )}
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={answers[currentQuestion] === -1}
                    className="flex-1"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={submitTest}
                    disabled={answers.includes(-1) || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      "Soumettre le test"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {stage === "results" && result && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 text-center">
              <div className="mb-6">
                {result.percentage >= 70 ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                )}
              </div>

              <h2 className="text-3xl font-bold mb-2">
                {result.percentage}%
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {result.correct} / {result.total} réponses correctes
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Catégorie: <strong>{result.category}</strong>
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                {result.percentage >= 70 ? (
                  <p className="text-blue-700">
                    Excellent! Vous avez démontré une bonne maîtrise dans cette catégorie.
                  </p>
                ) : (
                  <p className="text-blue-700">
                    Continuez à vous entraîner pour améliorer vos compétences dans cette catégorie.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStage("select")}
                  className="flex-1"
                >
                  Tester une autre catégorie
                </Button>
                <Button
                  onClick={() => navigate(user ? "/parametres/recommandations" : "/")}
                  className="flex-1"
                >
                  Retour
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
