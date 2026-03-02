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

interface BusinessCardModelHighEndMinimalistProps {
  data: BusinessCardData;
}

const BusinessCardModelHighEndMinimalist: React.FC<BusinessCardModelHighEndMinimalistProps> = ({ data }) => {
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
            backgroundColor: '#ffffff',
            padding: '30px',
          }}
        >
          {/* Nom et titre séparés par ligne verticale */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p
                className="font-bold text-lg"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                {data.candidateName}
              </p>
            </div>

            {/* Ligne verticale séparatrice */}
            <div
              className="h-12"
              style={{
                width: '2px',
                backgroundColor: '#e67e22',
              }}
            />

            {/* Titre */}
            <div className="flex-1">
              <p
                className="text-sm"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {data.position}
              </p>
            </div>
          </div>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#f2f2f2',
            padding: '30px',
          }}
        >
          {/* Coordonnées centrées */}
          <div className="space-y-3 text-center">
            <div>
              <p
                className="text-xs font-semibold mb-1 tracking-widest"
                style={{
                  color: '#e67e22',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '2px',
                }}
              >
                EMAIL
              </p>
              <p
                className="text-xs break-all"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.email}
              </p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1 tracking-widest"
                style={{
                  color: '#e67e22',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '2px',
                }}
              >
                TÉLÉPHONE
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.phone}
              </p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1 tracking-widest"
                style={{
                  color: '#e67e22',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  letterSpacing: '2px',
                }}
              >
                LOCALISATION
              </p>
              <p
                className="text-xs"
                style={{
                  color: '#333333',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}
              >
                {data.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelHighEndMinimalist;
