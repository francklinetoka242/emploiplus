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

interface BusinessCardModelAnthraciteWhiteDividedProps {
  data: BusinessCardData;
}

const BusinessCardModelAnthraciteWhiteDivided: React.FC<BusinessCardModelAnthraciteWhiteDividedProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex items-center overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '0',
          }}
        >
          {/* Bloc noir gauche (30%) */}
          <div
            className="flex-shrink-0"
            style={{
              width: '30%',
              height: '100%',
              backgroundColor: '#1a1a1a',
            }}
          />

          {/* Contenu blanc droit (70%) */}
          <div
            className="flex-1 flex flex-col justify-center px-6"
            style={{
              backgroundColor: '#ffffff',
            }}
          >
            <p
              className="font-bold text-lg"
              style={{
                color: '#4a4a4a',
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              {data.candidateName}
            </p>
            <div
              className="w-12 h-px my-2"
              style={{ backgroundColor: '#1a1a1a' }}
            />
            <p
              className="text-sm"
              style={{
                color: '#4a4a4a',
                fontFamily: 'Arial, sans-serif',
                fontSize: '11px',
              }}
            >
              {data.position}
            </p>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center border-t-4"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderTopColor: '#4a4a4a',
          }}
        >
          {/* Coordonnées */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={14} style={{ color: '#ffffff' }} />
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={14} style={{ color: '#ffffff' }} />
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={14} style={{ color: '#ffffff' }} />
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {data.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelAnthraciteWhiteDivided;
