import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Globe } from 'lucide-react';

interface BusinessCardData {
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface BusinessCardModelTurquoiseOrangeDynamicProps {
  data: BusinessCardData;
}

const BusinessCardModelTurquoiseOrangeDynamic: React.FC<BusinessCardModelTurquoiseOrangeDynamicProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center border-b-8"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#2bb0ac',
            padding: '20px',
            borderBottomColor: '#f39c12',
          }}
        >
          {/* Nom en blanc avec point orange */}
          <div className="flex items-center justify-center gap-1">
            <p
              className="text-white text-center font-bold"
              style={{
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              {data.candidateName}
            </p>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#f39c12' }}
            />
          </div>

          {/* Titre */}
          <p
            className="text-center mt-2"
            style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {data.position}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col justify-center gap-3"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
          }}
        >
          {/* Icônes de contact circulaires */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#2bb0ac',
              }}
            >
              <MessageCircle size={16} style={{ color: '#ffffff' }} />
            </div>
            <span
              className="text-xs"
              style={{
                color: '#2bb0ac',
                fontFamily: 'Roboto, sans-serif',
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
              <Mail size={16} style={{ color: '#ffffff' }} />
            </div>
            <span
              className="text-xs"
              style={{
                color: '#2bb0ac',
                fontFamily: 'Roboto, sans-serif',
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
              <MapPin size={16} style={{ color: '#ffffff' }} />
            </div>
            <span
              className="text-xs"
              style={{
                color: '#2bb0ac',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {data.location}
            </span>
          </div>

          {data.website && (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2bb0ac',
                }}
              >
                <Globe size={16} style={{ color: '#ffffff' }} />
              </div>
              <span
                className="text-xs"
                style={{
                  color: '#2bb0ac',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                {data.website}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelTurquoiseOrangeDynamic;
