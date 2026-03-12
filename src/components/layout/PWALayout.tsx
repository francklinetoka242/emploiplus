// Exemple de logique à intégrer
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // 1. Définition des contextes
  if (path.startsWith('/services/')) {
    return (
      <nav className="bottom-nav-contextual">
        <button onClick={() => navigate('/services')}>← Tous les Services</button>
        <button onClick={() => navigate('/services/design')}>Design</button>
        <button onClick={() => navigate('/services/informatique')}>IT</button>
      </nav>
    );
  }

  if (path.includes('/postuler/') || path.includes('/inscription')) {
    return (
      <nav className="bottom-nav-action">
        <button onClick={() => navigate(-1)}>Annuler</button>
        <button className="btn-primary">Continuer l'action</button>
      </nav>
    );
  }

  // 2. Menu par défaut (Pages principales)
  return (
    <nav className="bottom-nav-standard">
       {/* Tes 5 boutons actuels : Accueil, Emplois, etc. */}
    </nav>
  );
};