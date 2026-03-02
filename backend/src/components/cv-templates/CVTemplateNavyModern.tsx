import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateNavyModernProps {
  data: CVData;
}

export const CVTemplateNavyModern: React.FC<CVTemplateNavyModernProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Navy Header */}
      <div className="bg-[#000080] text-white relative overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-8">
            {/* Circular Photo overlapping */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-5xl shadow-xl">
                👤
              </div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white opacity-10 rounded-full"></div>
            </div>

            {/* Name and Title */}
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2">{data.full_name}</h1>
              {data.job_title && (
                <p className="text-xl font-semibold text-blue-100">{data.job_title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-white p-8 overflow-auto border-r border-gray-200">
          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-[#000080] mb-4 pb-2 border-b-2 border-[#000080]">
              CONTACT
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              {data.email && (
                <div className="flex items-start gap-2">
                  <Mail size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="break-words">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{data.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-black text-[#000080] mb-4 pb-2 border-b-2 border-[#000080]">
                COMPÉTENCES
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                {data.skills.map((skill, index) => (
                  <p key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#000080] rounded-full"></span>
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-black text-[#000080] mb-4 pb-2 border-b-2 border-[#000080]">
                LANGUES
              </h3>
              <div className="space-y-3 text-sm">
                {data.languages.map((lang, index) => (
                  <div key={index}>
                    <p className="font-semibold text-gray-800">{lang.name}</p>
                    <p className="text-xs text-gray-600">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-8 overflow-auto">
          {/* Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#000080] mb-3 pb-2 border-b-2 border-[#000080]">
                PROFIL
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#000080] mb-3 pb-2 border-b-2 border-[#000080]">
                EXPÉRIENCE PROFESSIONNELLE
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{exp.company}</p>
                    {exp.description && (
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        {exp.description.split("\n").map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-[#000080] mb-3 pb-2 border-b-2 border-[#000080]">
                FORMATION
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
