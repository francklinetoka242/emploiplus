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

interface BusinessCardModelProfessionalSeparationLineProps {
  data: BusinessCardData;
}

const BusinessCardModelProfessionalSeparationLine: React.FC<BusinessCardModelProfessionalSeparationLineProps> = ({ data }) => {
  const initials = data.candidateName
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex items-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#dcdde1',
            padding: '0',
            overflow: 'hidden',
          }}
        >
          {/* Gauche: Initiales */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '40%',
              height: '100%',
              backgroundColor: '#dcdde1',
            }}
          >
            <p
              className="text-center font-black"
              style={{
                fontSize: '48px',
                color: '#2f3640',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 900,
              }}
            >
              {initials}
            </p>
          </div>

          {/* Ligne verticale noire séparatrice */}
          <div
            className="w-1"
            style={{
              backgroundColor: '#2f3640',
              height: '60%',
            }}
          />

          {/* Droite: Nom et titre */}
          <div
            className="flex-1 flex flex-col items-start justify-center px-4"
            style={{
              backgroundColor: '#dcdde1',
            }}
          >
            <p
              className="font-bold text-sm"
              style={{
                color: '#2f3640',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '13px',
              }}
            >
              {data.candidateName}
            </p>
            <p
              className="text-xs mt-1"
              style={{
                color: '#fbc531',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '10px',
                fontWeight: 500,
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
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Contenu avec ligne pointillée verticale noire */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: '#fbc531' }}
              />
              <div className="flex-1 border-b border-dashed border-black pb-2">
                <p className="text-xs font-semibold text-black mb-0.5">EMAIL</p>
                <p className="text-xs text-black break-all">{data.email}</p>
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: '#fbc531' }}
              />
              <div className="flex-1 border-b border-dashed border-black pb-2">
                <p className="text-xs font-semibold text-black mb-0.5">TÉLÉPHONE</p>
                <p className="text-xs text-black">{data.phone}</p>
              </div>
            </div>

            {/* Localisation */}
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: '#fbc531' }}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-black mb-0.5">LOCALISATION</p>
                <p className="text-xs text-black">{data.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelProfessionalSeparationLine;
