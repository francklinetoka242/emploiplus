import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateTurquoiseOrangeV2Props {
  data: CVData;
}

export const CVTemplateTurquoiseOrangeV2: React.FC<CVTemplateTurquoiseOrangeV2Props> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Turquoise */}
      <div className="w-2/5 bg-[#2bb0ac] text-white p-8 overflow-auto">
        {/* Profile Photo with Orange Border */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 rounded-full border-8 border-[#f39c12] bg-gray-300 flex items-center justify-center text-5xl shadow-lg">
            👤
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-black text-white text-center mb-2 break-words">
          {data.full_name}
        </h2>

        {/* Job Title */}
        {data.job_title && (
          <p className="text-sm text-orange-100 text-center mb-8 font-semibold italic">
            {data.job_title}
          </p>
        )}

        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-white font-bold text-sm mb-4 pb-2 border-b-2 border-[#f39c12]">
            CONTACT
          </h3>
          <div className="space-y-3 text-sm text-gray-50">
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

        {/* Skills with Fine Bars */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-sm mb-4 pb-2 border-b-2 border-[#f39c12]">
              COMPÉTENCES
            </h3>
            <div className="space-y-3">
              {data.skills.map((skill, index) => (
                <div key={index}>
                  <p className="text-xs font-semibold text-gray-100 mb-1.5">{skill}</p>
                  <div className="w-full bg-[#1e7a77] rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-sm mb-4 pb-2 border-b-2 border-[#f39c12]">
              LANGUES
            </h3>
            <div className="space-y-2 text-sm">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <p className="text-xs font-semibold text-gray-100">{lang.name}</p>
                  <p className="text-xs text-orange-100 italic">{lang.level}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White */}
      <div className="w-3/5 p-8 overflow-auto">
        {/* Summary */}
        {data.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-[#f39c12]">
              À PROPOS
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-[#f39c12]">
              EXPÉRIENCE
            </h2>
            <div className="space-y-6">
              {data.experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{exp.position}</h3>
                    <span className="text-xs text-gray-500">{exp.startDate}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#2bb0ac] mb-2">{exp.company}</p>
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
            <h2 className="text-lg font-black text-gray-800 mb-3 pb-2 border-b-2 border-[#f39c12]">
              FORMATION
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm font-semibold text-[#2bb0ac]">{edu.school}</p>
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
