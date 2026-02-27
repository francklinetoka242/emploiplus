import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

export default function PortfolioBuilder() {
  const [projects, setProjects] = useState([{ id: 1, title: "Projet A", desc: "Description...", image: "" }]);
  const ref = useRef<HTMLDivElement | null>(null);

  const addProject = () => setProjects((p) => [...p, { id: Date.now(), title: "Nouveau projet", desc: "...", image: "" }]);
  const updateProject = (id: number, patch: Partial<any>) => setProjects((p) => p.map(x => x.id===id?{...x,...patch}:x));

  const exportPDF = () => {
    if (!ref.current) return;
    html2pdf().from(ref.current).set({ filename: `portfolio-${Date.now()}.pdf`, html2canvas: { scale: 2 } }).save();
  };

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services' }, { label: 'Portfolio' }]} />
      <h1 className="text-2xl font-bold my-4">Constructeur de portfolio</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Button onClick={addProject}>Ajouter un projet</Button>
          {projects.map(p=> (
            <div key={p.id} className="p-3 border rounded my-2">
              <input value={p.title} onChange={(e)=>updateProject(p.id, { title: e.target.value })} className="w-full p-2 border rounded mb-2" />
              <textarea value={p.desc} onChange={(e)=>updateProject(p.id, { desc: e.target.value })} className="w-full p-2 border rounded mb-2" />
              <input placeholder="Image URL" value={p.image} onChange={(e)=>updateProject(p.id, { image: e.target.value })} className="w-full p-2 border rounded" />
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Button onClick={exportPDF}>Exporter en PDF</Button>
          </div>
        </div>

        <div>
          <div ref={ref} className="p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">Mon portfolio</h2>
            {projects.map(p=> (
              <div key={p.id} className="mb-4">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                {p.image && <img src={p.image} alt={p.title} className="mt-2 max-h-48 object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
