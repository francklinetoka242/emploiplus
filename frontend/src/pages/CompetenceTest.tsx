import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Award, Brain } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface CompetenceTest {
  testTitle: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  domain: string;
  questions: TestQuestion[];
}

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
  domain?: string;
}

// simple circular score visual
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

const COMPETENCE_CATEGORIES = [
  { value: "it", label: "Informatique / Développement", color: "bg-yellow-100", icon: "💻" },
  { value: "design", label: "Design / Création", color: "bg-pink-100", icon: "🎨" },
  { value: "management", label: "Gestion & Projet", color: "bg-purple-100", icon: "📊" },
  { value: "communication", label: "Communication & Soft Skills", color: "bg-green-100", icon: "💬" },
  { value: "marketing", label: "Marketing / Ventes", color: "bg-orange-100", icon: "📈" },
];

// Fonction de génération de tests structurés
const generateCompetenceTest = (domain: string): CompetenceTest => {
  const testConfig: { [key: string]: { testTitle: string; domain: string; difficulty: "Débutant" | "Intermédiaire" | "Avancé"; questions: TestQuestion[] } } = {
    it: {
      testTitle: "Test de Maîtrise Informatique - Développement Web",
      domain: "Informatique / Développement",
      difficulty: "Intermédiaire",
      questions: [
        {
          id: 1,
          question: "Quelle est la différence principale entre 'let' et 'var' en JavaScript?",
          options: ["let est global, var est local", "let a une portée de bloc, var a une portée fonctionnelle", "Aucune différence réelle", "var est plus rapide que let"],
          correctAnswer: "let a une portée de bloc, var a une portée fonctionnelle",
          explanation: "let a une portée de bloc (limitée au { }), tandis que var a une portée fonctionnelle. C'est pourquoi let est généralement préféré pour éviter les bugs liés à la portée."
        },
        {
          id: 2,
          question: "Qu'est-ce qu'une closure (fermeture) en JavaScript?",
          options: ["Une boucle qui ferme automatiquement", "Une fonction qui a accès aux variables de sa portée parent", "Un type de donnée primitive", "Une méthode pour fermer les connexions réseau"],
          correctAnswer: "Une fonction qui a accès aux variables de sa portée parent",
          explanation: "Une closure est une fonction qui retient l'accès aux variables de sa portée parent même après que la fonction parente ait retourné. C'est fondamental pour JavaScript."
        },
        {
          id: 3,
          question: "Quel est l'objectif principal du design pattern MVC en développement?",
          options: ["Optimiser la vitesse du serveur", "Séparer la logique métier, la présentation et les données", "Réduire la taille des fichiers", "Augmenter la sécurité des bases de données"],
          correctAnswer: "Séparer la logique métier, la présentation et les données",
          explanation: "MVC (Model-View-Controller) divise l'application en trois couches: Model (données), View (interface), Controller (logique). Cela facilite la maintenance et les tests."
        },
        {
          id: 4,
          question: "Qu'est-ce qu'une API RESTful?",
          options: ["Un type de langage de programmation", "Un style d'architecture pour créer des services web scalables", "Une base de données NoSQL", "Un framework exclusif à Python"],
          correctAnswer: "Un style d'architecture pour créer des services web scalables",
          explanation: "REST (Representational State Transfer) est un style architectural qui utilise HTTP pour les opérations CRUD sur des ressources. Les API RESTful sont stateless et utilisent les verbes HTTP (GET, POST, PUT, DELETE)."
        },
        {
          id: 5,
          question: "Vous développez une application e-commerce. Comment optimiseriez-vous les images produit pour le web?",
          options: ["Utiliser des images haute résolution non compressées", "Utiliser des formats modernes (WebP), compresser, et redimensionner selon l'affichage", "Ignorer la compression pour préserver la qualité", "Convertir toutes les images en BMP"],
          correctAnswer: "Utiliser des formats modernes (WebP), compresser, et redimensionner selon l'affichage",
          explanation: "L'optimisation des images inclut: choix du format (JPEG/PNG/WebP), compression, redimensionnement responsive. Cela améliore la vitesse de chargement du site."
        },
        {
          id: 6,
          question: "En programmation orientée objet, qu'est-ce que l'héritage?",
          options: ["Un mécanisme de transmission de propriétés financières", "La capacité d'une classe à hériter des propriétés et méthodes d'une autre classe", "Une structure de données linéaire", "Un pattern de sécurité"],
          correctAnswer: "La capacité d'une classe à hériter des propriétés et méthodes d'une autre classe",
          explanation: "L'héritage permet à une classe enfant de réutiliser et étendre les fonctionnalités d'une classe parent. Cela favorise la réutilisabilité et l'organisation du code."
        },
        {
          id: 7,
          question: "Vous avez une fuite mémoire dans votre application Node.js. Quel outil utiliseriez-vous d'abord?",
          options: ["Git log", "Node.js heap snapshots ou clinic.js", "npm list", "MongoDB compass"],
          correctAnswer: "Node.js heap snapshots ou clinic.js",
          explanation: "Pour détecter les fuites mémoire en Node.js, on utilise des outils comme les heap snapshots ou clinic.js qui permettent d'analyser l'utilisation mémoire et d'identifier les objets qui ne sont pas libérés."
        },
        {
          id: 8,
          question: "Quel est le rôle de Git dans le développement d'une application?",
          options: ["Gérer les bases de données", "Contrôler les versions et faciliter la collaboration sur le code", "Tester automatiquement le code", "Déployer l'application en production"],
          correctAnswer: "Contrôler les versions et faciliter la collaboration sur le code",
          explanation: "Git est un système de contrôle de version qui permet de tracker les modifications du code, faciliter la collaboration en équipe, créer des branches pour les features, et maintenir un historique complet."
        },
        {
          id: 9,
          question: "Vous travaillez sur une API qui doit traiter 100,000 requêtes/jour. Quelle approche serait optimale?",
          options: ["Utiliser un serveur unique sans cache", "Implémenter une mise en cache, une base de données optimisée, et potentiellement un load balancer", "Ignorer la performance jusqu'au problème", "Augmenter la RAM du serveur indéfiniment"],
          correctAnswer: "Implémenter une mise en cache, une base de données optimisée, et potentiellement un load balancer",
          explanation: "La scalabilité d'une API nécessite: caching (Redis), requêtes optimisées, indexation BD, load balancing. Ces techniques distribuent la charge et améliorent la performance."
        },
        {
          id: 10,
          question: "Qu'est-ce que la SEO technique et pourquoi est-ce important?",
          options: ["Faire des publicités payantes", "Optimiser le site pour que les moteurs de recherche le crawlent et l'indexent efficacement", "Écrire du contenu sans structure", "Ignorer les modifications de Google"],
          correctAnswer: "Optimiser le site pour que les moteurs de recherche le crawlent et l'indexent efficacement",
          explanation: "La SEO technique inclut: sitemap XML, robots.txt, structure d'URL, vitesse de chargement, mobile-friendly, SSL/HTTPS. C'est fondamental pour être bien classé sur Google."
        },
        {
          id: 11,
          question: "En tant que développeur, comment géreriez-vous les dépendances npm pour éviter les vulnérabilités?",
          options: ["Ignorer les mises à jour", "Utiliser npm audit, npm update, et vérifier les changelog des dépendances", "Installer toutes les versions bêta", "Ne jamais utiliser npm"],
          correctAnswer: "Utiliser npm audit, npm update, et vérifier les changelog des dépendances",
          explanation: "La gestion des dépendances sécurisée inclut: faire npm audit pour identifier les vulnérabilités, mettre à jour régulièrement, vérifier les changelogset utiliser un lock file (package-lock.json)."
        },
        {
          id: 12,
          question: "Vous devez choisir entre une base de données SQL et NoSQL pour un projet de e-commerce. Quelle serait votre considération clé?",
          options: ["Le prix du serveur uniquement", "La structure des données, la scalabilité, et les besoins de transactions", "La popularité du langage", "Écrire au hasard"],
          correctAnswer: "La structure des données, la scalabilité, et les besoins de transactions",
          explanation: "SQL excelle pour les données structurées avec transactions ACID. NoSQL pour les données non-structurées et la scalabilité horizontale. Pour e-commerce, SQL est souvent préféré pour les transactions."
        }
      ]
    },
    design: {
      testTitle: "Test de Maîtrise Design - Création Graphique",
      domain: "Design / Création",
      difficulty: "Intermédiaire",
      questions: [
        {
          id: 1,
          question: "Quel est le rôle principal d'une maquette (mockup) en design?",
          options: ["Écrire du code", "Visualiser et tester l'interface utilisateur avant développement", "Gérer les serveurs", "Faire les tests unitaires"],
          correctAnswer: "Visualiser et tester l'interface utilisateur avant développement",
          explanation: "Une maquette (mockup) est une représentation haute fidélité du design final. Elle permet de visualiser le résultat, recueillir des retours clients, et détecter les problèmes avant le développement."
        },
        {
          id: 2,
          question: "Quel format est idéal pour un logo vectoriel?",
          options: ["PNG", "JPG", "SVG", "GIF"],
          correctAnswer: "SVG",
          explanation: "SVG (Scalable Vector Graphics) est le format idéal pour les logos car il est vectoriel (scalable sans perte de qualité), léger, et compatible avec tous les navigateurs."
        },
        {
          id: 3,
          question: "Qu'est-ce que la théorie des couleurs complémentaires en design?",
          options: ["Des couleurs qui se ressemblent", "Des couleurs opposées sur la roue chromatique qui créent du contraste", "La même couleur en différentes nuances", "Des couleurs qui n'ont pas d'impact"],
          correctAnswer: "Des couleurs opposées sur la roue chromatique qui créent du contraste",
          explanation: "Les couleurs complémentaires (ex: bleu-orange, rouge-vert) créent du contraste visuel. En design, utiliser des complémentaires peut attirer l'attention et créer de l'équilibre."
        },
        {
          id: 4,
          question: "Qu'est-ce que la hiérarchie visuelle en design?",
          options: ["La position des meubles", "Organiser les éléments pour guider le regard de l'utilisateur vers les informations importantes", "Mettre du texte partout", "Ignorer la structure"],
          correctAnswer: "Organiser les éléments pour guider le regard de l'utilisateur vers les informations importantes",
          explanation: "La hiérarchie visuelle utilise la taille, la couleur, le contraste et l'espacement pour diriger l'attention. C'est essentiel pour l'UX/UI."
        },
        {
          id: 5,
          question: "Vous devez créer une infographie sur les ventes Q1. Comment organiseriez-vous les données pour maximiser la compréhension?",
          options: ["Mettre tous les nombres en texte", "Utiliser des graphiques, des icônes, des couleurs cohérentes, et une hiérarchie claire", "Ignorer les visuels", "Mettre de la musique de fond"],
          correctAnswer: "Utiliser des graphiques, des icônes, des couleurs cohérentes, et une hiérarchie claire",
          explanation: "Une bonne infographie combine: visualisations appropriées (barres, camembert), cohérence des couleurs, typographie lisible, et hiérarchie visuelle pour communiquer efficacement."
        },
        {
          id: 6,
          question: "Qu'est-ce que l'UX (User Experience)?",
          options: ["Seulement l'interface visuelle", "L'ensemble de l'expérience de l'utilisateur avec un produit, incluant fonctionnalité, accessibilité et satisfaction", "Dessiner des formes aléatoires", "Écrire du code sans design"],
          correctAnswer: "L'ensemble de l'expérience de l'utilisateur avec un produit, incluant fonctionnalité, accessibilité et satisfaction",
          explanation: "UX est plus large que UI. Elle inclut la recherche utilisateur, l'architecture de l'information, l'accessibilité, et la satisfaction globale. Une bonne UX crée de la fidélité client."
        },
        {
          id: 7,
          question: "Vous créez un site pour une application mobile. Quel principe devriez-vous suivre?",
          options: ["Ignorer les mobiiles", "Mobile-first: concevoir d'abord pour mobile, puis adapter pour desktop", "Desktop-only", "Utiliser Flash"],
          correctAnswer: "Mobile-first: concevoir d'abord pour mobile, puis adapter pour desktop",
          explanation: "Le design mobile-first garantit que le site est optimisé pour le plus petit écran d'abord. Puis on ajoute progressivement des fonctionnalités pour les écrans plus grands. C'est une meilleure approche que l'inverse."
        },
        {
          id: 8,
          question: "Qu'est-ce que l'accessibilité (a11y) en design web?",
          options: ["Enlever les coloris", "Concevoir pour que tous les utilisateurs, y compris ceux en situation de handicap, puissent utiliser le site", "Ne pas utiliser de texte", "Ignorer les lecteurs d'écran"],
          correctAnswer: "Concevoir pour que tous les utilisateurs, y compris ceux en situation de handicap, puissent utiliser le site",
          explanation: "L'accessibilité inclut: contraste suffisant, textes alternatifs pour les images, navigation au clavier, labels pour les formulaires. C'est légalement requis et correct éthiquement."
        },
        {
          id: 9,
          question: "Vous testez une interface avec des utilisateurs. Que observez-vous principalement?",
          options: ["La vitesse du serveur", "Comment les utilisateurs interagissent, où ils se perdent, et les points de frustration", "Le prix", "Les serveurs"],
          correctAnswer: "Comment les utilisateurs interagissent, où ils se perdent, et les points de frustration",
          explanation: "Le user testing révèle les problèmes d'UX: points de friction, confusion, éléments ignorés. Ces insights sont invaluables pour améliorer le design avant le lancement."
        },
        {
          id: 10,
          question: "Qu'est-ce que l'espacement blanc (whitespace) en design?",
          options: ["Ignorer le vide", "L'espace vide intentionnel qui aide à organiser les éléments et améliore la lisibilité", "Des zones blanches sans valeur", "Remplir chaque pixel"],
          correctAnswer: "L'espace vide intentionnel qui aide à organiser les éléments et améliore la lisibilité",
          explanation: "Le whitespace (espacement) n'est pas vide: c'est un élément actif du design. Il aide à regrouper les informations, améliore la lisibilité, et crée une sensation d'aération."
        },
        {
          id: 11,
          question: "Quel outil de design collaboratif permettrait à votre équipe de travailler en temps réel?",
          options: ["Email uniquement", "Figma ou Adobe XD avec partage en ligne et commentaires", "Document Word local", "Papier et crayon"],
          correctAnswer: "Figma ou Adobe XD avec partage en ligne et commentaires",
          explanation: "Figma et Adobe XD offrent la collaboration en temps réel, les commentaires, le versioning automatique. Ces outils sont essentiels pour les équipes de design modernes."
        },
        {
          id: 12,
          question: "Vous créez un bouton d'appel à l'action (CTA). Quels sont les éléments clés pour le rendre efficace?",
          options: ["Couleur neutre et petit texte", "Couleur contrastée, texte clair et actionnable, positionnement visible", "Texte ambigu et taille aléatoire", "Placer le bouton au bas de la page"],
          correctAnswer: "Couleur contrastée, texte clair et actionnable, positionnement visible",
          explanation: "Un CTA efficace a: couleur contrastée (se détache), texte descriptif (pas 'Cliquez ici'), taille appropriée, positionnement stratégique. Cela maximise les conversions."
        }
      ]
    },
    management: {
      testTitle: "Test de Maîtrise Management - Gestion de Projet",
      domain: "Gestion & Projet",
      difficulty: "Intermédiaire",
      questions: [
        {
          id: 1,
          question: "En Agile, qu'est-ce qu'un 'sprint'?",
          options: ["Une réunion de 5 minutes", "Une période courte de développement (généralement 1-4 semaines) avec des objectifs clairs", "Un rapport de bugs", "Une demande de congé"],
          correctAnswer: "Une période courte de développement (généralement 1-4 semaines) avec des objectifs clairs",
          explanation: "Un sprint est une itération fixe en Agile. L'équipe se fixe des objectifs, développe, teste, et améliore dans le sprint. Cela crée du rythme et de la prévisibilité."
        },
        {
          id: 2,
          question: "Quel est l'objectif principal d'une réunion de rétrospective (retro)?",
          options: ["Blâmer les personnes", "Améliorer le processus d'équipe en identifiant ce qui a bien fonctionné et ce qui doit s'améliorer", "Planifier les congés", "Vérifier le design"],
          correctAnswer: "Améliorer le processus d'équipe en identifiant ce qui a bien fonctionné et ce qui doit s'améliorer",
          explanation: "La rétrospective est une réunion bimensuelle où l'équipe réfléchit: qu'avons-nous fait bien? Où avons-nous échoué? Comment s'améliorer? Cette culture de l'amélioration continue est essentielle."
        },
        {
          id: 3,
          question: "Qu'est-ce qu'un 'user story' en Agile/Scrum?",
          options: ["Un conte de fées", "Une description simple d'une fonctionnalité du point de vue de l'utilisateur final", "Un rapport technique complexe", "Un contrat légal"],
          correctAnswer: "Une description simple d'une fonctionnalité du point de vue de l'utilisateur final",
          explanation: "Une user story suit le format: 'En tant que [utilisateur], je veux [fonctionnalité], pour [bénéfice]'. C'est un outil de communication entre développeurs, PMs, et utilisateurs."
        },
        {
          id: 4,
          question: "En tant que manager, comment géreriez-vous un conflit entre deux membres de l'équipe?",
          options: ["Ignorer le problème", "Rencontrer chaque personne seule, comprendre les perspectives, faciliter une discussion constructive", "Prendre le parti de l'un", "Punir les deux"],
          correctAnswer: "Rencontrer chaque personne seule, comprendre les perspectives, faciliter une discussion constructive",
          explanation: "La gestion de conflit efficace: écoute active, compréhension des deux côtés, et recherche de solutions gagnant-gagnant. C'est essentiel pour un environnement de travail sain."
        },
        {
          id: 5,
          question: "Vous avez un projet qui retarde. Quelle action prenez-vous d'abord?",
          options: ["Punir l'équipe", "Analyser les causes du retard, réévaluer la portée/ressources, et communiquer avec les stakeholders", "Ignorer le problème", "Embaucher plus de gens"],
          correctAnswer: "Analyser les causes du retard, réévaluer la portée/ressources, et communiquer avec les stakeholders",
          explanation: "Quand un projet retarde, identifier la cause racine est clé. Est-ce la portée trop large? Des ressources insuffisantes? Une mauvaise estimation? Ensuite, ajuster et communiquer."
        },
        {
          id: 6,
          question: "Qu'est-ce qu'un 'backlog' de produit?",
          options: ["Une liste de bugs", "Une liste priorisée de tous les travaux à faire: features, fixes, améliorations", "Un historique de ventes", "Un dossier de licences"],
          correctAnswer: "Une liste priorisée de tous les travaux à faire: features, fixes, améliorations",
          explanation: "Le product backlog est maintenu par le Product Owner. Les items sont priorisés par valeur et urgence. L'équipe Scrum choisit les items du backlog pour chaque sprint."
        },
        {
          id: 7,
          question: "Comment motiveriez-vous une équipe lors d'une période stressante?",
          options: ["Travailler plus d'heures", "Reconnaître les efforts, clarifier les objectifs, offrir du support, et célébrer les petites victoires", "Ignorer le stress", "Réduire le salaire"],
          correctAnswer: "Reconnaître les efforts, clarifier les objectifs, offrir du support, et célébrer les petites victoires",
          explanation: "La motivation en période difficile vient de: reconnaissance, transparence, support, et célébration des progrès. Un manager empathique crée un environnement où les gens donnent le meilleur."
        },
        {
          id: 8,
          question: "Qu'est-ce que le 'scope creep' et comment l'éviter?",
          options: ["Une maladie", "L'élargissement incontrolé du projet au-delà de la portée initiale", "Une position de yoga", "Un type de fromage"],
          correctAnswer: "L'élargissement incontrolé du projet au-delà de la portée initiale",
          explanation: "Scope creep: ajouter continuellement des fonctionnalités → retards et dépassements budgétaires. Pour l'éviter: définir clairement la portée, bien prioriser, et gérer les changements formellement."
        },
        {
          id: 9,
          question: "Vous mentorez un jeune manager. Quel conseil prioritaire donneriez-vous?",
          options: ["Être boss autoritaire", "Écouter plus que de parler, apprendre à connaître son équipe, et créer une psychologie de sécurité", "Micromanager tout", "Éviter les feedbacks"],
          correctAnswer: "Écouter plus que de parler, apprendre à connaître son équipe, et créer une psychologie de sécurité",
          explanation: "Le management moderne: écoute active, empathie, et création d'un espace où les gens se sentent en sécurité pour innover et échouer sont clés pour l'engagement et la performance."
        },
        {
          id: 10,
          question: "Qu'est-ce que la 'capacité' en planning Agile?",
          options: ["La taille du bureau", "La quantité de travail qu'une équipe peut réaliser dans un sprint", "Le nombre total d'employés", "La vitesse internet"],
          correctAnswer: "La quantité de travail qu'une équipe peut réaliser dans un sprint",
          explanation: "La capacité (velocity) est mesurée en points de story ou jours idéaux. Elle aide à prévoir combien de travail l'équipe peut faire réalistement dans le prochain sprint."
        },
        {
          id: 11,
          question: "Comment gérer les attentes irréalistes d'un stakeholder?",
          options: ["Accepter tout sans discuter", "Écouter, expliquer les contraintes, proposer des alternatives réalistes avec timeline/ressources", "Ignorer le stakeholder", "Promettre l'impossible"],
          correctAnswer: "Écouter, expliquer les contraintes, proposer des alternatives réalistes avec timeline/ressources",
          explanation: "Gestion des attentes: transparence sur les contraintes (budget, temps, ressources), co-création de solutions, et communication régulière. Cela construit la confiance à long terme."
        },
        {
          id: 12,
          question: "Quel KPI mesurant la performance d'équipe serait pertinent pour une équipe de développement?",
          options: ["Nombre de lines of code", "Velocity, taux de complétion des sprints, qualité du code (défauts), et satisfaction de l'équipe", "Heures travaillées", "Nombre de commits"],
          correctAnswer: "Velocity, taux de complétion des sprints, qualité du code (défauts), et satisfaction de l'équipe",
          explanation: "Bons KPIs: velocity (tendance), taux de complétion, qualité, et bien-être. Mauvais KPIs: lines of code, qui peuvent encourager du code inutile. Mesurer ce qui compte vraiment."
        }
      ]
    },
    communication: {
      testTitle: "Test de Maîtrise Communication - Soft Skills",
      domain: "Communication & Soft Skills",
      difficulty: "Intermédiaire",
      questions: [
        {
          id: 1,
          question: "Quelle est la caractéristique d'un feedback constructif?",
          options: ["Vague et général", "Spécifique, fondé sur des observations, et axé sur l'amélioration", "Public et humiliant", "Retardé de plusieurs mois"],
          correctAnswer: "Spécifique, fondé sur des observations, et axé sur l'amélioration",
          explanation: "Feedback constructif: spécifique (ex: 'La présentation a manqué de structure'), fondé sur les faits, actionnable, et livré avec intention d'aider. Cela élève la personne au lieu de la diminuer."
        },
        {
          id: 2,
          question: "Quel canal serait préférable pour une information urgente?",
          options: ["Email uniquement", "Appel ou message instantané pour rapidité, suivi par écrit", "Lettre recommandée", "Affichage papier"],
          correctAnswer: "Appel ou message instantané pour rapidité, suivi par écrit",
          explanation: "Pour l'urgence: canal immédiat (appel/chat). Puis confirmation écrite. Email seul est trop lent. Choisir le canal selon l'urgence et l'importance est un art de communication."
        },
        {
          id: 3,
          question: "Vous avez un désaccord important avec votre superviseur. Comment l'aborder?",
          options: ["L'ignorer et continuer", "Demander une réunion privée, écouter sa perspective, expliquer la vôtre avec faits, chercher une solution", "Aller à la direction", "Quitter le travail"],
          correctAnswer: "Demander une réunion privée, écouter sa perspective, expliquer la vôtre avec faits, chercher une solution",
          explanation: "Résoudre les désaccords: communication respectueuse, écoute active, présentation de faits plutôt que d'opinions. Cela résout souvent les conflits de manière constructive."
        },
        {
          id: 4,
          question: "Qu'est-ce que l'écoute active?",
          options: ["Parler plus que d'écouter", "Écouter complètement, comprendre le message, valider les émotions, et répondre avec empathie", "Distraire pendant qu'on vous parle", "Interrompre constamment"],
          correctAnswer: "Écouter complètement, comprendre le message, valider les émotions, et répondre avec empathie",
          explanation: "Écoute active: attention complète, absence de jugement, reformulation pour vérifier la compréhension, reconnaissance des émotions. C'est la fondation de la communication empathique."
        },
        {
          id: 5,
          question: "Vous présentez un projet à un public mixt (techniques et non-techniques). Comment structurer?",
          options: ["Utiliser beaucoup de jargon technique", "Commencer par le 'pourquoi', expliquer les concepts simplement, utiliser visuels, et adapter à l'audience", "Parler très vite", "Ignorer les questions"],
          correctAnswer: "Commencer par le 'pourquoi', expliquer les concepts simplement, utiliser visuels, et adapter à l'audience",
          explanation: "Présentation efficace: contexte d'abord, puis détails adapté à la compréhension de l'audience. Visuels plutôt que texte dense. Inviter les questions pour l'engagement."
        },
        {
          id: 6,
          question: "Qu'est-ce que l'intelligence émotionnelle (EI) en communication?",
          options: ["N'avoir aucune émotion", "Reconnaître et gérer ses propres émotions et celles des autres pour une communication efficace", "Cacher toute vulnérabilité", "Être toujours positif"],
          correctAnswer: "Reconnaître et gérer ses propres émotions et celles des autres pour une communication efficace",
          explanation: "EI: conscience de soi (émotions), autorégulation, empathie (comprendre les autres), relations sociales. C'est crucial pour le leadership et la collaboration."
        },
        {
          id: 7,
          question: "Comment gérer une personne qui interrompt constamment lors de réunions?",
          options: ["L'interrompre à votre tour", "Établir des règles claires, reconnaître l'interruption respectueusement, gérer le temps de parole équitablement", "Exclure la personne", "Laisser faire"],
          correctAnswer: "Établir des règles claires, reconnaître l'interruption respectueusement, gérer le temps de parole équitablement",
          explanation: "Gérer les interrupteurs: établir des normes de groupe ('Écoutons sans interrompre'), reconnaître ('Et si tu finissais?'), et maintenir l'équité. C'est du leadership de réunion."
        },
        {
          id: 8,
          question: "Quel est l'impact du langage corporel lors d'une vidéoconférence?",
          options: ["Pas d'impact car on ne se voit pas", "Contact visuel à la caméra, posture ouverte, gestes naturels créent de l'engagement et de la confiance", "Rester complètement immobile", "Regarder en bas l'écran"],
          correctAnswer: "Contact visuel à la caméra, posture ouverte, gestes naturels créent de l'engagement et de la confiance",
          explanation: "En vidéo: regarder la caméra (contact visuel), bonne posture, gestes naturels. Même en ligne, le language corporel communique la confiance et l'engagement."
        },
        {
          id: 9,
          question: "Vous devez annoncer une mauvaise nouvelle à votre équipe. Quelle approche?",
          options: ["L'ignorer et espérer que personne ne remarque", "Soyez direct et honnête, expliquez les raisons, proposez les prochaines étapes et offrez du support", "Envoyer un email anonyme", "Reporters l'annonce"],
          correctAnswer: "Soyez direct et honnête, expliquez les raisons, proposez les prochaines étapes et offrez du support",
          explanation: "Annoncer les mauvaises nouvelles avec clarté, empathie et transparency crée la confiance. Cela permet à l'équipe de gérer le changement plutôt que de ruminer."
        },
        {
          id: 10,
          question: "Qu'est-ce que la 'communication non-verbale'?",
          options: ["Parler sans utiliser les mots", "Gestes, tonalité, expression faciale, posture qui communiquent sans paroles", "Ne pas communiquer du tout", "Communication par email"],
          correctAnswer: "Gestes, tonalité, expression faciale, posture qui communiquent sans paroles",
          explanation: "93% de la communication est non-verbale (Mehrabian). Tonalité affectuelle (51%), expression faciale/posture (38%), mots (7%). Congruence entre verbal et non-verbal est clé."
        },
        {
          id: 11,
          question: "Comment réagir quand quelqu'un dit quelque chose avec lequel vous n'êtes pas d'accord?",
          options: ["Défendre votre point immédiatement", "Écouter pour comprendre, poser des questions, puis partager votre perspective respectueusement", "Rester silencieux", "Critiquer publiquement"],
          correctAnswer: "Écouter pour comprendre, poser des questions, puis partager votre perspective respectueusement",
          explanation: "Désaccord sain: d'abord comprendre (questions), puis partager votre vue. C'est du respect et de la curiosité. Cela crée des relations plus fortes et de meilleures décisions."
        },
        {
          id: 12,
          question: "Qu'est-ce qu'une communication 'transparente' en entreprise?",
          options: ["Cacher les problèmes", "Partager les informations ouvertement, admettre les erreurs, et expliciter les décisions et leurs raisons", "Parler trop informellement", "Ne rien dire"],
          correctAnswer: "Partager les informations ouvertement, admettre les erreurs, et expliciter les décisions et leurs raisons",
          explanation: "Transparence: partage d'infos non-confidentiel, admitting les erreurs, explicitation des 'pourquoi'. Cela crée la confiance, la responsabilité et l'engagement."
        }
      ]
    },
    marketing: {
      testTitle: "Test de Maîtrise Marketing - Stratégie Digital & Ventes",
      domain: "Marketing / Ventes",
      difficulty: "Intermédiaire",
      questions: [
        {
          id: 1,
          question: "Qu'est-ce que le SEO (Search Engine Optimization) et quel est son objectif?",
          options: ["Acheter de la publicité Google", "Optimiser le site pour améliorer le classement organique sur les moteurs de recherche", "Écrire des articles sans structure", "Ignorer Google"],
          correctAnswer: "Optimiser le site pour améliorer le classement organique sur les moteurs de recherche",
          explanation: "SEO: optimiser le contenu, structure technique, backlinks pour que Google classe bien le site. C'est du trafic organique gratuit à long terme (vs SEM payant)."
        },
        {
          id: 2,
          question: "Quelle métrique suit-on pour mesurer le taux de conversion?",
          options: ["Nombre de visiteurs uniquement", "Pourcentage d'actions désirées (achat, inscription) sur le total de visiteurs", "Taille de la page en MB", "Vitesse du serveur"],
          correctAnswer: "Pourcentage d'actions désirées (achat, inscription) sur le total de visiteurs",
          explanation: "Taux de conversion = actions désirées / visiteurs totaux. Ex: 100 achats / 5000 visiteurs = 2%. C'est le KPI clé pour ROI."
        },
        {
          id: 3,
          question: "Qu'est-ce que l'inbound marketing?",
          options: ["Interrompre les gens avec des pubs", "Attirer des clients par du contenu utile et pertinent, les éduquer, pour qu'ils viennent à vous", "Envoyer des emails non-sollicités", "Appels froids uniquement"],
          correctAnswer: "Attirer des clients par du contenu utile et pertinent, les éduquer, pour qu'ils viennent à vous",
          explanation: "Inbound: créer du contenu utile (blog, vidéos), SEO, social media pour que les clients trouvent VOUS. C'est moins agressif et plus efficace que l'outbound (publicité interruptive)."
        },
        {
          id: 4,
          question: "Vous lancez un produit. Quel serait le premier pas d'une stratégie marketing?",
          options: ["Dépenser beaucoup en publicité", "Définir le public cible, comprendre leurs besoins, créer une stratégie de positionnement", "Copier la concurrence", "Ne pas faire de recherche"],
          correctAnswer: "Définir le public cible, comprendre leurs besoins, créer une stratégie de positionnement",
          explanation: "Avant toute tactique: segmenter le contexte (segmentation), comprendre leurs problèmes (persona), créer un positioning unique (différenciation). C'est la fondation stratégique."
        },
        {
          id: 5,
          question: "Qu'est-ce qu'une stratégie 'omnicanal' en vente?",
          options: ["Vendre uniquement en boutique", "Offrir une expérience consistent à travers tous les canaux (online, magasin, mobile, réseaux sociaux)", "Avoir un seul canal", "Ignorer les clients"],
          correctAnswer: "Offrir une expérience consistent à travers tous les canaux (online, magasin, mobile, réseaux sociaux)",
          explanation: "Omnicanal: client peut commencer sur mobile, continuer en magasin. Données unifiées, consistance. Cela augmente les ventes et la satisfaction client."
        },
        {
          id: 6,
          question: "Qu'est-ce qu'une 'funnel' (entonnoir) de conversion en marketing?",
          options: ["Un tuyau physique", "Les étapes que traverse un prospect: Awareness (connaître) → Consideration (considérer) → Decision (décider) → Action", "Un outil de cuisine", "Un type de base de données"],
          correctAnswer: "Les étapes que traverse un prospect: Awareness (connaître) → Consideration (considérer) → Decision (décider) → Action",
          explanation: "Le funnel: Awareness (attention), Consideration (éducation), Decision (vente), Retention. Mapper le funnel permet d'optimiser CHAQUE étape pour améliorer les conversions."
        },
        {
          id: 7,
          question: "Comment mesurer le ROI (Return On Investment) d'une campagne marketing?",
          options: ["C'est impossible", "ROI = (Revenu généré - Coût de la campagne) / Coût de la campagne × 100", "Compter les likes", "Ignorer les résultats"],
          correctAnswer: "ROI = (Revenu généré - Coût de la campagne) / Coût de la campagne × 100",
          explanation: "ROI mesure l'efficacité en $. Ex: Campagne coûte 1000€, génère 5000€ → ROI = 400%. C'est essential pour allouer le budget aux canaux les plus performants."
        },
        {
          id: 8,
          question: "Qu'est-ce que le content marketing et pourquoi est-ce important?",
          options: ["Créer beaucoup de publicités", "Créer du contenu utile (blog, vidéos, guides) pour éduquer et engager l'audience", "Ne pas créer de contenu", "Seulement vendre directement"],
          correctAnswer: "Créer du contenu utile (blog, vidéos, guides) pour éduquer et engager l'audience",
          explanation: "Content marketing: établir l'autorité, éduquer les clients, générer du trafic organique, créer de la fidélité. C'est plus rentable long-terme que la pub directe."
        },
        {
          id: 9,
          question: "Vous remarquez que de nouvelles inscriptions baissent. Quelle est la première étape d'analyse?",
          options: ["Ignorer le problème", "Analyser où dans le funnel il y a un drop (traffic, CTR, conversion)", "Augmenter la pub immédiatement", "Diminuer le prix"],
          correctAnswer: "Analyser où dans le funnel il y a un drop (traffic, CTR, conversion)",
          explanation: "Diagnostic de baisse: le trafic baisse (SEO/social), le CTR baisse (copy/design mauvais), la conversion baisse (offre produit). Identifier l'étape indique la solution."
        },
        {
          id: 10,
          question: "Qu'est-ce que la 'segmentation' client?",
          options: ["Pas important", "Diviser les clients en groupes selon critères (âge, comportement, valeur) pour des campagnes personnalisées", "Traiter tous les clients pareil", "Ignorer les données"],
          correctAnswer: "Diviser les clients en groupes selon critères (âge, comportement, valeur) pour des campagnes personnalisées",
          explanation: "Segmentation: permet des messages customisés. Ex: clients VIP vs nouveaux. Chaque segment a un message/offer différent. Cela augmente le relevance et le ROI."
        },
        {
          id: 11,
          question: "Quel KPI serait prioritaire pour évaluer la santé d'une entreprise SaaS?",
          options: ["Nombre de visiteurs", "MRR (Monthly Recurring Revenue), churn rate, LTV (Lifetime Value)", "Nombre de employees", "Nombre de bureaux"],
          correctAnswer: "MRR (Monthly Recurring Revenue), churn rate, LTV (Lifetime Value)",
          explanation: "Pour SaaS: MRR (revenu récurrent), churn (clients perdus), LTV (valeur totale client). Ces KPI indiquent la croissance durable et la santé du business."
        },
        {
          id: 12,
          question: "Vous testez deux versions de landing page (A/B test). Un design est très bien graphiquement mais convert peu. La question?",
          options: ["C'est impossible à optimiser", "Le design beau ne garantit pas la conversion. Analyser le texte, CTA, proposition de valeur et tester", "Mettre encore plus de design", "Ignorer les données"],
          correctAnswer: "Le design beau ne garantit pas la conversion. Analyser le texte, CTA, proposition de valeur et tester",
          explanation: "Conversion dépend de: clarté de la proposition, CTA clair et visible, trust signals. Beau design ≠ conversion. Les A/B tests révèlent ce qui REALLY marche."
        }
      ]
    }
  };

  return testConfig[domain] || testConfig["it"];
};

// SAMPLE_QUESTIONS reste pour compatibilité
const SAMPLE_QUESTIONS: Question[] = [
  { id: 1, text: "Qu'est-ce qu'une closure en JavaScript?", options: ["Une boucle qui ferme automatiquement","Une fonction qui a accès aux variables de sa portée parent","Un type de donnée primitive","Une méthode pour fermer les connexions réseau"], correct_answer: 1, category: "it", domain: "Développement" },
  { id: 2, text: "Quel est le rôle principal d'une maquette (mockup)?", options: ["Tester le backend","Visualiser l'interface utilisateur","Optimiser la base de données","Écrire du code"], correct_answer: 1, category: "design", domain: "UI/UX" },
];

export default function CompetenceTest() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"select" | "test" | "results">("select");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [testData, setTestData] = useState<CompetenceTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<number>(0);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const testTaken = localStorage.getItem("competence_test_taken");
    if (testTaken && !user) {
      toast.warning("Vous avez déjà utilisé votre essai gratuit. Connectez-vous pour débloquer plus d'essais.");
    }
  }, [user, navigate]);

  const startTest = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      const data = await res.json();

      let generated: CompetenceTest;
      if (data.success && data.test) {
        generated = data.test;
      } else {
        generated = generateCompetenceTest(category); // fallback
      }

      setTestData(generated);
      setSelectedCategory(category);

      const convertedQuestions: Question[] = generated.questions.map((tq, idx) => ({
        id: tq.id,
        text: tq.question,
        options: tq.options,
        correct_answer: tq.options.indexOf(tq.correctAnswer),
        category: category,
        domain: generated.testTitle
      }));

      setQuestions(convertedQuestions);
      setAnswers(new Array(convertedQuestions.length).fill(-1));
      setCurrentQuestion(0);
      setStage("test");
      setTimer(60); // 60 seconds per question
    } catch (err) {
      console.error('startTest error', err);
      toast.error('Impossible de générer le test, utilisation d’un test local');
      const generated = generateCompetenceTest(category);
      setTestData(generated);
      setSelectedCategory(category);
      const convertedQuestions: Question[] = generated.questions.map((tq, idx) => ({
        id: tq.id,
        text: tq.question,
        options: tq.options,
        correct_answer: tq.options.indexOf(tq.correctAnswer),
        category: category,
        domain: generated.testTitle
      }));
      setQuestions(convertedQuestions);
      setAnswers(new Array(convertedQuestions.length).fill(-1));
      setCurrentQuestion(0);
      setStage("test");
      setTimer(60);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    const q = questions[currentQuestion];
    const correct = q && optionIndex === q.correct_answer;
    setLastAnswerCorrect(!!correct);
    setShowAnswerFeedback(true);
    setShowExplanation(false);

    // Auto-advance après feedback
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setShowAnswerFeedback(false);
        setLastAnswerCorrect(null);
        setCurrentQuestion((c) => c + 1);
      }, 1500);
    }
  };

  // countdown timer per question
  useEffect(() => {
    if (stage !== 'test') return;

    setTimer(60);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // time expired for current question
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((c) => c + 1);
          } else {
            submitTest();
          }
          return 60;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, currentQuestion, questions.length]);

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
      const domain = testData?.domain || categoryLabel || "";

      setResult({
        correct,
        total: questions.length,
        percentage,
        category: categoryLabel || "",
        domain: domain
      });

      if (!user) {
        localStorage.setItem("competence_test_taken", "true");
      }

      setStage("results");
      setLoading(false);
      toast.success("Test complété avec succès!");
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
              { label: "Test de compétence" },
            ]}
          />
        </div>
      </section>

      <div className="container py-8 flex-1">
        {stage === "select" && (
          <div>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Tests de Compétence Certifiés</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Évaluez vos compétences techniques avec des tests complets générés intelligemment.
                {!user && " Vous avez droit à 1 essai gratuit."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {COMPETENCE_CATEGORIES.map((cat) => (
                <Card key={cat.value} className={`p-6 cursor-pointer hover:shadow-xl transition-all duration-300 ${cat.color} border-2`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{cat.icon}</h3>
                      <h3 className="text-lg font-semibold">{cat.label}</h3>
                    </div>
                    <Award className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    12 questions variées, <strong>théorie à mise en pratique</strong>
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-600">✓ Difficulté: Intermédiaire</p>
                    <p className="text-xs text-gray-600">✓ Temps estimé: 10-15 min</p>
                    <p className="text-xs text-gray-600">✓ Explications détaillées incluses</p>
                  </div>
                  <Button 
                    onClick={() => startTest(cat.value)} 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Démarrage...
                      </>
                    ) : (
                      <>
                        Commencer un test
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 À Quoi S'Attendre?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ 12 questions de niveau Intermédiaire</li>
                <li>✓ Théorie et mise en situation pratique</li>
                <li>✓ Explications détaillées pour chaque réponse</li>
                <li>✓ Rapport final avec score et recommandations</li>
              </ul>
            </div>
          </div>
        )}

        {stage === "test" && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {testData?.testTitle}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Difficulté: <span className="font-semibold">{testData?.difficulty}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {currentQuestion + 1}/{questions.length}
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-red-600 mt-2">Temps restant : {timer}s</p>
            </Card>

            {showAnswerFeedback && lastAnswerCorrect !== null && (
              <Card className={`p-4 mb-4 border-l-4 ${lastAnswerCorrect ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
                <div className="flex items-start gap-2">
                  {lastAnswerCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">✓ Bonne réponse!</p>
                        <p className="text-sm mt-1">Excellente performance — continuez sur cette lancée!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">✗ Réponse incorrecte</p>
                        <p className="text-sm mt-1">
                          Bonne réponse: <strong>{questions[currentQuestion].options[questions[currentQuestion].correct_answer]}</strong>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-6 mb-4">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">{questions[currentQuestion]?.text}</h3>

              <div className="space-y-3 mb-6">
                {questions[currentQuestion]?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 border-2 font-medium ${
                      answers[currentQuestion] === idx
                        ? idx === questions[currentQuestion].correct_answer
                          ? "border-green-500 bg-green-50 text-green-900"
                          : "border-red-500 bg-red-50 text-red-900"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center font-bold text-sm ${
                        answers[currentQuestion] === idx
                          ? idx === questions[currentQuestion].correct_answer
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-red-500 bg-red-500 text-white"
                          : "border-gray-300"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {showAnswerFeedback && testData && (
                <Card className="p-4 mb-6 bg-blue-50 border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">📚 Explication:</p>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {testData.questions[currentQuestion]?.explanation}
                  </p>
                </Card>
              )}

              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentQuestion(currentQuestion - 1);
                      setShowAnswerFeedback(false);
                      setShowExplanation(false);
                    }}
                    className="flex-1"
                  >
                    ← Précédent
                  </Button>
                )}
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={() => {
                      setCurrentQuestion(currentQuestion + 1);
                      setShowAnswerFeedback(false);
                      setShowExplanation(false);
                    }}
                    disabled={answers[currentQuestion] === -1}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    Suivant →
                  </Button>
                ) : (
                  <Button
                    onClick={submitTest}
                    disabled={answers.includes(-1) || loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Soumettre & Voir Résultats
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {stage === "results" && result && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 mb-6 text-center">
              <div className="text-center mb-8">
                {result.percentage >= 80 ? (
                  <>
                    <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold text-green-900 mb-2">Excellent!</h2>
                  </>
                ) : result.percentage >= 60 ? (
                  <>
                    <CheckCircle2 className="h-20 w-20 text-blue-500 mx-auto mb-4 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Bon Résultat!</h2>
                  </>
                ) : (
                  <>
                    <XCircle className="h-20 w-20 text-orange-500 mx-auto mb-4 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold text-orange-900 mb-2">À Améliorer</h2>
                  </>
                )}
                <p className="text-gray-600 mb-6">Voici votre rapport d'évaluation détaillé</p>

                <div className="mb-6">
                  <ScoreCircle percentage={result.percentage} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-white border-2 border-green-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">SCORE FINAL</p>
                    <p className="text-3xl font-bold text-green-600">{result.percentage}%</p>
                  </Card>
                  <Card className="p-4 bg-white border-2 border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">RÉPONSES CORRECTES</p>
                    <p className="text-3xl font-bold text-blue-600">{result.correct}/{result.total}</p>
                  </Card>
                  <Card className="p-4 bg-white border-2 border-purple-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">NIVEAU</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.percentage >= 80 ? "⭐⭐⭐" : result.percentage >= 60 ? "⭐⭐" : "⭐"}
                    </p>
                  </Card>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      result.percentage >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                      result.percentage >= 60 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                      "bg-gradient-to-r from-orange-500 to-amber-500"
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
                {result.percentage >= 80 && (
                  <Button
                    className="mb-4"
                    onClick={() => {
                      const text = `Certificat de réussite (${selectedCategory}): ${result.percentage}%`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `certificat-test-${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Télécharger mon certificat de réussite
                  </Button>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-lg border-l-4 ${
                  result.percentage >= 80 ? 'bg-green-50 border-green-500 text-green-800' :
                  result.percentage >= 60 ? 'bg-blue-50 border-blue-500 text-blue-800' :
                  'bg-orange-50 border-orange-500 text-orange-800'
                }`}>
                  <p className="font-semibold mb-2">📋 Résumé de Votre Performance:</p>
                  <p className="text-sm">
                    {result.percentage >= 80 
                      ? "Vous avez excellemment maîtrisé ce domaine! Vos connaissances théoriques et pratiques sont solides."
                      : result.percentage >= 60
                      ? "Vous avez une bonne compréhension du domaine. Quelques zones nécessitent une consolidation."
                      : "Vous avez besoin de renforcer vos connaissances dans ce domaine. Continuez votre apprentissage!"}
                  </p>
                </div>

                <Card className="p-4 bg-white">
                  <p className="font-semibold text-gray-900 mb-3">🎯 Recommandations Personnalisées:</p>
                  <ul className="space-y-2 text-sm">
                    {result.percentage >= 80 ? (
                      <>
                        <li className="flex gap-2">✓ <span>Explorez des sujets avancés pour approfondir vos compétences</span></li>
                        <li className="flex gap-2">✓ <span>Mentorez d'autres personnes pour consolider vos connaissances</span></li>
                        <li className="flex gap-2">✓ <span>Obtenez une certification professionnelle dans ce domaine</span></li>
                      </>
                    ) : result.percentage >= 60 ? (
                      <>
                        <li className="flex gap-2">→ <span>Révisez les sujets où vous avez eu des difficultés</span></li>
                        <li className="flex gap-2">→ <span>Cherchez des ressources complémentaires et des études de cas</span></li>
                        <li className="flex gap-2">→ <span>Pratiquez avec des exercices concrets du domaine</span></li>
                      </>
                    ) : (
                      <>
                        <li className="flex gap-2">⚡ <span>Commencez par les conceptsfondamentaux et les bases</span></li>
                        <li className="flex gap-2">⚡ <span>Prenez un cours structuré dans ce domaine</span></li>
                        <li className="flex gap-2">⚡ <span>Refaites le test après révision pour suivre votre progrès</span></li>
                      </>
                    )}
                  </ul>
                </Card>

                <Card className="p-4 bg-indigo-50 border border-indigo-200">
                  <p className="font-semibold text-indigo-900 mb-2">💡 Domaine Testé:</p>
                  <p className="text-indigo-800 text-sm font-medium">{result.domain || result.category}</p>
                </Card>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setStage("select")}
                  className="flex-1"
                >
                  ← Tester un autre domaine
                </Button>
                <Button
                  onClick={() => navigate(user ? "/parametres/recommandations" : "/")}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Voir Mes Recommandations
                </Button>
              </div>
            </Card>

            {user && (
              <Card className="p-4 bg-blue-50 border border-blue-200 text-center">
                <p className="text-sm text-blue-800">
                  ✓ Votre résultat a été sauvegardé à votre profil et apparaît dans votre tableau de bord.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
