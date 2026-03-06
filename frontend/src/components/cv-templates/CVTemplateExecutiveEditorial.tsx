import React from "react";
import { Phone, Mail, MapPin, Globe, Circle, ArrowRight, User, Briefcase, GraduationCap, Code } from "lucide-react";

interface CVTemplateData {
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  linkedin?: string;
  location?: string;
  website?: string;
  summary: string;
  experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    name: string;
    level: number; // 1-5
  }>;
  software: Array<{
    name: string;
    level: number; // 1-5
  }>;
  languages?: Array<{
    name: string;
    level: string;
  }>;
}

interface CVTemplateExecutiveEditorialProps {
  data: CVTemplateData;
}

export const CVTemplateExecutiveEditorial: React.FC<CVTemplateExecutiveEditorialProps> = ({ data }) => {
  return (
    <div className="min-h-[1123px] w-[794px] bg-white border border-gray-100 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] mx-auto p-16 font-['Inter'] text-[#2A2A2A]">
      {/* Header */}
      <div className="flex items-center justify-between mb-16">
        {/* Left side - Name and Title */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-[#2A2A2A] mb-3 leading-tight">
            {data.full_name}
          </h1>
          <h2 className="text-2xl font-light italic text-gray-600">
            {data.job_title}
          </h2>
        </div>

        {/* Right side - Geometric element with photo */}
        <div className="relative">
          <div className="w-40 h-40 bg-[#E1F4F0] rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Abstract geometric shape */}
            <div className="absolute inset-0 bg-[#E1F4F0] rounded-full"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#E1F4F0] rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#E1F4F0] rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

            {/* Photo placeholder */}
            <div className="relative z-10 w-28 h-28 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Separator line */}
      <div className="border-t border-[#E1F4F0] mb-12"></div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-12 gap-12">
        {/* Left Sidebar - 25% */}
        <div className="col-span-3 space-y-12">
          {/* Contact Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
              <h3 className="text-lg font-semibold tracking-wide uppercase">Contact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#E1F4F0]" />
                <span className="text-sm">{data.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#E1F4F0]" />
                <span className="text-sm">{data.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#E1F4F0]" />
                <span className="text-sm">{data.location}</span>
              </div>
              {data.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#E1F4F0]" />
                  <span className="text-sm">{data.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Software Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
              <h3 className="text-lg font-semibold tracking-wide uppercase">Logiciels</h3>
            </div>
            <div className="space-y-4">
              {data.software?.map((software, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{software.name}</span>
                    <span className="text-xs text-gray-500">{software.level}/5</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div
                      className="bg-[#E1F4F0] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(software.level / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Content - 75% */}
        <div className="col-span-9 space-y-12">
          {/* Profile Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
              <h3 className="text-lg font-semibold tracking-wide uppercase">Profil</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </div>

          {/* Separator line */}
          <div className="border-t border-[#E1F4F0]"></div>

          {/* Experiences and Skills - Two Column Layout */}
          <div className="grid grid-cols-2 gap-12">
            {/* Experiences */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
                <h3 className="text-lg font-semibold tracking-wide uppercase">Expériences</h3>
              </div>
              <div className="space-y-8">
                {data.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-base text-[#2A2A2A]">{exp.position}</h4>
                        <p className="text-sm text-gray-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {exp.description.split('. ').map((sentence, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <ArrowRight className="w-3 h-3 text-[#E1F4F0] mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed text-gray-700">{sentence}{sentence.endsWith('.') ? '' : '.'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
                <h3 className="text-lg font-semibold tracking-wide uppercase">Soft Skills</h3>
              </div>
              <div className="space-y-4">
                {data.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <ArrowRight className="w-3 h-3 text-[#E1F4F0] flex-shrink-0" />
                    <span className="text-sm">{skill.name}</span>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <Circle className="w-4 h-4 text-[#E1F4F0] fill-current" />
                  <h3 className="text-lg font-semibold tracking-wide uppercase">Formation</h3>
                </div>
                <div className="space-y-6">
                  {data.education.map((edu, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-base text-[#2A2A2A]">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.school}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};