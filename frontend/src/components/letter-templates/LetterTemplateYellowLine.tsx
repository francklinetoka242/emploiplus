import React from "react";
import { MotivationLetterData } from "../MotivationLetterEditorModal";

interface LetterTemplateYellowLineProps {
  data: MotivationLetterData;
}

export const LetterTemplateYellowLine: React.FC<LetterTemplateYellowLineProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white overflow-auto">
      {/* Header Band */}
      <div className="bg-[#f2f2f2] px-12 py-6 flex justify-between items-end">
        <h1 className="text-4xl font-black text-[#f39c12] uppercase">
          {data.candidateName}
        </h1>
        <div className="text-right text-sm text-gray-700 space-y-1">
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
        </div>
      </div>

      {/* Main Content with Left Vertical Line */}
      <div className="flex">
        {/* Vertical Yellow Line */}
        <div className="w-1 bg-[#f39c12]"></div>

        {/* Content */}
        <div className="flex-1 p-12">
          {/* Job Title */}
          {data.candidatePosition && (
            <p className="text-sm font-semibold text-gray-700 mb-6">{data.candidatePosition}</p>
          )}

          {/* Date */}
          <div className="mb-8 text-sm text-gray-600">
            {new Date().toLocaleDateString("fr-FR", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </div>

          {/* Recipient Info */}
          {(data.recipientName || data.recipientCompany) && (
            <div className="mb-8 text-sm text-gray-700">
              {data.recipientName && <p className="font-semibold">{data.recipientName}</p>}
              {data.recipientCompany && <p>{data.recipientCompany}</p>}
              {data.recipientAddress && <p>{data.recipientAddress}</p>}
            </div>
          )}

          {/* Subject with Yellow Triangle */}
          {data.subject && (
            <div className="mb-8 text-sm">
              <p className="font-bold text-[#2d3436]">
                <span className="inline-block w-2 h-2 bg-[#f39c12] mr-2 transform rotate-45"></span>
                Objet : {data.subject}
              </p>
            </div>
          )}

          {/* Greeting */}
          {data.greeting && (
            <p className="mb-6 text-sm text-[#2d3436]">{data.greeting}</p>
          )}

          {/* Body */}
          <div className="space-y-4 text-sm text-[#2d3436] leading-relaxed text-justify">
            {data.body && data.body.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Closing */}
          {data.closing && (
            <p className="mt-8 text-sm text-[#2d3436]">{data.closing}</p>
          )}

          {/* Signature */}
          <div className="mt-12 pt-6">
            <p className="font-bold text-[#2d3436]">{data.candidateName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
