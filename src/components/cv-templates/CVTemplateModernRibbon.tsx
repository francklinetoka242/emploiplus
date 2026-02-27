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

export function CVTemplateModernRibbon({ data }: { data: CVData }) {
  return (
    <div
      className="min-h-screen bg-white font-sans flex"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-900 text-white p-6 flex flex-col overflow-y-auto">
        {/* Profile Photo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold border-4 border-orange-400">
            {data.full_name.charAt(0)}
          </div>
        </div>

        {/* Name */}
        <h1 className="text-center text-lg font-bold mb-1 text-white">
          {data.full_name}
        </h1>
        <p className="text-center text-xs text-orange-400 mb-6 font-semibold">
          {data.job_title}
        </p>

        {/* About */}
        {data.summary && (
          <div className="mb-6 text-xs leading-relaxed text-gray-300">
            <p>{data.summary}</p>
          </div>
        )}

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase mb-3 text-orange-400">
            Contact
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-orange-400" />
              <span className="break-all">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-orange-400" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-orange-400" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* Skills Circles */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 text-orange-400">
              Compétences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {data.skills.slice(0, 4).map((skill, idx) => {
                const percentage = [85, 92, 78, 88][idx] || 80;
                const circumference = 2 * Math.PI * 30;
                const offset = circumference - (percentage / 100) * circumference;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="2"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-xs font-bold mt-2 text-center">
                      {skill.slice(0, 10)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="w-2/3 bg-white p-6 overflow-y-auto">
        {/* About Section */}
        {data.summary && (
          <div className="mb-6">
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-2">
              À Propos
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience with Timeline */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-6">
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
              Expérience
            </div>

            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-400"></div>

              {data.experiences.map((exp, idx) => (
                <div key={idx} className="mb-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-4 top-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>

                  <p className="text-xs font-bold text-gray-900">
                    {exp.position}
                  </p>
                  <p className="text-xs text-orange-600 font-semibold">
                    {exp.company}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  <p className="text-xs text-gray-700">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-4">
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
              Formation
            </div>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-bold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div>
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
              Langues
            </div>
            <div className="space-y-2">
              {data.languages.map((lang, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-semibold text-gray-900">{lang.name}</p>
                  <p className="text-gray-600">{lang.level}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
