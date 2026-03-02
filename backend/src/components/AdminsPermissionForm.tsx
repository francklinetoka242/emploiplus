import React, { useEffect, useState } from 'react';

type Admin = {
  id: string;
  email: string;
  role: string;
  perm_jobs?: boolean;
  perm_trainings?: boolean;
  perm_services?: boolean;
  perm_faq?: boolean;
  perm_users?: boolean;
};

export default function AdminsPermissionForm({ adminId }: { adminId: string }) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admins/${adminId}`);
      const body = await res.json();
      setAdmin(body.admin);
    })();
  }, [adminId]);

  async function save() {
    if (!admin) return;
    await fetch(`/api/admins/${admin.id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        perm_jobs: admin.perm_jobs,
        perm_trainings: admin.perm_trainings,
        perm_services: admin.perm_services,
        perm_faq: admin.perm_faq,
        perm_users: admin.perm_users,
      }),
    });
    alert('Permissions mises à jour');
  }

  if (!admin) return <div>Chargement admin...</div>;

  return (
    <div>
      <h3>Modifier permissions: {admin.email}</h3>
      <div>
        <label><input type="checkbox" checked={!!admin.perm_jobs} onChange={(e) => setAdmin({ ...admin, perm_jobs: e.target.checked })} /> Jobs</label>
      </div>
      <div>
        <label><input type="checkbox" checked={!!admin.perm_trainings} onChange={(e) => setAdmin({ ...admin, perm_trainings: e.target.checked })} /> Trainings</label>
      </div>
      <div>
        <label><input type="checkbox" checked={!!admin.perm_services} onChange={(e) => setAdmin({ ...admin, perm_services: e.target.checked })} /> Services</label>
      </div>
      <div>
        <label><input type="checkbox" checked={!!admin.perm_faq} onChange={(e) => setAdmin({ ...admin, perm_faq: e.target.checked })} /> FAQ</label>
      </div>
      <div>
        <label><input type="checkbox" checked={!!admin.perm_users} onChange={(e) => setAdmin({ ...admin, perm_users: e.target.checked })} /> Utilisateurs</label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={save}>Enregistrer</button>
      </div>
    </div>
  );
}
