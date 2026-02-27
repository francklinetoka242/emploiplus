import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { MotivationLetterData } from "../MotivationLetterEditorModal";

interface LetterTemplateTurquoiseDynamicProps {
  data: MotivationLetterData;
}

export const LetterTemplateTurquoiseDynamic: React.FC<LetterTemplateTurquoiseDynamicProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white overflow-auto">
      <div className="flex">
        {/* Turquoise Sidebar */}
        <div className="w-1 bg-[#2bb0ac]"></div>

        {/* Main Content */}
        <div className="flex-1 p-12">
          {/* Header with Name */}
          <h1 className="text-4xl font-black text-[#2bb0ac] uppercase mb-2">
            {data.candidateName}
          </h1>
          {data.candidatePosition && (
            <p className="text-sm text-gray-700 font-semibold mb-6">{data.candidatePosition}</p>
          )}

          {/* Contact with Orange Icons */}
          <div className="flex gap-6 mb-8 text-sm text-gray-700">
            {data.email && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f39c12]"></div>
                <span>{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f39c12]"></div>
                <span>{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f39c12]"></div>
                <span>{data.location}</span>
              </div>
            )}
          </div>

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

          {/* Subject in Box */}
          {data.subject && (
            <div className="mb-8 border-l-4 border-[#2bb0ac] pl-4 relative">
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#f39c12]"></div>
              <p className="font-bold text-[#2bb0ac] text-sm">
                Objet : {data.subject}
              </p>
            </div>
          )}

          {/* Greeting */}
          {data.greeting && (
            <p className="mb-6 text-sm text-gray-800">{data.greeting}</p>
          )}

          {/* Body */}
          <div className="space-y-4 text-sm text-gray-800 leading-relaxed text-justify">
            {data.body && data.body.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Closing */}
          {data.closing && (
            <p className="mt-8 text-sm text-gray-800">{data.closing}</p>
          )}

          {/* Signature */}
          <div className="mt-12 pt-6">
            <p className="font-bold text-gray-800">{data.candidateName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
