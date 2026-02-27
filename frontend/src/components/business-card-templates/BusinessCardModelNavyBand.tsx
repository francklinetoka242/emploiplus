import React from 'react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface BusinessCardModelNavyBandProps {
  data: BusinessCardData;
}

export const BusinessCardModelNavyBand: React.FC<BusinessCardModelNavyBandProps> = ({ data }) => {
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
            className="font-bold"
            style={{
              color: '#000080',
              fontSize: '12pt',
              fontFamily: 'Helvetica, sans-serif',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
          {data.position && (
            <p
              className="text-xs mt-1"
              style={{
                color: '#2d3436',
              }}
            >
              {data.position}
            </p>
          )}
        </div>

        {/* Navy Band at Bottom (30%) */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '30%',
            backgroundColor: '#000080',
          }}
        ></div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg p-4 flex flex-col items-start justify-center"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#000080',
          margin: '5mm',
        }}
      >
        <div className="flex flex-col gap-2 text-white text-xs">
          {data.phone && (
            <div>
              <span className="font-bold">TEL</span>: {data.phone}
            </div>
          )}
          {data.email && (
            <div>
              <span className="font-bold">MAIL</span>: {data.email}
            </div>
          )}
          {data.location && (
            <div>
              <span className="font-bold">WEB</span>: {data.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelNavyBand;
