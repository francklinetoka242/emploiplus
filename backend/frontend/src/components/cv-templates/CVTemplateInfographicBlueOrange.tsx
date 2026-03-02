import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateInfographicBlueOrangeProps {
  data: CVData;
}

export const CVTemplateInfographicBlueOrange: React.FC<CVTemplateInfographicBlueOrangeProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Navy Blue */}
      <div className="w-2/5 bg-[#101820] text-white p-8 overflow-auto relative">
        {/* Wave Background for Photo */}
        <div className="relative mb-8">
          <svg className="absolute top-0 left-0 right-0 h-20" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path
              d="M0,50 Q100,0 200,50 T400,50 L400,100 L0,100 Z"
              fill="#cf8d2e"
            />
          </svg>
          
          {/* Profile Photo */}
          <div className="relative z-10 flex justify-center pt-8">
            <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center text-4xl border-4 border-[#101820] shadow-xl">
              👤
            </div>
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-black text-white text-center mb-8 break-words">{data.full_name}</h2>

        {/* Job Title */}
        {data.job_title && (
          <p className="text-sm text-orange-100 text-center mb-8 font-semibold">{data.job_title}</p>
        )}

        {/* Contact in Capsules */}
        <div className="mb-8">
          <h3 className="text-sm font-black text-orange-300 uppercase tracking-wider mb-3">Contact</h3>
          <div className="space-y-2 text-xs">
            {data.email && (
              <div className="bg-[#1a2a3a] rounded-full px-3 py-2 text-gray-100 break-words">
                {data.email}
              </div>
            )}
            {data.phone && (
              <div className="bg-[#1a2a3a] rounded-full px-3 py-2 text-gray-100">
                {data.phone}
              </div>
            )}
            {data.location && (
              <div className="bg-[#1a2a3a] rounded-full px-3 py-2 text-gray-100">
                {data.location}
              </div>
            )}
          </div>
        </div>

        {/* Languages with Orange Bars */}
        {data.languages && data.languages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-orange-300 uppercase tracking-wider mb-4">Langues</h3>
            <div className="space-y-3">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <p className="text-xs font-semibold text-gray-100 mb-1">{lang.name}</p>
                  <div className="w-full bg-black rounded-full h-2">
                    <div
                      className="bg-[#cf8d2e] h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills - Circular Diagrams */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-orange-300 uppercase tracking-wider mb-4">
              Compétences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {data.skills.slice(0, 4).map((skill, index) => (
                <div key={index} className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#1a2a3a"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#cf8d2e"
                      strokeWidth="3"
                      strokeDasharray="75 100"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <text x="18" y="20" textAnchor="middle" fontSize="10" fill="#cf8d2e" fontWeight="bold">
                      75%
                    </text>
                  </svg>
                  <p className="text-xs text-gray-100 font-semibold break-words">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-3/5 p-8 overflow-auto">
        {/* Summary */}
        {data.summary && (
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-[#cf8d2e] text-white font-black rounded-full text-sm mb-4 uppercase tracking-wider">
              Profil
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-[#cf8d2e] text-white font-black rounded-full text-sm mb-4 uppercase tracking-wider">
              Expérience
            </div>
            <div className="space-y-5 ml-4 border-l-4 border-[#cf8d2e] pl-6">
              {data.experiences.map((exp, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-10 w-4 h-4 rounded-full bg-[#cf8d2e] mt-1"></div>
                  <h3 className="font-bold text-gray-800">{exp.position}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{exp.company}</p>
                  <p className="text-xs text-gray-500 my-1">{exp.startDate} - {exp.endDate}</p>
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
            <div className="inline-block px-4 py-2 bg-[#cf8d2e] text-white font-black rounded-full text-sm mb-4 uppercase tracking-wider">
              Formation
            </div>
            <div className="space-y-4 ml-4 border-l-4 border-[#cf8d2e] pl-6">
              {data.education.map((edu, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-10 w-4 h-4 rounded-full bg-[#cf8d2e] mt-1"></div>
                  <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  {edu.field && <p className="text-sm text-gray-700">{edu.field}</p>}
                  <p className="text-xs text-gray-500 mt-1">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
