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

interface BusinessCardModelYellowTriangleProps {
  data: BusinessCardData;
}

const BusinessCardModelYellowTriangle: React.FC<BusinessCardModelYellowTriangleProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#2d3436',
            padding: '20px',
          }}
        >
          {/* Triangle jaune coin supérieur droit */}
          <div
            className="absolute top-0 right-0"
            style={{
              width: '0',
              height: '0',
              borderLeftWidth: '100px',
              borderLeftStyle: 'solid',
              borderLeftColor: 'transparent',
              borderTopWidth: '100px',
              borderTopStyle: 'solid',
              borderTopColor: '#f39c12',
            }}
          />

          {/* Nom au centre en blanc */}
          <p
            className="text-white text-center font-bold relative z-10"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '1px',
            }}
          >
            {data.candidateName.toUpperCase()}
          </p>

          {/* Titre en jaune */}
          <p
            className="text-center mt-3 relative z-10"
            style={{
              color: '#f39c12',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '1px',
            }}
          >
            {data.position.toUpperCase()}
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
            borderLeft: '8px solid #f39c12',
          }}
        >
          {/* Coordonnées */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={14} style={{ color: '#2d3436' }} />
              <span
                className="text-xs"
                style={{
                  color: '#2d3436',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={14} style={{ color: '#2d3436' }} />
              <span
                className="text-xs"
                style={{
                  color: '#2d3436',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={14} style={{ color: '#2d3436' }} />
              <span
                className="text-xs"
                style={{
                  color: '#2d3436',
                  fontFamily: 'Montserrat, sans-serif',
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

export default BusinessCardModelYellowTriangle;
