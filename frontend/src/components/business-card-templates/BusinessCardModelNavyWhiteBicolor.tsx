import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelNavyWhiteBicolor({ data, isPreview = false }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const candidateName = data?.candidateName || 'Jean Dupont';
  const position = data?.position || 'Product Designer';
  const email = data?.email || 'jean@example.com';
  const phone = data?.phone || '+33 6 12 34 56 78';
  const location = data?.location || 'Paris, France';

  return (
    <div
      className={`relative w-full flex items-center justify-center bg-gray-100 p-4 ${isPreview ? 'h-auto' : 'h-screen'}`}
      onClick={() => !isPreview && setIsFlipped(!isFlipped)}
    >
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .business-card-container { 
            width: 85mm; 
            height: 55mm; 
            margin: 0; 
            padding: 0; 
          }
        }
      `}</style>

      <div
        className="business-card-container relative cursor-pointer"
        style={{
          width: isPreview ? '85mm' : '85mm',
          height: isPreview ? '55mm' : '55mm',
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* RECTO */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '8mm 10mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Top: Name */}
            <div>
              <h1
                style={{
                  color: '#000080',
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'Arial, sans-serif',
                  margin: 0,
                  letterSpacing: '0.5px',
                }}
              >
                {candidateName}
              </h1>
              <p
                style={{
                  color: '#2d3436',
                  fontSize: '9px',
                  fontFamily: 'Arial, sans-serif',
                  margin: '2px 0 0 0',
                  fontWeight: 400,
                }}
              >
                {position}
              </p>
            </div>

            {/* Bottom: Navy banner with website */}
            <div
              style={{
                background: '#000080',
                color: '#ffffff',
                padding: '4mm 6mm',
                borderRadius: '2px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '9px',
                  fontFamily: 'Arial, sans-serif',
                  margin: 0,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                example.com
              </p>
            </div>
          </div>

          {/* VERSO */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#000080',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8mm 10mm',
              boxSizing: 'border-box',
              gap: '6px',
            }}
          >
            {[
              { abbrev: 'T:', value: phone },
              { abbrev: 'E:', value: email },
              { abbrev: 'L:', value: location },
            ].map((item, idx) => (
              <div key={idx}>
                <p
                  style={{
                    color: '#a4b0be',
                    fontSize: '8px',
                    fontWeight: 700,
                    fontFamily: 'Arial, sans-serif',
                    margin: 0,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.abbrev}
                </p>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '9px',
                    fontFamily: 'Arial, sans-serif',
                    margin: '1px 0 0 0',
                    fontWeight: 400,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
