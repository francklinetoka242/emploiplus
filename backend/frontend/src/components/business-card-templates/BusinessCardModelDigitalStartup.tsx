import React from 'react';
import { Mail, Phone, Linkedin, Github, Twitter } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelDigitalStartupProps {
  data: BusinessCardData;
}

export const BusinessCardModelDigitalStartup: React.FC<BusinessCardModelDigitalStartupProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#121212',
          margin: '5mm',
        }}
      >
        {/* Glow Effect */}
        <h2
          className="text-xl font-bold text-center"
          style={{
            color: '#2bb0ac',
            textShadow: '0 0 20px rgba(43, 176, 172, 0.5)',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p className="text-white text-xs mt-3">{data.position}</p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4 relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#2bb0ac',
          margin: '5mm',
        }}
      >
        {/* QR Code Placeholder */}
        <div className="mb-4">
          <div
            className="w-24 h-24 flex items-center justify-center"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #121212',
            }}
          >
            <span className="text-xs text-gray-600">QR</span>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 justify-center">
          <Linkedin size={18} style={{ color: '#121212' }} />
          <Github size={18} style={{ color: '#121212' }} />
          <Twitter size={18} style={{ color: '#121212' }} />
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-2 text-center mt-4 text-xs text-black">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelDigitalStartup;
