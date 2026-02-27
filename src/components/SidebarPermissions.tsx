import React from 'react';

type Perms = {
  perm_jobs?: boolean;
  perm_trainings?: boolean;
  perm_services?: boolean;
  perm_faq?: boolean;
  perm_users?: boolean;
};

export default function SidebarPermissions({ perms }: { perms: Perms }) {
  const items: { key: keyof Perms; label: string; path: string }[] = [
    { key: 'perm_jobs', label: 'Jobs', path: '/admin/jobs' },
    { key: 'perm_trainings', label: 'Trainings', path: '/admin/trainings' },
    { key: 'perm_services', label: 'Services', path: '/admin/services' },
    { key: 'perm_faq', label: 'FAQ', path: '/admin/faq' },
    { key: 'perm_users', label: 'Utilisateurs', path: '/admin/users' },
    { key: 'perm_editoriale', label: 'Gestion Éditoriale', path: '/admin/editorial' },
  ];

  return (
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((it) => {
          const allowed = !!perms[it.key];
          return (
            <li key={it.key} style={{ marginBottom: 8 }}>
              {allowed ? (
                <a href={it.path}>{it.label}</a>
              ) : (
                <span style={{ color: '#999', display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8 }}>🔒</span>
                  {it.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
