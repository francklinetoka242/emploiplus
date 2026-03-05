// src/pages/admin/register/super-admin/page.tsx
import RegisterForm from "../components/RegisterForm";

export default function SuperAdminRegister() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Créer un Super Administrateur
      </h1>
      <p className="text-center mb-4 text-sm text-gray-600">
        Cette page est utilisée uniquement pour la première création de Super Admin.
        Pour tous les autres niveaux (content_admin, admin_users), utilisez le tableau
        de bord du Super Admin après connexion.
      </p>
      <RegisterForm role="super_admin" title="Super Admin" color="text-red-600" />
    </div>
  );
}