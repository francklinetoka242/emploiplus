import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelAnthraciteVerticalDivide({ data, isPreview = false }: Props) {
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
              display: 'flex',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Left side: Black (30%) */}
            <div
              style={{
                width: '30%',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8mm',
                boxSizing: 'border-box',
              }}
            />

            {/* Right side: White (70%) with name and title */}
            <div
              style={{
                width: '70%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '8mm 10mm',
                boxSizing: 'border-box',
              }}
            >
              <h1
                style={{
                  color: '#4a4a4a',
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: 'Georgia, serif',
                  margin: '0 0 4px 0',
                  letterSpacing: '0px',
                }}
              >
                {candidateName}
              </h1>
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: '#1a1a1a',
                  margin: '4px 0 6px 0',
                }}
              />
              <p
                style={{
                  color: '#4a4a4a',
                  fontSize: '10px',
                  fontFamily: 'Arial, sans-serif',
                  margin: 0,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
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
              background: '#1a1a1a',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8mm 10mm',
              boxSizing: 'border-box',
              gap: '6px',
            }}
          >
            {/* Top border stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: '#4a4a4a',
              }}
            />

            {[
              { icon: Phone, label: 'Tél', value: phone },
              { icon: Mail, label: 'Email', value: email },
              { icon: MapPin, label: 'Lieu', value: location },
            ].map((item, idx) => (
              <div key={idx} style={{ marginTop: idx === 0 ? '6px' : 0 }}>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    fontFamily: 'Arial, sans-serif',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '9px',
                    fontFamily: 'Arial, sans-serif',
                    margin: '1px 0 0 0',
                    opacity: 0.9,
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
