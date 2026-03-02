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

interface BusinessCardModelExpertAdeleProps {
  data: BusinessCardData;
}

export const BusinessCardModelExpertAdele: React.FC<BusinessCardModelExpertAdeleProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex items-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#dcdde1',
          margin: '5mm',
        }}
      >
        {/* Left Vertical Line */}
        <div
          className="w-1 h-20 mr-4"
          style={{
            backgroundColor: '#2f3640',
          }}
        ></div>

        {/* Name and Title */}
        <div>
          <h2
            className="text-lg font-bold"
            style={{
              color: '#2f3640',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p
              className="text-xs mt-1"
              style={{
                color: '#fbc531',
              }}
            >
              {data.position}
            </p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Vertical Timeline */}
        <div className="flex flex-col items-center relative">
          {data.email && (
            <div className="flex items-center gap-2 mb-4">
              <Mail size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.email}</span>
              <div
                className="w-1 h-6 ml-2"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, #2f3640 0px, #2f3640 2px, transparent 2px, transparent 4px)',
                }}
              ></div>
            </div>
          )}

          {data.phone && (
            <div className="flex items-center gap-2 mb-4">
              <Phone size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.phone}</span>
              <div
                className="w-1 h-6 ml-2"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, #2f3640 0px, #2f3640 2px, transparent 2px, transparent 4px)',
                }}
              ></div>
            </div>
          )}

          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}

          {/* Accent Points */}
          <div className="flex gap-2 mt-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: '#fbc531',
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: '#fbc531',
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: '#fbc531',
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelExpertAdele;
