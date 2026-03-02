import { Mail, Phone, MapPin } from "lucide-react";

interface CVData {
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  location: string;
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
}

export function CVTemplateClassicSober({ data }: { data: CVData }) {
  return (
    <div
      className="min-h-screen bg-white font-serif flex flex-col"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Header */}
      <div className="flex h-20">
        {/* Left side - Dark block */}
        <div className="w-1/2 bg-gray-800 text-white p-4 flex flex-col justify-center">
          <h1 className="text-xl font-bold">{data.full_name}</h1>
          <p className="text-sm">{data.job_title}</p>
        </div>

        {/* Right side - Contact info */}
        <div className="w-1/2 bg-white p-4 flex flex-col justify-center text-xs border-l border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-3 h-3" />
            <span>{data.email}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-3 h-3" />
            <span>{data.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>{data.location}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Skills, Languages, Education */}
        <div className="w-3/10 bg-gray-900 text-white p-4 overflow-y-auto text-xs">
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-2 uppercase">Compétences</h3>
              <ul className="space-y-1">
                {data.skills.map((skill, idx) => (
                  <li key={idx} className="text-xs">{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-sm mb-2 uppercase">Langues</h3>
              <ul className="space-y-1">
                {data.languages.map((lang, idx) => (
                  <li key={idx} className="text-xs">
                    {lang.name} - {lang.level}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2 uppercase">Formation</h3>
              <div className="space-y-2">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-gray-400">{edu.school}</p>
                    <p className="text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Profile, Experience */}
        <div className="w-7/10 bg-white p-4 overflow-y-auto">
          {/* Profil */}
          {data.summary && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b-2 border-gray-400 mb-2 pb-1">
                Profil
              </h2>
              <p className="text-xs leading-relaxed text-gray-700">
                {data.summary}
              </p>
            </div>
          )}

          {/* Expériences */}
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase border-b-2 border-gray-400 mb-2 pb-1">
                Expériences Professionnelles
              </h2>
              <div className="space-y-3">
                {data.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-bold">{exp.position}</p>
                    <p className="text-xs text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p className="text-xs text-gray-700 leading-tight">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
