import React from 'react';

interface BusinessCardData {
  candidateName?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface BusinessCardModelPastelCentralProps {
  data: BusinessCardData;
}

export const BusinessCardModelPastelCentral: React.FC<BusinessCardModelPastelCentralProps> = ({ data }) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      {/* Recto (Front) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#fce4ec',
          margin: '5mm',
        }}
      >
        {/* Central Black Rectangle 60x15mm */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '60mm',
            height: '15mm',
            backgroundColor: '#000000',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <h2
            className="text-white font-bold uppercase text-center"
            style={{
              fontSize: '10pt',
              letterSpacing: '2px',
            }}
          >
            {data.candidateName || 'NOM CANDIDAT'}
          </h2>
        </div>
      </div>

      {/* Verso (Back) */}
      <div
        className="w-80 h-52 rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
        style={{
          width: '85mm',
          height: '55mm',
          backgroundColor: '#ffffff',
          margin: '5mm',
          border: '5mm solid #fce4ec',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex flex-col gap-2 text-center" style={{ color: '#000000' }}>
          {data.email && (
            <span className="text-xs" style={{ fontWeight: 300 }}>
              {data.email}
            </span>
          )}
          {data.phone && (
            <span className="text-xs" style={{ fontWeight: 300 }}>
              {data.phone}
            </span>
          )}
          {data.location && (
            <span className="text-xs" style={{ fontWeight: 300 }}>
              {data.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCardModelPastelCentral;
