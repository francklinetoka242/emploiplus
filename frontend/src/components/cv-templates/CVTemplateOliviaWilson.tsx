import React from "react";
import { Phone, Mail, Linkedin, Sparkles } from "lucide-react";

interface CVTemplateData {
  full_name: string;
  job_title: string;
  phone: string;
  email: string;
  linkedin?: string;
  location?: string;
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
  skills: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
}

interface CVTemplateOliviaWilsonProps {
  data: CVTemplateData;
}

export const CVTemplateOliviaWilson: React.FC<CVTemplateOliviaWilsonProps> = ({ data }) => {
  return (
    <div className="min-h-[1123px] w-[794px] bg-white p-12 shadow-2xl mx-auto font-['Inter'] text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-2 border-[#BDE3F2] overflow-hidden bg-gray-200">
            {/* Placeholder for photo */}
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
              Photo
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="flex-1 text-center px-8">
          <h1 className="text-3xl font-medium mb-2">{data.job_title}</h1>
          <h2 className="text-xl text-gray-400">{data.full_name}</h2>
        </div>

        {/* Graphic Element */}
        <div className="flex-shrink-0">
          <div className="w-8 h-24 bg-[#BDE3F2] rounded-b-full"></div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="mb-8">
        <div className="border-t border-gray-200 mb-4"></div>
        <div className="flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#BDE3F2]" />
            <span>{data.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#BDE3F2]" />
            <span>{data.email}</span>
          </div>
          {data.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-[#BDE3F2]" />
              <span>{data.linkedin}</span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 mt-4"></div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-justify leading-relaxed text-sm">{data.summary}</p>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Experiences (65%) */}
        <div className="col-span-8">
          {/* Experiences Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#BDE3F2]" />
              <h3 className="text-lg font-semibold tracking-widest uppercase">EXPÉRIENCES</h3>
            </div>
            <div className="space-y-6">
              {data.experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-base">{exp.position}</h4>
                      <p className="text-gray-600 text-sm">{exp.company}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                    {exp.description.split('. ').map((sentence, idx) => (
                      <li key={idx}>{sentence}{sentence.endsWith('.') ? '' : '.'}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#BDE3F2]" />
              <h3 className="text-lg font-semibold tracking-widest uppercase">FORMATION</h3>
            </div>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base">{edu.degree}</h4>
                      <p className="text-gray-600 text-sm">{edu.school}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Skills (35%) */}
        <div className="col-span-4">
          {/* Skills Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#BDE3F2]" />
              <h3 className="text-lg font-semibold tracking-widest uppercase">COMPÉTENCES</h3>
            </div>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#BDE3F2] rounded-full flex-shrink-0"></div>
                  <span className="text-sm">{typeof skill === 'string' ? skill : skill.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages Section */}
          {data.languages && data.languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#BDE3F2]" />
                <h3 className="text-lg font-semibold tracking-widest uppercase">LANGUES</h3>
              </div>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{lang.name}</span>
                    <span className="text-sm text-gray-600">{lang.level}</span>
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