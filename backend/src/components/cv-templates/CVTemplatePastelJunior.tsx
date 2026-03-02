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

export function CVTemplatePastelJunior({ data }: { data: CVData }) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col" style={{ aspectRatio: "210/297" }}>
      {/* Header - Pastel Pink */}
      <div className="h-24 bg-pink-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-pink-300 flex items-center justify-center text-2xl font-bold text-white">
            {data.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {data.full_name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Narrow Column */}
        <div className="w-1/4 bg-white border-r-2 border-gray-300 p-4 overflow-y-auto">
          {/* Profile */}
          {data.summary && (
            <div className="mb-6">
              <h3 className="bg-gray-900 text-white text-xs font-bold p-2 mb-2">
                PROFIL
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="bg-gray-900 text-white text-xs font-bold p-2 mb-2">
                COMPÉTENCES
              </h3>
              <ul className="space-y-1">
                {data.skills.map((skill, idx) => (
                  <li key={idx} className="text-xs text-gray-700">
                    • {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="bg-gray-900 text-white text-xs font-bold p-2 mb-2">
                LANGUES
              </h3>
              <ul className="space-y-1">
                {data.languages.map((lang, idx) => (
                  <li key={idx} className="text-xs text-gray-700">
                    {lang.name} - {lang.level}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hobbies */}
          <div>
            <h3 className="bg-gray-900 text-white text-xs font-bold p-2 mb-2">
              INTÉRÊTS
            </h3>
            <ul className="space-y-1">
              <li className="text-xs text-gray-700">• Apprentissage</li>
              <li className="text-xs text-gray-700">• Innovation</li>
              <li className="text-xs text-gray-700">• Créativité</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="break-all text-xs">{data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{data.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{data.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Large Column */}
        <div className="w-3/4 bg-white p-6 overflow-y-auto">
          {/* Experience Section */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 pb-2 border-b-4 border-black mb-4">
                EXPÉRIENCES
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-gray-900">{exp.position}</p>
                    <p className="text-sm text-pink-600 font-semibold">
                      {exp.company}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 pb-2 border-b-4 border-black mb-4">
                FORMATIONS
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-pink-600 font-semibold">
                      {edu.school}
                    </p>
                    <p className="text-xs text-gray-600">{edu.field}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
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
