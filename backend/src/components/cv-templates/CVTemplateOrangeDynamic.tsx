import { Mail, Phone, MapPin, Instagram, Twitter, MessageCircle } from "lucide-react";

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

export function CVTemplateOrangeDynamic({ data }: { data: CVData }) {
  const skillsLength = data.skills?.length || 0;

  return (
    <div
      className="min-h-screen bg-white font-sans flex"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Left Black Column */}
      <div className="w-1/3 bg-black text-white p-6 flex flex-col">
        {/* Profile Circle - positioned to overlap */}
        <div className="flex justify-center mb-8 -mt-20">
          <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-4xl font-bold border-4 border-white">
            {data.full_name.charAt(0)}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase mb-3 text-orange-500">
            Contact
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-orange-500" />
              <span className="break-all">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-orange-500" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase mb-3 text-orange-500">
              Compétences
            </h3>
            <div className="space-y-2">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <p className="text-xs font-semibold mb-1">{skill}</p>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Icons */}
        <div className="flex gap-4 mt-auto pt-4 border-t border-gray-700 justify-center">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600">
            <Instagram className="w-4 h-4 text-black" />
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600">
            <Twitter className="w-4 h-4 text-black" />
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600">
            <MessageCircle className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>

      {/* Right White Column */}
      <div className="w-2/3 bg-white p-6 overflow-y-auto">
        {/* Name and Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-1">
            {data.full_name}
          </h1>
          <p className="text-xl text-orange-500 font-semibold">
            {data.job_title}
          </p>
          <div className="h-1 w-12 bg-orange-500 mt-2"></div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-4">
            <p className="text-xs text-gray-700 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <div className="mb-4">
            <div className="bg-orange-500 text-black px-3 py-2 mb-2">
              <h2 className="text-sm font-bold uppercase">Formation</h2>
            </div>
            <div className="space-y-2">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <p className="text-xs font-bold text-black">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <div className="bg-orange-500 text-black px-3 py-2 mb-2">
              <h2 className="text-sm font-bold uppercase">Expérience</h2>
            </div>
            <div className="space-y-3">
              {data.experiences.map((exp, idx) => (
                <div key={idx}>
                  <p className="text-xs font-bold text-black">{exp.position}</p>
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

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="mt-4">
            <div className="bg-orange-500 text-black px-3 py-2 mb-2">
              <h2 className="text-sm font-bold uppercase">Langues</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.languages.map((lang, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-semibold">{lang.name}</p>
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
