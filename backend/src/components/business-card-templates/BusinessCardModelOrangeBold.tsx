import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface BusinessCardModelOrangeBoldProps {
  data: BusinessCardData;
}

export const BusinessCardModelOrangeBold: React.FC<BusinessCardModelOrangeBoldProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#f39c12',
          margin: '5mm',
        }}
      >
        <h2
          className="text-center font-black"
          style={{
            color: '#1a1a1a',
            fontSize: '18pt',
            fontFamily: 'Archivo Black, sans-serif',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p
            className="text-xs mt-2"
            style={{
              color: '#1a1a1a',
            }}
          >
            {data.position}
          </p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-end justify-between p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
        }}
      >
        {/* Contact Icons Top */}
        <div className="flex gap-2 justify-center w-full mb-4">
          {data.phone && (
            <div
              className="flex items-center justify-center"
              style={{
                width: '8mm',
                height: '8mm',
                borderRadius: '50%',
                backgroundColor: '#f39c12',
              }}
            >
              <Phone size={10} style={{ color: '#ffffff' }} />
            </div>
          )}
          {data.email && (
            <div
              className="flex items-center justify-center"
              style={{
                width: '8mm',
                height: '8mm',
                borderRadius: '50%',
                backgroundColor: '#f39c12',
              }}
            >
              <Mail size={10} style={{ color: '#ffffff' }} />
            </div>
          )}
          {data.location && (
            <div
              className="flex items-center justify-center"
              style={{
                width: '8mm',
                height: '8mm',
                borderRadius: '50%',
                backgroundColor: '#f39c12',
              }}
            >
              <MapPin size={10} style={{ color: '#ffffff' }} />
            </div>
          )}
        </div>

        {/* White Box Bottom Right (40%) */}
        <div
          className="p-2"
          style={{
            backgroundColor: '#ffffff',
            width: '40%',
          }}
        >
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#1a1a1a' }}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelOrangeBold;
