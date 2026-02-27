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

interface BusinessCardModelExecutiveFrameProps {
  data: BusinessCardData;
}

export const BusinessCardModelExecutiveFrame: React.FC<BusinessCardModelExecutiveFrameProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex overflow-hidden"
        style={{
          width: '85mm',
          height: '55mm',
          margin: '5mm',
        }}
      >
        {/* Left Black Section (30%) */}
        <div
          className="w-3/10 flex items-center justify-center"
          style={{
            backgroundColor: '#1a1a1a',
            width: '30%',
          }}
        ></div>

        {/* Right White Section (70%) */}
        <div
          className="w-7/10 flex flex-col items-start justify-center pl-6"
          style={{
            backgroundColor: '#ffffff',
            width: '70%',
          }}
        >
          <h2
            className="text-xl font-bold"
            style={{
              color: '#4a4a4a',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p
              className="text-xs mt-1"
              style={{
                color: '#4a4a4a',
              }}
            >
              {data.position}
            </p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
        }}
      >
        {/* Top Line */}
        <div
          className="h-px mb-4"
          style={{
            backgroundColor: '#4a4a4a',
          }}
        ></div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} style={{ color: '#ffffff' }} />
              <span className="text-xs text-white">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: '#ffffff' }} />
              <span className="text-xs text-white">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: '#ffffff' }} />
              <span className="text-xs text-white">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelExecutiveFrame;
