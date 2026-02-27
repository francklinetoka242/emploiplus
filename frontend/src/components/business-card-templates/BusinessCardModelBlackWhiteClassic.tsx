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

interface BusinessCardModelBlackWhiteClassicProps {
  data: BusinessCardData;
}

const BusinessCardModelBlackWhiteClassic: React.FC<BusinessCardModelBlackWhiteClassicProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#1a1a1a',
            padding: '20px',
          }}
        >
          {/* Nom centré en blanc */}
          <p
            className="text-white font-bold text-center"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            {data.candidateName.toUpperCase()}
          </p>

          {/* Titre en gris moyen avec tracking */}
          <p
            className="text-center mt-3 tracking-widest"
            style={{
              color: '#757575',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '2px',
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
          }}
        >
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={16} style={{ color: '#1a1a1a', flexShrink: 0 }} />
              <div
                className="w-0.5 h-6"
                style={{ backgroundColor: '#1a1a1a', margin: '0 8px' }}
              />
              <span className="text-xs text-gray-800">{data.email}</span>
            </div>

            {/* Téléphone */}
            <div className="flex items-center gap-3">
              <Phone size={16} style={{ color: '#1a1a1a', flexShrink: 0 }} />
              <div
                className="w-0.5 h-6"
                style={{ backgroundColor: '#1a1a1a', margin: '0 8px' }}
              />
              <span className="text-xs text-gray-800">{data.phone}</span>
            </div>

            {/* Localisation */}
            <div className="flex items-center gap-3">
              <MapPin size={16} style={{ color: '#1a1a1a', flexShrink: 0 }} />
              <div
                className="w-0.5 h-6"
                style={{ backgroundColor: '#1a1a1a', margin: '0 8px' }}
              />
              <span className="text-xs text-gray-800">{data.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelBlackWhiteClassic;
