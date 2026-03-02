import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen, Linkedin, Twitter } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateExecutiveCadreProps {
  data: CVData;
}

export const CVTemplateExecutiveCadre: React.FC<CVTemplateExecutiveCadreProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Header with Photo and Name Block */}
      <div className="flex bg-white border-b-2 border-gray-200">
        {/* Left Photo */}
        <div className="w-2/5 p-8 flex items-center justify-center">
          <div className="w-40 h-40 bg-gray-400 rounded-sm flex items-center justify-center text-5xl shadow-lg">
            👤
          </div>
        </div>

        {/* Right Name/Title Block */}
        <div className="w-3/5 bg-[#4a4a4a] text-white flex flex-col justify-center p-8">
          <h1 className="text-4xl font-serif font-black mb-2">{data.full_name}</h1>
          {data.job_title && (
            <p className="text-2xl font-serif font-semibold text-gray-200">{data.job_title}</p>
          )}
        </div>
      </div>

      {/* Contact Bar */}
      <div className="bg-[#f2f2f2] px-8 py-4 flex gap-6 text-sm text-gray-700 border-b border-gray-300">
        {data.email && (
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>{data.phone}</span>
          </div>
        )}
        {data.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{data.location}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Black */}
        <div className="w-3/10 bg-[#1a1a1a] text-white p-8 overflow-auto">
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-serif font-bold mb-4 pb-2 border-b border-gray-600">
                COMPÉTENCES
              </h3>
              <div className="space-y-2 text-sm">
                {data.skills.map((skill, index) => (
                  <p key={index}>• {skill}</p>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-serif font-bold mb-4 pb-2 border-b border-gray-600">
                LANGUES
              </h3>
              <div className="space-y-2 text-sm">
                {data.languages.map((lang, index) => (
                  <div key={index}>
                    <p className="font-semibold">{lang.name}</p>
                    <p className="text-xs text-gray-400">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content - White */}
        <div className="w-7/10 p-8 overflow-auto">
          {/* Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3 pb-2 border-b-2 border-gray-400">
                PROFIL
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3 pb-2 border-b-2 border-gray-400">
                EXPÉRIENCE
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-serif font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
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
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-3 pb-2 border-b-2 border-gray-400">
                FORMATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-serif font-bold text-gray-800">{edu.degree}</h3>
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
