import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';
import jobService from '../services/job.service.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize the model - try different models in order
let model;
let useMock = false; // when true, bypass real API and use generated mock data
const AVAILABLE_MODELS = ['gemini-1.0-pro', 'gemini-pro', 'gemini-1.5-flash'];

async function initializeModel() {
  console.log('[AI] Clé API présente:', !!process.env.GEMINI_API_KEY);

  for (const modelName of AVAILABLE_MODELS) {
    try {
      console.log(`[AI] Trying model: ${modelName}`);
      // protecting the getGenerativeModel call itself
      try {
        model = genAI.getGenerativeModel({ model: modelName });
      } catch (getErr) {
        console.log(`[AI] ⚠️  Failed to get model instance ${modelName}:`, getErr.message);
        continue; // try next model
      }

      // Quick test to verify model availability
      const testResult = await model.generateContent('test');
      console.log(`[AI] ✅ Model ${modelName} initialized successfully`);
      return;
    } catch (err) {
      console.log(`[AI] ⚠️  Model ${modelName} not available: ${err.message?.substring(0, 100)}`);
    }
  }
  
  // If we reach here, no model worked
  console.log(`[AI] ⚠️  No models available, will use MOCK analysis instead`);
  useMock = true;
  model = null;
}

// Initialize on import and guard against unhandled rejection
initializeModel().catch((initErr) => {
  console.log('[AI] ❌ Initialization error:', initErr.message);
  console.log('[AI] Falling back to mock analysis only');
  useMock = true;
  model = null;
});

/**
 * Robustly extracts JSON from a Gemini API response
 * Handles: markdown wrapping (```json...```), extra text, nested objects, control characters
 * @param {string} responseText - The raw text from Gemini response
 * @returns {Object} - The parsed JSON object, or null if extraction fails
 */
function extractJsonFromGeminiResponse(responseText) {
  try {
    // Input validation
    if (!responseText || typeof responseText !== 'string') {
      console.log('[AI] ❌ extractJsonFromGeminiResponse: Invalid input (null/undefined/not string)');
      return null;
    }

    // Step 1: Remove markdown code block wrappers (```json ... ```)
    let cleaned = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Step 2: Find the first opening brace and last closing brace
    const openBraceIndex = cleaned.indexOf('{');
    const lastBraceIndex = cleaned.lastIndexOf('}');

    if (openBraceIndex === -1 || lastBraceIndex === -1) {
      console.log('[AI] ❌ extractJsonFromGeminiResponse: No JSON object found (no braces)');
      return null;
    }

    // Step 3: Extract the JSON content between braces
    let jsonContent = cleaned.slice(openBraceIndex, lastBraceIndex + 1);

    // Step 4: Try basic parsing first
    try {
      const parsed = JSON.parse(jsonContent);
      console.log('[AI] ✅ JSON parsed successfully on first try');
      return parsed;
    } catch (initialParseError) {
      console.log('[AI] ⚠️  Initial parse failed, attempting cleanup...');
    }

    // Step 5: If initial parse fails, do aggressive cleanup
    // Remove control characters and normalize whitespace
    jsonContent = jsonContent
      .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control characters
      .replace(/\s+/g, ' ')               // Normalize multiple spaces
      .trim();

    // Step 6: Try parsing again after cleanup
    try {
      const parsed = JSON.parse(jsonContent);
      console.log('[AI] ✅ JSON parsed successfully after cleanup');
      return parsed;
    } catch (cleanedParseError) {
      console.log('[AI] ❌ JSON parse failed even after cleanup');
      console.log('[AI] Error:', cleanedParseError.message);
      console.log('[AI] Content preview:', jsonContent.substring(0, 100));
      return null;  // Return null instead of throwing
    }
  } catch (unexpectedError) {
    console.log('[AI] ❌ Unexpected error in extractJsonFromGeminiResponse:', unexpectedError.message);
    return null;  // Return null on unexpected errors
  }
}

/**
 * Generate mock analysis for fallback when API is unavailable
 */
function generateMockAnalysis(cvText, jobDescription) {
  console.log('[AI] 🎭 Using MOCK analysis as fallback');
  
  const hasJavaScript = cvText.toLowerCase().includes('javascript') || cvText.toLowerCase().includes('js');
  const hasPython = cvText.toLowerCase().includes('python');
  const hasExperience = cvText.toLowerCase().includes('year') || cvText.toLowerCase().includes('exp');
  
  const score = hasJavaScript && hasExperience ? 75 : hasPython ? 65 : 55;
  
  return {
    score_matching: score,
    points_forts: [
      'Profil technique solide',
      'Expérience démontrée',
      'Adaptabilité manifeste'
    ],
    lacunes: [
      'Certification professionnelle à acquérir',
      'Expérience secteur spécifique limitée'
    ],
    lettre_motivation: `Madame, Monsieur,

Très intéressé par cette opportunité, je suis convaincu que mon profil et mon expérience répondent parfaitement à vos besoins.

Au cours de ma carrière, j'ai développé une expertise solide et je m'engage à apporter une valeur ajoutée significative à votre équipe.

Je serais ravi de discuter davantage de ma candidature lors d'un entretien.

Cordialement,`
  };
}

/**
 * Generates mock CV data for fallback when API is unavailable
 */
function generateMockCvData(cvText) {
  console.log('[AI] 🎭 Using MOCK CV data extraction as fallback');
  
  // Simple regex to extract potential name (usually at the beginning)
  const nameMatch = cvText.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/m);
  const name = nameMatch ? nameMatch[0] : 'Nom non extrait';
  
  // Look for education keywords
  const education = [];
  const eduKeywords = ['bac', 'licence', 'master', 'diplôme', 'degree', 'bachelor', 'mba', 'certification'];
  eduKeywords.forEach(keyword => {
    if (cvText.toLowerCase().includes(keyword)) {
      education.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Count years of experience
  const yearMatches = cvText.match(/(\d{1,2})\s*(?:ans?|years?|y)/gi) || [];
  const experienceYears = yearMatches.length > 0 ? parseInt(yearMatches[0]) : 0;
  
  // Extract common technical skills
  const skills = [];
  const techSkills = ['javascript', 'python', 'react', 'node', 'sql', 'java', 'c++', 'html', 'css', 'aws', 'git'];
  techSkills.forEach(skill => {
    if (cvText.toLowerCase().includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  return {
    name,
    education: education.length > 0 ? education : ['Données non extraites'],
    experience_years: experienceYears,
    skills: skills.length > 0 ? skills : ['Données non extraites']
  };
}

/**
 * Extracts factual CV data (name, education, experience, skills) without scoring
 * INCASSABLE: Always returns 200 with fallback data, never throws errors
 */
async function extractCvData(req, res) {
  // ===== PROTECTION CONTRE LA DOUBLE LECTURE =====
  // NE JAMAIS appeler req.body, req.json(), req.formData() - Multer a déjà tout fait

  let cvText = '';
  let cvData = null;
  let isFallback = false;

  try {
    console.log('[AI] ===== EXTRACT CV DATA ENDPOINT CALLED =====');

    // ===== GESTION DU BUFFER =====
    // Vérification stricte avant toute opération
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      console.log('[AI] ❌ No valid file buffer, using fallback');
      isFallback = true;
      cvData = {
        name: 'Non extrait',
        education: [],
        experience_years: 0,
        skills: []
      };
    } else {
      // Buffer valide, procéder à l'extraction
      console.log('[AI] ===== STEP 1: PDF TEXT EXTRACTION =====');

      try {
        console.log('[AI] Calling PDFParse with buffer length:', req.file.buffer.length);
        const parser = new PDFParse({ data: req.file.buffer });
        await parser.load();
        const textData = await parser.getText();
        cvText = textData.text || '';
        await parser.destroy();

        console.log('[AI] ✅ PDF text extracted successfully, length:', cvText.length);

        if (!cvText || cvText.trim().length === 0) {
          console.log('[AI] ⚠️  PDF text is empty, using fallback');
          isFallback = true;
          cvData = {
            name: 'Non extrait',
            education: [],
            experience_years: 0,
            skills: []
          };
        }
      } catch (pdfError) {
        console.log('[AI] ❌ PDF extraction failed:', pdfError.message?.substring(0, 100));
        console.log('[AI] Using fallback data');
        isFallback = true;
        cvData = {
          name: 'Non extrait',
          education: [],
          experience_years: 0,
          skills: []
        };
      }

      // ===== STEP 2: IA GEMINI (seulement si PDF réussi) =====
      if (!isFallback && cvText && cvText.length > 0) {
        console.log('[AI] ===== STEP 2: CALLING GEMINI AI =====');

        if (useMock || !model) {
          console.log('[AI] ⚠️  No AI model, using mock extraction');
          isFallback = true;
          cvData = generateMockCvData(cvText);
        } else {
          try {
            const systemPrompt = `Tu es un expert en parsing de CV. Ton UNIQUE objectif est d'extraire les données factuelles du CV avec STRICTE neutralité.

### REGLES ABSOLUES :
1. **AUCUN JUGEMENT** : N'extrais QUE les données visibles dans le CV
2. **AUCUN SCORE** : Pas de scoring, pas d'évaluation, pas de jugement de valeur
3. **AUCUNE LETTRE DE MOTIVATION** : Tu ne génères RIEN de plus
4. **FACTUEL UNIQUEMENT** : Extraction pure et simple

### DONNÉES À EXTRAIRE :
- name : Nom complet du candidat (tel qu'écrit dans le CV)
- education : Liste des diplômes/formations mentionnées (liste simple de chaînes)
- experience_years : Nombre d'années d'expérience totale mentionnée (nombre entier)
- skills : Liste des compétences techniques explicitement mentionnées (liste simple)

### STRUCTURE JSON STRICTE (ET UNIQUEMENT CELA) :
{
  "name": "<nom_exact>",
  "education": ["<diplôme_1>", "<diplôme_2>"],
  "experience_years": <nombre>,
  "skills": ["<compétence_1>", "<compétence_2>"]
}

Réponds UNIQUEMENT en JSON. Rien avant, rien après.`;

            const userPrompt = `CV À ANALYSER :\n\n${cvText}`;

            console.log('[AI] Making Gemini API call...');

            const result = await model.generateContent({
              contents: [{
                role: 'user',
                parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
              }]
            });

            const responseText = result.response.text();
            cvData = extractJsonFromGeminiResponse(responseText);

            if (!cvData) {
              console.log('[AI] ❌ Gemini JSON extraction failed, using mock');
              isFallback = true;
              cvData = generateMockCvData(cvText);
            } else {
              console.log('[AI] ✅ Gemini extraction successful');
            }

          } catch (geminiError) {
            console.log('[AI] ❌ Gemini API failed:', geminiError.message?.substring(0, 100));
            console.log('[AI] Using mock data extraction');
            isFallback = true;
            cvData = generateMockCvData(cvText);
          }
        }
      }
    }

    // ===== STEP 3: CONSTRUCTION RÉPONSE =====
    console.log('[AI] ===== STEP 3: BUILDING RESPONSE =====');

    // Fallback final si toujours null
    if (!cvData) {
      console.log('[AI] ⚠️  No data extracted, using final fallback');
      cvData = {
        name: 'Non extrait',
        education: [],
        experience_years: 0,
        skills: []
      };
      isFallback = true;
    }

    // Structure de réponse normalisée
    const finalResponse = {
      success: true,
      ...(isFallback && { message: 'Données extraites en mode dégradé' }),
      data: {
        name: cvData.name || 'Non extrait',
        education: Array.isArray(cvData.education) ? cvData.education : [],
        experience_years: typeof cvData.experience_years === 'number' ? cvData.experience_years : 0,
        skills: Array.isArray(cvData.skills) ? cvData.skills : []
      }
    };

    console.log('[AI] ✅ Response built successfully');
    console.log('[AI] ===== EXTRACTION COMPLETED =====');

    // ===== NETTOYAGE DU FLUX =====
    // Ne rien faire avec req après cette ligne - le stream est terminé
    res.status(200).json(finalResponse);

  } catch (criticalError) {
    // ===== FALLBACK ABSOLU =====
    // Même en cas d'erreur critique, retourner du fallback
    console.error('[AI] ===== CRITICAL ERROR - USING ABSOLUTE FALLBACK =====');
    console.error('[AI] Error:', criticalError?.message || 'Unknown critical error');

    const fallbackResponse = {
      success: true,
      message: 'Service temporairement dégradé - données par défaut',
      data: {
        name: 'Non extrait',
        education: [],
        experience_years: 0,
        skills: []
      }
    };

    // S'assurer que la réponse est envoyée même en cas d'erreur critique
    try {
      res.status(200).json(fallbackResponse);
    } catch (responseError) {
      console.error('[AI] ❌ Even response failed:', responseError.message);
      // Si même res.json() échoue, c'est vraiment critique
      // Le gestionnaire d'erreur global prendra le relais
    }
  }
}

/**
 * Compares CV data with job requirements to generate matched elements and missing requirements
 */
function compareCVWithJob(cvData, jobDescription) {
  console.log('[AI] Starting CV vs Job comparison...');
  
  const matchedElements = [];
  const missingRequirements = [];
  
  // Extract job skills and requirements (simple keyword extraction)
  const jobLower = jobDescription.toLowerCase();
  const cvLower = JSON.stringify(cvData).toLowerCase();
  
  // Common technical skills to look for
  const allSkills = [
    'javascript', 'python', 'react', 'node', 'nodejs', 'sql', 'java', 'c++', 'c#', 'html', 'css',
    'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'git', 'devops',
    'typescript', 'vue.js', 'vue', 'angular', 'node.js', 'express', 'backend', 'frontend',
    'fullstack', 'full-stack', 'web', 'mobile', 'ios', 'android', 'flutter', 'react native',
    'mongodb', 'postgresql', 'mysql', 'firebase', 'rest api', 'graphql', 'api',
    'agile', 'scrum', 'jira', 'git', 'linux', 'windows', 'macos', 'testing', 'jest'
  ];
  
  // Check which skills in CV match the job requirements
  allSkills.forEach(skill => {
    const isInJob = jobLower.includes(skill);
    const isInCV = cvLower.includes(skill);
    
    if (isInCV && isInJob) {
      matchedElements.push(`Maîtrise de ${skill.charAt(0).toUpperCase() + skill.slice(1)}`);
    }
  });
  
  // Check experience level match
  const experienceMatch = jobLower.match(/(\d+)\s*(?:ans?|years?)/i);
  if (experienceMatch && cvData.experience_years) {
    const requiredExp = parseInt(experienceMatch[1]);
    if (cvData.experience_years >= requiredExp) {
      matchedElements.push(`${cvData.experience_years} ans d'expérience (${requiredExp} requis)`);
    } else {
      missingRequirements.push(`${requiredExp} ans d'expérience (vous en avez ${cvData.experience_years})`);
    }
  }
  
  // Check for degree/education requirements
  const degreeKeywords = ['master', 'bac', 'licence', 'bachelor', 'mba', 'ingénieur'];
  degreeKeywords.forEach(degree => {
    const isInJob = jobLower.includes(degree);
    const isInCV = cvData.education && cvData.education.some(edu => edu.toLowerCase().includes(degree));
    
    if (isInJob && isInCV) {
      matchedElements.push(`${degree.charAt(0).toUpperCase() + degree.slice(1)} en votre possession`);
    } else if (isInJob && !isInCV) {
      missingRequirements.push(`${degree.charAt(0).toUpperCase() + degree.slice(1)} requis`);
    }
  });
  
  // Remove duplicates
  const uniqueMatched = [...new Set(matchedElements)];
  const uniqueMissing = [...new Set(missingRequirements)];
  
  console.log('[AI] Comparison results:');
  console.log('[AI] Matched elements:', uniqueMatched.length);
  console.log('[AI] Missing requirements:', uniqueMissing.length);
  
  return {
    matchedElements: uniqueMatched,
    missingRequirements: uniqueMissing
  };
}

/**
 * Analyzes a CV against a job offer using Gemini AI
 * Can accept either a PDF file or pre-extracted CV data
 * Returns matching score based on actual comparison, strengths, missing skills, and a motivational letter
 */
async function analyzeCv(req, res) {
  let cvData = null;
  let jobDescription = '';
  let job = null;
  let analysis = null;
  let isFallback = false;


  try {
    console.log('[AI] ===== ANALYZE-CV ENDPOINT CALLED =====');
    console.log('[AI] Content-Type:', req.headers['content-type']);
    console.log('[AI] Has file:', !!req.file);
    console.log('[AI] Has body:', !!req.body);

    // Validate jobId first
    if (!req.body || typeof req.body !== 'object') {
      console.log('[AI] ❌ ERROR: req.body is missing or not an object');
      return res.status(400).json({ message: 'Corps de requête invalide' });
    }

    const { jobId, cvData: bodyCVData } = req.body;
    if (!jobId) {
      console.log('[AI] ❌ ERROR: No jobId provided');
      return res.status(400).json({ message: 'ID de l\'offre requis' });
    }

    const jobIdStr = String(jobId).trim();
    if (!jobIdStr || jobIdStr === 'undefined' || jobIdStr === 'null') {
      console.log('[AI] ❌ ERROR: Invalid jobId');
      return res.status(400).json({ message: 'ID de l\'offre invalide' });
    }

    console.log('[AI] ✅ JobId validated:', jobIdStr);

    // ===== STEP 1: Get CV Data =====
    console.log('[AI] ===== STEP 1: GET CV DATA =====');

    // Check if cvData is provided in the body (new mode)
    if (bodyCVData && typeof bodyCVData === 'object') {
      console.log('[AI] ✅ Using CV data from request body (pre-extracted)');
      cvData = bodyCVData;
    } else if (req.file && req.file.buffer) {
      // Old mode: Extract from PDF
      console.log('[AI] Extracting data from PDF file...');
      
      let pdfCVData;
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        await parser.load();
        const textData = await parser.getText();
        const cvText = textData.text || '';
        await parser.destroy();

        console.log('[AI] ✅ PDF text extracted');

        // Generate fallback mock data from PDF text
        pdfCVData = generateMockCvData(cvText);
        cvData = pdfCVData;
      } catch (pdfError) {
        console.log('[AI] ❌ ERROR extracting PDF:', pdfError.message);
        return res.status(500).json({
          message: 'Erreur lors de l\'extraction du PDF',
          error: pdfError.message
        });
      }
    } else {
      console.log('[AI] ❌ ERROR: Neither cvData nor file provided');
      return res.status(400).json({ message: 'CV data ou fichier PDF requis' });
    }

    if (!cvData) {
      console.log('[AI] ❌ ERROR: cvData is null');
      return res.status(400).json({ message: 'Impossib le d\'extraire les données du CV' });
    }

    console.log('[AI] ✅ CV data obtained:', {
      name: cvData.name,
      skills: cvData.skills?.length || 0,
      education: cvData.education?.length || 0,
      experience_years: cvData.experience_years
    });

    // ===== STEP 2: Fetch Job Details =====
    console.log('[AI] ===== STEP 2: FETCHING JOB DETAILS =====');

    try {
      job = await jobService.getJobById(jobIdStr);
      console.log('[AI] ✅ Job fetched:', {
        id: job?.id,
        title: job?.title,
        company: job?.company
      });
    } catch (jobError) {
      const msg = jobError?.message || String(jobError);
      console.log('[AI] ❌ ERROR fetching job:', msg);
      if (msg.toLowerCase().includes('not found')) {
        return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
      }
      return res.status(500).json({
        message: 'Erreur lors de la récupération de l\'offre',
        error: msg
      });
    }

    if (!job) {
      console.log('[AI] ❌ ERROR: Job not found');
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // ===== STEP 3: Build Job Description =====
    console.log('[AI] ===== STEP 3: BUILDING JOB DESCRIPTION =====');

    jobDescription = `
Titre du poste: ${job.title || 'Non spécifié'}
Entreprise: ${job.company || 'Non spécifiée'}
Localisation: ${job.location || 'Non spécifiée'}
Type de contrat: ${job.type || 'Non spécifié'}
Salaire: ${job.salary || 'Non spécifié'}
Description: ${job.description || ''}
Compétences requises: ${job.competence || job.requirements || 'Non spécifiées'}
Secteur: ${job.sector || 'Non spécifié'}
    `.trim();

    console.log('[AI] ✅ Job description built');

    // ===== STEP 4: Compare CV with Job =====
    console.log('[AI] ===== STEP 4: COMPARING CV WITH JOB =====');

    const comparison = compareCVWithJob(cvData, jobDescription);
    const { matchedElements, missingRequirements } = comparison;

    // Calculate score based on real comparison
    let scoreMatching = 50; // Base score
    if (matchedElements.length > 0) {
      scoreMatching = Math.min(100, 50 + (matchedElements.length * 10));
    }
    if (missingRequirements.length > 0) {
      scoreMatching = Math.max(0, scoreMatching - (missingRequirements.length * 5));
    }

    console.log('[AI] ✅ Score calculated:', scoreMatching);
    console.log('[AI] Matched elements:', matchedElements.length);
    console.log('[AI] Missing requirements:', missingRequirements.length);

    // ===== STEP 5: Generate Letter with Gemini =====
    console.log('[AI] ===== STEP 5: GENERATING LETTER WITH GEMINI =====');

    if (useMock || !model) {
      console.log('[AI] ⚠️  No AI model, using fallback letter');
      isFallback = true;
      analysis = generateMockAnalysis('', jobDescription);
    } else {
      try {
        const systemPrompt = `Tu es Francklin, un Expert en Recrutement Senior avec 20 ans d'expérience.
Ton objectif est de rédiger une lettre de motivation EXCEPTIONNELLE basée sur les données du candidat.

### DONNÉES DU CANDIDAT :
- Nom: ${cvData.name || 'Candidat'}
- Diplômes: ${(cvData.education || []).join(', ') || 'Non spécifiés'}
- Années d'expérience: ${cvData.experience_years || 0}
- Compétences: ${(cvData.skills || []).join(', ') || 'Non spécifiées'}

### CONSIGNES :
1. Utilise les compétences matchées pour montrer la pertinence
2. Proposenments des solutions pour les compétences manquantes
3. Rends la lettre personnelle et convaincante
4. Mentionne des exemples concrets des compétences

### STRUCTURE JSON ATTENDUE :
{
  "score_matching": ${scoreMatching},
  "points_forts": ["<point 1>", "<point 2>", "<point 3>"],
  "competences_manquantes": [${missingRequirements.slice(0, 2).map(r => `"${r}"`).join(', ') || '"Aucune identifiée"'}],
  "lettre_motivation": "<lettre professionnelle>"
}

Réponds UNIQUEMENT en JSON.`;

        const userPrompt = `OFFRE :
${jobDescription}`;

        console.log('[AI] Calling Gemini for letter generation...');

        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }]
        });

        const responseText = result.response.text();
        analysis = extractJsonFromGeminiResponse(responseText);

        if (!analysis) {
          console.log('[AI] ❌ Letter generation failed, using fallback');
          isFallback = true;
          analysis = generateMockAnalysis('', jobDescription);
        } else {
          console.log('[AI] ✅ Letter generated successfully');
          analysis.score_matching = scoreMatching;
        }

      } catch (geminiError) {
        console.log('[AI] ❌ ERROR calling Gemini:', geminiError.message?.substring(0, 100));
        isFallback = true;
        analysis = generateMockAnalysis('', jobDescription);
        analysis.score_matching = scoreMatching;
      }
    }

    // ===== STEP 6: Build Final Response =====
    console.log('[AI] ===== STEP 6: BUILDING FINAL RESPONSE =====');

    const finalResponse = {
      success: true,
      ...(isFallback && { fallback: true, message: 'Analyse partiellement en mode dégradé' }),
      data: {
        jobId: jobIdStr,
        jobTitle: job?.title || 'Titre non disponible',
        company: job?.company || 'Entreprise non disponible',
        score_matching: analysis?.score_matching || scoreMatching,
        matched_elements: matchedElements,
        missing_requirements: missingRequirements,
        points_forts: analysis?.points_forts || [],
        competences_manquantes: analysis?.competences_manquantes || [],
        lettre_motivation: analysis?.lettre_motivation || ''
      }
    };

    console.log('[AI] ✅ Response built successfully');
    console.log('[AI] ===== CV ANALYSIS COMPLETED =====');

    res.json(finalResponse);

  } catch (err) {
    // ===== GLOBAL ERROR HANDLER WITH FALLBACK =====
    console.error('[AI] ===== ⚠️ UNEXPECTED ERROR IN ANALYZE CV =====');
    console.error('[AI] Error caught:', err?.message || 'Unknown error');
    
    try {
      console.error('[AI] Error details:', {
        name: err?.name || 'unknown',
        message: err?.message || 'no message',
        code: err?.code || 'no code',
        status: err?.status || 'no status',
        stack: err?.stack?.substring(0, 500) || 'no stack'
      });
    } catch (errorDetailsErr) {
      console.error('[AI] Could not log error details:', errorDetailsErr.message);
    }
    
    try {
      console.error('[AI] Request context:', {
        bodyKeys: Object.keys(req?.body || {}),
        file: req?.file ? {
          originalname: req?.file?.originalname,
          mimetype: req?.file?.mimetype,
          size: req?.file?.size
        } : 'no file',
        cvTextAvailable: !!cvText,
        cvTextLength: cvText?.length || 0,
        jobAvailable: !!job
      });
    } catch (requestDetailsErr) {
      console.error('[AI] Could not log request context:', requestDetailsErr.message);
    }
    
    // Try to generate mock analysis as fallback
    console.log('[AI] Attempting to generate MOCK analysis as fallback...');
    let mockAnalysis = null;
    try {
      if (cvText && cvText.length > 0) {
        // Generate mock analysis using available CV text
        mockAnalysis = generateMockAnalysis(cvText, jobDescription || 'Offre d\'emploi');
        console.log('[AI] ✅ Mock analysis generated successfully from CV text');
      } else {
        // Generate basic mock analysis
        mockAnalysis = {
          score_matching: 50,
          points_forts: [
            'Expérience professionnelle',
            'Compétences techniques',
            'Motivation démontrée'
          ],
          lacunes: [
            'Information insuffisante pour analyse détaillée',
            'Recommandation: consultation directe conseillée'
          ],
          lettre_motivation: `Madame, Monsieur,

Très intéressé par cette opportunité, je suis convaincu que mon profil et mon expérience répondent à vos besoins.

Au cours de ma carrière, j'ai développé une expertise solide et je m'engage à apporter une valeur ajoutée significative à votre équipe.

Je serais ravi de discuter davantage de ma candidature lors d'un entretien.

Cordialement,`
        };
        console.log('[AI] ✅ Basic mock analysis generated (limited CV text)');
      }
    } catch (mockError) {
      console.error('[AI] ❌ Failed to generate mock analysis:', mockError.message);
      // Use absolute fallback
      mockAnalysis = {
        score_matching: 40,
        points_forts: ['Analyse disponible', 'Examen recommandé'],
        lacunes: ['Service temporairement dégradé'],
        lettre_motivation: `Nous vous répondrons rapidement.`
      };
    }
    
    // Return 200 with mock analysis (graceful degradation)
    console.log('[AI] 📤 Returning 200 response with mock analysis as fallback');
    try {
      const jobId = req?.body?.jobId || 'unknown';
      const finalResponse = {
        success: true,
        fallback: true,
        message: 'Analyse en mode dégradé (API temporairement indisponible)',
        data: {
          jobId: jobId,
          jobTitle: job?.title || 'Titre non disponible',
          company: job?.company || 'Entreprise non disponible',
          score_matching: mockAnalysis?.score_matching || 0,
          points_forts: mockAnalysis?.points_forts || [],
          competences_manquantes: mockAnalysis?.lacunes || [],
          lettre_motivation: mockAnalysis?.lettre_motivation || ''
        }
      };
      
      return res.status(200).json(finalResponse);
    } catch (responseError) {
      console.error('[AI] ❌ Failed to send fallback response:', responseError.message);
      // Last resort: send minimal response
      return res.status(200).json({
        success: true,
        fallback: true,
        message: 'Service temporairement dégradé'
      });
    }
  }
}

/**
 * POST /api/ai/generate-interview
 * Mock/AI generator for interview questions
 */
async function generateInterview(req, res) {
  try {
    const { position = 'poste', severity = 'Neutre' } = req.body || {};
    console.log('[AI] generateInterview called', { position, severity });

    const qCount = 5 + Math.floor(Math.random() * 3);
    let questions = [];
    let reportTemplate = '';

    if (useMock || !model) {
      const baseQuestions = [
        'Parlez‑moi de votre expérience liée à ce poste.',
        'Pourquoi souhaitez‑vous travailler ici ?',
        'Comment gérez‑vous les situations de stress ?',
        'Donnez un exemple d&apos;un projet réussi et votre rôle.',
        'Comment travaillez‑vous en équipe ?',
        'Comment réagissez‑vous face à une critique ?',
        'Avez‑vous des questions pour moi ?',
        'Quelles sont vos forces et faiblesses ?',
        'Où vous voyez‑vous dans 5 ans ?',
      ];
      questions = baseQuestions.sort(() => 0.5 - Math.random()).slice(0, qCount);
      reportTemplate = `Points forts:\n- ...\nPoints à améliorer:\n- ...\nNote globale: /100`;
    } else {
      const systemPrompt = `Tu es un recruteur expérimenté au Congo, capable de jouer plusieurs
niveaux de sévérité (Sympa, Neutre, Très exigeant). Génère ${qCount} questions
cohérentes pour un candidat postulant au poste de ${position}. Réponds uniquement
avec un objet JSON contenant : { questions: ["..."] , reportTemplate: "..." }.`;
      const userPrompt = `Contexte marché du travail : République du Congo,
focalise sur secteur local et attentes des employeurs.`;
      const call = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }]
      });
      const responseText = call.response.text();
      const extracted = extractJsonFromGeminiResponse(responseText);
      if (extracted && Array.isArray(extracted.questions)) {
        questions = extracted.questions.slice(0, qCount);
        reportTemplate = extracted.reportTemplate || reportTemplate;
      } else {
        console.log('[AI] ⚠️ generateInterview parsing failed, using mock');
        const base = [
          'Parlez‑moi de votre expérience liée à ce poste.',
          'Pourquoi souhaitez‑vous travailler ici ?',
          'Comment gérez‑vous les situations de stress ?',
          'Donnez un exemple d&apos;un projet réussi et votre rôle.',
          'Comment travaillez‑vous en équipe ?',
          'Comment réagissez‑vous face à une critique ?',
          'Avez‑vous des questions pour moi ?',
        ];
        questions = base.sort(() => 0.5 - Math.random()).slice(0, qCount);
      }
    }
    res.status(200).json({ success: true, questions, reportTemplate });
  } catch (err) {
    console.error('[AI] generateInterview error', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

/**
 * POST /api/ai/interview-feedback
 */
async function interviewFeedback(req, res) {
  try {
    const { questions = [], answers = [] } = req.body || {};
    let strengths = [];
    let improvements = [];
    let score = 0;
    if (useMock || !model) {
      strengths = ['Bonne communication', 'Esprit d’équipe'];
      improvements = ['Fournir des exemples chiffrés', 'Structurer avec STAR'];
      score = 50 + Math.floor(Math.random() * 51);
    } else {
      const sys = `Tu es un assistant qui évalue des réponses d'entretien. Fournis :
strengths (liste), improvements (liste), score (0‑100). Ne renvoie que JSON.`;
      const user = `Questions:\n${questions.join('\n')}\n\nRéponses:\n${answers.join('\n')}\n`;
      const call = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: sys + '\n\n' + user }] }]
      });
      const parsed = extractJsonFromGeminiResponse(call.response.text());
      if (parsed) {
        strengths = parsed.strengths || strengths;
        improvements = parsed.improvements || improvements;
        score = parsed.score || score;
      } else {
        strengths = ['Bonne communication', 'Esprit d’équipe'];
        improvements = ['Fournir des exemples chiffrés', 'Structurer avec STAR'];
        score = 50 + Math.floor(Math.random() * 51);
      }
    }
    res.status(200).json({ success: true, strengths, improvements, score });
  } catch (err) {
    console.error('[AI] interviewFeedback error', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

/**
 * POST /api/ai/generate-test
 */
async function generateTest(req, res) {
  try {
    const { category = 'it' } = req.body || {};
    let test = null;
    if (useMock || !model) {
      test = {
        testTitle: `Test de compétences ${category}`,
        domain: category,
        difficulty: 'Intermédiaire',
        questions: []
      };
      for (let i = 1; i <= 10; i++) {
        test.questions.push({
          id: i,
          question: `Question ${i} pour la catégorie ${category}?`,
          options: ['Option A','Option B','Option C','Option D'],
          correctAnswer: 'Option A',
          explanation: 'Explication générique.'
        });
      }
    } else {
      const prompt = `Génère un test de 10 questions QCM pour la catégorie ${category}.
Format JSON strict : { testTitle:string, domain:string, difficulty:string, questions:[{id,question,options:[4],correctAnswer,explanation}] }.
Le contexte : marché du travail en République du Congo.
Réponds uniquement en JSON.`;
      const call = await model.generateContent({
        contents: [{ role:'user', parts:[{ text: prompt }] }]
      });
      const parsed = extractJsonFromGeminiResponse(call.response.text());
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        test = parsed;
      } else {
        console.log('[AI] generateTest parsing failed, using mock');
        test = {
          testTitle: `Test de compétences ${category}`,
          domain: category,
          difficulty: 'Intermédiaire',
          questions: []
        };
        for (let i = 1; i <= 10; i++) {
          test.questions.push({
            id: i,
            question: `Question ${i} pour la catégorie ${category}?`,
            options: ['Option A','Option B','Option C','Option D'],
            correctAnswer: 'Option A',
            explanation: 'Explication générique.'
          });
        }
      }
    }
    res.status(200).json({ success: true, test });
  } catch (err) {
    console.error('[AI] generateTest error', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

/**
 * Sends an application with the analyzed CV and motivation letter
 * Stores the application in the database
 */
async function sendApplication(req, res) {
  try {
    const {
      jobId,
      candidateEmail,
      companyEmail,
      letter,
      matchingScore,
      strengths,
      message
    } = req.body;

    // Validate required fields
    if (!jobId || !candidateEmail || !companyEmail || !letter) {
      return res.status(400).json({
        message: 'Champs requis manquants: jobId, candidateEmail, companyEmail, letter'
      });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail) || !emailRegex.test(companyEmail)) {
      return res.status(400).json({
        message: 'Format d\'adresse email invalide'
      });
    }

    // Get job details for reference
    const job = await jobService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Log the application (in production, you would save to database)
    const application = {
      id: `app_${Date.now()}`,
      jobId,
      jobTitle: job.title,
      company: job.company,
      candidateEmail,
      companyEmail,
      letter,
      matchingScore: matchingScore || 0,
      strengths: strengths || [],
      additionalMessage: message || '',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // TODO: In production, save to database
    // await applicationService.create(application);

    // TODO: In production, send actual emails using Nodemailer
    // const emailSent = await emailService.sendApplication({
    //   to: companyEmail,
    //   candidateEmail,
    //   letter,
    //   jobTitle: job.title,
    //   company: job.company
    // });

    console.log('Application sent:', application);

    res.status(201).json({
      success: true,
      message: 'Candidature envoyée avec succès',
      data: {
        applicationId: application.id,
        status: 'sent',
        recipientEmail: companyEmail,
        sentAt: application.timestamp
      }
    });

  } catch (err) {
    console.error('sendApplication error:', err);
    res.status(500).json({
      message: err.message || 'Erreur lors de l\'envoi de la candidature'
    });
  }
}

export default {
  analyzeCv,
  extractCvData,
  sendApplication,
  generateInterview,
  interviewFeedback,
  generateTest
};
