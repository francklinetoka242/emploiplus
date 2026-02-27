import { Mail, Phone, MapPin, Briefcase, Languages } from "lucide-react";

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

export function CVTemplateNavyBlue({ data }: { data: CVData }) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col" style={{ aspectRatio: "210/297" }}>
      {/* Navy Blue Header */}
      <div className="bg-blue-900 text-white p-6 flex items-end justify-between relative h-28">
        {/* Profile Circle - overlapping */}
        <div className="absolute -bottom-8 left-6 w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold border-4 border-white">
          {data.full_name.charAt(0)}
        </div>

        {/* Name and Title */}
        <div className="ml-32">
          <h1 className="text-3xl font-bold uppercase">{data.full_name}</h1>
          <p className="text-lg uppercase">{data.job_title}</p>
        </div>
      </div>

      {/* Spacing for overlapping circle */}
      <div className="h-4"></div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Light Gray */}
        <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
          {/* Contact */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b-2 border-blue-900 pb-2">
              Contact
            </h3>
            <div className="space-y-2 text-xs text-gray-700">
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

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b-2 border-blue-900 pb-2">
                Langues
              </h3>
              <ul className="space-y-2 text-xs">
                {data.languages.map((lang, idx) => (
                  <li key={idx}>
                    <p className="font-semibold text-gray-900">{lang.name}</p>
                    <p className="text-gray-600">{lang.level}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills as Tags */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b-2 border-blue-900 pb-2">
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-900 text-white text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Software */}
          <div>
            <h3 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b-2 border-blue-900 pb-2">
              Logiciels
            </h3>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• Microsoft Office</li>
              <li>• Google Suite</li>
              <li>• Adobe Suite</li>
            </ul>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b-2 border-blue-900 pb-2">
              Centres d'intérêt
            </h3>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• Innovation</li>
              <li>• Leadership</li>
              <li>• Voyages</li>
            </ul>
          </div>
        </div>

        {/* Right Main Content - White */}
        <div className="w-2/3 bg-white p-4 overflow-y-auto">
          {/* About */}
          {data.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase text-blue-900 pb-2 border-b-2 border-blue-900 mb-3">
                À Propos
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase text-blue-900 pb-2 border-b-2 border-blue-900 mb-3">
                Expérience
              </h2>
              <ul className="space-y-3">
                {data.experiences.map((exp, idx) => (
                  <li key={idx} className="text-xs">
                    <p className="font-bold text-gray-900">{exp.position}</p>
                    <p className="text-blue-900 font-semibold">{exp.company}</p>
                    <p className="text-gray-500 text-xs">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p className="text-gray-700 mt-1">{exp.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase text-blue-900 pb-2 border-b-2 border-blue-900 mb-3">
                Formation
              </h2>
              <ul className="space-y-2">
                {data.education.map((edu, idx) => (
                  <li key={idx} className="text-xs">
                    <p className="font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-gray-600">{edu.school}</p>
                    <p className="text-gray-500">{edu.year}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
