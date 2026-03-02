import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelNavyCopperWave({ data, isPreview = false }: Props) {
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
              background: '#101820',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '10mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              color: '#ffffff',
            }}
          >
            {/* Copper wave from left-middle to bottom-right */}
            <svg
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
              }}
              viewBox="0 0 320 208"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 80 Q 40 60 80 70 T 160 80 T 240 70 L 320 100 L 320 208 L 0 208 Z"
                fill="#cf8d2e"
                opacity="0.3"
              />
              <path
                d="M 0 100 Q 60 75 120 90 T 240 80 L 320 120 L 320 208 L 0 208 Z"
                fill="#cf8d2e"
              />
            </svg>

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'Sans-Serif',
                  margin: 0,
                  letterSpacing: '0.5px',
                }}
              >
                {candidateName}
              </h1>
              <p
                style={{
                  color: '#cf8d2e',
                  fontSize: '11px',
                  fontFamily: 'Sans-Serif',
                  margin: '4px 0 0 0',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                {position.toUpperCase()}
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
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '10mm 8mm',
              boxSizing: 'border-box',
              gap: '8px',
            }}
          >
            <div>
              <p
                style={{
                  color: '#cf8d2e',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Sans-Serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Téléphone
              </p>
              <p
                style={{
                  color: '#101820',
                  fontSize: '10px',
                  fontFamily: 'Sans-Serif',
                  margin: '2px 0 0 0',
                }}
              >
                {phone}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: '#cf8d2e',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Sans-Serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Email
              </p>
              <p
                style={{
                  color: '#101820',
                  fontSize: '10px',
                  fontFamily: 'Sans-Serif',
                  margin: '2px 0 0 0',
                  wordBreak: 'break-all',
                }}
              >
                {email}
              </p>
            </div>

            <div>
              <p
                style={{
                  color: '#cf8d2e',
                  fontSize: '9px',
                  fontWeight: 700,
                  fontFamily: 'Sans-Serif',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Localisation
              </p>
              <p
                style={{
                  color: '#101820',
                  fontSize: '10px',
                  fontFamily: 'Sans-Serif',
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
