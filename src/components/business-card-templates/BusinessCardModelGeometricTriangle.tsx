import React from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelGeometricTriangleProps {
  data: BusinessCardData;
}

export const BusinessCardModelGeometricTriangle: React.FC<BusinessCardModelGeometricTriangleProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="relative w-80 h-52 rounded-lg shadow-lg overflow-hidden flex items-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#2d3436',
          margin: '5mm',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {/* Yellow Triangle */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: '0',
            height: '0',
            borderLeft: '60px solid transparent',
            borderTop: '60px solid #f39c12',
          }}
        ></div>

        {/* Name */}
        <div className="relative z-10 pl-6">
          <h2 className="text-white text-xl font-bold">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p className="text-gray-300 text-xs mt-2">{data.position}</p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {/* Vertical Timeline */}
        <div className="flex items-center gap-6 h-full">
          <div className="flex flex-col items-center gap-6">
            {/* Phone Icon Circle */}
            {data.phone && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#2d3436',
                }}
              >
                <Phone size={18} className="text-white" />
              </div>
            )}

            {/* Vertical Line */}
            {data.phone && data.email && (
              <div
                style={{
                  width: '2px',
                  height: '30px',
                  backgroundColor: '#f39c12',
                }}
              ></div>
            )}

            {/* Email Icon Circle */}
            {data.email && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#2d3436',
                }}
              >
                <Mail size={18} className="text-white" />
              </div>
            )}

            {/* Vertical Line */}
            {data.email && data.location && (
              <div
                style={{
                  width: '2px',
                  height: '30px',
                  backgroundColor: '#f39c12',
                }}
              ></div>
            )}

            {/* LinkedIn Icon Circle */}
            {data.location && (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#2d3436',
                }}
              >
                <Linkedin size={18} className="text-white" />
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6 text-left text-xs">
            {data.phone && <span className="text-gray-700">{data.phone}</span>}
            {data.email && <span className="text-gray-700">{data.email}</span>}
            {data.location && <span className="text-gray-700">{data.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelGeometricTriangle;
