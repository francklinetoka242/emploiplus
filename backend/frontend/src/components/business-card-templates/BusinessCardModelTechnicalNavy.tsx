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

interface BusinessCardModelTechnicalNavyProps {
  data: BusinessCardData;
}

export const BusinessCardModelTechnicalNavy: React.FC<BusinessCardModelTechnicalNavyProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex items-center p-4 relative overflow-hidden"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#000080',
          margin: '5mm',
          backgroundImage: `radial-gradient(circle, #999999 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      >
        {/* Name */}
        <h2 className="text-white text-lg font-bold relative z-10">
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p className="text-gray-300 text-xs relative z-10">{data.position}</p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        <div className="flex flex-col gap-2 w-full">
          {data.email && (
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #999999' }}>
              <div
                className="w-3 h-3"
                style={{
                  backgroundColor: '#000080',
                }}
              ></div>
              <span className="text-xs text-gray-900">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid #999999' }}>
              <div
                className="w-3 h-3"
                style={{
                  backgroundColor: '#000080',
                }}
              ></div>
              <span className="text-xs text-gray-900">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2 pb-2">
              <div
                className="w-3 h-3"
                style={{
                  backgroundColor: '#000080',
                }}
              ></div>
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelTechnicalNavy;
