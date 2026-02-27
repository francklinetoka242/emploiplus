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
  qualities?: string[];
}

export function CVTemplateInfographic({ data }: { data: CVData }) {
  const getSkillLevel = (skill: string, idx: number): number => {
    const levels = [85, 90, 78, 88, 92, 80, 75, 87];
    return levels[idx] || 80;
  };

  return (
    <div
      className="min-h-screen bg-blue-900 font-sans text-white flex"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Left Sidebar with Wave Effect */}
      <div className="w-2/5 relative overflow-hidden pt-8 pb-8 px-6 flex flex-col">
        {/* Wave decoration at top */}
        <div className="absolute top-0 left-0 right-0 h-24">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 50 Q 50 10 100 50 T 200 50"
              fill="none"
              stroke="#FDBB2D"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Profile Image */}
        <div className="mt-16 mb-8 flex justify-center">
          <div className="w-28 h-28 rounded-full bg-blue-700 flex items-center justify-center text-4xl font-bold border-4 border-yellow-400">
            {data.full_name.charAt(0)}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase mb-3 text-yellow-400">CONTACT</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-3 h-3 text-blue-900" />
              </div>
              <span className="break-all">{data.email}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-3 h-3 text-blue-900" />
              </div>
              <span>{data.phone}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3 h-3 text-blue-900" />
              </div>
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* Languages with Progress Bars */}
        {data.languages && data.languages.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase mb-3 text-yellow-400">LANGUES</h3>
            <div className="space-y-2">
              {data.languages.map((lang, idx) => (
                <div key={idx}>
                  <p className="text-xs font-semibold mb-1">{lang.name}</p>
                  <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? "bg-yellow-400"
                          : idx === 1
                          ? "bg-orange-400"
                          : "bg-yellow-300"
                      }`}
                      style={{ width: `${[100, 85, 60][idx] || 70}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="w-3/5 bg-white text-gray-900 p-8 flex flex-col">
        {/* Header */}
        <div className="mb-6 border-b-2 border-yellow-400 pb-4">
          <h1 className="text-3xl font-bold mb-1">{data.full_name}</h1>
          <p className="text-lg text-yellow-600 font-semibold">{data.job_title}</p>
        </div>

        {/* About Me */}
        {data.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase text-yellow-600 mb-2">À PROPOS</h2>
            <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase text-yellow-600 mb-3">EXPÉRIENCE</h2>
            <div className="space-y-3">
              {data.experiences.slice(0, 2).map((exp, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-xs text-gray-900">{exp.position}</p>
                  <p className="text-xs text-yellow-600">{exp.company}</p>
                  <p className="text-xs text-gray-500 mb-1">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills with Circular Progress */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase text-yellow-600 mb-3">COMPÉTENCES</h2>
            <div className="grid grid-cols-3 gap-3">
              {data.skills.slice(0, 3).map((skill, idx) => {
                const percentage = getSkillLevel(skill, idx);
                const circumference = 2 * Math.PI * 30;
                const offset = circumference - (percentage / 100) * circumference;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="30"
                          fill="none"
                          stroke="#FDBB2D"
                          strokeWidth="3"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {percentage}%
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-center">{skill}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase text-yellow-600 mb-3">FORMATION</h2>
            <div className="space-y-2">
              {data.education.slice(0, 2).map((edu, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-xs text-gray-900">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
