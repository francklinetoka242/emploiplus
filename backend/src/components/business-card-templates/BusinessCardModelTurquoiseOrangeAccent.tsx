import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BusinessCardData } from '../BusinessCardEditorModal';

interface Props {
  data?: BusinessCardData;
  isPreview?: boolean;
}

export default function BusinessCardModelTurquoiseOrangeAccent({ data, isPreview = false }: Props) {
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

      {/* Business Card */}
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
              background: '#2bb0ac',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Orange bottom bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: '#f39c12',
              }}
            />

            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'Roboto, sans-serif',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}
              >
                {candidateName}
                <span style={{ color: '#f39c12' }}>.</span>
              </h1>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '11px',
                  fontFamily: 'Roboto, sans-serif',
                  margin: 0,
                  opacity: 0.9,
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
              padding: '10mm',
              boxSizing: 'border-box',
              gap: '8px',
            }}
          >
            {/* Contact items with turquoise circles */}
            {[
              { icon: Phone, label: phone, type: 'phone' },
              { icon: Mail, label: email, type: 'email' },
              { icon: MapPin, label: location, type: 'location' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#2bb0ac',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={14} color="#ffffff" />
                </div>
                <span
                  style={{
                    color: '#2bb0ac',
                    fontSize: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    margin: 0,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
