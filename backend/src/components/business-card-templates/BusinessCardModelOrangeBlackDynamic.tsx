import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface BusinessCardData {
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface BusinessCardModelOrangeBlackDynamicProps {
  data: BusinessCardData;
}

const BusinessCardModelOrangeBlackDynamic: React.FC<BusinessCardModelOrangeBlackDynamicProps> = ({ data }) => {
  const initials = data.candidateName
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO - Orange vif avec design dynamique */}
        <div
          className="flex-shrink-0 relative rounded overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
            background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
          }}
        >
          {/* Formes géométriques en arrière-plan */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '120px',
              height: '120px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
            }}
          />

          {/* Contenu au premier plan */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-white font-bold text-2xl uppercase tracking-wider">
              {data.candidateName}
            </p>
            <p className="text-white text-sm font-semibold mt-2 opacity-90">
              {data.position}
            </p>
          </div>

          {/* Accent noir en bas */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '2px',
              backgroundColor: '#1a1a1a',
              borderRadius: '1px',
            }}
          />
        </div>

        {/* VERSO - Noir avec détails orange */}
        <div
          className="flex-shrink-0 relative rounded"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#1a1a1a',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          {/* Bande orange verticale */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '4px',
              height: '100%',
              backgroundColor: '#ff8c42',
              borderRadius: '0 2px 2px 0',
            }}
          />

          <p className="text-white font-bold text-lg uppercase pl-4">
            {data.candidateName}
          </p>

          <div
            className="pl-4"
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: '#ff8c42',
            }}
          />

          <div className="space-y-3 text-white text-sm pl-4">
            <div className="flex items-center gap-3">
              <Mail size={16} style={{ color: '#ff8c42', flexShrink: 0 }} />
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} style={{ color: '#ff8c42', flexShrink: 0 }} />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} style={{ color: '#ff8c42', flexShrink: 0 }} />
              <span>{data.location}</span>
            </div>
            {data.website && (
              <div className="flex items-center gap-3">
                <Globe size={16} style={{ color: '#ff8c42', flexShrink: 0 }} />
                <span>{data.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelOrangeBlackDynamic;
