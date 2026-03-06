import React from "react";
import { Mail, Phone, MapPin, Globe, Circle, CheckCircle2 } from "lucide-react";

interface CVTemplateData {
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  location?: string;
  website?: string;
  summary: string;
  experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    name: string;
    level: number; // 1-5
  }>;
  languages?: Array<{
    name: string;
    level: string;
  }>;
}

interface CVTemplateResumeGridProps {
  data: CVTemplateData;
}

export const CVTemplateResumeGrid: React.FC<CVTemplateResumeGridProps> = ({ data }) => {
  return (
    <div className="min-h-[1123px] w-[794px] bg-white border border-gray-100 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] mx-auto font-['Lato'] text-black">
      {/* Header */}
      <div className="flex items-start gap-0 px-12 pt-12 pb-8">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 rounded-2xl bg-gray-200 overflow-hidden border-2 border-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Photo</span>
          </div>
        </div>

        {/* Separator line */}
        <div className="w-1 bg-[#FCE4EC] mx-6"></div>

        {/* Infos */}
        <div className="flex-1 pt-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-2 font-['Playfair_Display']">
            {data.full_name}
          </h1>
          <h2 className="text-2xl font-light text-rose-400 mb-6">
            {data.job_title}
          </h2>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#FCE4EC]" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FCE4EC]" />
              <span>{data.email}</span>
            </div>
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FCE4EC]" />
                <span>{data.location}</span>
              </div>
            )}
            {data.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FCE4EC]" />
                <span>{data.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-[#FCE4EC] mx-12"></div>

      {/* Bio Section */}
      <div className="px-12 py-6">
        <p className="text-sm leading-relaxed text-gray-800">{data.summary}</p>
      </div>

      {/* Separator */}
      <div className="border-t border-[#FCE4EC] mx-12"></div>

      {/* Main Content Grid - 60% / 40% */}
      <div className="grid grid-cols-12 gap-0 px-12 py-8">
        {/* Left Column - Experiences (60%) */}
        <div className="col-span-7 pr-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-wide text-black mb-6 font-['Playfair_Display']">
              EXPÉRIENCES
            </h3>
            <div className="space-y-8">
              {data.experiences.map((exp, index) => (
                <div key={index} className="pb-4 border-b border-[#FCE4EC] last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-base text-black">{exp.position}</h4>
                      <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-rose-50 px-3 py-1 rounded-full">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Formation & Skills (40%) */}
        <div className="col-span-5 border-l border-[#FCE4EC] pl-8">
          {/* Formation */}
          <div className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-wide text-black mb-6 font-['Playfair_Display']">
              FORMATION
            </h3>
            <div className="space-y-6">
              {data.education.map((edu, index) => (
                <div key={index} className="pb-4 border-b border-[#FCE4EC] last:border-b-0">
                  <h4 className="font-bold text-sm text-black">{edu.degree}</h4>
                  <p className="text-xs text-gray-700">{edu.school}</p>
                  <span className="text-xs text-gray-500 bg-rose-50 px-2 py-1 rounded-full inline-block mt-2">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#FCE4EC] my-6"></div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide text-black mb-6 font-['Playfair_Display']">
              COMPÉTENCES
            </h3>
            <div className="space-y-4">
              {data.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">{skill.name}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < skill.level ? "bg-[#FCE4EC]" : "bg-gray-200"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <>
                <div className="border-t border-[#FCE4EC] my-6"></div>
                <h3 className="text-lg font-bold uppercase tracking-wide text-black mb-4 font-['Playfair_Display']">
                  LANGUES
                </h3>
                <div className="space-y-3">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black">{lang.name}</span>
                      <span className="text-xs text-gray-600 bg-rose-50 px-2 py-1 rounded-full">
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};