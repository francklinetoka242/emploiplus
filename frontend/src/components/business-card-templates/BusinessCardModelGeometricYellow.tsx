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

interface BusinessCardModelGeometricYellowProps {
  data: BusinessCardData;
}

const BusinessCardModelGeometricYellow: React.FC<BusinessCardModelGeometricYellowProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#2d3436',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Triangle jaune dans le coin supérieur droit */}
          <div
            className="absolute top-0 right-0"
            style={{
              width: '0',
              height: '0',
              borderLeftWidth: '80px',
              borderLeftStyle: 'solid',
              borderLeftColor: 'transparent',
              borderTopWidth: '80px',
              borderTopStyle: 'solid',
              borderTopColor: '#f39c12',
            }}
          />

          {/* Texte: Nom et position */}
          <div className="relative z-10">
            <p
              className="text-white font-bold uppercase tracking-wider"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {data.candidateName}
            </p>
            <p
              className="mt-2 uppercase tracking-wider"
              style={{
                color: '#f39c12',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
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
            backgroundColor: '#f2f2f2',
            padding: '20px',
          }}
        >
          {/* Informations séparées par des lignes verticales jaunes */}
          <div className="space-y-3 text-sm text-gray-800">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={14} style={{ color: '#2d3436' }} />
              <span className="flex-1">{data.email}</span>
              <div
                className="w-0.5 h-6"
                style={{ backgroundColor: '#f39c12' }}
              />
            </div>

            {/* Téléphone */}
            <div className="flex items-center gap-3">
              <Phone size={14} style={{ color: '#2d3436' }} />
              <span className="flex-1">{data.phone}</span>
              <div
                className="w-0.5 h-6"
                style={{ backgroundColor: '#f39c12' }}
              />
            </div>

            {/* Localisation */}
            <div className="flex items-center gap-3">
              <MapPin size={14} style={{ color: '#2d3436' }} />
              <span>{data.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelGeometricYellow;
