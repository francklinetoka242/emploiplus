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

export function CVTemplateRibbonSidebar({ data }: { data: CVData }) {
  return (
    <div className="min-h-screen bg-white font-sans flex" style={{ aspectRatio: "210/297" }}>
      {/* Left Sidebar - Gray Medium */}
      <div className="w-35% bg-gray-500 text-white p-4 flex flex-col items-center overflow-y-auto">
        {/* Profile Photo */}
        <div className="w-20 h-20 rounded-lg bg-gray-400 flex items-center justify-center text-3xl font-bold mb-8">
          {data.full_name.charAt(0)}
        </div>

        {/* Section: About Me */}
        <div className="w-full mb-6">
          <div className="bg-gray-700 text-white px-3 py-2 rounded shadow-lg -mr-4">
            <h3 className="text-sm font-bold uppercase">About Me</h3>
          </div>
          {data.summary && (
            <p className="text-xs text-white mt-3 text-justify leading-tight">
              {data.summary}
            </p>
          )}
        </div>

        {/* Section: Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="w-full mb-6">
            <div className="bg-gray-700 text-white px-3 py-2 rounded shadow-lg -mr-4">
              <h3 className="text-sm font-bold uppercase">Skills</h3>
            </div>
            <ul className="text-xs text-white mt-3 space-y-1">
              {data.skills.map((skill, idx) => (
                <li key={idx}>• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section: Contact Me */}
        <div className="w-full">
          <div className="bg-gray-700 text-white px-3 py-2 rounded shadow-lg -mr-4">
            <h3 className="text-sm font-bold uppercase">Contact Me</h3>
          </div>
          <div className="space-y-2 text-xs text-white mt-3">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span className="break-all">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - White */}
      <div className="w-65% bg-white p-6 overflow-y-auto">
        {/* Name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{data.full_name}</h1>

        {/* Education with Timeline */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-400 pb-2">
              EDUCATION
            </h2>
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-1 top-0 bottom-0 w-px bg-black"></div>

              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-2.5 top-2 w-2 h-2 bg-black rounded-full"></div>
                  <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience with Timeline */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-400 pb-2">
              WORK EXPERIENCE
            </h2>
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-1 top-0 bottom-0 w-px bg-black"></div>

              {data.experiences.map((exp, idx) => (
                <div key={idx} className="mb-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-2.5 top-2 w-2 h-2 bg-black rounded-full"></div>
                  <p className="text-xs font-bold text-gray-900">{exp.position}</p>
                  <p className="text-xs text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  <p className="text-xs text-gray-700 text-justify mt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-400 pb-2">
              LANGUAGES
            </h2>
            <div className="space-y-2">
              {data.languages.map((lang, idx) => (
                <div key={idx} className="text-xs text-gray-700">
                  {lang.name} - {lang.level}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
