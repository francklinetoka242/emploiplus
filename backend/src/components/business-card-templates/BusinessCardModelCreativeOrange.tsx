import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelCreativeOrangeProps {
  data: BusinessCardData;
}

export const BusinessCardModelCreativeOrange: React.FC<BusinessCardModelCreativeOrangeProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#f39c12',
          margin: '5mm',
        }}
      >
        <h2
          className="text-xl font-black text-center"
          style={{
            color: '#1a1a1a',
            letterSpacing: '0.05em',
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
        className="w-80 h-52 rounded-lg shadow-lg p-4 flex flex-col items-center justify-end"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
        }}
      >
        {/* Contact Icons */}
        <div className="flex gap-3 mb-4">
          {data.phone && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#f39c12',
              }}
            >
              <Phone size={14} style={{ color: '#1a1a1a' }} />
            </div>
          )}
          {data.email && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#f39c12',
              }}
            >
              <Mail size={14} style={{ color: '#1a1a1a' }} />
            </div>
          )}
          {data.location && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#f39c12',
              }}
            >
              <MapPin size={14} style={{ color: '#1a1a1a' }} />
            </div>
          )}
        </div>

        {/* Coordinates Block */}
        <div
          className="p-3 rounded text-xs text-center"
          style={{
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
          }}
        >
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelCreativeOrange;
