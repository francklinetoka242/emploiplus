import React from "react";
import { MotivationLetterData } from "../MotivationLetterEditorModal";

interface LetterTemplateWaveFluidProps {
  data: MotivationLetterData;
}

export const LetterTemplateWaveFluid: React.FC<LetterTemplateWaveFluidProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white overflow-auto">
      {/* Wave Header */}
      <div className="relative pb-16">
        <svg className="w-full h-32" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M0,50 Q250,0 500,50 T1000,50 L1000,100 L0,100 Z" fill="#cf8d2e" />
        </svg>
        
        {/* Name in Wave */}
        <div className="absolute top-8 left-12 right-12">
          <h1 className="text-4xl font-black text-[#101820] uppercase">
            {data.candidateName}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-12 pb-12">
        {/* Coordinates in Orange Capsules */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {data.email && (
            <div className="bg-[#cf8d2e] text-white px-4 py-2 rounded-full text-xs font-semibold">
              📧 {data.email}
            </div>
          )}
          {data.phone && (
            <div className="bg-[#cf8d2e] text-white px-4 py-2 rounded-full text-xs font-semibold">
              📱 {data.phone}
            </div>
          )}
          {data.location && (
            <div className="bg-[#cf8d2e] text-white px-4 py-2 rounded-full text-xs font-semibold">
              📍 {data.location}
            </div>
          )}
        </div>

        {/* Job Title */}
        {data.candidatePosition && (
          <p className="text-sm font-semibold text-gray-700 mb-8">{data.candidatePosition}</p>
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

        {/* Subject with Wavy Underline */}
        {data.subject && (
          <div className="mb-8">
            <p className="font-bold text-[#101820] text-sm mb-2">Objet : {data.subject}</p>
            <svg className="w-32 h-2" viewBox="0 0 200 10" preserveAspectRatio="none">
              <path d="M0,5 Q25,0 50,5 T100,5 T150,5 T200,5" stroke="#cf8d2e" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}

        {/* Greeting */}
        {data.greeting && (
          <p className="mb-6 text-sm text-black">{data.greeting}</p>
        )}

        {/* Body */}
        <div className="space-y-4 text-sm text-black leading-relaxed text-justify ml-6">
          {data.body && data.body.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Closing */}
        {data.closing && (
          <p className="mt-8 text-sm text-black">{data.closing}</p>
        )}

        {/* Signature */}
        <div className="mt-12 pt-6">
          <p className="font-bold text-black">{data.candidateName}</p>
        </div>
      </div>
    </div>
  );
};
