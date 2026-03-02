import React from "react";
import { Mail, Phone, MapPin, BookOpen, Users, Star } from "lucide-react";
import { CVData } from "../CVEditorModal";

interface CVTemplateYellowMaskProps {
  data: CVData;
}

export const CVTemplateYellowMask: React.FC<CVTemplateYellowMaskProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Light Gray */}
      <div className="w-3/10 bg-[#f8f8f8] p-8 overflow-auto border-r border-gray-200">
        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-black font-bold text-lg mb-4 flex items-center gap-2">
            <Mail size={20} className="text-[#f1c40f]" />
            Contact
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
          </div>
        </div>

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h3 className="text-black font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[#f1c40f]" />
              Formation
            </h3>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="text-sm">
                  <p className="font-bold text-gray-800">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.year}</p>
                  <p className="text-gray-700">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Section */}
        {data.qualities && data.qualities.length > 0 && (
          <div>
            <h3 className="text-black font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={20} className="text-[#f1c40f]" />
              Références
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              {data.qualities.map((quality, index) => (
                <p key={index}>• {quality}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content - White */}
      <div className="w-7/10 relative">
        {/* Yellow Block with Mask Photo Effect */}
        <div className="relative">
          {/* Yellow Background Block */}
          <div className="h-32 bg-[#f1c40f] rounded-b-3xl"></div>

          {/* Photo with U-shape mask effect */}
          <div className="absolute top-8 left-8 w-40 h-40">
            <div className="w-40 h-40 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center text-4xl">
              👤
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 pt-4">
          {/* Name */}
          <h1 className="text-4xl font-black text-black mb-1 tracking-wider">
            {data.full_name.toUpperCase().split(" ").slice(0, 2).join(" ")}
          </h1>
          {data.job_title && (
            <p className="text-xl text-gray-600 font-semibold mb-8">{data.job_title}</p>
          )}

          {/* Summary */}
          {data.summary && (
            <div className="mb-8 text-sm text-gray-700 leading-relaxed">{data.summary}</div>
          )}

          {/* Job Experience with Timeline */}
          {data.experiences && data.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wider">
                Expérience Professionnelle
              </h2>
              <div className="space-y-6">
                {data.experiences.map((exp, index) => (
                  <div key={index} className="flex gap-6">
                    {/* Yellow Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-[#f1c40f] mt-1"></div>
                      {index < data.experiences.length - 1 && (
                        <div className="w-1 bg-[#f1c40f] flex-grow mt-2" style={{ height: "100px" }}></div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <h3 className="font-bold text-gray-800 text-lg">{exp.position}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 my-2">
                        {exp.startDate} - {exp.endDate}
                      </p>
                      {exp.description && <p className="text-sm text-gray-700">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills with Rating */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wider">
                Compétences
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {data.skills.map((skill, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-gray-800 mb-1">{skill}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className="text-[#f1c40f]"
                          fill="#f1c40f"
                        />
                      ))}
                    </div>
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
