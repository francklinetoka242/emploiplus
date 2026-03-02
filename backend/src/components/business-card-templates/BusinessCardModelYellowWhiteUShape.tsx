import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelYellowWhiteUShape({ data, isPreview = false }: Props) {
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
              background: '#f1c40f',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              padding: 0,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* White U-shape from top */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '70%',
              }}
              viewBox="0 0 320 145"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 Q 0 50 0 80 Q 0 120 80 140 L 240 140 Q 320 120 320 80 L 320 0 Z"
                fill="#ffffff"
              />
            </svg>

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                paddingTop: '16mm',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <h1
                style={{
                  color: '#333333',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                  margin: 0,
                  letterSpacing: '0px',
                }}
              >
                {candidateName}
              </h1>
              <p
                style={{
                  color: '#333333',
                  fontSize: '10px',
                  fontFamily: 'Montserrat, sans-serif',
                  margin: '4px 0 0 0',
                  fontWeight: 400,
                }}
              >
                {position}
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
              background: '#f8f8f8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              padding: '10mm 8mm',
              boxSizing: 'border-box',
              gap: '5px',
            }}
          >
            <div style={{ marginBottom: '4mm' }}>
              <p
                style={{
                  color: '#f1c40f',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Téléphone
              </p>
              <p
                style={{
                  color: '#333333',
                  fontSize: '9px',
                  fontFamily: 'Montserrat, sans-serif',
                  margin: '2px 0 0 0',
                }}
              >
                {phone}
              </p>
            </div>

            <div style={{ marginBottom: '4mm' }}>
              <p
                style={{
                  color: '#f1c40f',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Email
              </p>
              <p
                style={{
                  color: '#333333',
                  fontSize: '9px',
                  fontFamily: 'Montserrat, sans-serif',
                  margin: '2px 0 0 0',
                }}
              >
                {email}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: '#f1c40f',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Localisation
              </p>
              <p
                style={{
                  color: '#333333',
                  fontSize: '9px',
                  fontFamily: 'Montserrat, sans-serif',
                  margin: '2px 0 0 0',
                }}
              >
                {location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
