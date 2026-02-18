import { Link } from "react-router-dom";
import { Briefcase, Mail, MapPin, Phone, Facebook, Linkedin, Twitter, Globe, MessageCircle } from "lucide-react";

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ln', label: 'Lingala' }
];

const getLang = () => localStorage.getItem('lang') || 'fr';
const setLang = (l: string) => localStorage.setItem('lang', l);

const Footer = () => {
  return (
    <footer className="hidden md:block border-t border-border bg-slate-900 dark:bg-slate-950">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                <img 
                src="/Logo.png" 
                alt="Logo Emploi+" 
                
              />
              </div>
              <span className="text-xl font-bold text-white">Emploi+</span>
            </div>
            <p className="text-sm text-slate-300">
              La plateforme de référence pour le recrutement et la formation professionnelle en République du Congo et dans la sous-région.
            </p>
          </div>

  

          {/* Services professionnels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Services Pro</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/redaction-pro" className="text-slate-300 hover:text-white transition-colors">
                  Rédaction
                </Link>
              </li>
              <li>
                <Link to="/services/informatique-pro" className="text-slate-300 hover:text-white transition-colors">
                  Informatique
                </Link>
              </li>
              <li>
                <Link to="/services/digital-pro" className="text-slate-300 hover:text-white transition-colors">
                  Digital
                </Link>
              </li>
              <li>
                <Link to="/services/graphique-pro" className="text-slate-300 hover:text-white transition-colors">
                  Design Graphique
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <span className="text-slate-300">Brazzaville, République du Congo</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:contact@emploiplus-group.com" className="text-slate-300 hover:text-white transition-colors">
                  contact@emploiplus-group.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:support@emploiplus-group.com" className="text-slate-300 hover:text-white transition-colors">
                  support@emploiplus-group.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="tel:+242 067311033" className="text-slate-300 hover:text-white transition-colors">
                +242 06 731 10 33
                </a>
              </li>
            </ul>
          </div>

          {/* Emails Professionnels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Adresses Professionnelles</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:consulting@emploiplus-group.com" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>consulting@emploiplus-group.com</span>
                </a>
              </li>
              <li>
                <a href="mailto:direction@emploiplus-group.com" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-green-400" />
                  <span>direction@emploiplus-group.com</span>
                </a>
              </li>
              <li>
                <a href="mailto:recrutement@emploiplus-group.com" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span>recrutement@emploiplus-group.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Communication Channels */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Canaux de Communication</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://wa.me/242067311033" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a href="https://facebook.com/emploiplus" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4 text-blue-500" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/emploiplus" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="https://journal.emploiplus.cg" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  <span>Journal de l'emploi</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Emploi+. Tous droits réservés.</p>
            <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <select
                  className="bg-transparent text-slate-300"
                  value={getLang()}
                  onChange={(e) => { setLang(e.target.value); window.location.reload(); }}
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Link to="/privacy" className="text-slate-300 hover:text-white">Politique de confidentialité</Link>
                <Link to="/legal" className="text-slate-300 hover:text-white">Mentions légales</Link>
                <Link to="/cookies" className="text-slate-300 hover:text-white">Gestion des cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
