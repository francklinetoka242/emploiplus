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

interface BusinessCardModelOrangeVibrantUrbanProps {
  data: BusinessCardData;
}

const BusinessCardModelOrangeVibrantUrban: React.FC<BusinessCardModelOrangeVibrantUrbanProps> = ({ data }) => {
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
            backgroundColor: '#f39c12',
            padding: '20px',
          }}
        >
          {/* Nom noir avec contour blanc */}
          <p
            className="text-center font-black"
            style={{
              color: '#1a1a1a',
              fontSize: '28px',
              fontWeight: 900,
              fontFamily: 'Montserrat, Oswald, sans-serif',
              textShadow: '1px 1px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(255,255,255,0.3)',
              letterSpacing: '1px',
            }}
          >
            {data.candidateName.toUpperCase()}
          </p>

          {/* Titre */}
          <p
            className="text-center mt-3"
            style={{
              color: '#1a1a1a',
              fontSize: '12px',
              fontFamily: 'Montserrat, Oswald, sans-serif',
              fontWeight: 600,
            }}
          >
            {data.position}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center items-end"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#1a1a1a',
            padding: '20px',
          }}
        >
          {/* Coordonnées alignées à droite */}
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-end gap-3">
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {data.email}
              </span>
              <div
                className="flex items-center justify-center flex-shrink-0 rounded"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <Mail size={14} style={{ color: '#1a1a1a' }} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {data.phone}
              </span>
              <div
                className="flex items-center justify-center flex-shrink-0 rounded"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <Phone size={14} style={{ color: '#1a1a1a' }} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <span
                className="text-xs"
                style={{
                  color: '#ffffff',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {data.location}
              </span>
              <div
                className="flex items-center justify-center flex-shrink-0 rounded"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <MapPin size={14} style={{ color: '#1a1a1a' }} />
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

export default BusinessCardModelOrangeVibrantUrban;
