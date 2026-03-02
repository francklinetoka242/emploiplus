import { FileText } from "lucide-react";

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
  skills?: string[];
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

interface CVTemplateFrancklynProps {
  data: CVTemplateData;
}

export const CVTemplateFrancklyn: React.FC<CVTemplateFrancklynProps> = ({ data }) => {
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
    <div className="bg-white min-h-screen" style={{ aspectRatio: "210/297" }}>
      {/* Conteneur A4 */}
      <div className="relative w-full h-full max-w-[210mm] max-h-[297mm] mx-auto flex">
        {/* Éléments graphiques - Triangle supérieur gauche */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-600 opacity-10" style={{
          clipPath: "polygon(0 0, 100% 0, 0 100%)"
        }}></div>

        {/* Éléments graphiques - Forme inférieure droite */}
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full bg-blue-600 opacity-10"></div>

        {/* BARRE LATÉRALE GAUCHE */}
        <div className="w-1/3 bg-gray-800 text-white p-8 flex flex-col relative z-10 overflow-hidden">
          {/* Photo de profil */}
          {data.profile_image_url && (
            <div className="mb-8 flex justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-700 flex items-center justify-center">
                <img 
                  src={data.profile_image_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {!data.profile_image_url && (
            <div className="mb-8 flex justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-700 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-500" />
              </div>
            </div>
          )}

          {/* CONTACT */}
          {(data.phone || data.email || data.location) && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-300">📞 Contact</h3>
              <div className="space-y-2 text-xs">
                {data.phone && <p className="break-words">{data.phone}</p>}
                {data.email && <p className="break-words">{data.email}</p>}
                {data.location && <p className="break-words">{data.location}</p>}
              </div>
            </div>
          )}

          {/* LANGUES */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-300">🌐 Langues</h3>
              <div className="space-y-2 text-xs">
                {data.languages.map((lang, idx) => (
                  <div key={idx}>
                    <p className="mb-1">{lang.name}</p>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-blue-400 h-1.5 rounded-full" 
                        style={{ width: `${getSkillLevel(lang.level)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPÉTENCES */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-300">💡 Compétences</h3>
              <div className="space-y-2 text-xs">
                {data.skills.slice(0, 8).map((skill, idx) => (
                  <p key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* QUALITÉS */}
          {data.qualities && data.qualities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-300">⭐ Qualités</h3>
              <div className="space-y-2 text-xs">
                {data.qualities.map((quality, idx) => (
                  <p key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {quality}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* LOISIRS */}
          {data.interests && data.interests.length > 0 && (
            <div className="mt-auto">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-300">🎯 Loisirs</h3>
              <div className="space-y-2 text-xs">
                {data.interests.map((interest, idx) => (
                  <p key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {interest}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CORPS PRINCIPAL */}
        <div className="w-2/3 bg-white p-8 flex flex-col overflow-auto">
          {/* HEADER */}
          <div className="mb-8 pb-6 border-b-2 border-blue-600">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{data.full_name || "Nom Prénom"}</h1>
            {data.job_title && (
              <p className="text-lg text-blue-600 font-semibold mt-2">{data.job_title}</p>
            )}
          </div>

          {/* PROFIL */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Profil
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* EXPÉRIENCES PROFESSIONNELLES */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Expériences Professionnelles
              </h2>
              <div className="space-y-5">
                {data.experiences.map((exp, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                      <span className="text-xs text-gray-500">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 font-semibold mb-1">{exp.company}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORMATION */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Formation
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="pb-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                      <span className="text-xs text-gray-500">{edu.year}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-semibold">{edu.school}</p>
                    {edu.field && <p className="text-xs text-gray-700">{edu.field}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATS */}
          {data.certificates && data.certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Certificats
              </h2>
              <div className="space-y-3">
                {data.certificates.map((cert, idx) => (
                  <div key={idx} className="pb-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-sm">{cert.name}</h3>
                      <span className="text-xs text-gray-500">{cert.date}</span>
                    </div>
                    <p className="text-xs text-blue-600">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVTemplateFrancklyn;
