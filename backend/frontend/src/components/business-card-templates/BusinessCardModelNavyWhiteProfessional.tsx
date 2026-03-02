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

interface BusinessCardModelNavyWhiteProfessionalProps {
  data: BusinessCardData;
}

const BusinessCardModelNavyWhiteProfessional: React.FC<BusinessCardModelNavyWhiteProfessionalProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-between"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Nom en haut à gauche en bleu marine */}
          <div>
            <p
              className="font-bold"
              style={{
                color: '#000080',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              {data.candidateName}
            </p>
            <p
              className="text-sm mt-1"
              style={{
                color: '#000080',
                fontSize: '11px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {data.position}
            </p>
          </div>

          {/* Bandeau bleu marine (tiers inférieur) */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
            style={{
              height: '33.33%',
              backgroundColor: '#000080',
              width: '100%',
              paddingBottom: '20px',
            }}
          >
            <p
              className="text-xs text-white text-center"
              style={{
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '10px',
              }}
            >
              {data.website || 'www.emploi-connect.fr'}
            </p>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#000080',
            padding: '20px',
          }}
        >
          {/* Coordonnées en blanc */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="font-bold text-sm"
                style={{
                  color: '#b0b0b0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                T:
              </span>
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="font-bold text-sm"
                style={{
                  color: '#b0b0b0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                E:
              </span>
              <span
                className="text-xs break-all"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="font-bold text-sm"
                style={{
                  color: '#b0b0b0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                L:
              </span>
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
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

export default BusinessCardModelNavyWhiteProfessional;
