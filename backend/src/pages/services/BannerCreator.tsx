import { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function BannerCreator() {
  const [text, setText] = useState("Votre message");
  const [colorFrom, setColorFrom] = useState("#0a66c2");
  const [colorTo, setColorTo] = useState<string | null>(null);
  const [align, setAlign] = useState("center");
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const ref = useRef<HTMLDivElement | null>(null);

  const exportImage = async (type: "png" | "jpg") => {
    if (!user) {
      const payload = { path: location.pathname, format: type, design: { text, colorFrom, colorTo, align, imageUrl, platform } };
      localStorage.setItem("pending_export_banner", JSON.stringify(payload));
      navigate(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const mime = type === "png" ? "image/png" : "image/jpeg";
    const data = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = data;
    a.download = `banner-${Date.now()}.${type}`;
    a.click();
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pending = localStorage.getItem("pending_export_banner");
    if (pending && user) {
      try {
        const obj = JSON.parse(pending);
        if (obj.design) {
          setText(obj.design.text || text);
          setColorFrom(obj.design.colorFrom || colorFrom);
          setColorTo(obj.design.colorTo || colorTo);
          setAlign(obj.design.align || align);
          setImageUrl(obj.design.imageUrl || imageUrl);
          setPlatform(obj.design.platform || platform);
        }

        setTimeout(() => {
          exportImage(obj.format as 'png' | 'jpg');
        }, 500);

        localStorage.removeItem("pending_export_banner");
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services' }, { label: 'Bannière LinkedIn' }]} />
      <h1 className="text-2xl font-bold my-4">Création de bannière LinkedIn</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2">Plateforme / Format</label>
          <select value={platform} onChange={(e)=>setPlatform(e.target.value)} className="w-full p-2 border rounded mb-3">
            <option value="linkedin">LinkedIn (1584x396)</option>
            <option value="facebook">Facebook (820x312)</option>
            <option value="youtube">YouTube (2560x1440)</option>
            <option value="instagram">Instagram (1080x566)</option>
          </select>

          <label className="block mb-2">Texte</label>
          <input value={text} onChange={(e)=>setText(e.target.value)} className="w-full p-2 border rounded mb-3" />

          <label className="block mb-2">Couleur de fond ou dégradé</label>
          <div className="flex gap-2 mb-3">
            <input type="color" value={colorFrom} onChange={(e)=>setColorFrom(e.target.value)} />
            <input type="color" value={colorTo || '#ffffff'} onChange={(e)=>setColorTo(e.target.value)} />
            <button onClick={()=>setColorTo(null)} className="px-2 py-1 border rounded">Couleur unique</button>
          </div>

          <label className="block mb-2">Alignement</label>
          <select value={align} onChange={(e)=>setAlign(e.target.value)} className="w-full p-2 border rounded mb-3">
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>

          <label className="block mb-2">Image (URL)</label>
          <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full p-2 border rounded mb-3" />

          <div className="flex gap-2">
            <Button onClick={()=>exportImage('png')}>Exporter PNG</Button>
            <Button onClick={()=>exportImage('jpg')}>Exporter JPG</Button>
          </div>
        </div>

        <div>
          <div ref={ref} style={{ background: colorTo ? `linear-gradient(135deg, ${colorFrom}, ${colorTo})` : colorFrom }} className="p-6 rounded shadow-lg flex items-center" >
            <div className={`w-full ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl font-bold text-white">{text}</h2>
              {imageUrl && <img src={imageUrl} alt="preview" className="mt-3 max-h-28 object-cover" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
