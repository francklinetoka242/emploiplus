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

interface BusinessCardModelDynamicOrangeDiagonalProps {
  data: BusinessCardData;
}

export const BusinessCardModelDynamicOrangeDiagonal: React.FC<BusinessCardModelDynamicOrangeDiagonalProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg relative overflow-hidden flex items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          margin: '5mm',
          fontFamily: 'Oswald, sans-serif',
        }}
      >
        {/* Black Top Half */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#1a1a1a',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }}
        ></div>

        {/* Orange Bottom Half */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#f39c12',
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        ></div>

        {/* Name */}
        <h2
          className="relative z-10 text-white text-xl font-bold text-center"
          style={{
            fontFamily: 'Oswald, sans-serif',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          borderRight: '4px solid #f39c12',
          fontFamily: 'Oswald, sans-serif',
        }}
      >
        <div className="flex flex-col gap-3 items-center w-full">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: '#f39c12' }} />
              <span className="text-xs text-gray-800">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: '#f39c12' }} />
              <span className="text-xs text-gray-800">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#f39c12' }} />
              <span className="text-xs text-gray-800">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelDynamicOrangeDiagonal;
