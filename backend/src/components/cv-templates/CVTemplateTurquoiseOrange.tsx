import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen, Star } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateTurquoiseOrangeProps {
  data: CVData;
}

export const CVTemplateTurquoiseOrange: React.FC<CVTemplateTurquoiseOrangeProps> = ({ data }) => {
  const maxSkillLevel = 5;

  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Turquoise */}
      <div className="w-1/3 bg-[#2bb0ac] text-white p-8 overflow-auto">
        {/* Profile Photo */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full border-8 border-[#f39c12] bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
            <span className="text-4xl">👤</span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b-2 border-[#f39c12]">
            Contact
          </h3>
          <div className="space-y-3 text-sm">
            {data.email && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#f39c12] flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-[#2bb0ac]" />
                </div>
                <span className="break-words">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#f39c12] flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-[#2bb0ac]" />
                </div>
                <span>{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#f39c12] flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-[#2bb0ac]" />
                </div>
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b-2 border-[#f39c12]">
              Compétences
            </h3>
            <div className="space-y-3">
              {data.skills.map((skill, index) => (
                <div key={index}>
                  <p className="text-sm font-medium mb-1">{skill}</p>
                  <div className="w-full bg-[#208885] rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b-2 border-[#f39c12]">
              Langues
            </h3>
            <div className="space-y-2">
              {data.languages.map((lang, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs opacity-90">{lang.level}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests Section */}
        {data.qualities && data.qualities.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b-2 border-[#f39c12]">
              Intérêts
            </h3>
            <div className="space-y-2">
              {data.qualities.map((quality, index) => (
                <p key={index} className="text-sm">• {quality}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White */}
      <div className="w-2/3 bg-white p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 pb-4 border-b-2 border-gray-200">
          <h1 className="text-4xl font-black text-black mb-2">{data.full_name}</h1>
          {data.job_title && <p className="text-lg text-[#f39c12] font-semibold">{data.job_title}</p>}
        </div>

        {/* Profile Summary */}
        {data.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#f39c12] border-b-2 border-[#f39c12] pb-2 mb-4">
              Profil
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#f39c12] border-b-2 border-[#f39c12] pb-2 mb-4">
              Expérience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{exp.position}</h3>
                    <span className="text-xs text-gray-500">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                  {exp.description && <p className="text-sm text-gray-700">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#f39c12] border-b-2 border-[#f39c12] pb-2 mb-4">
              Formation
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                    <span className="text-xs text-gray-500">{edu.year}</span>
                  </div>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  {edu.field && <p className="text-sm text-gray-700">{edu.field}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
