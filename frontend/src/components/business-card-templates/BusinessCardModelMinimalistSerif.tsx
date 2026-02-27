import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface BusinessCardModelMinimalistSerifProps {
  data: BusinessCardData;
}

export const BusinessCardModelMinimalistSerif: React.FC<BusinessCardModelMinimalistSerifProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex overflow-hidden"
        style={{
          width: '85mm',
          height: '55mm',
          margin: '5mm',
        }}
      >
        {/* Black Bar Left (25%) */}
        <div
          style={{
            width: '25%',
            backgroundColor: '#1a1a1a',
          }}
        ></div>

        {/* White Zone (75%) */}
        <div
          className="flex-1 flex items-center justify-center p-4"
          style={{
            backgroundColor: '#ffffff',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          <h2
            className="text-center"
            style={{
              color: '#4a4a4a',
              fontSize: '14pt',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
          paddingLeft: '10mm',
          paddingRight: '10mm',
        }}
      >
        {/* Top Line */}
        <div
          className="mb-4"
          style={{
            height: '2px',
            backgroundColor: '#4a4a4a',
          }}
        ></div>

        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={12} style={{ color: '#4a4a4a' }} />
              <span className="text-xs text-white">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={12} style={{ color: '#4a4a4a' }} />
              <span className="text-xs text-white">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: '#4a4a4a' }} />
              <span className="text-xs text-white">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelMinimalistSerif;
