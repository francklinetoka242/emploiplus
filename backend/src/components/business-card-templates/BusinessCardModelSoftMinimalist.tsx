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

interface BusinessCardModelSoftMinimalistProps {
  data: BusinessCardData;
}

export const BusinessCardModelSoftMinimalist: React.FC<BusinessCardModelSoftMinimalistProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#fdf6ec',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h2
          className="text-lg font-thin text-center"
          style={{
            color: '#3e2723',
            letterSpacing: '0.05em',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p
            className="text-xs mt-2"
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
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div className="flex flex-col gap-4 items-center">
          {data.email && (
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#b7410e',
                }}
              ></span>
              <span
                className="text-xs"
                style={{
                  color: '#3e2723',
                }}
              >
                {data.email}
              </span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#b7410e',
                }}
              ></span>
              <span
                className="text-xs"
                style={{
                  color: '#3e2723',
                }}
              >
                {data.phone}
              </span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#b7410e',
                }}
              ></span>
              <span
                className="text-xs"
                style={{
                  color: '#3e2723',
                }}
              >
                {data.location}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelSoftMinimalist;
