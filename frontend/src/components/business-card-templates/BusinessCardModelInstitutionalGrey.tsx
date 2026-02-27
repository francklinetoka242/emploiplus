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

interface BusinessCardModelInstitutionalGreyProps {
  data: BusinessCardData;
}

const BusinessCardModelInstitutionalGrey: React.FC<BusinessCardModelInstitutionalGreyProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '0',
            overflow: 'hidden',
          }}
        >
          {/* Bloc gris anthracite à gauche (20%) */}
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
            style={{
              width: '20%',
              backgroundColor: '#4a4a4a',
            }}
          />

          {/* Contenu à droite */}
          <div className="ml-auto w-4/5 flex flex-col items-center justify-center h-full px-6">
            <p
              className="text-black text-center font-bold"
              style={{
                fontSize: '20px',
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {data.candidateName}
            </p>
            <p
              className="text-black text-center text-sm mt-2"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
              }}
            >
              {data.position}
            </p>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#4a4a4a',
            padding: '20px',
          }}
        >
          {/* Nom */}
          <p
            className="text-white font-bold text-sm mb-3"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            {data.candidateName}
          </p>

          {/* Ligne fine horizontale blanche */}
          <div
            className="w-full h-px mb-3"
            style={{ backgroundColor: '#ffffff' }}
          />

          {/* Coordonnées */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail size={12} style={{ color: '#ffffff' }} />
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

            <div className="flex items-center gap-2">
              <Phone size={12} style={{ color: '#ffffff' }} />
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

            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: '#ffffff' }} />
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

export default BusinessCardModelInstitutionalGrey;
