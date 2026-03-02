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

interface BusinessCardModelPinkPastelStudentProps {
  data: BusinessCardData;
}

const BusinessCardModelPinkPastelStudent: React.FC<BusinessCardModelPinkPastelStudentProps> = ({ data }) => {
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
            backgroundColor: '#fce4ec',
            padding: '20px',
          }}
        >
          {/* Nom dans un rectangle noir */}
          <div
            className="flex items-center justify-center px-8 py-3 rounded-sm"
            style={{
              backgroundColor: '#000000',
              marginBottom: '12px',
            }}
          >
            <p
              className="text-white text-center font-bold"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '0.5px',
              }}
            >
              {data.candidateName.toUpperCase()}
            </p>
          </div>

          {/* Titre en gris foncé */}
          <p
            className="text-center text-sm"
            style={{
              color: '#333333',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {data.position}
          </p>
        </div>

        {/* VERSO */}
        <div
          className="flex-shrink-0 relative rounded flex flex-col items-center justify-center"
          style={{
            width: '340px',
            height: '215px',
            backgroundColor: '#ffffff',
            padding: '20px',
            border: '10px solid #fce4ec',
            boxSizing: 'border-box',
          }}
        >
          {/* Coordonnées centrées */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Mail size={14} style={{ color: '#000000' }} />
              <span
                className="text-xs"
                style={{
                  color: '#000000',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {data.email}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Phone size={14} style={{ color: '#000000' }} />
              <span
                className="text-xs"
                style={{
                  color: '#000000',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {data.phone}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <MapPin size={14} style={{ color: '#000000' }} />
              <span
                className="text-xs"
                style={{
                  color: '#000000',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {data.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions de référence */}
      <p className="text-xs text-gray-500 text-center mt-4">85x55mm (Recto-Verso)</p>
    </div>
  );
};

export default BusinessCardModelPinkPastelStudent;
