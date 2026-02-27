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

export function CVTemplateGeometric({ data }: { data: CVData }) {
  const skillsLength = data.skills?.length || 0;
  const skillsPerRow = 3;

  return (
    <div className="min-h-screen bg-white font-sans" style={{ aspectRatio: "210/297" }}>
      {/* Top Geometric Shape */}
      <div className="h-32 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end pr-8">
          <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center -mr-16 -mt-16">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
              {data.full_name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="relative h-1 bg-gradient-to-r from-yellow-400 to-gray-800">
        <div className="absolute top-1/2 left-8 w-3 h-3 bg-yellow-400 rounded-full -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-8 w-3 h-3 bg-yellow-400 rounded-full -translate-y-1/2"></div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 inline-block bg-gray-100 px-4 py-2">
            {data.full_name}
          </h1>
          <p className="text-lg text-yellow-600 font-semibold mt-2">{data.job_title}</p>
        </div>

        {/* About Me */}
        {data.summary && (
          <div className="mb-6 flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h2 className="text-sm font-bold uppercase text-gray-900">À PROPOS</h2>
              <p className="text-xs text-gray-700 leading-relaxed mt-1">{data.summary}</p>
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <h2 className="text-sm font-bold uppercase text-gray-900 mb-3">EXPÉRIENCE</h2>
                <div className="space-y-3">
                  {data.experiences.map((exp, idx) => (
                    <div key={idx}>
                      <p className="font-semibold text-xs text-gray-900">{exp.position}</p>
                      <p className="text-xs text-yellow-600">{exp.company}</p>
                      <p className="text-xs text-gray-500">
                        {exp.startDate} - {exp.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills with Gauges */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6 flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1">
              <h2 className="text-sm font-bold uppercase text-gray-900 mb-3">COMPÉTENCES</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.skills.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-semibold text-gray-900">{skill}</p>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                        style={{ width: `${70 + Math.random() * 30}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6 flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1">
              <h2 className="text-sm font-bold uppercase text-gray-900 mb-3">FORMATION</h2>
              <div className="space-y-2">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-semibold text-xs text-gray-900">{edu.degree}</p>
                    <p className="text-xs text-gray-600">{edu.school}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex items-start gap-3">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Email:</span> {data.email}
              </p>
              <p>
                <span className="font-semibold">Téléphone:</span> {data.phone}
              </p>
              <p>
                <span className="font-semibold">Localisation:</span> {data.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
