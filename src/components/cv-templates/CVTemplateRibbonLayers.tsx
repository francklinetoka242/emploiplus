import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateRibbonLayersProps {
  data: CVData;
}

export const CVTemplateRibbonLayers: React.FC<CVTemplateRibbonLayersProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Gray */}
      <div className="w-2/5 bg-[#7f8c8d] p-8 overflow-auto">
        {/* Profile Photo with Arch Frame */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            {/* Arch Frame Shape */}
            <svg className="absolute inset-0 w-40 h-40" viewBox="0 0 160 160">
              <path
                d="M 20 40 L 20 140 Q 80 160 140 140 L 140 40 C 100 20 60 20 20 40"
                fill="none"
                stroke="#2c3e50"
                strokeWidth="2"
              />
            </svg>
            
            {/* Photo */}
            <div className="relative z-10 w-40 h-40 rounded-t-3xl bg-gray-400 flex items-center justify-center text-5xl overflow-hidden">
              👤
            </div>
          </div>
        </div>

        {/* Name in Sidebar */}
        <h2 className="text-2xl font-black text-white text-center mb-8 break-words">
          {data.full_name}
        </h2>

        {/* Job Title */}
        {data.job_title && (
          <p className="text-sm text-gray-100 text-center mb-8 font-semibold">{data.job_title}</p>
        )}

        {/* Contact Section */}
        <div className="mb-8 text-white text-sm space-y-3">
          {data.email && (
            <div className="flex items-start gap-2">
              <Mail size={16} className="flex-shrink-0 mt-1" />
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
              <MapPin size={16} className="flex-shrink-0 mt-1" />
              <span>{data.location}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-white font-black text-lg mb-4 uppercase tracking-wider">
              Compétences
            </h3>
            <div className="space-y-2 text-white text-sm">
              {data.skills.map((skill, index) => (
                <p key={index}>• {skill}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White with Ribbon Overlays */}
      <div className="w-3/5 p-8 overflow-auto relative">
        {/* Summary Ribbon */}
        {data.summary && (
          <div className="mb-8">
            <div className="relative">
              <div className="absolute -left-10 top-0 h-12 bg-[#2c3e50] w-1/3 rounded-r-full"></div>
              <h2 className="text-xl font-black text-white bg-[#2c3e50] py-3 px-6 rounded-r-full mb-4 relative z-10 w-fit">
                À Propos
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed ml-0 pt-2">{data.summary}</p>
          </div>
        )}

        {/* Experience Ribbon */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <div className="absolute -left-10 top-0 h-12 bg-[#2c3e50] w-1/3 rounded-r-full"></div>
              <h2 className="text-xl font-black text-white bg-[#2c3e50] py-3 px-6 rounded-r-full mb-4 relative z-10 w-fit">
                Expérience
              </h2>
            </div>
            <div className="space-y-5 ml-4 border-l-4 border-[#2c3e50] pl-6 pt-2">
              {data.experiences.map((exp, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-10 w-3 h-3 rounded-full bg-[#2c3e50] mt-1.5"></div>
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

        {/* Education Ribbon */}
        {data.education && data.education.length > 0 && (
          <div>
            <div className="relative">
              <div className="absolute -left-10 top-0 h-12 bg-[#2c3e50] w-1/3 rounded-r-full"></div>
              <h2 className="text-xl font-black text-white bg-[#2c3e50] py-3 px-6 rounded-r-full mb-4 relative z-10 w-fit">
                Formation
              </h2>
            </div>
            <div className="space-y-4 ml-4 border-l-4 border-[#2c3e50] pl-6 pt-2">
              {data.education.map((edu, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-10 w-3 h-3 rounded-full bg-[#2c3e50] mt-1.5"></div>
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
