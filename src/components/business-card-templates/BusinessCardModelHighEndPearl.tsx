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

interface BusinessCardModelHighEndPearlProps {
  data: BusinessCardData;
}

export const BusinessCardModelHighEndPearl: React.FC<BusinessCardModelHighEndPearlProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          border: '8px solid #dcdde1',
        }}
      >
        <h2
          className="text-lg font-bold text-center"
          style={{
            color: '#000000',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p
            className="text-xs mt-3"
            style={{
              color: '#fbc531',
              borderTop: '2px solid #fbc531',
              paddingTop: '8px',
              width: '80%',
              textAlign: 'center',
            }}
          >
            {data.position}
          </p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#dcdde1',
          margin: '5mm',
        }}
      >
        <div className="flex flex-col gap-3 items-center w-full">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}
        </div>

        {/* QR Code Placeholder */}
        <div
          className="absolute bottom-2 right-2 w-12 h-12 border border-black flex items-center justify-center bg-white"
        >
          <span className="text-xs text-gray-600">QR</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelHighEndPearl;
