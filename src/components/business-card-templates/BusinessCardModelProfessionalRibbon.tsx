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

interface BusinessCardModelProfessionalRibbonProps {
  data: BusinessCardData;
}

export const BusinessCardModelProfessionalRibbon: React.FC<BusinessCardModelProfessionalRibbonProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="relative w-80 h-52 rounded-lg shadow-lg flex items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#7f8c8d',
          margin: '5mm',
        }}
      >
        {/* Dark Gray Ribbon */}
        <div
          className="absolute h-14 w-full flex items-center pl-6"
          style={{
            backgroundColor: '#2c3e50',
          }}
        >
          <h2 className="text-white text-lg font-bold">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-end justify-center gap-3"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Contact Info Blocks on Right */}
        {data.email && (
          <div
            className="flex items-center gap-2 pl-3 pr-3 py-2 rounded text-white text-xs w-32"
            style={{
              backgroundColor: '#2c3e50',
            }}
          >
            <Mail size={14} />
            <span className="truncate">{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div
            className="flex items-center gap-2 pl-3 pr-3 py-2 rounded text-white text-xs w-32"
            style={{
              backgroundColor: '#2c3e50',
            }}
          >
            <Phone size={14} />
            <span className="truncate">{data.phone}</span>
          </div>
        )}
        {data.location && (
          <div
            className="flex items-center gap-2 pl-3 pr-3 py-2 rounded text-white text-xs w-32"
            style={{
              backgroundColor: '#2c3e50',
            }}
          >
            <MapPin size={14} />
            <span className="truncate">{data.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCardModelProfessionalRibbon;
