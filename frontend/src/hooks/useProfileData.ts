import { useAuth } from './useAuth';
import { useMemo } from 'react';

export interface Experience {
  id?: string;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  description: string;
  currently_working?: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  level?: string;
}

export interface Education {
  id?: string;
  school_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface UserProfile {
  full_name: string;
  email: string;
  phone?: string;
  profession?: string;
  headline?: string;
  bio?: string;
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}

/**
 * Hook pour récupérer et formater les données du profil utilisateur
 * incluant expériences, compétences et diplômes pour la candidature automatique
 */
export const useProfileData = (): UserProfile | null => {
  const { user, loading } = useAuth();

  return useMemo(() => {
    if (loading || !user) return null;

    // Structurer les données du profil
    const userData = user as Record<string, unknown>;
    const profile: UserProfile = {
      full_name: (userData.full_name as string) || '',
      email: (userData.email as string) || '',
      phone: (userData.phone as string) || '',
      profession: (userData.profession as string) || '',
      headline: (userData.headline as string) || '',
      bio: (userData.bio as string) || '',
      experiences: parseExperiences(userData),
      skills: parseSkills(userData),
      education: parseEducation(userData),
    };

    return profile;
  }, [user, loading]);
};

/**
 * Parser les expériences du profil utilisateur
 */
function parseExperiences(user: { experiences?: unknown }): Experience[] {
  if (!user.experiences || !Array.isArray(user.experiences)) {
    return [];
  }

  return user.experiences.map((exp: unknown) => {
    const experience = exp as Record<string, unknown>;
    return {
      id: experience.id as string | undefined,
      job_title: (experience.job_title as string) || '',
      company_name: (experience.company_name as string) || '',
      start_date: (experience.start_date as string) || '',
      end_date: (experience.end_date as string) || '',
      description: (experience.description as string) || '',
      currently_working: (experience.currently_working as boolean) || false,
    };
  });
}

/**
 * Parser les compétences du profil utilisateur
 */
function parseSkills(user: { skills?: unknown }): Skill[] {
  // Gérer à la fois tableau d'objets et tableau de strings
  if (user.skills) {
    if (Array.isArray(user.skills)) {
      return user.skills.map((skill: unknown) => {
        if (typeof skill === 'string') {
          return { name: skill };
        }
        const skillObj = skill as Record<string, unknown>;
        return {
          id: skillObj.id as string | undefined,
          name: (skillObj.name as string) || '',
          level: (skillObj.level as string) || '',
        };
      });
    }
  }

  return [];
}

/**
 * Parser les diplômes/formations du profil utilisateur
 */
function parseEducation(user: { education?: unknown }): Education[] {
  if (!user.education || !Array.isArray(user.education)) {
    return [];
  }

  return user.education.map((edu: unknown) => {
    const education = edu as Record<string, unknown>;
    return {
      id: education.id as string | undefined,
      school_name: (education.school_name as string) || '',
      degree: (education.degree as string) || '',
      field_of_study: (education.field_of_study as string) || '',
      start_date: (education.start_date as string) || '',
      end_date: (education.end_date as string) || '',
      description: (education.description as string) || '',
    };
  });
}

/**
 * Formater les données du profil en texte lisible pour la candidature
 */
export const formatProfileForApplication = (profile: UserProfile): string => {
  let text = '';

  if (profile.headline) {
    text += `Titre professionnel: ${profile.headline}\n\n`;
  }

  if (profile.bio) {
    text += `À propos: ${profile.bio}\n\n`;
  }

  if (profile.experiences.length > 0) {
    text += '## Expériences\n\n';
    profile.experiences.forEach((exp) => {
      text += `- **${exp.job_title}** chez ${exp.company_name}\n`;
      text += `  ${exp.start_date} - ${exp.end_date || 'Présent'}\n`;
      if (exp.description) {
        text += `  ${exp.description}\n`;
      }
      text += '\n';
    });
  }

  if (profile.skills.length > 0) {
    text += '## Compétences\n\n';
    profile.skills.forEach((skill) => {
      if (skill.level) {
        text += `- ${skill.name} (${skill.level})\n`;
      } else {
        text += `- ${skill.name}\n`;
      }
    });
    text += '\n';
  }

  if (profile.education.length > 0) {
    text += '## Formation\n\n';
    profile.education.forEach((edu) => {
      text += `- **${edu.degree} en ${edu.field_of_study}**\n`;
      text += `  ${edu.school_name}\n`;
      text += `  ${edu.start_date} - ${edu.end_date}\n`;
      if (edu.description) {
        text += `  ${edu.description}\n`;
      }
      text += '\n';
    });
  }

  return text;
};
