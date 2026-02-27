import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface BusinessCardModelWaveNightBlueProps {
  data: BusinessCardData;
}

const BusinessCardModelWaveNightBlue: React.FC<BusinessCardModelWaveNightBlueProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-between overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#101820',
            padding: '20px',
          }}
        >
          {/* Nom aligné à gauche en blanc */}
          <div>
            <p
              className="text-white font-bold text-left"
              style={{
                fontSize: '22px',
                fontWeight: 700,
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.candidateName}
            </p>
          </div>

          {/* Vague orange cuivré */}
          <svg
            className="absolute bottom-0 right-0 w-full h-24"
            viewBox="0 0 340 100"
            preserveAspectRatio="none"
            style={{
              fill: '#cf8d2e',
            }}
          >
            <path d="M0,50 Q85,30 170,50 T340,50 L340,100 L0,100 Z" />
          </svg>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center gap-3"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Capsules avec coordonnées */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: '#101820',
            }}
          >
            <Mail size={14} style={{ color: '#cf8d2e' }} />
            <span
              className="text-xs"
              style={{
                color: '#ffffff',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.email}
            </span>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: '#101820',
            }}
          >
            <Phone size={14} style={{ color: '#cf8d2e' }} />
            <span
              className="text-xs"
              style={{
                color: '#ffffff',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.phone}
            </span>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: '#101820',
            }}
          >
            <MapPin size={14} style={{ color: '#cf8d2e' }} />
            <span
              className="text-xs"
              style={{
                color: '#ffffff',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.location}
            </span>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelWaveNightBlue;
