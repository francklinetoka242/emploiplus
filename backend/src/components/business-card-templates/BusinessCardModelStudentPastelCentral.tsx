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

interface BusinessCardModelStudentPastelCentralProps {
  data: BusinessCardData;
}

export const BusinessCardModelStudentPastelCentral: React.FC<BusinessCardModelStudentPastelCentralProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#fce4ec',
          margin: '5mm',
        }}
      >
        {/* Central Black Rectangle */}
        <div
          className="px-6 py-3 flex items-center justify-center"
          style={{
            backgroundColor: '#000000',
          }}
        >
          <h2 className="text-white text-lg font-bold text-center">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
        </div>
        {data.position && (
          <p className="text-xs mt-3" style={{ color: '#000000' }}>
            {data.position}
          </p>
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
          border: '10px solid #fce4ec',
        }}
      >
        <div className="flex flex-col gap-3 items-center text-center">
          {data.email && (
            <span className="text-xs text-gray-900">{data.email}</span>
          )}
          {data.phone && (
            <span className="text-xs text-gray-900">{data.phone}</span>
          )}
          {data.location && (
            <span className="text-xs text-gray-900">{data.location}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelStudentPastelCentral;
