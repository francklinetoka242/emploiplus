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

interface BusinessCardModelLuxeMinimalistProps {
  data: BusinessCardData;
}

export const BusinessCardModelLuxeMinimalist: React.FC<BusinessCardModelLuxeMinimalistProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          border: '1px solid #ffffff',
          margin: '5mm',
          fontFamily: 'Playfair Display, serif',
        }}
      >
        <h2
          className="text-white tracking-widest text-center text-2xl font-light"
          style={{
            letterSpacing: '0.15em',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p className="text-gray-400 text-xs mt-3 tracking-wider">
            {data.position}
          </p>
        )}
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
        <div className="flex flex-col gap-4 items-center w-full">
          {data.email && (
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-900" />
              <span className="text-xs text-gray-700">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-900" />
              <span className="text-xs text-gray-700">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-900" />
              <span className="text-xs text-gray-700">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelLuxeMinimalist;
