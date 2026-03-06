export default function PortfolioMinialistePreview() {
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: "#FAFAFA", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Navigation Preview */}
      <div
        className="border-b px-8 py-6"
        style={{ borderColor: "#EFEFEF" }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-lg font-light" style={{ color: "#1A1A1A" }}>
            John Doe
          </div>
          <div className="flex gap-8 text-sm">
            <span style={{ color: "#1A1A1A" }}>Projets</span>
            <span style={{ color: "#1A1A1A" }}>À propos</span>
            <span style={{ color: "#1A1A1A" }}>Contact</span>
          </div>
        </div>
      </div>

      {/* Hero Section Preview */}
      <div className="px-8 py-20 max-w-7xl mx-auto">
        <div className="text-5xl font-light leading-tight" style={{ color: "#1A1A1A", lettersSpacing: "-0.025em" }}>
          Créateur d'expériences<br />
          digitales minimalistes<br />
          et fonctionnelles
        </div>
      </div>

      {/* Projects Grid Preview */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <div className="text-xs font-light tracking-widest uppercase mb-8" style={{ color: "#808080" }}>
          Projets Récents
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {/* Large Project */}
          <div style={{ gridColumn: "span 2", gridRow: "span 2" }}>
            <div
              style={{
                aspectRatio: "4/3",
                backgroundColor: "#E0E0E0",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                filter: "grayscale(100%)",
              }}
            >
              <span style={{ color: "#999" }}>Image Projet</span>
            </div>
            <div>
              <div style={{ fontSize: "1.125rem", fontWeight: "300", color: "#1A1A1A", marginBottom: "0.5rem" }}>
                Refonte E-commerce
              </div>
              <div style={{ fontSize: "0.75rem", color: "#B0B0B0" }}>2024</div>
            </div>
          </div>

          {/* Small Project 1 */}
          <div>
            <div
              style={{
                aspectRatio: "4/3",
                backgroundColor: "#E0E0E0",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                filter: "grayscale(100%)",
              }}
            >
              <span style={{ color: "#999", fontSize: "0.875rem" }}>Projet</span>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "300", color: "#1A1A1A", marginBottom: "0.5rem" }}>
                Application Mobile
              </div>
              <div style={{ fontSize: "0.75rem", color: "#B0B0B0" }}>2024</div>
            </div>
          </div>

          {/* Small Project 2 */}
          <div>
            <div
              style={{
                aspectRatio: "4/3",
                backgroundColor: "#E0E0E0",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                filter: "grayscale(100%)",
              }}
            >
              <span style={{ color: "#999", fontSize: "0.875rem" }}>Projet</span>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "300", color: "#1A1A1A", marginBottom: "0.5rem" }}>
                Identité Visuelle
              </div>
              <div style={{ fontSize: "0.75rem", color: "#B0B0B0" }}>2023</div>
            </div>
          </div>

          {/* Small Project 3 */}
          <div>
            <div
              style={{
                aspectRatio: "4/3",
                backgroundColor: "#E0E0E0",
                borderRadius: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                filter: "grayscale(100%)",
              }}
            >
              <span style={{ color: "#999", fontSize: "0.875rem" }}>Projet</span>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "300", color: "#1A1A1A", marginBottom: "0.5rem" }}>
                Plateforme SaaS
              </div>
              <div style={{ fontSize: "0.75rem", color: "#B0B0B0" }}>2023</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section Preview */}
      <div className="px-8 py-12 max-w-2xl mx-auto" style={{ borderTop: "1px solid #EFEFEF" }}>
        <div className="text-xs font-light tracking-widest uppercase mb-8" style={{ color: "#808080" }}>
          À Propos
        </div>
        <div style={{ fontSize: "0.875rem", color: "#808080", lineHeight: "1.75" }}>
          Développeur frontend passionné par le minimalisme et l'expérience utilisateur. Je crée des interfaces épurées qui mettent le contenu en avant.
        </div>
      </div>
    </div>
  );
}
