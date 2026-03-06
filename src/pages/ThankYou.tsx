import React from 'react';
import { CheckCircle, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Candidature envoyée avec succès !
          </h1>
          <p className="text-gray-600">
            Merci d'avoir postulé à cette offre d'emploi. Votre candidature a été enregistrée.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
            <Mail className="w-5 h-5 text-blue-500" />
            <span>Un email de confirmation vous a été envoyé</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Vous recevrez une réponse dans les prochains jours</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/emplois"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voir d'autres offres d'emploi
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;