import React from 'react';
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from 'lucide-react';

interface BusinessCardData {
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface BusinessCardModelOrangeDynamicProps {
  data: BusinessCardData;
}

const BusinessCardModelOrangeDynamic: React.FC<BusinessCardModelOrangeDynamicProps> = ({ data }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg">
      {/* Container pour la carte recto-verso */}
      <div className="flex gap-4 justify-center">
        {/* RECTO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center text-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#f39c12',
            padding: '20px',
          }}
        >
          {/* Icônes aux coins */}
          <Facebook
            size={16}
            style={{
              color: '#1a1a1a',
              position: 'absolute',
              top: '10px',
              left: '10px',
            }}
          />
          <Twitter
            size={16}
            style={{
              color: '#1a1a1a',
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          />
          <Linkedin
            size={16}
            style={{
              color: '#1a1a1a',
              position: 'absolute',
              bottom: '10px',
              right: '10px',
            }}
          />

          {/* Nom au centre */}
          <p
            className="font-black text-center"
            style={{
              color: '#1a1a1a',
              fontSize: '28px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              letterSpacing: '2px',
            }}
          >
            {data.candidateName.toUpperCase()}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col overflow-hidden"
          style={{
            width: '340px',
            height: '215px',
          }}
        >
          {/* Haut noir (30%) */}
          <div
            className="flex items-center justify-center flex-1"
            style={{
              backgroundColor: '#1a1a1a',
              height: '30%',
              padding: '15px',
            }}
          >
            <p
              className="text-white font-bold text-center"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '16px',
              }}
            >
              {data.candidateName}
            </p>
          </div>

          {/* Bas blanc (70%) */}
          <div
            className="flex flex-col justify-center flex-1 gap-3"
            style={{
              backgroundColor: '#ffffff',
              height: '70%',
              padding: '15px',
            }}
          >
            {/* Icônes de contact circulaires */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <Mail size={14} style={{ color: '#1a1a1a' }} />
              </div>
              <span className="text-xs text-black">{data.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <Phone size={14} style={{ color: '#1a1a1a' }} />
              </div>
              <span className="text-xs text-black">{data.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#f39c12',
                }}
              >
                <MapPin size={14} style={{ color: '#1a1a1a' }} />
              </div>
              <span className="text-xs text-black">{data.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelOrangeDynamic;
