import React from "react";
import { MotivationLetterData } from "../MotivationLetterEditorModal";

interface LetterTemplateSidebarBlackProps {
  data: MotivationLetterData;
}

export const LetterTemplateSidebarBlack: React.FC<LetterTemplateSidebarBlackProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white flex">
      {/* Left Sidebar - Black */}
      <div className="w-1/6 bg-[#1a1a1a]"></div>

      {/* Main Content */}
      <div className="w-5/6 p-12 overflow-auto">
        {/* Header with Name and Contact */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-300">
          <div>
            <h1 className="text-4xl font-black text-[#1a1a1a] uppercase mb-2">
              {data.candidateName}
            </h1>
            <p className="text-sm text-gray-600 font-semibold">{data.candidatePosition}</p>
          </div>
          <div className="text-right text-sm text-gray-700 space-y-1">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.location && <p>{data.location}</p>}
          </div>
        </div>

        {/* Date */}
        <div className="text-right mb-8 text-sm text-gray-600">
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

        {/* Subject */}
        {data.subject && (
          <div className="mb-8 text-sm">
            <p className="font-bold text-[#1a1a1a]">Objet : {data.subject}</p>
          </div>
        )}

        {/* Greeting */}
        {data.greeting && (
          <p className="mb-6 text-sm text-[#1a1a1a]">{data.greeting}</p>
        )}

        {/* Body */}
        <div className="space-y-4 text-sm text-[#1a1a1a] leading-relaxed text-justify">
          {data.body && data.body.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Closing */}
        {data.closing && (
          <p className="mt-8 text-sm text-[#1a1a1a]">{data.closing}</p>
        )}

        {/* Signature */}
        <div className="mt-12 pt-6">
          <p className="font-bold text-[#1a1a1a]">{data.candidateName}</p>
        </div>
      </div>
    </div>
  );
};
