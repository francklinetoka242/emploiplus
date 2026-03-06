import React from 'react';
import { Phone, Mail, Linkedin, MapPin, User, Briefcase, GraduationCap, Heart, Globe, Code } from 'lucide-react';

interface CVTemplateData {
  full_name?: string;
  job_title?: string;
  phone?: string;
  email?: string;
  location?: string;
  summary?: string;
  experiences?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  skills?: Array<{ name: string; level?: string }>;
  languages?: Array<{ name: string; level: string }>;
  qualities?: string[];
  interests?: string[];
  certificates?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  profile_image_url?: string;
}

interface CVTemplateClassicMinimalistProps {
  data: CVTemplateData;
}

export const CVTemplateClassicMinimalist: React.FC<CVTemplateClassicMinimalistProps> = ({ data }) => {
  const getSkillLevel = (level: string) => {
    const levelMap: { [key: string]: number } = {
      "Débutant": 25,
      "Intermédiaire": 50,
      "Avancé": 75,
      "Expert": 100,
    };
    return levelMap[level] || 50;
  };

  return (
    <div className="bg-white text-gray-900 font-sans max-w-4xl mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="relative bg-white p-8 pb-4">
        {/* Onglet décoratif bleu pastel en haut à droite */}
        <div className="absolute top-0 right-0 w-24 h-8 bg-blue-200 rounded-bl-lg"></div>

        <div className="flex items-start gap-6">
          {/* Photo de profil circulaire */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              {data.profile_image_url ? (
                <img
                  src={data.profile_image_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Nom et titre */}
          <div className="flex-1 pt-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {data.full_name || 'Votre Nom'}
            </h1>
            <h2 className="text-xl text-blue-600 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              {data.job_title || 'Votre Poste'}
            </h2>
          </div>
        </div>

        {/* Barre de contact horizontale */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-700">
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-blue-500" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              <span>{data.email}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              <span>{data.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Linkedin size={16} className="text-blue-500" />
            <span>LinkedIn</span>
          </div>
        </div>
      </div>

      {/* Section Description */}
      <div className="px-8 pb-6">
        <div className="border-b-2 border-blue-200 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Description
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {data.summary || 'Votre description professionnelle...'}
        </p>
      </div>

      {/* Corps en deux colonnes */}
      <div className="px-8 pb-8 flex gap-8">
        {/* Colonne gauche (65%) */}
        <div className="flex-1" style={{ flex: '0 0 65%' }}>
          {/* Expériences Professionnelles */}
          <div className="mb-8">
            <div className="border-b-2 border-blue-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" />
                Expériences Professionnelles
              </h3>
            </div>
            <div className="space-y-6">
              {data.experiences?.map((exp, index) => (
                <div key={index} className="relative pl-4">
                  <div className="absolute left-0 top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                    <span className="text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucune expérience professionnelle ajoutée
                </div>
              )}
            </div>
          </div>

          {/* Formations */}
          <div>
            <div className="border-b-2 border-blue-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-500" />
                Formations
              </h3>
            </div>
            <div className="space-y-4">
              {data.education?.map((edu, index) => (
                <div key={index} className="relative pl-4">
                  <div className="absolute left-0 top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <span className="text-sm text-gray-600">{edu.year}</span>
                  </div>
                  <p className="text-blue-600 font-medium mb-1">{edu.school}</p>
                  <p className="text-gray-700 text-sm">{edu.field}</p>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucune formation ajoutée
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite (35%) */}
        <div className="flex-1" style={{ flex: '0 0 35%' }}>
          {/* Soft Skills */}
          <div className="mb-6">
            <div className="border-b-2 border-blue-200 pb-2 mb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Heart size={16} className="text-blue-500" />
                Soft Skills
              </h3>
            </div>
            <div className="space-y-2">
              {data.qualities?.map((quality, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>{quality}</span>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucune qualité ajoutée
                </div>
              )}
            </div>
          </div>

          {/* Logiciels */}
          <div className="mb-6">
            <div className="border-b-2 border-blue-200 pb-2 mb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Code size={16} className="text-blue-500" />
                Logiciels
              </h3>
            </div>
            <div className="space-y-2">
              {data.skills?.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>{skill}</span>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucune compétence ajoutée
                </div>
              )}
            </div>
          </div>

          {/* Langues */}
          <div className="mb-6">
            <div className="border-b-2 border-blue-200 pb-2 mb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                Langues
              </h3>
            </div>
            <div className="space-y-2">
              {data.languages?.map((lang, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{lang.name}</span>
                  <span className="text-blue-600 font-medium">{lang.level}</span>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucune langue ajoutée
                </div>
              )}
            </div>
          </div>

          {/* Intérêts */}
          <div>
            <div className="border-b-2 border-blue-200 pb-2 mb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Heart size={16} className="text-blue-500" />
                Intérêts
              </h3>
            </div>
            <div className="space-y-2">
              {data.interests?.map((interest, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>{interest}</span>
                </div>
              )) || (
                <div className="text-gray-500 text-sm">
                  Aucun intérêt ajouté
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};