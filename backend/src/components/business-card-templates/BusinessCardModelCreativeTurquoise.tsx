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

interface BusinessCardModelCreativeTurquoiseProps {
  data: BusinessCardData;
}

export const BusinessCardModelCreativeTurquoise: React.FC<BusinessCardModelCreativeTurquoiseProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Name in Cursive */}
        <h2
          className="text-white text-xl text-center mb-3"
          style={{
            fontFamily: 'Brush Script MT, cursive',
            fontStyle: 'italic',
          }}
        >
          {data.candidateName || 'Nom Candidat'}
        </h2>

        {/* Turquoise Underline */}
        <div
          className="w-20 h-0.5"
          style={{
            backgroundColor: '#2bb0ac',
          }}
        ></div>

        {data.position && (
          <p className="text-gray-400 text-xs mt-2">{data.position}</p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          borderLeft: '4px solid #2bb0ac',
        }}
      >
        {/* Left Vertical Bar is handled by borderLeft */}

        <div className="flex flex-col gap-3 w-full pl-4">
          {data.email && (
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#2bb0ac',
                }}
              ></span>
              <span className="text-xs text-gray-800">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#2bb0ac',
                }}
              ></span>
              <span className="text-xs text-gray-800">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#2bb0ac',
                }}
              ></span>
              <span className="text-xs text-gray-800">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelCreativeTurquoise;
