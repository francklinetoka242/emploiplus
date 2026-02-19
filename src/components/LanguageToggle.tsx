import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ln', label: 'Lingala' },
];

const getLang = () => localStorage.getItem('lang') || 'fr';
const setLang = (l: string) => localStorage.setItem('lang', l);

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [lang, setLangState] = useState(getLang());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const change = (code: string) => {
    setLang(code);
    setLangState(code);
    // reload to apply texts if app reads lang on startup
    window.location.reload();
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        aria-label="Changer la langue"
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-muted/10 transition-colors text-slate-700"
        title="Langue"
      >
        <Globe className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-md border bg-white shadow z-50">
          <div className="py-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => change(l.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${lang === l.code ? 'font-semibold' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
