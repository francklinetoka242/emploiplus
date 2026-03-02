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

export function CVTemplateWarmMinimal({ data }: { data: CVData }) {
  return (
    <div className="min-h-screen bg-amber-50 font-sans flex flex-col" style={{ aspectRatio: "210/297" }}>
      {/* Header */}
      <div className="bg-white p-6 flex items-center gap-6 mb-6">
        {/* Profile Photo */}
        <div className="w-20 h-20 rounded-full bg-amber-200 flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {data.full_name.charAt(0)}
        </div>

        {/* Name and Title */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-amber-900">
            {data.full_name}
          </h1>
          <p className="text-lg text-amber-700">{data.job_title}</p>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="flex justify-center gap-6 px-6 mb-6 text-xs text-amber-900">
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          <span>{data.email}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>{data.phone}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{data.location}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4 px-6 pb-6">
        {/* Left Column - Experiences */}
        <div className="w-1/2 overflow-y-auto">
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase text-amber-900 mb-4">
                Expériences
              </h2>
              <div className="space-y-3">
                {data.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-100 rounded-2xl p-4 shadow-sm"
                  >
                    <p className="font-bold text-amber-900">{exp.position}</p>
                    <p className="text-xs text-amber-700 font-semibold">
                      {exp.company}
                    </p>
                    <p className="text-xs text-amber-600">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Education, Skills */}
        <div className="w-1/2 overflow-y-auto">
          {/* Summary */}
          {data.summary && (
            <div className="mb-4 bg-white rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase text-amber-900 mb-2">
                À Propos
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-4 bg-white rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase text-amber-900 mb-3">
                Formation
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-bold text-amber-900">{edu.degree}</p>
                    <p className="text-amber-700">{edu.school}</p>
                    <p className="text-amber-600">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase text-amber-900 mb-3">
                Compétences
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-200 text-amber-900 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="bg-white rounded-lg p-3 mt-3">
              <h2 className="text-sm font-bold uppercase text-amber-900 mb-3">
                Langues
              </h2>
              <div className="space-y-1 text-xs">
                {data.languages.map((lang, idx) => (
                  <div key={idx}>
                    <p className="font-semibold text-amber-900">{lang.name}</p>
                    <p className="text-amber-700">{lang.level}</p>
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
