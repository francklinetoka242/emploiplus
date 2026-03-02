import React from 'react';
import { Mail, Phone, MapPin, QrCode } from 'lucide-react';

interface BusinessCardData {
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface BusinessCardModelTechStartupBicolorProps {
  data: BusinessCardData;
}

const BusinessCardModelTechStartupBicolor: React.FC<BusinessCardModelTechStartupBicolorProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center border-b-2"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#2bb0ac',
            padding: '20px',
            borderBottomWidth: '10px',
            borderBottomColor: '#f39c12',
          }}
        >
          {/* Nom centré en blanc, extra-grasse */}
          <p
            className="text-white text-center font-black"
            style={{
              fontSize: '26px',
              fontWeight: 900,
              fontFamily: 'Inter, Roboto, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            {data.candidateName.toUpperCase()}
          </p>

          {/* Titre */}
          <p
            className="text-center mt-3 opacity-90"
            style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter, Roboto, sans-serif',
            }}
          >
            {data.position}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-between"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Coordonnées avec icônes circulaires turquoise */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2bb0ac',
                }}
              >
                <Mail size={16} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#2f3640',
                  fontFamily: 'Inter, Roboto, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2bb0ac',
                }}
              >
                <Phone size={16} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#2f3640',
                  fontFamily: 'Inter, Roboto, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2bb0ac',
                }}
              >
                <MapPin size={16} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#2f3640',
                  fontFamily: 'Inter, Roboto, sans-serif',
                }}
              >
                {data.location}
              </span>
            </div>
          </div>

          {/* Espace QR code avec bordure orange */}
          <div
            className="absolute bottom-4 right-4 flex items-center justify-center bg-gray-50 rounded"
            style={{
              width: '50px',
              height: '50px',
              border: '2px solid #f39c12',
            }}
          >
            <QrCode size={28} style={{ color: '#2bb0ac' }} />
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelTechStartupBicolor;
