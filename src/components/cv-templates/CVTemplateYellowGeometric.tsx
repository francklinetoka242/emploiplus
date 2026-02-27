import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateYellowGeometricProps {
  data: CVData;
}

export const CVTemplateYellowGeometric: React.FC<CVTemplateYellowGeometricProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Header with Yellow Accent and Photo */}
      <div className="relative bg-white pb-8">
        <div className="flex">
          {/* Yellow Block Behind Photo */}
          <div className="relative w-1/3">
            <div className="h-40 bg-[#f39c12] absolute top-0 left-0 right-0 rounded-br-3xl"></div>
            <div className="pt-8 px-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl border-4 border-white shadow-lg ml-4">
                👤
              </div>
            </div>
          </div>

          {/* Name Section on Gray Background */}
          <div className="w-2/3 bg-[#f2f2f2] px-8 py-12 flex flex-col justify-center">
            <h1 className="text-4xl font-black text-[#f39c12] mb-2">{data.full_name.split(" ")[0]}</h1>
            <p className="text-2xl font-bold text-gray-800">{data.full_name.split(" ").slice(1).join(" ")}</p>
            {data.job_title && (
              <p className="text-lg text-gray-600 mt-3 font-semibold">{data.job_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Vertical Separator */}
      <div className="flex">
        {/* Left Column with Timeline */}
        <div className="w-1/3 p-8 border-r-4 border-[#dfe6e9] relative overflow-auto">
          {/* Contact Section */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-[#2d3436] uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              {data.email && (
                <div className="flex items-center gap-2 pl-6">
                  <div className="w-3 h-3 rounded-full bg-[#f39c12]"></div>
                  <span className="break-words">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 pl-6">
                  <div className="w-3 h-3 rounded-full bg-[#f39c12]"></div>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2 pl-6">
                  <div className="w-3 h-3 rounded-full bg-[#f39c12]"></div>
                  <span>{data.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills with Yellow Level */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-[#2d3436] uppercase tracking-wider mb-4">
                Compétences
              </h3>
              <div className="space-y-3">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <p className="text-xs font-semibold text-gray-700 mb-1">{skill}</p>
                    <div className="w-full bg-[#b2bec3] rounded-full h-2">
                      <div className="bg-[#f39c12] h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-2/3 p-8 overflow-auto relative">
          {/* Yellow Triangle Accent Top Right */}
          <div className="absolute top-0 right-0 w-0 h-0 border-l-12 border-b-12 border-l-transparent border-b-[#f39c12]"></div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-[#2d3436] mb-4 pb-2 border-b-2 border-[#f39c12]">
                Profil
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-[#2d3436] mb-4 pb-2 border-b-2 border-[#f39c12]">
                Expérience
              </h2>
              <div className="space-y-5">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">{exp.company}</p>
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
              <h2 className="text-lg font-black text-[#2d3436] mb-4 pb-2 border-b-2 border-[#f39c12]">
                Formation
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

          {/* Yellow Triangle Accent Bottom Left */}
          <div className="absolute bottom-0 left-0 w-0 h-0 border-r-12 border-t-12 border-r-transparent border-t-[#f39c12]"></div>
        </div>
      </div>
    </div>
  );
};
