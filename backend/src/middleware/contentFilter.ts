/**
 * Middleware pour le filtrage de contenu profane côté serveur
 * Utilisé pour les routes POST/PUT de publications et commentaires
 * Double sécurité avec le filtre client
 */

import { Request as ExRequest, Response, NextFunction } from 'express';

// Liste des mots interdits (même que côté client)
const BANNED_WORDS = [
  // Français - Grossièretés courantes
  "merde", "putain", "con", "connard", "conne", "salope", "enculé",
  "fils de pute", "fdp", "bâtard", "batard", "chie", "chier",
  "emmerder", "emmerdeur", "bite", "chatte", "couille", "couilles",
  "nique", "niquer", "pd", "pédé", "tarlouze", "pédéraste",
  "trou du cul", "connerie", "foutre", "foutaise",

  // Français - Discriminations raciales
  "bougnoule", "nègre", "negre", "sale arabe", "youpin", "feuj",
  "chelou", "métèque", "raton", "rebeu", "chinois", "jap", "rnb",
  "ricain", "sale blanc", "sale noir", "sale black",

  // Français - Discriminations religieuses
  "sale juif", "sale musulman", "sale catholique", "raciste", "racisme",
  "antisémite", "antisémitisme", "islamophobe", "islamophobie",
  "nazie", "nazi", "hitler", "fasciste",

  // Français - Homophobie/Transphobie
  "lgtb", "lgtbq", "trans", "transsexuel", "travestis", "gouine",
  "homo", "petite tantouse", "tantouse", "enculé", "pédé", "pédale",
  "lesbienne", "lesbe",

  // Français - Sexisme
  "féministe", "féminazis", "salaud", "salaude", "salope",
  "débile", "pute", "putain", "petasse", "garce", "harpie",
  "souillon", "traînée",

  // Français - Handicapisme
  "handicapé", "mongolien", "mongoloïde", "débile", "débilité",
  "crétin", "imbécile", "idiot", "fou", "folle", "dément",
  "dementia", "paralysé", "boiteux", "aveugle", "sourd",

  // Français - Âgisme
  "vieille", "vieux", "vieillard", "décrépit", "gâteux",

  // Français - Harcèlement/Menaces
  "tuer", "meurtre", "assassiner", "mort à", "tue toi",
  "va te pendre", "suicide", "se suicider", "viole", "violer",
  "viol", "violence", "agresser", "agression", "menace",
  "menacer", "harceler", "harcèlement", "stalker", "sabotage",
  "saboteur", "arme", "explosif", "bombe", "mitraillette",

  // Français - Contenu adulte
  "porno", "pornographique", "sexe", "sexuel", "nudit",
  "nudité", "escort", "prostitution", "prostituée", "putain",
  "travesti", "bdsm", "orgie", "fellation", "sodomie",

  // Anglais - Profanity common
  "fuck", "fucking", "fucker", "fuckhead", "shit", "shitty",
  "asshole", "asshat", "bitch", "bitchy", "bitches", "cunt",
  "dick", "dickhead", "cock", "cocksucker", "pussy", "bastard",
  "motherfucker", "motherfucking", "damn", "dammit", "damned",
  "hell", "crap", "crappy", "whore", "slut", "slurp",

  // Anglais - Racial slurs
  "nigger", "nigga", "negro", "paki", "sandnigger", "chink",
  "gook", "jap", "beaner", "wetback", "spic", "honky",
  "cracker", "redneck", "hillbilly", "raghead", "towelhead",

  // Anglais - LGBTQ+ slurs
  "faggot", "fag", "dyke", "tranny", "shemale", "homo",
  "queer", "gay", "lesbian",

  // Anglais - Disability slurs
  "retard", "retarded", "cripple", "crippled", "handicapped",
  "disabled", "gimp", "lame", "tard", "sped", "derp",

  // Anglais - Violence/Threats
  "kill", "killing", "murder", "murdering", "die", "dying",
  "dead", "death", "threat", "threatening", "rape", "rapist",
  "raping", "assault", "assaulting", "violence", "violent",
  "abuse", "abusing", "gun", "knife", "bomb", "explosive",
  "shoot", "shooting", "stab", "stabbing", "punch", "punching",
  "kick", "kicking", "hit", "hitting", "hurt", "hurting",
  "pain", "suffer", "suffering", "torture", "torturing",
  "execute", "execution",

  // Autres termes contextuels
  "terroriste", "terrorism", "terrorist", "jihadiste",
  "violent extremist", "cult", "séparatiste", "suprematist",
  "white supremacy", "aryan", "illuminati", "conspiracy",
];

/**
 * Normalise le texte pour la détection
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ôö]/g, "o")
    .replace(/[ûü]/g, "u")
    .replace(/[î]/g, "i")
    .replace(/[ç]/g, "c")
    .replace(/[œ]/g, "oe")
    .replace(/[æ]/g, "ae")
    .replace(/[^a-z0-9]/g, " "); // Remplace tous les caractères spéciaux par un espace
}

/**
 * Détecte les mots interdits dans le texte
 */
function detectBannedWords(text: string): string[] {
  const normalizedText = normalizeText(text);
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 0);
  const foundWords: string[] = [];

  for (const bannedWord of BANNED_WORDS) {
    for (const word of words) {
      if (word.includes(bannedWord) || bannedWord.includes(word)) {
        if (!foundWords.includes(bannedWord)) {
          foundWords.push(bannedWord);
        }
      }
    }
  }

  return foundWords;
}

/**
 * Middleware pour filtrer les publications et commentaires
 * Bloque la requête si du contenu profane est détecté
 */
export const contentFilterMiddleware = (req: ExRequest, res: Response, next: NextFunction) => {
  // Appliquer le filtre seulement aux requêtes POST/PUT avec du contenu
  if (!["POST", "PUT"].includes(req.method)) {
    return next();
  }

  const body = req.body as any;
  const contentToCheck = body?.content || body?.text || "";

  if (!contentToCheck || typeof contentToCheck !== "string") {
    return next();
  }

  // Détecte les mots interdits
  const foundWords = detectBannedWords(contentToCheck);

  if (foundWords.length > 0) {
    console.warn(
      `[CONTENT FILTER] Banned words detected by user ${(req as any).userId}:`,
      foundWords,
      "in content:",
      contentToCheck.substring(0, 50)
    );

    return res.status(400).json({
      success: false,
      error: "Contenu non autorisé détecté",
      message: "En raison du respect des règles de notre communauté professionnelle, les mots ou expressions insultants, discriminatoires ou inappropriés ne sont pas tolérés.",
      triggeredWords: foundWords,
      code: "BANNED_CONTENT",
    });
  }

  next();
};

/**
 * Middleware pour enregistrer les violations et suspendre les récidivistes
 */
export const profanityViolationLogger = (req: ExRequest, res: Response, next: NextFunction) => {
  // Hook dans la méthode res.json pour capturer les réponses d'erreur
  const originalJson = res.json.bind(res);

  res.json = function(data: any) {
    // Si c'est une erreur de contenu bannis et l'utilisateur est connecté
    if (
      data?.code === "BANNED_CONTENT" &&
      (req as any).userId &&
      res.statusCode === 400
    ) {
      // Enregistrer la violation (optionnel - peut être sauvegardé en base de données)
      console.log(
        `[VIOLATION LOGGED] User ${(req as any).userId} attempted to post banned content at ${new Date().toISOString()}`
      );

      // Optionnel : notifier les admins (via queue ou webhook)
      // sendAdminNotification(userId, 'BANNED_CONTENT', data.triggeredWords);
    }

    return originalJson(data);
  };

  next();
};

export default contentFilterMiddleware;
