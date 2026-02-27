import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelPearlSeparationLine({ data, isPreview = false }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const candidateName = data?.candidateName || 'Jean Dupont';
  const position = data?.position || 'Product Designer';
  const email = data?.email || 'jean@example.com';
  const phone = data?.phone || '+33 6 12 34 56 78';
  const location = data?.location || 'Paris, France';

  // Extract initials
  const initials = candidateName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
              background: '#dcdde1',
              display: 'flex',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Vertical black line separator */}
            <div
              style={{
                width: '2px',
                height: '100%',
                background: '#2f3640',
                flexShrink: 0,
              }}
            />

            {/* Left section: Initials */}
            <div
              style={{
                flex: 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10mm',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'Helvetica, sans-serif',
                  color: '#2f3640',
                }}
              >
                {initials}
              </div>
            </div>

            {/* Right section: Name and Title */}
            <div
              style={{
                flex: 0.7,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '8mm 10mm',
                boxSizing: 'border-box',
              }}
            >
              <h1
                style={{
                  color: '#2f3640',
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'Helvetica, sans-serif',
                  margin: '0 0 4px 0',
                  letterSpacing: '0px',
                }}
              >
                {candidateName}
              </h1>
              <p
                style={{
                  color: '#2f3640',
                  fontSize: '10px',
                  fontFamily: 'Helvetica, sans-serif',
                  margin: 0,
                  opacity: 0.8,
                  letterSpacing: '0.5px',
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
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8mm 10mm',
              boxSizing: 'border-box',
              gap: '6px',
            }}
          >
            {/* Vertical dotted line on left with contact info on right */}
            {[
              { icon: Phone, label: 'Téléphone', value: phone },
              { icon: Mail, label: 'Email', value: email },
              { icon: MapPin, label: 'Localisation', value: location },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Dotted line */}
                <div
                  style={{
                    width: '20px',
                    height: '1px',
                    borderTop: '1px dotted #2f3640',
                  }}
                />

                {/* Yellow circle icon */}
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fbc531',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={10} color="#ffffff" />
                </div>

                {/* Contact info */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: '#fbc531',
                      fontSize: '8px',
                      fontWeight: 700,
                      fontFamily: 'Helvetica, sans-serif',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      color: '#2f3640',
                      fontSize: '8px',
                      fontFamily: 'Helvetica, sans-serif',
                      margin: '1px 0 0 0',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
