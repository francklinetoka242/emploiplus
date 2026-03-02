import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";

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
  qualities?: string[];
}

export function CVTemplateMinimalist({ data }: { data: CVData }) {
  const getProgressWidth = (level: string) => {
    const levels: { [key: string]: number } = {
      Débutant: 25,
      Intermédiaire: 50,
      Avancé: 75,
      Expert: 100,
    };
    return levels[level] || 50;
  };

  return (
    <div className="min-h-screen bg-white flex font-sans" style={{ aspectRatio: "210/297" }}>
      {/* Left Sidebar - Dark */}
      <div className="w-1/3 bg-gray-900 text-white p-6 flex flex-col">
        {/* Profile Photo */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold border-4 border-white">
            {data.full_name.charAt(0)}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
            CONTACT
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span className="break-all">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
            EDUCATION
          </h3>
          <div className="space-y-4 text-xs">
            {data.education?.map((edu, idx) => (
              <div key={idx}>
                <p className="font-semibold">{edu.degree}</p>
                <p className="text-gray-400">{edu.school}</p>
                <p className="text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
            LANGUES
          </h3>
          <div className="space-y-2 text-xs">
            {data.languages?.map((lang, idx) => (
              <div key={idx}>
                <p className="font-semibold">{lang.name}</p>
                <p className="text-gray-400">{lang.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="w-2/3 bg-white p-8 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">{data.full_name}</h1>
          <p className="text-lg text-gray-600">{data.job_title}</p>
          <div className="h-1 w-12 bg-gray-900 mt-3"></div>
        </div>

        {/* About Me */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">
              À PROPOS
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
              EXPÉRIENCE
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-gray-900 pl-4">
                  <p className="font-semibold text-xs text-gray-900">{exp.position}</p>
                  <p className="text-xs text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
              COMPÉTENCES
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-900 px-3 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qualities */}
        {data.qualities && data.qualities.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
              QUALITÉS
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.qualities.map((quality, idx) => (
                <span
                  key={idx}
                  className="text-xs border border-gray-900 text-gray-900 px-3 py-1"
                >
                  {quality}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
