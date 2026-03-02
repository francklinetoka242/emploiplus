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

interface BusinessCardModelTechTurquoiseProps {
  data: BusinessCardData;
}

const BusinessCardModelTechTurquoise: React.FC<BusinessCardModelTechTurquoiseProps> = ({ data }) => {
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
            borderLeft: '8px solid #2bb0ac',
          }}
        >
          {/* Nom et position */}
          <div>
            <div className="flex items-center gap-1">
              <p
                className="text-black font-bold text-lg"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {data.candidateName}
              </p>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#f39c12' }}
              />
            </div>
            <p
              className="text-sm mt-1"
              style={{
                color: '#2bb0ac',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
              }}
            >
              {data.position}
            </p>
          </div>

          {/* Coordonnées */}
          <div className="space-y-1 text-xs text-black">
            <div className="flex items-center gap-2">
              <Mail size={12} style={{ color: '#2bb0ac' }} />
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} style={{ color: '#2bb0ac' }} />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: '#2bb0ac' }} />
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-between"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#2bb0ac',
            padding: '20px',
          }}
        >
          {/* Texte et icônes en blanc */}
          <div className="text-white text-center">
            <p
              className="font-bold text-lg mb-3"
              style={{
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.candidateName}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-center gap-2">
                <Mail size={12} color="white" />
                <span>{data.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone size={12} color="white" />
                <span>{data.phone}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin size={12} color="white" />
                <span>{data.location}</span>
              </div>
            </div>
          </div>

          {/* QR Code placeholder en bas à droite */}
          <div
            className="absolute bottom-4 right-4 flex items-center justify-center bg-white rounded"
            style={{
              width: '50px',
              height: '50px',
              border: '2px solid white',
            }}
          >
            <QrCode size={30} style={{ color: '#2bb0ac' }} />
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelTechTurquoise;
