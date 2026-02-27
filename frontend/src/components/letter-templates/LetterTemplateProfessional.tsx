import React from "react";
import { MotivationLetterData } from "../MotivationLetterEditorModal";

interface LetterTemplateProfessionalProps {
  data: MotivationLetterData;
}

export const LetterTemplateProfessional: React.FC<LetterTemplateProfessionalProps> = ({ data }) => {
  const initials = data.candidateName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="p-12 max-w-4xl mx-auto">
        {/* Header Block with Initials */}
        <div className="flex items-start gap-8 mb-12 pb-8 border-b-2 border-gray-300">
          <div className="w-20 h-20 bg-[#4a4a4a] text-white flex items-center justify-center rounded-sm flex-shrink-0">
            <span className="text-2xl font-black">{initials}</span>
          </div>

          {/* Sender Info - Left */}
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[#1a1a1a] mb-2">{data.candidateName}</h1>
            {data.candidatePosition && (
              <p className="text-sm text-gray-700 font-semibold mb-3">{data.candidatePosition}</p>
            )}
            <div className="text-xs text-gray-600 space-y-1">
              {data.email && <p>{data.email}</p>}
              {data.phone && <p>{data.phone}</p>}
              {data.location && <p>{data.location}</p>}
            </div>
          </div>

          {/* Recipient Info - Right */}
          {(data.recipientName || data.recipientCompany) && (
            <div className="text-right text-sm text-gray-700">
              {data.recipientName && <p className="font-semibold">{data.recipientName}</p>}
              {data.recipientCompany && <p>{data.recipientCompany}</p>}
              {data.recipientAddress && <p className="text-xs">{data.recipientAddress}</p>}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="text-right text-sm text-gray-600 mb-8">
          {new Date().toLocaleDateString("fr-FR", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </div>

        {/* Subject */}
        {data.subject && (
          <div className="mb-8">
            <p className="font-black text-[#4a4a4a] uppercase text-sm tracking-wider">
              Objet : {data.subject}
            </p>
          </div>
        )}

        {/* Greeting */}
        {data.greeting && (
          <p className="mb-6 text-sm text-[#1a1a1a] font-serif">{data.greeting}</p>
        )}

        {/* Body */}
        <div className="space-y-5 text-sm text-[#1a1a1a] leading-relaxed text-justify font-serif">
          {data.body && data.body.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Closing */}
        {data.closing && (
          <p className="mt-8 text-sm text-[#1a1a1a] font-serif">{data.closing}</p>
        )}

        {/* Signature */}
        <div className="mt-16 pt-12">
          <p className="font-black text-[#1a1a1a]">{data.candidateName}</p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-[#1a1a1a] flex justify-center">
          <p className="text-xs text-gray-600">
            {data.email} • {data.location}
          </p>
        </div>
      </div>
    </div>
  );
};
