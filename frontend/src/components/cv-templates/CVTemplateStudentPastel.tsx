import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateStudentPastelProps {
  data: CVData;
}

export const CVTemplateStudentPastel: React.FC<CVTemplateStudentPastelProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Pastel Pink Header */}
      <div className="bg-[#fce4ec] p-8">
        <div className="flex items-center gap-8">
          {/* Left Photo */}
          <div className="w-32 h-32 bg-gray-300 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
            👤
          </div>

          {/* Right Name */}
          <div>
            <h1 className="text-4xl font-black text-[#000000] uppercase tracking-wider">
              {data.full_name.split(" ")[0]}
            </h1>
            <p className="text-2xl font-black text-[#000000] uppercase tracking-wider">
              {data.full_name.split(" ").slice(1).join(" ")}
            </p>
            {data.job_title && (
              <p className="text-lg text-gray-700 font-semibold mt-3">{data.job_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Sections */}
        <div className="w-1/4 p-8 overflow-auto">
          {/* Contact Section */}
          <div className="mb-8">
            <div className="bg-[#000000] text-white font-black py-3 px-4 mb-4 text-sm rounded-sm">
              CONTACT
            </div>
            <div className="space-y-3 text-sm text-gray-700 pl-4">
              {data.email && (
                <div className="flex items-start gap-2">
                  <Mail size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="break-words text-xs">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0" />
                  <span className="text-xs">{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{data.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <div className="bg-[#000000] text-white font-black py-3 px-4 mb-4 text-sm rounded-sm">
                COMPÉTENCES
              </div>
              <div className="space-y-2 text-sm text-gray-700 pl-4">
                {data.skills.map((skill, index) => (
                  <p key={index} className="text-xs">• {skill}</p>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <div className="bg-[#000000] text-white font-black py-3 px-4 mb-4 text-sm rounded-sm">
                LANGUES
              </div>
              <div className="space-y-2 text-sm text-gray-700 pl-4">
                {data.languages.map((lang, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-semibold">{lang.name}</p>
                    <p className="text-gray-600">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Main */}
        <div className="w-3/4 p-8 overflow-auto border-l border-gray-300">
          {/* Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#000000] uppercase tracking-wider mb-3 pb-3 border-b-4 border-[#000000]">
                Profil
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#000000] uppercase tracking-wider mb-3 pb-3 border-b-4 border-[#000000]">
                Expériences
              </h2>
              <div className="space-y-5">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{exp.company}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-[#000000] uppercase tracking-wider mb-3 pb-3 border-b-4 border-[#000000]">
                Formations
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                    {edu.field && <p className="text-sm text-gray-700">{edu.field}</p>}
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
};
