import React from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateOrangeCreativeProps {
  data: CVData;
}

export const CVTemplateOrangeCreative: React.FC<CVTemplateOrangeCreativeProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Orange Header Banner */}
      <div className="bg-[#f39c12] p-12 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex items-center justify-center">
          {/* Profile Photo */}
          <div className="w-32 h-32 rounded-full border-8 border-[#1a1a1a] bg-gray-300 flex items-center justify-center text-5xl shadow-xl">
            👤
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Content Area - Main Body */}
        <div className="w-2/3 p-8 overflow-auto">
          {/* Name and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-[#1a1a1a] mb-2">{data.full_name}</h1>
            {data.job_title && (
              <p className="text-xl text-gray-700 font-semibold">{data.job_title}</p>
            )}
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-8">
              <div className="bg-[#f39c12] text-[#1a1a1a] font-black py-3 px-6 mb-4 inline-block">
                PROFIL
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <div className="bg-[#f39c12] text-[#1a1a1a] font-black py-3 px-6 mb-4 inline-block">
                EXPÉRIENCE
              </div>
              <div className="space-y-6 ml-6">
                {data.experiences.map((exp, index) => (
                  <div key={index} className="border-l-4 border-[#f39c12] pl-6">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#f39c12] mb-2">{exp.company}</p>
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
              <div className="bg-[#f39c12] text-[#1a1a1a] font-black py-3 px-6 mb-4 inline-block">
                FORMATION
              </div>
              <div className="space-y-4 ml-6">
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

        {/* Right Sidebar - Black */}
        <div className="w-1/3 bg-[#1a1a1a] text-white p-8 overflow-auto">
          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-orange-500">
              CONTACT
            </h3>
            <div className="space-y-3 text-sm">
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

          {/* Skills with Orange Progress */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-orange-500">
                COMPÉTENCES
              </h3>
              <div className="space-y-3">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <p className="text-xs font-semibold text-gray-200 mb-1">{skill}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-[#f39c12] h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-orange-500">
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

          {/* Social Icons at Bottom */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex gap-4 justify-center">
              <a href="#" className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-[#1a1a1a]">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-[#1a1a1a]">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-[#1a1a1a]">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
