import { Mail, Phone, Linkedin } from "lucide-react";

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

export function CVTemplateExecutive({ data }: { data: CVData }) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col" style={{ aspectRatio: "210/297" }}>
      {/* Header */}
      <div className="flex h-32 bg-white border-b-4 border-gray-300">
        {/* Left - Photo */}
        <div className="w-1/4 flex items-center justify-center p-4">
          <div className="w-20 h-20 rounded bg-gray-400 flex items-center justify-center text-3xl font-bold">
            {data.full_name.charAt(0)}
          </div>
        </div>

        {/* Right - Name and Title */}
        <div className="w-3/4 flex flex-col justify-center p-4">
          <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase">
            {data.full_name}
          </h1>
          <p className="text-xl font-serif text-gray-600 uppercase">
            {data.job_title}
          </p>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="bg-gray-300 px-6 py-3 flex items-center justify-start gap-8 text-xs">
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3" />
          <span>{data.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3" />
          <span>{data.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Linkedin className="w-3 h-3" />
          <span>LinkedIn Profile</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Skills, Languages */}
        <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-serif font-bold uppercase border-b-2 border-white pb-2 mb-3">
                Compétences
              </h3>
              <ul className="space-y-1">
                {data.skills.map((skill, idx) => (
                  <li key={idx} className="text-xs">
                    • {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <h3 className="text-sm font-serif font-bold uppercase border-b-2 border-white pb-2 mb-3">
                Langues
              </h3>
              <ul className="space-y-1">
                {data.languages.map((lang, idx) => (
                  <li key={idx} className="text-xs">
                    • {lang.name} ({lang.level})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Profile, Experience */}
        <div className="w-3/4 bg-white p-4 overflow-y-auto">
          {/* Profile */}
          {data.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-serif font-bold uppercase text-gray-900 pb-2 border-b-2 border-gray-400 mb-3">
                Profil
              </h2>
              <p className="text-xs text-gray-700 text-justify leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-serif font-bold uppercase text-gray-900 pb-2 border-b-2 border-gray-400 mb-3">
                Expériences
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs font-serif font-bold text-gray-900">
                        {exp.position}
                      </p>
                      <p className="text-xs text-gray-500">
                        {exp.startDate} - {exp.endDate}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-700 text-justify mt-1">
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
