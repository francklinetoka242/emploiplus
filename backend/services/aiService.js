import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
let model;
let isMockMode = false;

async function initializeAI() {
  if (!API_KEY) {
    console.warn('GEMINI_API_KEY not found, activating MOCK_MODE');
    isMockMode = true;
    return;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  try {
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    console.log('IA initialisée avec gemini-1.5-flash');
  } catch (error) {
    console.warn('Erreur avec gemini-1.5-flash, tentative avec gemini-pro:', error.message);
    try {
      model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        safetySettings: [
          {
            category: HarmCategory.HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
      console.log('IA initialisée avec gemini-pro');
    } catch (fallbackError) {
      console.error('Erreur avec gemini-pro, activation MOCK_MODE:', fallbackError.message);
      isMockMode = true;
    }
  }
}

// Appeler l'initialisation au chargement du module
initializeAI();

export async function parseCV(fileBuffer) {
  if (isMockMode) {
    console.log('Mode mock activé pour parseCV');
    return {
      nom: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      tel: '0123456789',
      compétences: ['JavaScript', 'Node.js', 'React']
    };
  }

  try {
    const prompt = `
    Analyse ce CV et extrait les informations suivantes au format JSON strict :
    - nom: le nom complet du candidat
    - email: l'adresse email
    - tel: le numéro de téléphone
    - compétences: un tableau des compétences principales

    Réponds uniquement avec le JSON, sans texte supplémentaire.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf', // Assumer PDF, ajuster si nécessaire
          data: fileBuffer.toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parser le JSON
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Erreur lors du parsing du CV:', error);
    // Fallback to mock
    return {
      nom: 'Erreur de parsing',
      email: 'erreur@example.com',
      tel: '0000000000',
      compétences: []
    };
  }
}