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

interface BusinessCardModelBlackOrangeProps {
  data: BusinessCardData;
}

const BusinessCardModelBlackOrange: React.FC<BusinessCardModelBlackOrangeProps> = ({ data }) => {
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
          className="flex-shrink-0 relative bg-black rounded"
          style={{
            width: '340px',
            height: '215px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Carré gris anthracite avec initiales */}
          <div
            className="flex items-center justify-center text-white font-bold rounded"
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#4a4a4a',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {/* Texte: Nom et position */}
          <div className="flex-1">
            <p className="text-white font-bold text-lg uppercase tracking-wider">
              {data.candidateName}
            </p>
            <p className="text-orange-400 text-sm font-semibold mt-2">
              {data.position}
            </p>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative bg-white border-l-8 rounded"
          style={{
            width: '340px',
            height: '215px',
            padding: '20px',
            borderLeftColor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p className="text-black font-bold text-lg uppercase mb-1">
            {data.candidateName}
          </p>
          <div
            className="w-12 h-0.5 mb-4"
            style={{ backgroundColor: '#fbc531' }}
          />

          <div className="space-y-2 text-sm text-black">
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: '#1a1a1a' }} />
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: '#1a1a1a' }} />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#1a1a1a' }} />
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

export default BusinessCardModelBlackOrange;
