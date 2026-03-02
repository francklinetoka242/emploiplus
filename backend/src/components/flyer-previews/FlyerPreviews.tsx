// Preview du modèle Impact Business
export function FlyerPreviewImpactBusiness() {
  return (
    <div className="w-full h-full bg-white flex flex-col" style={{ aspectRatio: '210/297' }}>
      {/* Header - Split en deux */}
      <div className="flex h-1/3">
        {/* Section Rouge */}
        <div className="w-3/5 bg-red-600 flex flex-col items-center justify-center p-4 text-white">
          <h2 className="text-2xl font-bold">CREATIVE</h2>
          <h2 className="text-2xl font-bold">MARKETING</h2>
        </div>
        {/* Section Noire */}
        <div className="w-2/5 bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
          <h3 className="text-xl font-bold">DIGITAL</h3>
          <p className="text-red-500 italic">Creative</p>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="flex-1 p-4 grid grid-cols-2">
        {/* Colonne Gauche */}
        <div>
          <h4 className="font-bold text-red-600 mb-2">Business Flyer</h4>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full" />
                <span className="text-xs">Service {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite */}
        <div>
          <h4 className="font-bold text-gray-900 mb-2">Why Choose Us?</h4>
          <div className="space-y-1 text-xs">
            <p>✓ Professionnel</p>
            <p>✓ Créatif</p>
            <p>✓ Efficace</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-3 text-xs flex justify-between items-center">
        <div className="flex-1">Contact Us</div>
        <div className="flex gap-2">📱 💌 📍</div>
      </div>
    </div>
  );
}

// Preview du modèle Blue Wave Professional
export function FlyerPreviewBlueWave() {
  return (
    <div className="w-full h-full bg-white flex flex-col" style={{ aspectRatio: '210/297' }}>
      {/* Header avec vague */}
      <div className="h-2/5 bg-gradient-to-b from-blue-900 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">HEADLINE</h2>
          </div>
        </div>
        {/* Vague simulée */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-white"
          style={{
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)',
          }}
        />
      </div>

      {/* Contenu Principal */}
      <div className="flex-1 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">BUSINESS FLYER</h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {['01', '02', '03'].map((num) => (
            <div key={num} className="text-center">
              <div className="w-6 h-6 rounded-full border-2 border-blue-900 flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                {num}
              </div>
              <p className="text-xs">Service</p>
            </div>
          ))}
        </div>

        {/* Rectangle bleu */}
        <div className="bg-blue-900 bg-opacity-90 rounded-lg p-3 text-white text-center">
          <p className="text-xs font-bold">📈 Key Features</p>
        </div>
      </div>

      {/* Footer */}
      <div className="h-1/5 bg-gradient-to-r from-blue-900 to-blue-700" />
    </div>
  );
}

// Preview du modèle Geometric Tech Solution
export function FlyerPreviewGeometricTech() {
  return (
    <div className="w-full h-full bg-white flex flex-col" style={{ aspectRatio: '210/297' }}>
      {/* Header Géométrique */}
      <div className="h-2/5 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Triangle */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-blue-700 opacity-85"
            style={{
              width: '40%',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
          <div className="relative z-10 text-white text-center px-4">
            <h2 className="text-lg font-bold">WE PROVIDE</h2>
            <h2 className="text-lg font-bold">CREATIVE SOLUTION</h2>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="flex-1 p-4">
        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 border-2 border-blue-600" />
              <span className="text-xs font-bold text-blue-600">Service {i}</span>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="border-t pt-2">
          <h4 className="text-xs font-bold mb-2">WE ARE THE BEST</h4>
          <div className="space-y-1">
            {['Quality', 'Speed', 'Support'].map((item) => (
              <div key={item} className="flex gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-600 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Zone */}
      <div className="p-3 bg-gray-100 border-t">
        <div className="w-8 h-8 bg-gray-300 border border-gray-400 text-xs flex items-center justify-center">
          QR
        </div>
      </div>

      {/* Footer Trapézoïdal */}
      <div className="h-8 bg-gradient-to-r from-blue-600 to-blue-800" />
    </div>
  );
}
