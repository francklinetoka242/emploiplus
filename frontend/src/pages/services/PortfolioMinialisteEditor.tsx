import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Eye, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import PortfolioMinimaliste from "./portfolio-templates/PortfolioMinimaliste";

interface Project {
  id: string;
  title: string;
  image: string;
  category: string;
  year: number;
  description?: string;
  link?: string;
}

interface UserProfile {
  name: string;
  bio: string;
  email?: string;
  socialLinks?: {
    label: string;
    url: string;
  }[];
}

export default function PortfolioMinialisteEditor() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Votre Nom",
    bio: "Créateur d'expériences digitales minimalistes et fonctionnelles",
    email: "contact@example.com",
    socialLinks: [
      { label: "LinkedIn", url: "#" },
      { label: "GitHub", url: "#" },
      { label: "Twitter", url: "#" },
    ],
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Refonte E-commerce",
      image: "/assets/placeholder-portfolio.jpg",
      category: "Web Design",
      year: 2024,
      description: "Plateforme e-commerce minimaliste avec UX optimisée",
    },
    {
      id: "2",
      title: "Application Mobile",
      image: "/assets/placeholder-portfolio.jpg",
      category: "Mobile",
      year: 2024,
      description: "Application minimaliste pour gestion de tâches",
    },
    {
      id: "3",
      title: "Identité Visuelle",
      image: "/assets/placeholder-portfolio.jpg",
      category: "Branding",
      year: 2023,
      description: "Système de design complet",
    },
    {
      id: "4",
      title: "Plateforme SaaS",
      image: "/assets/placeholder-portfolio.jpg",
      category: "Web Design",
      year: 2023,
      description: "Interface d'analytique en temps réel",
    },
  ]);

  const [preview, setPreview] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: portfolioRef,
  });

  const onPrint = () => {
    handlePrint?.();
    toast.success("Portfolio exporté en PDF avec succès!");
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "Nouveau Projet",
      image: "/assets/placeholder-portfolio.jpg",
      category: "Web Design",
      year: new Date().getFullYear(),
      description: "Description du projet",
    };
    setProjects([...projects, newProject]);
    toast.success("Projet ajouté");
  };

  const handleUpdateProject = (id: string, updatedProject: Project) => {
    setProjects(
      projects.map((p) => (p.id === id ? updatedProject : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Projet supprimé");
  };

  const handleExport = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userProfile.name} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { background-color: #FAFAFA; color: #1A1A1A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .grayscale { filter: grayscale(100%); }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <nav style="background-color: #FAFAFA; border-bottom: 1px solid #EFEFEF;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 1.25rem; font-weight: 300; letter-spacing: -0.025em;">${userProfile.name}</h1>
      <div style="display: flex; gap: 2rem; font-size: 0.875rem;">
        <a href="#projects" style="color: #1A1A1A; text-decoration: none;">Projets</a>
        <a href="#about" style="color: #1A1A1A; text-decoration: none;">À propos</a>
        <a href="#contact" style="color: #1A1A1A; text-decoration: none;">Contact</a>
      </div>
    </div>
  </nav>

  <section style="max-width: 1200px; margin: 0 auto; padding: 8rem 1.5rem;">
    <h2 style="font-size: 3rem; font-weight: 300; letter-spacing: -0.05em; line-height: 1.1; max-width: 56rem;">
      ${userProfile.bio}
    </h2>
  </section>

  <section id="projects" style="max-width: 1200px; margin: 0 auto; padding: 5rem 1.5rem;">
    <h3 style="font-size: 0.875rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #808080; margin-bottom: 4rem;">Projets Récents</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
      ${projects
        .map((project, index) => {
          const isLarge = index % 3 === 0;
          return `
        <div style="grid-column: ${isLarge ? 'span 2' : 'span 1'}; grid-row: ${isLarge ? 'span 2' : 'span 1'};">
          <img src="${project.image}" alt="${project.title}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; filter: grayscale(100%);">
          <div style="padding-top: 1.5rem;">
            <h4 style="font-size: 1.125rem; font-weight: 300; margin-bottom: 0.5rem;">${project.title}</h4>
            <p style="font-size: 0.75rem; color: #B0B0B0;">${project.year}</p>
            ${project.description ? `<p style="font-size: 0.875rem; color: #808080; margin-top: 0.75rem;">${project.description}</p>` : ''}
          </div>
        </div>
          `;
        })
        .join('')}
    </div>
  </section>

  <section id="about" style="max-width: 1200px; margin: 0 auto; padding: 5rem 1.5rem;">
    <h3 style="font-size: 0.875rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #808080; margin-bottom: 3rem;">À Propos</h3>
    <div style="max-width: 42rem;">
      <p style="font-size: 1rem; line-height: 1.75; margin-bottom: 2rem;">Développeur frontend passionné par le minimalisme et l'expérience utilisateur.</p>
      ${
        userProfile.socialLinks
          ? `
        <div style="display: flex; gap: 1.5rem;">
          ${userProfile.socialLinks.map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.875rem; color: #1A1A1A; text-decoration: none;">${link.label}</a>
          `).join('')}
        </div>
      `
          : ''
      }
    </div>
  </section>

  <section id="contact" style="max-width: 1200px; margin: 0 auto; padding: 5rem 1.5rem; border-top: 1px solid #EFEFEF;">
    <h3 style="font-size: 0.875rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #808080; margin-bottom: 3rem;">Contact</h3>
    <div style="max-width: 42rem;">
      <p style="font-size: 1rem; margin-bottom: 1.5rem;">Vous avez un projet en tête ? N'hésitez pas à me contacter.</p>
      <a href="mailto:${userProfile.email}" style="font-size: 1rem; font-weight: 300; color: #1A1A1A; text-decoration: none;">${userProfile.email}</a>
    </div>
  </section>

  <footer style="border-top: 1px solid #EFEFEF; padding: 3rem; text-align: center; font-size: 0.75rem; color: #B0B0B0;">
    © ${new Date().getFullYear()} ${userProfile.name}
  </footer>
</body>
</html>
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent)
    );
    element.setAttribute("download", "portfolio.html");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Portfolio exporté en HTML");
  };

  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center no-print">
          <h1 className="text-xl font-bold">Aperçu du Portfolio</h1>
          <div className="flex gap-4">
            <Button
              onClick={onPrint}
              variant="default"
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <FileText size={18} />
              Exporter en PDF
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download size={18} />
              Exporter en HTML
            </Button>
            <Button onClick={() => setPreview(false)} variant="outline">
              Retour à l'édition
            </Button>
          </div>
        </div>
        <div ref={portfolioRef}>
          <PortfolioMinimaliste
            userProfile={userProfile}
            projects={projects}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Éditeur Portfolio Minimaliste</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setPreview(true)}
              variant="outline"
              className="gap-2"
            >
              <Eye size={18} />
              Aperçu
            </Button>
            <Button
              onClick={onPrint}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <FileText size={18} />
              Exporter en PDF
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download size={18} />
              Exporter en HTML
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="projects">Projets ({projects.length})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Informations du Profil</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom
                  </label>
                  <Input
                    value={userProfile.name}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        name: e.target.value,
                      })
                    }
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bio / Accroche
                  </label>
                  <Textarea
                    value={userProfile.bio}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, bio: e.target.value })
                    }
                    placeholder="Décrivez-vous en une phrase impactante"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={userProfile.email || ""}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        email: e.target.value,
                      })
                    }
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">
                    Réseaux Sociaux
                  </label>
                  <div className="space-y-3">
                    {userProfile.socialLinks?.map((link, index) => (
                      <div key={index} className="flex gap-3">
                        <Input
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...(userProfile.socialLinks || [])];
                            updated[index].label = e.target.value;
                            setUserProfile({
                              ...userProfile,
                              socialLinks: updated,
                            });
                          }}
                          placeholder="Nom du réseau"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...(userProfile.socialLinks || [])];
                            updated[index].url = e.target.value;
                            setUserProfile({
                              ...userProfile,
                              socialLinks: updated,
                            });
                          }}
                          placeholder="URL"
                        />
                        <Button
                          onClick={() => {
                            const updated = userProfile.socialLinks?.filter(
                              (_, i) => i !== index
                            );
                            setUserProfile({
                              ...userProfile,
                              socialLinks: updated,
                            });
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const updated = [
                          ...(userProfile.socialLinks || []),
                          { label: "", url: "" },
                        ];
                        setUserProfile({
                          ...userProfile,
                          socialLinks: updated,
                        });
                      }}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Plus size={16} />
                      Ajouter un réseau
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="space-y-6">
              {projects.map((project) => (
                <Card key={project.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Button
                        onClick={() => handleDeleteProject(project.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Titre
                        </label>
                        <Input
                          value={project.title}
                          onChange={(e) =>
                            handleUpdateProject(project.id, {
                              ...project,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Catégorie
                        </label>
                        <Input
                          value={project.category}
                          onChange={(e) =>
                            handleUpdateProject(project.id, {
                              ...project,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Année
                        </label>
                        <Input
                          type="number"
                          value={project.year}
                          onChange={(e) =>
                            handleUpdateProject(project.id, {
                              ...project,
                              year: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Lien externe
                        </label>
                        <Input
                          value={project.link || ""}
                          onChange={(e) =>
                            handleUpdateProject(project.id, {
                              ...project,
                              link: e.target.value,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        URL de l'image
                      </label>
                      <Input
                        value={project.image}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            ...project,
                            image: e.target.value,
                          })
                        }
                        placeholder="/assets/project-image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <Textarea
                        value={project.description || ""}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            ...project,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description du projet"
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                onClick={handleAddProject}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus size={18} />
                Ajouter un projet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
