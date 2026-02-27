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

interface BusinessCardModelNavyGeometricIconProps {
  data: BusinessCardData;
}

const BusinessCardModelNavyGeometricIcon: React.FC<BusinessCardModelNavyGeometricIconProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center px-6"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#0a1d37',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Icône géométrique blanche coin supérieur droit */}
          <div
            className="absolute top-3 right-3"
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#ffffff',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}
          />

          {/* Nom en blanc, police Serif */}
          <p
            className="font-bold text-white text-center"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.5px',
            }}
          >
            {data.candidateName}
          </p>

          {/* Titre */}
          <p
            className="text-white text-center mt-2"
            style={{
              fontSize: '11px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 500,
            }}
          >
            {data.position}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
            borderTop: '5px solid #0a1d37',
            borderBottom: '5px solid #0a1d37',
            boxSizing: 'border-box',
          }}
        >
          {/* Coordonnées */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#0a1d37',
                }}
              >
                <Mail size={14} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#0a1d37',
                }}
              >
                <Phone size={14} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#0a1d37',
                }}
              >
                <MapPin size={14} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
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

export default BusinessCardModelNavyGeometricIcon;
