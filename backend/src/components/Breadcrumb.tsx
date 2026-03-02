import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb({ items }: { items?: { label: string; to?: string }[] }) {
  const location = useLocation();
  
  // Default breadcrumb items based on current path if not provided
  const defaultItems = [
    { label: 'Accueil', to: '/' },
  ];
  
  // Parse path for default breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  pathSegments.forEach((segment, idx) => {
    const path = '/' + pathSegments.slice(0, idx + 1).join('/');
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    defaultItems.push({ label, to: path });
  });
  
  const displayItems = items || defaultItems;

  return (
    <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {displayItems.map((it, idx) => (
          <li key={idx} className="flex items-center">
            {it.to ? (
              <Link to={it.to} className="hover:underline text-sm">
                {it.label}
              </Link>
            ) : (
              <span className="text-sm">{it.label}</span>
            )}
            {idx < displayItems.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
