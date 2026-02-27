import React from "react";
import { Mail, Phone, MapPin, Briefcase, BookOpen, Users, Gamepad2 } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateNavyWhiteProps {
  data: CVData;
}

export const CVTemplateNavyWhite: React.FC<CVTemplateNavyWhiteProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Navy Blue */}
      <div className="w-1/3 bg-[#0a1d37] text-white p-8 overflow-auto">
        {/* Profile Photo - Double Circle */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-white flex items-center justify-center relative">
            <div className="w-36 h-36 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-5xl">
              👤
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="mb-8">
          <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-white">
            Contacts
          </h3>
          <div className="space-y-3 text-sm">
            {data.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-white flex-shrink-0" />
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
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-white flex-shrink-0" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-white">
              Langues
            </h3>
            <div className="space-y-3">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <p className="text-sm font-medium mb-2">{lang.name}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-2 h-2 rounded-full ${
                          dot <= 3 ? "bg-white" : "bg-white opacity-30"
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
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-white">
              Compétences
            </h3>
            <div className="space-y-2 text-sm">
              {data.skills.map((skill, index) => (
                <p key={index}>• {skill}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reference */}
        {data.qualities && data.qualities.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-white">
              Références
            </h3>
            <div className="space-y-2 text-sm">
              {data.qualities.slice(0, 2).map((quality, index) => (
                <p key={index} className="text-xs">
                  • {quality}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies - Icons at bottom */}
        {data.qualities && data.qualities.length > 2 && (
          <div className="mt-12 pt-8 border-t border-white">
            <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-white">
              Loisirs
            </h3>
            <div className="flex gap-4 justify-center flex-wrap">
              {data.qualities.slice(2, 5).map((quality, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full bg-white text-[#0a1d37] flex items-center justify-center"
                  title={quality}
                >
                  <Gamepad2 size={18} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White */}
      <div className="w-2/3 p-8 overflow-auto border-t-4 border-[#0a1d37]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2">{data.full_name}</h1>
          {data.job_title && <p className="text-lg text-gray-600 font-semibold">{data.job_title}</p>}
        </div>

        {/* Profile */}
        {data.summary && (
          <div className="mb-8">
            <h2 className="inline-block px-4 py-2 bg-[#0a1d37] text-white font-bold rounded-full mb-4">
              Profil
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed ml-0">{data.summary}</p>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="inline-block px-4 py-2 bg-[#0a1d37] text-white font-bold rounded-full mb-4">
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

        {/* Employment History */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="inline-block px-4 py-2 bg-[#0a1d37] text-white font-bold rounded-full mb-4">
              Expérience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{exp.position}</h3>
                    <span className="text-xs text-gray-500">{exp.startDate}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-700">
                      {exp.description.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                          • {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
