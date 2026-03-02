import React from 'react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  [key: string]: any;
}

interface BusinessCardModelTechnicianMarineProps {
  data: BusinessCardData;
}

export const BusinessCardModelTechnicianMarine: React.FC<BusinessCardModelTechnicianMarineProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col p-4 relative"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
        }}
      >
        {/* Name Top Left */}
        <div>
          <h2
            className="text-lg font-bold"
            style={{
              color: '#000080',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p className="text-xs mt-1" style={{ color: '#000080' }}>
              {data.position}
            </p>
          )}
        </div>

        {/* Large Blue Navy Band at Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 flex items-center pl-4"
          style={{
            backgroundColor: '#000080',
          }}
        ></div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#000080',
          margin: '5mm',
        }}
      >
        <div className="flex flex-col gap-3 text-white text-xs">
          {data.phone && (
            <div>
              <span className="font-bold">T:</span> {data.phone}
            </div>
          )}
          {data.email && (
            <div>
              <span className="font-bold">E:</span> {data.email}
            </div>
          )}
          {data.location && (
            <div>
              <span className="font-bold">W:</span> {data.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelTechnicianMarine;
