import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelDarkTechNeonProps {
  data: BusinessCardData;
}

export const BusinessCardModelDarkTechNeon: React.FC<BusinessCardModelDarkTechNeonProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#121212',
          margin: '5mm',
        }}
      >
        {/* Name */}
        <h2
          className="text-white text-xl font-bold text-center"
          style={{
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '8px',
            width: '90%',
          }}
        >
          {data.candidateName || 'NOM CANDIDAT'}
        </h2>
        {data.position && (
          <p className="text-gray-400 text-xs mt-3">{data.position}</p>
        )}
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#121212',
          margin: '5mm',
        }}
      >
        {/* Contact Circles */}
        <div className="flex gap-3 mb-4">
          {data.email && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#00d4ff',
              }}
            >
              <Mail size={16} style={{ color: '#121212' }} />
            </div>
          )}
          {data.phone && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#00d4ff',
              }}
            >
              <Phone size={16} style={{ color: '#121212' }} />
            </div>
          )}
          {data.location && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#00d4ff',
              }}
            >
              <MapPin size={16} style={{ color: '#121212' }} />
            </div>
          )}
        </div>

        {/* Contact Info Text */}
        <div className="flex flex-col gap-2 items-center text-white text-xs">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 mt-4">
          <Github size={16} style={{ color: '#00d4ff' }} />
          <Linkedin size={16} style={{ color: '#00d4ff' }} />
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelDarkTechNeon;
