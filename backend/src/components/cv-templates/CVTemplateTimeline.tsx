import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen, Languages } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateTimelineProps {
  data: CVData;
}

export const CVTemplateTimeline: React.FC<CVTemplateTimelineProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Pearl Gray */}
      <div className="w-1/3 bg-[#dcdde1] p-8 overflow-auto">
        {/* Profile Photo */}
        <div className="flex justify-center mb-8">
          <div className="w-36 h-36 rounded-full border-4 border-[#2f3640] bg-gray-300 flex items-center justify-center text-4xl shadow-lg">
            👤
          </div>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-black text-[#2f3640] text-center mb-8 break-words">
          {data.full_name}
        </h2>

        {/* Job Title */}
        {data.job_title && (
          <p className="text-sm text-[#2f3640] text-center font-semibold mb-8 italic">
            {data.job_title}
          </p>
        )}

        {/* Contact */}
        <div className="mb-8 pb-6 border-b-2 border-dashed border-[#2f3640]">
          <h3 className="text-sm font-bold text-[#2f3640] mb-4 uppercase">Contact</h3>
          <div className="space-y-3 text-xs text-[#2f3640]">
            {data.email && (
              <div className="flex items-start gap-2">
                <Mail size={14} className="flex-shrink-0 mt-0.5" />
                <span className="break-words">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Languages as Segments */}
        {data.languages && data.languages.length > 0 && (
          <div className="mb-8 pb-6 border-b-2 border-dashed border-[#2f3640]">
            <h3 className="text-sm font-bold text-[#2f3640] mb-4 uppercase">Langues</h3>
            <div className="space-y-3">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <p className="text-xs font-semibold text-[#2f3640] mb-1">{lang.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((seg) => (
                      <div
                        key={seg}
                        className={`h-2 flex-1 ${
                          seg <= 3 ? "bg-[#2f3640]" : "bg-gray-400"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#2f3640] mb-4 uppercase">Compétences</h3>
            <div className="space-y-2 text-xs text-[#2f3640]">
              {data.skills.map((skill, index) => (
                <p key={index}>• {skill}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - Timeline */}
      <div className="w-2/3 p-8 overflow-auto relative">
        {/* Vertical Timeline Line - Dotted */}
        <div className="absolute left-24 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#2f3640]"></div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-12 relative pl-16">
            <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#fbc531] border-4 border-[#2f3640] mt-1"></div>
            <h2 className="text-lg font-black text-[#2f3640] mb-2 uppercase">Profil</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience with Timeline */}
        {data.experiences && data.experiences.length > 0 && (
          <div className="mb-12">
            <div className="relative pl-16">
              <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#fbc531] border-4 border-[#2f3640] mt-1"></div>
              <h2 className="text-lg font-black text-[#2f3640] mb-6 uppercase">Expérience</h2>
            </div>
            <div className="space-y-8">
              {data.experiences.map((exp, index) => (
                <div key={index} className="relative pl-16">
                  <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#fbc531] border-4 border-[#2f3640]"></div>
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

        {/* Education with Timeline */}
        {data.education && data.education.length > 0 && (
          <div>
            <div className="relative pl-16">
              <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#fbc531] border-4 border-[#2f3640] mt-1"></div>
              <h2 className="text-lg font-black text-[#2f3640] mb-6 uppercase">Formation</h2>
            </div>
            <div className="space-y-8">
              {data.education.map((edu, index) => (
                <div key={index} className="relative pl-16">
                  <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#fbc531] border-4 border-[#2f3640]"></div>
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
