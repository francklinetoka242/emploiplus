import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelWaveNightBlueOrangeProps {
  data: BusinessCardData;
}

export const BusinessCardModelWaveNightBlueOrange: React.FC<BusinessCardModelWaveNightBlueOrangeProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="relative w-80 h-52 rounded-lg shadow-lg overflow-hidden flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#101820',
          margin: '5mm',
        }}
      >
        {/* Wave Shape */}
        <svg
          className="absolute top-1/2 left-0 w-full"
          height="60"
          viewBox="0 0 320 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q40,0 80,30 T160,30 T240,30 T320,30"
            fill="#cf8d2e"
            opacity="0.8"
          />
        </svg>

        {/* Name Above Wave */}
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-white text-xl font-bold">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
        </div>

        {/* Title Below Wave */}
        <div className="relative z-10 text-center mt-12">
          {data.position && (
            <p className="text-white text-xs">{data.position}</p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Grid 2x2 Layout */}
        <div className="grid grid-cols-2 gap-4 w-full h-full items-center justify-center">
          {data.email && (
            <div className="flex flex-col items-center gap-2">
              <Mail size={20} style={{ color: '#101820' }} />
              <span className="text-xs text-center text-gray-800">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex flex-col items-center gap-2">
              <Phone size={20} style={{ color: '#101820' }} />
              <span className="text-xs text-center text-gray-800">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex flex-col items-center gap-2">
              <MapPin size={20} style={{ color: '#cf8d2e' }} />
              <span className="text-xs text-center text-gray-800">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelWaveNightBlueOrange;
