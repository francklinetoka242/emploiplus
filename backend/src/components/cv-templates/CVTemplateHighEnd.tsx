import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateHighEndProps {
  data: CVData;
}

export const CVTemplateHighEnd: React.FC<CVTemplateHighEndProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white">
      {/* Header - Light Gray */}
      <div className="bg-[#f2f2f2] p-8 flex justify-between items-center border-b border-gray-300">
        <div className="flex-1">
          <h1 className="text-4xl font-black">
            <span className="text-[#e67e22]">{data.full_name.split(" ")[0]}</span>
            <span className="text-gray-700 ml-2">{data.full_name.split(" ").slice(1).join(" ")}</span>
          </h1>
          {data.job_title && (
            <p className="text-lg text-gray-600 font-light mt-2">{data.job_title}</p>
          )}
        </div>
        {/* Profile Photo */}
        <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-4xl ml-8">
          👤
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex">
        {/* Left Column */}
        <div className="w-1/2 p-8 border-r border-gray-300 border-opacity-20 overflow-auto">
          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-[#e67e22] uppercase tracking-widest mb-4">
              Contact
            </h2>
            <div className="space-y-2 text-sm text-gray-700 font-light">
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-600" />
                  <span>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-600" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-600" />
                  <span>{data.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-[#e67e22] uppercase tracking-widest mb-4">
                Formation
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-800 text-sm">{edu.degree}</h3>
                    <p className="text-xs text-gray-500 mt-1">{edu.year}</p>
                    <p className="text-sm text-gray-700 font-light">{edu.school}</p>
                    {edu.field && <p className="text-sm text-gray-600 font-light mt-1">{edu.field}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#e67e22] uppercase tracking-widest mb-4">
                Compétences
              </h2>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <p key={index} className="text-sm text-gray-700 font-light">
                    • {skill}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-1/2 p-8 overflow-auto">
          {/* Profile */}
          {data.summary && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-[#e67e22] uppercase tracking-widest mb-4">
                Profil
              </h2>
              <p className="text-sm text-gray-700 font-light leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#e67e22] uppercase tracking-widest mb-4">
                Expérience
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <span className="text-xs text-gray-500">{exp.startDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-light mb-2">{exp.company}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 font-light">{exp.description}</p>
                    )}
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
