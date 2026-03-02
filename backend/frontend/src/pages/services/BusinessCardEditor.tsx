import { useRef, useState, useEffect } from "react";
import { User, Phone, Mail, Globe, MapPin, Link as LinkIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";

const FONT_FAMILIES = ["Arial", "Helvetica", "Georgia", "Times New Roman", "Montserrat"];

export default function BusinessCardEditor() {
  const [texts, setTexts] = useState([{ id: 1, field: 'Nom', content: "Prénom Nom", color: "#000000", size: 14, font: "Montserrat", align: "left" }]);
  const [images, setImages] = useState<string[]>([]);
  const [bgFrom, setBgFrom] = useState("#ffffff");
  const [bgTo, setBgTo] = useState("#ffffff");
  const [icons, setIcons] = useState<{name:string, icon: JSX.Element, color:string}[]>([]);
  const [side, setSide] = useState<'front'|'back'>('front');
  const [logoUrl, setLogoUrl] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  const AVAILABLE_ICONS = [
    { key: 'user', el: <User className="h-5 w-5" /> },
    { key: 'phone', el: <Phone className="h-5 w-5" /> },
    { key: 'mail', el: <Mail className="h-5 w-5" /> },
    { key: 'globe', el: <Globe className="h-5 w-5" /> },
    { key: 'pin', el: <MapPin className="h-5 w-5" /> },
    { key: 'link', el: <LinkIcon className="h-5 w-5" /> },
  ];

  const addText = () => {
    setTexts((t) => [...t, { id: Date.now(), content: "Nouveau texte", color: "#000000", size: 14, font: "Arial", align: "left" }]);
  };

  const updateText = (id: number, patch: Partial<any>) => {
    setTexts((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const addImage = (url: string) => {
    if (url) setImages((s) => [...s, url]);
  };

  const addIcon = (key:string, color:string) => {
    const found = AVAILABLE_ICONS.find(a=>a.key===key);
    if(!found) return;
    setIcons((i)=>[...i, { name: key, icon: found.el, color }]);
  }

  const exportImage = async (type: "png" | "jpg") => {
    // require login for export
    if (!user) {
      const payload = { path: location.pathname, format: type, design: { texts, images, bgFrom, bgTo, icons, logoUrl, side } };
      localStorage.setItem("pending_export_business_card", JSON.stringify(payload));
      navigate(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!ref.current) return;
    // Export both sides stacked (front then back) by rendering container that includes both
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const mime = type === "png" ? "image/png" : "image/jpeg";
    const data = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = data;
    a.download = `business-card-${Date.now()}.${type}`;
    a.click();
  };

  const exportPDF = () => {
    if (!user) {
      const payload = { path: location.pathname, format: 'pdf', design: { texts, images, bgFrom, bgTo, icons, logoUrl, side } };
      localStorage.setItem("pending_export_business_card", JSON.stringify(payload));
      navigate(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!ref.current) return;
    html2pdf().from(ref.current).set({ margin: 5, filename: `business-card-${Date.now()}.pdf`, html2canvas: { scale: 2 } }).save();
  };

  // Restore pending export if user just logged in
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pending = localStorage.getItem("pending_export_business_card");
    if (pending && user) {
      try {
        const obj = JSON.parse(pending);
        // restore minimal state
        if (obj.design) {
          setTexts(obj.design.texts || []);
          setImages(obj.design.images || []);
          setBgFrom(obj.design.bgFrom || '#ffffff');
          setBgTo(obj.design.bgTo || '#ffffff');
          setIcons(obj.design.icons || []);
          setLogoUrl(obj.design.logoUrl || '');
          setSide(obj.design.side || 'front');
        }

        // perform export after short delay to allow DOM update
        setTimeout(() => {
          if (obj.format === 'pdf') exportPDF();
          else exportImage(obj.format as 'png' | 'jpg');
        }, 500);

        localStorage.removeItem("pending_export_business_card");
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services' }, { label: 'Cartes de visite' }]} />

      <h1 className="text-2xl font-bold my-4">Créateur de carte de visite</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-3">
            <Button onClick={addText}>Ajouter un texte</Button>
            {texts.map((t) => (
              <div key={t.id} className="p-3 border rounded">
                <input value={t.content} onChange={(e)=>updateText(t.id, { content: e.target.value })} className="w-full p-2 border rounded mb-2" />
                <div className="flex gap-2 mb-2">
                  <input type="color" value={t.color} onChange={(e)=>updateText(t.id, { color: e.target.value })} />
                  <input type="number" value={t.size} min={8} max={48} onChange={(e)=>updateText(t.id, { size: Number(e.target.value) })} className="w-20" />
                  <select value={t.font} onChange={(e)=>updateText(t.id, { font: e.target.value })}>
                    {FONT_FAMILIES.map((f)=> <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={t.align} onChange={(e)=>updateText(t.id, { align: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
              </div>
            ))}

            <div className="p-3 border rounded">
              <label className="block mb-2">Ajouter image (URL)</label>
              <ImageAdder onAdd={addImage} />
              <div className="mt-2 flex gap-2 flex-wrap">
                {images.map((src, idx)=> (
                  <img key={idx} src={src} alt={`img-${idx}`} className="h-16 w-16 object-cover rounded" />
                ))}
              </div>
            </div>

            <div className="p-3 border rounded mt-3">
              <label className="block mb-2">Icônes (choisir + couleur)</label>
              <div className="flex gap-2 items-center mb-2">
                {AVAILABLE_ICONS.map(a=> (
                  <button key={a.key} onClick={()=>addIcon(a.key, '#000000')} className="p-2 border rounded">{a.el}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Après ajout, modifiez la couleur dans l'aperçu</p>
            </div>

            <div className="p-3 border rounded">
              <label className="block mb-2">Couleur dégradée - de</label>
              <input type="color" value={bgFrom} onChange={(e)=>setBgFrom(e.target.value)} />
              <label className="block mb-2 mt-2">à</label>
              <input type="color" value={bgTo} onChange={(e)=>setBgTo(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Button onClick={()=>exportImage('png')}>Exporter PNG</Button>
              <Button onClick={()=>exportImage('jpg')}>Exporter JPG</Button>
              <Button onClick={exportPDF}>Exporter PDF</Button>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className="mb-2 flex gap-2">
              <button onClick={()=>setSide('front')} className={`px-2 py-1 border rounded ${side==='front'?'bg-primary/10':''}`}>Recto</button>
              <button onClick={()=>setSide('back')} className={`px-2 py-1 border rounded ${side==='back'?'bg-primary/10':''}`}>Verso</button>
            </div>

            <div ref={ref} className="p-4 rounded shadow-lg" style={{ minHeight: 200, background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})` }}>
              {/* Preview: render both sides stacked so exports create a 2-page like output */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Recto</h4>
                <div className="p-3 border rounded" style={{ background: '#fff' }}>
                  {texts.filter(t=> t.field !== 'Verso').map((t)=> (
                    <div key={t.id} style={{ color: t.color, fontSize: t.size, fontFamily: t.font, textAlign: t.align }} className="mb-1">{t.content}</div>
                  ))}
                  <div className="flex gap-2 mt-2">{icons.map((ic, idx)=>(<div key={idx} style={{ color: ic.color }} className="p-1">{ic.icon}</div>))}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Verso</h4>
                <div className="p-3 border rounded" style={{ background: '#fff' }}>
                  <div className="mb-2">Logo (verso):</div>
                  {logoUrl && <img src={logoUrl} alt="logo" className="h-16 object-contain" />}
                  <div className="mt-2">Autres champs:</div>
                  {texts.filter(t=> t.field === 'Verso' || t.field === 'Logo').map((t)=> (
                    <div key={t.id} style={{ color: t.color, fontSize: t.size, fontFamily: t.font, textAlign: t.align }} className="mb-1">{t.content}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageAdder({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex gap-2">
      <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." className="w-full p-2 border rounded" />
      <Button onClick={() => { onAdd(url); setUrl(""); }}>Ajouter</Button>
    </div>
  );
}
