import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  profile_image_url?: string;
  [key: string]: any;
}

interface BusinessCardModelBicolorPhotoMaskProps {
  data: BusinessCardData;
}

export const BusinessCardModelBicolorPhotoMask: React.FC<BusinessCardModelBicolorPhotoMaskProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex items-center gap-4 p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#f1c40f',
          margin: '5mm',
        }}
      >
        {/* Photo Circle */}
        <div
          className="w-20 h-20 rounded-full flex-shrink-0 bg-white overflow-hidden flex items-center justify-center"
        >
          {data.profile_image_url ? (
            <img
              src={data.profile_image_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-600">Photo</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <h2 className="text-black text-lg font-bold">
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p className="text-black text-xs mt-1">{data.position}</p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-5 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#1a1a1a',
          margin: '5mm',
        }}
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Yellow Separator */}
          <div
            className="h-0.5"
            style={{
              backgroundColor: '#f1c40f',
            }}
          ></div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3">
            {data.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: '#f1c40f' }} />
                <span className="text-white text-xs">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: '#f1c40f' }} />
                <span className="text-white text-xs">{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: '#f1c40f' }} />
                <span className="text-white text-xs">{data.location}</span>
              </div>
            )}
          </div>

          {/* Yellow Separator */}
          <div
            className="h-0.5"
            style={{
              backgroundColor: '#f1c40f',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelBicolorPhotoMask;
