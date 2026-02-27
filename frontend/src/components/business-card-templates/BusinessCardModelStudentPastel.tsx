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

interface BusinessCardModelStudentPastelProps {
  data: BusinessCardData;
}

export const BusinessCardModelStudentPastel: React.FC<BusinessCardModelStudentPastelProps> = ({ data }) => {
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
        }}
      >
        {/* Top Border */}
        <div
          className="w-full h-1 mb-4"
          style={{
            backgroundColor: '#000000',
          }}
        ></div>

        {/* Name */}
        <h2 className="text-black text-lg font-bold text-center mb-2">
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>

        {/* Bottom Border */}
        <div
          className="w-full h-1 mb-4"
          style={{
            backgroundColor: '#000000',
          }}
        ></div>

        {/* Student Title */}
        <p
          className="text-xs font-light"
          style={{
            color: '#fce4ec',
          }}
        >
          ÉTUDIANT
        </p>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#fce4ec',
          margin: '5mm',
        }}
      >
        {/* White Block */}
        <div
          className="p-4 flex flex-col gap-2 items-center"
          style={{
            backgroundColor: '#ffffff',
          }}
        >
          {data.email && (
            <span className="text-xs text-gray-800">{data.email}</span>
          )}
          {data.phone && (
            <span className="text-xs text-gray-800">{data.phone}</span>
          )}
          {data.location && (
            <span className="text-xs text-gray-800">{data.location}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelStudentPastel;
