import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelBeigeHighEnd({ data, isPreview = false }: Props) {
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
              background: '#fdf6ec',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '14mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <h1
              style={{
                color: '#3e2723',
                fontSize: '20px',
                fontWeight: 500,
                fontFamily: 'Georgia, serif',
                margin: 0,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {candidateName}
            </h1>

            {/* Terracotta separator line */}
            <div
              style={{
                width: '50px',
                height: '2px',
                background: '#b7410e',
                margin: '8px 0',
              }}
            />

            <p
              style={{
                color: '#3e2723',
                fontSize: '10px',
                fontFamily: 'Georgia, serif',
                margin: 0,
                fontWeight: 400,
                letterSpacing: '1px',
                opacity: 0.8,
              }}
            >
              {position}
            </p>
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
              alignItems: 'flex-end',
              padding: '12mm 14mm',
              boxSizing: 'border-box',
              gap: '8px',
            }}
          >
            {[
              { icon: Phone, label: 'Tél', value: phone },
              { icon: Mail, label: 'Email', value: email },
              { icon: MapPin, label: 'Lieu', value: location },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'right',
                }}
              >
                <p
                  style={{
                    color: '#b7410e',
                    fontSize: '8px',
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    color: '#3e2723',
                    fontSize: '9px',
                    fontFamily: 'Georgia, serif',
                    margin: '2px 0 0 0',
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
