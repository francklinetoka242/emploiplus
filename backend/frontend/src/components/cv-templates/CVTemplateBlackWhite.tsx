import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateBlackWhiteProps {
  data: CVData;
}

export const CVTemplateBlackWhite: React.FC<CVTemplateBlackWhiteProps> = ({ data }) => {
  const getProgressWidth = (level: string): number => {
    const levels: Record<string, number> = {
      "Débutant": 25,
      "Élémentaire": 40,
      "Intermédiaire": 60,
      "Avancé": 80,
      "Expert": 100,
    };
    return levels[level] || 60;
  };

  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Black */}
      <div className="w-1/3 bg-[#1a1a1a] text-white p-8 overflow-auto">
        {/* Profile Photo */}
        <div className="flex justify-center mb-8">
          <div className="w-36 h-36 rounded-3xl bg-gray-400 flex items-center justify-center text-4xl shadow-lg">
            👤
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-black text-white text-center mb-8 break-words">
          {data.full_name}
        </h2>

        {/* Contact Section */}
        <div className="mb-8 space-y-4 text-sm">
          {data.email && (
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-white flex-shrink-0 mt-1" />
              <span className="break-words">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-white flex-shrink-0" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-white flex-shrink-0 mt-1" />
              <span>{data.location}</span>
            </div>
          )}
        </div>

        {/* Job Title */}
        {data.job_title && (
          <div className="mb-8 pt-8 border-t border-gray-600">
            <p className="text-sm text-gray-300 uppercase tracking-wider">{data.job_title}</p>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">
              Compétences
            </h3>
            <div className="space-y-3">
              {data.skills.map((skill, index) => (
                <div key={index}>
                  <p className="text-xs text-gray-300 mb-2 font-semibold">{skill}</p>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White */}
      <div className="w-2/3 p-8 overflow-auto">
        {/* Summary */}
        {data.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wider">
              À Propos
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wider">
              Expérience
            </h2>
            <div className="space-y-6">
              {data.experiences.map((exp, index) => (
                <div key={index} className="pb-4 border-b border-gray-300">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-800 text-lg">{exp.position}</h3>
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
            <h2 className="text-xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wider">
              Formation
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="pb-3 border-b border-gray-300">
                  <h3 className="font-black text-gray-800">{edu.degree}</h3>
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
  );
};
