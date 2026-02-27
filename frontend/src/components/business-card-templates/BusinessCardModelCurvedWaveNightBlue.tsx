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

interface BusinessCardModelCurvedWaveNightBlueProps {
  data: BusinessCardData;
}

const BusinessCardModelCurvedWaveNightBlue: React.FC<BusinessCardModelCurvedWaveNightBlueProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#101820',
            padding: '20px',
          }}
        >
          {/* Nom blanc au-dessus */}
          <p
            className="text-white font-bold relative z-10"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'Roboto, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            {data.candidateName}
          </p>

          <p
            className="text-white relative z-10 text-sm mt-1 opacity-80"
            style={{
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {data.position}
          </p>

          {/* Courbe/Wave orange cuivré */}
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 340 215"
            preserveAspectRatio="none"
            style={{
              fill: '#cf8d2e',
            }}
          >
            <path d="M170,100 Q340,80 340,215 L0,215 L0,150 Q85,120 170,100 Z" />
          </svg>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Coordonnées avec titres orange cuivré */}
          <div className="space-y-4">
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{
                  color: '#cf8d2e',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                TÉLÉPHONE
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#101820',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {data.phone}
              </p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{
                  color: '#cf8d2e',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                EMAIL
              </p>
              <p
                className="text-xs break-all"
                style={{
                  color: '#101820',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {data.email}
              </p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{
                  color: '#cf8d2e',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                LOCALISATION
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#101820',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {data.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelCurvedWaveNightBlue;
