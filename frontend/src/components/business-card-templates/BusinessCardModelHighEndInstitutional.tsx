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

interface BusinessCardModelHighEndInstitutionalProps {
  data: BusinessCardData;
}

export const BusinessCardModelHighEndInstitutional: React.FC<BusinessCardModelHighEndInstitutionalProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          border: '2px solid #0a1d37',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Blue Marine Frame Effect */}
        <h2
          className="text-lg font-bold text-center"
          style={{
            color: '#0a1d37',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p
            className="text-xs mt-2 text-center"
            style={{
              color: '#fbc531',
            }}
          >
            {data.position}
          </p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#0a1d37',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div className="flex flex-col items-center gap-3 text-white">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span className="text-xs">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span className="text-xs">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span className="text-xs">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelHighEndInstitutional;
