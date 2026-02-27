import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface BusinessCardModelTimelineProps {
  data: BusinessCardData;
}

export const BusinessCardModelTimeline: React.FC<BusinessCardModelTimelineProps> = ({ data }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#dcdde1',
          margin: '5mm',
        }}
      >
        {/* Left Section with Initials (30%) */}
        <div
          className="flex items-center justify-center text-lg font-bold"
          style={{
            width: '30%',
            color: '#2f3640',
          }}
        >
          {getInitials(data.candidateName || 'AB')}
        </div>

        {/* Vertical Separator */}
        <div
          style={{
            width: '1px',
            backgroundColor: '#2f3640',
            margin: '0 12px',
          }}
        ></div>

        {/* Right Section with Name (70%) */}
        <div className="flex flex-col items-start justify-center">
          <h2
            className="font-bold text-sm"
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
                color: '#2f3640',
              }}
            >
              {data.position}
            </p>
          )}
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-4 flex relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Vertical Dotted Timeline */}
        <div
          className="mr-4 flex flex-col items-center"
          style={{
            borderLeft: '1px dashed #2f3640',
            paddingLeft: '12px',
            minHeight: '100%',
          }}
        >
          {data.email && (
            <div className="flex items-center gap-2 mb-4 relative">
              <div
                className="absolute -left-6"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#fbc531',
                }}
              ></div>
              <Mail size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2 mb-4 relative">
              <div
                className="absolute -left-6"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#fbc531',
                }}
              ></div>
              <Phone size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2 relative">
              <div
                className="absolute -left-6"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#fbc531',
                }}
              ></div>
              <MapPin size={12} style={{ color: '#2f3640' }} />
              <span className="text-xs text-gray-900">{data.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelTimeline;
