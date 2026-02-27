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

interface BusinessCardModelEarthToneProps {
  data: BusinessCardData;
}

export const BusinessCardModelEarthTone: React.FC<BusinessCardModelEarthToneProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-end justify-end p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#fdf6ec',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h2
          className="text-lg font-bold"
          style={{
            color: '#3e2723',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p
            className="text-xs mt-1"
            style={{
              color: '#b7410e',
            }}
          >
            {data.position}
          </p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Terracotta Circle Top Left */}
        <div
          className="absolute top-0 left-0 rounded-full"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#b7410e',
          }}
        ></div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3 items-center z-10">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: '#3e2723' }} />
              <span className="text-xs text-gray-900">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: '#3e2723' }} />
              <span className="text-xs text-gray-900">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#3e2723' }} />
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelEarthTone;
