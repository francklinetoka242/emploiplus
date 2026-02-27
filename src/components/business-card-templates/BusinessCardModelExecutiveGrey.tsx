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

interface BusinessCardModelExecutiveGreyProps {
  data: BusinessCardData;
}

export const BusinessCardModelExecutiveGrey: React.FC<BusinessCardModelExecutiveGreyProps> = ({ data }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex items-center p-4 gap-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#4a4a4a',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* White Square with Initials */}
        <div
          className="w-16 h-16 flex-shrink-0 flex items-center justify-center"
          style={{
            backgroundColor: '#ffffff',
          }}
        >
          <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '18px' }}>
            {getInitials(data.candidateName || 'AB')}
          </span>
        </div>

        {/* Name on Right */}
        <div>
          <h2 className="text-white text-lg font-bold">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p className="text-gray-300 text-xs mt-1">{data.position}</p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top Bar */}
        <div
          className="h-1 mb-4"
          style={{
            backgroundColor: '#4a4a4a',
          }}
        ></div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3">
          {data.email && (
            <div className="flex items-center gap-3">
              <Mail size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-3">
              <Phone size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-3">
              <MapPin size={14} style={{ color: '#000000' }} />
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelExecutiveGrey;
