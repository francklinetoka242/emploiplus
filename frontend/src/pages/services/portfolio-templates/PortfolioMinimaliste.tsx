import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface UserProfile {
  name: string;
  bio: string;
  email?: string;
  socialLinks?: {
    label: string;
    url: string;
  }[];
}

interface Project {
  id: string;
  title: string;
  image: string;
  category: string;
  year: number;
  description?: string;
  link?: string;
}

interface PortfolioMinialisteProps {
  userProfile: UserProfile;
  projects: Project[];
}

// Styles d'impression
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }

    body {
      background-color: white !important;
      color: #1A1A1A !important;
    }

    * {
      box-shadow: none !important;
      text-shadow: none !important;
    }

    img {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    nav {
      border-bottom: 1px solid #1A1A1A;
      padding: 1rem;
      page-break-after: avoid;
    }

    section {
      page-break-inside: avoid !important;
    }

    button, a {
      text-decoration: none;
      pointer-events: none;
      cursor: default;
    }

    footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #1A1A1A;
    }
  }
`;

export default function PortfolioMinimaliste({
  userProfile,
  projects = [],
}: PortfolioMinialisteProps) {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const defaultProjects: Project[] = [
    {
      id: "1",
      title: "Refonte E-commerce",
      image: "/assets/portfolio-projects/ecommerce.jpg",
      category: "Web Design",
      year: 2024,
      description: "Plateforme e-commerce minimaliste avec UX optimisée",
    },
    {
      id: "2",
      title: "Application Mobile",
      image: "/assets/portfolio-projects/mobile-app.jpg",
      category: "Mobile",
      year: 2024,
      description: "Application de gestion de tâches avec design épuré",
    },
    {
      id: "3",
      title: "Identité Visuelle",
      image: "/assets/portfolio-projects/branding.jpg",
      category: "Branding",
      year: 2023,
      description: "Système de design complet pour startup tech",
    },
    {
      id: "4",
      title: "Plateforme SaaS",
      image: "/assets/portfolio-projects/saas.jpg",
      category: "Web Design",
      year: 2023,
      description: "Interface d'analytique en temps réel",
    },
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      <style>{printStyles}</style>
      {/* Navigation */}
      <nav
        className="sticky top-0 z-40 border-b no-print"
        style={{
          backgroundColor: "#FAFAFA",
          borderColor: "#EFEFEF",
        }}
      >
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <h1
            className="text-xl font-light tracking-tight"
            style={{ color: "#1A1A1A" }}
          >
            {userProfile.name}
          </h1>

          <div className="flex gap-8 text-sm">
            <a
              href="#projects"
              className="hover:opacity-60 transition-opacity"
              style={{ color: "#1A1A1A" }}
            >
              Projets
            </a>
            <a
              href="#about"
              className="hover:opacity-60 transition-opacity"
              style={{ color: "#1A1A1A" }}
            >
              À propos
            </a>
            <a
              href="#contact"
              className="hover:opacity-60 transition-opacity"
              style={{ color: "#1A1A1A" }}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32">
        <h2
          className="text-7xl font-light tracking-tighter leading-[1.1] max-w-4xl"
          style={{ color: "#1A1A1A" }}
        >
          {userProfile.bio ||
            "Créateur d'expériences digitales minimalistes et fonctionnelles"}
        </h2>
      </section>

      {/* Projects Section */}
      <section id="projects" className="container mx-auto px-6 py-20">
        <h3
          className="text-sm font-light tracking-widest uppercase mb-16"
          style={{ color: "#808080" }}
        >
          Projets Récents
        </h3>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-3 gap-6 auto-rows-max">
          {displayProjects.map((project, index) => {
            const isLarge = index % 3 === 0;
            const colSpan = isLarge ? "col-span-2" : "col-span-1";
            const rowSpan = isLarge ? "row-span-2" : "row-span-1";

            return (
              <div
                key={project.id}
                className={`${colSpan} ${rowSpan} group cursor-pointer`}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                {/* Image Container */}
                <div
                  className="relative overflow-hidden bg-gray-200 transition-all duration-500"
                  style={{
                    aspectRatio: "4/3",
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hoveredProjectId === project.id
                        ? "grayscale-0"
                        : "grayscale"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23E0E0E0' width='400' height='300'/%3E%3C/svg%3E";
                    }}
                  />

                  {/* Overlay on Hover */}
                  {hoveredProjectId === project.id && (
                    <div className="absolute inset-0 bg-black/10 flex items-end p-6">
                      <div className="text-white">
                        <p className="text-sm opacity-75">{project.category}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4
                        className="text-lg font-light mb-2 group-hover:opacity-70 transition-opacity"
                        style={{ color: "#1A1A1A" }}
                      >
                        {project.title}
                      </h4>
                      <p className="text-xs" style={{ color: "#B0B0B0" }}>
                        {project.year}
                      </p>
                    </div>

                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pt-1"
                      >
                        <ExternalLink
                          size={16}
                          style={{ color: "#1A1A1A" }}
                        />
                      </a>
                    )}
                  </div>

                  {project.description && (
                    <p
                      className="text-sm mt-3 line-clamp-2"
                      style={{ color: "#808080" }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20">
        <h3
          className="text-sm font-light tracking-widest uppercase mb-12"
          style={{ color: "#808080" }}
        >
          À Propos
        </h3>

        <div className="max-w-2xl">
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "#1A1A1A" }}
          >
            Développeur frontend passionné par le minimalisme et l'expérience
            utilisateur. Je crée des interfaces épurées qui mettent le contenu
            en avant et facilitent l'interaction.
          </p>

          {userProfile.socialLinks && (
            <div className="flex gap-6">
              {userProfile.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:opacity-60 transition-opacity"
                  style={{ color: "#1A1A1A" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-6 py-20 border-t" style={{ borderColor: "#EFEFEF" }}>
        <h3
          className="text-sm font-light tracking-widest uppercase mb-12"
          style={{ color: "#808080" }}
        >
          Contact
        </h3>

        <div className="max-w-2xl">
          <p className="text-base mb-6" style={{ color: "#1A1A1A" }}>
            Vous avez un projet en tête ? N'hésitez pas à me contacter.
          </p>

          <a
            href={`mailto:${userProfile.email || "contact@example.com"}`}
            className="inline-block text-base font-light hover:opacity-60 transition-opacity"
            style={{ color: "#1A1A1A" }}
          >
            {userProfile.email || "contact@example.com"}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12"
        style={{
          borderColor: "#EFEFEF",
        }}
      >
        <div className="container mx-auto px-6 text-center text-xs" style={{ color: "#B0B0B0" }}>
          © {new Date().getFullYear()} {userProfile.name}. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
